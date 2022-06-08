const maxInputTemplate = document.createElement('template');
maxInputTemplate.innerHTML = `
    <style>
      :host {
        --background: lightblue;
      }
        label {
            background: var(--background);
        }
        .is-hidden {
          display: none;
        }
    </style>
    <div id='maxInput'>
      <label for='maxInput'>
        <slot name="input-label">Max Input</slot>
      </label>
        <input id='maxInput' value type='text' />
        <span class='error-message -is-hidden'></span>
        <button>MAX</button>
    </div>
`;

class MaxInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(maxInputTemplate.content.cloneNode(true));
    this.$input = this.shadowRoot.querySelector('input');
    this.$error = this.shadowRoot.querySelector('.error-message');
    this.$maxButton = this.shadowRoot.querySelector('button');
    this.$input.setAttribute('placeholder', 'issa placeholder');
    this.$input.oninput = e => {
      this.dispatchEvent(new CustomEvent('maxInputChanged', { detail: { maxValue: e.target.value } }));
    };
  }

  static get observedAttributes() {
    return ['input-value, max-value'];
  }

  connectedCallback() {
    if (this.attributes['input-value']) {
      const attrMap = this.attributes.getNamedItem('input-value');
      this.$input.value = attrMap.value;
    }

    this.$maxButton.onclick = () => this.maximiseValue();

    if (this.$input.isConnected) {
      this.$input.addEventListener('input', event => {
        if (!event.target.value && this.hasAttribute('required')) {
          this.invalid = true;
          this.$error.innerText = 'This field is required.';
        } else {
          this.invalid = false;
          this.value = event.target.value;
          this.setAttribute('input-value', event.target.value);
        }
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'input-value') {
      console.log('content', name, newValue);
      this.$input.value = newValue;
      // this.shadowRoot.querySelector('#content').textContent = content;
    }
    if (name === 'max-value') {
      console.log('content', name, newValue);
      // this.shadowRoot.querySelector('#content').textContent = content;
    }
  }

  maximiseValue() {
    if (this.attributes['max-value']) {
      this.$input.value = this.getAttribute('max-value');
      this.$input.dispatchEvent(new Event('input'));
    }
  }
}

window.customElements.define('max-input', MaxInput);
