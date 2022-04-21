"use strict";

var DetectLastAlert = (function () {
	
	var topbarMenuSelector = ".header-actions-list";

	var environmentThresholds = new Map();

	var lastCheck = "Not checked";
	
	var enable = function () {
		populateEnvironmentThresholdsMap(this.config);
		ElementObserver.observe(topbarMenuSelector, handleSummary);
		if (document.querySelector(topbarMenuSelector)) {
			addListeners();
			getAlerts();
			createStatusIcon();
			insertCSS();
		}
	}
	
	var disable = function() {
		ElementObserver.stop(handleSummary);
		removeListeners();
		for (let [environment, threshold] of environmentThresholds) {
			removeHeaderIcon(environment);
		}
		removeHeaderIcon("detectLastAlertStatus");
		removeCSS();
	}

	var configChanged = function(oldConfig, newConfig) {
		populateEnvironmentThresholdsMap(this.config);
	}

	var populateEnvironmentThresholdsMap = function(config) {
		environmentThresholds.clear();
		if (config.environmentThresholds) {
			for (let environmentThreshold of config.environmentThresholds) {
				environmentThresholds.set(environmentThreshold.environment, environmentThreshold.threshold);
			}
		}
	}

	var handleSummary = function(summary) {
		summary.added.forEach(() => {
			addListeners();
			getAlerts();
			createStatusIcon();
			insertCSS();
		});
	}
	
	/**
		Add onMessage listeners if not already added
	**/
	var addListeners = function() {
		if (!MessagingManager.hasListener("alertingEnvironment", handleAlertingEnvironment)) MessagingManager.addListener("alertingEnvironment", handleAlertingEnvironment);
		if (!MessagingManager.hasListener("checkEnvironments", handleCheckEnvironments)) MessagingManager.addListener("checkEnvironments", handleCheckEnvironments);
		if (!MessagingManager.hasListener("dismissAlert", handleDismissAlert)) MessagingManager.addListener("dismissAlert", handleDismissAlert);
	}

	var removeListeners = function() {
		MessagingManager.removeListener("alertingEnvironment", handleAlertingEnvironment);
		MessagingManager.removeListener("checkEnvironments", handleCheckEnvironments);
		MessagingManager.removeListener("dismissAlert", handleDismissAlert);
	}

	var insertCSS = function(css) {
        if (!document.getElementById("detectLastAlertCSS")) {
			let style = document.createElement("style");
			style.setAttribute("id", "detectLastAlertCSS");
			style.type = "text/css";
			style.textContent = ".detect-last-alert-rotate {\
				-webkit-animation:spin 4s linear infinite;\
				-moz-animation:spin 4s linear infinite;\
				animation:spin 4s linear infinite;\
			}\
			@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }\
			@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }\
			@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }";
			document.getElementsByTagName("head")[0].appendChild(style);
		}
    }

    var removeCSS = function(id) {
        let style = document.getElementById("detectLastAlertCSS");
		if (style) {
			style.parentNode.removeChild(style);
		}
    }

	/**
	 * Create a header icon with given details
	 * @param {*} id 
	 * @param {*} title 
	 * @param {*} colour 
	 * @param {*} action 
	 * @param {*} icon 
	 */
	var createHeaderIcon = function(id, title, colour, action, icon="smp-alerts-icon", elementClass="") {
		// Find existing smp-action with given id, or create a new one
		let attachElement = false;
		let smpaction = document.getElementById(id);
		if (!smpaction) {
			smpaction = document.createElement("smp-action");
			attachElement = true;
		}
		// Remove children
		while(smpaction.firstChild) {
			smpaction.removeChild(smpaction.firstChild);
		}
		// Recreate
		smpaction.setAttribute("id", id);
		smpaction.setAttribute("class", "simp-action simp-action__color--default simp-action__size--small simp-context-menu ng-star-inserted");
		smpaction.setAttribute("title", title);

		// a
		let a = document.createElement("a");
		a.setAttribute("href", "javascript:void(0);");
		smpaction.appendChild(a);

		//i
		let i = document.createElement("i");
		i.setAttribute("class", `icon icon-big ${icon} ng-star-inserted ${elementClass}`);
		i.setAttribute("style", `color:${colour}`);
		i.addEventListener("click", action);
		a.appendChild(i);

		// Attach to DOM if a new element was created
		if (attachElement) {
			let rightHeader = document.querySelector(topbarMenuSelector);
			let firstChild = rightHeader.children[0];
			rightHeader.insertBefore(smpaction, firstChild);
		}
	}

	/**
	 * Create status header icon
	 */
	var createStatusIcon = function() {
		let title = `Environment alert monitoring enabled.\n\nLast check performed at: ${lastCheck}\n\nClick to perform manual check.`;
		createHeaderIcon("detectLastAlertStatus", title, "var(--dark-100)", () => handleCheckEnvironments({checkEnvironments:true}));
	}
	
	/**
		Handles alertingEnvironment messages. Displays alert for received environment
	**/
	var handleAlertingEnvironment = function(request, sender, response) {
		if (request.alertingEnvironment) {
			if (!location.href.includes(SiemplifyEndpoints.LOGIN_URL)) {
				let time = new Date(request.lastAlertTime);
				displayAlert(request.alertingEnvironment, environmentThresholds.get(request.alertingEnvironment), time);
			}
		}
	}
	
	/**
		Queries for alerting environments
	**/
	var getAlerts = function() {
		MessagingManager.sendMessage( "getAlerts", { "getAlerts": true } )
		.then(response => {
			if (response && response.alertingEnvironments) {
				for(let alertingEnvironment of response.alertingEnvironments) {
					let time = new Date(alertingEnvironment.lastAlertTime);
					displayAlert(alertingEnvironment.environment, environmentThresholds.get(alertingEnvironment.environment), time);
				}
			}
		})
	}
	
	/**
		Displays an alerting environment in the top bar
	**/
	var displayAlert = function(environment, threshold, lastAlertTime) {
		if (!document.getElementById(environment)) {
			let title = `No alerts seen in over ${threshold} hours from:\n\n${environment}\n\nLast alert seen at: ${lastAlertTime.toLocaleString('en-GB')}\n\nPlease investigate connectors.\n\nClick to dismiss alert.`
			createHeaderIcon(environment, title, "red", () => { dismissAlert(environment) });
		}
	}
	
	/**
		Sends a dismissAlert message with the given environment
	**/
	var dismissAlert = function(environment) {
		MessagingManager.sendMessage("dismissAlert", { "dismissAlert": environment } );
	}
	
	/**
		Handles receipt of dismissAlert message and removes dismissed environment alerts
	**/
	var handleDismissAlert = function(request, sender, response) {
		if (request.dismissAlert) {
			removeHeaderIcon(request.dismissAlert);
		}
	}
	
	/**
		Removes header icon with provided id, if it exists
	**/
	var removeHeaderIcon = function(id) {
		let li = document.getElementById(id);
		if (li) {
			li.parentNode.removeChild(li);
		}
	}
	
	/**
		Handle checkEnvironments messages by searching for cases for each environment within each environment's threshold
	**/
	var handleCheckEnvironments = function(request, sender, response) {
		if (request.checkEnvironments) {
			if (!location.href.includes(SiemplifyEndpoints.LOGIN_URL)) {
				// TODO: Track progress with promises so we can provide detailed progress updates and exact end time
				lastCheck = new Date().toISOString();
				// Change status icon to display "currently checking" status
				let title = "Currently checking environments."
				createHeaderIcon("detectLastAlertStatus", title, "var(--dark-100)", () => {}, "smp-refresh-bold", "detect-last-alert-rotate");
				// Perform checks
				let i = 0;
				for (let [environment, threshold] of environmentThresholds) {
					setTimeout(searchCases, 5000 * i, environment);
					i++;
				}
				// Revert status icon 
				setTimeout(createStatusIcon, 5000 * i);
				return Promise.resolve({"checkingEnvironments": true});
			}
			else {
				return Promise.resolve({"checkingEnvironments": false});
			}
		}
	}
	
	/**
		Sends search case API call for given environment
	**/
	var searchCases = function(environment) {
		let startDate = new Date();
		startDate.setHours(startDate.getHours() - environmentThresholds.get(environment));
		let startTime = startDate.toISOString();
		let endTime = new Date().toISOString();
		
		let filter = {
			"environments":[environment],
			"startTime":startTime,
			"endTime":endTime,
		};

		let request = new SiemplifyApi.CaseSearchEverythingRequest(filter);
		request.addEventListener("load", () => handleSearchResponse(request, environment));
		request.send();
	}

	/**
		Handle response to searchCases API call.
		Sends either alertingEnvironment or nonAlertingEnvironment depending on if cases were returned.
	**/
	var handleSearchResponse = function(request, environment) {
		var response = request.response;
		if (response) {
			let responseCases = response.results;
			if (responseCases.length == 0) {
				getLastAlertTime(environment);
			}
			else {
				MessagingManager.sendMessage("alertingEnvironment", { "nonAlertingEnvironment": environment } );
			}
		}
	}
	
	var getLastAlertTime = function(environment) {
		let startDate = new Date();
		startDate.setDate(startDate.getDate() - 30);
		let startTime = startDate.toISOString();
		let endTime = new Date().toISOString();
		
		let filter = {
			"environments":[environment],
			"startTime":startTime,
			"endTime":endTime,
			"sortBy": {sortBy: "time", sortOrder: 0},
			"pageSize":1
		};

		let request = new SiemplifyApi.CaseSearchEverythingRequest(filter);
		request.addEventListener("load", () => sendEnvironmentAlert(request, environment));
		request.send();
	}
	
	var sendEnvironmentAlert = function(request, environment) {
		let time = "";
		let response = request.response;
		if (response) {
			if (response.results.length != 0) {
				time = response.results[0].time;
			}
		}
		MessagingManager.sendMessage("alertingEnvironment", { "alertingEnvironment": environment, "lastAlertTime": time} );
	}
	
	return {
		enable: enable,
		disable: disable,
		configChanged: configChanged
	};
	
}());

BaseModule.initModule(DetectLastAlert, "Environment Monitoring");