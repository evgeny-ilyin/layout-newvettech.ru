import { Calendar } from 'vanilla-calendar-pro';
import { validateInput } from './formSubmit.js';

export function appointmentInit() {
	const errorClass = 'is-error';
	const activeClass = 'is-active';
	const calendarEl = document.querySelector('#calendar');
	const timeSlotsEl = document.querySelector('#time-slots');

	if (!calendarEl || !timeSlotsEl) {
		return;
	}

	const appointmentModal = document.querySelector('[data-id="modal-appointment"]');
	const container = document.querySelector('.js-appointment-container');
	const steps = [...container.querySelectorAll('.js-appointment-step')];

	const loaderEl = document.querySelector('#calendar-loader');
	const calendarParent = calendarEl.parentNode;
	const timeSlotsParent = timeSlotsEl.parentNode;
	const timeSlotsHeader = timeSlotsEl.parentNode.previousElementSibling.querySelector('span');

	const selectedSlotSpan = container.querySelector('.js-date-time');
	const successStepDate = container.querySelector('.js-date');
	const successStepTime = container.querySelector('.js-time');
	const successStepDocName = container.querySelector('.js-doc-name');
	const successStepDocPosition = container.querySelector('.js-doc-position');
	const successStepDocPhoto = container.querySelector('.js-doc-photo');
	const appointmentForm = container.querySelector('.js-appointment-form');

	const btnSaveSlot = document.querySelector('[data-action="save-slot"');
	const btnSaveForm = document.querySelector('[data-action="save-form"');
	const btnSubmit = document.querySelector('[data-action="submit-form"]');

	const summaryEl = document.querySelector('.js-appointment-summary');
	const successEl = document.querySelector('.js-appointment-success');
	const errorEl = document.querySelector('.js-appointment-error');

	const apiUrl = calendarEl.dataset.url;

	if (!apiUrl) {
		return;
	}

	const STORAGE_KEY_FORM = `appointment_form`;

	let doctorId = null;
	let calendar = null;
	let doctorName = null;
	let doctorPosition = null;
	let doctorPhoto = null;

	// let clinicsData = {};
	// let selectedClinic = null;
	const clinicRadioChecked = document.querySelector('[data-clinic]:checked');
	let clinicId = clinicRadioChecked?.value;
	let clinicName = clinicRadioChecked?.nextElementSibling?.textContent.trim();

	let loaded = false;
	let scheduleData = {};
	let availableDates = [];
	let selectedDate = null;
	let selectedTime = null;

	// ==========================================
	// Синхронизация состояния с DOM (модалкой)
	// Получает актуальный doctorId из data-modal-params,
	// сбрасывает/обновляет внутренний state (календарь, кеши),
	// и возвращает флаг необходимости дальнейших действий
	// (загрузка расписания / восстановление состояния)
	// ==========================================

	function updateDoctorFromModal() {
		const rawParams = appointmentModal?.dataset.modalParams;

		if (!rawParams) {
			return false;
		}

		try {
			const params = JSON.parse(rawParams);
			const newDoctorId = String(params.doctorId);

			if (!newDoctorId) {
				return false;
			}

			// Если врач сменился - сбрасываем состояние
			if (doctorId !== newDoctorId) {
				doctorId = newDoctorId;
				doctorName = String(params.doctorName);
				doctorPosition = String(params.doctorPosition);
				doctorPhoto = String(params.doctorPhoto);

				loaded = false;
				scheduleData = {};
				availableDates = [];
				selectedDate = null;
				selectedTime = null;

				if (calendar) {
					calendar.set({
						enableDates: [],
						selectedDates: [],
					});
				}
			}

			return true;
		} catch (error) {
			errorEl.textContent = error.message;
			showStep(4);
			return false;
		}
	}

	// ==========================================
	// Observer на открытие модалки
	// ==========================================

	if (appointmentModal) {
		let wasActive = false;

		const observer = new MutationObserver(() => {
			const isActive = appointmentModal.classList.contains(activeClass);

			if (isActive && !wasActive) {
				const hasDoctor = updateDoctorFromModal();

				if (!hasDoctor) {
					wasActive = isActive;
					return;
				}

				const doctorData = getDoctorData();

				restoreStep();
				restoreForm();
				renderSummary();

				// Если у этого врача уже есть загруженные данные, не дёргаем API повторно (шаги 1 2)
				if ([1, 2].includes(doctorData.step)) {
					wasActive = isActive;
					return;
				}

				loadSchedule();
			}

			wasActive = isActive;
		});

		observer.observe(appointmentModal, {
			attributes: true,
			attributeFilter: ['class'],
		});
	}

	// ==========================================
	// API
	// ==========================================

	async function loadSchedule() {
		if (loaded || !doctorId) {
			return;
		}

		loaded = true;

		showLoader('Загрузка дат приёма...');

		try {
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					doctor_id: doctorId,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${data.error}`);
			}

			// проверка на пустые dates
			if (!data.dates || Object.keys(data.dates).length === 0) {
				throw new Error('Нет доступных дат для записи');
			}

			// без фильтрации прошедшего времени
			// scheduleData = data.dates;
			// с фильтрацией
			scheduleData = filterPastSlots(data.dates);
			availableDates = Object.keys(scheduleData);

			createCalendar();
			hideLoader();
		} catch (error) {
			if (loaderEl) {
				loaded = false;
				// loaderEl.innerHTML = `<div class="error">${error.message}</div>`;
				errorEl.textContent = `${error.message}`;

				showStep(4);
			}
		}
	}

	// v1: календарь создается через applyClinic
	/* async function loadScheduleV1() {
		if (loaded) {
			return;
		}

		loaded = true;

		showLoader('Загрузка дат приёма...');

		try {
			const response = await fetch(`${apiUrl}?doctor_id=${doctorId}`);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.message || 'Ошибка API');
			}

			clinicsData = data.clinics || {};

			// восстановление выбранной клиники
			const saved = getDoctorData();

			if (saved.clinicId && clinicsData[saved.clinic]) {
				const radio = document.querySelector(`[data-clinic][value="${saved.clinicId}"]`);

				if (radio) {
					radio.checked = true;
				}

				applyClinic(saved.clinic);
			} else {
				const firstClinic = Object.keys(clinicsData)[0];

				if (firstClinic) {
					const radio = document.querySelector(`[data-clinic][value="${firstClinic}"]`);

					if (radio) {
						radio.checked = true;
					}

					applyClinic(firstClinic);
				}
			}

			hideLoader();
		} catch (error) {
			console.error(error);

			if (loaderEl) {
				loaderEl.innerHTML = `
						<div class="error">
							Ошибка загрузки расписания
						</div>
					`;
			}
		}
	} */

	// ==========================================
	// Loader
	// ==========================================

	const showLoader = (text = 'Загрузка дат...') => {
		if (!loaderEl) {
			return;
		}

		loaderEl.textContent = text;
		loaderEl.hidden = false;
	};

	const hideLoader = () => {
		if (!loaderEl) {
			return;
		}

		loaderEl.hidden = true;
	};

	// ==========================================
	// Календарь
	// ==========================================

	function createCalendar() {
		const saved = getDoctorData();
		let initialDate = null;

		if (saved && String(saved.doctorId) === doctorId && availableDates.includes(saved.date)) {
			initialDate = saved.date;
		} else if (availableDates.length) {
			initialDate = availableDates[0];
		}

		const selectedDates = initialDate ? [initialDate] : [];

		if (calendar) {
			calendar.set({
				enableDates: availableDates,
				selectedDates,
			});
		} else {
			calendar = new Calendar('#calendar', {
				locale: 'ru-RU',
				disableAllDates: true,
				enableDateToggle: false,
				enableDates: availableDates,
				enableJumpToSelectedDate: true,
				selectedDates,
			});

			calendar.init();
		}

		// restoreSelection();
		if (initialDate) {
			selectDate(initialDate);
		}
	}

	// Перерисовка календаря при смене клиники
	/* 	function applyClinic(clinicCode) {
		selectedClinic = clinicCode;

		saveDoctorData({
			clinicId: clinicCode,
		});

		selectedDate = null;
		selectedTime = null;

		const clinic = clinicsData[clinicCode];

		if (!clinic) {
			return;
		}

		scheduleData = clinic.dates || {};
		availableDates = Object.keys(scheduleData);
		createCalendar();
	}

	//! при динамической подгрузке клиник переделать. или сделать через hidden ненужных radio
	document.querySelectorAll('[data-clinic]').forEach((radio) => {
		radio.addEventListener('change', () => {
			applyClinic(radio.value);
		});
	}); */

	// ==========================================
	// Отрисовка слотов времени
	// ==========================================

	/* 	function renderTimeSlotsV1(date) {
		const slots = scheduleData[date] || [];

		if (!slots.length) {
			timeSlotsEl.innerHTML = `
				<div class="no-slots">
					Нет доступного времени
				</div>
			`;

			return;
		}

		if (timeSlotsHeader) {
			timeSlotsHeader.textContent = `${formatDate(date)}`;
		}

		timeSlotsEl.innerHTML = `
			<div class="time-slots__grid">
				${slots
					.map(
						(time) =>
							`<button type="button" class="time-slot ${selectedTime === time ? activeClass : ''}" data-time="${time}">${time}</button>`
					)
					.join('')}
			</div>
		`;

		timeSlotsEl.querySelectorAll('.time-slot').forEach((btn) => {
			btn.addEventListener('click', () => {
				timeSlotsEl
					.querySelectorAll('.time-slot')
					.forEach((item) => item.classList.remove(activeClass));

				btn.classList.add(activeClass);

				timeSlotsParent.classList.remove(errorClass);
				selectedTime = btn.dataset.time;
			});
		});
	} */

	function renderTimeSlots(date) {
		const slots = scheduleData[date] || [];

		if (!slots.length) {
			timeSlotsEl.innerHTML = `
			<div class="no-slots">
				Нет доступного времени
			</div>
		`;
			return;
		}

		if (timeSlotsHeader) {
			timeSlotsHeader.textContent = formatDate(date);
		}

		// ==========================================
		// Группировка слотов по времени суток
		// Утро: до 12:00
		// День: до 18:00
		// Вечер: от 18:00
		// ==========================================
		const groupedSlots = {
			morning: [],
			day: [],
			evening: [],
		};

		slots.forEach((time) => {
			const hour = Number(time.split(':')[0]);

			if (hour < 12) {
				groupedSlots.morning.push(time);
			} else if (hour < 18) {
				groupedSlots.day.push(time);
			} else {
				groupedSlots.evening.push(time);
			}
		});

		const periods = [
			{ key: 'morning', title: 'Утро' },
			{ key: 'day', title: 'День' },
			{ key: 'evening', title: 'Вечер' },
		];

		timeSlotsEl.innerHTML = periods
			.map(({ key, title }) => {
				const periodSlots = groupedSlots[key];

				if (!periodSlots.length) {
					return '';
				}

				return `
				<div class="time-slots__group">
					<div class="time-slots__title">${title}</div>
					<div class="time-slots__grid">
						${periodSlots
							.map(
								(time) =>
									`<button type="button" class="time-slot ${selectedTime === time ? activeClass : ''}" data-time="${time}">${time}</button>`
							)
							.join('')}
					</div>
				</div>
			`;
			})
			.join('');

		timeSlotsEl.querySelectorAll('.time-slot').forEach((btn) => {
			btn.addEventListener('click', () => {
				timeSlotsEl
					.querySelectorAll('.time-slot')
					.forEach((item) => item.classList.remove(activeClass));

				btn.classList.add(activeClass);

				timeSlotsParent.classList.remove(errorClass);
				selectedTime = btn.dataset.time;
			});
		});
	}

	// ==========================================
	// Фильтрация прошедшего времени для текущего дня
	// ==========================================

	function filterPastSlots(dates) {
		const now = new Date();

		// Текущее время в Москве
		const moscowNow = new Date(
			now.toLocaleString('en-US', {
				timeZone: 'Europe/Moscow',
			})
		);

		return Object.entries(dates).reduce((acc, [date, slots]) => {
			const actualSlots = slots.filter((time) => {
				const slotDate = new Date(`${date}T${time}:00+03:00`);
				return slotDate > moscowNow;
			});

			if (actualSlots.length) {
				acc[date] = actualSlots;
			}

			return acc;
		}, {});
	}

	// ==========================================
	// Выбор даты
	// ==========================================

	function selectDate(date) {
		selectedDate = date;
		selectedTime = null;

		const saved = getDoctorData();

		if (saved && String(saved.doctorId) === doctorId && saved.date === date) {
			selectedTime = saved.time;
		}

		calendarParent.classList.remove(errorClass);
		renderTimeSlots(date);
	}

	// Делегирование клика на дату вместо onClickDate
	calendarEl.addEventListener('click', ({ target }) => {
		const btn = target.closest('[data-vc-date-btn]');
		if (!btn) {
			return;
		}

		const date = btn.closest('[data-vc-date]')?.dataset.vcDate;
		if (!date) {
			return;
		}

		selectDate(date);
	});

	// ==========================================
	// Навигация по шагам, сохранение шага
	// ==========================================

	let currentStep = 0;

	function showStep(index) {
		if (!Number.isInteger(index) || index < 0 || index >= steps.length) {
			index = 0;
		}

		steps.forEach((step, i) => {
			step.classList.toggle(activeClass, i === index);
		});

		currentStep = index;
		saveCurrentStep(index);
	}

	function saveCurrentStep(step) {
		saveDoctorData({
			step,
		});
	}

	// ==========================================
	// Сохранить слот и форму в localstorage
	// ==========================================

	if (btnSaveSlot) {
		btnSaveSlot.addEventListener('click', () => {
			if (!clinicId) {
				alert('Выберите клинику');
				return;
			}

			if (!selectedDate) {
				calendarParent.classList.add(errorClass);
				return;
			}

			if (!selectedTime) {
				timeSlotsParent.classList.add(errorClass);
				return;
			}

			saveDoctorData({
				doctorId,
				doctorName,
				doctorPosition,
				doctorPhoto,
				clinicId: clinicId,
				clinicName: clinicName,
				date: selectedDate,
				time: selectedTime,
			});

			setSavedData();
			showStep(1);
		});
	}

	if (btnSaveForm) {
		btnSaveForm.addEventListener('click', () => {
			const errors = [];
			const inputs = appointmentForm.querySelectorAll('[data-required]');

			inputs.forEach((input) => {
				const error = validateInput(input);
				if (error) {
					errors.push(error);
				}
			});

			if (errors.length === 0) {
				const fields = appointmentForm.querySelectorAll('[data-field]');
				const formData = Array.from(fields).reduce((acc, field) => {
					acc[field.dataset.field] = field.value.trim();
					return acc;
				}, {});

				formData.agreement = true;

				saveFormData(formData);
				renderSummary();
				showStep(2);
			}
		});
	}

	// ==========================================
	// Отправить информацию о записи в API
	// ==========================================

	if (btnSubmit) {
		btnSubmit.addEventListener('click', async () => {
			try {
				const payload = {
					...getDoctorData(),
					...getFormData(),
				};

				const formattedPayload = {
					owner: {
						name: payload.name,
						surname: payload.surname,
						phone: payload.phone,
						email: payload.email,
						note: payload.note,
					},
					patient: {
						species: payload.species,
						nickname: payload.nickname,
					},
					visit: {
						clinic_id: Number(payload.clinicId),
						doctor_id: Number(payload.doctorId),
						scheduled_start_at: `${payload.date}T${payload.time}:00+03:00`,
					},
				};

				const response = await fetch(btnSubmit.dataset.url, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formattedPayload),
				});

				const result = await response.json();

				if (!response.ok) {
					throw new Error(`Error ${response.status}: ${result.message}`);
				}

				if (result.success) {
					successEl.textContent = `${result.message}`;

					saveDoctorData({ step: 3 });
					showStep(3);

					const key = getDoctorStorageKey();

					if (key) {
						localStorage.removeItem(key);
					}
				} else {
					errorEl.textContent = `${result.message}`;

					showStep(4);
				}
			} catch (error) {
				errorEl.textContent = `${error.message}`;

				showStep(4);
			}
		});
	}

	// ==========================================
	// Обработка кнопок "Назад" или "Reload"
	// ==========================================

	container.addEventListener('click', ({ target }) => {
		// Нажатие "Назад"
		const backBtn = target.closest('[data-action="back"]');
		if (backBtn) {
			const newStep = currentStep - 1;

			// Если нажато «Назад» и активен шаг 0, но расписания в доме нет — загрузить
			if (newStep < 1) {
				loadSchedule();
			}

			showStep(newStep);
		}

		// Нажатие "Reload"
		const reloadBtn = target.closest('[data-action="reload"]');
		if (reloadBtn) {
			const key = getDoctorStorageKey();

			if (key) {
				localStorage.removeItem(key);
			}

			loaded = false;
			selectedDate = null;
			selectedTime = null;
			availableDates = [];

			loadSchedule();
			showStep(0);
		}
	});

	// ==========================================
	// Обработка выбора клиники
	// ==========================================

	container.addEventListener('change', ({ target }) => {
		if (!target.matches('[data-clinic]')) {
			return;
		}

		clinicId = target.value;
		clinicName = target.dataset.name;
	});

	// ==========================================
	// Итоговые данные
	// ==========================================

	function renderSummary() {
		const doctorData = getDoctorData();
		const formData = getFormData();

		summaryEl.innerHTML = `
		<div class="summary__group summary__group_full">
			<span class="summary__label">${doctorData.clinicName}</span>
		</div>
		<div class="summary__group summary__group_full">
			<span class="summary__label">Выбранные дата и время:</span> <span class="nowrap">${formatDate(doctorData.date)}, ${doctorData.time}</span>
		</div>
		<div class="summary__group">
			<span class="summary__label">Имя:</span> ${formData.name}
		</div>
		<div class="summary__group">
			<span class="summary__label">Фамилия:</span> ${formData.surname}
		</div>
		<div class="summary__group">
			<span class="summary__label">Телефон:</span> ${formData.phone}
		</div>
		<div class="summary__group">
			<span class="summary__label">Почта:</span> ${formData.email}
		</div>
		<div class="summary__group">
			<span class="summary__label">Питомец:</span> ${formData.species}
		</div>
		<div class="summary__group">
			<span class="summary__label">Кличка:</span> ${formData.nickname}
		</div>
		<div class="summary__group summary__group_full">
			<span class="summary__label">Комментарий:</span> ${formData.note}
		</div>
	`;
	}

	// ==========================================
	// Формат даты "15 июня"
	// ==========================================

	function formatDate(dateString) {
		const date = new Date(dateString);

		if (isNaN(date.getTime())) {
			return 'Неверная дата';
		}

		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'long',
		});
	}

	// ==========================================
	// Сформировать STORAGE_KEY для доктора
	// ==========================================

	function getDoctorStorageKey() {
		return doctorId ? `appointment_doctor_${doctorId}` : null;
	}

	// ==========================================
	// Работа с localStorage
	// ==========================================

	function getDoctorData() {
		try {
			const key = getDoctorStorageKey();

			if (!key) {
				return {};
			}

			return JSON.parse(localStorage.getItem(key)) || {};
		} catch {
			return {};
		}
	}

	function saveDoctorData(data = {}) {
		const doctorData = getDoctorData();

		const result = {
			...doctorData,
			...data,
		};

		const key = getDoctorStorageKey();

		if (!key) {
			return result;
		}

		localStorage.setItem(key, JSON.stringify(result));

		return result;
	}

	function getFormData() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY_FORM)) || {};
		} catch {
			return {};
		}
	}

	function saveFormData(data = {}) {
		const current = getFormData();

		const result = {
			...current,
			...data,
		};

		localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(result));

		return result;
	}

	// ==========================================
	// Установка сохранённых данных из getDoctorData на втором и на успешном шаге
	// ==========================================

	function setSavedData(data = getDoctorData()) {
		selectedSlotSpan.textContent = `${formatDate(data.date)}, ${data.time}`;
		successStepDate.textContent = `${formatDate(data.date)}`;
		successStepTime.textContent = `${data.time}`;
		successStepDocName.textContent = `${data.doctorName}`;
		successStepDocPosition.textContent = `${data.doctorPosition}`;
		successStepDocPhoto.src = `${data.doctorPhoto}`;
	}

	// ==========================================
	// Восстановление формы и шага при загрузке
	// ==========================================

	function restoreForm() {
		const doctorData = getDoctorData();

		if (doctorData.clinicId) {
			const clinicRadio = document.querySelector(`[data-clinic][value="${doctorData.clinicId}"]`);
			if (clinicRadio) {
				clinicRadio.checked = true;
				clinicId = doctorData.clinicId;
				clinicName = doctorData.clinicName;
			}
		}

		const dataForm = getFormData();
		if (!dataForm) {
			return;
		}

		const fields = appointmentForm.querySelectorAll('[data-field]');

		fields.forEach((field) => {
			const key = field.dataset.field;
			field.value = dataForm[key] ?? ''; // ?? обрабатывает null/undefined, оставляя 0 или false как есть
		});

		const agreementCheckbox = appointmentForm.querySelector('[name="agreement"]');

		if (agreementCheckbox) {
			agreementCheckbox.checked = !!dataForm.agreement;
		}
	}

	function restoreStep() {
		const doctorData = getDoctorData();
		if (typeof doctorData.step === 'number' && doctorData.step >= 0 && doctorData.step <= 2) {
			showStep(doctorData.step);
			setSavedData();
			return;
		}
		showStep(0);
	}

	// Выполнить при загрузке страницы
	restoreStep();
	restoreForm();
}
