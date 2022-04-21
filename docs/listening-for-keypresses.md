# Listening for Keypresses
A module may, as part of it functionality, need to listen for keypresses made by the user.

TSE uses a modified version of the [Mousetrap](craig.is/killing/mice "Mousetrap") library, called [Mousetraps](https://github.com/devsecdan/mousetraps "Mousetraps"), for handling keybind registration and listening.

Full documentation for Mousetrap can be found [here](https://craig.is/killing/mice "here").

## Binding keys
Mousetraps lets you assign a callback function to a keybind using the `bind()` method. The first argument is a string representation of the keybind that the callback function should be attached to. See the Mousetrap documentation for supported keys.

```javascript
Mousetraps.bind("ctrl+k", myFunction);
```

In general, keybinds should be configurable, and thus set up similarly to the below example:
```javascript
var enable = function () {
	initialiseKeybinds(this.config);
};

var initialiseKeybinds = function(config) {
	Mousetraps.bind(config.selectOverviewTabKeybind, selectOverviewTab);
}
```

Check the Configuring Keybinds section for details on how to let the user set their own keybinds.

### Global keybinds
Keybinds assigned using the `bind` method deactivated while the user has a text input field selected. This is preferred so that keybinds do not interfere with the user's ability to type.

However, some keybinds should be active even when text fields are selected. This can be achieved with the global keybinds, using the `bindGlobal` method. It takes the same parameters as `bind`, but registers the keybind as global, instead.

## Unbinding keys
Keybinds can be unbound again using the `unbind` and `unbindGlobal` methods. These take the same input as their equivalent bind methods.

## Configuring Keybinds
Users should have the ability to modify keybinds through the config page.

Keybinds are configured as described in the `Creating and Accessing Module Config` doc.