/**
 * Cookie policy
 * @link https://learn.javascript.ru/cookie
 */
function getCookie(name) {
	const matches = document.cookie.match(
		new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)')
	);
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, days = 1) {
	let expires;

	if (days) {
		const date = new Date();
		date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
		expires = '; expires=' + date.toUTCString();
	}

	const options = {
		path: '/',
		expires: expires,
		// defaults
	};

	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}

	let updatedCookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

	for (const optionKey in options) {
		updatedCookie += '; ' + optionKey;
		const optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += '=' + optionValue;
		}
	}

	document.cookie = updatedCookie;
}

function deleteCookie(name) {
	setCookie(name, '', {
		'max-age': -1,
	});
}

const cookieForm = document.querySelector('.cookie'),
	cookieAccept = document.querySelector('.cookie__accept');

const policyCheck = () => {
	if (!getCookie('policyAccepted')) {
		cookieForm.classList.remove('hidden');
	}
};

const policyAccepted = () => {
	setCookie('policyAccepted', '1', 7);
	cookieForm.classList.add('hidden');
};

cookieAccept.addEventListener('click', policyAccepted);
window.addEventListener('load', policyCheck);
