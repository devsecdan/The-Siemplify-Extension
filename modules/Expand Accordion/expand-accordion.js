"use strict";

var ExpandAccordion = (function () {

	var accordionSelector = "smp-accordion-header";
	var expandedSelector = "expanded";

	var enable = function () {
		ElementObserver.observe(accordionSelector, expandTables);
	};
	
	var disable = function () {
		ElementObserver.stop(expandTables);
	};
	
	var expandTables = function (summary) {
		if  (location.href.includes(SiemplifyEndpoints.CASES_URL)) {
			summary.added.forEach(element => {
				if (!element.classList.contains(expandedSelector)) {
					element.click();
				}
			});
		}
	};
	
	return {
		enable: enable,
		disable: disable
	};
	
}());

BaseModule.initModule(ExpandAccordion, "Expand Accordion");