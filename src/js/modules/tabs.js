/**
 * Модуль для работы с вкладками (табами).
 *
 * @module tabs
 * @copyright 2026 Evgeny Ilyin
 *
 * - Автоматически активирует первый таб и его контент, если активного ещё нет.
 * - Добавляет хэш в адресную строку и активирует нужный таб при загрузке страницы или при изменении хэша в URL.
 * - Поддерживает несколько блоков с вкладками на одной странице.
 * - Использует делегирование событий (через document), так что работает и для динамически добавленных табов.
 *
 * UPD: 09/2026
 * - Поддерживает вложенность блоков внутрь родительского блока с табами.
 * - При одинаковых хешах в дочерних элементах родителей будет открыт первый по списку.
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
 * <!-- Пример HTML с родительскими блоками -->
 * <div class="tabs">
 *   <div class="tabs__nav tabs__nav_parent js-tab-buttons">
 *     <button type="button" class="btn btn_tab" data-tab="parent-1">Parent 1</button>
 *     <button type="button" class="btn btn_tab" data-tab="parent-2">Parent 2</button>
 *   </div>
 *   <div class="tabs__content js-tab-content">
 *     <div class="tab" data-tab-content="parent-1">
 *      <div class="tabs">
 *        <div class="tabs__nav js-tab-buttons">
 *          <button type="button" class="btn btn_tab" data-tab="tab-1">Tab 1</button>
 *          <button type="button" class="btn btn_tab" data-tab="tab-2">Tab 2</button>
 *        </div>
 *        <div class="tabs__content js-tab-content">
 *          <div class="tab" data-tab-content="tab-1">Content 1</div>
 *          <div class="tab" data-tab-content="tab-2">Content 2</div>
 *        </div>
 *      </div>
 *     </div>
 *     <div class="tab" data-tab-content="parent-2">
 *      <div class="tabs">
 *        <div class="tabs__nav js-tab-buttons">
 *          <button type="button" class="btn btn_tab" data-tab="tab-1">Tab 1</button>
 *          <button type="button" class="btn btn_tab" data-tab="tab-2">Tab 2</button>
 *        </div>
 *        <div class="tabs__content js-tab-content">
 *          <div class="tab" data-tab-content="tab-1">Content 1</div>
 *          <div class="tab" data-tab-content="tab-2">Content 2</div>
 *        </div>
 *      </div>
 *     </div>
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

	/**
	 * Получить значение data-атрибута.
	 *
	 * Например:
	 * data-tab-content="tab-111"
	 */
	const getContentId = (element) => {
		return element.getAttribute(`data-${contentAttr}`);
	};

	/**
	 * Получить элементы текущего уровня .tabs.
	 *
	 * Вложенные .tabs игнорируются.
	 */
	const getTabsItems = (tabs) => {
		const nav = [...tabs.querySelectorAll(navContainer)].find(
			(element) => element.closest(tabsSelector) === tabs
		);

		const content = [...tabs.querySelectorAll(contentContainer)].find(
			(element) => element.closest(tabsSelector) === tabs
		);

		if (!nav || !content) {
			return {
				nav: null,
				content: null,
				navs: [],
				contents: [],
			};
		}

		const navs = [...nav.querySelectorAll('[data-tab]')].filter(
			(element) => element.closest(tabsSelector) === tabs
		);

		const contents = [...content.querySelectorAll(`[data-${contentAttr}]`)].filter(
			(element) => element.closest(tabsSelector) === tabs
		);

		return {
			nav,
			content,
			navs,
			contents,
		};
	};

	/**
	 * Активировать конкретный таб.
	 */
	const activateTab = (tabs, tabId) => {
		const { navs, contents } = getTabsItems(tabs);

		if (!navs.length || !contents.length) {
			return false;
		}

		const trigger = navs.find((element) => element.dataset.tab === tabId);

		const tabContent = contents.find((element) => getContentId(element) === tabId);

		if (!trigger || !tabContent) {
			return false;
		}

		// Снимаем активность только с текущего уровня
		navs.forEach((element) => {
			element.classList.remove(isActiveClass);
		});

		contents.forEach((element) => {
			element.classList.remove(isActiveClass);
		});

		// Активируем выбранный таб
		trigger.classList.add(isActiveClass);
		tabContent.classList.add(isActiveClass);

		return true;
	};

	/**
	 * Активировать первый таб.
	 */
	const activateFirstTab = (tabs) => {
		const { navs } = getTabsItems(tabs);

		if (!navs.length) {
			return false;
		}

		return activateTab(tabs, navs[0].dataset.tab);
	};

	/**
	 * Найти .tabs, которому непосредственно принадлежит элемент.
	 */
	const getOwnTabs = (element) => {
		return element.closest(tabsSelector);
	};

	/**
	 * Найти первый таб с указанным ID.
	 *
	 * Если одинаковый data-tab есть в нескольких местах,
	 * используется первый подходящий в DOM.
	 */
	const findTabById = (tabId) => {
		const triggers = document.querySelectorAll(`${navContainer} [data-tab]`);

		for (const trigger of triggers) {
			if (trigger.dataset.tab !== tabId) {
				continue;
			}

			const tabs = getOwnTabs(trigger);

			if (!tabs) {
				continue;
			}

			const { navs, contents } = getTabsItems(tabs);

			const isOwnTrigger = navs.includes(trigger);

			const hasContent = contents.some((element) => getContentId(element) === tabId);

			if (isOwnTrigger && hasContent) {
				return {
					tabs,
					trigger,
				};
			}
		}

		return null;
	};

	/**
	 * Найти родительский .tabs.
	 *
	 * Например:
	 *
	 * .tabs (родитель)
	 *   .tab
	 *     .tabs (дочерний)
	 *
	 * Для дочернего .tabs вернёт родительский .tabs.
	 */
	const getParentTabs = (tabs) => {
		let element = tabs.parentElement;

		while (element) {
			const parentTabs = element.closest(tabsSelector);

			if (!parentTabs) {
				return null;
			}

			if (parentTabs !== tabs) {
				return parentTabs;
			}

			element = parentTabs.parentElement;
		}

		return null;
	};

	/**
	 * Открыть таб по hash вместе со всеми родителями.
	 *
	 * Например:
	 *
	 * #tab-222
	 *
	 * Если структура:
	 *
	 * .tabs
	 *   tab-parent-1
	 *     .tabs
	 *       tab-222
	 *
	 * сначала откроется tab-parent-1,
	 * затем tab-222.
	 */
	const activateTabFromHash = (tabId) => {
		const found = findTabById(tabId);

		if (!found) {
			return false;
		}

		const targetTabs = found.tabs;

		/**
		 * Собираем цепочку родителей.
		 */
		const tabsChain = [targetTabs];

		let currentTabs = targetTabs;

		while (true) {
			const parentTabs = getParentTabs(currentTabs);

			if (!parentTabs) {
				break;
			}

			tabsChain.push(parentTabs);
			currentTabs = parentTabs;
		}

		/**
		 * Теперь идём от самого внешнего .tabs
		 * к самому внутреннему.
		 */
		tabsChain.reverse();

		tabsChain.forEach((tabs, index) => {
			// Самый внутренний .tabs —
			// активируем конкретный hash-tab
			if (index === tabsChain.length - 1) {
				activateTab(tabs, tabId);
				return;
			}

			/**
			 * Ищем следующий .tabs в цепочке.
			 */
			const childTabs = tabsChain[index + 1];

			const { contents } = getTabsItems(tabs);

			const parentContent = contents.find((content) => content.contains(childTabs));

			if (!parentContent) {
				return;
			}

			const parentTabId = getContentId(parentContent);

			activateTab(tabs, parentTabId);
		});

		return true;
	};

	/**
	 * Инициализация всех .tabs.
	 */
	tabsItems.forEach((tabs) => {
		const { nav, navs, contents } = getTabsItems(tabs);

		if (!nav || !navs.length || !contents.length) {
			return;
		}

		/**
		 * Если нет активного таба —
		 * активируем первый.
		 */
		const activeNav = navs.find((element) => element.classList.contains(isActiveClass));

		const activeContent = contents.find((element) => element.classList.contains(isActiveClass));

		if (!activeNav || !activeContent) {
			activateFirstTab(tabs);
		}

		/**
		 * Клик по кнопкам.
		 */
		nav.addEventListener('click', (event) => {
			const trigger = event.target.closest('[data-tab]');

			if (!trigger) {
				return;
			}

			/**
			 * Проверяем, что кнопка принадлежит
			 * именно этому уровню .tabs.
			 */
			if (trigger.closest(tabsSelector) !== tabs) {
				return;
			}

			if (trigger.classList.contains(isActiveClass)) {
				return;
			}

			const tabId = trigger.dataset.tab;

			if (!activateTab(tabs, tabId)) {
				return;
			}

			/**
			 * Обновляем hash без перезагрузки.
			 */
			history.replaceState(null, '', `#${encodeURIComponent(tabId)}`);
		});
	});

	/**
	 * После инициализации всех .tabs
	 * обрабатываем hash.
	 */
	if (location.hash) {
		const hashTabId = decodeURIComponent(location.hash.slice(1));

		activateTabFromHash(hashTabId);
	}

	/**
	 * Обработка изменения hash.
	 */
	window.addEventListener('hashchange', () => {
		const hashTabId = decodeURIComponent(location.hash.slice(1));

		if (!hashTabId) {
			return;
		}

		activateTabFromHash(hashTabId);
	});
}
