"use strict";

/**
 * CSS identifiers:
 * class="config-element": Value of element is to be saved to browser storage.
 * ** config-name="name": Name to save element as.
 * class="config-group": Container for a dynamic group of related configuration elements to be saved.
 * ** class="config-group-add": Defines the button that adds a new copy of the config group template.
 * ** template
 * ** ** class="config-group-element": Element withing a config group to be saved.
 * ** ** ** config-name="environment":  Name to save element as.
 * ** ** class="config-group-remove": Defines the button that removes an instance of a config group element group.
 * ** 
 */

var _modulesMetadata = {};
var version = 0;

/**
 * Set up configuration page
 * @param {*} modulesMetadata Metadata of all modules
 */
async function initialise() {
	
	//Set version number in page title
	document.querySelector("#title").textContent += ` ${browser.runtime.getManifest().version}`

	// Get metadata and hosts
	let hosts = await ConfigurationManager.getHosts();
	let sectionParam = determineHostSection(hosts);
	let allSupportedVersions = await MessagingManager.sendMessage("getSiemplifyVersions", {"getSiemplifyVersions": true});
	let versionParam = determineVersion(allSupportedVersions);

	// Build config page
	let container = document.getElementById("main-container");
	setPageTitle(sectionParam, hosts, container);

	// Initialise side menu
	initialiseMenu(hosts, sectionParam, allSupportedVersions);
	
	// Create general config options
	if (sectionParam) {
		let generalConfig = await ConfigurationManager.getHostConfig(sectionParam, "general");
		version = versionParam || generalConfig.siemplifyVersion;
		await createHostGeneralConfig(sectionParam, version, allSupportedVersions, generalConfig.apiPort, generalConfig.username);
	}
	else {
		version = versionParam || allSupportedVersions[0];
		await createGlobalGeneralConfig(version, allSupportedVersions);
	}

	// Create container for the modules
	let moduleContainer = document.createElement("div");
	moduleContainer.id = "modules";
	container.appendChild(moduleContainer);

	// Get module metadata and build module section
	if (sectionParam) {
		_modulesMetadata = await MessagingManager.sendMessage("getModuleMetadata", {"getModuleMetadata": true, "version": version});
	}
	else {
		_modulesMetadata = await MessagingManager.sendMessage("getModuleMetadata", {"getModuleMetadata": true, "version": version, specific: true});
	}
	

	// Modules
	for (let moduleMetadata of _modulesMetadata) {
		await setupModule(sectionParam, moduleMetadata);
	};

	// addhost parameter
	let searchParams = new URLSearchParams(location.search);
	let addHostParam = searchParams.get("addhost");
	if (addHostParam) {
		openAddHostModal(allSupportedVersions, addHostParam);
	}
}

/**
 * Creates general config section on host page
 * @param {*} section 
 */
async function createHostGeneralConfig(host, version, allSupportedVersions, apiPort, username) {
	let versionOptions = allSupportedVersions.reduce((fullstring, supportedVersion) => {
		return fullstring += `<option value="${supportedVersion}" ${supportedVersion==version ? "selected" : ""}>${supportedVersion}</option>\n`
	}, "");
	let currentSelectionText = version ? version : "Select Version";
	versionOptions = `<option hidden disabled value="${currentSelectionText}"${!versionOptions.includes("selected") ? "selected" : ""} value>${currentSelectionText}.x</option>\n` + versionOptions;
	// Host-specific config options
	let container = document.querySelector("#main-container");
	let configDiv = document.createElement("div");
	configDiv.setAttribute("class", "category");
	configDiv.id = "category-general";
	configDiv.insertAdjacentHTML("beforeend", `
		<h1>General</h1>
		<div class="module" id="module-general">
			<form id="general-form">
				<table>
					<tr>
						<td><label>Siemplify Version</label></td>
						<td><select class="config-element" config-name="siemplifyVersion">
							${versionOptions}
						</select></td>
					</tr>
					<tr>
						<td><label>Explicit API Port</label></td>
						<td><input type="number" class="config-element" config-name="apiPort"></input></td>
					</tr>
					<tr>
						<td><label>(optional) Username</label></td>
						<td><input type="text" class="config-element" config-name="username"></input></td>
					</tr>
				</table>
			</form>
		</div>
	`);
	container.appendChild(configDiv);

	if (version) {
		document.querySelector("select[config-name=siemplifyVersion]").value = version;
	}
	if (apiPort) {
		document.querySelector("input[config-name=apiPort]").value = apiPort;
	}
	if (username) {
		document.querySelector("input[config-name=username]").value = username;
	}

	let versionSelectElement = document.querySelector("select[config-name=siemplifyVersion]");
	versionSelectElement.addEventListener("change", () => location.search = `version=${versionSelectElement.value}&section=${host}`)
}

