(function() {
	/**
		Get current text selection
	**/
	let text = "";
		
	// Get text selection
	let selection = window.getSelection();
	let activeElement = document.activeElement;
	if (selection?.anchorNode?.nodeType === 3) { // Text node
		// Pick activeElement content if selection is not from the currently active element
		if (activeElement.nodeName !== "BODY" && activeElement.nodeName !== "IFRAME" && !activeElement.textContent.includes(selection.anchorNode.data)) {
			text = selection.innerText; // Use innerText instead of textContent, as that applies text styling
		}
		else {
			if (selection.type === "Range") {
				// Return explicit user selection
				text = selection.toString().trim();
			}
			else {
				text = selection.anchorNode.data;
			}
		}
	}
	// Get innerText of active element if no selection has been found so far
	if (typeof text === "undefined" || text === "") {
		if (activeElement.nodeName !== "BODY" && activeElement.nodeName !== "IFRAME") {
			text = activeElement.innerText || activeElement.value;
		}
	}

	return text.trim();

})();