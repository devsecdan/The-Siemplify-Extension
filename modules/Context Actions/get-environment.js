(function() {

	// Get case environment
	let headerDescription = document.querySelector("div.description-case");
	let environment = "";
	if (headerDescription) {
		let headerText = headerDescription.textContent;
		let match = headerText.match(/\| Environment: (.*)$/);
		if (match) {
			environment = match[1];
		}
	}
	return environment;

})();