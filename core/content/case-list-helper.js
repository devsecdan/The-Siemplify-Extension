var CaseListHelper = (function () {

    var caseQueueListSelector = "cases-dynamic-queue";
    var caseCardParentSelector = "smp-list-item";
    var caseCardSelector = "smp-card";
    var activeCaseSelector = "smp-card.active";
    var caseActiveClass = "active";

    var activeCaseIndex = 0;
    var getActiveCaseIndex = function() {
        return activeCaseIndex;
    }

    var handleAttach = function(summary) {
        summary.added.forEach(caseList => {
            let selectedCard = caseList.querySelector(activeCaseSelector);
            if (selectedCard) {
                updateCaseIndex(selectedCard);
            }
        });
    }

    // Process any card that has had its class changed
    var handleStyleChange = function(summaries) {
        let summary = summaries[0];
        summary.added.forEach(card => updateCaseIndex(card));
        summary.attributeChanged.class.forEach(card => updateCaseIndex(card));
    }

    var updateCaseIndex = function(card) {
        try {
            // Determine if card is selected
            if (card.classList.contains(caseActiveClass)) {
                let i = 0;
                // Count the card's position in the queue
                let child = card.closest(caseCardParentSelector);
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
    var observer = new PersistentObserver(caseQueueListSelector, { element: caseCardSelector, elementAttributes: "class" }, handleStyleChange, handleAttach);

    return {
        getActiveCaseIndex: getActiveCaseIndex,
        onCaseChanged: onCaseChanged
    }

})();