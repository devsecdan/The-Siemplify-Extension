function extractDomain(url) {
    return url.replace("http://","").replace("https://","").split(/[/?#]/)[0];
}

async function setTabIcon(tabId, url) {
    let hosts = await ConfigurationManager.getHosts();
    let domain = extractDomain(url);
    if (hosts.includes(domain)) {
        browser.browserAction.setIcon({
            path: {
                "48": "icons/SiemplifyExtension48.png",
                "96": "icons/SiemplifyExtension96.png",
                "300": "icons/SiemplifyExtension300.png"
            },
            tabId: tabId
        });
    }
    else {
        browser.browserAction.setIcon({
            path: {
                "48": "icons/SiemplifyExtension-grey48.png",
                "96": "icons/SiemplifyExtension-grey96.png",
                "300": "icons/SiemplifyExtension-grey300.png"
            },
            tabId: tabId
        });
    }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status == "complete" && tab.url) {
        setTabIcon(tabId, tab.url);
    }
});
browser.tabs.onCreated.addListener(tab => {
    if (tab.url) {
        setTabIcon(tab.id, tab.url);
    }
});
browser.tabs.onActivated.addListener(activeInfo => {
    browser.tabs.get(activeInfo.tabId).then(tab => {
        if (tab.url) {
            setTabIcon(tab.id, tab.url);
        }
    })
})