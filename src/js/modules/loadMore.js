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

/**
 * первая версия без учета фильтра
export function loadMoreInitV1({
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

		const params = new URLSearchParams();
		params.set(pageParam, page);

		const clinicId = targetNode.dataset.clinicId;
		if (clinicId) {
			params.set('CLINIC_ID', clinicId);
		}

		const url = `${moreUrl}?${params.toString()}`;

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
			} else {
				pagerNode.innerHTML = '';
			}
		} catch (e) {
			console.error('Load more error:', e);
		} finally {
			trigger.classList.remove(loaderClass);
		}
	};

	document.addEventListener('click', (e) => {
		const btn = e.target.closest(buttonSelector);

		if (!btn) {
			return;
		}

		e.preventDefault();
		fetchByUrl(btn);
	});
}

export function doctorsFilterInit({
	filterSelector = '.js-filter-doctors',
	resultsSelector = '.js-results',
	pagerSelector = '.js-load-more',
	loaderClass = 'is-loading',
} = {}) {
	const filter = document.querySelector(filterSelector);
	const results = document.querySelector(resultsSelector);

	if (!filter || !results) {
		return;
	}

	let controller = null;

	const loadDoctors = async (clinicId) => {
		/**
		 * Отменяем предыдущий запрос.
		 *
		 * Например: пользователь быстро нажал:
		 *
		 * Клиника 15
		 * Клиника 16
		 * Запрос 15 больше не нужен.
		 */
		controller?.abort();

		controller = new AbortController();

		const moreUrl = results.dataset.moreUrl;

		if (!moreUrl) {
			return;
		}

		const params = new URLSearchParams();

		/**
		 * Для смены клиники всегда загружаем первую страницу.
		 */
		params.set('PAGEN_1', '1');

		if (clinicId) {
			params.set('CLINIC_ID', clinicId);
		}

		const url = `${moreUrl}?${params.toString()}`;

		results.classList.add(loaderClass);

		/**
		 * Убираем старый список и pager.
		 */
		results.innerHTML = '';

		const pager = results.nextElementSibling;

		if (pager?.matches(pagerSelector)) {
			pager.innerHTML = '';
		}

		try {
			const response = await fetch(url, {
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status}`);
			}

			const html = await response.text();

			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			const newResults = doc.querySelector(resultsSelector);
			const newPager = doc.querySelector(pagerSelector);

			if (newResults) {
				results.innerHTML = newResults.innerHTML;

				/**
				 * Сохраняем выбранную клинику в основном контейнере.
				 */
				results.dataset.clinicId = clinicId;
			}

			if (pager?.matches(pagerSelector)) {
				if (newPager) {
					pager.innerHTML = newPager.innerHTML;
				} else {
					pager.innerHTML = '';
				}
			}
		} catch (error) {
			/**
			 * AbortError: пользователь выбрал другую клинику.
			 */
			if (error.name !== 'AbortError') {
				console.error('Ошибка фильтрации:', error);
			}
		} finally {
			results.classList.remove(loaderClass);
		}
	};

	/* v1 */
	/*filter.addEventListener('click', (e) => {
		const button = e.target.closest('[data-clinic-id]');

		if (!button || !filter.contains(button)) {
			return;
		}

		const clinicId = button.dataset.clinicId || '';

		/**
		 * Переключаем активную кнопку.
		 * /
		filter.querySelectorAll('[data-clinic-id]').forEach((item) => {
			item.classList.toggle('is-active', item === button);
		});

		loadDoctors(clinicId);
	});
	*/

	filter.addEventListener('click', (e) => {
		const button = e.target.closest('[data-clinic-id]');

		if (!button || !filter.contains(button)) {
			return;
		}

		const clinicId = button.dataset.clinicId || '';

		filter.querySelectorAll('[data-clinic-id]').forEach((item) => {
			item.classList.toggle('is-active', item === button);
		});

		// Сообщаем поиску о смене клиники.
		// search.js сам решит, нужно ли повторять поиск.
		document.dispatchEvent(
			new CustomEvent('doctors:clinic-change', {
				detail: {
					clinicId,
				},
			})
		);

		const searchInput = document.querySelector('#js-search-input');
		const query = searchInput?.value.trim() || '';

		// Если есть активный поиск -- search.js загрузит результаты.
		if (query.length >= 4) {
			return;
		}

		// Если поиска нет -- обычная загрузка врачей клиники.
		loadDoctors(clinicId);
	});
}
