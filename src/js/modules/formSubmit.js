import { maskInput } from '/node_modules/vanilla-text-mask/dist/vanillaTextMask.js';

export function submitPrevent() {
	document.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') {
			return;
		}

		const form = e.target.closest('form');
		if (!form) {
			return;
		}

		const enterSubmitTarget = e.target.dataset.enterSubmit;
		const enterSubmitForm = form.dataset.enterSubmit;

		if (enterSubmitTarget === 'false' || enterSubmitForm === 'false') {
			e.preventDefault();
		}
	});
}

export function maskHandler() {
	const errorClass = 'is-error';
	const CHAR_PHONE = '_';
	const PHONE_LENGTH = 11;
	const PHONE_PATTERN = [
		'+',
		'7',
		' ',
		'(',
		/9/,
		/\d/,
		/\d/,
		')',
		' ',
		/\d/,
		/\d/,
		/\d/,
		'-',
		/\d/,
		/\d/,
		/\d/,
		/\d/,
	];

	// Универсальный обработчик событий
	document.addEventListener('focusin', handleEvent);
	document.addEventListener('click', handleEvent);
	document.addEventListener('focusout', handleEvent);
	document.addEventListener('keyup', handleEvent);

	function handleEvent(e) {
		const target = e.target;
		if (!target.dataset.patternType || target.dataset.patternType !== 'phone') {
			return;
		}

		switch (e.type) {
			case 'focusin':
				// Устанавливаем маску
				maskInput({
					inputElement: target,
					mask: PHONE_PATTERN,
					showMask: true,
					keepCharPositions: true,
					placeholderChar: CHAR_PHONE,
				});
				// Устанавливаем курсор на первый пустой символ
				setCursor(target);
				break;

			case 'click':
				setCursor(target);
				break;

			case 'focusout':
				handleFocusOut(target);
				break;

			case 'keyup':
				handleKeyUp(target);
				break;
		}
	}

	// Устанавливаем курсор на первый пустой символ маски
	function setCursor(target) {
		let index = 0;
		for (let i = 0; i < target.value.length; i++) {
			if (target.value[i] === CHAR_PHONE) {
				break;
			}
			index = i + 1;
		}
		target.setSelectionRange(index, index);
	}

	// Проверка при потере фокуса
	function handleFocusOut(target) {
		const digits = target.value.replace(/\D/g, '');
		target.classList.remove(errorClass);

		if (digits.length === 1) {
			target.value = '';
			return;
		}

		if (digits.length < PHONE_LENGTH) {
			target.classList.add(errorClass);
		}
	}

	// Проверка при вводе
	function handleKeyUp(target) {
		const digits = target.value.replace(/\D/g, '');
		if (digits.length >= PHONE_LENGTH) {
			target.classList.remove(errorClass);
		}
	}
}

/* https://medium.com/@damirpristav/form-validation-with-vanilla-js-using-data-attributes-on-form-elements-78ccf2c1cf34 */
const formValidation = {
	init() {
		const forms = document.querySelectorAll('form:not(.js-novalidate)');
		if (!forms.length) {
			return;
		}

		forms.forEach((form) => {
			const inputs = form.querySelectorAll('[data-required]');
			form.setAttribute('novalidate', '');
			form.addEventListener('submit', (e) => handleFormSubmit(form, inputs, e));

			inputs.forEach((input) => {
				if (input.type === 'email' || input.type === 'tel') {
					input.addEventListener('blur', handleInputBlur);
				} else {
					input.addEventListener('input', handleInputChange);
				}
			});
		});
	},
};
export { formValidation };