/**
 * Creates general config section on global page
 * @param {*} section 
 */
async function createGlobalGeneralConfig(version, allSupportedVersions) {
	let versionOptions = allSupportedVersions.reduce((fullstring, supportedVersion) => {
		return fullstring += `<option value="${supportedVersion}" ${supportedVersion==version ? "selected" : ""}>${supportedVersion}.x</option>\n`
	}, "");
	let container = document.querySelector("#main-container");
	let configDiv = document.createElement("div");
	configDiv.setAttribute("class", "category");
	configDiv.id = "category-general";
	configDiv.insertAdjacentHTML("beforeend", `
		<h1>General</h1>
		<div class="module" id="module-general">
			<form id="general-form">
				<table>
					<tr>
						<td><label>Siemplify Version</label></td>
						<td><select class="config-element" config-name="siemplifyVersion">
							${versionOptions}
						</select></td>
					</tr>
				</table>
			</form>
		</div>
	`);
	container.appendChild(configDiv);
	document.querySelector("select[config-name=siemplifyVersion]").value = version;
	let versionSelectElement = document.querySelector("select[config-name=siemplifyVersion]");
	versionSelectElement.addEventListener("change", () => location.search = `version=${versionSelectElement.value}`)
}

/**
 * Generates module categories based on module metadata, and constructs module config sections
 * @param {*} section 
 * @param {*} moduleMetadata 
 */
async function setupModule(section, moduleMetadata) {
	let categorySection = getOrCreateCategory(moduleMetadata.category);
	createModuleSection(section, categorySection, moduleMetadata);
	await insertModuleConfigHtml(moduleMetadata);
	let hostConfig = await ConfigurationManager.getHostConfig(section, moduleMetadata.name);
	let globalConfig = await ConfigurationManager.getGlobalConfig(moduleMetadata.name, moduleMetadata.siemplifyVersion);
	setDefaultValues(moduleMetadata, section, hostConfig, globalConfig);
}

/**
 * Returns the value of the 'section' URL query parameter.
 * @param {*} hosts 
 */
function determineHostSection(hosts) {
	let searchParams = new URLSearchParams(location.search);
	let hostSection = searchParams.get("section");
	if (!hostSection) {
		return null;
	}
	if (hosts.includes(hostSection)) {
		return hostSection;
	}
	else {
		// Redirect if given host section does not exist
		location.search = "";
	}
}

/**
 * Returns the value of the 'version' URL query parameter.
 */
function determineVersion(allSupportedVersions) {
	let searchParams = new URLSearchParams(location.search);
	let version = searchParams.get("version");
	if (version && !allSupportedVersions.includes(version)) {
		// Redirect if given version is not supported
		location.search = "";
	}
	return version;
}

/**
 * Sets the title of the main page
 * @param {*} host 
 * @param {*} hosts 
 * @param {*} container 
 */
function setPageTitle(host, hosts, container) {
	let title = document.createElement("h1");
	if (!host) {
		title.textContent = `Configuration - Global`;
	}
	else if (hosts.includes(host)) {
		title.textContent = `Configuration - ${host}`;
	}
	container.appendChild(title);
}

