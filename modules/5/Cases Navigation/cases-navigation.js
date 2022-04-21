"use strict";

var CasesNavigation = (function () {

	var enable = function (url) {
		initialiseKeybinds(this.config);
	};
	
	var disable = function () {
		removeKeybinds(this.config);
	};

	var configChanged = function(oldConfig, newConfig) {
		// Reload keybinds
		removeKeybinds(oldConfig);
		initialiseKeybinds(newConfig);
	}

	var initialiseKeybinds = function(config) {
		Mousetraps.bind(config.selectOverviewTabKeybind, selectOverviewTab);
		Mousetraps.bind(config.selectCaseWallTabKeybind, selectCaseWallTab);
		Mousetraps.bind(config.selectEventsTabKeybind, selectEventsTab);
		Mousetraps.bind(config.selectNextEventKeybind, selectNextEvent);
		Mousetraps.bind(config.selectPreviousEventKeybind, selectPreviousEvent);
		Mousetraps.bind(config.selectNextAlertKeybind, selectNextAlert);
		Mousetraps.bind(config.selectPreviousAlertKeybind, selectPreviousAlert);
		Mousetraps.bind(config.deselectAlertKeybind, deselectAlert);
		Mousetraps.bind(config.moveSplitRightKeybind, moveSplitterRight, "keydown");
		Mousetraps.bind(config.moveSplitLeftKeybind, moveSplitterLeft, "keydown");
		Mousetraps.bind(config.scrollContextUpKeybind, scrollContextDetailsUp, "keydown");
		Mousetraps.bind(config.scrollContextDownKeybind, scrollContextDetailsDown, "keydown");
		Mousetraps.bindGlobal(config.highlightSearchKeybind, highlightContextSearch);
		Mousetraps.bindGlobal("enter", deselectContextSearch);
		Mousetraps.bindGlobal("esc", deselectContextSearch);
		Mousetraps.bindGlobal(config.selectNextCaseKeybind, selectNextCase);
		Mousetraps.bindGlobal(config.selectPreviousCaseKeybind, selectPreviousCase);
		Mousetraps.bind(config.toggleCaseListKeybind, toggleCaseCardList);
	}

	var removeKeybinds = function(config) {
		Mousetraps.unbind(config.selectOverviewTabKeybind, selectOverviewTab);
		Mousetraps.unbind(config.selectCaseWallTabKeybind, selectCaseWallTab);
		Mousetraps.unbind(config.selectEventsTabKeybind, selectEventsTab);
		Mousetraps.unbind(config.selectNextEventKeybind, selectNextEvent);
		Mousetraps.unbind(config.selectPreviousEventKeybind, selectPreviousEvent);
		Mousetraps.unbind(config.selectNextAlertKeybind, selectNextAlert);
		Mousetraps.unbind(config.selectPreviousAlertKeybind, selectPreviousAlert);
		Mousetraps.unbind(config.deselectAlertKeybind, deselectAlert);
		Mousetraps.unbind(config.moveSplitRightKeybind, moveSplitterRight, "keydown");
		Mousetraps.unbind(config.moveSplitLeftKeybind, moveSplitterLeft, "keydown");
		Mousetraps.unbind(config.scrollContextUpKeybind, scrollContextDetailsUp, "keydown");
		Mousetraps.unbind(config.scrollContextDownKeybind, scrollContextDetailsDown, "keydown");
		Mousetraps.unbindGlobal(config.highlightSearchKeybind, highlightContextSearch);
		Mousetraps.unbindGlobal("enter", deselectContextSearch);
		Mousetraps.unbindGlobal("esc", deselectContextSearch);
		Mousetraps.unbindGlobal(config.selectNextCaseKeybind, selectNextCase);
		Mousetraps.unbindGlobal(config.selectPreviousCaseKeybind, selectPreviousCase);
		Mousetraps.unbind(config.toggleCaseListKeybind, toggleCaseCardList);
	}
	
	// ======================== CASE TABS ========================
	var caseTabsSelector = ".simp-tabs__tabs";

	var selectOverviewTab = function() {
		document.querySelector(caseTabsSelector)?.children[0].click();
		return false;
	}
	
	var selectCaseWallTab = function() {
		document.querySelector(caseTabsSelector)?.children[1].click();
		return false;
	}
	
	var selectEventsTab = function() {
		document.querySelector(caseTabsSelector)?.children[2].click();
		return false;
	}

	// ======================== CASE ALERTS ========================
	var alertsCarouselSelector = ".alerts-carousel";
	var alertCardSelector = ".alert-card";
	var selectedAlertCardSelector = "alert-card--selected";
	var rightAlertArrowSelector = "rightRs";
	var leftAlertArrowSelector = "rightRs";
	var lastAlertCardSelector = ".last-tile .alert-card";

	var selectNextAlert = function() {
		let alertsCarousel = document.querySelector(alertsCarouselSelector);
		if (alertsCarousel) {
			let elementSelected = false;
			for(let i = 0; i < alertsCarousel.children.length-1; i++) {
				if (alertsCarousel.children[i].getElementsByClassName(selectedAlertCardSelector).length > 0) {
					elementSelected = true;
					if (i+1 < alertsCarousel.children.length-1) {
						alertsCarousel.children[i+1].querySelector(alertCardSelector).click();
					}
					else {
						let arrowContainer = alertsCarousel.children[alertsCarousel.children.length-1];
						let arrow = arrowContainer.getElementsByClassName(rightAlertArrowSelector);
						if (arrow.length > 0) {
							arrow = arrow[0];
							arrow.click();
							alertsCarousel.children[0].querySelector(alertCardSelector).click();
						}
					}
					break;
				}
			}
			if (!elementSelected) {
				if (alertsCarousel.children.length > 0) {
					alertsCarousel.children[0].querySelector(alertCardSelector).click();
				}
			}
		}
		return false;
	}
	
	var selectPreviousAlert = function() {
		let alertsCarousel = document.querySelector(alertsCarouselSelector);
		if (alertsCarousel) {
			let elementSelected = false;
			for(let i = 0; i < alertsCarousel.children.length-1; i++) {
				if (alertsCarousel.children[i].getElementsByClassName(selectedAlertCardSelector).length > 0) {
					elementSelected = true;
					if (i-1 >= 0) {
						alertsCarousel.children[i-1].querySelector(alertCardSelector).click();
					}
					else {
						let arrowContainer = alertsCarousel.children[alertsCarousel.children.length-1];
						let arrow = arrowContainer.getElementsByClassName(leftAlertArrowSelector);
						if (arrow.length > 0) {
							arrow = arrow[0];
							arrow.click();
							alertsCarousel.querySelector(lastAlertCardSelector).click();
						}
					}
					break;
				}
			}
			if (!elementSelected) {
				if (alertsCarousel.children.length > 0) {
					alertsCarousel.children[0].querySelector(alertCardSelector).click();
				}
			}
		}
		return false;
	}

	var deselectAlert = function() {
		let alertsCarousel = document.querySelector(alertsCarouselSelector);
		if (alertsCarousel) {
			for (let alert of alertsCarousel.children) {
				if (alert.getElementsByClassName(selectedAlertCardSelector).length > 0) {
					alert.querySelector(alertCardSelector).click();
					break;
				}
			};
		}
		return false;
	}
	
	// ======================== CASE EVENTS ========================
	var eventsTableSelector = ".tab-panel-events .ui-table-scrollable-body .ui-table-tbody";
	var selectedEventSelector = ".ui-state-highlight";

	var selectEvent = function(relativeIndex) {
		let eventsTable = document.querySelector(eventsTableSelector);
		if (eventsTable) {
			let activeEvent = eventsTable.querySelector(selectedEventSelector);
			if (activeEvent) {
				let activeEventIndex = 0;
                let child = activeEvent;
                while( (child = child.previousElementSibling) != null) {
					activeEventIndex++;
				}
				let newEventIndex = activeEventIndex + relativeIndex;
				if (newEventIndex >= 0 && newEventIndex < eventsTable.children.length) {
					eventsTable.children[newEventIndex].click();
				}
				else {
					activeEvent.click();
				}
			}
			else {
				if (relativeIndex > 0) {
					eventsTable?.firstElementChild?.click();
				}
				else {
					eventsTable?.lastElementChild?.click();
				}
			}
		}
	}

	var selectNextEvent = function() {
		selectEvent(1);
		return false;
	}
	var selectPreviousEvent = function() {
		selectEvent(-1);
		return false;
	}

	// ======================== MOVE SPLITTER ========================
	var splitGutterSelector = ".as-split-gutter";
	
	var moveSplitter = function(xTranslation) {
		let splitGutter = document.querySelector(splitGutterSelector);
		if (splitGutter) {
			let splitRect = splitGutter.getBoundingClientRect();
			let x = splitRect.x;
			EventHelper.simulateMouseEvent(splitGutter, { type: "mousedown", clientX: x } );
			EventHelper.simulateMouseEvent(splitGutter, { type: "mousemove", clientX: x + xTranslation } );
			EventHelper.simulateMouseEvent(splitGutter, { type: "mouseup", clientX: x } );
		}
	}

	var moveSplitterRight = function() {
		moveSplitter(200);
		return false;
	}
	var moveSplitterLeft = function() {
		moveSplitter(-200);
		return false;
	}

	// ======================== CONTEXT DETAILS SCROLL ========================
	var contextDetailsScrollbarSelector = "section.context-details-container__context";

	var scrollContextDetails = function(amount) {
		let scrollbar = document.querySelector(contextDetailsScrollbarSelector);
		if (scrollbar) {
			scrollbar.scrollBy({ top: amount });
		}
	}
	var scrollContextDetailsUp = function() {
		scrollContextDetails(-100);
		return false;
	}
	var scrollContextDetailsDown = function() {
		scrollContextDetails(100);
		return false;
	}

	// ======================== HIGHLIGHT EVENTS SEARCH ========================
	var contextPaneSelector = "context-details-wrapper";
	var searchInputSelector = ".tn-search__input";

	var highlightContextSearch = function(e) {
		let contextPane = document.querySelector(contextPaneSelector);
		if (contextPane) {
			let searchInput = contextPane.querySelector(searchInputSelector);
			if (searchInput) {
				searchInput === document.activeElement ? searchInput.blur() : searchInput.select();
				return false;
			}
		}
	}

	var deselectContextSearch = function() {
		if (!caseWallTabIsSelected()) {
			let contextPane = document.querySelector(contextPaneSelector);
			if (contextPane) {
				let searchInput = contextPane.querySelector(searchInputSelector);
				if (searchInput && searchInput === document.activeElement) {
					searchInput.blur();
					return false;
				}
			}
		}
	}

	var selectedCaseTabSelector = "simp-tabs__tabs--tab--active";

	var caseWallTabIsSelected = function() {
		if (document.querySelector(caseTabsSelector)?.children[1].classList.contains(selectedCaseTabSelector)) {
			return true;
		} else {
			return false;
		}
	}

	// ======================== SELECT CASE ========================
	var caseCardListSelector = "div.case-queue-list";
	var caseListSplitterSelector = "button[tnautomationid=caseSplitterButton]";

	var selectNextCase = function() {
		if (location.href.includes(SiemplifyEndpoints.CASES_URL)) {
			let cardList = document.querySelector(caseCardListSelector);
			let nextCaseIndex = CaseListHelper.getActiveCaseIndex() + 1;
			if (nextCaseIndex >= 0 && nextCaseIndex < cardList.children.length) {
				cardList.children[nextCaseIndex]?.firstElementChild?.click();
			}
			return false;
		}
	}
	
	var selectPreviousCase = function() {
		if (location.href.includes(SiemplifyEndpoints.CASES_URL)) {
			let cardList = document.querySelector(caseCardListSelector);
			let previousCaseIndex = CaseListHelper.getActiveCaseIndex() - 1;
			if (previousCaseIndex >= 0 && previousCaseIndex < cardList.children.length) {
				cardList.children[previousCaseIndex]?.firstElementChild?.click();
			}
			return false;
		}
	}
	
	// ======================== TOGGLE CASE CARD LIST ========================
	var toggleCaseCardList = function () {
		document.querySelector(caseListSplitterSelector)?.click();
		return false;
	}
	
	return {
		enable: enable,
		disable: disable,
		configChanged: configChanged
	};
	
}());

BaseModule.initModule(CasesNavigation, "Navigation - Cases");