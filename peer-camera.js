const params = new URLSearchParams(window.location.search);
const isMobileMode = params.get('mode') === 'camera';
let currentRoom = params.get('room') || localStorage.getItem('darts_session_id');

function isMobile(){
  return isMobileMode;
}

// --- ЛОГИКА ДЛЯ ПК ---
function initDesktopPeer(forceNew = false) {
    if (forceNew || !currentRoom) {
        currentRoom = 'darts-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
        localStorage.setItem('darts_session_id', currentRoom);
    }

    const peer = new Peer(currentRoom, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        pingInterval: 5000
    });
    
    peer.on('open', (id) => {
        const url = `${window.location.origin}${window.location.pathname}?mode=camera&room=${id}`;
        document.getElementById('qrcode').innerHTML = "";
        new QRCode(document.getElementById("qrcode"), { text: url, width: 140, height: 140 });
    });

    peer.on('connection', (conn) => {
        conn.on('data', (data) => {
            if (data.type === 'score') {
                if (typeof addScore === 'function') addScore(data.value);
            } else if (data.type === 'action' && data.value === 'undo') {
                if (typeof undoLastThrow === 'function') undoLastThrow();
            }
        });
    });
}

function generateNewRoom() {
    if(confirm("Сбросить ID комнаты? Связь с телефоном прервется.")) {
        initDesktopPeer(true);
    }
}

// --- ЛОГИКА ДЛЯ ТЕЛЕФОНА ---
function initMobileRemote() {
    const container = document.querySelector('.container');
    const mobileUI = document.getElementById('mobile-interface');

    if (container) container.style.display = 'none'; // Скрываем основной сайт
    if (mobileUI) mobileUI.classList.remove('d-none');

    const peer = new Peer();
    peer.on('open', () => {
        const conn = peer.connect(currentRoom);
        
        conn.on('open', () => {
            document.getElementById('remote-status').className = "badge bg-success";
            document.getElementById('remote-status').innerText = "СВЯЗАНО";
            
            // Глобальные функции для кнопок
            window.sendScoreToPc = (val) => {
                const score = val !== undefined ? val : parseInt(document.getElementById('remote-score').value);
                if (!isNaN(score)) {
                    conn.send({ type: 'score', value: score });
                    document.getElementById('last-sent').innerText = score;
                    document.getElementById('remote-score').value = '';
                }
            };

            window.sendActionToPc = (action) => {
                conn.send({ type: 'action', value: action });
            };
        });

        conn.on('close', () => {
            document.getElementById('remote-status').className = "badge bg-danger";
            document.getElementById('remote-status').innerText = "ОТКЛЮЧЕНО";
        });
    });
}
