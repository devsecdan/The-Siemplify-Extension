"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class AssignNewCases extends BackgroundModule {
    
    /*static metadata = {
        name: "Assign New Cases",
        category: "Functionality",
        description: "Add a button to the top of the case list which can be clicked to bulk assign a preset number of cases to yourself.",
        configHtmlFile: "Assign New Cases/config.part.html",
        defaultConfig: {
            casesToAssign: 25,
            sortType: 1
        },
        contentScripts: ["Assign New Cases/assign-new-cases.js"]
    }*/
    
    constructor(host) {
        super(host, AssignNewCases.metadata.siemplifyVersion, AssignNewCases.metadata.name);
    }
}

AssignNewCases.metadata = {
    name: "Assign New Cases",
    category: "Functionality",
    siemplifyVersion: "6",
    description: "Add a button to the top of the case list which can be clicked to bulk assign a preset number of cases to yourself.",
    configHtmlFile: "Assign New Cases/config.part.html",
    defaultConfig: {
        casesToAssign: 25,
        sortType: 1
    },
    contentScripts: ["Assign New Cases/assign-new-cases.js"]
}

ModuleManager.registerModule(AssignNewCases);

export default AssignNewCases;