/**
 * Create a new category section, or return existing one
 * @param {*} newCategory 
 */
function getOrCreateCategory(newCategory) {
	let categories = document.getElementsByClassName("category");
	let category = categories.namedItem(`category-${newCategory}`);
	if (!category) {
		category = document.createElement("div");
		category.classList.add("category");
		category.id = `category-${newCategory}`;
		category.insertAdjacentHTML("beforeend", `<h1>${newCategory}</h1>`);

		let moduleDiv = document.getElementById("modules");
		moduleDiv.appendChild(category);
	}
	return category;
}

/**
 * Create config screen section for given module
 * @param {*} categorySection Category element to create module section in
 * @param {*} metadata Module metadata
 */
function createModuleSection(section, categorySection, metadata) {
	let moduleSection = document.createElement("div");
	moduleSection.classList.add("module");
	moduleSection.id = `module-${metadata.name}`;
	moduleSection.insertAdjacentHTML("beforeend", `
		<h2 class="module-title">${metadata.name}</h2>
		${metadata.manualPage ? `<a title="Open Documentation" href="/modules/${metadata.siemplifyVersion}/${metadata.manualPage}" target="_blank"><svg class="icon icon-book"><use xlink:href="#icon-book"></use></svg></a>` : ""}
		${section ?
		`	<label class="checkbox-container">
				Override Global Configuration
				<input id="${metadata.name}-override" type="checkbox">
				<span class="checkbox-checkmark"></span>
			</label>
		` : ""}
		${metadata.description ? `<p>${metadata.description}</p>` : ""}
		<form id="${metadata.name}-form">
			<label class="checkbox-container">
				Enable
				<input id="${metadata.name}-enable" type="checkbox">
				<span class="checkbox-checkmark"></span>
			</label>
		</form>
	`);
	categorySection.appendChild(moduleSection);

	document.getElementById(`${metadata.name}-override`)?.addEventListener("click", (event) => setModuleOverride(metadata.name, event.target.checked));

	return moduleSection;
}

/**
 * Insert a module's config HTML, as defined by configHtmlFile metadata entry, into form.
 * @param {*} moduleMetadata 
 */
async function insertModuleConfigHtml(moduleMetadata) {
	if (moduleMetadata?.configHtmlFile) {
		let configHtml = await readFile(`/modules/${moduleMetadata.siemplifyVersion}/${moduleMetadata.configHtmlFile}`);
		if (configHtml) {
			let form = document.getElementById(moduleMetadata.name+"-form");
			form.insertAdjacentHTML("beforeend", "<br>"+configHtml);
		}
	}
}

/**
 * Read file at given file path and return as string
 * @param {*} filepath 
 */
async function readFile(filepath) {
	let url = browser.runtime.getURL(filepath);
	let response = await fetch(url);
	if (response.ok) {
		return response.text();
	}
	else {
		console.error(`${filepath} Not found: ${response.status} - ${response.statusText}`);
		return null;
	}
}

/**
 * Set default values of config elements depending on section
 * @param {*} moduleMetadata 
 * @param {*} section 
 * @param {*} hostConfig 
 * @param {*} globalConfig 
 */
async function setDefaultValues(moduleMetadata, section, hostConfig, globalConfig) {
	if (section) {
		if (Object.keys(hostConfig).length === 0) {
			setModuleOverride(moduleMetadata.name, false);
			setModuleValues(moduleMetadata, globalConfig); // Draw default values from global config
		}
		else {
			let override = document.getElementById(`${moduleMetadata.name}-override`);
			override.checked = true;
			setModuleValues(moduleMetadata, hostConfig);
		}
	}
	else {
		setModuleValues(moduleMetadata, globalConfig);
	}
}

/**
 * Set if module is overridden
 * @param {*} moduleName 
 * @param {*} override 
 */
