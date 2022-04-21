"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class CaseIDSearch extends BackgroundModule {
    
    constructor(host) {
        super(host, CaseIDSearch.metadata.siemplifyVersion, CaseIDSearch.metadata.name);
    }
}

CaseIDSearch.metadata = {
    name: "Case ID Search",
    category: "Functionality",
    siemplifyVersion: "6",
    description: "Add a search bar to quickly open a case from case ID.",
    contentScripts: ["Case ID Search/case-id-search.js"]
}

ModuleManager.registerModule(CaseIDSearch);

export default CaseIDSearch;