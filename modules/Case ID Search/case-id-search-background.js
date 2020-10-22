"use strict";

class CaseIDSearch extends BackgroundModule {
    
    constructor(host) {
        super(host, CaseIDSearch.metadata.name);
    }
}

CaseIDSearch.metadata = {
    name: "Case ID Search",
    category: "Functionality",
    description: "Add a search bar to quickly open a case from case ID.",
    contentScripts: ["Case ID Search/case-id-search.js"]
}

ModuleManager.registerModule(CaseIDSearch);