"use strict";

class TableSort extends BackgroundModule {
    
    static metadata = {
        name: "Table Sort",
        category: "Automation",
        description: "Automatic alphabetical sorting of table fields.",
        contentScripts: ["Table Sort/table-sort.js"]
    }
    
    constructor(host) {
        super(host, TableSort.metadata.name);
    }
}

ModuleManager.registerModule(TableSort);