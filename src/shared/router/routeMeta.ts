import 'vue-router'

/** Какую справочную панельку открывает кнопка в шапке: памятку игрока или правила турнира. */
export type HelpTopic = 'player' | 'tournament'

declare module 'vue-router' {
  interface RouteMeta {
    /** Переключатель «Круг / Сетка» нужен только на экране идущей партии. */
    boardViewToggle?: boolean
    /** Без значения кнопка справки в шапке не показывается. */
    help?: HelpTopic
  }
}
