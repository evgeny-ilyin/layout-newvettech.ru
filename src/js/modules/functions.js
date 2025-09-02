/* Проверка поддержки webp браузером */
export function isWebp() {
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
export function isTouchDevice() {
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
	['load', 'resize'].forEach((evt) => window.addEventListener(evt, updateTouchClass));
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
export function hamburgerMenu(isLock = false) {
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

	const onClick = (e) => {
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

export function stickyHeader() {
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
