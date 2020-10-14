"use strict";

class QuickCopy extends BackgroundModule {
    
    static metadata = {
        name: "Quick Copy",
        category: "Functionality",
        description: "Simply copy data to clipboard by clicking the data field. Allows copying case ID by clicking case description, copying entity by clicking entity icon, and copying event data field by clicking its value.",
        configPageElements: [],
        contentScripts: ["Quick Copy/quick-copy.js"]
    }
    
    constructor(host) {
        super(host, QuickCopy.metadata.name);
    }
}

ModuleManager.registerModule(QuickCopy);