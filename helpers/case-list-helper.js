var CaseListHelper = (function () {

    var caseQueueListSelector = "div.case-queue-list";

    var activeCaseIndex = 0;
    var getActiveCaseIndex = function() {
        return activeCaseIndex;
    }

    var handleAttach = function(summary) {
        summary.added.forEach(caseList => {
            let selectedCard = caseList.querySelector(".case-card__selected");
            if (selectedCard) {
                updateCaseIndex(selectedCard);
            }
        });
    }

    // Process any card that has had its class changed
    var handleStyleChange = function(summaries) {
        let summary = summaries[0];
        summary.added.forEach(card => updateCaseIndex(card));
        summary.valueChanged.forEach(card => updateCaseIndex(card));
    }

    var updateCaseIndex = function(card) {
        try {
            // Determine if card is selected
            if (card.classList.contains("case-card__selected")) {
                let i = 0;
                // Count the card's position in the queue
                let child = card.closest("case-queue-case-card");
                while( (child = child.previousElementSibling) != null)
                    i++;
                if (activeCaseIndex != i) {
                    activeCaseIndex = i;
                    notifyListeners(activeCaseIndex);
                }
            }
        } catch(e) {}
    }

    /**
     * Allow listening for case change events
     */
    var _listeners = new Set();
    var notifyListeners = async function(activeCaseIndex) {
        for (let listener of _listeners) {
            listener(activeCaseIndex);
        }
    }
    var onCaseChanged = {
        addListener: function(callback) {
            _listeners.add(callback);
        },
        removeListener: function(callback) {
            _listeners.delete(callback);
        }
    }

    // Observe the case card list
    var observer = new PersistentObserver(caseQueueListSelector, { attribute: "class" }, handleStyleChange, handleAttach);

    return {
        getActiveCaseIndex: getActiveCaseIndex,
        onCaseChanged: onCaseChanged
    }

})();