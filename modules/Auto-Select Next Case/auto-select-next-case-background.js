"use strict";

class AutoSelectNextCase extends BackgroundModule {
    
    constructor(host) {
        super(host, AutoSelectNextCase.metadata.name);
    }    
}

AutoSelectNextCase.metadata = {
    name: "Auto-Select Next Case",
    category: "Automation",
    description: "Automatically open next case after closing a case.",
    contentScripts: ["Auto-Select Next Case/auto-select-next-case.js"]
}

ModuleManager.registerModule(AutoSelectNextCase);