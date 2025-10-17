/**
 * Модуль для работы с аккордеонами.
 *
 * @module accordion
 * @copyright 2025 Evgeny Ilyin
 *
 * - Поддерживает несколько аккордеонов на одной странице.
 * - Работает как в обычном режиме (несколько секций могут быть открыты), так и в режиме "single" (открыта только одна).
 * - Открытие и закрытие выполняется по клику на триггер.
 * - Дополнительно поддерживает закрытие по клику внутри открытого элемента (кроме самого триггера).
 * - Высота контента управляется через `max-height`, что позволяет использовать CSS-переходы для плавной анимации.
 * - При `window.load` и `window.resize` пересчитывается высота всех открытых элементов, чтобы соответствовать их фактическому содержимому.
 *
 * @param {Object} [options={}] - Объект с настройками функции.
 * @param {string} [options.accordionClass='.js-accordion'] - Селектор контейнера аккордеона.
 * @param {string} [options.accordionItemClass='.accordion__item'] - Селектор элемента аккордеона.
 * @param {string} [options.isOpenedClass='is-opened'] - CSS-класс открытого элемента.
 * @param {string} [options.triggerClass='.js-accordion-trigger'] - Селектор кнопки-триггера.
 * @param {string} [options.singleModeClass='.js-accordion-single'] - CSS-класс для режима "только один открыт".
 *
 * @example
 * Инициализация аккордеона
 * import { accordion } from './modules/accordion.js';
 * accordion();
 *
 * @example
 * <!-- Пример HTML -->
 * <div class="accordion js-accordion js-accordion-single">
 *   <div class="accordion__item">
 *     <div class="accordion__header">
 *       <button type="button" id="accordion-trigger-1" class="js-accordion-trigger" aria-expanded="false" aria-controls="accordion-panel-1">
 *         Заголовок 1
 *       </button>
 *     </div>
 *     <div id="accordion-panel-1" class="accordion__content" role="region" aria-hidden="true" aria-labelledby="accordion-trigger-1">
 *       Контент первой секции
 *     </div>
 *   </div>
 * </div>
 *
 * @export
 * @function accordion
 * @returns {void} Ничего не возвращает, изменяет DOM-состояние.
 */

export function accordion({
	accordionClass = 'js-accordion',
	accordionItemClass = 'accordion__item',
	isOpenedClass = 'is-opened',
	triggerClass = 'js-accordion-trigger',
	singleModeClass = 'js-accordion-single',
} = {}) {
	const accordions = document.querySelectorAll(`.${accordionClass}`);

	// Переключение активности элемента аккордеона
	const toggleAccordion = (accordionItem, trigger, accordion, singleMode) => {
		const accordionContent = trigger.parentElement.nextElementSibling;
		const isOpen = accordionItem.classList.contains(isOpenedClass);

		if (singleMode) {
			accordion.querySelectorAll(`.${isOpenedClass}`).forEach((openItem) => {
				if (openItem !== accordionItem) {
					openItem.classList.remove(isOpenedClass);
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
	};

	accordions.forEach((accordion) => {
		const triggers = accordion.querySelectorAll(`.${triggerClass}`);
		const singleMode = accordion.classList.contains(`${singleModeClass}`);

		triggers.forEach((trigger) => {
			const accordionItem = trigger.closest(`.${accordionItemClass}`);

			// Открытие/закрытие по триггеру
			trigger.addEventListener('click', (e) => {
				e.stopPropagation();
				toggleAccordion(accordionItem, trigger, accordion, singleMode);
			});

			// Закрытие по клику в области открытого элемента (кроме триггера)
			accordionItem.addEventListener('click', (e) => {
				if (
					accordionItem.classList.contains(isOpenedClass) &&
					!e.target.classList.contains(triggerClass)
				) {
					toggleAccordion(accordionItem, trigger, accordion, singleMode);
				}
			});
		});
	});

	// Глобальный пересчёт открытых элементов
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

/* Расчёт и добавление инлайн css переменных в элементы аккордеона для их корректного размещения по окружности */
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
