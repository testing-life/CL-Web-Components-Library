const autoCompleteSelectTemplate = document.createElement('template');
autoCompleteSelectTemplate.innerHTML = `
    <style>
      :host {
        --borderRadius: 5px;
        --spacingSmall: 5px;
        --spacingNormal: 10px;
        --backgroundNormal: lightsteelblue;
        --borderNormal: plum;
        --borderHighlight: pink;
        --optionHover: pink;
        --textNormal: black;
        --textError: red;
        --buttonIconCode: "\\F002";
      } 

      #selectInput {
        font-size: inherit;
        font-family: inherit;
        color:inherit;
        background: var(--backgroundNormal);
        display: flex;
        width: 100%;
        flex-direction: column;
        padding: var(--spacingSmall);
        border: 1px solid var(--borderNormal);
        border-radius: var(--borderRadius);
        box-sizing: border-box;
      }

      #selectInput.open {
        border-radius: var(--borderRadius) var(--borderRadius) 0 0;
      }

      .inputWrapper {
        display: flex;
        width: inherit;
      }

      button {
        border: none;
        background: none;
        color: var(--textNormal);
      }
 
      button:hover,
      button:focus {
        cursor: pointer;
      }

      #textInput {
        font-size: var(--inputFontSize);
        background: inherit;
        color: var(--textNormal);
        outline: none;
        border: none;
        flex: 1;
        line-height: 27px;
      }

      .optionsWrapper {
        background: var(--backgroundNormal);
        position: absolute;
        max-height: 135px;
        overflow: auto;
        display: flex;
        margin-top: calc(var(--spacingSmall) * 2 + 27px - 4px);
        width: calc(100% - 2px - 14px);
        z-index: 9999;
        padding: 5px 0;
        box-sizing: border-box;
        margin-left: -6px;
        border-radius: 0 0 var(--borderRadius) var(--borderRadius);
        border: 1px solid var(--borderNormal);
        border-top: 1px solid var(--borderNormal);
        flex-direction: column;
      }

      label {
        font-size: var(--labelFontSize);
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
      }

      li {
        cursor: pointer;
        color: var(--textNormal);
        display: flex;
        gap: 5px;
        align-items: center;
        width: calc(100% - 10px);
        padding: 5px;
      }

      li>img {
        border-radius: 50%;
      }

      li:hover {
        background-color: var(--optionHover);
      }
      
      .noResult {
        display:flex
      }
      
      .errorMessage {
        color: var(--textError);
      }

      .isHidden {
        clip: rect(0 0 0 0); 
        clip-path: inset(50%);
        height: 1px;
        overflow: hidden;
        position: absolute;
        white-space: nowrap; 
        width: 1px;
      }
    </style>

    <div id='selectInput'>
      <label>
        <slot name="input-label"></slot>
      </label>

      <div class='inputWrapper'>
        <input id='textInput' value type='text' />
        <button class='clear isHidden'>X</button>
      </div>

      <div class='optionsWrapper isHidden'>
        <div class='noResult'>
          <p class='noResult__msg'>Add new DAO manually</p>
          <button class='addOption'>+</button>
        </div>
      </div>
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
    this.$clearButton = this.shadowRoot.querySelector('.clear');
    this.$noResultMsg = this.shadowRoot.querySelector('.noResult__msg');
  }

  static get observedAttributes() {
    return ['message', 'options'];
  }

  connectedCallback() {

    if(this.$clearButton.isConnected) {
      this.$clearButton.addEventListener('click', e => {
        this.$input.value = '';
        this.buildList(this._options);
      });
    }

    if (this.$addButton.isConnected) {
      this.$addButton.addEventListener('click', e => {
        const newItem = { name: this._tempQuery, avatarUrl: "", treasuryAddresses: [], id: Date.now().toString() };
        if (newItem && (this._options.filter(option => option.name === newItem)).length === 0) {
          this._options.push(newItem);
          this.buildList(this._options);
          this.dispatchEvent(new CustomEvent('newDaoAdded', { detail: { newDao: newItem } }));
          this.dispatchEvent(new CustomEvent('daoSelectionChanged', { detail: { ...newItem } }));
        }
        this.$addButton.blur();
        if (this.$clearButton.classList.contains('isHidden')){
          this.$clearButton.classList.remove('isHidden');
        }
      });
    }

    if (this.$inputWrapper.isConnected) {
      document.onclick = e => {
        this.$optionsWrapper.classList[this.$inputWrapper.contains(this.shadowRoot.activeElement) ? 'remove' : 'add'](
          'isHidden',
        );
        this.$wrapper.classList[this.$inputWrapper.contains(this.shadowRoot.activeElement) ? 'add' : 'remove'](
          'open',
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
        if(option.avatarUrl) {
          img.setAttribute("src",option.avatarUrl);
          img.setAttribute("width", 20);
          li.appendChild(img);
        }
        span.innerText = option.name;
        li.appendChild(span);
        li.classList.add("listItem");
        li.addEventListener("click", (e) => {
          this.$input.value = e.target.innerText;
          this.dispatchEvent(new CustomEvent('daoSelectionChanged', { detail: { ...option } }));
          if (this.$clearButton.classList.contains('isHidden')){
            this.$clearButton.classList.remove('isHidden');
          }
        });
        listFragment.appendChild(li);
      } catch (error) {
        console.error(error);
      }
    });
    ul.append(listFragment);
    this.$optionsWrapper.insertAdjacentElement('beforeend', ul);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'options' && newValue) {
      this._options = JSON.parse(newValue);
      this.buildList(JSON.parse(newValue));
    }
  }
}

window.customElements.define('autocomplete-select', AutoCompleteSelect);
