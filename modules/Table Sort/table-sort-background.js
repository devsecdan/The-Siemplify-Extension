"use strict";

class TableSort extends BackgroundModule {
    
    constructor(host) {
        super(host, TableSort.metadata.name);
    }
}

TableSort.metadata = {
    name: "Table Sort",
    category: "Automation",
    description: "Automatic alphabetical sorting of table fields.",
    contentScripts: ["Table Sort/table-sort.js"]
}

ModuleManager.registerModule(TableSort);