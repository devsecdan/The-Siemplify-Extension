"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class EntityEnrichment extends BackgroundModule {
    
    constructor(host) {
        super(host, EntityEnrichment.metadata.siemplifyVersion, EntityEnrichment.metadata.name);
    }
}

EntityEnrichment.metadata = {
    name: "Entity Enrichment",
    category: "Functionality",
    siemplifyVersion: "5.6",
    description: "Enrich case entities with data on previous cases and entries from the entity logs.",
    configHtmlFile: "Entity Enrichment/config.part.html",
    contentScripts: ["Entity Enrichment/entity-enrichment.js"]
}

ModuleManager.registerModule(EntityEnrichment);

export default EntityEnrichment;