function validateInput(input) {
	// Get the value and error element
	const value = input.value;
	// const errorEl = input.closest("[data-formgroup]").querySelector("[data-formerror]");
	const errorClass = 'is-error';
	const defaultRequiredMessage = 'Поле обязательно для заполнения';
	const defaultEmailMessage = 'Некорректный формат email';
	const defaultTelMessage = 'Некорректный формат телефона';

	// Declare error variable and assign null by default
	let error = null;
	// Check in input has data-required attribute and if the value is empty, and if the input is not radio or checkbox
	if (
		(input.type !== 'radio' || input.type !== 'checkbox') &&
		input.dataset.required !== undefined &&
		value === ''
	) {
		error = input.dataset.requiredMessage ? input.dataset.requiredMessage : defaultRequiredMessage;
		input.classList.add(errorClass);
	}
	// Check if input is checkbox and it is not checked
	if (input.type === 'checkbox' && !input.checked) {
		error = input.dataset.errorMessage ? input.dataset.errorMessage : defaultRequiredMessage;
		input.classList.add(errorClass);
	}
	/*
	// Check if input is radio
	if (input.type === "radio") {
		// Get all radio inputs in a group
		const radios = input.closest("[data-formgroup]").querySelectorAll('input[type="radio"]');
		let isChecked = false;
		let errorMsg = "";
		// Loop through radios and check if any radio is checked and if it is checked set isChecked to true
		radios.forEach((radio) => {
			if (radio.checked) {
				isChecked = true;
			}
			if (radio.dataset.errorMessage) {
				errorMsg = input.dataset.errorMessage;
			}
		});
		if (!isChecked) {
			error = errorMsg !== "" ? errorMsg : defaultRequiredMessage;
		}
	}
	// Check if input has data-minlength attribute and if value length is smaller than this attribute, if so show the error
	if (!error && input.dataset.minlength !== undefined && value.length < +input.dataset.minlength) {
		error = input.dataset.minlengthMessage ? input.dataset.minlengthMessage : `Please enter at least ${input.dataset.minlength} characters`;
		input.classList.add(errorClass);
	}
	// Check if input has data-maxlength attribute and if value length is greater than this attribute, if so show the error
	if (!error && input.dataset.maxlength !== undefined && value.length > +input.dataset.maxlength) {
		error = input.dataset.maxlengthMessage ? input.dataset.maxlengthMessage : `Only ${input.dataset.maxlength} characters allowed`;
		input.classList.add(errorClass);
	}
	*/
	// Check if input has data-email attribute and if email is not valid
	// if (!error && input.dataset.email !== undefined && !validateEmail(value)) {
	if (!error && input.type === 'email' && !validateEmail(value)) {
		error = input.dataset.emailMessage ? input.dataset.emailMessage : defaultEmailMessage;
		input.classList.add(errorClass);
	}
	/*
	// Check if input has data-match attribute and if value is not equal to the value of the element with name attribute equal to this data-match attribute
	if (!error && input.dataset.match !== undefined && value !== input.closest("[data-form]").querySelector(`[name="${input.dataset.match}"]`).value) {
		error = input.dataset.matchMessage ? input.dataset.matchMessage : "Fields are not the same";
		input.classList.add(errorClass);
	}
	// Check if input has data-match-with attribute
	if (input.dataset.matchWith !== undefined) {
		// Get the input that has a name attribute equal to value of data-match-with attribute
		const inputToMatch = input.closest("[data-form]").querySelector(`[name="${input.dataset.matchWith}"]`);
		// Get the error element of that input
		const inputToMatchError = inputToMatch.closest("[data-formgroup]").querySelector("[data-formerror]");
		// If values are equal remove error class from input and hide error element
		if (value === inputToMatch.value) {
			inputToMatch.classList.remove(errorClass);
			inputToMatchError.style.display = "none";
		} else {
			// Add error class to input and show error element
			inputToMatch.classList.add(errorClass);
			inputToMatchError.style.display = "block";
			inputToMatchError.innerText = inputToMatch.dataset.matchMessage || "Fields are not the same";
		}
	}
	// Check if input is file input and if has data-maxfilesize attribute and if file size is greater than the value of this data-maxfilesize attribute
	if (!error && input.type === "file" && input.dataset.maxfilesize !== undefined && input.files[0].size > +input.dataset.maxfilesize * 1024) {
		error = input.dataset.maxfilesizeMessage ? input.dataset.maxfilesizeMessage : "File is too large";
		input.classList.add(errorClass);
	}
	// Check if input is file input and if it has data-allowed-types attribute and if file type is not equal to one of the values in data-allowed-type attribute
	if (!error && input.type === "file" && input.dataset.allowedTypes !== undefined && !input.dataset.allowedTypes.includes(input.files[0].type.split("/")[1])) {
		error = input.dataset.allowedTypesMessage ? input.dataset.allowedTypesMessage : "Invalid file type";
		input.classList.add(errorClass);
	}
	*/

	// Проверка длины номера телефона
	if (!error && input.type === 'tel' && value.replace(/\D/g, '').length < 11) {
		error = input.dataset.telMessage ? input.dataset.telMessage : defaultTelMessage;
		input.classList.add(errorClass);
	}

	// If there is no error remove error class from the input, remove message from error element and hide it
	if (!error) {
		input.classList.remove(errorClass);
		// errorEl.innerText = "";
		// errorEl.style.display = "none";
	} else {
		// If there is error set error message and show error element
		// errorEl.innerText = error;
		// errorEl.style.display = "block";
	}
	return error;
}

