const i18n = {
  currentLang: 'ru', // Язык по умолчанию
  
  translations: {
    ru: {
      "nav_help": "ℹ️ Инструкция",
      "view_circle": "🎯 Круг",
      "view_classic": "🔢 Сетка",
      "setup_title": "Darts with custom rules",
      "placeholder_names": "Имена через запятую",
      "label_play_to_last": "Играть до последнего",
      "btn_start": "Начать игру",
      "label_round": "РАУНД:",
      "btn_undo": "Отмена",
      "btn_reset": "Сброс хода",
      "btn_new_game": "Новая игра",
      "header_history": "История бросков",
      "th_round": "Раунд",
      "th_player": "Игрок",
      "th_throws": "Броски",
      "th_sum": "Сумма",
      "th_remaining": "Остаток",
      "th_place": "Место",
      "th_score": "Очки",
      "th_status": "Статус",
      "msg_game_over": "Игра окончена!",
      "btn_rematch": "Реванш",
      "btn_new_game_big": "Новая игра",
      "modal_bust": "ПЕРЕБОР!",
      "modal_win": "ПОБЕДА! 🎯",
      "confirm_new_game": "Вы уверены, что хотите начать новую игру? Весь прогресс будет удален.",
      "status_playing": "Ходит",
      "status_finished": "Финиш",
      "status_waiting": "Ждет",
      "msg_win_place": "Вы заняли {{place}} место!",
      
      // Справка (Sidebar)
      "help_title": "🎯 Памятка игрока",
      "help_h1": "1. Множители (X2, X3)",
      "help_p1": "Сначала жмите <b>X2</b> или <b>X3</b>, потом число. Множитель сбросится сам после ввода броска.",
      "help_h2": "2. Зеленые круги",
      "help_p2": "Это ваши дротики. В них сразу отображается результат каждого попадания.",
      "help_h3": "3. Авто-завершение",
      "help_p3": "Ход переходит к следующему игроку автоматически после 3-го броска.",
      "help_h4": "4. Перебор (Bust)",
      "help_p4": "Если выбили больше, чем осталось — очки за раунд не засчитываются.",
      "help_h5": "5. Награды",
      "help_p5": "🥇, 🥈, 🥉 — за первые три места. Игроки, закрывшиеся в одном раунде, делят место.",
      "help_tip": "<strong>Подсказка:</strong> Пользуйтесь кнопкой «Отмена», если ошиблись вводом последнего дротика.",
      "help_checkouts_title": "Популярные закрытия (Checkouts)",
      "th_checkout_left": "Остаток",
      "th_checkout_comb": "Комбинация",
      "help_checkouts_legend": "* T — Triple (X3), D — Double (X2)"
    },
    en: {
      "nav_help": "ℹ️ Help",
      "view_circle": "🎯 Circle",
      "view_classic": "🔢 Grid",
      "setup_title": "Darts with custom rules",
      "placeholder_names": "Names separated by commas",
      "label_play_to_last": "Play to the last player",
      "btn_start": "Start Game",
      "label_round": "ROUND:",
      "btn_undo": "Undo",
      "btn_reset": "Reset Turn",
      "btn_new_game": "New Game",
      "header_history": "Throw History",
      "th_round": "Round",
      "th_player": "Player",
      "th_throws": "Throws",
      "th_sum": "Sum",
      "th_remaining": "Left",
      "th_place": "Place",
      "th_score": "Score",
      "th_status": "Status",
      "msg_game_over": "Game Over!",
      "btn_rematch": "Rematch",
      "btn_new_game_big": "New Game",
      "modal_bust": "BUST!",
      "modal_win": "WINNER! 🎯",
      "confirm_new_game": "Are you sure you want to start a new game? All progress will be deleted.",
      "status_playing": "Turn",
      "status_finished": "Finished",
      "status_waiting": "Waiting",
      "msg_win_place": "You took place {{place}}!",
      
      // Справка (Sidebar)
      "help_title": "🎯 Player's Guide",
      "help_h1": "1. Multipliers (X2, X3)",
      "help_p1": "First press <b>X2</b> or <b>X3</b>, then the number. The multiplier will reset automatically after the throw.",
      "help_h2": "2. Green Circles",
      "help_p2": "These are your darts. They immediately display the result of each hit.",
      "help_h3": "3. Auto-Complete",
      "help_p3": "The turn passes to the next player automatically after the 3rd throw.",
      "help_h4": "4. Bust",
      "help_p4": "If you score more than what's left, the points for the round are not counted.",
      "help_h5": "5. Awards",
      "help_p5": "🥇, 🥈, 🥉 — for the first three places. Players who finish in the same round share the place.",
      "help_tip": "<strong>Tip:</strong> Use the 'Undo' button if you made a mistake entering the last dart.",
      "help_checkouts_title": "Popular Checkouts",
      "th_checkout_left": "Left",
      "th_checkout_comb": "Combination",
      "help_checkouts_legend": "* T — Triple (X3), D — Double (X2)"
    }
  }
};

// Функция переключения языков
function applyTranslations(lang) {
  i18n.currentLang = lang;
  localStorage.setItem('dartsLang', lang);
  
  const t = i18n.translations[lang];
  
  // Обновляем текст во всех элементах с дата-атрибутом
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (t[key]) {
      if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
        element.placeholder = t[key];
      } else {
        element.innerHTML = t[key];
      }
    }
  });

  // Переключение активного класса на кнопках переключателя
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

// Поиск перевода в JS-логике
function getTranslation(key) {
  return i18n.translations[i18n.currentLang][key] || key;
}
