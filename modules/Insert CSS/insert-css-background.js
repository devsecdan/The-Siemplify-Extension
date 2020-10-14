"use strict";

class InsertCSS extends BackgroundModule {
    
    static metadata = {
        name: "Insert CSS",
        category: "Style",
        description: "Insert custom CSS to change page style.",
        configHtmlFile: "Insert CSS/config.part.html",
        defaultConfig: {
            selectionHighlightEnabled: true,
            selectionHighlightColour: "#1B5279",
            tableRowHighlightEnabled: true,
            tableRowHighlightColour: "#000000",
            tableResizeEnabled: true,
            wrapTextEnabled: true
        },
        contentScripts: ["Insert CSS/insert-css.js"]
    }
    
    constructor(host) {
        super(host, InsertCSS.metadata.name);
    }
}

ModuleManager.registerModule(InsertCSS);