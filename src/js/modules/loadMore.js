/**
 * Модуль подгрузки элементов списка ("Load more") для компонентов наподобие bitrix:news.
 *
 * @module loadMore
 * @copyright 2026 Evgeny Ilyin
 *
 * - Загружает следующую страницу элементов через fetch без перезагрузки страницы.
 * - Вставляет новые элементы в существующий список результатов.
 * - Обновляет блок пагинации (кнопку "Показать ещё") на основе ответа сервера.
 * - Предотвращает повторные клики во время загрузки (через CSS-класс).
 * - Устойчив к ошибкам: обрабатывает невалидный HTML и сетевые сбои.
 * - Поддерживает настройку селекторов и параметров через объект опций.
 * - Работает через делегирование событий (подходит для динамического DOM).
 *
 * @param {Object} [options={}] - Объект настроек
 * @param {string} [options.resultsSelector='.js-results'] - Селектор контейнера с результатами
 * @param {string} [options.pagerSelector='.js-load-more'] - Селектор блока пагинации
 * @param {string} [options.buttonSelector='.js-load-more-button'] - Селектор кнопки загрузки
 * @param {string} [options.loaderClass='is-loading'] - CSS-класс состояния загрузки
 * @param {string} [options.pageParam='PAGEN_1'] - GET-параметр номера страницы
 *
 * @example
 * Инициализация модуля
 * import { loadMoreInit } from './modules/loadMore.js';
 * loadMoreInit();
 *
 * @example
 * <!-- Пример HTML -->
 * <div class="some-list-wrapper js-results" data-more-url="/local/ajax/load-more.php"></div>
 *
 * <div class="load-more-wrapper js-load-more">
 *   <button
 *     class="js-load-more-button"
 *     data-page="2">
 *     Показать ещё
 *   </button>
 * </div>
 *
 * @example
 * Инициализация с кастомными настройками
 * loadMoreInit({
 *   resultsSelector: '.my-results',
 *   pagerSelector: '.my-pager',
 *   buttonSelector: '.my-load-more-btn',
 *   loaderClass: 'loading',
 *   pageParam: 'page'
 * });
 *
 * @export
 * @function loadMoreInit
 * @returns {void} Ничего не возвращает, управляет DOM и сетевыми запросами.
 */

export function loadMoreInit({
	resultsSelector = '.js-results',
	pagerSelector = '.js-load-more',
	buttonSelector = '.js-load-more-button',
	loaderClass = 'is-loading',
	pageParam = 'PAGEN_1',
} = {}) {
	const fetchByUrl = async (trigger) => {
		if (trigger.classList.contains(loaderClass)) {
			return;
		}

		const pagerNode = trigger.closest(pagerSelector);

		let el = pagerNode?.previousElementSibling;
		while (el && !el.matches(resultsSelector)) {
			el = el.previousElementSibling;
		}

		const targetNode = el;
		const moreUrl = targetNode?.dataset.moreUrl;
		const page = parseInt(trigger.dataset.page, 10);

		if (!targetNode || !pagerNode || !moreUrl || Number.isNaN(page)) {
			return;
		}

		const url = `${moreUrl}?${pageParam}=${page}`;

		// Убираем возможность повторного нажатия
		trigger.classList.add(loaderClass);

		try {
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status}`);
			}

			const html = await response.text();
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			const newResults = doc.querySelector(resultsSelector);
			const newPager = doc.querySelector(pagerSelector);

			if (newResults) {
				targetNode.insertAdjacentHTML('beforeend', newResults.innerHTML);
			}

			if (newPager) {
				pagerNode.innerHTML = newPager.innerHTML;
			}
		} catch (e) {
			console.error('Load more error:', e);
		} finally {
			trigger.classList.remove(loaderClass);
		}
	};

	document.addEventListener('click', (e) => {
		const btn = e.target.closest(buttonSelector);
		if (btn) {
			e.preventDefault();
			fetchByUrl(btn);
		}
	});
}
