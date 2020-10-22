"use strict";

class EntityEnrichment extends BackgroundModule {
    
    constructor(host) {
        super(host, EntityEnrichment.metadata.name);
    }
}

EntityEnrichment.metadata = {
    name: "Entity Enrichment",
    category: "Functionality",
    description: "Enrich case entities with data on previous cases and entries from the entity logs.",
    configHtmlFile: "Entity Enrichment/config.part.html",
    contentScripts: ["Entity Enrichment/entity-enrichment.js"]
}

ModuleManager.registerModule(EntityEnrichment);