import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
	LANGUAGE_STORAGE_KEY,
	SUPPORTED_LANGUAGES,
	type SupportedLanguage,
} from "./index";

export function useLanguage() {
	const { i18n } = useTranslation();

	const currentLanguage = i18n.language as SupportedLanguage;

	const changeLanguage = useCallback(
		(language: SupportedLanguage) => {
			i18n.changeLanguage(language);
			localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
		},
		[i18n],
	);

	const toggleLanguage = useCallback(() => {
		const newLanguage = currentLanguage === "en" ? "id" : "en";
		changeLanguage(newLanguage);
	}, [currentLanguage, changeLanguage]);

	return {
		currentLanguage,
		changeLanguage,
		toggleLanguage,
		supportedLanguages: SUPPORTED_LANGUAGES,
		isEnglish: currentLanguage === "en",
		isIndonesian: currentLanguage === "id",
	};
}
