"use strict";

import BackgroundModule from "/core/background/background-module.js"
import ModuleManager from "/core/background/module-manager.js"
import MessagingManager from "/core/background/messaging-manager.js"

class DetectLastAlert extends BackgroundModule {
		
	constructor(host) {
		super(host, DetectLastAlert.metadata.siemplifyVersion, DetectLastAlert.metadata.name);
		
		this.dismissedEnvironments = new Set();
		this.alertingEnvironments = new Set();
		this.retryRate = 5; // Minutes before retrying, in case content script wasn't loaded on last attempt
		this.alertName = `DetectLastAlert${host}`;

		this.boundStartChecks = (alarm) => this.startChecks.bind(this, alarm)();
		this.boundGetAlerts = (request, sender, response) => this.getAlerts.bind(this, request, sender, response)();
		this.boundHandleAlertingEnvironmentResponses = (request, sender, response) => this.handleAlertingEnvironmentResponses.bind(this, request, sender, response)();
		this.boundHandleAlertDismissals = (request, sender, response) => this.handleAlertDismissals.bind(this, request, sender, response)();
	}

	enable() {
		this.addListeners();
		this.setAlarm(this.retryRate);
		this.startChecks({ "name": this.alertName });
	};
	
	disable() {
		this.removeListeners();
		browser.alarms.clear(this.alertName);
		this.alertingEnvironments.clear();
		this.dismissedEnvironments.clear();
	};

	configChanged(oldConfig, newConfig) {
		browser.alarms.clear(this.alertName);
		this.setAlarm(this.retryRate);
	}
	
	setAlarm(period) {
		browser.alarms.clear(this.alertName);
		browser.alarms.create(this.alertName, { periodInMinutes: parseInt(period) });
	}
	
	addListeners() {
		if (!browser.alarms.onAlarm.hasListener(this.boundStartChecks)) browser.alarms.onAlarm.addListener(this.boundStartChecks)
		if (!MessagingManager.hasListener(this.host, "getAlerts", this.boundGetAlerts)) MessagingManager.addListener(this.host, "getAlerts", this.boundGetAlerts)
		if (!MessagingManager.hasListener(this.host, "alertingEnvironment", this.boundHandleAlertingEnvironmentResponses)) MessagingManager.addListener(this.host, "alertingEnvironment", this.boundHandleAlertingEnvironmentResponses)
		if (!MessagingManager.hasListener(this.host, "dismissAlert", this.boundHandleAlertDismissals)) MessagingManager.addListener(this.host, "dismissAlert", this.boundHandleAlertDismissals)
	}

	removeListeners() {
		browser.alarms.onAlarm.removeListener(this.boundStartChecks);
		MessagingManager.removeListener(this.host, "getAlerts", this.boundGetAlerts);
		MessagingManager.removeListener(this.host, "alertingEnvironment", this.boundHandleAlertingEnvironmentResponses);
		MessagingManager.removeListener(this.host, "dismissAlert", this.boundHandleAlertDismissals);
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
		if (alarm.name == this.alertName) {
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
				MessagingManager.sendMessage(tab.id, "checkEnvironments", {"checkEnvironments": true })
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
					browser.tabs.query({url: `https://*.${this.host}/*`})
					.then(tabs => {
						for (let i = 0; i<tabs.length; i++) {
							MessagingManager.sendMessage(tabs[i].id, "alertingEnvironment", { alertingEnvironment: request.alertingEnvironment, lastAlertTime: request.lastAlertTime})
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
			MessagingManager.sendMessage(tabs[i].id, "dismissAlert", { "dismissAlert": environment })
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

DetectLastAlert.metadata = {
	name: "Environment Monitoring",
	category: "Monitoring",
	siemplifyVersion: "6",
	description: "Monitor last seen case from each environment and alert if an environment hasn't produced a case within a given threshold.",
	configHtmlFile: "Detect Last Alert/config.part.html",
	defaultConfig: {
		recheckRate: 60
	},
	contentScripts: ["Detect Last Alert/detect-last-alert.js"]
}

ModuleManager.registerModule(DetectLastAlert);

export default DetectLastAlert;