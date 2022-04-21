"use strict";

var ExpandAccordion = (function () {

	var accordionSelector = "smp-accordion-header";
	var expandedSelector = "expanded";
	var alertButton = ".alert-option-menu";

	var enable = function () {
		ElementObserver.observe(accordionSelector, expandTables);
	};
	
	var disable = function () {
		ElementObserver.stop(expandTables);
	};
	
	var expandTables = function(summary) {
		if  (location.href.includes(SiemplifyEndpoints.CASES_URL)
			&& !alertButtonClicked()) {
			summary.added.forEach(element => {
				if (!element.classList.contains(expandedSelector)) {
					element.click();
				}
			});
		}
	};

	var alertButtonClicked = function() {
		return document.activeElement.matches(alertButton);
	}
	
	return {
		enable: enable,
		disable: disable
	};
	
}());

BaseModule.initModule(ExpandAccordion, "Expand Accordion");