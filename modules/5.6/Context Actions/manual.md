# Context Actions
Configure contextual actions, which can be accessed by right-clicking any entity or text element on a page. Actions are templated links which can be used to perform actions such as VirusTotal lookups on entities or pass entity data to a query service.

## Usage
### Adding Context Actions
Adding a  context action requries the following information:
- Path
- Action
- Parameters (optional)
- Parameter Encoding
- Re-use tab

#### Path
The Path determines the structure of the contextual menu and where each specific configured action is places. The path is defined as a /-separated string, where each /-separated element corresponds to a menu item within the contextual menu.

For example, defining the string `Search/Google` will create a menu item named `Search`, which will open up to reveal the `Google` menu item.
Adding further context actions with the `Search/` (ex. `Search/DuckDuckGo`) prefix will insert additional actions into the `Search` menu item.

Context menu shortcuts can be defined by insertinng `&` before the letter that should serve as a shortcut. Ex. `&Search/&DuckDuckGo` defines the shortcut `S` for Search and `D` for DuckDuckGo.

#### Action
The Action is a link which should be opened when the menu item specified by the Path has been clicked by the user. The action should follow the URI syntax (ex. `https://example.com`).

#### Action Variables
Some variables can be used to insert context-specific information into the action URI. Variables are inserted using the `{{VARIABLE}}` notation.
The following variables are current defined:
- `SELECTION` - Inserts the text selection that the context-menu was opened on.
- `ENVIRONMENT` - Inserts the current case environment if the context action was triggered within a case.

Example: `https://duckduckgo.com/?q={{SELECTION}}`

#### Parameters and Parameter Encoding
The Parameters and Parameter Encoding fields go together.

The Parameter Encoding field determines how the URL search string should be encoded, while the Parameters field determines which URL query parameters to apply the encoding to.

If the Parameter Encoding `None` is selected, then no encoding is performed and the Parameters field is ignored.
If any Parameter Encoding other that `None` is selected, then the selected encoding will be applied to the parameters defined in the Parameters field.

The Parameters field allows you to set which query parameters to encode. Parameters are defined by a comma-separated list. IF you want to encode the URL parameters `a`, `b` and `abc`, you'd enter the string `a, b, abc` into the Parameters field.

#### Re-use Tab
Checking the Re-use Tab checkbox causes succesive executions of the same context action to re-use the same tabs.
Unchecking this option casues a new tab to be opened every time the context action is executed.

## Configuration
### Environment Pre-Processing
The Environment variable can be processed into a format expected by the context action endpoints.
Regex can be used to select a desired part of the environment, and the casing can be adjusted to all upper- or lower-case.
If no manipulation of the environment variable is desired, these fields ccan be left empty.

Example of usage could be if a database contains tables using the same names as the Siemplify environment variabbles, but in all lowercase. Environment pre-processing allows this conversion to be made.

It is currently only possible to specify one method of pre-processing the environment variable. As such, context actions requiring different formats of the environment variable are not currently supported.
