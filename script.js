// The variable that cannot be changed...
const dev = "ahmo"

// Değişkenleeeeeeeeeeeer
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const backBtn = document.getElementById('backBtn');
const checkBtn = document.getElementById('checkBtn');
const includeAbs = document.getElementById('includeAbs');
const guessInput = document.getElementById('guessInput');
const messageBox = document.getElementById('messageBox');
const scoreEl = document.getElementById('score');
const Y_LIMIT = 10;
const X_LIMIT = 15;
let minScale = 0;
let currentFunctionStr = "";
let score = 0;
let scale = 30;
let offsetX, offsetY;

startBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', showMenu);
checkBtn.addEventListener('click', checkAnswer);

// fonksiyonlara bayılıyorum
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = Math.min(window.innerWidth - 40, 600);
    const logicalHeight = 400;

    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    ctx.scale(dpr, dpr);

    const scaleY = logicalHeight / (Y_LIMIT * 2);
    const scaleX = logicalWidth / (X_LIMIT * 2);
    
    minScale = Math.max(scaleY, scaleX);

    if (scale < minScale) scale = minScale;
    offsetX = logicalWidth / 2;
    offsetY = logicalHeight / 2;

    if(!menuScreen.classList.contains('hidden')) return;
    drawScene();
}
window.addEventListener('resize', resizeCanvas);



function showMenu() {
    gameScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

function startGame() {
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    resizeCanvas();
    score = 0;
    scoreEl.innerText = score;
    generateNewLevel();
}

function generateNewLevel() {
    const types = ['linear'];
    if (includeAbs.checked) types.push('abs');

    const type = types[Math.floor(Math.random() * types.length)];

    const a = (Math.floor(Math.random() * 3) + 1) * (Math.random() < 0.5 ? 1 : -1);
    const b = Math.floor(Math.random() * 5) * (Math.random() < 0.5 ? 1 : -1);

    currentParams = { type, a, b };

    if (type === 'linear') {
        currentFunctionStr = `${a}x + ${b}`;
    } else if (type === 'abs') {
        currentFunctionStr = `${a} * abs(x + ${b})`;
    }

    if (typeof aiOutput !== 'undefined') {
        aiOutput.innerHTML = ""; 
        aiBtn.innerHTML = '<span class="sparkle">✨</span> AI İpucu İste'; 
        aiBtn.disabled = false; 
    }

    guessInput.value = "";
    messageBox.innerText = "";
    messageBox.className = "message";

    console.log("Hedef: ", currentFunctionStr);

    drawScene();
}



function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    drawFunction(currentFunctionStr, '#00a8ff', 4);
}

function drawGrid() {
    ctx.beginPath();
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#888';
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.moveTo(0, offsetY);
    ctx.lineTo(canvas.width, offsetY);

    // hah! baba for döngüsü de yazıyor :) 
    for (let i = -X_LIMIT; i <= X_LIMIT; i++) {
        if (i === 0) continue;
        const xPos = offsetX + (i * scale);

        if (xPos < 0 || xPos > canvas.width) continue;

        ctx.moveTo(xPos, 0);
        ctx.lineTo(xPos, canvas.height);

        ctx.fillText(i, xPos, offsetY + 15);
    }

    ctx.moveTo(offsetX, 0);
    ctx.lineTo(offsetX, canvas.height);

    for (let i = -Y_LIMIT; i <= Y_LIMIT; i++) {
        if (i === 0) continue;
        const yPos = offsetY - (i * scale);
        
        if (yPos < 0 || yPos > canvas.height) continue;

        ctx.moveTo(0, yPos);
        ctx.lineTo(canvas.width, yPos);

        ctx.fillText(i, offsetX + 15, yPos);
    }

    ctx.stroke();
}

// fonskiyon çizen fonksiyon... AI olmasa hayatta böyle matematik yapamazdım sanırım. insanlar neler buluyor be...
function drawFunction(expr, color, width) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    let firstPoint = true;
    // bu ne mesela bunu kim nasıl bulmuş aşırı havalı bir şeye benziyor
    for (let xPixel = 0; xPixel < canvas.width; xPixel++) {
        const xMath = (xPixel - offsetX) / scale;
        try {
            const yMath = math.evaluate(expr, { x: xMath });
            const yPixel = offsetY - (yMath * scale);

            if (firstPoint) {
                ctx.moveTo(xPixel, yPixel);
                firstPoint = false;
            } else {
                ctx.lineTo(xPixel, yPixel);
            }
        } catch (e) {}
    }
    ctx.stroke();
}



function checkAnswer() {
    const userGuess = guessInput.value;

    if (!userGuess) {
        // bu da uyanıklara gelsin
        showMessage("Boş bırakmak yooook...", "error");
        return;
    }
    // mutlak değer yazarken abs() gerekiyordu, düzelttim.
    const cleanedGuess = userGuess.replace(/\|([^|]+)\|/g, 'abs($1)');

    try {
        let isCorrect = true;
        for (let x = -5; x <= 5; x++) {
            const targetY = math.evaluate(currentFunctionStr, { x: x });
            const userY = math.evaluate(cleanedGuess, { x: x });

            if (Math.abs(targetY - userY) > 0.01) {
                isCorrect = false;
                break;
            }
            
        }

        if (isCorrect) {
            // helal, ben yapamazdım
            showMessage("Helal olsun, ben yapamazdım.", "success");
            score += 10;
            scoreEl.innerText = score;
            drawFunction(cleanedGuess, '#4cd137', 2);

            setTimeout(generateNewLevel, 2000);
        } else {
            // PUHAHAHAHAHAHAHAHAHAHAAHAH 
            showMessage("Yanlış, Caner Hoca'yı dinlemeliydin.", "error");
            drawFunction(cleanedGuess, '#e84118', 2);
            setTimeout(drawScene, 1500);
        }

    } catch (err) {
        showMessage("Geçersiz fonksiyon formatı!", "error");
    }
}

