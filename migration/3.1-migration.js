browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.get().then(storage => {
        let migrationNeeded = false;
        let migratedConfig = storage;
        for (let key in storage) {
            if (!storage.hasOwnProperty(key)) {
                continue;
            }
            let match = key.match(/^global_([^_]+)$/);
            if (match) {
                let newkey = `global_5_${match[1]}`;
                migratedConfig[newkey] = migratedConfig[key];
                
                newkey = `global_5.6_${match[1]}`;
                migratedConfig[newkey] = migratedConfig[key];
                delete migratedConfig[key];

                migrationNeeded = true;
            }
        }
        if (migrationNeeded) {
            browser.storage.local.clear();
            browser.storage.local.set(migratedConfig);
        }
    })
})