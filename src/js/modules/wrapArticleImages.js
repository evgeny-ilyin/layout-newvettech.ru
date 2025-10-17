/**
 * Оборачивает изображения с атрибутом `title` внутри <article> в контейнер,
 * добавляет подпись под изображением на основе атрибута `title`.
 *
 * @module wrapImages
 * @copyright 2025 Evgeny Ilyin
 *
 * @param {Object} [options={}] - Объект с настройками функции.
 * @param {string} [options.wrapperClass='img-wrap'] - Класс для создаваемого контейнера.
 * @param {string} [options.captionClass='img-title'] - Класс для создаваемого элемента подписи.
 *
 * @example
 * Инициализация
 * import { wrapArticleImages } from './wrapArticleImages.js';
 *
 * Обернуть все изображения в статьях:
 * wrapArticleImages();
 *
 * Или с пользовательскими классами:
 * wrapArticleImages({
 *   wrapperClass: 'figure',
 *   captionClass: 'figure__caption'
 * });
 *
 * @example
 * HTML:
 *   <article>
 *     <img src="photo.jpg" title="Описание картинки">
 *   </article>
 *
 * После выполнения функции:
 *   <article>
 *     <div class="article-img">
 *       <img src="photo.jpg" title="Описание картинки">
 *       <span class="article-img__title">Описание картинки</span>
 *     </div>
 *   </article>
 *
 * Условия:
 * - Ищет только внутри элементов <article>.
 * - Игнорирует изображения без title или с пустым title.
 * - Не модифицирует уже обёрнутые изображения.
 */
export function wrapArticleImages({
	wrapperClass = 'article-img',
	imgClass = 'article-img__img',
	imgClassNoTiltle = 'article-img__img_no-title',
	captionClass = 'article-img__title',
} = {}) {
	document.querySelectorAll('article img').forEach((img) => {
		const title = img.getAttribute('title')?.trim();

		// Пропускаем, если title пустой или уже есть обёртка
		// if (!title || img.closest(`.${wrapperClass}`)) {
		// 	return;
		// }

		// Пропускаем, если уже есть обёртка
		if (img.closest(`.${wrapperClass}`)) {
			return;
		}

		img.classList.add(imgClass);

		if (!title) {
			img.classList.add(imgClassNoTiltle);
		}

		// Создаём обёртку
		const wrapper = document.createElement('div');
		wrapper.className = wrapperClass;

		// Создаём подпись
		const caption = document.createElement('span');
		caption.className = captionClass;

		caption.textContent = title;

		// Вставляем элементы
		img.parentNode.insertBefore(wrapper, img);
		wrapper.appendChild(img);
		wrapper.appendChild(caption);
	});
}
