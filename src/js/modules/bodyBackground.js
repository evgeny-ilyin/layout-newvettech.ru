/**
 * Модуль для генерации фоновых размытых кругов (SVG) на странице.
 *
 * @module bodyBackground
 * @copyright 2025 Evgeny Ilyin
 *
 * - Создаёт набор SVG-элементов с использованием символа `#circle-blurry`.
 * - Поддерживает кастомизацию параметров (позиция, прозрачность, масштаб, задержка анимации).
 * - Если пользовательские параметры не переданы, используется дефолтный набор кругов.
 * - Можно импортировать `defaultCircles`, чтобы переиспользовать и изменять базовый набор параметров.
 *
 * @typedef {Object} Circle
 * @property {string|number} [top=0] - Отступ сверху для позиционирования круга (например, '10%' или 0).
 * @property {string|number} [left=0] - Отступ слева.
 * @property {string|number} [right=0] - Отступ справа (можно использовать вместо left при необходимости).
 * @property {string|number} [margin=0] - Центрирование круга при значении 'auto' (left и right должны быть 0).
 * @property {number} [opacity=0.5] - Прозрачность круга (от 0 до 1).
 * @property {number} [delay=0] - Задержка старта анимации в секундах.
 * @property {number} [scale=1] - Коэффициент масштаба scale (умножается на исходное значение и используется в CSS transform).
 * @property {number} [ratio=1] - Коэффициент сдвига translate (тоже CSS transform).
 *
 * @param {Circle[]} [circles=defaultCircles] - Массив объектов с параметрами кругов.
 *
 * @example
 * <!-- Пример размещения шаблона svg symbol в HTML -->
 * <div class="body-background">
 *   <svg width="0" height="0">
 *      <defs>
 *         <filter id="blur" x="0" y="0" width="600" height="600" filterUnits="userSpaceOnUse">
 *            <feGaussianBlur stdDeviation="60" />
 *         </filter>
 *         <symbol id="circle-blurry" viewbox="0 0 600 600">
 *            <g filter="url(#blur)" opacity="1">
 *               <circle cx="50%" cy="50%" r="24%" fill="#8965fd" />
 *            </g>
 *         </symbol>
 *      </defs>
 *   </svg>
 *   <div class="body-background__content content">
 *   </div>
 * </div>
 *
 * @example
 * Использование с дефолтными параметрами
 * import { bodyBackground } from './modules/bodyBackground.js';
 * bodyBackground();
 *
 * @example
 * Использование с кастомными параметрами
 * Если у контейнера `.body-background` есть `data-circles`, то используется оно, иначе берутся defaultCircles.
 * data-circles='[
 *   {"top":0,"margin":"auto","opacity":0.7,"delay":-10,"scale":0.8,"ratio":0.5}
 *   {"top":"10%","left":"20%","opacity":0.6,"delay":1,"scale":1.8},
 *   {"top":"50%","left":"50%","opacity":0.4,"delay":0.5,"scale":1.3}
 * ]'>
 *
 * @example
 * Изменение дефолтного набора
 * import { bodyBackground, defaultCircles } from './modules/bodyBackground.js';
 * const custom = [...defaultCircles];
 * custom[0].top = '15%';
 * bodyBackground(custom);
 *
 * @export
 * @function bodyBackground
 * @returns {void} Ничего не возвращает, изменяет DOM, добавляя элементы в `.body-background__content`.
 */

const defaultCircles = [
	{ top: '5%', left: '-50%', opacity: 0.5, scale: 1.5, delay: 0.7 },
	{ top: '22%', left: '-30%', opacity: 0.5, scale: 1.2, delay: 2.7 },
	{ top: '40%', left: '85%', opacity: 0.3, scale: 1.5, delay: 0.9 },
	{ top: '62%', left: '65%', opacity: 0.3, scale: 1, delay: 0 },
	{ top: '71%', left: '-35%', opacity: 0.4, scale: 1.2, delay: 0.9 },
	{ top: '80%', left: '-40%', opacity: 0.3, scale: 2, delay: 2 },
];

export function bodyBackground() {
	const background = document.querySelector('.body-background .body-background__content');
	if (!background) {
		return;
	}

	// читаем data-circles (если есть)
	const wrapper = document.querySelector('.body-background');
	let circles = defaultCircles;

	if (wrapper && wrapper.dataset.circles) {
		try {
			// парсим JSON из data-атрибута
			circles = JSON.parse(wrapper.dataset.circles);
		} catch (e) {
			// console.warn('Ошибка парсинга data-circles:', e);
		}
	}

	circles.forEach(
		({
			top = 0,
			left = 0,
			right = 0,
			margin = 0,
			opacity = 0.5,
			delay = 0,
			scale = 1,
			ratio = 1,
		}) => {
			const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
			svg.classList.add('circle-item');
			svg.style.top = top;
			svg.style.left = left;
			svg.style.right = right;
			svg.style.margin = margin;
			svg.style.opacity = opacity;
			svg.style.animationDelay = `${delay}s`;
			svg.style.setProperty('--scale', scale);
			svg.style.setProperty('--ratio', ratio);

			const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
			use.setAttribute('href', '#circle-blurry');

			svg.appendChild(use);
			background.appendChild(svg);
		}
	);
}

window.bodyBackground = bodyBackground;
