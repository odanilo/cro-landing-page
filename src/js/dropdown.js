const IS_OPEN_CLASS = 'select--is-open';
const IS_PLACEHOLDER_CLASS = 'select--is-placeholder';

class Dropdown {
  constructor(dropdownNode) {
    this.dropdown = dropdownNode;
    this.isOpen = false;
    this.placeholderOption = dropdownNode.value;
    this.isOnPlaceholder = true;
    this.options = dropdownNode.options;
    this.actualValue = null;
  }

  setIsOpen(isOpen = false) {
    this.isOpen = isOpen;
    this.dropdown.classList.toggle(IS_OPEN_CLASS, isOpen);
  }

  setIsOnPlaceholder() {
    const isPlaceholder = this.actualValue === this.placeholderOption;
    this.isOnPlaceholder = isPlaceholder;

    this.dropdown.classList.toggle(IS_PLACEHOLDER_CLASS, isPlaceholder);
  }

  setActualValue() {
    this.actualValue = this.dropdown.value;

    this.setIsOnPlaceholder();
  }

  #focusDropdown() {
    if (document.activeElement !== this.dropdown) {
      this.dropdown.focus();
    }
  }

  init() {
    this.setActualValue();
    this.setIsOpen();

    this.dropdown.addEventListener('mousedown', () => {
      this.setIsOpen(true);
      this.#focusDropdown();
    });

    this.dropdown.addEventListener('pointerdown', () => {
      this.setIsOpen(true);
      this.#focusDropdown();
    });

    this.dropdown.addEventListener('change', () => {
      this.setIsOpen(false);
      this.setActualValue();

      if (document.activeElement !== this.dropdown) {
        this.#focusDropdown();
      }
    });

    this.dropdown.addEventListener('blur', () => {
      this.setIsOpen(false);
    });

    this.dropdown.addEventListener('keydown', (event) => {
      if (
        event.key === ' ' ||
        event.key === 'Enter' ||
        event.key === 'ArrowDown' ||
        event.key === 'ArrowUp'
      ) {
        this.setIsOpen(true);
      }

      if (event.key === 'Escape') {
        this.setIsOpen(false);
      }
    });
  }
}

const dropdownList = document.querySelectorAll('select');

dropdownList.forEach((dropdownNode) => {
  const dropdown = new Dropdown(dropdownNode);
  dropdown.init();
});
