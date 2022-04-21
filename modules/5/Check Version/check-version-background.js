"use strict";

import BackgroundModule from "/core/background/background-module.js";
import ModuleManager from "/core/background/module-manager.js";

class CheckVersion extends BackgroundModule {

    constructor(host) {
        super(host, CheckVersion.metadata.siemplifyVersion, CheckVersion.metadata.name);
    }
}

CheckVersion.metadata = {
    name: "Check Version",
    category: "The Siemplify Extension",
    siemplifyVersion: "5",
    description: "Checks if the most appropriate Siemplify version is selected for each host.",
    configPageElements: [],
    contentScripts: ["Check Version/check-version.js"]
}

ModuleManager.registerModule(CheckVersion);

export default CheckVersion;