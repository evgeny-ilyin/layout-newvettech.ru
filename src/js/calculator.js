class CtCalculator {
	constructor(element) {
		this.element = element;

		this.inputs = {
			animal: element.querySelector('[data-calculator="animal"]'),
			weight: element.querySelector('[data-calculator="weight"]'),
			area: element.querySelector('[data-calculator="area"]'),
			contrast: element.querySelector('[data-calculator="contrast"]'),
			extra: element.querySelector('[data-calculator="extra"]'),
			branch: element.querySelector('[data-calculator="branch"]'),
		};

		this.results = {
			diagnostic: element.querySelector('[data-result="diagnostic"]'),
			anesthesia: element.querySelector('[data-result="anesthesia"]'),
			contrast: element.querySelector('[data-result="contrast"]'),
			extra: element.querySelector('[data-result="extra"]'),
			extraRow: element.querySelector('[data-result="extra-row"]'),
			extraName: element.querySelector('[data-result="extra-name"]'),
			discount: element.querySelector('[data-result="discount"]'),
			discountRow: element.querySelector('[data-result="discount-row"]'),
			total: element.querySelector('[data-result="total"]'),
		};

		this.init();
	}

	init() {
		Object.values(this.inputs).forEach((input) => {
			input.addEventListener('change', () => {
				this.calculate();
			});
		});

		this.calculate();
	}

	getSelectedOption(select) {
		return select.options[select.selectedIndex];
	}

	getPrice(select, attribute) {
		const option = this.getSelectedOption(select);
		return Number(option.dataset[attribute] || 0);
	}

	formatPrice(value) {
		return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;
	}

	calculate() {
		// КТ
		const diagnosticPrice = this.getPrice(this.inputs.animal, 'price');

		// Анестезия
		const anesthesiaPrice = this.getPrice(this.inputs.weight, 'anesthesiaPrice');

		// Контраст
		const isContrastSelected = this.inputs.contrast.value === 'appointed';
		const contrastPrice = isContrastSelected
			? this.getPrice(this.inputs.weight, 'contrastPrice')
			: 0;

		// Дополнительная процедура
		const extraOption = this.getSelectedOption(this.inputs.extra);
		const extraPrice = this.getPrice(this.inputs.extra, 'price');

		if (extraPrice > 0) {
			this.results.extraName.textContent = extraOption.textContent.trim();
			this.results.extra.textContent = this.formatPrice(extraPrice);
			this.results.extraRow.hidden = false;
		} else {
			this.results.extraName.textContent = '';
			this.results.extra.textContent = '';
			this.results.extraRow.hidden = true;
		}

		/* v1 */
		// Скидка только на диагностическую часть
		// const discount = Number(this.getSelectedOption(this.inputs.branch).dataset.discount || 0);
		// const discountAmount = Math.round((diagnosticPrice * discount) / 100);

		// Итог
		// const total = diagnosticPrice - discountAmount + anesthesiaPrice + contrastPrice + extraPrice;

		/* v2 */
		// Скидка на всю сумму
		const totalSum = diagnosticPrice + anesthesiaPrice + contrastPrice + extraPrice;
		const discount = Number(this.getSelectedOption(this.inputs.branch).dataset.discount || 0);
		const discountAmount = Math.round((totalSum * discount) / 100);

		// Итог
		const total = totalSum - discountAmount;

		// Вывод
		this.results.diagnostic.textContent = this.formatPrice(diagnosticPrice);
		this.results.anesthesia.textContent = this.formatPrice(anesthesiaPrice);
		this.results.contrast.textContent = this.formatPrice(contrastPrice);
		this.results.total.textContent = `от ${this.formatPrice(total)}`;
		this.results.discount.textContent = '';
		this.results.discountRow.hidden = true;

		// Скидка отображается только если она есть
		if (discountAmount > 0) {
			this.results.discount.textContent = this.formatPrice(discountAmount);
			this.results.discountRow.hidden = false;
		}
	}
}

addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.calculator').forEach((calculator) => {
		new CtCalculator(calculator);
	});
});
