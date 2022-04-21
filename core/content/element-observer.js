var ElementObserver = (function() {
    
    var _observer;
    var _queries = [];
    var _callbacks = [];

    /**
     * Observe for element additions, removals, and reparentings
     * @param {String | Array<String>} queries [Array of] element-level queries matching the desired elements
     * @param {Function} callback Callback function which will be called on addition, removal, or reparenting of elements matched by the queries
     */
    var observe = function(queries, callback) {
        if (Array.isArray(queries)) {
            queries.forEach(query => {
                addObserver(query, callback);
            })
        }
        else {
            addObserver(queries, callback);
        }
        scheduleStart();
    }

    var addObserver = function(query, callback) {
        if (!(_queries.includes(query) && _callbacks.includes(callback))) {
            _queries.push({ element: query });
            _callbacks.push(callback);
        }
    }

    /**
     * Stop observing for element changes
     * @param {*} callback The original callback which was passed to `observe`. The associated query will also be removed
     */
    var stop = function(callback) {
        let i = _callbacks.length;
        while (i--) {
            if (_callbacks[i] === callback) {
                _callbacks.splice(i,1);
                _queries.splice(i,1);
            }
        }
        scheduleStart();
    }

    var startScheduled;

    var scheduleStart = function() {
        if (performingCallbacks) {
            startScheduled = true;
        }
        else {
            startObserver();
        }
    }

    var startObserver = function() {
        startScheduled = false;
        try {
            if (_observer && _observer.connected) {
                let summaries = _observer.disconnect();
                if (summaries) handleMutations(summaries);
            }
            if (_queries.length !== 0) {
                _observer = new MutationSummary({
                    callback: handleMutations,
                    queries: _queries
                });
            }
        } catch(e) {
            console.error(e);
        }
    }

    var performingCallbacks;

    var handleMutations = function(summaries) {
        performingCallbacks = true;
        let i = summaries.length;
        while(i--) {
            try {
                _callbacks[i](summaries[i]);
            } catch(e) {
                console.error(e);
            }
        }
        performingCallbacks = false;
        if (startScheduled) {
            startObserver();
        }
    }

    return {
        observe: observe,
        stop: stop
    }

})();