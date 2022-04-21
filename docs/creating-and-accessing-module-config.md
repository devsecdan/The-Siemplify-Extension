# Creating and Accessing Module Configuration
Any module configuration options must be exposed to the user through the extension configuration page.
The module system is set up so that this should be as easy to implement as possible.

## Creating a configuration section for your module
Modules define how their configuration options are displayed on the config page by pointing to an HTML file in the `configHtmlFile` field in their metadata. This file will be imported into the appropriate section of the configuration page. By convention, this file is named `config.part.html`.

```javascript
MyModule.metadata = {
    ...
    configHtmlFile: "My Module/config.part.html",
    ...
}
```

To support easily adding new configuration options, a number of classes, attributes and HTML structures have been implemented, which can be used when creating the config HTML part. The supported HTML classes and attributes are described below:

```html
 - class="config-element": The value of an element with this class is to be saved to browser storage.
 -- config-name="name": Name to save the element value as.

 - class="config-group": Container for a dynamic group of related configuration elements to be saved.
 -- class="config-group-add": Defines the button that adds a new copy of the config group template.
 -- template
 --- class="config-group-element": Element withing a config group to be saved.
 ---- config-name="environment":  Name to save element as.
 --- class="config-group-remove": Defines the button that removes an instance of a config group element group.
```

These classes and attributes are generally supported on HTML `input` and `select` elements.

The `config-element` class is used on single `input` elements which will hold a single config value, defined by the `config-name` attribute.

The `config-group` class is used on a content element, such as `div`, to define a group of related config elements, which should be saved as a list under a config name defined by the `config-group-name` attribute.
The element having the `config-group` class must contain an input of type `button` with the class `config-group-add`, which will allow the user to add a config element to the group.

The following example shows how the Assign New Cases module defines its `casesToAssign` and `sortType` values:
```javascript
<table>
    <tr>
        <td><label>Number of cases to assign</label></td>
        <td><input type="number" class="config-element" config-name="casesToAssign" required></td>
    </tr>
    <tr>
        <td><label>Sort by</label></td>
        <td>
            <select class="config-element" config-name="sortType">
                <option value="6">ID (High to Low)</option>
                <option value="7">ID (Low to High)</option>
                <option value="0">Time Created (Newest to Oldest)</option>
                <option value="1">Time Created (Oldest to Newest)</option>
                <option value="2">Modified (Newest to Oldest)</option>
                <option value="3">Modified (Oldest to Newest)</option>
                <option value="4">Priority (High to Low)</option>
                <option value="5">Priority (Low to High)</option>
                <option value="8">SLA (Longest to Shortest)</option>
                <option value="9">SLA (Shortest to Longest)</option>
            </select>
        </td>
    </tr>
</table>
```

Secondly, the element must contain a `<template>` element which defines each config element in the group.
The template must contain one or more `input` elements with the class `config-group-element`, which defines that the value of the element must be saved, and the `config-name` attribute defines the name the value should be saved as.
The template must also contain a single input of type `button`, which has the class `config-group-remove`, which lets the user remove each specific config element from the group.
Other elements can be added to the template, too, but only elements with the `config-group-element` will be saved to config.

The following HTML part is what is used for the Close Case module to define the config group that the user can use to configure the Close Case shortcuts.
```javascript
<div class="config-group" config-group-name="closeCaseShortcuts">
    <h1>Close Case Shortcuts</h1>
    <input type="button" class="config-group-add" value="Add">
    <template>
        <label>Shortcut</label>
        <input type="text" class="config-group-element keybind" config-name="shortcut" readonly required>
        <label>Reason</label>
        <input type="text" class="config-group-element" config-name="reason" placeholder="Malicious" required>
        <label>Root Cause</label>
        <input type="text" class="config-group-element" config-name="rootCause" placeholder="Malware" required>
        <input type="button" class="config-group-remove" value="Remove">
    </template>
</div>
```

## Configuring Keybinds
Keybinds are configured as above with an `input` of type `text` with the class `keybind` added to the element with the `config-element` or `config-group-element` class.

In the above example, a keybind input with the `config-name` "shortcut" has been created.

## Accessing Confgiuration from the Module
A module generally accesses its own configuration through the `this.config` or `<ModuleName>.config` object.

Further configuration management can be done through the `ConfigurationManager` class.