import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resource } from './translations';
import { lsLang } from './constants';


const supportedLangs = ['en', 'de'];
const defaultLang = 'en';

let lang: string;
if (localStorage.getItem(lsLang) !== null) {
	const storedLang = localStorage.getItem(lsLang);
	if (!storedLang) {
		lang = defaultLang;
	} else {
		lang = storedLang;
	}
} else {
	lang = defaultLang;
}

export function init() {
	return i18n
		.use(initReactI18next)
		// for all options read: https://www.i18next.com/overview/configuration-options
		.init({
			resources: resource,
			supportedLngs: supportedLangs,
			lng: lang,
			// nsSeparator: false,
			// keySeparator: false,
			// fallbackLng: false,
			interpolation: {
				escapeValue: false // react already safes from xss
			},
			// react: {
			// 	useSuspense: false
			// },
			debug: false,
		});
}

export default i18n;
