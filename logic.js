let players = [], curIdx = 0, multiplier = 1, currentTurnThrows = [];
let currentPlace = 1, someoneWonInThisRound = false, roundNum = 1;
let isGameOver = false;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('dartsLang') || 'ru';
  applyTranslations(savedLang);

  const savedBoardView = localStorage.getItem('dartsBoardView') || 'classic';
  toggleBoardView(savedBoardView);

  loadGameState();
});

function startGame() {
  const namesVal = document.getElementById('names').value;
  if (!namesVal.trim()) return;
  setupGame(namesVal.split(',').map(n => n.trim()));
}

function setupGame(nameList) {
  const startVal = parseInt(document.getElementById('startScore').value);
  players = nameList.map(n => ({ name: n, score: startVal, isFinished: false, place: null }));
  curIdx = 0;
  currentPlace = 1;
  roundNum = 1;
  someoneWonInThisRound = false;
  currentTurnThrows = [];
  
  document.getElementById('historyTable').innerHTML = '';
  document.getElementById('setup-box').classList.add('d-none');
  document.getElementById('game-box').classList.remove('d-none');
  document.getElementById('finish-msg').classList.add('d-none');
  
  updateUI();
  saveGameState();
}

function rematch() {
  if (players.length === 0) return;
  setupGame(players.map(p => p.name));
}

function newGame() {
  localStorage.removeItem('dartsState');
  location.reload();
}

function setMult(m) {
  multiplier = (multiplier === m) ? 1 : m;
  document.getElementById('m2').className = multiplier === 2 ? 'btn btn-danger multiplier-btn' : 'btn btn-outline-danger multiplier-btn';
  document.getElementById('m3').className = multiplier === 3 ? 'btn btn-danger multiplier-btn' : 'btn btn-outline-danger multiplier-btn';
}

function addScore(val) {
  if (currentTurnThrows.length >= 3) return;
  let res = val * multiplier;
  if (val === 25) {
    res = (multiplier === 2) ? 50 : 25;
  } else if (val === 50) {
    res = 50;
  }
  currentTurnThrows.push(res);
  multiplier = 1;
  setMult(1);
  updateUI();
  
  if (currentTurnThrows.length === 3) setTimeout(finishTurn, 400);
  saveGameState();
}

function finishTurn() {
  const p = players[curIdx];
  const sum = currentTurnThrows.reduce((a, b) => a + b, 0);
  const prevScore = p.score;
  
  if (p.score - sum >= 0) {
    p.score -= sum;
    addHistoryRow(roundNum, p.name, currentTurnThrows, sum, p.score);
    if (p.score === 0) {
      p.isFinished = true;
      p.place = currentPlace;
      someoneWonInThisRound = true;
      showWinModal(p.name, p.place);
      currentTurnThrows = [];
      return;
    }
    currentTurnThrows = [];
    nextPlayer();
  } else {
    addHistoryRow(roundNum, p.name, currentTurnThrows, "BUST", prevScore);
    const m = new bootstrap.Modal(document.getElementById('bustModal'));
    m.show();
    setTimeout(() => {
      m.hide();
      currentTurnThrows = [];
      nextPlayer();
    }, 1200);
  }
  saveGameState();
}

