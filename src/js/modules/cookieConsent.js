/**
 * Модуль для управления уведомлением о cookie.
 *
 * @module cookieConsent
 * @copyright 2025 Evgeny Ilyin
 *
 * - Отображает popup с задержкой, если согласие ещё не дано.
 * - Сохраняет согласие пользователя в localStorage.
 * - Скрывает popup после принятия.
 *
 * @export
 * @function cookieConsentInit
 * @returns {void} Ничего не возвращает, изменяет DOM.
 */

const delayInSeconds = 1;
const consentValidityInDays = 30;
const consentKey = 'cookieConsent';
const visibleClass = 'is-visible';

/** Проверяет наличие действительного согласия */
function hasConsent() {
	const consentData = localStorage.getItem(consentKey);
	if (!consentData) {
		return false;
	}

	try {
		const { acceptedAt } = JSON.parse(consentData);
		const expirationDate = new Date(acceptedAt);
		expirationDate.setDate(expirationDate.getDate() + consentValidityInDays);
		return new Date() < expirationDate;
	} catch {
		return false;
	}
}

/** Сохраняет согласие пользователя */
function saveConsent() {
	localStorage.setItem(consentKey, JSON.stringify({ acceptedAt: new Date().toISOString() }));
}

/** Показывает popup */
function showPopup(popupBox) {
	popupBox?.classList.add(visibleClass);
}

/** Скрывает popup */
function hidePopup(popupBox) {
	popupBox?.classList.remove(visibleClass);
}

/**
 * Инициализация логики cookie popup
 * Должна быть вызвана один раз
 */
export function cookieConsentInit() {
	const popupBox = document.getElementById('c-popup');
	const acceptBtn = document.getElementById('c-accept');

	if (!hasConsent()) {
		setTimeout(() => showPopup(popupBox), delayInSeconds * 1000);
	}

	if (!acceptBtn) {
		return;
	}

	acceptBtn.addEventListener('click', () => {
		saveConsent();
		hidePopup(popupBox);
	});
}
