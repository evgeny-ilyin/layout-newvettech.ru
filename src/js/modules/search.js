/**
 * Модуль поиска с автодополнением (suggest) для списка в bitrix:news.
 *
 * @module search
 * @copyright 2025 Evgeny Ilyin
 *
 * - Выполняет основной поиск через fetch с подменой результатов без перезагрузки страницы.
 * - Реализует suggest (автодополнение) с debounce и запросами к JSON endpoint.
 * - Использует кэширование результатов (отдельно для suggest и полного поиска).
 * - Поддерживает отмену предыдущих запросов через AbortController.
 * - Обеспечивает навигацию по suggest с клавиатуры (↑ ↓ Enter).
 * - При выборе элемента suggest выполняет переход на детальную страницу.
 * - Управляет доступностью (ARIA): aria-expanded, role="listbox/option".
 * - Скрывает suggest при blur и восстанавливает при повторном focus (если есть данные).
 * - Ограничивает минимальную длину запроса для отправки.
 *
 * @example
 * Инициализация поиска
 * import { searchInit } from './modules/search.js';
 * searchInit();
 *
 * @example
 * <!-- Пример HTML -->
 * <form class="search-form js-novalidate" id="js-search-form" autocomplete="off">
 *   <div class="search-form__wrapper">
 *     <div class="search-form__request w-full">
 *       <label for="js-search-input" class="sr-only">Поиск врача по фамилии или специальности</label>
 *       <input type="text" class="w-full"
 *         name="q"
 *         id="js-search-input"
 *         value=""
 *         placeholder="Введите фамилию или специальность врача"
 *         data-suggest-url="/ajax/suggest-search.php"
 *         aria-expanded="false"
 *         aria-autocomplete="list"
 *         aria-controls="js-search-suggest">
 *       <div class="suggest-box" id="js-search-suggest" role="listbox"></div>
 *     </div>
 *     <div class="search-form__submit">
 *       <button type="submit" class="btn btn_md">Найти</button>
 *     </div>
 *   </div>
 * </form>
 *
 * @export
 * @function searchInit
 * @returns {void} Ничего не возвращает, управляет DOM и сетевыми запросами.
 */

import { lockSubmitButton, unlockSubmitButton } from './formSubmit.js';

