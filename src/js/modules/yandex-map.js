// "features": [
// 	{
// 		"type": "Feature", "id": 0, "geometry": { "type": "Point", "coordinates": [55.718461, 37.624355] }, "properties": {
// 			"balloonContent": `<svg><use xlink:href="#logo"></use></svg>`
// 		}
// 	},
// ]

let ymaps3LoadPromise = null;

function loadYandexMapApi() {
	if (window.ymaps3) {
		return Promise.resolve(window.ymaps3);
	}

	if (ymaps3LoadPromise) {
		return ymaps3LoadPromise;
	}

	ymaps3LoadPromise = new Promise((resolve, reject) => {
		const apiKey = process.env.YANDEX_MAPS_API_KEY;
		const script = document.createElement('script');
		script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`;
		script.async = true;

		script.onload = () => resolve(window.ymaps3);
		script.onerror = () => reject(new Error('Ошибка загрузки Yandex Maps API v3'));

		document.head.appendChild(script);
	});

	return ymaps3LoadPromise;

	// v1 для случая только с одной картой
	// return new Promise((resolve, reject) => {
	// 	if (window.ymaps3) {
	// 		resolve(window.ymaps3);
	// 		return;
	// 	}
	// 	const apiKey = process.env.YANDEX_MAPS_API_KEY;
	// 	const script = document.createElement('script');
	// 	script.src = `https://api-maps.yandex.ru/v3/?apikey=${apiKey}&lang=ru_RU`;
	// 	script.async = true;
	// 	script.onload = () => resolve(window.ymaps3);
	// 	script.onerror = () => reject(new Error('Ошибка загрузки Yandex Maps API v3'));
	// 	document.head.appendChild(script);
	// });
}

export async function mapInit(data) {
	// const mapContainerClass = 'map-container';
	const mapMarkerClass = 'map-marker';
	// const mapContainer = document.querySelector(`.${mapContainerClass}`);
	const mapContainer = document.querySelector(data.container);
	if (!mapContainer) {
		return;
	}

	const ymaps3 = await loadYandexMapApi();
	await ymaps3.ready;

	const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = ymaps3;

	// Переворачиваем координаты [lat, lon] -> [lon, lat]
	const normalizeCoords = (coords) => [coords[1], coords[0]];

	// Создаём карту
	const map = new YMap(mapContainer, {
		location: {
			center: normalizeCoords(data.features[0].geometry.coordinates),
			zoom: 15,
		},
		zoomRange: { min: 5, max: 20 },
		// theme: 'light',
	});

	// Слои
	map.addChild(new YMapDefaultSchemeLayer());
	map.addChild(new YMapDefaultFeaturesLayer());

	// Контейнер для баллуна
	const balloon = document.createElement('div');
	balloon.style.position = 'absolute';
	balloon.style.background = '#fff';
	balloon.style.padding = '10px';
	balloon.style.border = '1px solid #ccc';
	balloon.style.borderRadius = '8px';
	balloon.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
	balloon.style.display = 'none';
	balloon.style.zIndex = '5';
	mapContainer.appendChild(balloon);

	// Список координат (для автоцентрирования)
	const coords = [];

	// Добавляем маркеры
	data.features.forEach((feature) => {
		const coord = normalizeCoords(feature.geometry.coordinates);
		coords.push(coord);

		const markerElement = document.createElement('div');
		markerElement.className = mapMarkerClass;
		markerElement.style.transform = 'translate(-50%, -100%)';
		markerElement.style.cursor = 'pointer';

		const marker = new YMapMarker({ coordinates: coord }, markerElement);

		// Показать баллун
		if (feature.properties?.balloonContent?.trim()) {
			markerElement.addEventListener('click', (e) => {
				e.stopPropagation();
				balloon.innerHTML = feature.properties.balloonContent;
				balloon.style.left = `${e.clientX}px`;
				balloon.style.top = `${e.clientY - 40}px`;
				balloon.style.display = 'block';
			});
		}

		map.addChild(marker);
	});

	// Скрывать баллун при клике по карте
	mapContainer.addEventListener('click', () => {
		balloon.style.display = 'none';
	});

	// Автоцентрирование
	if (coords.length > 1) {
		const lons = coords.map((c) => c[0]);
		const lats = coords.map((c) => c[1]);

		const minLon = Math.min(...lons);
		const maxLon = Math.max(...lons);
		const minLat = Math.min(...lats);
		const maxLat = Math.max(...lats);

		map.update({
			location: {
				bounds: [
					[minLon, minLat],
					[maxLon, maxLat],
				],
			},
		});
	}
}
