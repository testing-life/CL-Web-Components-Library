# Web Components Library

Exposed CSS properties for styling and default values:

## `max-input` component

Example:

```HTML
<max-input required input="" error="" max="" layout="boxy">
    <span slot="input-label">Im another label boxy</span>
</max-input>
```

### `max-input` component attributes

| attribute     | optional | type   | possible values | purpose                                                             |
| ------------- | -------- | ------ | --------------- | ------------------------------------------------------------------- |
| `required`    | optional | bool   |                 | makes input validated against value/no value                        |
| `input`       | required | string |                 | actual value for the input                                          |
| `error`       | required | string |                 | error message to be displayed                                       |
| `layout`      | required | string | `boxy`, `texty` | toggles between an inline input and boxy, traditional looking input |
| `input-label` | optional | slot   |                 | a named slot for custom input label                                 |

### `max-input` component exposed events

- `maxInputChanged`: returns an object with currently entered value `{detail:{maxValue: value}}`

### `max-input` component CSS props

- --borderShorthand: 1px solid plum;
- --labelBackground: lightblue;
- --outlineShorthand: 1px solid olive;
- --inputBackground: lightsteelblue;
- --buttonBackground: wheat;
- --inputBorderShorthand: 1px solid sienna;
- --borderRadiusShorthand: 5px;
- --errorColour: firebrick;
- --paddingShorthand: 5px;
- --marginShorthand: 5px 0 5px 0;
- --textDecoration: underline;
- --textBorderBottomShorthand: 2px dotted sienna
- --labelFontSize: inherit;
- --inputFontSize: inherit;
- --buttonFontSize: inherit;

## `trim-address` component

Example:
```HTML
<trim-address wallet="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"></trim-address>
```

### `trim-address` component attributes

| attribute | optional | type   | possible values | purpose                        |
| --------- | -------- | ------ | --------------- | ------------------------------ |
| `wallet`  | required | string |                 | wallet address to be truncated |

### `trim-address` component CSS props

- --background: lightblue;
- --fontFamily: inherit;
- --fontSize: inherit;
- --fontWeight: inherit;
- --padding: 5px;

## `ens-lookup` component

Example:
```HTML
<ens-lookup result="" error=""> </ens-lookup>`
```

### `ens-lookup` component attributes

| attribute | optional | type   | possible values | purpose                                                                                                                |
| --------- | -------- | ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `result`  | required | string |                 | result of ENS lookup; can also be ued to display custom loading message and be overwritten on successful lookup result |
| `error`   | required | string |                 | custom error message                                                                                                   |

### `ens-lookup` component exposed events

- `ensLookupChanged`: returns an object with currently entered value `{detail: value}`

### `ens-lookup` component CSS props

- --background: lightblue;
- --fontFamily: inherit;
- --fontSize: inherit;
- --fontWeight: inherit;
- --padding: 5px;

## `autocomplete-select` component

Example:
````HTML
<autocomplete-select
  options=''
  value=''
  placeholder='test1'
  search-text='search %VAL% 1'
  default-avatar=''>
</autocomplete-select>
````



### `autocomplete-select` component attributes

Example of Dao object

```JSON
"d9c9fae9-049f-4123-805b-37bbb7b3c931": {
    "name": "Unity Project",
    "avatarUrl": null,
    "treasuryAddresses": ["unityproject.eth"],
}
```

| attribute            | optional | type   | possible values | purpose                                            |
| -------------------- | -------- | ------ | --------------- | -------------------------------------------------- |
| `options`            | required | array  |                 | **stringified** array of objects with data of DAOs |
| `value`              | optional | string |                 | preselected **name** value from the options        |
| `placeholder`        | optional | string |                 | input placeholder text                             |
| `search-text`        | optional | string |                 | text in case filtering returns no results          |
| `default-avatar`     | optional | string |                 | URL / filename pointing to a default avatar        |
| `button-icon-close`  | optional | slot   |                 | a named slot for custom close icon                 |
| `button-icon-add`    | optional | slot   |                 | a named slot for custom add icon                   |
| `button-icon-search` | optional | slot   |                 | a named slot for custom close icon                 |

### `autocomplete-select` component exposed methods
- init({config})
```TSX
config:
  - options: Array<DaoObject>
  - value: string
```

### `autocomplete-select` component exposed events

- `inputCleared`: notifies of clearing of the input field, returns nothing `
- `newDaoAdded`: notifies of new Dao being manually added with default values, returns a DAO object
- `daoSelectionChanged`: notifies of DAO selection, returns a DAO object`

Example returned event DAO object:
```TSX
{
  detail: {
    name: string,
    avatarUrl: string,
    treasuryAddresses: Array<string>,
    id: string 
    /* New items (not from the 'options' list) get 
      the following 'id' format: "custom-dao-<Date.now()>" */
  }
}
```

### `autocomplete-select` component CSS props

- --borderRadius: 5px;
- --spacingSmall: 5px;
- --spacingNormal: 10px;
- --backgroundNormal: lightsteelblue;
- --borderNormal: plum;
- --borderHighlight: pink;
- --optionHover: pink;
- --textNormal: black;
- --textError: red;
- --textWarning: orange;
- --maxScrollerHeight: 135px;
- --inputboxHeight: 46px;
- --avatarSize: 32px;

## React use example

Web components need to be wrapped up in a React component, which then can be used as any other component in the app.

`MaxInputWebComponent.tsx`

```TSX
import 'cl-webcomp-poc/MaxInput';
import React, { useEffect, useRef } from 'react';

const MaxInputWebComponent = (props: any) => {
  const { input, max, onChange, layout, label, error } = props;
  const ref = useRef();

  useEffect(() => {
    const { current } = ref;
    current!.addEventListener('maxInputChanged', ({ detail: { maxValue } }) => onChange(maxValue));
  }, [ref]);

  return (
    <max-input input={input} label={label} max={max} layout={layout} error={error} required class="maxInput" ref={ref}>
      {props.label ? <span slot="input-label">{props.label}</span> : null}
    </max-input>
  );
};

export default MaxInputWebComponent;
```

`any other react component`

```HTML
<MaxInputWebComponent
    input={txValues.fromValueFormatted || '0'}
    max={balances && getMaxAllowance(balances, from)}
    onChange={onChangeFrom}
    layout={'texty'}
    label="SEC"
    error={!!estimatesError || !!balanceError ? 'Amount entered exceeds wallet balance' : ''}
/>
```

## Inheritable CSS properties

We components can inherit some css properties from parent/global scope, eliminating the need to repeat them within the component.

- border-collapse
- border-spacing
- caption-side
- color
- cursor
- direction
- empty-cells
- font-family
- font-size
- font-style
- font-variant
- font-weight
- font-size-adjust
- font-stretch
- font
- letter-spacing
- line-height
- list-style-image
- list-style-position
- list-style-type
- list-style
- orphans
- quotes
- tab-size
- text-align
- text-align-last
- text-decoration-color
- text-indent
- text-justify
- text-shadow
- text-transform
- visibility
- white-space
- widows
- word-break
- word-spacing
- word-wrap
