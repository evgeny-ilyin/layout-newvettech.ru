import * as fn from './modules/functions.js';
import { bodyBackground } from './modules/bodyBackground.js';
import { accordion, accordionCircle } from './modules/accordion.js';
import { tabsInit } from './modules/tabs.js';
import { swipersInit } from './modules/swiper.js';
import { modalsInit } from './modules/modal.js';

import { mapInit } from './modules/yandex-map.js';

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
	modalsInit();

	if (window.data) {
		mapInit(window.data);
	}

	// fn.isWebp();
	// fn.stickyHeader();
	// fn.closeMenuHandler();
	// useDynamicAdapt();
});

// import "./modules/cookies.js";
// import "./modules/fancyapps.js";
