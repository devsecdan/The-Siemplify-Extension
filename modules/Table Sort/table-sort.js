"use strict";

var TableSort = (function () {

	var enable = function () {
		ElementObserver.observe("#nameHeaderAutomation.u-ellipsis.ui-sortable-column.ui-resizable-column", sortTables);
	};
	
	var disable = function () {
		ElementObserver.stop(sortTables);
	};
	
	var sortTables = function (summary) {
        summary.added.forEach(element => {
			let stop = 3;
			while (element.getElementsByClassName("pi-sort-up").length === 0) {
				element.click();
				// Prevent potential infinite loop
				stop--;
				if (stop === 0) break;
			}
		});
	};
	
	return {
		enable: enable,
		disable: disable
	};
	
}());

BaseModule.initModule(TableSort, "Table Sort");