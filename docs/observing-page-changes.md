# Observing Page Changes
A frequent activity of modules is to observe changes to the Siemplify page.

Two classes exist to assist modules in doing this
- `ElementObserver`
- `PersistentObserver`

These classes are based on the [MutationSummaries](https://github.com/rafaelw/mutation-summary "MutationSummaries") library.

## ElementObserver
The `ElementObserver` class observes all element within the Siemplify page. Modules can add a listener to the observer to get callbacks whenever a specific element has been added or removed from the page.

The `ElementObserver` exposes two methods `observe(2)` and `stop(1)`.

`observe(2)` takes one or more CSS selector queries supported by MutationSummaries, as well as a callback function. MutationSummaries supports a [subset](https://github.com/rafaelw/mutation-summary/blob/master/APIReference.md#the-element-query "subset") of the CSS selector syntax.
Whenever an element matching the provided selectors has been added or removed from the page, the callback will be called with a summary object as argument.

The below example shows `observe(2)` being used to observe for a given element. When the element is added to the page, `handleSummary` get called. The `summary` object is an object of the format specified [here](https://github.com/rafaelw/mutation-summary/blob/master/APIReference.md#response-1 "here"). Typically, we are interested in the `summary.added` object, for elements which have been added to the page, and `summary.removed` object, for elements which have been removed.
```javascript
ElementObserver.observe("smp-accordion-item[tnautomationid=caseContextRecommendations]", handleSummary);

var handleSummary = function(summary) {
	summary.added.forEach(recommendation => {
		hideRecommendation(recommendation);
	})
}
```

The `ElementObserver` only observer for element additions and removals. More detailed element observations should be done through the `PersistentObserver`

The `stop(1)` method should be used when you no longer need to observe an element. Pass the original callback to the method to remove any references to this callback.

## PersistentObserver
The `PersistentObserver` works with the `ElementObserver` to allow more detailed observation of specific elements. It works by utilising the `ElementObserver`'s element-level queries to observe for specific elements being added to the page. Once such an element has been added, it then adds another, more permissive, set of queries to that element. This second set of queries supports the [full number of queries supported by MutationSummary](https://github.com/rafaelw/mutation-summary/blob/master/APIReference.md#query-types "full number of queries supported by MutationSummary").

`PersistentObserver` should be instantiated as a class and takes the following parameters:
- `attachQueries` - One or more element-level CSS selector queries, same as the first input to `ElementObserver`'s `observe` method. [Supported Syntax](https://github.com/rafaelw/mutation-summary/blob/master/APIReference.md#the-element-query "Supported Syntax").
- `attachedQueries` - Queries that will be attached to elements matched by `attachQueries`. These queries support the he [full number of queries supported by MutationSummary](https://github.com/rafaelw/mutation-summary/blob/master/APIReference.md#query-types "full number of queries supported by MutationSummary")
- `attachedcallback` - The callback that will be executed when an activity matches what is being looked for by `attachedQueries`.
- `attachCallback` - [optional] This callback can be used if any activity needs to be performed when `attachedQueries` are being attached to a matched element. i.e. this will be called when `attachQueries` matches an element, similar to how the `ElementObserver` works.

The `disconnect()` method should be called there is no longer any need to observe these elements and activities.

The below example shows the PersistentObserver being used. In this example a `characterData` query will be attached to all elements matching `"div.description-case"`.
`handleCaseIdAttach` will be called when the `characterData` query is attached to an element.
`handleCaseIdSummaries` will be called on any character data changes on the matched element.

```javascript
new PersistentObserver("div.description-case", { characterData: true }, handleCaseIdSummaries, handleCaseIdAttach);

var handleCaseIdAttach = function(summary) {
	summary.added.forEach(description => {
		description.addEventListener("click", copyCaseIdHandler);
	});
}

var handleCaseIdSummaries = function(summaries) {
	let summary = summaries[0];
	summary.valueChanged.forEach(description => {
		description.addEventListener("click", copyCaseIdHandler);
	});
}
```
