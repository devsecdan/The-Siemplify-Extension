"use strict";

import MessagingManager from "/core/background/messaging-manager.js"

var ModuleManager = (function () {

    // Map of all modules (uninitialised), mapped by version
    var _modules = new Map();
    // Map of all modules (initialised), mapped by host
    var _hostModules = new Map();

    /**
     * Initialisation of hostmodules with configured hosts
     */
    var initialiseHosts = async function() {
        _hostModules.clear();
        let hosts = await ConfigurationManager.getHosts();
        for (let host of hosts) {
            addHost(host);
        }
    }
    initialiseHosts();

    /**
     * Create host modules from given moduel class and add to hostmodule list
     * @param {*} module 
     */
    var initialiseHostModule = async function(Module) {
        for (let [host, modules] of _hostModules.entries()) {
            let hostSiemplifyVersion = await getHostSiemplifyVersion(host);
            if (hostSiemplifyVersion == Module.metadata.siemplifyVersion) {
                modules.push(new Module(host));
            }
        }
    }

    /**
     * Add a new host and create its host modules
     * @param {*} host 
     */
    var addHost = async function(host) {
        let modules = [];
        let hostSiemplifyVersion = await getHostSiemplifyVersion(host);
        for (let Module of getVersionAppropriateModules(hostSiemplifyVersion).values()) {
            modules.push(new Module(host));
        }
        _hostModules.set(host, modules);
        // Search open tabs for new host and inject modules
        let tabs = await browser.tabs.query({url: `https://${host}/*`});
        tabs.forEach(tab => executeModules(tab.id, host));
    }

    /**
     * Remove a host and disable its host modules (actual removal will require host pages to be refreshed)
     * @param {*} host 
     */
    var removeHost = function(host) {
        let modules = _hostModules.get(host);
        if (modules) {
            for (let module of modules) {
                module.disable();
            }
        }
        modules.delete(host);
    }

    /**
     * Get the version of Siemplify registered for given host
     * @param {*} host 
     */
    var getHostSiemplifyVersion = async function(host) {
        let generalHostConfig = await ConfigurationManager.getHostConfig(host, "general");
        let hostSiemplifyVersion = generalHostConfig.siemplifyVersion;
        if (!hostSiemplifyVersion) {
            hostSiemplifyVersion = getAllSiemplifyVersions()[0];
            console.log(`Siemplify version not found in config for ${host}. Using ${hostSiemplifyVersion}`)
        }
        return hostSiemplifyVersion;
    }

    /**
     * Monitor host changes
     * @param {*} change 
     */
    var updateHostModules = async function(change) {
        if (change.added) {
            for (let added of change.added) {
                addHost(added);
            }
        }
        if (change.removed) {
            for (let removed of change.removed) {
                removeHost(removed);
            }
        }
        
    }
    ConfigurationManager.onHostsChanged.addListener(updateHostModules);

    /**
     * Register the name and content scripts of a module
     * @param {*} Module
     */
    var registerModule = async function(Module) {
        let versionModules = _modules.get(Module.metadata.siemplifyVersion)
        if (!versionModules) {
            versionModules = new Map();
            _modules.set(Module.metadata.siemplifyVersion, versionModules);
        }
        if (versionModules.has(Module.metadata.name)) {
            console.log(`A module with this name is already registered for version ${Module.metadata.siemplifyVersion}: ${Module.metadata.name}`);
            return false;
        }
        versionModules.set(Module.metadata.name, Module);

        setModuleDefaultConfiguration(Module);
        await initialiseHostModule(Module);

        return true;
    }

    /**
     * Get a list of all Siemplify versions with supporting modules
     */
    var getAllSiemplifyVersions = function() {
        return Array.from(_modules.keys());
    }

    /**
     * Get a list of all modules supporting given Siemplify version
     * @param {*} siemplifyVersion 
     */
    var getSpecificVersionModules = function(siemplifyVersion) {
        return _modules.get(siemplifyVersion) || new Map();
    }

    var getVersionAppropriateModules = function(siemplifyVersion) {
        let versionCandidates = [];
        for (let version of _modules.keys()) {
            if (siemplifyVersion.startsWith(version)) {
                versionCandidates.push(version);
            }
        }

        versionCandidates.sort((a, b) => { return a.length - b.length });

        let versionModules = [];

        for (let versionCandidate of versionCandidates) {
            versionModules.push(..._modules.get(versionCandidate));
        }

        return new Map(versionModules);
    }

    /**
     * Reset global configuration to default module config
     */
    var resetToDefaultConfiguration = async function() {
        for (let version of getAllSiemplifyVersions()) {
            for (let Module of getSpecificVersionModules(version).values()) {
                let defaultConfig = Object.assign({}, Module.metadata.defaultConfig);
                defaultConfig.enabled = true;
                await ConfigurationManager.setGlobalConfig(Module.metadata.name, Module.metadata.siemplifyVersion, defaultConfig);
            }
        }
        return Promise.resolve(true);
    }

    /**
     * Listen for messages to reset to default configuration
     */
    MessagingManager.addGlobalListener("resetToDefaultConfig", (request) => {
        if (request?.resetToDefaultConfig) {
            resetToDefaultConfiguration();
        }
    });

    /**
     * Initialise browser storage with default values if required.
     * @param {*} module 
     */
    var setModuleDefaultConfiguration = async function(Module) {
        let saveDefaultConfig = false;
        let moduleName = Module.metadata.name;
        let moduleSiemplifyVersion = Module.metadata.siemplifyVersion;
        let moduleStorage = await ConfigurationManager.getGlobalConfig(moduleName, moduleSiemplifyVersion);
        let defaultConfig = Module.metadata.defaultConfig;
        // Set default config
        if (Object.keys(moduleStorage).length === 0 && defaultConfig) {
            moduleStorage = defaultConfig;
            saveDefaultConfig = true;
        }
        else {
            for (let configOption in defaultConfig) {
                if (typeof moduleStorage[configOption] === "undefined") {
                    moduleStorage[configOption] = defaultConfig[configOption];
                    saveDefaultConfig = true
                }
            }
        }
        // Enable module by default
        if (typeof moduleStorage.enabled === "undefined") {
            moduleStorage.enabled = true;
            saveDefaultConfig = true
            console.log(moduleStorage.enabled);
        }
        // Save config
        if (saveDefaultConfig) {
            await ConfigurationManager.setGlobalConfig(moduleName, moduleSiemplifyVersion, moduleStorage);
            console.log(`Set defaults for ${moduleName}:${moduleSiemplifyVersion}`, moduleStorage);
        }
    }

    // Listen for requests for module metadata information
    MessagingManager.addGlobalListener("getModuleMetadata", (request) => {
        if (request?.getModuleMetadata && request?.version) {
            let modules = request?.specific ? getSpecificVersionModules(request.version).values()
                                            : getVersionAppropriateModules(request.version).values();
            let metadata = [];
            for (let module of modules) {
                metadata.push(module.metadata);
            }
            return Promise.resolve(metadata);
        }
        else {
            return Promise.resolve([]);
        }
    });

    // Listen for requests for supported Siemplify versions
    MessagingManager.addGlobalListener("getSiemplifyVersions", () => {
        return Promise.resolve(getAllSiemplifyVersions());
    });

    // Listen for URL changes and execute modules if needed
    browser.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
        if (tab.url && changeInfo.status === "complete") {
            let hasPermission = await browser.permissions.contains({
                origins: [tab.url]
            }).catch(() => {});
            if (hasPermission) {
                executeModules(tabId, _extractDomain(tab.url));
            }
        }
    });

    var _extractDomain = function(url) {
        return url.replace("http://","").replace("https://","").split(/[/?#]/)[0];
    }

    var injecting = new Set();
    /**
     * Execute modules in provided tab ID if not already running
     * @param {*} tabId 
     */
    var executeModules = function(tabId, host) {
        // Check if scripts are currently being injected
        if (injecting.has(tabId)) {
            return;
        }
        // Check if modules are already running
        MessagingManager.sendMessage(tabId, "baseModulesRunning", {basemodules: "running"})
        .catch(async () => { // Execute scripts if no response received.
            injecting.add(tabId);
            try {
                await browser.tabs.executeScript(tabId, {file: "/lib/browser-polyfill.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/global/siemplify-endpoints.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/global/configuration-manager.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/messaging-manager.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/base-module.js"});
                await browser.tabs.executeScript(tabId, {file: "/lib/mousetraps.js"});
                await browser.tabs.executeScript(tabId, {file: "/lib/mousetraps-global-bind.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/siemplify-api.js"});
                await browser.tabs.executeScript(tabId, {file: "/lib/mutation-summary.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/element-observer.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/persistent-observer.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/case-list-helper.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/event-helper.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/modal-helper.js"});
            }
            catch(error) {
                console.log(error.message)
            }

            let siemplifyVersion = await getHostSiemplifyVersion(host);
            for (let [name, module] of getVersionAppropriateModules(siemplifyVersion)) {
                if (module.metadata.contentScripts) {
                    MessagingManager.sendMessage(tabId, name, {modulename: name})
                    .then((response) => {
                        if (!response) {
                            injectModuleScripts(module, tabId);
                        }
                    })
                    .catch(() => { // Execute scripts if no response received.
                        injectModuleScripts(module, siemplifyVersion, tabId);
                    });
                }
            }
            injecting.delete(tabId);
        });
    }

    function injectModuleScripts(module, tabId) {
        for (let contentScript of module.metadata.contentScripts) {
            browser.tabs.executeScript(tabId, { file: `/modules/${module.metadata.siemplifyVersion}/${contentScript}` })
                .catch((error) => console.log(error.message));
        }
    }
    /*
    // Send message to content scripts whenever URL is changed
    browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.url) {
            MessagingManager.sendMessage(tabId, "newUrl", {newUrl: changeInfo.url})
            .catch(() => {});
        }
    });
    */
    return {
        registerModule: registerModule
    }

})();

export default ModuleManager;