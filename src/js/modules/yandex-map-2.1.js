function loadYandexMapApi() {
	return new Promise((resolve, reject) => {
		if (window.ymaps) {
			resolve(window.ymaps);
			return;
		}
		const script = document.createElement('script');
		script.src =
			'https://api-maps.yandex.ru/2.1/?apikey=b6c157bd-1c60-42c0-92cd-bfe170e80516&lang=ru_RU';
		script.async = true;
		script.onload = () => resolve(window.ymaps);
		script.onerror = () => reject(new Error('Ошибка загрузки Yandex Maps API'));
		document.head.appendChild(script);
	});
}

export function initMap() {
	const mapContainer = document.querySelector('.block-map');
	if (!mapContainer) {
		return;
	}

	loadYandexMapApi().then((ymaps) => {
		ymaps.ready(() => {
			const zoomDefault = 14;
			const options = { suppressMapOpenBlock: true, minZoom: 5, maxZoom: 20 };

			const map = new ymaps.Map(
				mapContainer,
				{
					// center: data.features[0].geometry.coordinates,
					center: [0, 0],
					zoom: zoomDefault,
					controls: [],
				},
				options
			);

			// Создаём коллекцию из данных
			const collection = new ymaps.GeoObjectCollection(null, {
				iconLayout: 'default#image',
				iconImageHref: data.pointerIcon,
				iconImageSize: [32, 32],
				iconImageOffset: [-16, -32],
				balloonMaxWidth: 254,
			});

			data.features.forEach((feature) => {
				const geoObject = new ymaps.GeoObject(feature, {
					balloonContent: feature.properties.balloonContent,
				});
				collection.add(geoObject);
			});

			map.geoObjects.add(collection);

			// zoomMargin нужен, если точки при getBounds оказались слишком близко к краю прямоугольника
			map
				.setBounds(collection.getBounds(), { checkZoomRange: true, zoomMargin: 10 })
				.then(function () {
					if (map.getZoom() > zoomDefault) {
						map.setZoom(zoomDefault);
					}
				});
		});
	});
}
