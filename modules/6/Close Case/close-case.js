"use strict";

var CloseCase = (function () {
	
	var getCloseCaseButton = function() { return document.querySelector("button[icon=close-case]"); }
	var getCloseCaseModal = function() { return document.body.querySelector(".cases-close-case-dialog-dialog"); }
	var getCloseCaseReason = function() { return document.querySelector('[formcontrolname="reason"]'); }
	var getCloseCaseRootCause = function() { return document.querySelector('[formcontrolname="rootCause"]'); }
	var getCloseCaseComment = function() { return document.querySelector('[formcontrolname="comment"]'); }
	var getCloseCaseCloseModal = function() { return document.querySelector('smp-dialog-footer button[type="submit"]'); }
	var getCloseCaseCancelModal = function() { return document.querySelector('smp-dialog-footer button[type="button"]'); }
	var getModalDropdownOptions = function() { return document.querySelectorAll("smp-select-option"); }

	var shortcuts = [];

	var enable = function () {
		initialiseKeybinds(this.config);
	};
	
	var disable = function () {
		removeKeybinds(this.config);
	};

	var configChanged = function(oldConfig, newConfig) {
		removeKeybinds(oldConfig);
		initialiseKeybinds(newConfig);
	}

	var initialiseKeybinds = function(config) {
		// Apply configured shortcuts
		if (config.closeCaseShortcuts) {
			for (let closeCaseShortcut of config.closeCaseShortcuts) {
				let shortcut = {
					shortcut: closeCaseShortcut.shortcut,
					callback: () => closeCaseClick(closeCaseShortcut.rootCause, closeCaseShortcut.reason)
				}
				shortcuts.push(shortcut);
				Mousetraps.bindGlobal(shortcut.shortcut, shortcut.callback)
			}
		}
		Mousetraps.bindGlobal("enter", closeCaseConfirmClick, 'keydown');
		Mousetraps.bindGlobal("esc", closeCaseCancelClick);
	}

	var removeKeybinds = function(config) {
		for (let shortcut of shortcuts) {
			Mousetraps.unbindGlobal(shortcut.shortcut, shortcut.callback)
		}
		Mousetraps.unbindGlobal("enter", closeCaseConfirmClick, 'keydown');
		Mousetraps.unbindGlobal("esc", closeCaseCancelClick);
	}
	
	// ======================== OPEN CLOSE CASE WINDOW ========================
	/**
	 * Opens the Close Case windows and sets root cause and close reason to the given values
	 * @param {*} rootCause 
	 * @param {*} closeReason 
	 */
	var closeCaseClick = function(rootCause = "Benign – Uninteresting", closeReason = "Not Malicious") {
		let closeCaseButton = getCloseCaseButton();
		if (closeCaseButton) {
			if (!closeCaseModalIsOpen()) {
				closeCaseButton.click();
			}
			try {
				selectReason(closeReason);
				selectRootCause(rootCause);
				// Force focus back on commentbox
				getCloseCaseReason().firstChild.addEventListener("focus", focusCommentBoxCallback);
			} catch(e) {
				console.error(e);
			}
		}
		return false;
	};

	var closeCaseModalIsOpen = function() {
		return getCloseCaseModal() ? true : false;
	}
	
	/**
	 * Selects the given close reason in the Close Case window
	 * @param {*} closeReason 
	 */
	var selectReason = function(closeReason) {
		getCloseCaseReason().firstChild.click();
		let options = getModalDropdownOptions();
		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			// Iterating over child nodes instead of checking innerText, since innerText does not seem to populate fast enough
			let nodes = option.childNodes;
			for (let j = 0; j < nodes.length; j++) {
				if (nodes[j].data === closeReason) {
					option.click();
				}
			}
		}
	}
	
	/**
	 * Selects the given root cause in the Close Case window
	 * @param {*} rootCause 
	 */
	var selectRootCause = async function(rootCause) {
		let options = await getModalDropdownOptionsAsync();
		for (let i = 0; i < options.length; i++) {
			let option = options[i];
			if (option.textContent == rootCause) {
				option.click();
				getCloseCaseComment().focus()
				break;
			}
		}
	}

	/**
	 * Asynchronously get modal dropdown options. Timeout after 10 seconds
	 */
	var getModalDropdownOptionsAsync = async function() {
		getCloseCaseRootCause().firstChild.click();
		let options = getModalDropdownOptions();
		let i = 0;
		while (options.length === 0 && i <= 20) {
			await delay(250)
			getCloseCaseRootCause().firstChild.click();
			options = getModalDropdownOptions();
			i++;
		}
		return options
	}

	var delay = async function(ms) {
		return new Promise(resolve => { return setTimeout(resolve, ms); });
	}
	
	/**
	 * Put focus on the Close Case window comment box
	 */
	var focusCommentBoxCallback = function() {
		getCloseCaseComment().focus();
		getCloseCaseReason().firstChild.removeEventListener("focus", focusCommentBoxCallback);
	};

	// ======================== CLOSE CASE SHORTCUT ========================
	var closeCaseConfirmClick = function() {
		if (closeCaseModalIsOpen()) {
			let closeCaseButton = getCloseCaseCloseModal();
			if (closeCaseButton) {
				closeCaseButton.click();
				return false;
			}
		}
	};
	
	var closeCaseCancelClick = function() {
		if (closeCaseModalIsOpen()) {
			let cancelCloseCaseButton = getCloseCaseCancelModal();
			if (cancelCloseCaseButton) {
				cancelCloseCaseButton.click();
				return false;
			}
		}
	};
	
	return {
		enable: enable,
		disable: disable,
		configChanged: configChanged
	};
	
}());

BaseModule.initModule(CloseCase, "Close Case");