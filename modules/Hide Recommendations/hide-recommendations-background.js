"use strict";

class HideRecommendations extends BackgroundModule {
    
    static metadata = {
        name: "Hide Recommendations",
        category: "UI",
        description: "Hide recommendations in cases.",
        contentScripts: ["Hide Recommendations/hide-recommendations.js"]
    }
    
    constructor(host) {
        super(host, HideRecommendations.metadata.name);
    }
}

ModuleManager.registerModule(HideRecommendations);