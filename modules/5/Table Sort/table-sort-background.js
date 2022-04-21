"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class TableSort extends BackgroundModule {
    
    constructor(host) {
        super(host, TableSort.metadata.siemplifyVersion, TableSort.metadata.name);
    }
}

TableSort.metadata = {
    name: "Table Sort",
    category: "Automation",
    siemplifyVersion: "5",
    description: "Automatic alphabetical sorting of table fields.",
    contentScripts: ["Table Sort/table-sort.js"]
}

ModuleManager.registerModule(TableSort);

export default TableSort;