function showMessage(text, type) {
    messageBox.innerText = text;
    messageBox.className = `message ${type}`;
}

resizeCanvas();



let isDragging = false;
let startX, startY;
let lastTouchDist = 0;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    canvas.style.cursor = 'grabbing';
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    offsetX += dx;
    offsetY += dy;

    clampView()

    startX = e.clientX;
    startY = e.clientY;

    drawScene();
});

window.addEventListener('mouseup', stopDrag);
canvas.addEventListener('mouseleave', stopDrag);

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    const zoomIntensity = 0.1;
    const direction = e.deltaY < 0 ? 1 : -1;

    scale = scale * (1 + direction * zoomIntensity);

    clampView();

    drawScene();
}, { passive: false });


canvas.addEventListener('touchstart', (e) => {
    if(e.cancelable) e.preventDefault();

    if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        lastTouchDist = getTouchDistance(e.touches);
    }
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    if(e.cancelable) e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
        const dx = e.touches[0].clientX - startX;
        const dy = e.touches[0].clientY - startY;

        offsetX += dx;
        offsetY += dy;

        clampView(); 

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        drawScene();
    } else if (e.touches.length === 2) {
        const currentDist = getTouchDistance(e.touches);

        if (lastTouchDist > 0) {
            const ratio = currentDist / lastTouchDist;

            scale = scale * ratio;

            clampView();

            drawScene();
        }
        lastTouchDist = currentDist;
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    isDragging = false;
    lastTouchDist = 0;
});

function stopDrag() {
    isDragging = false;
    canvas.style.cursor = 'crosshair';
}

function getTouchDistance(touches) {
    const t1 = touches[0];
    const t2 = touches[1];

    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;

    return Math.sqrt(dx * dx + dy * dy);
}

function clampView() {
    if (scale < minScale) {
        scale = minScale;
    }
    if (scale > 150) {
        scale = 150;
    }

    const height = canvas.height / (window.devicePixelRatio || 1);
    const width = canvas.width / (window.devicePixelRatio || 1);

    const topLimit = 0;
    const bottomLimit = height;

    let y10_Pixel = offsetY - (Y_LIMIT * scale);
    if (y10_Pixel > topLimit) {
        offsetY = topLimit + (Y_LIMIT * scale);
    }

    let yMinus10_Pixel = offsetY - (-Y_LIMIT * scale);
    if (yMinus10_Pixel < bottomLimit) {
        offsetY = bottomLimit + (-Y_LIMIT * scale);
    }

    const leftLimit = 0;
    const rightLimit = width;

    let xMin_Pixel = offsetX + (-X_LIMIT * scale);
    if (xMin_Pixel > leftLimit) {
        offsetX = leftLimit - (-X_LIMIT * scale);
    }

    let xMax_Pixel = offsetX + (X_LIMIT * scale);
    if (xMax_Pixel < rightLimit) {
        offsetX = rightLimit - (X_LIMIT * scale);
    }
}

// fake AI part

let currentParams = {}; 

const aiBtn = document.getElementById('aiBtn');
const aiOutput = document.getElementById('aiOutput');

aiBtn.addEventListener('click', askAI);

function askAI() {
    if (aiOutput.innerText.length > 0) return;

    aiBtn.disabled = true;
    aiBtn.innerHTML = "Analiz ediliyor...";
    
    setTimeout(() => {
        const hint = generateHintText();
        typeWriterEffect(hint);
        
        aiBtn.innerHTML = '<span class="sparkle">✨</span> AI İpucu İste';
        aiBtn.disabled = false;
    }, 800); 
}

function generateHintText() {
    const { type, a, b } = currentParams;
    let messages = [];

    const openers = ["Hmm, grafiğe bakınca şunu görüyorum: ", "Verileri analiz ettim: ", "Dikkatli bakarsan: "];
    const opener = openers[Math.floor(Math.random() * openers.length)];

    if (type === 'linear') {
        
        if (a > 0) messages.push("Grafik soldan sağa yükseliyor, yani eğim pozitif.");
        else messages.push("Grafik aşağı doğru iniyor, yani eğim negatif.");
        
        if (Math.abs(a) > 2) messages.push("Oldukça dik bir yokuş var, katsayı büyük olmalı.");
        
        if (b > 0) messages.push(`Y eksenini pozitif tarafta, tam ${b} noktasında kesiyor.`);
        else if (b < 0) messages.push(`Y eksenini aşağıda, ${b} noktasında kesiyor.`);
        else messages.push("Tam merkezden (orijinden) geçiyor.");

    } else if (type === 'abs') {
        
        if (a > 0) messages.push("Bu bir 'V' şekli ve yukarı bakıyor.");
        else messages.push("Bu ters bir 'V' şekli, aşağı bakıyor.");

        if (b > 0) messages.push(`Grafik sola doğru, ${b} birim kaymış.`); 
        else if (b < 0) messages.push(`Grafik sağa doğru, ${Math.abs(b)} birim kaymış.`); 
        else messages.push("Grafik tam ortada, sağa sola kaymamış.");
    }

    return opener + messages.join(" ");
}

function typeWriterEffect(text) {
    aiOutput.innerHTML = "";
    let i = 0;
    const speed = 30; 

    function type() {
        if (i < text.length) {
            aiOutput.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            aiOutput.innerHTML += '<span class="cursor-blink">|</span>';
        }
    }
    type();
}
