"use strict";

class InsertCSS extends BackgroundModule {
    
    static metadata = {
        name: "CSS Style",
        category: "Style",
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
    
    constructor(host) {
        super(host, InsertCSS.metadata.name);
    }
}

ModuleManager.registerModule(InsertCSS);