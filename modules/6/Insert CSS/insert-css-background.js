"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class InsertCSS extends BackgroundModule {
    
    constructor(host) {
        super(host, InsertCSS.metadata.siemplifyVersion, InsertCSS.metadata.name);
    }
}

InsertCSS.metadata = {
    name: "CSS Style",
    category: "Style",
    siemplifyVersion: "6",
    description: "Insert custom CSS to change page style.",
    configHtmlFile: "Insert CSS/config.part.html",
    defaultConfig: {
        selectionHighlightEnabled: true,
        selectionHighlightColour: "#1B5279",
        tableRowHighlightEnabled: true,
        tableRowHighlightColour: "#000000",
        tableResizeEnabled: true,
        wrapTextEnabled: true,
        lowercaseEntitiesEnabled: true
    },
    contentScripts: ["Insert CSS/insert-css.js"]
}

ModuleManager.registerModule(InsertCSS);

export default InsertCSS;