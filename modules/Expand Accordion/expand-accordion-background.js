"use strict";

class ExpandAccordion extends BackgroundModule {
    
    constructor(host) {
        super(host, ExpandAccordion.metadata.name);
    }
}

ExpandAccordion.metadata = {
    name: "Expand Accordion",
    category: "Automation",
    description: "Automatically expand all accordions.",
    contentScripts: ["Expand Accordion/expand-accordion.js"]
}

ModuleManager.registerModule(ExpandAccordion);