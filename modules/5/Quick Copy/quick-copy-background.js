"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class QuickCopy extends BackgroundModule {
    
    constructor(host) {
        super(host, QuickCopy.metadata.siemplifyVersion, QuickCopy.metadata.name);
    }
}

QuickCopy.metadata = {
    name: "Quick Copy",
    category: "Functionality",
    siemplifyVersion: "5",
    description: "Simply copy data to clipboard by clicking the data field. Allows copying case ID by clicking case description, copying entity by clicking entity icon, and copying event data field by clicking its value.",
    configPageElements: [],
    contentScripts: ["Quick Copy/quick-copy.js"]
}

ModuleManager.registerModule(QuickCopy);

export default QuickCopy;