function setModuleOverride(moduleName, override) {
	let form = document.forms[`${moduleName}-form`];
	if (!override) {
		form.classList.add("module-screen");
	}
	else {
		form.classList.remove("module-screen");
	}
	let inputs = form.querySelectorAll("input");
	for (let input of inputs) {
		input.disabled = !override;
	}
}

/**
 * Initialise module config with given values
 * @param {*} moduleMetadata 
 * @param {*} config 
 */
function setModuleValues(moduleMetadata, config) {
	// Module is enabled?
	let enabled = document.getElementById(`${moduleMetadata.name}-enable`);
	enabled.checked = config.enabled ? true : false;

	let moduleForm = document.forms[`${moduleMetadata.name}-form`];
	if (moduleForm) {
		// Apply default values to single config elements
		let configElements = moduleForm.getElementsByClassName("config-element");
		for (let configElement of configElements) {
			if (configElement.getAttribute("type") === "checkbox" || configElement.getAttribute("type") === "radio") {
				configElement.checked = config[configElement.getAttribute("config-name")];
			}
			else {
				configElement.value = config[configElement.getAttribute("config-name")];
			}
		}
		// Create and apply default values to config groups
		initialiseConfigGroups(moduleForm, config);
		// Create and apply default values to keybind inputs
		initialiseKeybindInputs(moduleForm);
	}
}

/**
 * Expand config groups and set default values
 * @param {*} moduleForm 
 * @param {*} moduleConfigs 
 */
function initialiseConfigGroups(moduleForm, moduleConfigs) {
	let configGroups = moduleForm.getElementsByClassName("config-group"); //<div class="config-group">
	for (let configGroup of configGroups) {
		let configs = moduleConfigs[configGroup.getAttribute("config-group-name")];
		let template = configGroup.querySelector("template"); // <template>
		if (configs) {
			for (let config of configs) {
				let configGroupElementGroup = createConfigGroupElementsFromTemplate(template, configGroup);
				let configGroupElements = configGroupElementGroup.getElementsByClassName("config-group-element"); // <input class="config-group-element">
				for (let configGroupElement of configGroupElements) {
					if (configGroupElement.getAttribute("type") === "checkbox" || configGroupElement.getAttribute("type") === "radio") {
						configGroupElement.checked = config[configGroupElement.getAttribute("config-name")];
					}
					else {
						configGroupElement.value = config[configGroupElement.getAttribute("config-name")];
					}
				}
			}
		}
		// Attach handler to 'add' button
		let addButton = configGroup.querySelector(".config-group-add"); // <input class="config-group-add">
		addButton.addEventListener("click", () => createConfigGroupElementsFromTemplate(template, configGroup));
	}
}

/**
 * Creates config group elements from given template and add it to given config group
 * @param {*} template 
 * @param {*} configGroup 
 */
function createConfigGroupElementsFromTemplate(template, configGroup) {
	let configGroupElementGroup = document.createElement("div"); // Outer div
	configGroupElementGroup.classList.add("config-group-element-group");
	let clonedConfigGroupElements = template.content.cloneNode(true); // Insert contents of template into div
	configGroupElementGroup.appendChild(clonedConfigGroupElements);
	template.insertAdjacentElement("beforebegin", configGroupElementGroup); // Add to config group, before template

	let removeButton = configGroupElementGroup.querySelector(".config-group-remove"); // <input class="config-group-remove">
	removeButton.addEventListener("click", (event) => removeParentElement(event.target));

	// Initialise keybind inputs
	let keybinds = configGroupElementGroup.querySelectorAll(".keybind");
	for (let keybind of keybinds) {
		initialiseKeybindInput(keybind);
	}

	return configGroupElementGroup;
}

/**
 * Removes the parent (and children) of an element from the DOM tree
 * @param {*} element 
 */
function removeParentElement(element) {
	element.parentNode.parentNode.removeChild(element.parentNode);
}

/**
 * Initialise and set default values for keybind inputs
 * @param {*} moduleForm 
 */
