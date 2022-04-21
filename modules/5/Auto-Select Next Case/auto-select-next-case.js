"use strict";

var AutoSelectNextCase = (function() {

	var caseQueueSpinnerSelector = "smp-spinner.simp-spinner";

	var enable = function (url) {
		// Observe when no case is selected
		ElementObserver.observe("#noCaseSelected", handleSummary);
		if (!caseIsOpen()) {
			autoSelectNextCase();
		}
	};
	
	var disable = function () {
		ElementObserver.stop(handleSummary);
	};

	var caseIsOpen = function() {
		return document.getElementsByTagName("tn-case-details").length ? true : false;
	}

	var handleSummary = function(summary) {
		summary.added.forEach(() => {
			// Wait until case queue has loaded
			if (document.querySelector(caseQueueSpinnerSelector)) {
				ElementObserver.observe(caseQueueSpinnerSelector, handleSpinnerSummary);
			}
			else {
				autoSelectNextCase();
			}
		});
	}

	var handleSpinnerSummary = function(summary) {
		summary.removed.forEach(() => {
			ElementObserver.stop(handleSpinnerSummary);
			autoSelectNextCase();
		})
	}

	// ======================== SELECT NEXT CASE ========================
	// Select next case if no case is selected
	var autoSelectNextCase = function() {
		if (location.href.includes(SiemplifyEndpoints.CASES_URL)) {
			let activeCaseIndex = CaseListHelper.getActiveCaseIndex();
			let cardList = document.querySelector("div.case-queue-list");
			cardList?.children[activeCaseIndex]?.firstElementChild?.click();
		}
	}
	
	return {
		enable: enable,
		disable: disable
	};
	
}());
BaseModule.initModule(AutoSelectNextCase, "Auto-Select Next Case");
