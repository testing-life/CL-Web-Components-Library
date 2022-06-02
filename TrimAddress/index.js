const template = document.createElement('template');
template.innerHTML = `
    <style>
      :host {
        --background: lightblue;
      }
        span {
            background: var(--background);
        }
    </style>
    <span id='content'></span>
`;

class TrimAddress extends HTMLElement {
  constructor() {
    super();
    this.content = '';
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.querySelector('#content').textContent = 'test';
  }

  static get observedAttributes() {
    return ['wallet-address'];
  }

  truncateAddress(address) {
    const regex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = address?.match(regex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const content = this.truncateAddress(newValue);
    if (name === 'wallet-address') {
      this.shadowRoot.querySelector('#content').textContent = content;
    }
  }
}

window.customElements.define('trim-address', TrimAddress);
