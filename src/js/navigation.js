export function createNavigation(menuSelector = '[data-js="menu"]') {
  const $menu = document.querySelector(`${menuSelector}`);

  if (!$menu) {
    throw new Error(
      `Could not find a node element with the selector ${menuSelector}`
    );
  }

  const $menuControl = $menu.querySelector('[data-js="mobile-menu-control"]');
  const $menuControlLabel = $menuControl.querySelector(
    '[data-js="mobile-menu-label"]'
  );

  if (!$menuControl) {
    throw new Error('Could not find the $menuControl of the navigation');
  }

  if (!$menuControlLabel) {
    throw new Error('Could not find the $menuControlLabel of the navigation');
  }

  const getIsMenuExpanded = () => {
    return $menuControl.getAttribute('aria-expanded') === 'false';
  };

  const getControlLabel = () => {
    return getIsMenuExpanded() ? 'Close menu' : 'Open menu';
  };

  const toggleNavigation = () => {
    $menuControl.setAttribute('aria-expanded', !!getIsMenuExpanded());
    $menuControlLabel.textContent = getControlLabel();
  };

  $menuControl.addEventListener('click', toggleNavigation);
}
