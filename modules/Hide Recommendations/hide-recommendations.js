"use strict";

var HideRecommendations = (function () {
	
	var recommendationSelector = "smp-accordion-item[tnautomationid=caseContextRecommendations]";

	var enable = function () {
		ElementObserver.observe(recommendationSelector, handleSummary);
		let recommendation = document.querySelector(recommendationSelector)
		if (recommendation) hideRecommendation(recommendation);
	};
	
	var disable = function () {
		ElementObserver.stop(hideRecommendation);
		let recommendation = document.querySelector(recommendationSelector)
		if (recommendation) unhideRecommendation(recommendation);
	};

	var handleSummary = function(summary) {
		summary.added.forEach(recommendation => {
			hideRecommendation(recommendation);
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
