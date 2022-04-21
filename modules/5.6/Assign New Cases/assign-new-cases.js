"use strict";

var AssignNewCases = (function () {

	let caseListActionGroupSelector = "case-queue-header .simp-button-group";
	let refreshListButtonSelector = "button[smptooltip=\"Refresh List\"]";

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
				let button = document.createElement("button");
				button.setAttribute("id", "assignCaseButton");
				button.setAttribute("class", "appearance--ghost color--default size--small shape--round icon-left icon-btn simp-transition");
				button.setAttribute("title", `Assign ${AssignNewCases.config.casesToAssign} New Cases`);
				button.setAttribute("smpbutton", "");
				button.setAttribute("smptooltip", `Assign ${AssignNewCases.config.casesToAssign} New Cases`);
				button.setAttribute("iconbutton", "");
				button.setAttribute("size", "small");
				button.setAttribute("icon", "assign");
				button.setAttribute("tabindex", "0");
				button.addEventListener("click", searchCases);

				/*
				let a = document.createElement("a");
				a.setAttribute("href", "javascript:void(0);");
				a.addEventListener("click", searchCases);
				button.appendChild(a);
				*/
				let smpicon = document.createElement("smp-icon");
				smpicon.setAttribute("class", "ng-star-inserted");

				let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
				svg.setAttribute("width", "100%");
				svg.setAttribute("height", "100%");
				svg.setAttribute("viewBox", "0 0 24 24");
				svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
				svg.setAttribute("fill", "currentColor");

				let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("d", "M6 6H10V4H4V10H6V6Z");
				svg.appendChild(path);
				path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("d", "M10 18H6V14H4V20H10V18Z");
				svg.appendChild(path);
				path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("d", "M14 6H18V10H20V4H14V6Z");
				svg.appendChild(path);
				path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("d", "M14 18H18V14H20V20H14V18Z");
				svg.appendChild(path);
				path = document.createElementNS("http://www.w3.org/2000/svg", "path");
				path.setAttribute("d", "M12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5Z");
				svg.appendChild(path);

				smpicon.appendChild(svg);
				button.appendChild(smpicon);

				let icons = document.querySelector(caseListActionGroupSelector);
				let firstChild = icons.children[0];
				icons.insertBefore(button, firstChild);
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