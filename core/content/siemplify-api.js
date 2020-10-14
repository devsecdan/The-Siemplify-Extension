"use strict";

var SiemplifyApi = (function () {

	var BASE_URL = "https://" + location.host;
	var API_BASE_URL = BASE_URL;

	var _token;
	var _username;

	browser.runtime.onMessage.addListener((request, sender, response) => {
        if (request?.authenticationToken) {
            updateAuthentication(request.authenticationToken);
        }
	});

	/**
	 * Set the API_BASE_URL.
	 * Append API port if set in config.
	 */
	var setApiBaseUrl = async function() {
		let config = await ConfigurationManager.getHostConfig(location.hostname, "general");
		if (config.apiPort) {
			API_BASE_URL = BASE_URL + ":" + config.apiPort;
		}
		else {
			API_BASE_URL = BASE_URL;
		}
	}
	ConfigurationManager.onHostConfigChanged.addListener(location.hostname, "general", setApiBaseUrl);
	
	/**
	 * Update authorisation token
	 * @param {*} newToken 
	 */
	var updateAuthentication = async function(newToken) {
		if (_token !== newToken) {
			_token = newToken;
			// Either set username to null or keep username defined in config
			setFromConfig();
		}
	}

	/**
	 * Gets the username of the currently logged in user.
	 * Only works if top right user profile button is available
	 */
	var getLoggedInUser = async function() {
		if (_username) {
			return Promise.resolve(_username);
		}
		else {
			document.querySelector("smp-action[tnautomationid=profileButton]")?.click();
			let fullname = document.querySelector("div.info > div.name, div.user-box__info--name")?.textContent.trim();
			let lastname = fullname.split(" ").pop();
			let request = new GetUserProfiles(lastname, 50);
			let promise = new Promise((resolve, reject) => {
				request.addEventListener("load", () => {
					let response = request.response;
					if (response) {
						for (let user of response.objectsList) {
							if (fullname.startsWith(user.firstName) && fullname.endsWith(user.lastName)) {
								_username = user.userName;
								resolve(_username);
							}
						}
					}
				});
				request.send();
			});
			return promise;
		}
	}

	/**
	 * Apply config values
	 */
	var setFromConfig = async function() {
		let config = await ConfigurationManager.getHostConfig(location.hostname, "general");
		// Set API port
		if (config.apiPort) {
			API_BASE_URL = BASE_URL + ":" + config.apiPort;
		}
		else {
			API_BASE_URL = BASE_URL;
		}
		// Set username
		_username = config.username;
	}
	ConfigurationManager.onHostConfigChanged.addListener(location.hostname, "general", setFromConfig);
	setFromConfig();

	/**
	 * Get request authorisation token
	 */
	var getToken = async function() {
		if (_token) {
			return _token;
		}
		else {
			_token = await browser.runtime.sendMessage({"getAuthenticationToken": true})
			return _token;
		}
	}

	class SiemplifyRequest extends XMLHttpRequest {
		constructor(method, url, payload) {
			super();
			this.open(method, url);
			this.setRequestHeader("Accept", "application/json, text/plain, */*");
			this.setRequestHeader("Accept-Language", "en-US,en;q=0.9");
			this.setRequestHeader("Content-Type", "application/json");
			this.responseType = "json";
			this.payload = payload;
		}
		
		/**
		 * Sends the request with the payload stored in this.payload
		 */
		async send() {
			try {
				let requestToken = await getToken();
				this.setRequestHeader("Authorization", requestToken);
				// Clear token if 401 is returned to prompt token renewal
				this.addEventListener("load", (request) => {
					if (request.status == 401) {
						_token = "";
					}
				})
				super.send(JSON.stringify(this.payload));
			}
			catch(e) {
				console.log(e);
			}
		}
	}
	
	/**
		Search for Siemplify cases with given filters
		Searches over the past two days by default
	**/
	class CaseSearchEverythingRequest extends SiemplifyRequest {

		constructor(filter) {
			let endDate = new Date();
			let startDate = new Date();
			startDate.setDate(startDate.getDate() - 7);
			let startTime = startDate.toISOString();
			let endTime = endDate.toISOString();
			// Default filters
			let payload = {	
				"assignedUsers": [],
				"caseIds": [],
				"caseSource": [],
				"categoryOutcomes": [],
				"endTime": endTime,
				"environments": [],
				"importance": [],
				"incident": [],
				//"isCaseClosed":false,
				"ports": [],
				"priorities": [],
				"products": [],
				"requestedPage": 0,
				"pageSize": 25,
				"ruleGenerator": [],
				"sortBy": {sortBy: "time", sortOrder: 1},
				"stage": [],
				"startTime": startTime,
				"status": [],
				"tags": [],
				"title": ""
			};
			
			// Apply filters passed to method
			for (let [key, value] of Object.entries(filter)) {
				if (payload[key] != 'undefined') {
					payload[key] = value;
				}
			}
		
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_CASE_SEARCH_EVERYTHING, payload);
		}
	}

	/**
	 * Get Case Cards
	 */
	class GetCaseCardsByRequestRequest extends SiemplifyRequest {
		constructor(liveQueueSettings = null, sortType = 1, pageSize = 0, pageNumber = 0) {
			if (!liveQueueSettings) {
				liveQueueSettings = {
					analysts: [],
					endTimeUnixTimeInMs: -1,
					environments: [],
					priorities: [],
					stages: [],
					startTimeUnixTimeInMs: 0,
					tags: []
				}
			}

			let payload = {
				liveQueueSettings: liveQueueSettings,
				sortType: Number(sortType),
				pageSize: Number(pageSize),
				pageNumber: Number(pageNumber)
			}

			super("POST", API_BASE_URL+SiemplifyEndpoints.API_GET_CASE_CARDS_BY_REQUEST, payload);
		}
	}
	
	/**
		Bulk assign given case IDs to given user
	**/
	class ExecuteBulkAssignRequest extends SiemplifyRequest {
		constructor(username, caseIds) {
			let payload = {
				casesIds: caseIds,
				userName: username
			}

			super("POST", API_BASE_URL+SiemplifyEndpoints.API_EXECUTE_BULK_ASSIGN, payload);
		}
	}

	/**
	 * Returns the entity data associated with the given entity
	 */
	class GetEntityDataRequest extends SiemplifyRequest {
		constructor(entityIdentifier, entityEnvironment) {
			let payload = {
				caseDistributationType: 0,
				lastCaseType: 0,
				entityIdentifier: entityIdentifier,
				entityEnvironment: entityEnvironment
			}
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_GET_ENTITY_DATA, payload);
		}
	}

	/**
	 * Search Siemplify users
	 */
	class GetUserProfiles extends SiemplifyRequest {
		constructor(searchTerm, pageSize = 20, requestedPage = 0, shouldHideDisabledUsers = true) {
			let payload = {
				searchTerm: searchTerm,
				pageSize: pageSize,
				requestedPage: requestedPage,
				shouldHideDisabledUsers: shouldHideDisabledUsers
			}
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_GET_USER_PROFILES, payload);
		}
	}


	return {
		BASE_URL: BASE_URL,

		getUsername: getLoggedInUser,

		CaseSearchEverythingRequest: CaseSearchEverythingRequest,
		ExecuteBulkAssignRequest: ExecuteBulkAssignRequest,
		GetEntityDataRequest: GetEntityDataRequest,
		GetUserProfiles: GetUserProfiles,
		GetCaseCardsByRequestRequest: GetCaseCardsByRequestRequest
	};
	
}());