"use strict";

var EntityEnrichment = (function () {

	let entityContainerSelectors = ["div.entity-container", "div.entity-list-item"];
	let entityValueSelector = ".simp-highlight__source,span.u-ellipsis";
	let headerSelector = "div.description-case";

	let requests = new Map();

	let ignorelist = [];

	var enable = function () {
		clearRequestsCache();
		poupulateIgnorelist(this.config)
		CaseListHelper.onCaseChanged.addListener(clearRequestsCache);
		ElementObserver.observe(entityContainerSelectors, handleEntitySummary);
		enrichCurrentEntities();
	};
	
	var disable = function () {
		clearRequestsCache();
		CaseListHelper.onCaseChanged.removeListener(clearRequestsCache);
		ElementObserver.stop(handleEntitySummary);
		document.querySelectorAll(".entity_enrichment").forEach(enrichment => {
			enrichment.parentNode.removeChild(enrichment);
		})
	};

	var configChanged = function(oldConfig, newConfig) {
		poupulateIgnorelist(newConfig);
	}

	/**
	 * Populate, from config, the list of entities not to be enriched
	 * @param {*} config 
	 */
	var poupulateIgnorelist = function(config) {
		ignorelist = [];
		if (config.ignorelist) {
			for (let entry of config.ignorelist) {
				ignorelist.push(entry.entityName);
			}
		}
	}

	var clearRequestsCache = function() {
		requests.clear();
	}

	/**
	 * Enrich all entities currently on screen
	 */
	var enrichCurrentEntities = function() {
		// Combine container selectors to query for all entities and pass to enrichEntities function
		document.querySelectorAll(entityContainerSelectors.reduce((acc, cur) => `${acc}, ${cur}`)).forEach(entity => {
			enrichEntities(entity);
		});
	}

	var handleEntitySummary = function(summary) {
		summary.added.forEach(entity => {
			enrichEntities(entity)
		});
	}

    var enrichEntities = function(entity) {
		try {
			// Stop if enrichment already added
			if (entity.getElementsByClassName("entity_enrichment").length !== 0) return;

			let value = entity.querySelector(entityValueSelector).textContent;

			// Stop if entity is in blacklist
			if (ignorelist.includes(value)) return;

			// Get case environment
			let headerDescription = document.querySelector(headerSelector);
			let environment = "";
			if (headerDescription) {
				let headerText = headerDescription.textContent;
				let match = headerText.match(/\| Environment: (.*)$/);
				if (match) {
					environment = match[1];
				}
			}

			if(value && value.length > 0 && environment) {
				let identifier = (value+environment).toUpperCase();
				// Check for existing request
				let request = requests.get(identifier);
				if (request) {
					if (request.readyState === XMLHttpRequest.DONE) {
						// Finished request exists
						handleResponse(request, entity);
					}
					else {
						// Request is in progress
						request.addEventListener("load", () => handleResponse(request, entity));
					}
				}
				else {
					// Send new request
					request = new SiemplifyApi.GetEntityDataRequest(value, environment);
					requests.set(identifier, request);
					request.addEventListener("load", () => handleResponse(request, entity));
					request.send();
				}
			}
		} catch(e) {
			console.error(e);
			return;
		}
	}
	
	var handleResponse = function(request, entity) {
		let response = request.response;
		if (response?.entity) {
			let identifier = (response.entity.identifier + response.entity.environment).toUpperCase();
			handleEntityData(identifier, response, entity);
		}
		else {
			console.log("Entity Enrichment received invalid response", response);
		}
	}

    var handleEntityData = function(identifier, response, entity) {
		let tooltipText = createCaseNumberBox(response, entity);
		tooltipText += "\n\n";
		tooltipText += createCaseCommentBox(response, entity);
		createTooltip(tooltipText, entity);
	}

	// ======================== ELEMENT CREATION ========================
	var createCaseNumberBox = function(response, entity) {
		let numberCases = response.totalCasesAmount;
		let numberMaliciousCases = response.maliciousCasesAmount;
		
		let textString = CreateCaseNumberBoxText(response, numberCases, numberMaliciousCases);

		let colour = "#1f87be";
		if (numberMaliciousCases > 0) {
			colour = "darkred";
		}
		else if (numberCases <= 1) {
			colour = "darkorange";
		}

		let numberRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		numberRect.setAttribute("fill", colour);
		numberRect.setAttribute("x", "0");
		numberRect.setAttribute("y", "35");
		numberRect.setAttribute("width", "15");
		numberRect.setAttribute("height", "15");
		numberRect.setAttribute("class", "entity_enrichment");
		let numberRectTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
		numberRectTitle.textContent = textString;
		numberRect.append(numberRectTitle);
		
		let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.setAttribute("x", 2);
		text.setAttribute("y", 48);
		text.setAttribute("fill", "white");
		let style = "font: 15px sans-serif;pointer-events: none;";
		text.setAttribute("style", style);
		text.setAttribute("class", "entity_enrichment");
		text.textContent = numberCases > 9 ? "9+" : numberCases;

		let svg = entity.getElementsByTagName("svg")[0];
		svg.append(numberRect);
		svg.append(text);

		return textString;
	}

	var CreateCaseNumberBoxText = function(response, numberCases, numberMaliciousCases) {
		let textString = "";

		if (numberCases === 1) return "Not previously seen.";

		let maliciousCases = response.lastCaseDetails.filter(sCase => sCase.closeReason === 0);

		if (maliciousCases.length > 0) {
			let lastMaliciousCase = maliciousCases[0];
			let time = new Date(lastMaliciousCase.creationTime);
			maliciousCases.forEach(mCase => {
				let mCaseDate = new Date(mCase.creationTime);
				if (mCaseDate > time) time = mCaseDate; lastMaliciousCase = mCase;
			})
			let title = lastMaliciousCase.title;
			let id = lastMaliciousCase.id;
			
			textString += `Last malicious case: \n${time.toUTCString()}\n${title}\n${id}\n\n`;
		}

		let caseDistribution = new Map();
		for (let sCase of response.lastCaseDetails) {
			let mapEntry = caseDistribution.get(sCase.title);
			if (typeof mapEntry === 'undefined') {
				mapEntry = 0;
			}
			mapEntry++;
			caseDistribution.set(sCase.title, mapEntry);
		}
		textString += "Case distribution:\n";
		caseDistribution.forEach((count, title) => textString += `${count} - ${title}\n` );
		textString += `${numberCases} - Total`;

		return textString;
	}

	var createCaseCommentBox = function(response, entity) {
		let noteString = "";
		let notes = response.notes.map(note => {return {author: note.author, content: note.content, time: new Date(note.creationTimeUnixTimeInMs)}})
		if (notes.length > 0) {
			noteString = "Comments:\n";
			for (let note of notes) {
				noteString += `${note.time.toUTCString()} - ${note.author}:\n\n${note.content}\n\n`;
			}
			noteString.trim();

			let noteRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			noteRect.setAttribute("fill", "#1f87be");
			noteRect.setAttribute("x", "35");
			noteRect.setAttribute("y", "35");
			noteRect.setAttribute("width", "15");
			noteRect.setAttribute("height", "15");
			noteRect.setAttribute("class", "entity_enrichment");
			let numberRectTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
			numberRectTitle.textContent = noteString;
			noteRect.append(numberRectTitle);

			let bars = document.createElementNS("http://www.w3.org/2000/svg", "text");
			bars.setAttribute("x", 37);
			bars.setAttribute("y", 50);
			bars.setAttribute("fill", "white");
			let style = "font: bold 19px sans-serif;pointer-events: none;";
			bars.setAttribute("style", style);
			bars.setAttribute("class", "entity_enrichment");
			bars.textContent = "\u2261";

			let svg = entity.getElementsByTagName("svg")[0];
			svg.append(noteRect);
			svg.append(bars);
		}
		return noteString;
	}

	var createTooltip = function(tooltipText, entity) {
		let entityTitle = document.createElementNS("http://www.w3.org/2000/svg", "title");
		entityTitle.textContent = tooltipText;
		entityTitle.setAttribute("class", "entity_enrichment");
		let svg = entity.getElementsByTagName("svg")[0];
		svg.append(entityTitle);
	}
	
	return {
		enable: enable,
		disable: disable,
		configChanged: configChanged
	};
	
}());

BaseModule.initModule(EntityEnrichment, "Entity Enrichment");