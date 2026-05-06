const params = new URLSearchParams(window.location.search);
const isMobileMode = params.get('mode') === 'camera';
let transport = params.get('transport') || localStorage.getItem('darts_transport') || 'peerjs';
let roomId = params.get('room') || localStorage.getItem('darts_session_id');

const firebaseConfig = { databaseURL: "https://darts-peer-default-rtdb.europe-west1.firebasedatabase.app" };

function isMobile() { return isMobileMode; }

function generateRoomId() { return 'darts-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4); }

function initDesktopPeer(forceNew = false) {
    if (forceNew || !roomId) {
        roomId = generateRoomId();
        localStorage.setItem('darts_session_id', roomId);
    }
    updateUIAndConnect();
}

function initMobileRemote() {
    const container = document.querySelector('.container');
    const mobileUI = document.getElementById('mobile-interface');
    if (container) container.style.display = 'none';
    if (mobileUI) mobileUI.classList.remove('d-none');

    if (transport === 'firebase') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        document.getElementById('remote-status').className = "badge bg-success";
        document.getElementById('remote-status').innerText = "✅ Cloud (Firebase)";
    } else {
        window.activePeer = new Peer();
        window.activePeer.on('open', () => {
            window.activeConn = window.activePeer.connect(roomId);
            window.activeConn.on('open', () => {
                document.getElementById('remote-status').className = "badge bg-success";
                document.getElementById('remote-status').innerText = "✅ P2P (PeerJS)";
            });
        });
    }
}

function updateUIAndConnect() {
    if (window.activePeer) { window.activePeer.destroy(); window.activePeer = null; }
    if (window.firebaseRef) { window.firebaseRef.off(); window.firebaseRef = null; }

    const domain = window.location.origin + window.location.pathname;
    const cameraUrl = `${domain}?mode=camera&room=${roomId}&transport=${transport}`;
    
    const qrEl = document.getElementById('qrcode');
    if (qrEl) {
        qrEl.innerHTML = "";
        new QRCode(qrEl, { text: cameraUrl, width: 140, height: 140 });
    }
    window.history.pushState({}, '', `?room=${roomId}&transport=${transport}`);

    transport === 'firebase' ? initFirebase() : initPeerJS();
}

function initPeerJS() {
    window.activePeer = new Peer(roomId);
    window.activePeer.on('connection', conn => {
        conn.on('data', data => handleIncomingData(data));
    });
}

function initFirebase() {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    window.firebaseRef = firebase.database().ref('sessions/' + roomId);
    window.firebaseRef.on('value', snap => {
        const data = snap.val();
        if (data && data.ts > Date.now() - 5000) handleIncomingData(data);
    });
}

function handleIncomingData(data) {
    if (data.type === 'score' && window.addScore) addScore(data.value);
    if (data.type === 'action' && data.value === 'undo' && window.undoLastThrow) undoLastThrow();
}

window.sendData = (payload) => {
    const data = { ...payload, ts: Date.now() };
    if (transport === 'firebase') {
        firebase.database().ref('sessions/' + roomId).set(data);
    } else if (window.activeConn) {
        window.activeConn.send(data);
    }
};

window.sendScoreToPc = (val) => {
    const score = val !== undefined ? val : parseInt(document.getElementById('remote-score').value);
    if (!isNaN(score)) {
        window.sendData({ type: 'score', value: score });
        document.getElementById('last-sent').innerText = score;
        document.getElementById('remote-score').value = '';
    }
};

window.sendActionToPc = (action) => {
    window.sendData({ type: 'action', value: action });
};

window.generateNewRoom = () => {
    if (!confirm("Сбросить ID комнаты? Связь с телефоном прервется.")) return;
    initDesktopPeer(true);
};

window.changeTransport = (val) => {
    transport = val;
    localStorage.setItem('darts_transport', val);
    updateUIAndConnect();
};

