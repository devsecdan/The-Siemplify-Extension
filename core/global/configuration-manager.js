"use strict";

var ConfigurationManager = (function () {

    var _hosts = [];

    /**
     * Get array of configured hosts
     */
    var getHosts = async function() {
        let storage = await browser.storage.local.get();
        let hosts = [];
        for (let [key, value] of Object.entries(storage)) {
            let host = key.split("_")[0];
            let module = key.split("_")[1];
            if (module == "general" && host != "global" && !hosts.includes(host)) {
                hosts.push(host);
            }
        }
        return hosts;
    }

    getHosts().then((hosts) => _hosts = hosts);

    /**
     * Add new host to hosts array
     * @param {*} host 
     */
    var addHost = async function(host, version) {
        let hosts = await getHosts();
        if (hosts.includes(host)) {
            return false;
        }
        else {
            try {
                await browser.storage.local.set({ [`${host}_general`]: {"siemplifyVersion": version} });
                return true;
            }
            catch(e) {
                return false;
            }
        }
    }

    /**
     * Removes a host from the hosts array
     * @param {*} host 
     */
    var removeHost = async function(host) {
        let storage = await browser.storage.local.get();
        for (let key of Object.keys(storage)) {
            if (key.startsWith(`${host}_`)) {
                browser.storage.local.remove(key);
            }
        }
    }

    /**
     * Equivalent to getHostConfig("global", module)
     * @param {*} module Specific global config entry to get.
     */
    var getGlobalConfig = async function(module, version) {
        return await getHostConfig(`global_${version}`, module);
    }

    /**
     * Equivalent to setHostConfig("global", module, value)
     * @param {*} key key inside global configuration to set
     * @param {*} version
     * @param {*} value
     */
    var setGlobalConfig = async function(module, version, value) {
        return await setHostConfig(`global_${version}`, module, value);
    }

    /**
     * Return configuration for given host and key/module
     * @param {*} host
     * @param {*} key key/module to get configuration for
     */
    var getHostConfig = async function(host, module) {
        let fullKey = `${host}_${module}`;
        let storage = await browser.storage.local.get(fullKey);
        let hostConfig = storage[fullKey];
        if (hostConfig) {
            return hostConfig;
        }
        else {
            return {};
        }
    }

    /**
     * Set configuration for given host and key/module
     * @param {*} host
     * @param {*} key
     * @param {*} value 
     */
    var setHostConfig = async function(host, module, value) {
        try {
            await browser.storage.local.set({[`${host}_${module}`]: value});
            console.log(`${host}_${module}`, value);
            return true;
        }
        catch(e) {
            return false;
        }
    }

    /**
     * Removes the given host module configuration
     * @param {*} host 
     * @param {*} module 
     */
    var removeHostConfig = async function(host, module) {
        try {
            await browser.storage.local.remove(`${host}_${module}`);
            return true;
        }
        catch(e) {
            return false;
        }
    }

    /**
     * Get the combined host and global config, with host config taking precedence over global config
     * @param {*} host 
     * @param {*} version
     * @param {*} module 
     */
    var getFinalConfig = async function(host, version, module) {
        let globalConfig = {};
        let versionParts = version.split(".");
        while (versionParts.length > 0) {
            let versionLevel = versionParts.join('.');
            let globalConfigAtVersionLevel = await getGlobalConfig(module, versionLevel);
            globalConfig = Object.assign(globalConfigAtVersionLevel, globalConfig);
            versionParts.pop();
        }
        let hostConfig = await getHostConfig(host, module);
        return Object.assign(globalConfig, hostConfig);
    }

    /**
     * Host change listener
     */
    var hostsChangedListeners = new Set();
    var onHostsChanged = {
        /**
         * 
         * @param {*} callback Gets called with an object containing either obj.added = [addedHosts] or obj.removed = [removedHosts]
         */
        addListener: function(callback) {
            hostsChangedListeners.add(callback);
        },
        removeListener: function(callback) {
            hostsChangedListeners.delete(callback);
        },
        hasListener: function(callback) {
            hostsChangedListeners.has(callback);
        }
    };
    
    /**
     * Config change listener
     */
    var configChangedListeners = new Map();
    var configChanged = async function(changes, area) {
        let currentHosts = await getHosts();
        let addedHosts = currentHosts.filter((host) => !_hosts.includes(host));
        let removedHosts = _hosts.filter((host) => !currentHosts.includes(host));
        if (addedHosts.length > 0) {
            hostsChangedListeners.forEach(listener => listener({added: addedHosts}));
        }
        if (removedHosts.length > 0) {
            hostsChangedListeners.forEach(listener => listener({added: removedHosts}));
        }
        _hosts = currentHosts;
        for (let key in changes) {
            let listeners = configChangedListeners.get(key);
            if (listeners) {
                for (let listener of listeners) {
                    listener(changes[key]);
                }
            }
        }
    }
    browser.storage.onChanged.addListener(configChanged);

    var onGlobalConfigChanged = {
        addListener: function(module, callback) {
            onHostConfigChanged.addListener("global", module, callback);
        },
        removeListener: function(module, callback) {
            onHostConfigChanged.removeListener("global", module, callback);
        },
        hasListener: function(module, callback) {
            return onHostConfigChanged.hasListener("global", module, callback);
        }
    }

    var onHostConfigChanged = {
        addListener: function(host, module, callback) {
            let fullKey = `${host}_${module}`;
            let listeners = configChangedListeners.get(fullKey);
            if (!listeners) {
                listeners = new Set();
                configChangedListeners.set(fullKey, listeners);
            }
            listeners.add(callback);
        },
        removeListener: function(host, module, callback) {
            let fullKey = `${host}_${module}`;
            let listeners = configChangedListeners.get(fullKey);
            if (listeners) {
                listeners.delete(callback);
            }
        },
        hasListener: function(host, module, callback) {
            let fullKey = `${host}_${module}`;
            let listeners = configChangedListeners.get(fullKey);
            if (listeners && listeners.has(callback)) {
                return true;
            }
            else {
                return false;
            }
        }
    }

    return {
        getHosts: getHosts,
        addHost: addHost,
        removeHost: removeHost,
        getGlobalConfig: getGlobalConfig,
        setGlobalConfig: setGlobalConfig,
        getHostConfig: getHostConfig,
        setHostConfig: setHostConfig,
        removeHostConfig: removeHostConfig,
        getFinalConfig: getFinalConfig,
        onHostsChanged: onHostsChanged,
        onGlobalConfigChanged: onGlobalConfigChanged,
        onHostConfigChanged: onHostConfigChanged
    }
})();
