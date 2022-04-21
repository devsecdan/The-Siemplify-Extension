var PersistentObserver = (function() {
    /**
     * A PersistentObserver constantly observes for elements matching attachQueries, and attaches said queries to matched elements.
     */
    class PersistentObserver {

        /**
         * @param {String | Array<String>} attachQueries [Array of] element-level queries for elements on which to attach the queries in attachQueries
         * @param {Object} attachedQueries Query object to be attached to elements observed by attachQueries
         * @param {Function} attachedcallback Callback function called by attachedQueries
         * @param {*} attachCallback Callback function called when attachedQueries are initially attached to element observed by attachQueries
         */
        constructor(attachQueries, attachedQueries, attachedcallback, attachCallback = () => {}) {
            this.attachedQueries = attachedQueries;
            this.attachedcallback = attachedcallback;
            this.observers = new Map();
            this.attachCallback = attachCallback;
            ElementObserver.observe(attachQueries, this._attachObserverHandler.bind(this));
            
            // Attach queries if queried element already exist
            if (Array.isArray(attachQueries)) {
                for (let attachQuery of attachQueries) {
                    let elements = document.querySelectorAll(attachQuery);
                    for (let element of elements) {
                        this._addObserver(element);
                    }
                    this.attachCallback({added: elements});
                }
            }
            else {
                let elements = document.querySelectorAll(attachQueries);
                for (let element of elements) {
                    this._addObserver(element);
                }
                this.attachCallback({added: elements});
            }
            
        }
    
        _attachObserverHandler(summary) {
            summary.added.forEach(element => {
                this._addObserver(element);
            });
    
            summary.removed.forEach(element => {
                this._removeObserver(element);
            });
    
            this.attachCallback(summary);
        }
    
        _addObserver(element) {
            this.observers.set(element, new MutationSummary({
                callback: this.attachedcallback,
                rootNode: element,
                queries: [this.attachedQueries]
            }));
        }
    
        _removeObserver(element) {
            let observer = this.observers.get(element);
            try {
                observer.disconnect();
            } catch(e) {}
            this.observers.delete(element);   
        }
    
        /**
         * Stop observing
         */
        disconnect() {
            ElementObserver.stop(this._attachObserverHandler);
            this.observers.forEach((element, observer) => {
                try {
                    observer.disconnect();
                } catch(e) {}
                this.observers.delete(element);   
            });
        }
    }
    return PersistentObserver;
})();