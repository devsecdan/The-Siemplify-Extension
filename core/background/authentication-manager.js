"use strict";

var AuthenticationManager = (async function () {

    let tokens = {};

    /**
     * Returns a current authorisation token for the given host, if any exists. If one does not exist, start listening to all requests from hosts and return token when one is found
     */
    browser.runtime.onMessage.addListener((request, sender, response) => {
        if (request?.getAuthenticationToken) {
            let host = extractDomain(sender.url);
            let token = tokens[host];
            if (!token) {
                listenForAllRequests(host);
                return awaitToken(host, tokens[host]);
            }
            return Promise.resolve(token);
        }
    });

    /**
     * Checks if a token exists for given host
     * @param {*} host 
     * @param {*} existingToken
     */
    var awaitToken = async function(host, existingToken) {
        return new Promise((resolve, reject) => {
            let i = 0;
            let id = setInterval(() => {
                if (tokens[host] && tokens[host] !== existingToken) {
                    clearInterval(id);
                    resolve(tokens[host]);
                }
                else if (++i >= 20) {
                    clearInterval(id);
                    reject(new Error(`Unable to obtain request token. No requests to ${host} observed in ${i} seconds.`));
                }
            }, 1000);
        })
    }

    /**
     * Respond to changes in host permissions
     */
    ConfigurationManager.onHostsChanged.addListener(async function() {
        let permissions = await browser.permissions.getAll()
        listenForCheckSessionRequests(permissions.origins);
    })

    /**
     * Create listener for CheckSession list from which we can grab the current token
     */
    var listenForCheckSessionRequests = async function(hosts) {
        if (hosts.length !== 0) {
            let urls = [];
            for(let host of hosts) {
                let generalConfig = await ConfigurationManager.getHostConfig(host, "general");
                let apiPort = generalConfig.apiPort ? ":" + generalConfig.apiPort : "";
                urls.push(`https://${extractDomain(host)}${apiPort}${SiemplifyEndpoints.API_CHECK_SESSION}`);
            };
            browser.webRequest.onBeforeSendHeaders.removeListener(handleRequest)
            browser.webRequest.onBeforeSendHeaders.addListener(handleRequest, { urls: urls, types:["xmlhttprequest"] }, ["requestHeaders"]);
        }
    }

    /**
     * Listent to all requests to given host until a token is found
     * @param {*} host 
     */
    var listenForAllRequests = async function(host) {
        browser.webRequest.onBeforeSendHeaders.removeListener(handleAllRequest)
        browser.webRequest.onBeforeSendHeaders.addListener(handleAllRequest, { urls: [`https://${host}/*`], types:["xmlhttprequest"] }, ["requestHeaders"]);
    }

    /**
     * Check permissions for each host in hosts list
     */
    var checkPermissions = async function() {
        let hosts = await ConfigurationManager.getHosts();
        try {
            for (let host of hosts) {
                if (host != "") {
                    let hasPermission = await browser.permissions.contains({ origins: ["https://"+host+"/*"] })
                    if (!hasPermission) {
                        hosts = hosts.filter((h => h !== host));
                        console.error("No host permissions for ", host);
                    }
                }    
            }
            if (hosts.length !== 0) {
                listenForCheckSessionRequests(hosts);
            }
        } catch(e) {
            console.error(e);
        }
    }

    /**
     * Handle CheckSession requests and extract authorisation token
     * @param {*} details 
     */
    var handleRequest = async function(details) {
        let authorisationHeader = details.requestHeaders.find(header => header.name === "Authorization");
        let host = extractDomain(details.url);
        // Update host token and send to tabs
        tokens[host] = authorisationHeader.value;
        let tabs = await browser.tabs.query( {url: "https://"+host+"/*"})
        for (let tab of tabs) {
            browser.tabs.sendMessage(tab.id, {"authenticationToken": authorisationHeader.value })
            .catch(() => {});
        }
    }

    var handleAllRequest = function(details) {
        let authorisationHeader = details.requestHeaders.find(header => header.name === "Authorization");
        if (authorisationHeader && authorisationHeader.value) {
            browser.webRequest.onBeforeSendHeaders.removeListener(handleAllRequest)
            handleRequest(details);
        }
    }

    var extractDomain = function(url) {
        return url.replace("http://","").replace("https://","").split(/[/?#]/)[0];
    }

    checkPermissions();

})();