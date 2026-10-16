import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settingsStore'
import type { Language } from '@/types/game'

type TranslationMap = Record<string, string>

const translations: Record<Language, TranslationMap> = {
  ru: {
    nav_help: 'ℹ️ Инструкция',
    view_circle: 'Круг',
    view_classic: 'Сетка',
    setup_title: 'Дартс по своим правилам',
    placeholder_names: 'Имена через запятую',
    label_play_to_score: 'Играть до(очков)',
    label_play_to_last: 'Играть до последнего',
    label_throw_per_leg: 'Количество бросков за раунд',
    label_end_with_double: 'Закрытие удвоением',
    btn_start: 'Начать игру',
    label_round: 'РАУНД',
    label_popular_combos: 'Популярные комбинации',
    btn_undo: 'Отмена броска',
    btn_undo_leg: 'Отмена хода',
    btn_bust: 'ПЕРЕБОР',
    btn_reset: 'Сброс хода',
    btn_new_game: 'Новая игра',
    header_history: 'История бросков',
    th_round: 'Раунд',
    th_player: 'Игрок',
    th_throws: 'Броски',
    th_sum: 'Сумма',
    th_remaining: 'Остаток',
    th_place: 'Место',
    th_score: 'Очки',
    th_status: 'Статус',
    msg_game_over: 'Игра окончена!',
    btn_rematch: 'Реванш',
    btn_new_game_big: 'Новая игра',
    modal_bust: 'ПЕРЕБОР!',
    modal_win: 'ПОБЕДА! 🎯',
    confirm_new_game:
      'Вы уверены, что хотите начать новую игру? Весь прогресс будет удален.',
    status_playing: 'Ходит',
    status_finished: 'Финиш',
    status_waiting: 'Ждет',
    msg_win_place: 'Вы заняли {{place}} место!',
    help_title: '🎯 Памятка игрока',
    help_h1: '1. Множители (X2, X3)',
    help_p1:
      'Сначала жмите <b>X2</b> или <b>X3</b>, потом число. Множитель сбросится сам после ввода броска.',
    help_h2: '2. Зеленые круги',
    help_p2:
      'Это ваши дротики. В них сразу отображается результат каждого попадания.',
    help_h3: '3. Авто-завершение',
    help_p3:
      'Ход переходит к следующему игроку автоматически после 3-го броска.',
    help_h4: '4. Перебор (Bust)',
    help_p4:
      'Если выбили больше, чем осталось — очки за раунд не засчитываются.',
    help_h5: '5. Награды',
    help_p5:
      '🥇, 🥈, 🥉 — за первые три места. Игроки, закрывшиеся в одном раунде, делят место.',
    help_tip:
      '<strong>Подсказка:</strong> Пользуйтесь кнопкой «Отмена», если ошиблись вводом последнего дротика.',
    help_checkouts_title: 'Популярные закрытия (Checkouts)',
    th_checkout_left: 'Остаток',
    th_checkout_comb: 'Комбинация',
    help_checkouts_legend: '* T — Triple (X3), D — Double (X2)',
    checkout_max: 'макс.',

    remote_toggle: 'Ввод с телефона',
    remote_new_id: 'Новый ID',
    remote_confirm_new_id: 'Сбросить ID комнаты? Связь с телефоном прервется.',
    remote_transport_peerjs: 'P2P (PeerJS)',
    remote_transport_firebase: 'Cloud (Firebase)',
    remote_title: 'Darts Remote',
    remote_label_sum: 'Сумма за один бросок:',
    remote_btn_send: 'ОТПРАВИТЬ',
    remote_btn_undo: '↩ ОТМЕНА (UNDO)',
    remote_btn_bull_25: 'Bull 25',
    remote_btn_bull_50: 'Bull 50',
    remote_btn_miss: 'Мимо (0)',
    remote_btn_retry: 'Переподключиться',
    remote_status_idle: 'Не подключено',
    remote_status_connecting: 'Инициализация...',
    remote_status_connected: '✅ Подключено',
    remote_status_error: '⚠️ Ошибка связи',
    remote_no_room: 'Откройте эту страницу по QR-коду с компьютера.',
  },
  en: {
    nav_help: 'ℹ️ Help',
    view_circle: 'Circle',
    view_classic: 'Grid',
    setup_title: 'Darts with custom rules',
    placeholder_names: 'Names separated by commas',
    label_throw_per_leg: 'Throws per leg',
    label_play_to_score: 'Play up to(points)',
    label_play_to_last: 'Play to the last player',
    label_end_with_double: 'End on double',
    btn_start: 'Start Game',
    label_round: 'ROUND',
    label_popular_combos: 'Popular combos',
    btn_undo: 'Undo',
    btn_undo_leg: 'Undo leg',
    btn_bust: 'BUST',
    btn_reset: 'Reset Turn',
    btn_new_game: 'New Game',
    header_history: 'Throw History',
    th_round: 'Round',
    th_player: 'Player',
    th_throws: 'Throws',
    th_sum: 'Sum',
    th_remaining: 'Left',
    th_place: 'Place',
    th_score: 'Score',
    th_status: 'Status',
    msg_game_over: 'Game Over!',
    btn_rematch: 'Rematch',
    btn_new_game_big: 'New Game',
    modal_bust: 'BUST!',
    modal_win: 'WINNER! 🎯',
    confirm_new_game:
      'Are you sure you want to start a new game? All progress will be deleted.',
    status_playing: 'Turn',
    status_finished: 'Finished',
    status_waiting: 'Waiting',
    msg_win_place: 'You took place {{place}}!',
    help_title: "🎯 Player's Guide",
    help_h1: '1. Multipliers (X2, X3)',
    help_p1:
      'First press <b>X2</b> or <b>X3</b>, then the number. The multiplier will reset automatically after the throw.',
    help_h2: '2. Green Circles',
    help_p2:
      'These are your darts. They immediately display the result of each hit.',
    help_h3: '3. Auto-Complete',
    help_p3:
      'The turn passes to the next player automatically after the 3rd throw.',
    help_h4: '4. Bust',
    help_p4:
      "If you score more than what's left, the points for the round are not counted.",
    help_h5: '5. Awards',
    help_p5:
      '🥇, 🥈, 🥉 — for the first three places. Players who finish in the same round share the place.',
    help_tip:
      "<strong>Tip:</strong> Use the 'Undo' button if you made a mistake entering the last dart.",
    help_checkouts_title: 'Popular Checkouts',
    th_checkout_left: 'Left',
    th_checkout_comb: 'Combination',
    help_checkouts_legend: '* T — Triple (X3), D — Double (X2)',
    checkout_max: 'max.',

    remote_toggle: 'Phone input',
    remote_new_id: 'New ID',
    remote_confirm_new_id: 'Reset the room ID? The phone connection will drop.',
    remote_transport_peerjs: 'P2P (PeerJS)',
    remote_transport_firebase: 'Cloud (Firebase)',
    remote_title: 'Darts Remote',
    remote_label_sum: 'Total for a single throw:',
    remote_btn_send: 'SEND',
    remote_btn_undo: '↩ UNDO',
    remote_btn_bull_25: 'Bull 25',
    remote_btn_bull_50: 'Bull 50',
    remote_btn_miss: 'Miss (0)',
    remote_btn_retry: 'Reconnect',
    remote_status_idle: 'Not connected',
    remote_status_connecting: 'Connecting...',
    remote_status_connected: '✅ Connected',
    remote_status_error: '⚠️ Connection error',
    remote_no_room: 'Open this page by scanning the QR code on your computer.',
  },
}

export function useI18n() {
  const settings = useSettingsStore()

  const currentTranslations = computed(() => translations[settings.language])

  function t(key: string, params?: Record<string, string | number>): string {
    let text = currentTranslations.value[key] ?? key
    if (params) {
      for (const [param, value] of Object.entries(params)) {
        text = text.replace(`{{${param}}}`, String(value))
      }
    }
    return text
  }

  return { t }
}
