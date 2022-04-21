"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class ExpandAccordion extends BackgroundModule {
    
    constructor(host) {
        super(host, ExpandAccordion.metadata.siemplifyVersion, ExpandAccordion.metadata.name);
    }
}

ExpandAccordion.metadata = {
    name: "Expand Accordion",
    category: "Automation",
    siemplifyVersion: "5",
    description: "Automatically expand all accordions.",
    contentScripts: ["Expand Accordion/expand-accordion.js"]
}

ModuleManager.registerModule(ExpandAccordion);

export default ExpandAccordion;