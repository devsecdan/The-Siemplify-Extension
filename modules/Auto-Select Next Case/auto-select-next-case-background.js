"use strict";

class AutoSelectNextCase extends BackgroundModule {
    
    static metadata = {
        name: "Auto-Select Next Case",
        category: "Automation",
        description: "Automatically open next case after closing a case.",
        contentScripts: ["Auto-Select Next Case/auto-select-next-case.js"]
    }
    
    constructor(host) {
        super(host, AutoSelectNextCase.metadata.name);
    }    
}

ModuleManager.registerModule(AutoSelectNextCase);