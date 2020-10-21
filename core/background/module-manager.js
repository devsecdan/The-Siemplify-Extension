"use strict";

var ModuleManager = (function () {

    var _modulesMetadata = new Map();
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
    var initialiseHostModule = function(Module) {
        for (let [host, modules] of _hostModules.entries()) {
            modules.push(new Module(host));
        }
    }

    /**
     * Add a new host and create its host modules
     * @param {*} host 
     */
    var addHost = async function(host) {
        let modules = [];
            for (let Module of _modulesMetadata.values()) {
                modules.push(new Module(host));
            }
        _hostModules.set(host, modules);
        // Search open tabs for new host and inject modules
        let tabs = await browser.tabs.query({url: `https://${host}/*`});
        tabs.forEach(tab => executeModules(tab.id));
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
    var registerModule = function(Module) {
        if(_modulesMetadata.has(Module.metadata.name)) {
            console.log(`A module with this name is already registered: ${Module.metadata.name}`);
            return false;
        }
        _modulesMetadata.set(Module.metadata.name, Module);

        setModuleDefaultConfiguration(Module);
        initialiseHostModule(Module);

        return true;
    }

    /**
     * Initialise a Module for each configured host
     * @param {*} Module 
     */
    var initialiseHosts = function(Module) {
        for (let [host, modules] of _hostModules) {
            modules.push(new Module(host));
        }
    }

    /**
     * Reset global configuration to default module config
     */
    var resetToDefaultConfiguration = async function() {
        for (let Module of _modulesMetadata.values()) {
            let defaultConfig = Object.assign({}, Module.metadata.defaultConfig);
            defaultConfig.enabled = true;
            await ConfigurationManager.setGlobalConfig(Module.metadata.name, defaultConfig);
        }
        return Promise.resolve(true);
    }

    /**
     * Listen for messages to reset to default configuration
     */
    browser.runtime.onMessage.addListener((request, sender, response) => {
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
        let moduleStorage = await ConfigurationManager.getGlobalConfig(moduleName);
        let defaultConfig = Module.metadata.defaultConfig;
        // Set default config
        if (Object.keys(moduleStorage).length === 0 && defaultConfig) {
            moduleStorage = defaultConfig;
            saveDefaultConfig = true;
        }
        else {
            for (let configOption in defaultConfig) {
                if (!moduleStorage[configOption]) {
                    moduleStorage[configOption] = defaultConfig[configOption];
                    saveDefaultConfig = true
                }
            }
        }
        // Enable module by default
        if (typeof moduleStorage.enabled === "undefined") {
            moduleStorage.enabled = true;
            saveDefaultConfig = true
        }
        // Save config
        if (saveDefaultConfig) {
            await ConfigurationManager.setGlobalConfig(moduleName, moduleStorage);
            console.log(`Set defaults for ${moduleName}`, moduleStorage);
        }
    }

    // Listen for requests for module metadata information
    browser.runtime.onMessage.addListener((request, sender, response) => {
        if (request?.getModuleMetadata) {
            let metadata = [];
            for (let module of _modulesMetadata.values()) {
                metadata.push(module.metadata);
            }
            return Promise.resolve(metadata);
        }
    });

    // Listen for URL changes and execute modules if needed
    browser.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
        if (tab.url && changeInfo.status === "complete") {
            let hasPermission = await browser.permissions.contains({
                origins: [tab.url]
            }).catch(() => {});
            if (hasPermission) {
                executeModules(tabId);
            }
        }
    });

    var injecting = false;
    /**
     * Execute modules in provided tab ID if not already running
     * @param {*} tabId 
     */
    var executeModules = function(tabId) {
        // Check if scripts are currently being injected
        if (injecting) {
            return;
        }
        // Check if modules are already running
        browser.tabs.sendMessage(tabId, {basemodules: "running"})
        .catch(async () => { // Execute scripts if no response received.
            injecting = true;
            try {
                await browser.tabs.executeScript(tabId, {file: "/lib/browser-polyfill.min.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/global/siemplify-endpoints.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/global/configuration-manager.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/base-module.js"});
                await browser.tabs.executeScript(tabId, {file: "/lib/mousetraps.js"});
                await browser.tabs.executeScript(tabId, {file: "/lib/mousetraps-global-bind.js"});
                await browser.tabs.executeScript(tabId, {file: "/core/content/siemplify-api.js"});
                await browser.tabs.executeScript(tabId, {file: "/lib/mutation-summary.js"});
                await browser.tabs.executeScript(tabId, {file: "/dom/element-observer.js"});
                await browser.tabs.executeScript(tabId, {file: "/dom/persistent-observer.js"});
                await browser.tabs.executeScript(tabId, {file: "/helpers/case-list-helper.js"});
                await browser.tabs.executeScript(tabId, {file: "/helpers/event-helper.js"});
            }
            catch(error) {
                console.log(error.message)
            }

            for (let [name, module] of _modulesMetadata) {
                if (module.metadata.contentScripts) {
                    browser.tabs.sendMessage(tabId, {modulename: name})
                    .then((response) => {
                        if (!response) {
                            injectModuleScripts(module, tabId);
                        }
                    })
                    .catch(() => { // Execute scripts if no response received.
                        injectModuleScripts(module, tabId);
                    });
                }
            }
            injecting = false;
        });
    }

    function injectModuleScripts(module, tabId) {
        for (let contentScript of module.metadata.contentScripts) {
            browser.tabs.executeScript(tabId, { file: `/modules/${contentScript}` })
                .catch((error) => console.log(error.message));
        }
    }

    // Send message to content scripts whenever URL is changed
    browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (changeInfo.url) {
            browser.tabs.sendMessage(tabId, {newUrl: changeInfo.url})
            .catch(() => {});
        }
    });

    return {
        registerModule: registerModule
    }

})();
