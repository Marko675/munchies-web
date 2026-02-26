import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import sr from './locales/sr.json'
import en from './locales/en.json'

const STORAGE_KEY = 'munchies_lang'

const savedLang = localStorage.getItem(STORAGE_KEY) ?? 'sr'

i18n.use(initReactI18next).init({
  resources: {
    sr: { translation: sr },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'sr',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lang: string) => {
  localStorage.setItem(STORAGE_KEY, lang)
  document.documentElement.lang = lang
})

export default i18n
