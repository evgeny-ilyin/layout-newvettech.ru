import * as fn from './modules/functions.js';
import * as sw from './modules/swiper.js';

// import { useDynamicAdapt } from "./modules/dynamicAdapt.js";

addEventListener('DOMContentLoaded', () => {
	fn.bodyBackground();
	fn.isTouchDevice();
	fn.hamburgerMenu('noscroll');
	fn.accordion();
	fn.accordionCircle();
	sw.swipersInit();
	// fn.isWebp();
	// fn.stickyHeader();
	// fn.closeMenuHandler();
	// useDynamicAdapt();
});

// import "./modules/cookies.js";
// import "./modules/fancyapps.js";
