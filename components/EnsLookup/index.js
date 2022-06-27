const EnsLookupTemplate = document.createElement('template');
EnsLookupTemplate.innerHTML = `
    <style>
      :host {
        --borderShorthand: 1px solid plum;
        --labelBackground: lightblue;
        --outlineShorthand: 1px solid olive;
        --inputBackground: lightsteelblue;
        --inputBorderShorthand: 1px solid sienna;
        --borderRadiusShorthand: 5px;
        --errorColour: firebrick;
        --paddingShorthand: 5px;
        --marginShorthand: 5px 0 5px 0;
        --labelFontSize: inherit;
        --inputFontSize: inherit;
      }

      * {
        font-size: inherit;
        font-family: inherit;
        color:inherit;
      }
   
      input:focus,
      input:hover {
        outline: var(--outlineShorthand);
      }

      .isError {
        color: var(--errorColour);
      }
      
      input {
        font-size: var(--inputFontSize);
        padding: var(--paddingShorthand);
        border-radius: var(--borderRadiusShorthand);
        border: var(--inputBorderShorthand);
        margin: var(--marginShorthand);
        background: var(--inputBackground);
      }

      label {
        font-size: var(--labelFontSize);
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
        <input id='ensLookup' value type='text' />
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
    return ['result', 'error'];
  }

  connectedCallback() {
    if (this.$input.isConnected) {
      console.log('window', window);
      this.$input.oninput = e => {
        this.dispatchEvent(new CustomEvent('ensLookupChanged', { detail: { query: e.target.value } }));
      };
      this.$input.setAttribute('placeholder', '0x...');

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
          this.invalid = true;
        } else {
          this.invalid = false;
          this.value = event.target.value;
          this.setAttribute('input', event.target.value);
        }
      });
    }
  }

  showResultMessage(direction) {
    if (direction === 'show') {
      this.$result.classList.remove('isHidden');
    }
    if (direction === 'hide') {
      if (!this.$result.classList.contains('isHidden')) this.$error.classList.add('isHidden');
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'result') {
      this.$result.textContent = newValue;
      if (!this.$result.classList.contains('isError')) this.$result.classList.remove('isError');
      if (!newValue && !this.invalid) {
        this.showResultMessage('hide');
      } else {
        this.showResultMessage('show');
      }
    }

    if (name === 'error' && newValue) {
      this.$result.classList.add('isError');
      this.$result.textContent = newValue;
      if (!newValue && !this.invalid) {
        this.showResultMessage('hide');
      } else {
        this.showResultMessage('show');
      }
    }
  }
}

window.customElements.define('ens-lookup', EnsLookup);