function initialiseKeybindInputs(moduleForm) {
	let keybinds = moduleForm.getElementsByClassName("keybind");
	for (let keybind of keybinds) {
		initialiseKeybindInput(keybind)
	}
}

function initialiseKeybindInput(element) {
	element.addEventListener("focus", recordKeybind);
}

/**
 * Record user input to get new keybind
 * @param {*} event 
 */
function recordKeybind(event) {
	let keybindInput = event.target;
	let currentKeybind = keybindInput.value;
	let tempValue = "Enter keybind..."
	keybindInput.value = tempValue;
	// Start recording
	Mousetraps.record(sequence => {
		// Only apply new keybind if element is still focused
		if (keybindInput === document.activeElement) {
			keybindInput.value = sequence.join(' ');
			keybindInput.blur();
		}
	});
	// Reset value if element unfocused before entering a new keybind
	let callback = () => {
		if (keybindInput.value === tempValue) {
			keybindInput.value = currentKeybind;
		}
		keybindInput.removeEventListener("blur", callback);
	};
	keybindInput.addEventListener("blur", callback);

	setTimeout(() => keybindInput.blur(), 5000);
}

/**
 * Initialise side menu with content
 * @param {*} hosts 
 * @param {*} section
 */
function initialiseMenu(hosts, section, allSupportedVersions) {
	let menu = document.querySelector(".grid-menu");
	
	// Default configuration button
	let defaultLink = document.createElement("div");
	defaultLink.className = "host";
	if (!section) {
		defaultLink.classList.add("selected");
	}
	defaultLink.insertAdjacentHTML("beforeend", "<label>Global Configuration</label>");
	defaultLink.addEventListener("click", () => location.href="?");
	menu.appendChild(defaultLink);

	// Host buttons
	let h1 = document.createElement("h1");
	h1.textContent = "Host-Specific Configuration";
	menu.appendChild(h1);
	for (let host of hosts) {
		let div = document.createElement("div");
		div.id = host;
		div.title = host;
		div.className = "host";
		if (host === section) {
			div.classList.add("selected");
		}
		let label = document.createElement("label")
		label.textContent = host;
		label.addEventListener("click", () => location.href=`?section=${host}`);
		let removeHostButton = document.createElement("input");
		removeHostButton.type = "button";
		removeHostButton.value = "X";
		removeHostButton.addEventListener("click", () => openRemoveHostModal(host));
		div.appendChild(label);
		div.appendChild(removeHostButton);
		menu.appendChild(div);
	};

	// Add host button
	let addHostButton = document.createElement("input");
	addHostButton.type = "button";
	addHostButton.value = "Add Host";
	addHostButton.addEventListener("click", () => openAddHostModal(allSupportedVersions));

	menu.appendChild(addHostButton);
}

function openRemoveHostModal(host) {
	let options = {
		title: "Remove Host",
		content: `<label>Are you sure you wish to remove ${host}?<label>`,
		cancel: {
			value: "Cancel",
			callback: () => modal.style.display = "none"
		},
		submit: {
			value: "Confirm",
			callback: () => removeHost(host)
		}
	}
	openModal(options);
}

async function removeHost(host) {
	await ConfigurationManager.removeHost(host)
	removeHostPermissions([`https://${host}/*`]);
	location.search = "";
}

/**
 * Opens modal to add a new host
 */
function openAddHostModal(allSupportedVersions, host = "") {
	let versionOptions = allSupportedVersions.reduce((fullstring, supportedVersion) => {
		return fullstring += `<option value="${supportedVersion}">${supportedVersion}.x</option>\n`
	}, "");
	let options = {
		title: "Add Host",
		content: `<label>Siemplify Host Domain<label><br><input type="url" id="new-host" placeholder="siemplify.com" value=${host}>
		<br><label>Select Siemplify Version<label><br>
		<select id="new-host-version">
			${versionOptions}
		</select>`,
		cancel: {
			value: "Cancel",
			callback: () => modal.style.display = "none"
		},
		submit: {
			value: "Add Host",
			callback: () => addNewHost(document.getElementById("new-host").value, document.getElementById("new-host-version").value)
		}
	}
	openModal(options);
}

