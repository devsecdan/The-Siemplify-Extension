"use strict"

class MessagingManager {
    constructor() {
        this.hostListeners = new Map();
        this.globalListeners = new Map();
        browser.runtime.onMessage.addListener((request, sender, response) => this._handleMessage.call(this, request, sender, response));
    }

    _handleMessage(request, sender, response) {
        // Check global message listeners
        let listeners = this.globalListeners.get(request.name);
        if (listeners) {
            let callbackResult;
            for (let callback of listeners) {
                callbackResult = callback(request.message, sender)
            }
            return callbackResult;
        }

        // Check host listeners
        let host = this._extractDomain(sender.tab.url)
        let nameListeners = this.hostListeners.get(host);
        listeners = nameListeners.get(request.name);
        if (listeners) {
            let callbackResult;
            for (let callback of listeners) {
                callbackResult = callback(request.message, sender)
            }
            return callbackResult;
        }
        else {
            console.log(`No recipient found for message: ${request.toString()}`)
        }
    }

    sendMessage(tabId, name, message) {
        return browser.tabs.sendMessage(tabId, {"name": name, "message": message});
    }

    _extractDomain(url) {
        return url.replace("http://","").replace("https://","").split(/[/?#]/)[0];
    }

    addListener(host, name, callback) {
        let nameListeners = this.hostListeners.get(host);
        if (!nameListeners) {
            nameListeners = new Map();
            this.hostListeners.set(host, nameListeners);
        }
        let listeners = nameListeners.get(name);
        if (!listeners) {
            listeners = new Set();
            nameListeners.set(name, listeners);
        }
        listeners.add(callback);
    }

    removeListener(host, name, callback) {
        let nameListeners = this.hostListeners.get(host);
        if (nameListeners) {
            let listeners = nameListeners.get(name);
            if (listeners) {
                listeners.delete(callback);
            }
        }
    }

    hasListener(host, name, callback) {
        let nameListeners = this.hostListeners.get(host);
        if (nameListeners) {
            let listeners = nameListeners.get(name);
            if (listeners && listeners.has(callback)) {
                return true;
            }
        }
        return false;
    }

    addGlobalListener(name, callback) {
        let listeners = this.globalListeners.get(name);
        if (!listeners) {
            listeners = new Set();
            this.globalListeners.set(name, listeners);
        }
        listeners.add(callback);
    }

    removeGlobalListener(name, callback) {
        let listeners = this.globalListeners.get(name);
        if (listeners) {
            listeners.delete(callback);
        }
    }

    hasGlobalListener(name, callback) {
        let listeners = this.globalListeners.get(name);
        if (listeners && listeners.has(callback)) {
            return true;
        }
        return false;
    }
}

export default new MessagingManager();