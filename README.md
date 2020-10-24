# The Siemplify Extension
The Siemplify Extension is a modular, customisable browser extension for the [Siemplify](https://www.siemplify.co/) SOAR platform. It was created with the intent to improve the lives of security analysts, by providing several additional features and improvements to the Siemplify web interface.

The extension is largely focused on the analyst experience within the Cases tab of Siemplify. Some of the modules may still be applicable outside of the Cases tab, and further development is not limited to this area.

## Features
The extension is structured into several modules, each enabling a number of features.

### Modules
**Assign New Cases**
Adds a button to the case list which, when clicked, assigns a specified number of cases to the user.

**Auto-Select Next Case**
Automatically selects the next case in the list after closing a case.

**Case ID Search**
Adds a search bar which allows you to enter a case ID to quickly open a case in a new tab.

**Cases Navigation**
Adds configurable shortcut keys to easily navigate around the Cases tab.

**Close Case**
Allows the user to configure shortcuts to close a case with a pre-defined Reason and Root Cause.

**Context Actions**
Configure contextual actions, which can be accessed by right-clicking any entity or text element on a page. Actions are templated links which can be used to perform actions such as VirusTotal lookups on entities or pass entity data to a query service.

**Environment Monitoring**
A monitoring module which can be used detect and alert when no cases have been observed from a given environment within a certain time threshold.

**Entity Enrichment**
Enrich entities within cases with information from the entity page, including an overview of previous cases that the entity was seen in, and the contents of the entity log.

**Expand Accordion**
Automatically expand accordions.

**Hide Recommendations**
Hide the recommendations accordion from cases.

**CSS Style**
Make a number of style changes, including changing case highlight colour, adding alternating table colours, enhancing the way tables resize, and enabling wrapping of table and entity text.

**Quick Copy**
Allows a user to easily copy certain information by simply clicking it.

**Table Sort**
Alphabetically sort tables.

## Install
### Permanent Install
#### Chrome
[Download From Chrome Webstore](https://chrome.google.com/webstore/detail/the-siemplify-extension/lhjlconlpeljljbadkaihcdhoacclhpk)

#### Firefox
[Download From addon.mozilla.org](https://addons.mozilla.org/en-GB/firefox/addon/the-siemplify-extension/)

### Debug / Temporary Install
#### Chrome
1. Clone this repository to a folder of your choice.
2. Go to [chrome://extensions/](chrome://extensions/).
3. Enable `Developer mode`.
4. Click `Load Unpacked`.
5. Navigate to and select the main repository folder, which contains the `manifest.json` file.

#### Firefox
1. Clone this repository to a folder of your choice.
2. Go to [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox).
3. Click `Load Temporary Add-on...`.
4. Navigate to and select the main repository folder and select the `manifest.json` file.

## Setup
The extension consists of several modules, some of which may require further setup in order to function correctly.
This section is focused on the initial setup steps required for the extension to work. For further details on how to configure individual module, please read the documentation within the individual module folders, or by clicking the manual icon next to the module title on the extension configuration page.

The extension has multi-host support, meaning it can be used on multiple different SOAR instances, using either global or host-specific configuration. As a minimum, at least one host must be added through the configuration page.

### Minimal Setup
1. Click The Siemplify Extension action icon within your browser bar to open the configuration page.
2. Click 'Add Host'.
3. Enter the domain name or IP address of your SOAR and Add Host.
    1. Do not enter the URL scheme, path, or queries. i.e. enter `siemplify.com`, **not** `https://siemplify.com` or `https://siemplify.com/#/main/cases/`
4. Grant the extension permission to access the host page in the resulting popup.
5. If your SOAR is configured to receive API calls on a port different from port 443, enter the port number on the host configuration page.

The majority of the extension modules should now function on your configured SOAR host.

## Support
### Browser
Tested on recent versions of Chrome and Firefox. Other Chromium-based browsers will likely function, as well.

### Siemplify
Extension should work for Siemplify version v5.5.3. and onwards.
Tested on Siemplify v5.5.3.

## Third Party Libraries
- [Mutation Summary](https://github.com/rafaelw/mutation-summary)
- [Mousetraps](https://github.com/devsecdan/mousetraps)
- [Zlib](https://github.com/imaya/zlib.js)
- [saferInnerHTML](https://github.com/cferdinandi/saferInnerHTML)