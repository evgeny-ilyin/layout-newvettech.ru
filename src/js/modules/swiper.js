import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

export function swipersInit() {
	const swiperSmallCards = document.querySelectorAll('.js-swiper-small-cards');
	swiperSmallCards.forEach((el) => {
		const swiper = el.querySelector('.swiper'),
			pagination = el.querySelector('.swiper-pagination'),
			next = el.querySelector('.swiper-button-next'),
			prev = el.querySelector('.swiper-button-prev'),
			loop = el.dataset.loop ? el.dataset.loop === 'true' : false;

		new Swiper(swiper, {
			modules: [Navigation, Pagination],
			slidesPerView: 1,
			slidesPerGroup: 1,
			spaceBetween: 20,
			autoHeight: false,
			loop: loop,
			pagination: {
				enabled: true,
				el: pagination,
				type: 'bullets',
				clickable: true,
			},
			navigation: {
				enabled: false,
				nextEl: next,
				prevEl: prev,
			},
			breakpoints: {
				577: {
					slidesPerView: 2,
					spaceBetween: 14,
					pagination: {
						enabled: true,
					},
					navigation: {
						enabled: false,
					},
				},
				1024: {
					slidesPerView: 3,
					pagination: {
						enabled: true,
					},
					navigation: {
						enabled: false,
					},
				},
				1280: {
					slidesPerView: 4,
					slidesPerGroup: 2,
					spaceBetween: 20,
					pagination: {
						enabled: false,
					},
					navigation: {
						enabled: true,
					},
				},
			},
		});
	});

	const swiperSingle = document.querySelectorAll('.js-swiper-single');
	swiperSingle.forEach((el) => {
		const swiper = el.querySelector('.swiper'),
			pagination = el.querySelector('.swiper-pagination'),
			next = el.querySelector('.swiper-button-next'),
			prev = el.querySelector('.swiper-button-prev'),
			loop = el.dataset.loop ? el.dataset.loop === 'true' : false;

		new Swiper(swiper, {
			modules: [Navigation, Pagination],
			slidesPerView: 1,
			slidesPerGroup: 1,
			spaceBetween: 20,
			autoHeight: true,
			loop: loop,
			pagination: {
				enabled: true,
				el: pagination,
				type: 'bullets',
				clickable: true,
			},
			navigation: {
				enabled: false,
				nextEl: next,
				prevEl: prev,
			},
			breakpoints: {
				1280: {
					navigation: {
						enabled: true,
					},
				},
			},
		});
	});

	//TODO удалить ненужные
	const swiperTop = document.querySelectorAll('.swiper-top');
	swiperTop.forEach((el) => {
		const swiper = el.querySelector('.swiper'),
			pagination = el.querySelector('.swiper-pagination');

		new Swiper(swiper, {
			modules: [Pagination],
			slidesPerView: 1,
			slidesPerGroup: 1,
			spaceBetween: 20,
			loop: true,
			pagination: {
				enabled: true,
				el: pagination,
				type: 'bullets',
				clickable: true,
			},
		});
	});

	const swiperAuto = document.querySelectorAll('.js-swiper-auto');
	swiperAuto.forEach((el) => {
		const swiper = el.querySelector('.swiper'),
			pagination = el.querySelector('.swiper-pagination');

		new Swiper(swiper, {
			modules: [Pagination],
			slidesPerView: 'auto',
			slidesPerGroup: 1,
			spaceBetween: 20,
			loop: false,
			// centeredSlides: true,
			// centeredSlidesBounds: true,
			pagination: {
				enabled: false,
				el: pagination,
				type: 'bullets',
				clickable: true,
			},
			breakpoints: {
				768: {
					pagination: {
						enabled: false,
					},
				},
				1024: {
					centeredSlides: false,
					pagination: {
						enabled: false,
					},
				},
				1280: {
					spaceBetween: 35,
					slidesPerGroup: 3,
					centeredSlides: false,
					pagination: {
						enabled: true,
					},
				},
			},
		});
	});

	const swiperQuotes = document.querySelectorAll('.swiper-quotes');
	swiperQuotes.forEach((el) => {
		const swiper = el.querySelector('.swiper'),
			next = el.querySelector('.swiper-button-next'),
			prev = el.querySelector('.swiper-button-prev');

		new Swiper(swiper, {
			modules: [Navigation],
			slidesPerView: 1,
			slidesPerGroup: 1,
			spaceBetween: 20,
			loop: true,
			navigation: {
				nextEl: next,
				prevEl: prev,
			},
		});
	});
}
