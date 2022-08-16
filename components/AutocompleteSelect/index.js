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
        --textWarning: orange;
        --maxScrollerHeight: 135px;
        --inputboxHeight: 46px;
        --avatarSize: 32px;
      }

      #selectInput {
        font-size: inherit;
        font-family: inherit;
        color:inherit;
        background: var(--backgroundNormal);
        position: relative;
        width: 100%;
        height: 100%;
        border: 1px solid var(--borderNormal);
        border-radius: var(--borderRadius);
        box-sizing: border-box;
      }

      #selectInput.open {
        border-color: var(--borderHighlight);
        border-radius: var(--borderRadius) var(--borderRadius) 0 0;
      }

      .inputWrapper {
        display: flex;
        align-items: center;
        width: inherit;
        height: inherit;
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
        padding: var(--spacingNormal);
      }

      .optionsWrapper {
        position: absolute;
        overflow-x: hidden;
        overflow-y: auto;
        text-overflow: ellipsis;
        background: var(--backgroundNormal);
        max-height: var(--maxScrollerHeight);
        z-index: 1;
        width: inherit;
        padding: 5px 0;
        border-radius: 0 0 var(--borderRadius) var(--borderRadius);
        border: 1px solid var(--borderHighlight);
        border-top: 1px solid var(--borderNormal);
        margin-left: -1px;
        transform-origin: center top;
        transition: transform 0.2s, opacity 0.2s;
        transform: scaleY(1);
        opacity: 1;
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

      .listItem>button {
        cursor: pointer;
        color: var(--textNormal);
        display: flex;
        gap: var(--spacingSmall);
        align-items: center;
        width: calc(100% - var(--spacingSmall) * 2);
        padding: var(--spacingSmall);
      }

      .listItem>button>img {
        border-radius: 50%;
        width: var(--avatarSize);
        height: var(--avatarSize);
      }

      .listItem:focus,
      .listItem:hover {
        background-color: var(--optionHover);
      }

      .noResult>button>span {
        display:flex;
        color: var(--textWarning);
      }

      .noResult>button>slot {
        color: var(--textWarning);
        font-size: var(--avatarSize);
        padding: 0;
      }

      .errorMessage {
        color: var(--textError);
      }

      .isHidden {
        opacity: 0;
        transform: scaleY(0);
        transition: transform 0.2s, opacity 0.2s;
        overflow: hidden;
        position: absolute;
        white-space: nowrap; 
      }
    </style>

    <div id='selectInput'>
      <label>
        <slot name="input-label"></slot>
      </label>

      <div class='inputWrapper'>
        <input id='textInput' type='text' />
        <button class='clear isHidden'><slot name="button-icon-close">X</slot></button>
        <button><slot name="button-icon-search"></slot></button>
      </div>

      <div class='optionsWrapper isHidden'>
        <div class='noResult addOption listItem isHidden'>
          <button class='addOption__btn'>
            <slot name="button-icon-add">+</slot>
            <span class='noResult__msg'></span>
          </button>
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
    this._placeholder = 'Search...';
    this._searchText = "Not found. Add '%VAL%' manually...";
    this._filteredOptions = [];
    this.$wrapper = this.shadowRoot.querySelector('#selectInput');
    this.$input = this.shadowRoot.querySelector('input');
    this.$inputWrapper = this.shadowRoot.querySelector('.inputWrapper');
    this.$optionsWrapper = this.shadowRoot.querySelector('.optionsWrapper');
    this.$addButton = this.shadowRoot.querySelector('.addOption');
    this.$clearButton = this.shadowRoot.querySelector('.clear');
    this.$noResultMsg = this.shadowRoot.querySelector('.noResult__msg');
    this.elemIndex = 0;
  }

  static get observedAttributes() {
    return ['value', 'options', 'placeholder', 'search-text'];
  }

  clampNumber(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  connectedCallback() {
    if (this.$clearButton.isConnected) {
      this.$clearButton.addEventListener('click', e => {
        this.$input.value = '';
        this.$clearButton.classList.add('isHidden');
        this.buildList(this._options);
        this.dispatchEvent(new CustomEvent('inputCleared', {}));
      });
    }

    if (this.$addButton.isConnected) {
      this.$addButton.addEventListener('click', () => this.addDaoHandler(this.$input));
    }

    if (this.$wrapper.isConnected) {
      this.shadowRoot.addEventListener(
        'keydown',
        event => {
          const name = event.key;
          const code = event.code;
          if (name === 'Control') {
            // Do nothing.
            return;
          }
          let elem = null;
          const children = this.shadowRoot.querySelector('ul').children;

          switch (code) {
            case 'ArrowDown':
              elem = children.item(this.elemIndex);
              elem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              elem.firstElementChild.focus();

              this.elemIndex = this.clampNumber(this.elemIndex + 1, 0, children.length - 1);
              break;
            case 'ArrowUp':
              elem = children.item(this.elemIndex);
              elem.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
              elem.firstElementChild.focus();
              this.elemIndex = this.clampNumber(this.elemIndex - 1, 0, children.length - 1);
              break;

            default:
              break;
          }
        },
        false,
      );
    }

    if (this.$inputWrapper.isConnected) {
      document.addEventListener('click', e => {
        const hasActive = this.$inputWrapper.contains(this.shadowRoot.activeElement);
        this.$optionsWrapper.classList[hasActive ? 'remove' : 'add']('isHidden');
        this.$wrapper.classList[hasActive ? 'add' : 'remove']('open');
      });
    }

    if (this.$input.isConnected) {
      this.$input.placeholder = this._placeholder.trim();
      this.$input.addEventListener('input', e => this.inputChangedHandler(e.target.value));
      this.$input.addEventListener('keydown', e => {
        const code = e.code;
        if (code === 'Enter') {
          this.addDaoHandler(e.target);
        }
      });
    }
  }

  inputChangedHandler = (value) => {
    const noResultText = this._searchText
      .replace('%VAL%', this.$input.value)
      .trim();
    this.$optionsWrapper.classList.remove('isHidden');
    this.$wrapper.classList.add('open');
    const filteredList = value
      ? this._options.filter(option => option.name.toLowerCase().includes(value.toLowerCase()))
      : this._options;
    if (
      !value.trim() ||
      this._options.filter(option => option.name.toLowerCase() === value.toLowerCase().trim()).length ===
        1
    ) {
      this.$addButton.classList.add('isHidden');
    } else {
      this.$noResultMsg.innerHTML = noResultText;
      this.$addButton.classList.remove('isHidden');
    }
    this.buildList(filteredList);
    const result = filteredList.find(item => item.name === this.$input.value) ||
      {
        name: this.$input.value, 
        avatarUrl: '', 
        treasuryAddresses: [], 
        id: Date.now().toString() 
      };
    this.dispatchEvent(new CustomEvent('daoSelectionChanged', { detail: { ...result } }));
  }

  addDaoHandler() {
    const newItem = { name: this.$input.value, avatarUrl: '', treasuryAddresses: [], id: Date.now().toString() };
    if (newItem.name && this._options.filter(option => option.name === newItem.name).length === 0) {
      this._options.push(newItem);
      this.buildList(this._options);
      this.$addButton.classList.add('isHidden');
      this.$optionsWrapper.classList.add('isHidden');
      this.$wrapper.classList.remove('open');
      this.dispatchEvent(new CustomEvent('newDaoAdded', { detail: { newDao: newItem } }));
      this.dispatchEvent(new CustomEvent('daoSelectionChanged', { detail: { ...newItem } }));
    }
    this.$addButton.blur();
    if (this.$clearButton.classList.contains('isHidden')) {
      this.$clearButton.classList.remove('isHidden');
    }
  }

  buildList(data) {
    const existingList = this.shadowRoot.querySelector('.optionsWrapper ul');
    if (existingList) {
      existingList.remove();
    }
    const ul = document.createElement('ul');
    this.$input.addEventListener('input', e => {
      this.$clearButton.classList[e.target.value.length > 0 ? 'remove' : 'add']('isHidden');
    });
    ul.addEventListener('click', e => {
      const id = e.target.dataset.daoId || e.target.closest('li').dataset.daoId;
      if (!id) {
        return;
      }
      const result = this._options.find(item => item.id === id);
      if (result) {
        this.$input.value = e.target.innerText;
        this.dispatchEvent(new CustomEvent('daoSelectionChanged', { detail: { ...result } }));
        if (this.$clearButton.classList.contains('isHidden')) {
          this.$clearButton.classList.remove('isHidden');
        }
      }
    });

    const listFragment = document.createDocumentFragment();
    data.forEach((option, index) => {
      try {
        const img = document.createElement('img');
        const span = document.createElement('span');
        const li = document.createElement('li');
        const button = document.createElement('button');
        if (option.avatarUrl) {
          img.setAttribute('src', option.avatarUrl);
          img.setAttribute('width', 20);
          button.appendChild(img);
        }
        span.innerText = option.name;
        button.appendChild(span);
        li.classList.add('listItem');
        li.setAttribute('data-dao-id', option.id);
        li.append(button);
        listFragment.appendChild(li);
      } catch (error) {
        console.error(error);
      }
    });
    ul.append(listFragment);
    this.$optionsWrapper.insertAdjacentElement('beforeend', ul);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!newValue || !name) return;
    if (name === 'options') {
      this._options = JSON.parse(newValue);
      this.buildList(JSON.parse(newValue));
    } else {
      const temp = name.split('-');
      let joined = temp.shift(0);
      temp.forEach(a => {
        joined += a[0].toUpperCase() + a.substring(1);
      });
      this['_' + joined] = newValue;
    }
    if (this.$input.isConnected && name === 'value') {
      this.$input.value = this._value;
      this.inputChangedHandler(this._value);
    }
  }
}

window.customElements.define('autocomplete-select', AutoCompleteSelect);
