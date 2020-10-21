/**
 * adds a bindGlobal method to Mousetraps that allows you to
 * bind specific keyboard shortcuts that will still work
 * inside a text input field
 *
 * usage:
 * Mousetraps.bindGlobal('ctrl+s', _saveChanges);
 * 
 * Multi keybind support by Daniel Brand
 */
/* global Mousetraps:true */
(function(Mousetraps) {
    var _globalCallbacks = {};
    var _originalStopCallback = Mousetraps.prototype.stopCallback;

    Mousetraps.prototype.stopCallback = function(e, element, combo, sequence, callback) {
        var self = this;

        if (self.paused) {
            return true;
        }

        let _callbacks = _globalCallbacks[combo] || _globalCallbacks[sequence] || [];
        if (_callbacks.includes(callback)) {
            return false;
        }

        return _originalStopCallback.call(self, e, element, combo, callback);
    };

    Mousetraps.prototype.bindGlobal = function(keys, callback, action) {
        var self = this;
        self.bind(keys, callback, action);

        
        let callbacks;
        if (keys instanceof Array) {
            for (var i = 0; i < keys.length; i++) {
                callbacks = _globalCallbacks[keys[i]];
                callbacks = callbacks || [];
                callbacks.push(callback);
                _globalCallbacks[keys[i]] = callbacks;
            }
        }
        else {
            callbacks = _globalCallbacks[keys];
            callbacks = callbacks || [];
            callbacks.push(callback);
            _globalCallbacks[keys] = callbacks;
        }
    };
	
	Mousetraps.prototype.unbindGlobal = function(keys, callback, action) {
		var self = this;
		self.unbind(keys, callback, action);

		if (keys instanceof Array) {
			for (var i = 0; i < keys.length; i++) {
				_globalCallbacks[keys[i]] = false;
			}
			return;
		}

		_globalCallbacks[keys] = false;
	};

    Mousetraps.init();
}) (Mousetraps);
