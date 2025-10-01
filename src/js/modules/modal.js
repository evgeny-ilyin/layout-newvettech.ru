export function modalsInit({
	isActiveClass = 'is-active',
	isLockClass = 'is-lock',
	modalAttr = 'modal',
	modalIdAttr = 'id',
	showAttr = 'modal-show',
	closeAttr = 'modal-close',
	overlayAttr = 'modal-overlay',
	// customSelectClass = 'lcslt-shown',
} = {}) {
	const html = document.documentElement;
	const overlay = document.querySelector(`[data-${overlayAttr}]`);

	// Открыть модалку
	const openModal = (targetId) => {
		const modal = document.querySelector(`[data-${modalAttr}][data-${modalIdAttr}="${targetId}"]`);
		if (!modal) {
			return false;
		}

		modal.classList.add(isActiveClass);
		overlay?.classList.add(isActiveClass);
		html.classList.add(isLockClass);

		return true;
	};

	// Закрыть модалку
	const closeModal = (modal) => {
		modal.classList.remove(isActiveClass);
		overlay?.classList.remove(isActiveClass);
		html.classList.remove(isLockClass);
	};

	document.addEventListener('click', (e) => {
		const modalExist = document.querySelector(`[data-${modalAttr}].${isActiveClass}`);
		const showTrigger = e.target.closest(`[data-${showAttr}]`);
		const closeTrigger = e.target.closest(`[data-${closeAttr}], [data-${overlayAttr}]`);

		// Показать
		if (showTrigger) {
			e.preventDefault();
			const targetId = showTrigger.getAttribute(`data-${showAttr}`);
			if (!targetId) {
				return;
			}
			openModal(targetId);
		}

		// Закрыть (с учётом кастомного селекта)
		if (modalExist && (!modalExist.contains(e.target) || closeTrigger)) {
			// if (e.target.closest(`.${customSelectClass}`)) {
			// 	return;
			// }
			closeModal(modalExist);
		}
	});
}
