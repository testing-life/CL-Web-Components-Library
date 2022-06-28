# Web Components Library

Exposed CSS properties for styling and default values:

## `max-input` component

Example:

```
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
`<trim-address wallet="0x71C7656EC7ab88b098defB751B7401B5f6d8976F"></trim-address>`

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
`<ens-lookup result="" error=""> </ens-lookup>`

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

## React use example

Web components need to be wrapped up in a React component, which then can be used as any other component in the app.

`MaxInputWebComponent.tsx`

```
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

```
<MaxInputWebComponent
    input={txValues.fromValueFormatted || '0'}
    max={balances && getMaxAllowance(balances, from)}
    onChange={onChangeFrom}
    layout={'texty'}
    label="SEC"
    error={!!estimatesError || !!balanceError ? 'Amount entered exceeds wallet balance' : ''}
/>
```
