"use strict";

class DetectLastAlert extends BackgroundModule {
	
	static metadata = {
		name: "Environment Monitoring",
		category: "Monitoring",
		description: "Monitor last seen case from each environment and alert if an environment hasn't produced a case within a given threshold.",
		configHtmlFile: "Detect Last Alert/config.part.html",
		defaultConfig: {
			recheckRate: 60
		},
		contentScripts: ["Detect Last Alert/detect-last-alert.js"]
	}

	
	
	constructor(host) {
		super(host, DetectLastAlert.metadata.name);
		
		this.dismissedEnvironments = new Set();
		this.alertingEnvironments = new Set();
		this.retryRate = 5; // Minutes before retrying, in case content script wasn't loaded on last attempt

		this.boundStartChecks = (alarm) => this.startChecks.bind(this, alarm)();
		this.boundGetAlerts = (request, sender, response) => this.getAlerts.bind(this, request, sender, response)();
		this.boundHandleAlertingEnvironmentResponses = (request, sender, response) => this.handleAlertingEnvironmentResponses.bind(this, request, sender, response)();
		this.boundHandleAlertDismissals = (request, sender, response) => this.handleAlertDismissals.bind(this, request, sender, response)();
	}

	enable() {
		this.addListeners();
		this.setAlarm(this.retryRate);
		this.startChecks({ "name": "DetectLastAlert" });
	};
	
	disable() {
		this.removeListeners();
		browser.alarms.clear('DetectLastAlert');
		this.alertingEnvironments.clear();
		this.dismissedEnvironments.clear();
	};

	configChanged(oldConfig, newConfig) {
		browser.alarms.clear('DetectLastAlert');
		this.setAlarm(this.retryRate);
	}
	
	setAlarm(period) {
		browser.alarms.clear('DetectLastAlert');
		browser.alarms.create('DetectLastAlert', { periodInMinutes: parseInt(period) });
	}
	
	addListeners() {
		if (!browser.alarms.onAlarm.hasListener(this.boundStartChecks)) browser.alarms.onAlarm.addListener(this.boundStartChecks)
		if (!browser.runtime.onMessage.hasListener(this.boundGetAlerts)) browser.runtime.onMessage.addListener(this.boundGetAlerts)
		if (!browser.runtime.onMessage.hasListener(this.boundHandleAlertingEnvironmentResponses)) browser.runtime.onMessage.addListener(this.boundHandleAlertingEnvironmentResponses)
		if (!browser.runtime.onMessage.hasListener(this.boundHandleAlertDismissals)) browser.runtime.onMessage.addListener(this.boundHandleAlertDismissals)
	}

	removeListeners() {
		browser.alarms.onAlarm.removeListener(this.boundStartChecks);
		browser.runtime.onMessage.removeListener(this.boundGetAlerts);
		browser.runtime.onMessage.removeListener(this.boundHandleAlertingEnvironmentResponses);
		browser.runtime.onMessage.removeListener(this.boundHandleAlertDismissals);
	}
	
	/**
		Handle getAlerts requests
	**/
	getAlerts(request, sender, response) {
		if (request.getAlerts) {
			return Promise.resolve({"alertingEnvironments": Array.from(this.alertingEnvironments) });
		}
	}

	/**
		Start environement checks for all hosts
	**/
	async startChecks(alarm) {
		if (alarm.name == "DetectLastAlert") {
			this.startHostChecks(this.host);
		}
		else {
			this.setAlarm(this.retryRate);
		}
	}
	
	/**
		Start environement checks for specified host
	**/
	async startHostChecks(host) {
		let tabs = await browser.tabs.query( {url: "https://" + host + "/*"})
		for(let tab of tabs) {
			if (!tab.url.includes("swagger") && !tab.url.includes(SiemplifyEndpoints.LOGIN_URL)) {
				browser.tabs.sendMessage(tab.id, {"checkEnvironments": true })
				.then(response => {
					if (response && response.checkingEnvironments) {
						this.setAlarm(this.config.recheckRate);
					}
					else {
						this.setAlarm(this.retryRate);
					}
				})
				.catch(() => {});
				break;
			}
		}
	}
	
	/**
		Handle environment check responses
	**/
	handleAlertingEnvironmentResponses(request, sender, response) {
		if (request.alertingEnvironment) {
			if (!this.dismissedEnvironments.has(request.alertingEnvironment) && !this.environmentIsAlerting(request.alertingEnvironment)) {
					console.log("Alerting Environment:", request.alertingEnvironment);
					this.alertingEnvironments.add({environment:request.alertingEnvironment, lastAlertTime:request.lastAlertTime});
					
					// Send alert to tabs
					browser.tabs.query({})
					.then(tabs => {
						for (let i = 0; i<tabs.length; i++) {
							browser.tabs.sendMessage(tabs[i].id, { alertingEnvironment: request.alertingEnvironment, lastAlertTime: request.lastAlertTime})
							.catch(() => {});
						}
					});
			}
		} else if (request.nonAlertingEnvironment) {
			this.removeAlert(request.nonAlertingEnvironment);
		}
	}
	
	/**
		Handle dismissal of alerts
	**/
	handleAlertDismissals(request, sender, response) {
		if (request.dismissAlert) {
			this.dismissAlert(request.dismissAlert);
		}
	};
	
	/**
		Add an environment to the this.dismissedEnvironments set, then remove alert
	**/
	dismissAlert(environment) {
		console.log("Dismiss alert:", environment);
		this.dismissedEnvironments.add(environment);
		this.removeAlert(environment);
	}
	
	/**
		Removes an environment from the this.alertingEnvironments set and sends dismissAlert to tabs
	**/
	async removeAlert(environment) {
		let alertingEnvironment = this.environmentIsAlerting(environment);
		if (alertingEnvironment) {
			this.alertingEnvironments.delete(alertingEnvironment);
		}
		let tabs = await browser.tabs.query({});
		for (let i = 0; i<tabs.length; i++) {
			browser.tabs.sendMessage(tabs[i].id, { "dismissAlert": environment })
			.catch(() => {});
		}
	}
	
	/**
		Checks if a given environment is currently alerting
	**/
	environmentIsAlerting(environment) {
		for (let alertingEnvironment of this.alertingEnvironments) {
			if (alertingEnvironment.environment === environment) {
				return alertingEnvironment;
			}
		}
		return false;
	}
}

ModuleManager.registerModule(DetectLastAlert);