const PAGINATION_ACTIVE_CLASS = 'carousel-pagination__item--is-active';

function getComputedValueInPixels(element, cssVariable) {
  const value = getComputedStyle(element).getPropertyValue(cssVariable);

  const temp = document.createElement('div');
  temp.style.visibility = 'hidden';
  temp.style.position = 'absolute';
  temp.style.width = value;
  document.body.appendChild(temp);

  const pixels = temp.getBoundingClientRect().width;

  document.body.removeChild(temp);

  return pixels;
}

function createPaginationButton(isActive = false) {
  const btn = document.createElement('button');
  btn.classList.add('carousel-pagination__item');

  if (isActive) {
    btn.classList.add(PAGINATION_ACTIVE_CLASS);
  }

  return btn;
}

class Carousel {
  constructor(wrapperNode) {
    this.sectionContainer = document.querySelector(
      '[data-js="articles-slide"]'
    );
    this.carousel = wrapperNode;
    this.desktopBreakpoint = 768;
    this.isDesktop = null;
    this.items = [...wrapperNode.children];
    this.gapSlides = 0;
    this.offsetPerItem = this.#calculateOffset(this.carousel);
    this.itemsPerPage = 1;
    this.offsetCssVariable = '--carousel-offset';
    this.currentSlide = 1;
    this.currentPage = 1;
    this.paginationContainer = document.querySelector(
      '[data-js="carousel-pagination"]'
    );
    this.pages = 0;
    this.prevBtn = document.querySelector('[data-js="carousel-prev-btn"]');
    this.nextBtn = document.querySelector('[data-js="carousel-next-btn"]');
    this.minSwipeDistance = 25;
    this.desktopPeakDistance = 0;
  }

