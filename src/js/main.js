import * as fn from './modules/functions.js';
import { bodyBackground } from './modules/bodyBackground.js';
import { accordion, accordionCircle } from './modules/accordion.js';
import { tabsInit } from './modules/tabs.js';
import { swipersInit } from './modules/swiper.js';
import { modalsInit } from './modules/modal.js';
import { searchInit } from './modules/search.js';
import { loadMoreInit } from './modules/loadMore.js';
import { wrapArticleImages } from './modules/wrapArticleImages.js';
import { mapInit } from './modules/yandex-map.js';
import * as form from './modules/formSubmit.js';
import { formValidation } from './modules/formSubmit.js';
import { serviceFilter } from './modules/serviceFilter.js';
import { cookieConsentInit } from './modules/cookieConsent.js';
import { calendarInit } from './modules/calendar.js';
// import { useDynamicAdapt } from "./modules/dynamicAdapt.js";

addEventListener('DOMContentLoaded', () => {
	fn.isTouchDevice();
	fn.hamburgerMenu('noscroll');
	fn.stickyHeader();
	fn.initFilterSystem();
	fn.initExpandableBlocks();

	form.submitPrevent();
	form.maskHandler();
	formValidation.init();

	accordion();
	accordionCircle();
	tabsInit();
	swipersInit();
	modalsInit();
	searchInit();
	loadMoreInit();
	wrapArticleImages();
	serviceFilter();
	cookieConsentInit();
	calendarInit();

	bodyBackground();

	if (window.mapDataList) {
		mapDataList.forEach((mapData) => {
			mapInit(mapData);
		});
	}

	// fn.isWebp();
	// fn.closeMenuHandler();
	// useDynamicAdapt();
});

import './modules/fancyapps.js';
