"use strict";

var SiemplifyApi = (function () {

	var BASE_URL = "https://" + location.host;
	var API_BASE_URL = BASE_URL;

	var _token;
	var _username;

	MessagingManager.addListener("authenticationToken", (request) => {
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
			document.querySelector("tn-user-avatar")?.click();
			let fullname = document.querySelector("tn-user-card div.name")?.textContent.trim();
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
			_token = await MessagingManager.sendMessage("getAuthenticationToken", {"getAuthenticationToken": true})
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
					if (request.target.status == 401) {
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
				"isCaseClosed": null,
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
				"timeRangeFilter": 0,
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

	/**
	 * Get Playbooks
	 */
	class GetPlaybooks extends SiemplifyRequest {
		constructor() {
			let payload = [0,1];
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_GET_WORKFLOW_MENU_CARDS, payload);
		}
	}

	/**
	 * Get Playbook Data
	 */
	class GetPlaybookData extends SiemplifyRequest {
		constructor(identifier) {
			super("GET", API_BASE_URL+SiemplifyEndpoints.API_GET_WORKFLOW_FULL_INFO_BY_IDENTIFIER+identifier);
		}
	}

	/**
	 * Save Playbook
	 */
	class SavePlaybook extends SiemplifyRequest {
		constructor(playbook) {
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_SAVE_WORKFLOW_DEFINITIONS, playbook);
		}
	}

	/**
	 * Get Playbooks Using Blocks
	 */
	 class SavePlaybookVersion extends SiemplifyRequest {
		constructor(playbookIdentifier, comment="") {
			let payload = {
				"identifier": playbookIdentifier,
				"comment": comment
			}
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_SAVE_LOG_VERSION_OF_WORKFLOW_DEFINITIONS, payload);
		}
	}

	/**
	 * Get Playbooks Using Blocks
	 */
	class GetPlaybooksUsingBlocks extends SiemplifyRequest {
		constructor(blocks) {
			let payload = {
				blockIdentifiers: blocks
			}
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_GET_PLAYBOOKS_USING_BLOCKS, payload);
		}
	}

	/**
	 * Get Playbooks Using Blocks
	 */
	class GetCaseFullDetails extends SiemplifyRequest {
		constructor(caseId) {
			super("GET", API_BASE_URL+SiemplifyEndpoints.API_GET_CASE_FULL_DETAILS+caseId);
		}
	}

	/**
	 * Save Simulation Data As Simulated Case
	 */
	class SaveSimulatedCase extends SiemplifyRequest {
		constructor(simulationData) {
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_CREATE_SIMULATED_CUSTOM_CASE, simulationData);
		}
	}

	/**
	 * Import .case file json
	 */
	class ImportSimulatedCase extends SiemplifyRequest {
		constructor(simulationData) {
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_IMPORT_CUSTOM_CASE, simulationData);
		}
	}

	/**
	 * Get connectors data
	 */
	class GetConnectorsData extends SiemplifyRequest {
		constructor() {
			super("GET", API_BASE_URL+SiemplifyEndpoints.API_GET_CONNECTORS_DATA);
		}
	}

	/**
	 * Save local usecase
	 */
	class AddOrUpdateLocalUsecase extends SiemplifyRequest {
		constructor(payload) {
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_ADD_OR_UPDATE_LOCAL_USECASE, payload);
		}
	}

	/**
	 * Export Usecase
	 */
	class ExportUsecase extends SiemplifyRequest {
		constructor(payload) {
			super("POST", API_BASE_URL+SiemplifyEndpoints.API_EXPORT_USECASE, payload);
		}
	}

	/**
	 * Get Siemplify system versionn
	 */
	class GetSystemVersion extends SiemplifyRequest {
		constructor() {
			super("GET", API_BASE_URL+SiemplifyEndpoints.API_GET_SYSTEM_VERSION);
		}
	}
	

	return {
		BASE_URL: BASE_URL,

		getUsername: getLoggedInUser,

		CaseSearchEverythingRequest: CaseSearchEverythingRequest,
		ExecuteBulkAssignRequest: ExecuteBulkAssignRequest,
		GetEntityDataRequest: GetEntityDataRequest,
		GetUserProfiles: GetUserProfiles,
		GetCaseCardsByRequestRequest: GetCaseCardsByRequestRequest,
		GetPlaybooks: GetPlaybooks,
		GetPlaybookData: GetPlaybookData,
		SavePlaybook: SavePlaybook,
		SavePlaybookVersion: SavePlaybookVersion,
		GetPlaybooksUsingBlocks: GetPlaybooksUsingBlocks,
		GetCaseFullDetails: GetCaseFullDetails,
		SaveSimulatedCase: SaveSimulatedCase,
		ImportSimulatedCase: ImportSimulatedCase,
		GetConnectorsData: GetConnectorsData,
		AddOrUpdateLocalUsecase: AddOrUpdateLocalUsecase,
		ExportUsecase: ExportUsecase,
		GetSystemVersion: GetSystemVersion
	};
	
}());