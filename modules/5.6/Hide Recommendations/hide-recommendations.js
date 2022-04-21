"use strict";

var HideRecommendations = (function () {
	
	var accordionItemSelector = "smp-accordion-item";
	var recommendationSelector = "context-case-recommendations"

	var enable = function () {
		ElementObserver.observe(accordionItemSelector, handleSummary);
		let recommendation = document.querySelector(accordionItemSelector)
		if (recommendation) hideRecommendation(recommendation);
	};
	
	var disable = function () {
		ElementObserver.stop(hideRecommendation);
		let recommendation = document.querySelector(accordionItemSelector)
		if (recommendation) unhideRecommendation(recommendation);
	};

	var handleSummary = function(summary) {
		summary.added.forEach(accordionItem => {
			if (accordionItem.querySelector(recommendationSelector)) {
				hideRecommendation(accordionItem);
			}
		})
	}
	
	var hideRecommendation = function(recommendation) {
		recommendation.style.display = 'none';
	};
	
	var unhideRecommendation = function(recommendation) {
		recommendation.style.display = '';
	};
	
	return {
		enable: enable,
		disable: disable
	};
}());

BaseModule.initModule(HideRecommendations, "Hide Recommendations");
