"use strict";

class CasesNavigation extends BackgroundModule {
    
    constructor(host) {
        super(host, CasesNavigation.metadata.name);
    }
}

CasesNavigation.metadata = {
    name: "Navigation - Cases",
    category: "Navigation",
    description: "Customisable shortcuts for the Cases tab.",
    configHtmlFile: "Cases Navigation/config.part.html",
    defaultConfig: {
        selectOverviewTabKeybind: "q",
        selectCaseWallTabKeybind: "w",
        selectEventsTabKeybind: "e",
        selectNextEventKeybind: "ctrl+down",
        selectPreviousEventKeybind: "ctrl+up",
        selectNextAlertKeybind: "ctrl+right",
        selectPreviousAlertKeybind: "ctrl+left",
        deselectAlertKeybind: "esc",
        moveSplitRightKeybind: "right",
        moveSplitLeftKeybind: "left",
        scrollContextUpKeybind: "up",
        scrollContextDownKeybind: "down",
        highlightSearchKeybind: "ctrl+f",
        selectNextCaseKeybind: "pagedown",
        selectPreviousCaseKeybind: "pageup",
        toggleCaseListKeybind: "tab"
    },
    contentScripts: ["Cases Navigation/cases-navigation.js"]
}

ModuleManager.registerModule(CasesNavigation);