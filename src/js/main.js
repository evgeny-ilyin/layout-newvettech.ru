import * as fn from './modules/functions.js';
// import { useDynamicAdapt } from "./modules/dynamicAdapt.js";

addEventListener('DOMContentLoaded', () => {
	// console.log("JS");
	// useDynamicAdapt();

	fn.isTouchDevice();
	// fn.isWebp();
	// fn.stickyHeader();
	fn.hamburgerMenu('noscroll');
	// fn.closeMenuHandler();
});

// import "./modules/cookies.js";
// import "./modules/fancyapps.js";
