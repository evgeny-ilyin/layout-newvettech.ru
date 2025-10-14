import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

export function swipersInit() {
	const swiperSmallCards = document.querySelectorAll('.js-swiper-small-cards');
	swiperSmallCards.forEach((el) => {
		const swiperEl = el.querySelector('.swiper'),
			paginationEl = el.querySelector('.swiper-pagination'),
			nextEl = el.querySelector('.swiper-button-next'),
			prevEl = el.querySelector('.swiper-button-prev'),
			loop = getLoopOption(el),
			// loop = el.dataset.loop ? el.dataset.loop === 'true' : false,
			pagination = el.dataset.pagination ? el.dataset.pagination > 0 : false,
			auto = el.dataset.autoplay ? el.dataset.autoplay > 0 : false,
			delay = el.dataset.autoplay;

		const swiper = new Swiper(swiperEl, {
			modules: [Autoplay, Navigation, Pagination],
			slidesPerView: 1,
			slidesPerGroup: 1,
			spaceBetween: 20,
			autoHeight: false,
			loop: loop,
			autoplay: {
				enabled: auto,
				delay: delay,
				pauseOnMouseEnter: true,
			},
			navigation: {
				enabled: false,
				nextEl: nextEl,
				prevEl: prevEl,
			},
			pagination: {
				enabled: true,
				el: paginationEl,
				type: 'bullets',
				clickable: true,
			},
			breakpoints: {
				577: {
					slidesPerView: 2,
					spaceBetween: 14,
					navigation: {
						enabled: false,
					},
					pagination: {
						enabled: true,
					},
				},
				1024: {
					slidesPerView: 3,
					navigation: {
						enabled: false,
					},
					pagination: {
						enabled: true,
					},
				},
				1280: {
					slidesPerView: 4,
					slidesPerGroup: 1,
					spaceBetween: 20,
					navigation: {
						enabled: true,
					},
					pagination: {
						enabled: pagination,
					},
				},
			},
		});

		if (swiper.params.autoplay && swiper.params.autoplay.enabled) {
			attachSwiperObserver(swiper, swiperEl);
		}
	});

	const swiperSingle = document.querySelectorAll('.js-swiper-single');
	swiperSingle.forEach((el) => {
		const swiperEl = el.querySelector('.swiper'),
			paginationEl = el.querySelector('.swiper-pagination'),
			nextEl = el.querySelector('.swiper-button-next'),
			prevEl = el.querySelector('.swiper-button-prev'),
			// loop = el.dataset.loop ? el.dataset.loop === 'true' : false,
			loop = getLoopOption(el),
			pagination = el.dataset.pagination ? el.dataset.pagination > 0 : false,
			auto = el.dataset.autoplay ? el.dataset.autoplay > 0 : false,
			delay = el.dataset.autoplay;

		const swiper = new Swiper(swiperEl, {
			modules: [Autoplay, Navigation, Pagination],
			slidesPerView: 1,
			slidesPerGroup: 1,
			spaceBetween: 20,
			autoHeight: true,
			loop: loop,
			autoplay: {
				enabled: auto,
				delay: delay,
				pauseOnMouseEnter: true,
			},
			navigation: {
				enabled: false,
				nextEl: nextEl,
				prevEl: prevEl,
			},
			pagination: {
				enabled: pagination,
				el: paginationEl,
				type: 'bullets',
				clickable: true,
			},
			breakpoints: {
				1280: {
					autoHeight: true,
					navigation: {
						enabled: true,
					},
				},
			},
		});

		if (swiper.params.autoplay && swiper.params.autoplay.enabled) {
			attachSwiperObserver(swiper, swiperEl);
		}
	});

	/**
	 * Хелпер проверяет количество слайдов, возвращает loop и добавляет класс контейнеру, если слайд один
	 * Класс обнуляет нижний отступ, зарезервированный для элементов управления
	 */
	function getLoopOption(container, className = 'is-single') {
		const slides = container.querySelectorAll('.swiper-slide');

		if (slides.length === 1) {
			container.classList.add(className);
			return false; // loop выключаем
		}

		return slides.length > 1; // loop включаем только если слайдов больше одного
	}

	/**
	 * Хелпер следит за видимостью и включает/выключает autoplay.
	 * Чтобы при активном autoHeight не скакали элементы под свайпером, если он уже вышел из зоны видимости.
	 */
	function attachSwiperObserver(swiper, swiperEl, threshold = 0.1) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						swiper.autoplay.start();
					} else {
						swiper.autoplay.stop();
					}
				});
			},
			{ threshold }
		);

		observer.observe(swiperEl);
		return observer; // если нужно управлять, например, отключить позднее через observer.disconnect();
	}
}
