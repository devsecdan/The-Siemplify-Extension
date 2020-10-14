
browser.browserAction.onClicked.addListener(activeTab => {
    openOptions(browser.extension.getURL("config/config.html"));
});

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