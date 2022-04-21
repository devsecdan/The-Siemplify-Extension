"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"

class HideRecommendations extends BackgroundModule {
    
    constructor(host) {
        super(host, HideRecommendations.metadata.siemplifyVersion, HideRecommendations.metadata.name);
    }
}

HideRecommendations.metadata = {
    name: "Hide Recommendations",
    category: "UI",
    siemplifyVersion: "5",
    description: "Hide recommendations in cases.",
    contentScripts: ["Hide Recommendations/hide-recommendations.js"]
}

ModuleManager.registerModule(HideRecommendations);

export default HideRecommendations;