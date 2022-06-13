const maxInputTemplate = document.createElement('template');
maxInputTemplate.innerHTML = `
    <style>
      :host {
        --borderShorthand: 1px solid blue;
        --labelBackground: lightblue;
        --inputBackground: lightgreen;
        --buttonBackground: brown;
        --inputBorderShorthand: 2px solid green;
        --borderRadiusShorthand: 10% 20% 30% 40%;
        --errorColour: red;
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
        border-radius: 5px;
        border: 1px solid red;
        padding: 5px;
        gap: 5px;
      }

      :is(.boxy) .inputWrapper:focus,
      :is(.boxy) .inputWrapper:hover {
        outline: 1px solid blue;
      }

      :is(.boxy) input {
        flex: 1;
        border: none;
        padding: 5px;
        background: transparent;
      }

      :is(.boxy) input:focus {
        outline: none;
      }

      :is(.boxy) button {
        right: 0;
        border-radius: 5px;
        margin-right: 5px;
        border: 0;
        padding: 5px;
      }

  
      button:hover,
      button:focus {
        cursor: pointer;
      }

      .errorMessage {
        color: var(--errorColour);
      }

      .isHidden {
        display: none;
      }
    </style>
    <div id='maxInput' class='texty'>
      <label for='maxInput'>
        <slot name="input-label">Max Input</slot>
      </label>
      <div class='inputWrapper'>
        <input id='maxInput' value type='text' />
        <button>MAX</button>
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
    }

    this.$maxButton.onclick = () => this.maximiseValue();

    if (this.$input.isConnected) {
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
      console.log('layout', name, newValue);
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
