import { Carousel } from './carousel.js';
import { createLogoPicker } from './logo-picker.js';
import { createNavigation } from './navigation.js';
import { createTabs } from './tabs.js';

createNavigation();
createLogoPicker();
createTabs();

const articlesCarousel = new Carousel(
  document.querySelector('[data-js="carousel-container"]')
);
articlesCarousel.init();
