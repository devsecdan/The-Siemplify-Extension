"use strict";

var TableSort = (function () {

	var alertButton = ".alert-option-menu";

	var enable = function () {
		ElementObserver.observe("#nameHeaderAutomation.u-ellipsis.ui-sortable-column.ui-resizable-column", sortTables);
	};
	
	var disable = function () {
		ElementObserver.stop(sortTables);
	};
	
	var sortTables = function (summary) {
		if (!alertButtonClicked()) {
			summary.added.forEach(element => {
				setTimeout(() => {
					let stop = 3;
					while (element.getElementsByClassName("pi-sort-up").length === 0) {
						element.click();
						// Prevent potential infinite loop
						stop--;
						if (stop === 0) break;
					}
				}, 0);
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

BaseModule.initModule(TableSort, "Table Sort");