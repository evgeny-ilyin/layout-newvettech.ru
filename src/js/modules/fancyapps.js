import { Fancybox } from '@fancyapps/ui';

addEventListener('DOMContentLoaded', () => {
	// Модальные окна
	const ru = {
		ZOOMIN: 'Приблизить',
		ZOOMOUT: 'Уменьшить',
		TOGGLEZOOM: 'Масштабирование',
		TOGGLE1TO1: 'Масштабирование',
		ITERATEZOOM: 'Масштабирование',
		CLOSE: 'Закрыть',
		NEXT: 'Далее',
		PREV: 'Назад',
		MODAL: 'Вы можете закрыть это модальное содержимое с помощью клавиши ESC',
		ERROR: 'Что-то пошло не так. Пожалуйста, повторите попытку позже.',
		IMAGE_ERROR: 'Изображение не найдено',
		ELEMENT_NOT_FOUND: 'HTML элемент не найден',
		AJAX_NOT_FOUND: 'Ошибка загрузки AJAX: не найден',
		AJAX_FORBIDDEN: 'Ошибка загрузки AJAX: запрещено',
		IFRAME_ERROR: 'Ошибка загрузки страницы',
		TOGGLE_ZOOM: 'Масштабирование',
		TOGGLE_THUMBS: 'Миниатюры',
		TOGGLE_SLIDESHOW: 'Слайд-шоу',
		TOGGLE_FULLSCREEN: 'Полноэкранный режим',
		DOWNLOAD: 'Скачать',
	};

	const options = {
		l10n: ru,
		// Toolbar: {
		// 	display: {
		// 		left: [],
		// 	},
		// },
	};

	Fancybox.bind('[data-fancybox]', options);
});
