/**
 * Модуль для работы с вкладками (табами).
 *
 * @module tabs
 * @copyright 2025 Evgeny Ilyin
 *
 * - Автоматически активирует первый таб и его контент, если активного ещё нет.
 * - Добавляет хэш в адресную строку и активирует нужный таб при загрузке страницы или при изменении хэша в URL.
 * - Поддерживает несколько блоков с вкладками на одной странице.
 * - Использует делегирование событий (через document), так что работает и для динамически добавленных табов.
 *
 * @param {Object} [options={}] - Объект с настройками функции.
 * @param {string} [options.isActiveClass='is-active'] - CSS-класс активного таба/контента.
 * @param {string} [options.tabsSelector='.tabs'] - Селектор контейнера вкладок.
 * @param {string} [options.navContainer='.js-tab-buttons'] - Селектор контейнера кнопок табов.
 * @param {string} [options.contentContainer='.js-tab-content'] - Селектор контейнера контента табов.
 * @param {string} [options.contentAttr='tab-content'] - data-атрибут для блока с контентом вкладки.
 *
 * @example
 * Инициализация табов
 * import { tabsInit } from './modules/tabs.js';
 * tabsInit();
 *
 * @example
 * <!-- Пример HTML -->
 * <div class="tabs">
 *   <div class="tabs__nav js-tab-buttons">
 *     <button type="button" class="btn btn_tab" data-tab="tab-1">Tab 1</button>
 *     <button type="button" class="btn btn_tab" data-tab="tab-2">Tab 2</button>
 *   </div>
 *   <div class="tabs__content js-tab-content">
 *     <div class="tab" data-tab-content="tab-1">Content 1</div>
 *     <div class="tab" data-tab-content="tab-2">Content 2</div>
 *   </div>
 * </div>
 *
 * @export
 * @function tabsInit
 * @returns {void} Ничего не возвращает, изменяет DOM-состояние.
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

		// Если нет активного - активируем первый
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

			// Меняем хэш в URL (без перезагрузки)
			history.replaceState(null, '', `#${tabId}`);
		});

		// Если при загрузке есть хэш - активируем нужный таб
		if (location.hash) {
			const hashTabId = location.hash.slice(1);
			activateTab(tabs, hashTabId);
		}

		// Следим за изменением хэша
		window.addEventListener('hashchange', () => {
			const hashTabId = location.hash.slice(1);
			if (hashTabId) {
				activateTab(tabs, hashTabId);
			}
		});
	});
}
