import { computed } from 'vue'
import { useSettingsStore } from '@/shared/stores/settingsStore'
import type { Language } from '@/shared/types/settings'
import { ru, type TranslationKey, type TranslationMap } from './locales/ru'
import { en } from './locales/en'

const translations: Record<Language, TranslationMap> = { ru, en }

const dateLocales: Record<Language, string> = { ru: 'ru-RU', en: 'en-GB' }

const DATE_FORMAT: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
const DATE_TIME_FORMAT: Intl.DateTimeFormatOptions = { ...DATE_FORMAT, hour: '2-digit', minute: '2-digit' }

export function useI18n() {
  const settings = useSettingsStore()

  const currentTranslations = computed(() => translations[settings.language])

  function t(key: TranslationKey, params?: Record<string, string | number>): string {
    let text: string = currentTranslations.value[key] ?? key
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(`{{${param}}}`, String(value))
      }
    }
    return text
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(dateLocales[settings.language], DATE_FORMAT)
  }

  function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString(dateLocales[settings.language], DATE_TIME_FORMAT)
  }

  return { t, formatDate, formatDateTime }
}
