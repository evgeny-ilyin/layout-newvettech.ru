import * as fn from './modules/functions.js';
import { accordion, accordionCircle } from './modules/accordion.js';
import { tabsInit } from './modules/tabs.js';
import { swipersInit } from './modules/swiper.js';
import { bodyBackground } from './modules/bodyBackground.js';

// import { useDynamicAdapt } from "./modules/dynamicAdapt.js";

addEventListener('DOMContentLoaded', () => {
	fn.isTouchDevice();
	fn.hamburgerMenu('noscroll');
	fn.initFilterSystem();

	bodyBackground();
	accordion();
	accordionCircle();
	tabsInit();
	swipersInit();

	// fn.isWebp();
	// fn.stickyHeader();
	// fn.closeMenuHandler();
	// useDynamicAdapt();
});

// import "./modules/cookies.js";
// import "./modules/fancyapps.js";
