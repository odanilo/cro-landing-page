class Tabs {
  constructor(groupNode) {
    this.tablistNode = groupNode;

    this.tabs = [];

    this.firstTab = null;
    this.lastTab = null;

    this.tabs = Array.from(this.tablistNode.querySelectorAll('[role=tab]'));
    this.tabpanels = [];

    this.activeBtnClassList = 'btn-primary';
    this.inactiveBtnClassList = 'btn-light';

    this.tabPanelHiddenClass = 'hidden';
  }

  setTabsAttributes(tab, isActive = false) {
    tab.setAttribute('aria-selected', isActive);

    if (isActive) {
      tab.removeAttribute('tabindex');
      tab.classList.add(this.activeBtnClassList);
      tab.classList.remove(this.inactiveBtnClassList);
    }

    if (!isActive) {
      tab.tabIndex = -1;
      tab.classList.remove(this.activeBtnClassList);
      tab.classList.add(this.inactiveBtnClassList);
    }
  }

  setTabpanelsAttributes(tabPanel, isActive = false) {
    if (isActive) {
      tabPanel.classList.remove(this.tabPanelHiddenClass);
    }

    if (!isActive) {
      tabPanel.classList.add(this.tabPanelHiddenClass);
    }
  }

  setSelectedTab(currentTab) {
    this.tabs.forEach((tab, i) => {
      const isActiveTab = currentTab === tab;
      this.setTabsAttributes(tab, isActiveTab);
      this.setTabpanelsAttributes(this.tabpanels[i], isActiveTab);
    });
  }

  moveFocusToTab(currentTab) {
    currentTab.focus();
  }

  moveFocusToPreviousTab(currentTab) {
    if (currentTab === this.firstTab) {
      this.moveFocusToTab(this.lastTab);
    } else {
      const index = this.tabs.indexOf(currentTab);
      this.moveFocusToTab(this.tabs[index - 1]);
    }
  }

  moveFocusToNextTab(currentTab) {
    if (currentTab === this.lastTab) {
      this.moveFocusToTab(this.firstTab);
    } else {
      const index = this.tabs.indexOf(currentTab);
      this.moveFocusToTab(this.tabs[index + 1]);
    }
  }

  onKeydown(event) {
    let tgt = event.currentTarget;
    let flag = false;

    switch (event.key) {
      case 'ArrowLeft':
        this.moveFocusToPreviousTab(tgt);
        flag = true;
        break;

      case 'ArrowRight':
        this.moveFocusToNextTab(tgt);
        flag = true;
        break;

      case 'Home':
        this.moveFocusToTab(this.firstTab);
        flag = true;
        break;

      case 'End':
        this.moveFocusToTab(this.lastTab);
        flag = true;
        break;

      default:
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onClick(event) {
    this.setSelectedTab(event.currentTarget);
  }

  init() {
    for (const element of this.tabs) {
      const tab = element;
      const tabpanel = document.getElementById(
        tab.getAttribute('aria-controls')
      );

      tab.tabIndex = -1;
      tab.setAttribute('aria-selected', 'false');
      this.tabpanels.push(tabpanel);

      tab.addEventListener('keydown', this.onKeydown.bind(this));
      tab.addEventListener('click', this.onClick.bind(this));

      if (!this.firstTab) {
        this.firstTab = tab;
      }
      this.lastTab = tab;
    }

    this.setSelectedTab(this.firstTab);
  }
}

export function createTabs() {
  window.addEventListener('load', function () {
    const tablists = document.querySelectorAll('[role=tablist]');

    for (const element of tablists) {
      const tabs = new Tabs(element);
      tabs.init();
    }
  });
}
