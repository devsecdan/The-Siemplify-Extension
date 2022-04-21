"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class CloseCase extends BackgroundModule {
    
    constructor(host) {
        super(host, CloseCase.metadata.siemplifyVersion, CloseCase.metadata.name);
    }
}

CloseCase.metadata = {
    name: "Close Case",
    category: "Case Management",
    siemplifyVersion: "5",
    description: "Customisable shortcuts to open Close Case window with pre-defined Root Cause and Reason.",
    configHtmlFile: "Close Case/config.part.html",
    contentScripts: ["Close Case/close-case.js"]
}

ModuleManager.registerModule(CloseCase);

export default CloseCase;