if (new URLSearchParams(window.location.search).get('mode') === 'camera') {
    const script = document.createElement('script');
    script.src = "https://docs.opencv.org/4.x/opencv.js";
    script.async = true;
    script.onload = () => {
        console.log('OpenCV Script Loaded');
        setTimeout(() => {
            if (window.cv && window.cv.Mat) {
                console.log('OpenCV manual start');
                startProcessing();
            }
        }, 2000);
    }
    document.head.appendChild(script);
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: 640, height: 480 }, 
            audio: false 
        });
        const video = document.getElementById('video-feed');
        if (video) {
            video.srcObject = stream;
            // Важно: ждем начала воспроизведения, чтобы получить реальные размеры
            await video.play(); 
        }
    } catch (err) {
        console.error("Ошибка камеры:", err);
        document.getElementById('remote-status').innerText = "⚠️ Ошибка камеры";
    }
}

function startProcessing() {
    const video = document.getElementById('video-feed');
    let cap = new cv.VideoCapture(video);

    let src = new cv.Mat(0, 0, cv.CV_8UC4); 
    let gray = new cv.Mat();
    let circles = new cv.Mat();

    function processVideo() {
        try {
            // Проверка: готово ли видео давать кадры
            if (video.paused || video.ended || video.readyState < 2) {
                requestAnimationFrame(processVideo);
                return;
            }

            // МАГИЯ ТУТ: читаем прямо в src. 
            // OpenCV.js сам изменит размер src под текущий кадр видео.
            cap.read(src); 

            if (src.empty()) {
                requestAnimationFrame(processVideo);
                return;
            }

            // Теперь src гарантированно имеет нужный размер
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.medianBlur(gray, gray, 5);

            // Поиск кругов
            // Параметры: (вход, выход, метод, dp, min_dist, canny_threshold, circle_threshold, min_r, max_r)
            cv.HoughCircles(gray, circles, cv.HOUGH_GRADIENT, 1, 200, 50, 40, 100, 300);

            // Рисуем результат
            for (let i = 0; i < circles.cols; ++i) {
                let x = circles.data32F[i * 3];
                let y = circles.data32F[i * 3 + 1];
                let r = circles.data32F[i * 3 + 2];
                cv.circle(src, new cv.Point(x, y), r, [0, 255, 0, 255], 3);
            }

            cv.imshow('output-canvas', src);
            requestAnimationFrame(processVideo);

        } catch (err) {
            console.error("Ошибка в цикле:", err);
            // Если упало, ждем секунду и пробуем снова
            //src = new cv.Mat(video.videoHeight, video.videoWidth, cv.CV_8UC4);
            setTimeout(processVideo, 1000);
        }
    }
    processVideo();
}