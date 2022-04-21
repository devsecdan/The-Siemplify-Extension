(function() {

	// Get case environment
	let headerDescription = document.querySelector("case-header-info-description smp-icon[icon=\"environment\"");
	let environment = "";
	if (headerDescription) {
		environment = headerDescription.parentNode.textContent;
	}
	return environment;

})();