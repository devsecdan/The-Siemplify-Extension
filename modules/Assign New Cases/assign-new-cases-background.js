"use strict";

class AssignNewCases extends BackgroundModule {
    
    static metadata = {
        name: "Assign New Cases",
        category: "Functionality",
        description: "Add a button to the top of the case list which can be clicked to bulk assign a preset number of cases to yourself.",
        configHtmlFile: "Assign New Cases/config.part.html",
        defaultConfig: {
            casesToAssign: 25,
            sortType: 1
        },
        contentScripts: ["Assign New Cases/assign-new-cases.js"]
    }
    
    constructor(host) {
        super(host, AssignNewCases.metadata.name);
    }
}

ModuleManager.registerModule(AssignNewCases);