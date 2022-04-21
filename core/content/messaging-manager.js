"use strict"

var MessagingManager = (function () {

    var messageListeners = new Map();
    

    var _handleMessage = function(request, sender) {
        let listeners = messageListeners.get(request.name);
        if (listeners) {
            let callbackResult;
            for (let callback of listeners) {
                callbackResult = callback(request.message, sender)
            }
            return callbackResult;
        }
    }

    browser.runtime.onMessage.addListener(_handleMessage);

    var sendMessage = function(name, message) {
        return browser.runtime.sendMessage({"name": name, "message": message});
    }

    var addListener = function(name, callback) {
        let listeners = messageListeners.get(name);
        if (!listeners) {
            listeners = new Set();
            messageListeners.set(name, listeners);
        }
        listeners.add(callback);
    }

    var removeListener = function(name, callback) {
        let listeners = messageListeners.get(name);
        if (listeners) {
            listeners.delete(callback);
        }
    }

    var hasListener = function(name, callback) {
        let listeners = messageListeners.get(name);
        if (listeners && listeners.has(callback)) {
            return true;
        }
        return false;
    }

    return {
        sendMessage: sendMessage,
        addListener: addListener,
        removeListener: removeListener,
        hasListener: hasListener
    };
    
}());