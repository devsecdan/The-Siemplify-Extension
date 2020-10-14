"use strict";

var CaseIDSearch = (function () {

	var enable = function () {
		ElementObserver.observe(".header-actions-list", handleSummary);
		let topbarMenu = document.querySelector(".header-actions-list");
		if (topbarMenu) {
			createElement(topbarMenu);
		}
	};
	
	var disable = function () {
		ElementObserver.stop(handleSummary);
		let element = document.getElementById("quickCaseSearch");
		if (element) {
			element.parentNode.removeChild(element);
		}
	};

	var handleSummary = function(summary) {
		summary.added.forEach(topbarMenu => {
			createElement(topbarMenu);
		})
	}
	
	var createElement = function(topbarMenu) {
		if  (location.href.startsWith(SiemplifyApi.BASE_URL) && !location.href.includes(SiemplifyEndpoints.LOGIN_URL)) {
			if (!document.getElementById("quickCaseSearch")) {
				// li
				let smpaction = document.createElement("smp-action");
				smpaction.setAttribute("id", "quickCaseSearch");
				smpaction.setAttribute("class", "simp-action simp-action__color--default simp-action__size--small simp-context-menu ng-star-inserted");
				// Form
				let form = document.createElement("form");
				form.setAttribute("target", "_blank");
				form.addEventListener("submit", openTab);
				smpaction.appendChild(form);
				
				// Text input
				let caseId = document.createElement("input");
				caseId.setAttribute("class", "tn-search__input ng-pristine ng-valid simp-input--full-width simp-input simp-input__size--small simp-input__color--default");
				caseId.setAttribute("name", "quickCaseId");
				caseId.setAttribute("id", "quickCaseId");
				caseId.setAttribute("type", "number");
				caseId.setAttribute("onFocus", "this.value=''");
				caseId.setAttribute("onBlur", "this.value=''");
				caseId.setAttribute("placeholder", "Case ID...");
				caseId.setAttribute("height", "100%");
				caseId.setAttribute("style", "width: 150px; border: 1px solid #3d4145;");
				form.appendChild(caseId);
				
				// Submit button
				let submit = document.createElement("input");
				submit.setAttribute("type", "submit");
				submit.setAttribute("style", "display:none");
				form.appendChild(submit);
				
				// Attach form to DOM
				topbarMenu.insertBefore(smpaction, topbarMenu.firstElementChild);
			}
		}
	}

	var openTab = function(event) {
		let form = event.target;
		form.action = `${SiemplifyApi.BASE_URL}/#/main/cases/classic-view/${form.quickCaseId.value}`;
		form.quickCaseId.value = '';
		document.activeElement.blur();
		//event.preventDefault();
	}
	
	return {
		enable: enable,
		disable: disable
	};
	
}());

BaseModule.initModule(CaseIDSearch, "Case ID Search");