/* eslint-disable @typescript-eslint/ban-ts-comment */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { resource } from './translations';
import { lsLang } from './constants';


const defaultLang = 'en';
let lang: string;
if (localStorage.getItem(lsLang) !== null) {
	// @ts-expect-error
	lang = localStorage.getItem(lsLang);
	if (!lang) {
		lang = defaultLang;
	}
} else {
	lang = 'en';
}

export function init() {
	return i18n
		.use(initReactI18next)
		// for all options read: https://www.i18next.com/overview/configuration-options
		.init({
			resources: resource,
			supportedLngs: ['en', 'de'],
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
