"use strict";

var InsertCSS = (function () {

    var selectionHighlightCSS = (highlightColour) => { return `.case-card__selected {    background: ${highlightColour} !important}.ui-table .ui-table-scrollable-body .ui-table-tbody tr.ui-state-highlight {    background: ${highlightColour} !important}.alert-card--selected {    background: ${highlightColour} !important}` };
    var tableResizeCSS = () => { return ".detail-table table col:first-child {    width: 200px;}.detail-table table col:last-child {    width: 100% !important;}" } 
    var tableRowHighlightCSS = (highlightColour) => { return `.detail-table table tr.ng-star-inserted:nth-child(odd) { background-color: ${highlightColour} !important }`}
    var wrapTextCSS = () => { return "smp-accordion .u-ellipsis { white-space: normal !important; word-wrap: break-word !important; } .summary-container .item-name { white-space: normal !important; word-wrap: break-word !important; }" }
	
	var enable = function () {
        if (this.config.selectionHighlightEnabled) {
            insertCSS("selectionHighlight", selectionHighlightCSS(this.config.selectionHighlightColour));
        }
        if (this.config.tableResizeEnabled) {
            insertCSS("tableResize", tableResizeCSS());
        }
        if (this.config.tableRowHighlightEnabled) {
            insertCSS("tableRowHighlight", tableRowHighlightCSS(this.config.tableRowHighlightColour));
        }
        if (this.config.wrapTextEnabled) {
            insertCSS("wrapText", wrapTextCSS());
        }
	};

	var disable = function() {
        removeCSS("selectionHighlight");
        removeCSS("tableResize");
        removeCSS("tableRowHighlight");
        removeCSS("wrapText");
    };

    var configChanged = function(oldConfig, newConfig) {
        disable.call(this);
        enable.call(this);
    }
    
    var insertCSS = function(id, css) {
        if (!document.getElementById(id)) {
			let style = document.createElement("style");
			style.setAttribute("id", id);
			style.type = "text/css";
			style.textContent = css;
			document.getElementsByTagName("head")[0].appendChild(style);
		}
    }

    var removeCSS = function(id) {
        let style = document.getElementById(id);
		if (style) {
			style.parentNode.removeChild(style);
		}
    }
	
	return {
		enable: enable,
        disable: disable,
        configChanged: configChanged
	};
	
}());

BaseModule.initModule(InsertCSS, "Insert CSS");