function validateInputBlur(input) {
	// для более красивого поведения полей email и tel: ошибки нет при снятии фокуса с пустого поля, а также в процессе ввода
	// проверка корректности поля пройдёт при попытке отправки формы (будет вызван обычный validateInput)
	const value = input.value;
	const errorClass = 'is-error';
	const defaultEmailMessage = 'Некорректный формат email';
	const defaultTelMessage = 'Некорректный формат телефона';

	let error = null;

	if (!error && input.type === 'email' && !validateEmail(value)) {
		if (value !== '') {
			error = input.dataset.emailMessage ? input.dataset.emailMessage : defaultEmailMessage;
			input.classList.add(errorClass);
		}
	}

	// Проверка длины номера телефона
	if (!error && input.type === 'tel' && value.replace(/\D/g, '').length < 11) {
		error = input.dataset.telMessage ? input.dataset.telMessage : defaultTelMessage;
		input.classList.add(errorClass);
	}

	if (!error) {
		input.classList.remove(errorClass);
	}
	return error;
}

function validateEmail(email) {
	const re =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function handleInputChange(e) {
	validateInput(e.target);
}

function handleInputBlur(e) {
	validateInputBlur(e.target);
}

function lockSubmitButton(button, loaderClass = 'is-loading') {
	if (!button) {
		return;
	}

	button.type = 'button';
	button.classList.add(loaderClass);
}

function unlockSubmitButton(button, loaderClass = 'is-loading') {
	if (!button) {
		return;
	}

	button.type = 'submit';
	button.classList.remove(loaderClass);
}

function showSubmitStatus(response, form, submitButton) {
	const parent = submitButton?.parentElement || form;

	const status = document.createElement('div');
	const submitStatusClass = 'submit-status';
	const submitConditionClass = response.success ? 'submit-status_success' : 'submit-status_error';

	if (!response.message) {
		return;
	}

	// Наполняем блок
	status.innerHTML = response.message;
	status.classList.add(submitStatusClass, submitConditionClass);

	// Удаляем старый статус
	const oldStatus = form.querySelector(`.${submitStatusClass}`);
	if (oldStatus) {
		oldStatus.remove();
	}

	parent.prepend(status);

	// if (response.success && submitButton) {
	// 	submitButton.disabled = true;
	// }
}

function handleFormSubmit(form, inputs, e) {
	e.preventDefault();
	const USE_AJAX = true;
	const errors = [];
	const errorsClass = 'has-errors';
	const loaderClass = 'is-loading';
	const submitButton = form.querySelector('[type="submit"]');

	// Проверка на уже отправляющуюся кнопку
	if (submitButton?.classList.contains(loaderClass)) {
		return;
	}

	inputs.forEach((input) => {
		const error = validateInput(input);
		if (error) {
			errors.push(error);
		}
	});

	if (errors.length === 0) {
		form.classList.remove(errorsClass);

		// Убираем возможность повторного сабмита
		lockSubmitButton(submitButton, loaderClass);

		if (USE_AJAX) {
			handleAjaxSubmit(form, submitButton);
		} else {
			HTMLFormElement.prototype.submit.call(form);
		}
	} else {
		e.stopPropagation();
		form.classList.add(errorsClass);
	}
}

async function sendFormAjax(form) {
	const action = form.getAttribute('action');
	if (!action) {
		return;
	}

	const formData = new FormData(form);
	formData.append('sessid', BX.bitrix_sessid());

	const response = await fetch(action, {
		method: 'POST',
		body: formData,
	});

	return response.json();
}

async function handleAjaxSubmit(form, submitButton) {
	const loaderClass = 'is-loading';

	try {
		const result = await sendFormAjax(form);

		showSubmitStatus(result, form, submitButton);

		if (result?.success) {
			form.reset();
			unlockSubmitButton(submitButton, loaderClass);
		} else {
			setTimeout(() => unlockSubmitButton(submitButton, loaderClass), 2000);
		}
	} catch (e) {
		showSubmitStatus(
			{
				success: false,
				message: `Ошибка отправки формы: ${e}`,
			},
			form
		);
		setTimeout(() => unlockSubmitButton(submitButton, loaderClass), 2000);
	}
}
