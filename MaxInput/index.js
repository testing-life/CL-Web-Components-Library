const maxInputTemplate = document.createElement('template');
maxInputTemplate.innerHTML = `
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
      }

      .texty {
        display: flex;
        align-items: baseline;
      }

      :is(.texty) button {
        border: none;
        background: transparent;
        text-decoration: underline;
      }

      :is(.texty) label,
      :is(.texty) input {
        margin-right: 10px
      }

      :is(.texty) input {
        border:none;
      }

      :is(.boxy) .inputWrapper {
        display:flex;
        align-items: stretch;
        border-radius: var(--borderRadiusShorthand);
        border: var(--borderShorthand);
        padding: var(--paddingShorthand);
        gap: 5px;
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


      button {
        background: var(--buttonBackground);
      }

      .errorMessage {
        color: var(--errorColour);
      }

      .isHidden {
        display: none;
      }

    </style>
    <div id='maxInput' class='texty'>
      <label>
        <slot name="input-label"></slot>
      </label>
      <div class='inputWrapper'>
        <input id='maxInput' value type='text' />
        <button>MAX</button>
      </div>
      <span class='errorMessage isHidden'></span>
    </div>
`;

class MaxInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(maxInputTemplate.content.cloneNode(true));
    this.invalid = false;
    this.$wrapper = this.shadowRoot.querySelector('#maxInput');
    this.$input = this.shadowRoot.querySelector('input');
    this.$label = this.shadowRoot.querySelector('label');
    this.$error = this.shadowRoot.querySelector('.errorMessage');
    this.$maxButton = this.shadowRoot.querySelector('button');
    this.$input.setAttribute('placeholder', 'Enter value');
    this.$input.oninput = e => {
      this.dispatchEvent(new CustomEvent('maxInputChanged', { detail: { maxValue: e.target.value } }));
    };
  }

  static get observedAttributes() {
    return ['error, layout'];
  }

  connectedCallback() {
    if (this.attributes['input']) {
      const attrMap = this.attributes.getNamedItem('input');
      this.$input.value = attrMap.value;
    }

    if (this.attributes['layout']) {
      this.$wrapper.classList.replace('texty', this.getAttribute('layout'));
      if (this.getAttribute('layout') === 'texty') {
        this.$maxButton.innerHTML = 'Max amount';
      }
    }

    this.$maxButton.onclick = () => this.maximiseValue();

    if (this.$input.isConnected) {
      if (this.$label.isConnected) {
        this.$label.addEventListener('click', () => {
          this.$input.focus();
        });
      }

      this.$input.addEventListener('input', event => {
        if (!event.target.value && this.hasAttribute('required')) {
          this.invalid = true;
          this.$error.innerText = 'This field is required.';
          this.showValidationMessage('show');
        } else {
          this.invalid = false;
          this.showValidationMessage('hide');
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
    console.log('attrs', name, newValue);
    if (name === 'error') {
      console.log('content', name, newValue);
      this.$error.innerText = !newValue ? 'This field is required.' : newValue;
      if (!newValue && !this.invalid) {
        this.showValidationMessage('hide');
      } else {
        this.showValidationMessage('show');
      }
    }

    if (name === 'layout') {
      this.classList.replace(oldValue, newValue);
    }
  }

  maximiseValue() {
    if (this.attributes['max']) {
      this.$input.value = this.getAttribute('max');
      this.$input.dispatchEvent(new Event('input'));
    }
  }
}

window.customElements.define('max-input', MaxInput);
