/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/modules/functions.js":
/*!*************************************!*\
  !*** ./src/js/modules/functions.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   bodyBackground: () => (/* binding */ bodyBackground),
/* harmony export */   hamburgerMenu: () => (/* binding */ hamburgerMenu),
/* harmony export */   isTouchDevice: () => (/* binding */ isTouchDevice),
/* harmony export */   isWebp: () => (/* binding */ isWebp),
/* harmony export */   stickyHeader: () => (/* binding */ stickyHeader)
/* harmony export */ });
/* Проверка поддержки webp браузером */
function isWebp() {
  function testWebP(callback) {
    const webP = new Image();
    webP.onload = webP.onerror = function () {
      callback(webP.height === 2);
    };
    // prettier-ignore
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }
  testWebP(function (support) {
    if (support === true) {
      document.querySelector('body').classList.add('webp');
    } else {
      document.querySelector('body').classList.add('no-webp');
    }
  });
}

/* Проверка на тач девайс */
function isTouchDevice() {
  const touchClass = 'is-touch';
  function updateTouchClass() {
    let isTouch = false;
    if (window.PointerEvent && 'maxTouchPoints' in navigator) {
      isTouch = navigator.maxTouchPoints > 0;
    } else if (window.matchMedia && window.matchMedia('(any-pointer:coarse)').matches) {
      isTouch = true;
    } else if ('ontouchstart' in window) {
      isTouch = true;
    }
    if (document.body) {
      document.body.classList[isTouch ? 'add' : 'remove'](touchClass);
    }
  }
  ['load', 'resize'].forEach(evt => window.addEventListener(evt, updateTouchClass));
  updateTouchClass();
}

/**
 * Управляет поведением гамбургер-меню на странице
 *
 * Особенности:
 * - Открытие и закрытие меню при клике на гамбургер
 * - Закрытие меню при клике вне меню или на ссылку внутри меню
 * - Плавная анимация закрытия через классы CSS (`is-active` и `is-closing`)
 *
 * Использование:
 * 1. Чекбокс-переключатель меню должен иметь id="menu-toggle"
 * 2. Контейнер меню должен иметь класс "menu-container"
 * 3. Обёртка гамбургера должна иметь класс "hamburger-box"
 * 4. Ссылки внутри меню должны иметь класс "nav__link"
 * 5. Параметр isLock управляет отключением прокрутки страницы при открытом меню
 */
function hamburgerMenu(isLock = false) {
  const menuToggler = document.getElementById('menu-toggle'),
    menuContainer = document.querySelector('.menu-container'),
    hamburgerBox = document.querySelector('.hamburger-box'),
    linkClassName = 'nav__link',
    lockClass = 'is-lock',
    activeClass = 'is-active',
    closingClass = 'is-closing';
  const closeMenu = () => {
    menuToggler.checked = false;
    isLock && document.documentElement.classList.remove(lockClass);
    menuContainer.classList.replace(activeClass, closingClass);
    setTimeout(() => {
      menuContainer.classList.remove(closingClass);
    }, 500);
    document.removeEventListener('click', onClick);
  };
  const onClick = e => {
    if (hamburgerBox.contains(e.target)) {
      return;
    }
    // Закрываем, если клик по пункту меню или вне меню
    if (!menuContainer.contains(e.target) || e.target.closest(`.${linkClassName}`)) {
      closeMenu();
    }
  };
  if (!menuToggler || !menuContainer || !hamburgerBox) {
    return;
  }
  menuToggler.addEventListener('change', () => {
    if (menuToggler.checked) {
      isLock && document.documentElement.classList.add(lockClass);
      document.addEventListener('click', onClick);
      menuContainer.classList.add(activeClass);
    } else {
      closeMenu();
    }
  });
}
function stickyHeader() {
  const header = document.querySelector('header');
  const handleScroll = () => {
    if (window.scrollY > 0) {
      header.classList.add('header_fixed');
    } else {
      header.classList.remove('header_fixed');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();
}
function bodyBackground() {
  const background = document.querySelector('.body-background .content');
  const circles = [{
    top: '0%',
    left: '-30%',
    opacity: 0.5,
    scale: 1,
    delay: 0.7
  }, {
    top: '0%',
    left: '65%',
    opacity: 0.4,
    scale: 0.7,
    delay: 2
  }
  // { top: '300px', left: '95%', scale: 1, delay: 0.3 },
  // { top: '500px', left: '300px', scale: 1, delay: 0.6 },
  // { top: '150px', left: '200px', scale: 1, delay: 0.9 },
  // { top: '99%', left: '5px', scale: 1, delay: 1.2 },
  ];
  circles.forEach(({
    top,
    left,
    opacity,
    scale,
    delay
  }) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('circle-item');
    svg.style.top = top;
    svg.style.left = left;
    svg.style.opacity = opacity;
    svg.style.setProperty('--scale', scale);
    svg.style.animationDelay = `${delay}s`;
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#circle-blurry');
    svg.appendChild(use);
    background.appendChild(svg);
  });
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
var __webpack_exports__ = {};
/*!************************!*\
  !*** ./src/js/main.js ***!
  \************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_functions_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/functions.js */ "./src/js/modules/functions.js");

// import { useDynamicAdapt } from "./modules/dynamicAdapt.js";

addEventListener('DOMContentLoaded', () => {
  // console.log("JS");
  // useDynamicAdapt();

  _modules_functions_js__WEBPACK_IMPORTED_MODULE_0__.bodyBackground();
  _modules_functions_js__WEBPACK_IMPORTED_MODULE_0__.isTouchDevice();
  // fn.isWebp();
  // fn.stickyHeader();
  _modules_functions_js__WEBPACK_IMPORTED_MODULE_0__.hamburgerMenu('noscroll');
  // fn.closeMenuHandler();
});

// import "./modules/cookies.js";
// import "./modules/fancyapps.js";
})();

// This entry needs to be wrapped in an IIFE because it needs to be isolated against other entry modules.
(() => {
/*!****************************!*\
  !*** ./src/scss/main.scss ***!
  \****************************/
__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin

})();

/******/ })()
;
//# sourceMappingURL=main.js.map