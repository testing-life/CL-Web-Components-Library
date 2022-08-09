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
      
      .texty {
        display: flex;
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
        background: pink;
      }

      label {
        font-size: var(--labelFontSize);
      }

      button {
        background: var(--buttonBackground);
        font-size: var(--buttonFontSize)
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
    // this.invalid = false;
    this.$wrapper = this.shadowRoot.querySelector('#selectInput');
    this.$input = this.shadowRoot.querySelector('input');
    // this.$label = this.shadowRoot.querySelector('label');
    // this.$error = this.shadowRoot.querySelector('.errorMessage');
    this.$inputWrapper = this.shadowRoot.querySelector('.inputWrapper');
    this.$addButton = this.shadowRoot.querySelector('button');
    this.$optionsWrapper = this.shadowRoot.querySelector('.optionsWrapper');
    this.$addButton = this.shadowRoot.querySelector('.addOption');
  }

  // set options(value) {
  //   this._options = value;
  // }

  // get options() {
  //   return this._options;
  // }

  static get observedAttributes() {
    return ['error', 'options'];
  }

  connectedCallback() {
    // if (this.$input.isConnected) {
    //   this.$maxButton.onclick = () => this.maximiseValue();
    //   if (this.attributes['layout']) {
    //     if (this.getAttribute('layout')) {
    //       this.$wrapper.classList.replace('texty', this.getAttribute('layout'));
    //       this.toggleButtonLabel(this.getAttribute('layout'));
    //     }
    //   }
    // }

    // if (this.$optionsList.isConnected) {
    //   this.buildList(this._options);
    // }

    if (this.$addButton.isConnected) {
      this.$addButton.addEventListener('click', e => {
        const newItem = this.$input.value;
        if (newItem) {
          this._options.push({ name: newItem });
          this.buildList(this._options);
        }
      });
    }

    if (this.$inputWrapper.isConnected) {
      document.onclick = e => {
        console.log('document.activeElement', this.shadowRoot.activeElement);
        console.log('e.target', e.target, 'active:', this.$inputWrapper.contains(this.shadowRoot.activeElement));
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

        console.log('filter', filteredList);
      });

      // this.$input.addEventListener('focus', e => {
      //   this.$optionsWrapper.classList.remove('isHidden');
      // });

      // this.$input.addEventListener('blur', e => {
      //   this.$optionsWrapper.classList.add('isHidden');
      // });
    }
  }
  //   if (this.$input.isConnected) {
  //     // this.$input.oninput = e => {
  //     //   this.dispatchEvent(new CustomEvent('maxInputChanged', { detail: { maxValue: e.target.value } }));
  //     // };
  //     // this.$input.setAttribute('placeholder', 'Enter value');

  //     // if (this.attributes['input']) {
  //     //   const attrMap = this.attributes.getNamedItem('input');
  //     //   this.$input.value = attrMap.value;
  //     // }

  //       this.$label.addEventListener('input', (e) => {
  //         this.$input.focus();
  //       });

  //   //   this.$input.addEventListener('input', event => {
  //   //     if (!event.target.value && this.hasAttribute('required')) {
  //   //       this.invalid = true;
  //   //       this.$error.innerText = 'This field is required.';
  //   //       this.showValidationMessage('show');
  //   //     } else {
  //   //       this.invalid = false;
  //   //       this.showValidationMessage('hide');
  //   //       this.value = event.target.value;
  //   //       this.setAttribute('input', event.target.value);
  //   //     }
  //   //   });
  //   // }
  // }

  // toggleButtonLabel(layout) {
  //   if (layout === 'boxy') {
  //     this.$maxButton.innerHTML = 'MAX';
  //   } else {
  //     this.$maxButton.innerHTML = 'Max amount';
  //   }
  // }

  // showValidationMessage(direction) {
  //   if (direction === 'show') {
  //     this.$error.classList.remove('isHidden');
  //   }
  //   if (direction === 'hide') {
  //     if (!this.$error.classList.contains('isHidden')) this.$error.classList.add('isHidden');
  //   }
  // }
  buildList(data) {
    const existingList = this.shadowRoot.querySelector('.optionsWrapper ul');
    if (existingList) {
      existingList.remove();
    }
    const ul = document.createElement('ul');
    const listFragment = document.createDocumentFragment();
    data.forEach(option => {
      try {
        const li = document.createElement('li');
        li.textContent = option.name;
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
      console.log('options', newValue, JSON.parse(newValue));
      this.buildList(JSON.parse(newValue));
    }
  }

  // maximiseValue() {
  //   if (this.attributes['max']) {
  //     this.$input.value = this.getAttribute('max');
  //     this.$input.dispatchEvent(new Event('input'));
  //   }
  // }
}

window.customElements.define('autocomplete-select', AutoCompleteSelect);