  #setDesktopPeakDistance() {
    this.desktopPeakDistance = getComputedValueInPixels(
      this.carousel,
      '--peak-distance'
    );
  }

  #setItemsPerPage() {
    this.itemsPerPage = this.isDesktop ? 3 : 1;
  }

  #setGapSlides() {
    this.gapSlides = parseFloat(getComputedStyle(this.carousel).gap);
  }

  #setIsDesktop() {
    const newIsDesktop = window.innerWidth >= this.desktopBreakpoint;

    if (this.isDesktop === newIsDesktop) return;

    this.isDesktop = newIsDesktop;
    this.#updatePagesCalculation();
    this.#jumpToPage(this.currentPage);
  }

  #setPages() {
    this.pages = Math.ceil(this.items.length / this.itemsPerPage);
  }

  #isFirstPage() {
    return this.currentPage === 1;
  }

  #isLastPage() {
    return this.currentPage === this.pages;
  }

  #setCurrentPage() {
    this.currentPage = Math.ceil(this.currentSlide / this.itemsPerPage);
  }

  #updatePagesCalculation() {
    this.#setGapSlides();
    this.#setItemsPerPage();
    this.#setCurrentPage();
    this.#setPages();
    this.#createPagination();
    this.#setDesktopPeakDistance();
  }

  #setCurrentSlide(slideNumber) {
    this.currentSlide = slideNumber;
    this.#setCurrentPage();
    this.#updatePaginationActiveStatus();
    this.#updateControlsState();
  }

  #calculateOffset() {
    const firstSlide = this.items[0];

    return firstSlide.clientWidth + this.gapSlides;
  }

  #calculateTotalAmountToJump() {
    const offsetPerSlide = this.#calculateOffset();
    const offsetPerRow = offsetPerSlide * this.itemsPerPage;
    const defaultAmountToJump = offsetPerRow * (this.currentPage - 1);
    const isSingleRow = this.pages <= 1;

    if (!this.#isLastPage() || isSingleRow || this.itemsPerPage === 1) {
      return defaultAmountToJump;
    }

    const slidesLeftToFillRow =
      (this.itemsPerPage - (this.items.length % this.itemsPerPage)) %
      this.itemsPerPage;

    const amountNotNeedToJumpOnLastRow =
      offsetPerSlide * slidesLeftToFillRow + this.desktopPeakDistance;

    return defaultAmountToJump - amountNotNeedToJumpOnLastRow - this.gapSlides;
  }

  #jumpToSlide(slideNumber) {
    this.#setCurrentSlide(slideNumber);
    this.#moveSlidesOnScreen();
  }

  #jumpToPage(page) {
    const slidesUntilLastPage = (page - 1) * this.itemsPerPage;
    const positionToLand = 1;
    const slideToLand = slidesUntilLastPage + positionToLand;
    this.#jumpToSlide(slideToLand);
  }

  #jumpToNextPage() {
    const nextPage = this.currentPage + 1;
    if (nextPage <= this.pages) {
      this.#jumpToPage(this.currentPage + 1);
    }
  }

  #jumpToPrevPage() {
    if (this.currentPage - 1 >= 1) {
      this.#jumpToPage(this.currentPage - 1);
    }
  }

  #moveSlidesOnScreen() {
    const amountToJump = `-${this.#calculateTotalAmountToJump()}px`;
    this.carousel.style.setProperty(this.offsetCssVariable, amountToJump);
  }

  #createPagination() {
    this.paginationContainer.innerHTML = '';

    for (let i = 1; i <= this.pages; i++) {
      const $btn = createPaginationButton(this.currentPage === i);

      $btn.addEventListener('click', () => {
        this.#jumpToPage(i);
      });

      this.paginationContainer.append($btn);
    }
  }

  #createControls() {
    this.prevBtn.addEventListener('click', () => {
      this.#jumpToPrevPage();
    });

    this.nextBtn.addEventListener('click', () => {
      this.#jumpToNextPage();
    });
  }

  #updatePaginationActiveStatus() {
    const btns = [...this.paginationContainer.children];

    if (btns.length < 1) return;

    btns.forEach((btn, i) => {
      btn.classList.remove(PAGINATION_ACTIVE_CLASS);

      if (this.currentPage === i + 1) {
        btn.classList.add(PAGINATION_ACTIVE_CLASS);
      }
    });
  }

  #updateControlsState() {
    this.prevBtn.removeAttribute('disabled');
    this.nextBtn.removeAttribute('disabled', false);

    if (this.#isFirstPage()) {
      this.prevBtn.setAttribute('disabled', true);
    }

    if (this.#isLastPage()) {
      this.nextBtn.setAttribute('disabled', true);
    }
  }

  initSwipeEvents() {
    this.sectionContainer.addEventListener(
      'touchstart',
      this.handleTouchStart.bind(this)
    );
    this.sectionContainer.addEventListener(
      'touchend',
      this.handleTouchEnd.bind(this)
    );

    this.sectionContainer.addEventListener(
      'mousedown',
      this.handleTouchStart.bind(this)
    );
    this.sectionContainer.addEventListener(
      'mouseup',
      this.handleTouchEnd.bind(this)
    );
  }

  handleTouchStart(event) {
    this.startX = event.type.includes('mouse')
      ? event.clientX
      : event.touches[0].clientX;
  }

  handleTouchEnd(event) {
    this.endX = event.type.includes('mouse')
      ? event.clientX
      : event.changedTouches[0].clientX;

    const swipeDistance = this.endX - this.startX;

    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        this.#jumpToPrevPage();
      } else {
        this.#jumpToNextPage();
      }
    }
  }

  init() {
    this.#setIsDesktop();
    this.#updatePagesCalculation();
    this.#createPagination();
    this.#createControls();
    this.initSwipeEvents();

    window.addEventListener('resize', () => {
      this.#setIsDesktop();
    });
  }
}

const articlesCarousel = new Carousel(
  document.querySelector('[data-js="carousel-container"]')
);
articlesCarousel.init();
