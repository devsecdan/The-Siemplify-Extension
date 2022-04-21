"use strict";

var TableSort = (function () {

	var tableHeaderColumnSelector = "th[presizablecolumn]";
	var sideMenuSelector = "case-events-side-menu";
	var ascSortIconClass = "pi-sort-amount-up-alt";

	var enable = function () {
		ElementObserver.observe(tableHeaderColumnSelector, sortTables);
	};
	
	var disable = function () {
		ElementObserver.stop(sortTables);
	};
	
	var sortTables = function (summary) {
		summary.added.forEach(element => {
			if (element.closest(sideMenuSelector)) {
				setTimeout(() => {
					let stop = 3;
					while (element.getElementsByClassName(ascSortIconClass).length === 0) {
						element.click();
						// Prevent potential infinite loop
						stop--;
						if (stop === 0) break;
					}
				}, 0);
			}
		});
	};

	var alertButtonClicked = function() {
		return document.activeElement.matches(alertButton);
	}
	
	return {
		enable: enable,
		disable: disable
	};
	
}());

BaseModule.initModule(TableSort, "Table Sort");