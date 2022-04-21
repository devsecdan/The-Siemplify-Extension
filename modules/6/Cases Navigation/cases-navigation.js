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
		Mousetraps.bind(config.moveSplitRightKeybind, moveSplitterRight, "keydown");
		Mousetraps.bind(config.moveSplitLeftKeybind, moveSplitterLeft, "keydown");
		Mousetraps.bindGlobal(config.scrollContextUpKeybind, scrollContextDetailsUp, "keydown");
		Mousetraps.bindGlobal(config.scrollContextDownKeybind, scrollContextDetailsDown, "keydown");
		//Mousetraps.bindGlobal(config.highlightSearchKeybind, highlightContextSearch);
		//Mousetraps.bindGlobal("enter", deselectContextSearch);
		//Mousetraps.bindGlobal("esc", deselectContextSearch);
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
		Mousetraps.unbind(config.moveSplitRightKeybind, moveSplitterRight, "keydown");
		Mousetraps.unbind(config.moveSplitLeftKeybind, moveSplitterLeft, "keydown");
		Mousetraps.unbindGlobal(config.scrollContextUpKeybind, scrollContextDetailsUp, "keydown");
		Mousetraps.unbindGlobal(config.scrollContextDownKeybind, scrollContextDetailsDown, "keydown");
		//#Mousetraps.unbindGlobal(config.highlightSearchKeybind, highlightContextSearch);
		//Mousetraps.unbindGlobal("enter", deselectContextSearch);
		//Mousetraps.unbindGlobal("esc", deselectContextSearch);
		Mousetraps.unbindGlobal(config.selectNextCaseKeybind, selectNextCase);
		Mousetraps.unbindGlobal(config.selectPreviousCaseKeybind, selectPreviousCase);
		Mousetraps.unbind(config.toggleCaseListKeybind, toggleCaseCardList);
	}
	
	// ======================== CASE TABS ========================
	var caseTabsSelector = ".smp-tabs-list";

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
	var overviewSelector = "cases-dynamic-case-tab";
	var alertsCarouselSelector = "div.alerts-list";
	var alertCardSelector = "alert-card";
	var selectedAlertCardSelector = "alert-card.active";

	var selectNextAlert = function() {
		let alertsCarousel = document.querySelector(alertsCarouselSelector);
		if (alertsCarousel) {
			let currentlySelectedCard = alertsCarousel.querySelector(selectedAlertCardSelector);
			if (currentlySelectedCard) {
				let nextAlert = currentlySelectedCard.nextElementSibling;
				if (nextAlert) {
					nextAlert.click();
				}
				else {
					currentlySelectedCard.click();
				}
			}
			else {
				if (alertsCarousel.children.length > 0) {
					alertsCarousel.firstChild.click();
				}
			}
		}
		return false;
	}
	
	var selectPreviousAlert = function() {
		let alertsCarousel = document.querySelector(alertsCarouselSelector);
		if (alertsCarousel) {
			let currentlySelectedCard = alertsCarousel.querySelector(selectedAlertCardSelector);
			if (currentlySelectedCard) {
				let previousAlert = currentlySelectedCard.previousElementSibling;
				if (previousAlert) {
					previousAlert.click();
				}
				else {
					let overviewTab = document.querySelector(overviewSelector)
					overviewTab.click();
				}
			}
			else {
				if (alertsCarousel.children.length > 0) {
					alertsCarousel.lastChild.click();
				}
			}
		}
		return false;
	}
	
	// ======================== CASE EVENTS ========================
	var eventsTableSelector = "div.p-datatable-scrollable-body tbody";
	var selectedEventSelector = ".p-highlight";
	var eventButtonSelector = "button.shape--rectangle"

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
					eventsTable.children[newEventIndex].querySelector(eventButtonSelector).click();
				}
				else {
					activeEvent.querySelector(eventButtonSelector).click();
				}
			}
			else {
				if (relativeIndex > 0) {
					eventsTable?.firstElementChild?.querySelector(eventButtonSelector).click();
				}
				else {
					eventsTable?.lastElementChild?.querySelector(eventButtonSelector).click();
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
	var playbookViewerSelector = "playbook-viewer-side-menu";
	var eventViewerSelector = "smp-card.events-side-menu";
	var pendingActionViewerSelector = "alert-pending-action-respond-side-menu";
	
	var moveSplitter = function(xTranslation) {
		let sideMenu = document.querySelector(`${playbookViewerSelector}, ${eventViewerSelector}, ${pendingActionViewerSelector}`);
		if (sideMenu) {
			let width = sideMenu.style.width;
			let maxWidth = document.documentElement.clientWidth;
			let widthNumber;
			if (width) {
				widthNumber = parseInt(width);
			}
			else {
				widthNumber = sideMenu.offsetWidth;
			}
			let newWidth = widthNumber + xTranslation;
			if (newWidth > 0 && newWidth < maxWidth) {
				sideMenu.style.width = `${newWidth}px`;
			}
		}
	}

	var moveSplitterRight = function() {
		moveSplitter(-200);
		return false;
	}
	var moveSplitterLeft = function() {
		moveSplitter(200);
		return false;
	}

	// ======================== CONTEXT DETAILS SCROLL ========================
	var contextDetailsScrollbarSelector = "smp-side-menu-container smp-card-body";

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
	var caseCardListSelector = "cases-dynamic-queue>smp-list";

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
	var caseListSplitterSelector = ".smp-sidebar-toggle-icon-container";

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