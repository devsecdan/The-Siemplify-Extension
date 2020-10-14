"use strict";

class ExpandAccordion extends BackgroundModule {
    
    static metadata = {
        name: "Expand Accordion",
        category: "Automation",
        description: "Automatically expand all accordions.",
        contentScripts: ["Expand Accordion/expand-accordion.js"]
    }
    
    constructor(host) {
        super(host, ExpandAccordion.metadata.name);
    }
}

ModuleManager.registerModule(ExpandAccordion);