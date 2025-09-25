import * as fn from './modules/functions.js';
import { tabsInit } from './modules/tabs.js';
import { swipersInit } from './modules/swiper.js';

// import { useDynamicAdapt } from "./modules/dynamicAdapt.js";

addEventListener('DOMContentLoaded', () => {
	fn.bodyBackground();
	fn.isTouchDevice();
	fn.hamburgerMenu('noscroll');
	fn.accordion();
	fn.accordionCircle();
	fn.initFilterSystem();

	tabsInit();
	swipersInit();

	// fn.isWebp();
	// fn.stickyHeader();
	// fn.closeMenuHandler();
	// useDynamicAdapt();
});

// import "./modules/cookies.js";
// import "./modules/fancyapps.js";
