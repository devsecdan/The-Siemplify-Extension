"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class AutoSelectNextCase extends BackgroundModule {
    
    constructor(host) {
        super(host, AutoSelectNextCase.metadata.siemplifyVersion, AutoSelectNextCase.metadata.name);
    }    
}

AutoSelectNextCase.metadata = {
    name: "Auto-Select Next Case",
    category: "Automation",
    siemplifyVersion: "5",
    description: "Automatically open next case after closing a case.",
    contentScripts: ["Auto-Select Next Case/auto-select-next-case.js"]
}

ModuleManager.registerModule(AutoSelectNextCase);

export default AutoSelectNextCase;