function addHistoryRow(round, name, throws, sum, remains) {
  const tbody = document.getElementById('historyTable');
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${round}</td>
    <td>${name}</td>
    <td class="text-muted">${throws.join(', ')}</td>
    <td class="fw-bold text-primary">${sum}</td>
    <td class="fw-bold">${remains}</td>
  `;
  tbody.prepend(tr);
}

function nextPlayer() {
  let oldIdx = curIdx;
  let nextIdx = (curIdx + 1) % players.length;
  const playToLast = document.getElementById('playToLast').checked;
  
  if (nextIdx === 0 || nextIdx < oldIdx) {
    if (someoneWonInThisRound) {
      currentPlace++;
      someoneWonInThisRound = false;
    }
    roundNum++;
    const active = players.filter(pl => !pl.isFinished);
    if (!playToLast && active.length === 1) {
      active[0].isFinished = true;
      active[0].place = currentPlace;
      endGame();
      return;
    }
  }
  curIdx = nextIdx;
  if (players.filter(pl => !pl.isFinished).length === 0) {
    endGame();
    return;
  }
  if (players[curIdx].isFinished) {
    nextPlayer();
    return;
  }
  updateUI();
  saveGameState();
}

function getAward(place) {
  if (!place) return `<span class="text-muted">—</span>`;
  let cls = ["bg-gold", "bg-silver", "bg-bronze"][place-1] || "bg-medal";
  let icon = ["🥇", "🥈", "🥉"][place-1] || "🏅";
  return `<div class="award-badge ${cls}">${icon} ${place}</div>`;
}

function updateUI() {
  const p = players[curIdx];
  
  if (p && !p.isFinished) {
    document.getElementById('curName').innerText = p.name;
    document.getElementById('curScore').innerText = p.score;
    document.getElementById('roundDisplay').innerText = roundNum;
    
    const curRemainingEl = document.getElementById('curRemaining');
    if (currentTurnThrows.length > 0) {
      const currentTurnSum = currentTurnThrows.reduce((a, b) => a + b, 0);
      const remaining = p.score - currentTurnSum;
      curRemainingEl.innerText = `➜ ${remaining}`;
      curRemainingEl.style.display = 'inline';
      
      if (remaining < 0) {
        curRemainingEl.className = 'fs-3 text-danger ms-2 fw-bold';
        curRemainingEl.innerText = `➜ BUST`;
      } else {
        curRemainingEl.className = 'fs-3 text-muted ms-2';
      }
    } else {
      curRemainingEl.style.display = 'none';
    }
  }
  
  // Обновление плашек дротиков
  for (let i = 0; i < 3; i++) {
    const b = document.getElementById(`t-${i}`);
    b.innerText = currentTurnThrows[i] !== undefined ? currentTurnThrows[i] : '-';
    b.className = currentTurnThrows[i] !== undefined ? 'throw-badge throw-active' : 'throw-badge';
  }
  
  // Таблица текущих счетов
  const tbody = document.getElementById('scoreTable');
  tbody.innerHTML = '';
  players.forEach((pl, i) => {
    const tr = document.createElement('tr');
    if (pl.isFinished) tr.className = 'finished-p';
    else if (i === curIdx) tr.className = 'active-p';
    
    // Мультиязычные статусы
    let statusText = '';
    let statusClass = 'bg-light text-dark';
    
    if (pl.isFinished) {
      statusText = getTranslation('status_finished');
      statusClass = 'bg-secondary text-white';
    } else if (i === curIdx) {
      statusText = getTranslation('status_playing');
      statusClass = 'bg-success text-white';
    } else {
      statusText = getTranslation('status_waiting');
      statusClass = 'bg-light text-dark';
    }
    
    tr.innerHTML = `
      <td>${getAward(pl.place)}</td>
      <td class="fw-bold">${pl.name}</td>
      <td class="fs-5">${pl.score}</td>
      <td><span class="status-badge ${statusClass}">${statusText}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function showWinModal(name, place) {
  document.getElementById('winnerNameDisplay').innerText = name;
  
  const winTpl = getTranslation('msg_win_place');
  document.getElementById('winnerPlaceText').innerText = winTpl.replace('{{place}}', place);
  
  const m = new bootstrap.Modal(document.getElementById('winModal'));
  m.show();
  setTimeout(() => {
    m.hide();
    nextPlayer();
  }, 1500);
}

function endGame() {
  isGameOver = true;
  document.getElementById('finish-msg').classList.remove('d-none');
  updateUI();
}

function undoLastThrow() {
  currentTurnThrows.pop();
  updateUI();
  saveGameState();
}

function resetTurn() {
  currentTurnThrows = [];
  updateUI();
  saveGameState();
}

function saveGameState() {
  const state = {
    players, curIdx, multiplier, currentTurnThrows,
    currentPlace, someoneWonInThisRound, roundNum, isGameOver,
    historyHTML: document.getElementById('historyTable').innerHTML
  };
  localStorage.setItem('dartsState', JSON.stringify(state));
}

function loadGameState() {
  const saved = localStorage.getItem('dartsState');
  if (saved) {
    const state = JSON.parse(saved);
    players = state.players;
    curIdx = state.curIdx;
    multiplier = state.multiplier;
    currentTurnThrows = state.currentTurnThrows;
    currentPlace = state.currentPlace;
    someoneWonInThisRound = state.someoneWonInThisRound;
    roundNum = state.roundNum;
    isGameOver = state.isGameOver || false;
    
    document.getElementById('setup-box').classList.add('d-none');
    document.getElementById('game-box').classList.remove('d-none');
    document.getElementById('historyTable').innerHTML = state.historyHTML;
    
    if (isGameOver) document.getElementById('finish-msg').classList.remove('d-none');
    updateUI();
  }
}

function confirmNewGame() {
  const message = getTranslation('confirm_new_game');
  if (confirm(message)) {
    newGame();
  }
}

function toggleBoardView(viewType) {
  localStorage.setItem('dartsBoardView', viewType);

  const circleBoard = document.querySelector('.dartboard-wrapper');
  const classicBoard = document.querySelector('.dartboard-classic');

  if (!circleBoard || !classicBoard) return;

  if (viewType === 'circle') {
    circleBoard.classList.remove('d-none');
    classicBoard.classList.add('d-none');
  } else if (viewType === 'classic') {
    circleBoard.classList.add('d-none');
    classicBoard.classList.remove('d-none');
  }

  document.querySelectorAll('[name="boardView"]').forEach(radio => {
    console.log('test', viewType, radio, radio.getAttribute('data-view') === viewType);
    radio.checked = radio.getAttribute('data-view') === viewType;
  });
}