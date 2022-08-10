const autoCompleteSelectTemplate = document.createElement('template');
autoCompleteSelectTemplate.innerHTML = `
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
      .inputWrapper {
        background: pink;
      }
      
      .texty {
        display: flex;
        flex-direction: column;
        align-items: baseline;
      }

      :is(.texty) button {
        border: none;
        background: transparent;
        text-decoration: var(--textDecoration);
        border-bottom: var(--textBorderBottomShorthand);
      }

      :is(.texty) label,
      :is(.texty) input {
        margin-right: 10px
      }

      :is(.texty) input {
        border:none;
        background: transparent;
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

      input, #textInput {
        font-size: var(--inputFontSize);
      }

      .optionsWrapper {
        background: white;
        border: 1px solid black;
        position: absolute;
        margin-top: 20px;
        max-height: 200px;
        overflow-y: auto;
      }

      label {
        font-size: var(--labelFontSize);
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      li {
        cursor: pointer;
      }
      li:hover {
        background-color: pink;
      }

      .errorMessage {
        color: var(--errorColour);
      }

      .isHidden {
        display: none;
      }
    </style>
    <div id='selectInput' class='texty'>
      <label>
        <slot name="input-label"></slot>
      </label>
      <div class='inputWrapper'>
        <input id='textInput' value type='text' />
        <button class='addOption'>+</button>
      </div>
      <span class='errorMessage isHidden'></span>
      <div class='optionsWrapper isHidden'></div>
    </div>
`;

class AutoCompleteSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(autoCompleteSelectTemplate.content.cloneNode(true));
    this._options = [];
    this._filteredOptions = [];
    this.$wrapper = this.shadowRoot.querySelector('#selectInput');
    this.$input = this.shadowRoot.querySelector('input');
    this.$inputWrapper = this.shadowRoot.querySelector('.inputWrapper');
    this.$optionsWrapper = this.shadowRoot.querySelector('.optionsWrapper');
    this.$addButton = this.shadowRoot.querySelector('.addOption');
  }

  static get observedAttributes() {
    return ['error', 'options'];
  }

  connectedCallback() {
    if (this.$addButton.isConnected) {
      this.$addButton.addEventListener('click', e => {
        const newItem = { name: this.$input.value, avatarUrl: "", treasuryAddresses: [], id: Date.now().toString() };
        if (newItem && (this._options.filter(option => option.name === newItem)).length === 0) {
          this._options.push(newItem);
          this.buildList(this._options);
          this.dispatchEvent(new CustomEvent('newDaoAdded', { detail: { newDao: newItem } }));
          this.dispatchEvent(new CustomEvent('daoSelectionChanged', { detail: { ...newItem } }));
        }
        this.$addButton.blur();
      });
    }

    if (this.$inputWrapper.isConnected) {
      document.onclick = e => {
        this.$optionsWrapper.classList[this.$inputWrapper.contains(this.shadowRoot.activeElement) ? 'remove' : 'add'](
          'isHidden',
        );
      };
    }

    if (this.$input.isConnected) {
      this.$input.addEventListener('input', e => {
        const filteredList = e.target.value
          ? this._options.filter(option => option.name.toLowerCase().includes(e.target.value.toLowerCase()))
          : this._options;
        this.buildList(filteredList);

      });
    }
  }
 
  buildList(data) {
    const existingList = this.shadowRoot.querySelector('.optionsWrapper ul');
    if (existingList) {
      existingList.remove();
    }
    const ul = document.createElement('ul');
    const listFragment = document.createDocumentFragment();
    data.forEach(option => {
      try {
        const img = document.createElement('img')
        const span = document.createElement('span');
        const li = document.createElement('li')
        img.setAttribute("src",option.avatarUrl);
        img.setAttribute("width", 20);
        span.innerText = option.name;
        li.appendChild(img)
        li.appendChild(span);
        li.classList.add("listItem");
        li.addEventListener("click", (e) => {
          this.$input.value = e.target.innerText;
          this.dispatchEvent(new CustomEvent('daoSelectionChanged', { detail: { ...option } }));
        });
        listFragment.appendChild(li);
      } catch (error) {
        console.error(error);
      }
    });
    ul.append(listFragment);
    this.$optionsWrapper.append(ul);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'options') {
      this._options = JSON.parse(newValue);
      this.buildList(JSON.parse(newValue));
    }
  }
}

window.customElements.define('autocomplete-select', AutoCompleteSelect);
