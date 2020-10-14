"use strict";

class CloseCase extends BackgroundModule {
    
    static metadata = {
        name: "Close Case",
        category: "Case Management",
        description: "Customisable shortcuts to open Close Case window with pre-defined Root Cause and Reason.",
        configHtmlFile: "Close Case/config.part.html",
        contentScripts: ["Close Case/close-case.js"]
    }
    
    constructor(host) {
        super(host, CloseCase.metadata.name);
    }
}

ModuleManager.registerModule(CloseCase);