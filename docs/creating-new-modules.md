# Creating New Modules
Modules provide the features of the extension. Each module functions inndependently of other modules and may support one or more versions of Siemplify

A module consists of at least a background script and one or more content scripts.

## Folder Structure
Modules are located in the modules folder.
Each module has its own folder.

Modules are divided into Siemplify versions and each Siemplify version requires its own set of modules.
As such, the following folder structure is seen for a module MyModule, which supports Siemplify version 5.5.3 and 5.6
```
- modules
	- 5.5.3
		- MyModule
		- OtherModule
		- import-modules.js
	- 5.6
		- MyModule
		- OtherModule
		- import-modules.js
```
## Adding a New Module
To add a new module, create a new folder with your module name in the desired Siemplify version folder. Create background and content scripts according to the descriptions in the Basic Templates below.
Finally, import the module in the corresponding `import-modules.js` file in your Siemplify version folder.

## Adding a new Siemplify version
If there is no folder for the Siemplify version that your module will support, you can add a new folder and `import-modules.js`, similar to the structure above.
Then import your newly created `import-modules.js` in `background.html`.

## Basic Templates
### Background Scripts
The background script initialises the background class module of the module. This class must extend BackgroundModule, as seen below.

Each background module must have a metadata object, providing:
- name - Name of the module
- category - The category/type of the module. This is the section that the module is put under on the config page
- siemplifyVersion - The version of Siemplify that this module supports. This should match the version folder that the module is located in
- description - A short text description of what the module does
- configHtmlFile - [optional] A partial HTML file which will be imported into the config page, used for letting users configure the module. See Creating Module Configuration doc for further details
- defaultConfig - [optional] Default configuration options defined by a JavasCript object containing config key and value pairs
- manualPage - [optional] An HTML page in which you can provide a more detailed description and further details on how to use the module. Modules with this metadata field will get an icon in the config page which users can click to see the manual page. Recommend writing the page in markdown and converting to HTML
- contentScripts - [optional] List of any content scripts that should be injected into supported Siemplify pages

The background class must be registered with the ModuleManager to be used.

```javascript
"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class MyModule extends BackgroundModule {
    
    constructor(host) {
        super(host, MyModule.metadata.name);
    }
}

MyModule.metadata = {
    name: "My Module",
    category: "Case Management",
    siemplifyVersion: "5.6",
    description: "Provides a new feature",
    configHtmlFile: "My Module/config.part.html",
	defaultConfig: {
        KeyBind1: "a",
        Keybind2: "b"
    },
	manualPage: "My Module/manual.html",
    contentScripts: ["My Module/my-module.js"]
}

ModuleManager.registerModule(MyModule);

export default MyModule;
```
### Content Scripts
The module content scripts must follow a basic structure, and must initialise themselves with the BaseModule, as seen below.

Required methods:
- enable - called whenever the module is enabled, including on browser startup. Do initialisation here
- disable - Called whenever the module has been disabled through the config. Remove what can be removed, disable keybind, remove listeners, etc.
- configChanged - Called when the module's config has changed. Objects with the old and new config will be passed to the function. Re-initialise the module using the new config settings here

Note that the module's config can be accessed through `this.config`  or `<ModuleName>.config` within the content script.

```javascript
"use strict";

var MyModule = (function () {
	
	var enable = function () {
		// Initialise module
		initialiseStuff(this.config)
	};
	
	var disable = function () {
		// Disable module
	};

	var configChanged = function(oldConfig, newConfig) {
		// Re-initialise module with new config
	}
	
	return {
		enable: enable,
		disable: disable,
		configChanged: configChanged
	};
}());

BaseModule.initModule(MyModule1, "My Module");
```