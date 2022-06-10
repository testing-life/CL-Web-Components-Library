const maxInputTemplate = document.createElement('template');
maxInputTemplate.innerHTML = `
    <style>
      :host {
        --labelBackground: lightblue;
        --inputBackground: lightgreen;
        --buttonBackground: brown;
        --inputBorderShorthand: 2px solid green;
        --borderRadiusShorthand: 10% 20% 30% 40%;
        --errorColour: red;
      }
      label {
          background: var(--labelBackground);          
      }
      input {
        background: var(--inputBackground);          
        border: var(--inputBorderShorthand);          
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
    <div id='maxInput'>
      <label for='maxInput'>
        <slot name="input-label">Max Input</slot>
      </label>
        <input id='maxInput' value type='text' />
        <span class='errorMessage isHidden'></span>
        <button>MAX</button>
    </div>
`;

class MaxInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(maxInputTemplate.content.cloneNode(true));
    this.invalid = false;
    this.$input = this.shadowRoot.querySelector('input');
    this.$error = this.shadowRoot.querySelector('.errorMessage');
    this.$maxButton = this.shadowRoot.querySelector('button');
    this.$input.setAttribute('placeholder', 'issa placeholder');
    this.$input.oninput = e => {
      this.dispatchEvent(new CustomEvent('maxInputChanged', { detail: { maxValue: e.target.value } }));
    };
  }

  static get observedAttributes() {
    return ['errorMessage'];
  }

  connectedCallback() {
    if (this.attributes['inputValue']) {
      const attrMap = this.attributes.getNamedItem('inputValue');
      this.$input.value = attrMap.value;
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
    if (name === 'errorMessage') {
      console.log('content', name, newValue);
      this.$error.innerText = !newValue ? 'This field is required.' : newValue;
      if (!newValue && !this.invalid) {
        this.showValidationMessage('hide');
      } else {
        this.showValidationMessage('show');
      }
    }
  }

  maximiseValue() {
    if (this.attributes['maxValue']) {
      this.$input.value = this.getAttribute('maxValue');
      this.$input.dispatchEvent(new Event('input'));
    }
  }
}

window.customElements.define('max-input', MaxInput);
