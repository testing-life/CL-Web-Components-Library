const EnsLookupTemplate = document.createElement('template');
EnsLookupTemplate.innerHTML = `
    <style>
      :host {
        --borderShorthand: 1px solid plum;
        --labelBackground: lightblue;
        --outlineShorthand: 1px solid olive;
        --inputBackground: lightsteelblue;
        --buttonBackground: wheat;
        --inputBorderShorthand: 1px solid sienna;
        --borderRadiusShorthand: 5px;
        --errorColour: firebrick;
        --paddingShorthand: 5px;
        --marginShorthand: 5px 0 5px 0;
        --textDecoration: none;
        --textBorderBottomShorthand: 2px dotted sienna;
        --labelFontSize: inherit;
        --inputFontSize: inherit;
        --buttonFontSize: inherit;
      }

      * {
        font-size: inherit;
        font-family: inherit;
        color:inherit;
      }
     
      :is(.boxy) .inputWrapper {
        display:flex;
        align-items: stretch;
        border-radius: var(--borderRadiusShorthand);
        border: var(--borderShorthand);
        padding: var(--paddingShorthand);
        gap: 5px;
        background: var(--inputBackground);
        margin: var(--marginShorthand);
      }

      :is(.boxy) .inputWrapper:focus,
      :is(.boxy) .inputWrapper:hover {
        outline: var(--outlineShorthand);
      }

      :is(.boxy) input {
        flex: 1;
        border: none;
        padding: var(--paddingShorthand);
        background: transparent;
      }

      :is(.boxy) input:focus {
        outline: none;
      }

      :is(.boxy) button {
        border-radius: var(--borderRadiusShorthand);
        border: 0;
        padding: var(--paddingShorthand);
      }

      button:hover,
      button:focus {
        cursor: pointer;
      }

      input {
        font-size: var(--inputFontSize);
      }

      label {
        font-size: var(--labelFontSize);
      }

      button {
        background: var(--buttonBackground);
        font-size: var(--buttonFontSize)
      }

      .result {
        color: var(--errorColour);
      }

      .isHidden {
        display: none;
      }

    </style>
    <div id='ensLookup'>
      <label>
        <slot name="input-label"></slot>
      </label>
      <div class='inputWrapper'>
        <input id='EnsLookup' value type='text' />
      </div>
      <span class='result isHidden'></span>
    </div>
`;

class EnsLookup extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(EnsLookupTemplate.content.cloneNode(true));
    this.invalid = false;
    this.$wrapper = this.shadowRoot.querySelector('#ensLookup');
    this.$input = this.shadowRoot.querySelector('input');
    this.$label = this.shadowRoot.querySelector('label');
    this.$result = this.shadowRoot.querySelector('.result');
  }

  static get observedAttributes() {
    return ['query'];
  }

  connectedCallback() {
    if (this.$input.isConnected) {
      this.$input.oninput = e => {
        this.dispatchEvent(new CustomEvent('ensLookupChanged', { detail: { maxValue: e.target.value } }));
      };
      this.$input.setAttribute('placeholder', '0xf0...');

      if (this.attributes['input']) {
        const attrMap = this.attributes.getNamedItem('input');
        this.$input.value = attrMap.value;
      }

      if (this.$label.isConnected) {
        this.$label.addEventListener('click', () => {
          this.$input.focus();
        });
      }

      this.$input.addEventListener('input', event => {
        if (!event.target.value && this.hasAttribute('required')) {
          console.log('event.target.value', event.target.value);
          this.invalid = true;
        } else {
          this.invalid = false;
          this.value = event.target.value;
          this.setAttribute('input', event.target.value);
        }
      });
    }
  }

  showValidationMessage(direction) {
    if (direction === 'show') {
      this.$error.classList.remove('isHidden');
    }
    if (direction === 'hide') {
      if (!this.$error.classList.contains('isHidden')) this.$error.classList.add('isHidden');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'query') {
      console.log('newValue', newValue);
      // this.$error.innerText = !newValue ? 'This field is required.' : newValue;
      // if (!newValue && !this.invalid) {
      //   this.showValidationMessage('hide');
      // } else {
      //   this.showValidationMessage('show');
      // }
    }
  }
}

window.customElements.define('ens-lookup', EnsLookup);
