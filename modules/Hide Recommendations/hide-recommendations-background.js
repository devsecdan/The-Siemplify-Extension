"use strict";

class HideRecommendations extends BackgroundModule {
    
    constructor(host) {
        super(host, HideRecommendations.metadata.name);
    }
}

HideRecommendations.metadata = {
    name: "Hide Recommendations",
    category: "UI",
    description: "Hide recommendations in cases.",
    contentScripts: ["Hide Recommendations/hide-recommendations.js"]
}

ModuleManager.registerModule(HideRecommendations);