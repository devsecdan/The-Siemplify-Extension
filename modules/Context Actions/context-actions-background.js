"use strict";

class ContextActions extends BackgroundModule {
    
    menuTree = {};

    static metadata = {
        name: "Context Actions",
        category: "Functionality",
        description: "Add customisable contextual actions.",
        configHtmlFile: "Context Actions/config.part.html",
        manualPage: "Context Actions/manual.html",
        defaultConfig: {
            match: "",
            case: "None",
			contextActions: []
		},
    }
    
    constructor(host) {
        super(host, ContextActions.metadata.name);
    }

    enable() {
        this.constructMenuTree(this.config.contextActions);
		this.createMenus(this.menuTree);
	};
	
	disable() {
		this.removeMenus(this.menuTree);
    };

	async configChanged(oldConfig, newConfig) {
        await this.removeMenus(this.menuTree);
		this.constructMenuTree(newConfig.contextActions);
		this.createMenus(this.menuTree);
    }

    /**
     * Constrct a tree structure of the context menus defined in config
     */
    constructMenuTree(contextActions) {
        if (contextActions) {
            this.menuTree = { children: {} };
            for (let contextAction of contextActions) {
                // Split path into individual branches and follow to the end
                let currentBranch = this.menuTree;
                let pathSegments = contextAction.path.split("/");
                for (let i = 0; i < pathSegments.length; i++) {
                    let pathSegment = pathSegments[i];
                    // If branch does not exist, create it
                    if (!currentBranch.children[pathSegment]) {
                        currentBranch.children[pathSegment] = {
                            id: `${this.host}_${this.getPathUpTo(pathSegments, i)}`,
                            parentId: currentBranch.id,
                            title: pathSegment,
                            children: {}
                        };
                    }
                    currentBranch = currentBranch.children[pathSegment];
                }
                // currentBranch should = outermost segment of path. Assign action to this branch
                currentBranch.action = contextAction.action;
                currentBranch.parameters = contextAction.parameters;
                currentBranch.encoding = contextAction.encoding;
                currentBranch.reuseTab = contextAction.reuseTab;
            }
        }
    }

    /**
     * Given an array of path segments, combine 'to' path segments into a '/'-separated string
     * @param {*} pathSegments 
     * @param {*} to 
     */
    getPathUpTo(pathSegments, to) {
        let path = "";
        for (let i = 0; i <= to; i++) {
            path += pathSegments[i];
            if (i < to) path += "/";
        }
        return path;
    }
    
    /**
     * Create context menus from the provided menu tree
     * @param {*} currentBranch 
     */
    async createMenus(currentBranch) {
        if (currentBranch.id) {
            try {
                browser.contextMenus.create({
                    id: currentBranch.id,
                    parentId: currentBranch.parentId,
                    title: currentBranch.title,
                    contexts: ["page", "frame", "selection", "link", "editable"],
                    documentUrlPatterns: [`https://${this.host}/*`],
                    onclick: (info, tab) => this.executeAction(info, tab, currentBranch)
                },
                () => { if(browser.runtime.lastError) console.log(browser.runtime.lastError) });
            }
            catch(e) {
                console.log(e);
            }
        }

        for (let child of Object.values(currentBranch.children)) {
            this.createMenus(child);
        }
    }

    /**
     * Remove context menus defined by provided menu tree
     * @param {*} currentBranch 
     */
    async removeMenus(currentBranch) {
        if (currentBranch.id) {
            try {
                await browser.contextMenus.remove(currentBranch.id);
                // No need to iterate over the children, since the parent has just been removed
                return;
            }
            catch (e) {
            }
        }
        if (currentBranch.children) {
            for (let child of Object.values(currentBranch.children)) {
                await this.removeMenus(child);
            }
        }
    }

    /**
     * Execute the given action/link
     * @param {*} contextAction A link, with potential template content, to be executed
     */
    async executeAction(info, tab, contextAction) {
        // Get variables
        let textSelection = await browser.tabs.executeScript({file: 'modules/Context Actions/get-selection.js'});
        textSelection = textSelection[0];
        let environment = await browser.tabs.executeScript({file: 'modules/Context Actions/get-environment.js'});
        environment = this.processEnvironment(environment[0]);
        // Process Parameters field
        let parameters = contextAction.parameters.split(",").map(parameter => parameter.trim());
        // Encode text selection
        textSelection = encodeURIComponent(textSelection);
        // Define a new URL with variables replaced with concrete values
        let url = new URL(this.templateReplace(contextAction.action, textSelection, environment));

        // Apply encoding to specified url parameters
        let urlParams = new URLSearchParams(url.search);
        for (let parameter of parameters) {
            // Recreate whole URL with configured encoding if no parameters specified
            if (parameters.length === 1 && parameter === "") {
                url = new URL(this.templateReplace(contextAction.action, this.encodeString(contextAction.encoding, textSelection), environment));
            }
            // Get parameter value specified by parameter
            else {
                let parameterString = urlParams.get(parameter);
                if (parameterString) {
                    urlParams.set(parameter, this.encodeString(contextAction.encoding, parameterString));
                }
            }
        }
        url.search = urlParams.toString();
        // Create tab with final URL
        this.createTab(url, contextAction.reuseTab);
    }

    /**
     * Encode parameterString with encoding defined by encoding
     * @param {*} encoding 
     * @param {*} parameterString 
     */
    encodeString(encoding, parameterString) {
        switch (encoding) {
            case "UrlEncode":
                return encodeURIComponent(parameterString);
            case "Base64":
                return btoa(parameterString);
            case "GzipBase64":
                let encoder = new TextEncoder();
                let gzip = new Zlib.Gzip(encoder.encode(parameterString));
                let compressed = gzip.compress();
                return btoa(String.fromCharCode(...compressed));
            default:
                return parameterString;
        }
    }

    /**
     * Replace the template variables withtheir corresponding values
     * @param {*} action 
     * @param {*} selection 
     * @param {*} environment 
     */
    templateReplace(action, selection, environment) {
        return action.replace("{{SELECTION}}", selection)
                     .replace("{{ENVIRONMENT}}", environment);
    }

    /**
     * Change the given environment string according to the match and case config properties
     * @param {*} environment 
     */
    processEnvironment(environment) {
        let match = this.config.match;
        let result = environment.match(match)[1] || environment;
        switch(this.config.case) {
            case "toLower":
                result = result.toLowerCase();
                break;
            case "toUpper":
                result = result.toUpperCase();
                break;
        }
        return result;
    }

    /**
     * Opens, or reuses, a tab with the given URL
     * @param {*} url 
     */
    async createTab(url, reuseTab) {
        // Look for existinng tab, if configured to do so
        if (reuseTab) {
            let tabs = await browser.tabs.query({url: `${url.origin}/*`})
            if (tabs.length !== 0) {
                browser.tabs.update(tabs[0].id, { active: true, url: url.toString() });
                return;
            }
        }
        // Create new tab if configured not to reuse, or if no existing tab was found
        browser.tabs.create({url: url.toString()});
    }

}

ModuleManager.registerModule(ContextActions);