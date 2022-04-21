"use strict";

var QuickCopy = (function () {
	var contextTitleSelector = ["div.name", "div.value"];
	var entityContainerSelector = ".entity-container";
	var entityListSelector = ".entity-list-item";
	var nameSelector = "div.name";
	var valueSelector = "div.value";

	var titleObserver;

	var enable = function () {
		document.addEventListener("keyup", onkeyup);
		document.addEventListener("keydown", onkeydown);

		//titleObserver = new PersistentObserver(contextTitleSelector, { characterData: true }, handleContextTitleSummaries, handleContextTitleAttach);
		//ElementObserver.observe([entityContainerSelector, entityListSelector], handleEntitySummary);
		ElementObserver.observe([nameSelector, valueSelector], handleTableSummary);

		//let title = document.querySelector(contextTitleSelector);
		//if (title) title.addEventListener("click", copyContextTitleHandler);
		//document.querySelectorAll(entityContainerSelector+','+entityListSelector).forEach(entity => addEntityClickHandler(entity));
		document.querySelectorAll(nameSelector+","+valueSelector).forEach(field => addTableClickHandler(field));
	};
	
	var disable = function () {
		//titleObserver.disconnect();
		//ElementObserver.stop(handleEntitySummary);
		ElementObserver.stop(handleTableSummary);

		document.removeEventListener("keyup", onkeyup);
		document.removeEventListener("keydown", onkeydown);

		//let title = document.querySelector(contextTitleSelector);
		//if (title) title.removeEventListener("click", copyContextTitleHandler);
	};

	// ======================= Case name copy handler =======================
	var handleContextTitleAttach = function(summary) {
		summary.added.forEach(title => {
			setTimeout(() => {
				title.addEventListener("click", copyContextTitleHandler);
			}, 0);
		});
	}

	var handleContextTitleSummaries = function(summaries) {
		let summary = summaries[0];
		summary.valueChanged.forEach(title => {
			setTimeout(() => {
				title.addEventListener("click", copyContextTitleHandler);
			}, 0);
		});
	}

	/**
		Copy handler for context title
		this -> clicked element
	**/
	var copyContextTitleHandler = function() {
		copyToClipboard(this.textContent);
		this.style = "font-size:90% !important;"
		setTimeout(() => {this.style = ""}, 500);
	};

	// ======================= Entity copy handler =======================
	var handleEntitySummary = function(summary) {
		summary.added.forEach(entity => {
			addEntityClickHandler(entity);
		})
	}

	var addEntityClickHandler = function(entity) {
		setTimeout(() => {
			let entityIcon = entity.querySelector("div.entity-svg");
			let entityText = entity.querySelector("a");
			if (entityIcon && entityText) {
				entityIcon.addEventListener("click", entityClickHandler.bind(null, entityText));
			}
		}, 0);
	}

	var entityClickHandler = function(entityText) {
		copyToClipboard(entityText.innerText);
		if (entityText.firstElementChild?.nodeName)
			entityText = entityText.firstElementChild;
		entityText.style = "font-size:90% !important;"
		setTimeout(() => {entityText.style = ""}, 500);
	}

	// ======================= Table field copy handler =======================
	var handleTableSummary = function(summary) {
		summary.added.forEach(field => {
			addTableClickHandler(field);
		})
	}

	var addTableClickHandler = function(field) {
		setTimeout(() => {
			field.addEventListener("click", tableClickHandler.bind(null, field));
		}, 0);
	}

	var tableClickHandler = function(field) {
		if (!ctrlIsDown) {
			copyToClipboard(field.innerText);
			field.style = "font-size:90% !important;"
			setTimeout(() => {field.style = ""}, 500);
		}
	};

	var copyToClipboard = function(text) {
		let temp = document.createElement("textarea");
		document.body.appendChild(temp);
		temp.value = text;
		temp.select();
		document.execCommand("copy");
		document.body.removeChild(temp);
	}
	
	// Track state of Ctrl
	let ctrlIsDown = false;
	
	var onkeydown = function(e) {
		if (e.which == 17) {
			ctrlIsDown = true;
		}
	}
	
	var onkeyup = function(e) {
		if (e.which == 17) {
			ctrlIsDown = false;
		}
	}
	
	return {
		enable: enable,
		disable: disable
	};
	
}());

BaseModule.initModule(QuickCopy, "Quick Copy");