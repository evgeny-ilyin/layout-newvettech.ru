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

export function bodyBackground() {
	const background = document.querySelector('.body-background .content');

	const circles = [
		{ top: '0%', left: '-30%', opacity: 0.5, scale: 1, delay: 0.7 },
		{ top: '0%', left: '65%', opacity: 0.4, scale: 0.7, delay: 2 },
		// { top: '300px', left: '95%', scale: 1, delay: 0.3 },
		// { top: '500px', left: '300px', scale: 1, delay: 0.6 },
		// { top: '150px', left: '200px', scale: 1, delay: 0.9 },
		// { top: '99%', left: '5px', scale: 1, delay: 1.2 },
	];

	circles.forEach(({ top, left, opacity, scale, delay }) => {
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

/**
 * @fileoverview Модуль аккордеона для управления раскрывающимися списками.
 * Поддерживает обычный режим и режим "только один открыт".
 *
 * @copyright 2025 Evgeny Ilyin
 */

/**
 * Инициализация аккордеона.
 *
 * Функция навешивает обработчики на элементы с классом `js-accordion`.
 * Поддерживаются два режима работы:
 * 1. Стандартный — можно открыть несколько элементов одновременно.
 * 2. Одноэлементный (`.js-accordion-single`) — при открытии одного элемента
 *    автоматически закрываются все остальные в пределах данного аккордеона.
 *
 * Поведение:
 * - По клику на триггер (`.js-accordion-trigger`) открывается или закрывается
 *   соответствующий блок контента (следующий соседний элемент).
 * - Высота контента управляется через `max-height`, что позволяет использовать
 *   CSS-переходы для плавной анимации.
 * - При `window.load` и `window.resize` пересчитывается высота всех открытых элементов,
 *   чтобы соответствовать их фактическому содержимому.
 *
 * Зависимости от разметки:
 * ```html
 * <div class="accordion js-accordion js-accordion-single">
 *   <div class="accordioт__item">
 *     <div class="accordion__header js-accordion-trigger">Заголовок</div>
 *     <div class="accordion__content">Контент</div>
 *   </div>
 * </div>
 * ```
 *
 * Побочные эффекты:
 * - Добавляет слушатели событий `click` для триггеров.
 * - Добавляет глобальные слушатели `load` и `resize` для пересчёта высоты.
 *
 * @export
 * @function accordion
 * @returns {void} Ничего не возвращает, изменяет DOM-состояние.
 */

export function accordion() {
	const accordionClass = 'js-accordion';
	const accordionItemClass = 'accordion__item';
	const isOpenedClass = 'is-opened';
	const triggerClass = 'js-accordion-trigger';
	const singleModeClass = 'js-accordion-single';
	const accordions = document.querySelectorAll(`.${accordionClass}`);

	accordions.forEach((accordion) => {
		const triggers = accordion.querySelectorAll(`.${triggerClass}`);
		const singleMode = accordion.classList.contains(`${singleModeClass}`);

		triggers.forEach((trigger) => {
			const accordionItem = trigger.closest(`.${accordionItemClass}`);
			const accordionContent = trigger.parentElement.nextElementSibling;

			trigger.addEventListener('click', () => {
				const isOpen = accordionItem.classList.contains(isOpenedClass);

				if (singleMode) {
					accordion.querySelectorAll(`.${isOpenedClass}`).forEach((openItem) => {
						if (openItem !== accordionItem) {
							openItem.classList.remove(isOpenedClass);

							// ищем контент именно у этого openItem
							const openTrigger = openItem.querySelector(`.${triggerClass}`);
							const openContent = openTrigger?.parentElement.nextElementSibling;
							if (openContent) {
								openContent.style.maxHeight = null;
								openTrigger.setAttribute('aria-expanded', 'false');
								openContent.setAttribute('aria-hidden', 'true');
							}
						}
					});
				}

				accordionItem.classList.toggle(isOpenedClass);
				if (!isOpen) {
					accordionContent.style.maxHeight = accordionContent.scrollHeight + 'px';
					trigger.setAttribute('aria-expanded', 'true');
					accordionContent.setAttribute('aria-hidden', 'false');
				} else {
					accordionContent.style.maxHeight = null;
					trigger.setAttribute('aria-expanded', 'false');
					accordionContent.setAttribute('aria-hidden', 'true');
				}
			});
		});
	});

	// глобальный пересчёт открытых элементов
	const recalc = () => {
		document.querySelectorAll(`.${accordionClass} .${isOpenedClass}`).forEach((openItem) => {
			const openTrigger = openItem.querySelector(`.${triggerClass}`);
			const openContent = openTrigger?.parentElement.nextElementSibling;
			if (openContent) {
				openContent.style.maxHeight = openContent.scrollHeight + 'px';
			}
		});
	};

	window.addEventListener('load', recalc);
	window.addEventListener('resize', recalc);
}

export function accordionCircle() {
	const accordionCircleClass = 'accordion-circle';
	const accordionItemClass = 'accordion__item';
	const accordions = document.querySelectorAll(`.${accordionCircleClass}`);

	accordions.forEach((accordion) => {
		const blocks = accordion.querySelectorAll(`.${accordionItemClass}`);
		accordion.style.setProperty('--total', blocks.length);

		const half = Math.ceil(blocks.length / 2);
		blocks.forEach((block, i) => {
			block.style.setProperty('--i', i);
			block.style.setProperty('--shift', i < half ? 1 : -1);
			block.style.setProperty('--z', i < half ? half - i : i - half + 1);

			if (!(i < half)) {
				block.style.setProperty('--fd', 'row-reverse');
			}
		});
	});
}
