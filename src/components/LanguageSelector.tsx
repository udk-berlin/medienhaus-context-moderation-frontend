import i18n from 'i18next';
import { ChangeEventHandler } from 'react';
import { lsLang } from '../constants';


const LanguageSelector = () => {
	const changeLanguage: ChangeEventHandler<HTMLSelectElement> = (event) => {
		const languageCode = event.target.value;
		localStorage.setItem(lsLang, languageCode);
		i18n.changeLanguage(languageCode);
	};

	return (
		<select
			className="languageSelector"
			defaultValue={i18n.language}
			onChange={changeLanguage}
		>
			<option value="en">EN</option>
			<option value="de">DE</option>
		</select>
	);
};

export default LanguageSelector;
