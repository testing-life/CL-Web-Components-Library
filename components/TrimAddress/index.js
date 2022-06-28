const template = document.createElement('template');
template.innerHTML = `
    <style>
      :host {
        --background: lightblue;
        --fontFamily: inherit;
        --fontSize: inherit;
        --fontWeight: inherit;
        --borderRadiusShorthand: 2px;
        --padding: 5px;
      }

      span {
          background: var(--background);
          font-family: var(--fontFamily);
          font-size: var(--fontSize);
          font-weight: var(--fontWeight);
          border-radius: var(--borderRadiusShorthand);
          padding: var(--padding);
      }
    </style>
    <span id='content'>Wallet address</span>
`;

class TrimAddress extends HTMLElement {
  constructor() {
    super();
    this.content = '';
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.$content = this.shadowRoot.querySelector('#content');
  }

  static get observedAttributes() {
    return ['wallet'];
  }

  connectedCallback() {
    if (this.$content.isConnected) {
      if (this.attributes['address']) {
        if (this.getAttribute('address')) {
          this.$content.textContent = this.getAttribute('address');
        }
      }
    }
  }

  truncateAddress(address) {
    const regex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = address?.match(regex);
    if (!match) return address;
    return `${match[1]}…${match[2]}`;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    const content = this.truncateAddress(newValue);
    if (name === 'wallet') {
      if (newValue) {
        this.shadowRoot.querySelector('#content').textContent = content;
      }
    }
  }
}

window.customElements.define('trim-address', TrimAddress);