async function addNewHost(host, version) {
	let domain = host.replace("https://", "").replace("http://", "").split(/[/?#]/)[0];
	if (await requestHostPermissions([`https://${domain}/*`])) {
		if (await ConfigurationManager.addHost(domain, version)){
			location.search = `section=${domain}`;
		}
		else {
			await ConfigurationManager.removeHost(domain);
			removeHostPermissions([`https://${domain}/*`]);
			displayMessage("Failed to add host", "error");
		}
	}
	else {
		displayMessage("Permission required to add host", "error");
	}
}

// Hide modal when clicking outside modal window
window.addEventListener("click", (event) => {
	if (event.target == modal) {
		modal.style.display = "none";
	}
});

/**
 * Open the modal using the specified options.
 * 
 * (optional) options.title (string) = modal title
 * 
 * (required) options.content (string/Element) = modal HTML content
 * 
 * (optional) options.cancel (Object) = left/cancel button
 * 
 * (required if options.cancel set) options.cancel.value (string) = text on cancel button
 * 
 * (required if options.cancel set) options.cancel.callback (function) = callback on cancel button click
 * 
 * (optional) options.submit (Object) = right/submit button
 * 
 * (required if options.submit set) options.submit.value (string) = text on submit button
 * 
 * (required if options.submit set) options.submit.callback (function) = callback on submit button click
 * 
 * @param {Object} options  
 */
function openModal(options) {
	// options.title = Set title
	if (options.title) {
		let modalTitle = document.getElementById("modal-title");
		modalTitle.textContent = options.title;
	}
	// options.content = Set HTML content
	let modalContent = document.getElementById("modal-content");
	while(modalContent.firstChild) {
		modalContent.removeChild(modalContent.firstChild);
	}
	if (typeof options.content === "Element") {
		modalContent.appendChild(options.content);
	}
	else {
		modalContent.insertAdjacentHTML("beforeend", options.content);
	}
	// options.cancel = Set cancel button value and callback
	let modalCancel = document.getElementById("modal-cancel");
	if (options.cancel) {
		modalCancel.value = options.cancel.value;
		modalCancel.onclick = options.cancel.callback;
		modalCancel.style.display = "inline";
	}
	else {
		modalCancel.style.display = "none";
	}
	// options.submit = Set submit button value and callback
	let modalSubmit = document.getElementById("modal-submit");
	if (options.submit) {
		modalSubmit.value = options.submit.value;
		modalSubmit.onclick = options.submit.callback;
		modalSubmit.style.display = "inline";
	}
	else {
		modalSubmit.style.display = "none";
	}
	modal.style.display = "block";
}

/**
 * Display an informational message
 * @param {string} message 
 */
function displayMessage(message, level = "info") {
	let messageWindow = document.getElementById("message-window");
	let messageContent = document.getElementById("message-content");
	messageContent.textContent = message;
	messageWindow.style.display = "block"
	if (level === "error") {
		messageWindow.style.borderBottomColor = "var(--message-error)";
	}
	else {
		messageWindow.style.borderBottomColor = "var(--message-info)";
	}
	setTimeout(() => messageWindow.style.display = "none", 5000);
}

////////////////////// SAVING //////////////////////

/**
 * Save all config elements to browser storage
 */
async function saveSettings() {
	let validated = true;
	let host = new URLSearchParams(location.search).get("section");
	// Save general settings
	let generalForm =  document.getElementById("general-form");
	if (generalForm) {
		let generalSettings = {};
		saveConfigElementSettings(generalForm, generalSettings);
		if (host) {
			await ConfigurationManager.setHostConfig(host, "general", generalSettings);
		}
		else {
			await ConfigurationManager.setGlobalConfig("general", version, generalSettings);
		}
	}
	// Save module settings
	for (let moduleMetadata of _modulesMetadata) {
		const moduleName = moduleMetadata.name;
		const siemplifyVersion = moduleMetadata.siemplifyVersion
		// Only save host-specific settings if override button is checked
		let override = document.getElementById(`${moduleName}-override`);
		if (!override || override.checked) {
			let moduleSettings = {};
			let moduleForm = document.forms[moduleName+"-form"];
			if (moduleForm) {
				validated = validated
					&& saveConfigElementSettings(moduleForm, moduleSettings)
					&& saveConfigGroupSettings(moduleForm, moduleSettings);
			}
			let enable = document.getElementById(`${moduleName}-enable`);
			moduleSettings.enabled = enable.checked;
			
			if (validated) {
				if (host) {
					await ConfigurationManager.setHostConfig(host, moduleName, moduleSettings);
				}
				else {
					await ConfigurationManager.setGlobalConfig(moduleName, siemplifyVersion, moduleSettings);
				}
			}
		}
		else {
			// Remove host-specific settings if not overridden
			ConfigurationManager.removeHostConfig(host, moduleName);
		}
	};
	if (validated) {
		displayMessage("Saved", "info");
	}
	else {
		displayMessage("Some module settings could not be saved.", "error");
	}
	// Update export blob
	createExportBlob();
}

/**
 * Save individual config elements
 * @param {*} configElements 
 * @param {*} moduleSettings 
 */
function saveConfigElementSettings(moduleForm, moduleSettings) {
	let validated = true;
	let configElements = moduleForm.getElementsByClassName("config-element");
	for (let configElement of configElements) {
		if (configElement.getAttribute("type") === "checkbox" || configElement.getAttribute("type") === "radio") {
			moduleSettings[configElement.getAttribute("config-name")] = configElement.checked;	
		}
		else {
			// Check if required config elements are filled
			if (configElement.hasAttribute("required") && configElement.value === "") {
				validated = false;
				configElement.classList.add("required-warning");
			}
			// Save config value
			else {
				moduleSettings[configElement.getAttribute("config-name")] = configElement.value;
				configElement.classList.remove("required-warning");
			}
		}
	}
	return validated;
}

/**
 * Save config groups
 * @param {*} moduleForm 
 * @param {*} moduleSettings 
 */
function saveConfigGroupSettings(moduleForm, moduleSettings) {
	let validated = true;
	let configGroups = moduleForm.getElementsByClassName("config-group");
	for (let configGroup of configGroups) {
		let configGroupName = configGroup.getAttribute("config-group-name");
		let configGroupValues = [];
		let configGroupElementGroups = configGroup.getElementsByClassName("config-group-element-group");
		for (let configGroupElementGroup of configGroupElementGroups) {
			let configGroupElementValues = {};
			let configGroupElements = configGroupElementGroup.getElementsByClassName("config-group-element");
			for (let configGroupElement of configGroupElements) {
				if (configGroupElement.getAttribute("type") === "checkbox" || configGroupElement.getAttribute("type") === "radio") {
					configGroupElementValues[configGroupElement.getAttribute("config-name")] = configGroupElement.checked;
				}
				else {
					// Check if required config elements are filled
					if (configGroupElement.hasAttribute("required") && configGroupElement.value === "") {
						validated = false;
						configGroupElement.classList.add("required-warning");
					}
					// Save config value
					else {
						configGroupElementValues[configGroupElement.getAttribute("config-name")] = configGroupElement.value;
						configGroupElement.classList.remove("required-warning");
					}
				}
			}
			configGroupValues.push(configGroupElementValues);
		}
		moduleSettings[configGroupName] = configGroupValues;
	}
	return validated;
}

async function requestHostPermissions(hosts) {
	try {
		let granted = await browser.permissions.request({origins: hosts});
		if (!granted) {
			console.log("Request denied");
			return false;
		}
		else {
			console.log("Request granted");
			return true;
		}
	}
	catch (error) {
		console.log("Invalid Host Permission:", error.message);
	}
	return false;
}

async function removeHostPermissions(hosts) {
	let success = await browser.permissions.remove({origins: hosts});
	if (success) {
		console.log("Host permissions removed");
	}
	else {
		console.log("Failed to remove host permissions");
	}
	return success;
}

document.getElementById("saveConfig").addEventListener("click", saveSettings);

////////////////////// Import/Export //////////////////////
// Make Export button click hidden link
document.getElementById("exportConfig").addEventListener("click", () => document.getElementById("exportFileLink").click());

// Create config blob
var exportBlobUrl = null;
function createExportBlob() {
	browser.storage.local.get().then(storage => {
		let blob = new Blob([JSON.stringify(storage)], {type: "application/json"});
		URL.revokeObjectURL(exportBlobUrl);
		exportBlobUrl = URL.createObjectURL(blob);
		let exportButton = document.getElementById("exportFileLink");
		exportButton.href = exportBlobUrl;
	});
}
createExportBlob();

document.querySelector("#importConfig").addEventListener("click", () => document.getElementById("importConfigFile").click());
document.getElementById("importConfigFile").addEventListener("change", importConfig);

/**
 * Imports config provided in file selected by importConfigFile
 */
async function importConfig() {
	let files = document.getElementById("importConfigFile").files;
	if (files.length) {
		let fileReader = new FileReader();
		fileReader.onload = (e) => {
			try {
				let json = JSON.parse(e.target.result);
				if (importIsValid(json)) {
					openImportModal(json);
				}
			} catch (e) {
				console.log(e);
				displayMessage("Error importing file.", "error");
			}
		}
		fileReader.readAsText(files[0]);
	}
}

/**
 * Check if imported json is valid configuration
 * @param {*} json 
 */
function importIsValid(json) {
	return true;
}

function openImportModal(importConfig) {
	let options = {
		title: "Import Configuration",
		content: '<p>Are you sure you want to overwrite current configuration?<p>',
		cancel: {
			value: "Cancel",
			callback: () => modal.style.display = "none"
		},
		submit: {
			value: "Import",
			callback: () => applyImportConfiguration(importConfig)
		}
	}
	openModal(options);
}

/**
 * Overwrite configuration with given imported config
 * @param {*} importConfig 
 */
async function applyImportConfiguration(importConfig) {
	// Check if host permissions have been provided
	let hosts = getHostsinImport(importConfig);
	hosts = hosts.map((host) => `https://${host}/*`);
	let hasPermission = await requestHostPermissions(hosts);
	if (hasPermission) {
		// Apply imported configuration
		browser.storage.local.clear();
		browser.storage.local.set(importConfig);
		displayMessage("Import successful. Reloading page...", "info");
		setTimeout(() => location.reload(), 3000);
	}
	else {
		displayMessage(`Host permissions must be provided for imported hosts: ${hosts}`, "error");
	}
}

function getHostsinImport(importConfig) {
	let hosts = [];
	for (let [key, value] of Object.entries(importConfig)) {
		let host = key.split("_")[0];
		if (host != "global" && !hosts.includes(host)) {
			hosts.push(host);
		}
	}
	return hosts;
}

////////////////////// Reset config //////////////////////
function openResetModal() {
	let options = {
		title: "Reset to Default Configuration",
		content: '<p>Are you sure you want to reset to default global configuration?<p>',
		cancel: {
			value: "Cancel",
			callback: () => modal.style.display = "none"
		},
		submit: {
			value: "Reset",
			callback: resetToDefaultConfiguration
		}
	}
	openModal(options);
}

function resetToDefaultConfiguration() {
	MessagingManager.sendMessage("resetToDefaultConfig", { resetToDefaultConfig: true })
	.then(response => {
		displayMessage("Configuration reset. Reloading page...", "info");
		setTimeout(() => location.reload(), 3000);
	});
}

document.getElementById("resetConfig").addEventListener("click", openResetModal);

initialise()