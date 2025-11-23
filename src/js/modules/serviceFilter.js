/**
 * Модуль для фильтрации услуг по поисковому запросу.
 *
 * @module serviceFilter
 * @copyright 2025 Evgeny Ilyin
 *
 * - Поддерживает множество секций (service-group) на одной странице.
 * - Фильтрация выполняется по названию услуги (селектор nameSelector).
 * - Если поле поиска очищено - показываются все элементы.
 * - Если внутри аккордеона нет подходящих элементов - он скрывается.
 * - Если внутри секции нет подходящих аккордеонов - скрывается секция целиком.
 * - Поддерживает дополнительный блок "нет совпадений", который показывается,
 *   если на странице нет ни одного подходящего результата.
 * - CSS-анимации скрытия/появления выполняются через добавление класса hiddenClass.
 *
 *   Примечание: модуль выполняет нормализацию русских букв, уравнивая "е" и "ё"
 *   для корректного поиска (например, "приём" ≡ "прием").
 *
 * @param {Object} [options={}] - Объект с настройками функции.
 * @param {string} [options.inputSelector='#js-quick-search'] - Селектор поля ввода.
 * @param {string} [options.groupSelector='.service-group'] - Селектор секции.
 * @param {string} [options.accordionSelector='.js-accordion-item'] - Селектор аккордеона.
 * @param {string} [options.itemSelector='.service-group-item'] - Селектор услуги.
 * @param {string} [options.nameSelector='.service-group-item__name'] - Селектор названия услуги.
 * @param {string} [options.noResultsSelector='.js-no-results'] - Селектор блока "ничего не найдено".
 * @param {string} [options.hiddenClass='is-hidden'] - CSS-класс скрытия элементов.
 *
 * @example
 * import { serviceFilter } from './modules/serviceFilter.js';
 * serviceFilter();
 *
 * @example
 * <!-- Пример HTML блока "нет совпадений" -->
 * <div class="quick-search__no-results js-no-results is-hidden">Совпадений не&nbsp;обнаружено</div>
 *
 * @export
 * @function serviceFilter
 * @returns {void} Ничего не возвращает, управляет DOM-состоянием.
 */

export function serviceFilter({
	inputSelector = '#js-quick-search',
	groupSelector = '.service-group',
	accordionSelector = '.js-accordion-item',
	itemSelector = '.service-group-item',
	nameSelector = '.service-group-item__name',
	noResultsSelector = '.js-no-results',
	hiddenClass = 'is-hidden',
} = {}) {
	const input = document.querySelector(inputSelector);
	const noResults = document.querySelector(noResultsSelector);

	if (!input) {
		return;
	}

	/* Применение фильтра */
	const applyFilter = () => {
		const normalize = (str) => str.toLowerCase().replace(/ё/g, 'е');
		const query = normalize(input.value.trim());

		let anyMatch = false;

		document.querySelectorAll(groupSelector).forEach((group) => {
			let groupHasMatches = false;

			group.querySelectorAll(accordionSelector).forEach((acc) => {
				let accHasMatches = false;

				const items = acc.querySelectorAll(itemSelector);

				items.forEach((item) => {
					const name = normalize(item.querySelector(nameSelector)?.textContent || '');

					if (!query || name.includes(query)) {
						item.classList.remove(hiddenClass);
						accHasMatches = true;
					} else {
						item.classList.add(hiddenClass);
					}
				});

				// Скрываем аккордеон, если нет найденных
				if (accHasMatches) {
					acc.classList.remove(hiddenClass);
					groupHasMatches = true;
					anyMatch = true;
				} else {
					acc.classList.add(hiddenClass);
				}
			});

			// Скрываем секцию, если нет результатов
			if (groupHasMatches) {
				group.classList.remove(hiddenClass);
			} else {
				group.classList.add(hiddenClass);
			}
		});

		// Показ/скрытие блока "нет совпадений"
		if (noResults) {
			noResults.classList.toggle(hiddenClass, anyMatch);
		}
	};

	// Запуск фильтра при вводе
	input.addEventListener('input', applyFilter);
}
