document.getElementById("settings").addEventListener("click", () => openOptions(browser.extension.getURL("config/config.html")));

async function getOwnTabs() {
    let views = await browser.extension.getViews({type: 'tab'});
    let tabs = [];
    for (let view of views) {
        let tab = await view.browser.tabs.getCurrent();
        tabs.push(tab);
    }
    return tabs;
}
    
async function openOptions(url) {
    const ownTabs = await getOwnTabs();
    const tab = ownTabs.find(tab => tab.url.includes(url));
    if (tab) {
        browser.tabs.update(tab.id, {active: true});
    } else {
        browser.tabs.create({url});
    }
}

function extractDomain(url) {
    return url.replace("http://","").replace("https://","").split(/[/?#]/)[0];
}

ConfigurationManager.getHosts()
browser.tabs.query({active:true, currentWindow:true}).then(tabs => {
    console.log(tabs[0].url);
    let domain = extractDomain(tabs[0].url);
    ConfigurationManager.getHosts().then(hosts => {
        addHost = document.getElementById("add-host");
        if (hosts.includes(domain)) {
            addHost.setAttribute("hidden", "");
        }
        else {
            addHost.value = `Add ${domain}`;
            addHost.addEventListener("click", () => openOptions(browser.extension.getURL("config/config.html")+`?addhost=${domain}`));
        }
    })
})