export function searchInit({
	formSelector = '#js-search-form',
	inputSelector = '#js-search-input',
	suggestSelector = '#js-search-suggest',
	suggestItemSelector = '.suggest-item',
	suggestMsgSelector = '.suggest-msg',
	resultsSelector = '.js-results',
	loadMoreSelector = '.js-load-more',
	loaderClass = 'is-loading',
	activeClass = 'is-active',
} = {}) {
	const form = document.querySelector(formSelector);
	const input = document.querySelector(inputSelector);
	const suggestBox = document.querySelector(suggestSelector);

	let el = form?.nextElementSibling;
	while (el && !el.matches(resultsSelector)) {
		el = el.nextElementSibling;
	}
	const resultsNode = el;

	el = resultsNode?.nextElementSibling;
	while (el && !el.matches(loadMoreSelector)) {
		el = el.nextElementSibling;
	}
	const pagerNode = el;

	if (!form || !input || !resultsNode) {
		return;
	}

	const submitButton = form.querySelector('[type="submit"]');
	const submitUrl = window.location.href;
	// const submitUrl = 'http://localhost:3030/src/ajax/search-doctors.php'; // тестовый submit
	const suggestUrl = input.dataset.suggestUrl;

	const minLength = 4;
	const delay = 0; // для основного поиска
	const suggestDelay = 600; // для suggest

	const cache = {};
	const maxCache = 10;

	const result = '';
	let lastSubmitQuery = '';
	let lastSuggestQuery = '';
	let submitController = null;
	let suggestController = null;
	let isLoading = false;
	let debounceTimer = null;
	let activeIndex = -1;

	/* Общий поиск */
	async function searchDoctors(query, clinicId = '') {
		const requestKey = `${clinicId}_${query}`;
		const cacheKey = `full_${clinicId}_${query}`;

		// Не дергаем одинаковый запрос
		if (requestKey === lastSubmitQuery && !isLoading) {
			return;
		}

		lastSubmitQuery = requestKey;

		// Кэш
		if (cache[cacheKey]) {
			replaceContent(cache[cacheKey], resultsNode);
			loadMoreHandler(pagerNode);
			return;
		}

		if (submitController) {
			submitController.abort();
		}

		submitController = new AbortController();
		isLoading = true;

		lockSubmitButton(submitButton, loaderClass);

		const url = new URL(submitUrl);
		url.searchParams.set('q', query);

		if (clinicId) {
			url.searchParams.set('CLINIC_ID', clinicId);
		}

		const startTime = Date.now();

		try {
			const response = await fetch(url.toString(), {
				method: 'GET',
				credentials: 'same-origin',
				signal: submitController.signal,
			});

			if (!response.ok) {
				throw new Error(`HTTP error: ${response.status}`);
			}

			const html = await response.text();
			const result = getResult(html, resultsSelector);

			cache[cacheKey] = result;

			if (Object.keys(cache).length > maxCache) {
				delete cache[Object.keys(cache)[0]];
			}

			const elapsed = Date.now() - startTime;

			const apply = () => {
				// Проверяем, что этот запрос всё ещё актуален
				if (requestKey !== lastSubmitQuery) {
					return;
				}

				replaceContent(result, resultsNode);
				loadMoreHandler(pagerNode);
				isLoading = false;
				unlockSubmitButton(submitButton, loaderClass);
			};

			if (elapsed < delay) {
				setTimeout(apply, delay - elapsed);
			} else {
				apply();
			}
		} catch (err) {
			if (err.name !== 'AbortError') {
				console.error(err);
				isLoading = false;
				unlockSubmitButton(submitButton, loaderClass);
			}
		}
	}

	/* Submit поиск v1 */
	/*form.addEventListener('submit', function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();

		const query = input.value.trim();

		if (query.length < minLength) {
			return;
		}

		const clinicId = resultsNode.dataset.clinicId || '';
		const cacheKey = `full_${clinicId}_${query}`;
		const requestKey = `${clinicId}_${query}`;

		if (cache[cacheKey]) {
			applyWithDelay(cache[cacheKey]);
			return;
		}

		// Не дергаем одинаковый запрос
		if (requestKey === lastSubmitQuery && !isLoading) {
			return;
		}

		lastSubmitQuery = requestKey;

		suggestBox.style.display = 'none';
		suggestBox.innerHTML = '';
		input.blur();
		input.setAttribute('aria-expanded', 'false');

		lockSubmitButton(submitButton, loaderClass);

		const applyWithDelay = (html) => {
			setTimeout(() => {
				replaceContent(html, resultsNode);
				unlockSubmitButton(submitButton, loaderClass);
				loadMoreHandler(pagerNode);
				isLoading = false;
			}, delay);
		};

		if (submitController) {
			submitController.abort();
		}

		submitController = new AbortController();
		isLoading = true;

		const url = new URL(submitUrl);
		url.searchParams.set('q', query);

		if (clinicId) {
			url.searchParams.set('CLINIC_ID', clinicId);
		}

		const startTime = Date.now();

		fetch(url.toString(), {
			method: 'GET',
			credentials: 'same-origin',
			signal: submitController.signal,
		})
			.then((res) => res.text())
			.then((html) => {
				result = getResult(html, resultsSelector);
				cache[cacheKey] = result;

				if (Object.keys(cache).length > maxCache) {
					delete cache[Object.keys(cache)[0]];
				}

				const elapsed = Date.now() - startTime;

				const apply = () => {
					replaceContent(result, resultsNode);
					unlockSubmitButton(submitButton, loaderClass);
					loadMoreHandler(pagerNode);
					isLoading = false;
				};

				if (elapsed < delay) {
					setTimeout(apply, delay - elapsed);
				} else {
					apply();
				}
			})
			.catch((err) => {
				if (err.name !== 'AbortError') {
					console.error(err);
					unlockSubmitButton(submitButton, loaderClass);
					isLoading = false;
				}
			});
	});
	*/

	/* Submit поиск */
	form.addEventListener('submit', function (e) {
		e.preventDefault();
		e.stopImmediatePropagation();

		const query = input.value.trim();

		if (query.length < minLength) {
			return;
		}

		const clinicId = resultsNode.dataset.clinicId || '';

		suggestBox.style.display = 'none';
		suggestBox.innerHTML = '';
		input.blur();
		input.setAttribute('aria-expanded', 'false');

		searchDoctors(query, clinicId);
	});

	/* Смена клиники */
	document.addEventListener('doctors:clinic-change', function (e) {
		const clinicId = e.detail?.clinicId || '';
		const query = input.value.trim();

		// Обновляем clinicId сразу, чтобы suggest и поиск дальше использовали актуальную клинику
		resultsNode.dataset.clinicId = clinicId;

		// Если есть поисковый запрос — повторяем поиск с новой клиникой
		if (query.length >= minLength) {
			suggestBox.style.display = 'none';
			suggestBox.innerHTML = '';
			input.setAttribute('aria-expanded', 'false');
			input.blur();

			searchDoctors(query, clinicId);

			return;
		}

		// Если поиска нет -- ничего здесь не делаем. doctorsFilterInit сам загрузит врачей выбранной клиники.
	});

	/* Suggest поиск */
	input.addEventListener('input', function () {
		const query = input.value.trim();
		clearTimeout(debounceTimer);

		// Пусто -- скрываем
		if (!query.length || query.length < minLength) {
			suggestBox.style.display = 'none';
			suggestBox.innerHTML = '';
			input.setAttribute('aria-expanded', 'false');
			return;
		}

		// Предупреждение о длине
		// if (query.length > 2 && query.length < minLength) {
		// 	suggestBox.innerHTML = "<div class='suggest-msg'>Минимум 4 знака</div>";
		// 	return;
		// }

		// Debounce
		debounceTimer = setTimeout(() => {
			loadSuggest(query);
		}, suggestDelay);
	});

	/* Load suggest v1 (json) */
	/*function loadSuggest(query) {
		// Кэш suggest
		if (cache['suggest_' + query]) {
			renderSuggest(cache['suggest_' + query]);
			return;
		}

		// Не дергаем одинаковый запрос
		if (query === lastSuggestQuery) {
			return;
		}

		lastSuggestQuery = query;

		if (suggestController) {
			suggestController.abort();
		}

		suggestController = new AbortController();

		if (!suggestUrl) {
			return;
		}

		fetch(suggestUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ q: query }),
			signal: suggestController.signal,
		})
			.then((res) => res.json())
			.then((data) => {
				cache['suggest_' + query] = data;
				renderSuggest(data);
			})
			.catch((err) => {
				if (err.name !== 'AbortError') {
					console.error(err);
				}
			});
	}
	*/

	/* Load suggest (json) */
	function loadSuggest(query) {
		const clinicId = resultsNode.dataset.clinicId || '';
		const cacheKey = `suggest_${clinicId}_${query}`;

		// Кэш suggest с учетом клиники
		if (cache[cacheKey]) {
			renderSuggest(cache[cacheKey]);
			return;
		}

		// Не дергаем одинаковый запрос
		const requestKey = `${clinicId}_${query}`;

		if (requestKey === lastSuggestQuery) {
			return;
		}

		lastSuggestQuery = requestKey;

		if (suggestController) {
			suggestController.abort();
		}

		suggestController = new AbortController();

		if (!suggestUrl) {
			return;
		}

		fetch(suggestUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				q: query,
				clinicId: clinicId,
			}),
			signal: suggestController.signal,
		})
			.then((res) => res.json())
			.then((data) => {
				cache[cacheKey] = data;
				renderSuggest(data);
			})
			.catch((err) => {
				if (err.name !== 'AbortError') {
					console.error(err);
				}
			});
	}

	/* Render suggest */
	function renderSuggest(items) {
		activeIndex = -1;
		suggestBox.innerHTML = '';

		if (!items || !items.length) {
			suggestBox.innerHTML = "<div class='suggest-msg'>Ничего не найдено</div>";
			suggestBox.style.display = 'block';
			input.setAttribute('aria-expanded', 'true');
			return;
		}

		const html = items
			.map(
				(item, index) => `
			<a href="${item.URL}" class="suggest-item" data-index="${index}" role="option">
				<div class="suggest-item__data-primary">${item.PRIMARY}</div>
				${item.SECONDARY ? `<div class="suggest-item__data-seconadry">${item.SECONDARY}</div>` : ''}
				${item.LOCATIONS ? `<div class="suggest-item__data-note location">${item.LOCATIONS.join(', ')}</div>` : ''}
			</a>
    `
			)
			.join('');

		suggestBox.innerHTML = html;

		// Не активируем suggestBox, если уже подгрузились результаты поиска по submit и поле поиска не в фокусе
		if (document.activeElement === input) {
			suggestBox.style.display = 'block';
			input.setAttribute('aria-expanded', 'true');
		}
	}

	function updateActiveItem() {
		const items = suggestBox.querySelectorAll(suggestItemSelector);

		items.forEach((el) => el.classList.remove(activeClass));

		if (activeIndex >= 0 && items[activeIndex]) {
			items[activeIndex].classList.add(activeClass);
		}
	}

	input.addEventListener('keydown', function (e) {
		const items = suggestBox.querySelectorAll(suggestItemSelector);

		if (e.key === 'ArrowDown') {
			if (!items.length) {
				return;
			}

			e.preventDefault();
			activeIndex = (activeIndex + 1) % items.length;
			updateActiveItem();
			return;
		}

		if (e.key === 'ArrowUp') {
			if (!items.length) {
				return;
			}

			e.preventDefault();
			activeIndex = (activeIndex - 1 + items.length) % items.length;
			updateActiveItem();
			return;
		}

		if (e.key === 'Enter') {
			// Если выбран элемент -- идем на него
			if (activeIndex >= 0 && items[activeIndex]) {
				e.preventDefault();
				window.location.href = items[activeIndex].href;
				return;
			}

			// Иначе -- обычный submit (ничего не блокируем)
		}
	});

	input.addEventListener('blur', function () {
		suggestBox.style.display = 'none';
		input.setAttribute('aria-expanded', 'false');
		activeIndex = -1;
	});

	input.addEventListener('focus', function () {
		const hasItems = suggestBox.querySelector(suggestItemSelector, suggestMsgSelector);

		if (!hasItems) {
			return;
		}

		// Показываем блок
		suggestBox.style.display = 'block';
		input.setAttribute('aria-expanded', 'true');
	});

	suggestBox.addEventListener('mousedown', function (e) {
		if (e.target.closest(suggestItemSelector)) {
			e.preventDefault(); // не даем input потерять фокус
		}
	});

	suggestBox.addEventListener('mouseover', function (e) {
		const item = e.target.closest(suggestItemSelector);
		if (!item) {
			return;
		}

		const index = parseInt(item.dataset.index, 10);
		if (isNaN(index)) {
			return;
		}

		activeIndex = index;
		updateActiveItem();
	});
}

function getResult(html, resultsSelector) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const newBlock = doc.querySelector(resultsSelector);
	if (!newBlock) {
		return;
	}
	return newBlock.innerHTML;
}

function replaceContent(html, resultsNode) {
	if (!resultsNode) {
		return;
	}
	resultsNode.innerHTML = html;
}

function loadMoreHandler(pagerNode) {
	if (!pagerNode) {
		return;
	}
	pagerNode.innerHTML = '';
}
