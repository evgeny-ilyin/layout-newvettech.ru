/**
 * Модуль для работы с вкладками.
 *
 * @module tabs
 *
 * - Автоматически активирует первый таб и его контент, если активного ещё нет.
 * - Поддерживает несколько блоков с вкладками на одной странице.
 * - Использует делегирование событий (через document), так что работает и для динамически добавленных табов.
 *
 * @param {Object} options - Настройки функции.
 * @param {string} [options.isActiveClass='is-active'] - CSS-класс активного таба/контента.
 * @param {string} [options.tabsSelector='.tabs'] - Селектор контейнера вкладок.
 * @param {string} [options.navSelector='.js-tab-nav'] - Селектор элемента управления (кнопки таба).
 * @param {string} [options.contentAttr='tab-content'] - data-атрибут для блока с контентом вкладки.
 *
 * @example
 * HTML:
 * <div class="tabs">
 *   <div class="tabs__header">
 *     <button type="button" class="js-tab-nav" data-tab="1">Tab 1</button>
 *     <button type="button" class="js-tab-nav" data-tab="2">Tab 2</button>
 *   </div>
 *   <div class="tabs__content">
 *     <div class="tab-block" data-tab-content="1">Content 1</div>
 *     <div class="tab-block" data-tab-content="2">Content 2</div>
 *   </div>
 * </div>
 *
 * JS:
 * import { tabsInit } from './tabs.js';
 * tabsInit();
 *
export function tabsInit({
	isActiveClass = 'is-active',
	tabsSelector = '.tabs',
	navSelector = '.js-tab-nav',
	contentAttr = 'tab-content',
} = {}) {
	const tabsItems = document.querySelectorAll(tabsSelector);
	if (!tabsItems.length) {
		return;
	}

	// Инициализация
	tabsItems.forEach((tabs) => {
		const currentActive = tabs.querySelector(`.${isActiveClass}`);

		// Если активного таба ещё нет — активируем первый
		if (!currentActive) {
			const firstNav = tabs.querySelector(navSelector);
			const firstContent = tabs.querySelector(`[data-${contentAttr}]`);

			if (firstNav && firstContent) {
				firstNav.classList.add(isActiveClass);
				firstContent.classList.add(isActiveClass);
			}
		}
	});

	// Обработчик переключения
	document.addEventListener('click', (e) => {
		const trigger = e.target.closest(navSelector);
		if (!trigger || trigger.classList.contains(isActiveClass)) {
			return;
		}

		const tabs = trigger.closest(tabsSelector);
		if (!tabs) {
			return;
		}

		const targetTab = trigger.dataset.tab;
		const tabContent = tabs.querySelector(`[data-${contentAttr}="${targetTab}"]`);

		if (!tabContent) {
			return;
		}

		// Снять активность со всех
		tabs.querySelectorAll(`.${isActiveClass}`).forEach((el) => {
			el.classList.remove(isActiveClass);
		});

		// Активировать выбранные
		trigger.classList.add(isActiveClass);
		tabContent.classList.add(isActiveClass);
	});
}
*/

/**
 * Инициализация системы вкладок (tabs) с поддержкой хэшей в URL.
 * Для возможности независимого использования хешей на нескольких табах на одной странице, они должны иметь уникальное имя группы
 *
 * @param {Object} options - Настройки функции.
 * @param {string} [options.isActiveClass='is-active'] - CSS-класс активного таба/контента.
 * @param {string} [options.tabsSelector='.tabs'] - Селектор контейнера вкладок.
 * @param {string} [options.navContainer='.js-tab-buttons'] - Селектор контейнера кнопок табов.
 * @param {string} [options.contentContainer='.js-tab-content'] - Селектор контейнера контента табов.
 * @param {string} [options.contentAttr='tab-content'] - data-атрибут для блока с контентом вкладки.
 */
export function tabsInit({
	isActiveClass = 'is-active',
	tabsSelector = '.tabs',
	navContainer = '.js-tab-buttons',
	contentContainer = '.js-tab-content',
	contentAttr = 'tab-content',
} = {}) {
	const tabsItems = document.querySelectorAll(tabsSelector);
	if (!tabsItems.length) {
		return;
	}

	const activateTab = (tabs, tabId) => {
		const navs = tabs.querySelectorAll(`${navContainer} [data-tab]`);
		const contents = tabs.querySelectorAll(`${contentContainer} [data-${contentAttr}]`);

		const trigger = tabs.querySelector(`${navContainer} [data-tab="${tabId}"]`);
		const tabContent = tabs.querySelector(`${contentContainer} [data-${contentAttr}="${tabId}"]`);

		if (!trigger || !tabContent) {
			return false;
		}

		// Снимаем активность
		[...navs, ...contents].forEach((el) => el.classList.remove(isActiveClass));

		// Активируем выбранные
		trigger.classList.add(isActiveClass);
		tabContent.classList.add(isActiveClass);

		return true;
	};

	tabsItems.forEach((tabs) => {
		const navs = tabs.querySelectorAll(`${navContainer} [data-tab]`);
		const contents = tabs.querySelectorAll(`${contentContainer} [data-${contentAttr}]`);
		if (!navs.length || !contents.length) {
			return;
		}

		// Если нет активного — активируем первый
		const currentActive = tabs.querySelector(`.${isActiveClass}`);
		if (!currentActive) {
			navs[0].classList.add(isActiveClass);
			contents[0].classList.add(isActiveClass);
		}

		// Клик по табам
		tabs.querySelector(navContainer).addEventListener('click', (e) => {
			const trigger = e.target.closest('[data-tab]');
			if (!trigger || trigger.classList.contains(isActiveClass)) {
				return;
			}

			const tabId = trigger.dataset.tab;
			activateTab(tabs, tabId);

			// Меняем hash в URL (без перезагрузки)
			history.replaceState(null, '', `#${tabId}`);
		});

		// Если при загрузке есть hash — активируем нужный таб
		if (location.hash) {
			const hashTabId = location.hash.slice(1);
			activateTab(tabs, hashTabId);
		}

		// Следим за изменением hash
		window.addEventListener('hashchange', () => {
			const hashTabId = location.hash.slice(1);
			if (hashTabId) {
				activateTab(tabs, hashTabId);
			}
		});
	});
}
