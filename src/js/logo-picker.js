function getLogoPickerNodeElements(parentSelector) {
  const $section = document.querySelector(parentSelector);
  const $list = $section.querySelector('[data-js="logo-picker-list"]');

  if (!$section) {
    throw new Error(`Could not find parent section with ${$section}`);
  }

  if (!$list) {
    throw new Error(`Could not find a list of logos`);
  }

  return {
    $section,
    $list,
  };
}

function getCurrentOffsetX(node) {
  return (
    parseFloat(getComputedStyle(node).getPropertyValue('--list-x-offset')) || 0
  );
}

function getCurrentGapBetweenLogos(node) {
  return parseFloat(getComputedStyle(node).gap);
}

function createLogoObserver(onLogoExit) {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting && entry.boundingClientRect.right < 0) {
          onLogoExit(entry.target);
        }
      });
    },
    { root: null, threshold: 0.0 }
  );
}

export function createLogoPicker(selector = '[data-js="logo-picker"]') {
  const { $list, $section } = getLogoPickerNodeElements(selector);

  const OFFSET_AMOUNT = 0.25;

  const state = {
    currentX: getCurrentOffsetX($section),
    initialLogos: [...$list.children],
    shouldAnimate: true,
    gap: getCurrentGapBetweenLogos($list),
  };

  const logoObserver = createLogoObserver(handleLogoExit);

  function removeLogoAfterLeaveScreen(nodeLogo) {
    state.currentX += nodeLogo.clientWidth + state.gap;

    logoObserver.unobserve(nodeLogo);
    nodeLogo.remove();
  }

  function addNewLogoOnList(newLogo) {
    $list.appendChild(newLogo);
    logoObserver.observe(newLogo);
  }

  function handleLogoExit(nodeLogo) {
    const clonedLogo = nodeLogo.cloneNode(true);
    removeLogoAfterLeaveScreen(nodeLogo);
    addNewLogoOnList(clonedLogo);
  }

  function animateScroll() {
    state.currentX -= OFFSET_AMOUNT;

    $section.style.setProperty('--list-x-offset', `${state.currentX}px`);

    if (state.shouldAnimate) {
      requestAnimationFrame(animateScroll);
    }
  }

  $section.addEventListener('mouseenter', () => {
    state.shouldAnimate = false;
  });

  $section.addEventListener('mouseleave', () => {
    state.shouldAnimate = true;
    requestAnimationFrame(animateScroll);
  });

  window.addEventListener('resize', () => {
    state.gap = getCurrentGapBetweenLogos($list);
  });

  state.initialLogos.forEach((logo) => {
    logoObserver.observe(logo);
  });

  requestAnimationFrame(animateScroll);
}
