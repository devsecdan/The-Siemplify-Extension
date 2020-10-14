"use strict";

class EntityEnrichment extends BackgroundModule {
    
    static metadata = {
        name: "Entity Enrichment",
        category: "Functionality",
        description: "Enrich case entities with data on previous cases and entries from the entity logs.",
        configHtmlFile: "Entity Enrichment/config.part.html",
        contentScripts: ["Entity Enrichment/entity-enrichment.js"]
    }
    
    constructor(host) {
        super(host, EntityEnrichment.metadata.name);
    }
}

ModuleManager.registerModule(EntityEnrichment);