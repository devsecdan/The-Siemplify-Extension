"use strict";

var AssignNewCases = (function () {

	let caseListActionGroupSelector = "case-queue-header .simp-action-group";
	let refreshListButtonSelector = "smp-action[tnautomationid=refreshList]";

	var lastUsed = new Date(0);
	
	var enable = function () {
		ElementObserver.observe("case-queue-header", createButton);
		if (document.querySelector("case-queue-header")) {
			createButton(this.config.casesToAssign);
		}
	};
	
	var disable = function () {
		let button = document.getElementById("assignCaseButton");
		if (button) {
			button.parentNode.removeChild(button);
		}
	};

	var configChanged = function() {
		let assignCaseButton = document.getElementById("assignCaseButton");
		if (assignCaseButton) {
			assignCaseButton.setAttribute("title", `Assign ${this.config.casesToAssign} New Cases`);
		}
	}
	
	/**
	 * Create Assign Cases button in case list header
	 */
	var createButton = function() {
		try {
			if (location.href.includes(SiemplifyEndpoints.CASES_URL) && !document.getElementById("assignCaseButton")) {		
				let action = document.createElement("smp-action");
				action.setAttribute("id", "assignCaseButton");
				action.setAttribute("class", "simp-action simp-action__color--primary simp-action__size--small");
				action.setAttribute("title", `Assign ${AssignNewCases.config.casesToAssign} New Cases`);
				
				let a = document.createElement("a");
				a.setAttribute("href", "javascript:void(0);");
				a.addEventListener("click", searchCases);
				action.appendChild(a);
				
				let i = document.createElement("i");
				i.setAttribute("class", "smp-user-icon");
				a.appendChild(i);

				let icons = document.querySelector(caseListActionGroupSelector);
				let firstChild = icons.children[0];
				icons.insertBefore(action, firstChild);
			}
		} catch(e) {
			console.error(e);
		}
	}
	
	/**
	 * Get a list of [casesToAssign] number of cases
	 */
	var searchCases = async function() {
		let now = new Date();
		if (now.getTime() - lastUsed.getTime() > 10000) {
			document.getElementById("assignCaseButton").children[0].children[0].setAttribute("style", "color:orange;");
			lastUsed = now;
			let user = await SiemplifyApi.getUsername();

			let liveQueueSettings = {
				analysts: ["@Tier1", user],
				endTimeUnixTimeInMs: -1,
				environments: [],
				priorities: [],
				stages: [],
				startTimeUnixTimeInMs: 0,
				tags: []
			}
		
			let casesToAssign = AssignNewCases.config.casesToAssign;
			let sortType = AssignNewCases.config.sortType;
			let request = new SiemplifyApi.GetCaseCardsByRequestRequest(liveQueueSettings, sortType, casesToAssign, 0);
			request.addEventListener("load", () => handleSearchResponse(request));
			request.addEventListener("abort", () => handleAssignErrorResponse(request));
			request.addEventListener("error", () => handleAssignErrorResponse(request));
			request.send();
		}
	}
	
	/**
	 * Assign returned cases to user
	 * @param {*} request 
	 */
	var handleSearchResponse = async function(request) {
		let loggedInUser = await SiemplifyApi.getUsername();
		
		var response = request.response;
		if (response) {
			let caseIds = [];
			let responseCases = response.caseCards;
			for (const responseCase of responseCases) {
				if (responseCase.assignedUserName != loggedInUser)
				caseIds.push(responseCase.id);
			}
			
			if (caseIds.length != 0) {
				let request = new SiemplifyApi.ExecuteBulkAssignRequest(loggedInUser, caseIds);
				request.addEventListener("load", () => handleAssignResponse(request));
				request.addEventListener("abort", () => handleAssignErrorResponse(request));
				request.addEventListener("error", () => handleAssignErrorResponse(request));
				request.send();
			}
			else {
				document.getElementById("assignCaseButton").children[0].children[0].removeAttribute("style");
			}
		}
	}
	
	var handleAssignResponse = function() {
		document.getElementById("assignCaseButton").children[0].children[0].setAttribute("style", "color:limegreen;");
		setTimeout(() => document.getElementById("assignCaseButton").children[0].children[0].removeAttribute("style"), 1000);
		document.querySelector(refreshListButtonSelector).click();
	}
	
	var handleAssignErrorResponse = function() {
		document.getElementById("assignCaseButton").children[0].children[0].setAttribute("style", "color:red;");
		setTimeout(() => document.getElementById("assignCaseButton").children[0].children[0].removeAttribute("style"), 1000);
		document.querySelector(refreshListButtonSelector).click();
	}
	
	return {
		enable: enable,
		disable: disable,
		configChanged: configChanged
	};
	
}());

BaseModule.initModule(AssignNewCases, "Assign New Cases");