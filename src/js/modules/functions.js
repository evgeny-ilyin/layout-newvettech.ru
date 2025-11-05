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
	const isOntopClass = 'is-ontop';
	const isStickyClass = 'is-sticky';

	if (!header) {
		return;
	}

	let lastScrollTop = window.scrollY;

	const updateHeaderClasses = () => {
		const scrollY = window.scrollY;
		header.classList.add(isStickyClass);

		if (scrollY === 0) {
			header.classList.add(isOntopClass);
		} else {
			header.classList.remove(isOntopClass);
		}

		lastScrollTop = scrollY;
	};

	updateHeaderClasses();

	window.addEventListener('scroll', updateHeaderClasses);
}

// export function stickyHeaderV2() {
// 	const header = document.querySelector('.header');
// 	const trigger = 200; // триггер в px

// 	if (!header) {
// 		return;
// 	}

// 	const update = () => {
// 		const scrollY = window.scrollY;

// 		if (scrollY > trigger) {
// 			// фиксируем и плавно показываем хедер
// 			if (!header.classList.contains('is-sticky')) {
// 				header.classList.add('is-sticky');
// 			}
// 		} else if (scrollY === 0) {
// 			// возвращаем хедер в статичное состояние
// 			if (header.classList.contains('is-sticky')) {
// 				header.classList.remove('is-sticky');
// 			}
// 		}
// 	};

// 	update();
// 	window.addEventListener('scroll', update, { passive: true });
// }

/* фильтрация элементов в контейнере по нажатию кнопки */
export function initFilterSystem({
	buttonContainerClass = 'js-filter-buttons',
	dataAttr = 'filters',
	activeClass = 'is-active',
	visibleClass = 'is-visible',
	showingClass = 'is-showing',
	hidingClass = 'is-hiding',
	transitionDuration = 150, // ms, должно совпадать с CSS
} = {}) {
	const btnContainers = document.querySelectorAll(`.${buttonContainerClass}`);

	const showWithAnimation = (item) => {
		if (item.classList.contains(visibleClass) || item.classList.contains(showingClass)) {
			return;
		}

		// Если был скрывающийся элемент, убираем класс hiding
		item.classList.remove(hidingClass);
		item.style.display = ''; // вернуть в поток
		item.classList.add(showingClass);

		requestAnimationFrame(() => {
			item.classList.add(visibleClass);
			setTimeout(() => {
				item.classList.remove(showingClass);
			}, transitionDuration);
		});
	};

	const hideWithAnimation = (item) => {
		if (!item.classList.contains(visibleClass)) {
			return;
		}

		item.classList.add(hidingClass);
		item.classList.remove(visibleClass);

		setTimeout(() => {
			item.classList.remove(hidingClass, showingClass);
			item.style.display = 'none';
		}, transitionDuration);
	};

	btnContainers.forEach((container) => {
		const buttons = container.querySelectorAll('button');
		const targetClass = container.dataset.target;

		if (!targetClass) {
			return;
		}

		const itemsContainer = document.querySelector(`.${targetClass}`);
		const items = itemsContainer ? itemsContainer.querySelectorAll(':scope > *') : [];

		const filterSelection = (filter) => {
			items.forEach((item) => {
				const filters = (item.dataset[dataAttr] || '').split(/\s+/).filter(Boolean);
				const shouldShow = filter === 'all' || filters.includes(filter);

				if (shouldShow) {
					showWithAnimation(item);
				} else {
					hideWithAnimation(item);
				}
			});
		};

		container.addEventListener('click', (e) => {
			const btn = e.target.closest('button');
			if (!btn) {
				return;
			}

			buttons.forEach((b) => b.classList.remove(activeClass));
			btn.classList.add(activeClass);

			const filter = btn.dataset.filter;
			filterSelection(filter);
		});

		// инициализация
		filterSelection('all');
	});
}

/**
 * Управляет раскрываемыми текстовыми блоками на странице
 *
 * Особенности:
 * - Ограничивает высоту текста и добавляет кнопку "Подробнее"
 * - Раскрывает и сворачивает текст по клику
 * - Автоматически скрывает кнопку, если контент короче лимита
 * - Обновляет aria-атрибуты для поддержки скрин-ридеров
 * - Возможность настройки селекторов, классов и текстов кнопки
 *
 * Использование:
 * 1. Обёртка блока должна иметь класс ".expandible-text-block"
 * 2. Контент внутри — селектор ".text-block"
 * 3. Кнопка переключения — селектор ".text-toggler"
 * 4. Высота свёрнутого состояния управляется параметром collapsedHeight
 *
 * Пример кнопки:
 * <button type="button" class="text-toggler" aria-label="Развернуть текст">Подробнее</button>
 */
export function initExpandableBlocks({
	blockWrapperSelector = '.expandible-text-block',
	blockSelector = '.text-block',
	buttonSelector = '.text-toggler',
	collapsedHeight = 650,
	expandedClass = 'is-expanded',
	hiddenButtonClass = 'is-hidden',
	textExpand = 'Подробнее',
	textCollapse = 'Скрыть',
	ariaExpand = 'Развернуть текст',
	ariaCollapse = 'Свернуть текст',
} = {}) {
	const wrappers = document.querySelectorAll(blockWrapperSelector);

	wrappers.forEach((wrapper) => {
		const block = wrapper.querySelector(blockSelector);
		const button = wrapper.querySelector(buttonSelector);

		if (!block || !button) {
			return;
		}

		// Проверка высоты текста
		if (block.scrollHeight <= collapsedHeight) {
			button.classList.add(hiddenButtonClass);
			return;
		}

		// Начальное состояние
		block.style.maxHeight = `${collapsedHeight}px`;
		button.textContent = textExpand;
		button.setAttribute('aria-expanded', 'false');
		button.setAttribute('aria-label', ariaExpand);

		// Обработчик клика
		button.addEventListener('click', () => {
			const isExpanded = block.classList.toggle(expandedClass);

			if (isExpanded) {
				block.style.maxHeight = `${block.scrollHeight}px`;
				button.textContent = textCollapse;
				button.setAttribute('aria-expanded', 'true');
				button.setAttribute('aria-label', ariaCollapse);
			} else {
				block.style.maxHeight = `${collapsedHeight}px`;
				button.textContent = textExpand;
				button.setAttribute('aria-expanded', 'false');
				button.setAttribute('aria-label', ariaExpand);
			}
		});
	});
}
