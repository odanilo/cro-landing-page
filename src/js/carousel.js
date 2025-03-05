const PAGINATION_ACTIVE_CLASS = 'carousel-pagination__item--is-active';

function createPaginationButton(isActive = false) {
  const btn = document.createElement('button');
  btn.classList.add('carousel-pagination__item');

  if (isActive) {
    btn.classList.add(PAGINATION_ACTIVE_CLASS);
  }

  return btn;
}
export class Carousel {
  constructor(wrapperNode) {
    this.sectionContainer = document.querySelector('[data-js="articles"]');
    this.carousel = wrapperNode;
    this.desktopBreakpoint = 768;
    this.isDesktop = this.carousel.clientWidth >= this.desktopBreakpoint;
    this.items = [...wrapperNode.children];
    this.offsetPerItem = this.#calculateOffset(this.carousel);
    this.itemsPerPage = this.isDesktop ? 3 : 1;
    this.offsetCssVariable = '--carousel-offset';
    this.currentSlide = 1;
    this.currentPage = 1;
    this.paginationContainer = document.querySelector(
      '[data-js="carousel-pagination"]'
    );
    this.pages = Math.ceil(this.items.length / this.itemsPerPage);
    this.prevBtn = document.querySelector('[data-js="carousel-prev-btn"]');
    this.nextBtn = document.querySelector('[data-js="carousel-next-btn"]');
    this.minSwipeDistance = 25;
    this.gapSlides = parseFloat(getComputedStyle(this.carousel).gap);
  }

  #setItemsPerPage() {
    this.itemsPerPage = this.isDesktop ? 3 : 1;
  }

  #setGapSlides() {
    this.gapSlides = parseFloat(getComputedStyle(this.carousel).gap);
  }

  #setIsDesktop(isDesktop) {
    if (this.isDesktop === isDesktop) return;
    this.isDesktop = isDesktop;
    this.#updatePagesCalculation();
    this.#setCurrentPage();
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
    this.#setCurrentPage();
    this.#setItemsPerPage();
    this.#setPages();
    this.#createPagination();
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

  #calculateTotalAmountToJump(slideNumber) {
    const offsetPerSlide = this.#calculateOffset();
    const defaultAmountToJump = offsetPerSlide * (slideNumber - 1);

    if (!this.#isLastPage() || this.pages <= 1 || this.itemsPerPage === 1) {
      return defaultAmountToJump;
    }

    const slidesLeftToFillRow =
      this.itemsPerPage - (this.items.length % this.itemsPerPage);

    if (slidesLeftToFillRow === this.itemsPerPage) {
      return defaultAmountToJump - this.gapSlides;
    }

    return (
      defaultAmountToJump -
      slidesLeftToFillRow * offsetPerSlide -
      this.gapSlides
    );
  }

  #jumpToSlide(slideNumber) {
    this.#setCurrentSlide(slideNumber);

    this.carousel.style.setProperty(
      this.offsetCssVariable,
      `-${this.#calculateTotalAmountToJump(slideNumber)}px`
    );
  }

  #jumpToPage(page) {
    const shouldJumpToSlide =
      page * this.itemsPerPage - (this.itemsPerPage - 1);

    this.#jumpToSlide(shouldJumpToSlide);
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

    this.sectionContainer.addEventListener(
      'touchmove',
      (e) => e.preventDefault(),
      {
        passive: false,
      }
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
    this.#setCurrentPage();
    this.#createPagination();
    this.#createControls();
    this.initSwipeEvents();

    window.addEventListener('resize', () => {
      this.#setIsDesktop(window.innerWidth >= this.desktopBreakpoint);
    });
  }
}
