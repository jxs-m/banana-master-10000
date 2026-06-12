// --- CONFIGURAÇÃO E ELEMENTOS PRINCIPAIS ---
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const messageOverlay = document.getElementById('messageOverlay');
const messageText = document.getElementById('messageText');
const wormhole = document.getElementById('wormhole');

let attempts = 5;
let canClick = false;
let isRunning = false;
let isFixed = false;
let clickedFleeing = false;

// --- GERENCIADOR DE ÁUDIO SINTETIZADO (WEB AUDIO API) ---
let audioCtx = null;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playLaserSound() {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
}

function playExplosionSound() {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(10, audioCtx.currentTime + 0.35);
        
        gainNode.gain.setValueAtTime(0.25, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
    } catch(e) {}
}

function playR2D2Sound() {
    if (!audioCtx) return;
    try {
        const now = audioCtx.currentTime;
        playTone(1050, 0.05, now, 0.08);
        playTone(1450, 0.06, now + 0.05, 0.06);
    } catch(e) {}
}

function playTone(freq, duration, startTime, vol) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);
    gainNode.gain.setValueAtTime(vol, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
}

// --- CONTROLE DE MOVIMENTAÇÃO DO BOTÃO "NÃO" ---
document.addEventListener('mousemove', function(e) {
    if (canClick) return;

    const noBtnRect = noBtn.getBoundingClientRect();
    const yesBtnRect = yesBtn.getBoundingClientRect();
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const noCenterX = noBtnRect.left + noBtnRect.width / 2;
    const noCenterY = noBtnRect.top + noBtnRect.height / 2;

    const distanceToMouse = Math.sqrt(
        Math.pow(mouseX - noCenterX, 2) + 
        Math.pow(mouseY - noCenterY, 2)
    );

    if (distanceToMouse < 90 && !isRunning) {
        isRunning = true;
        
        if (!isFixed) {
            noBtn.style.position = 'fixed';
            isFixed = true;
        }
        
        if (attempts > 0) {
            moveNoAway(yesBtnRect);
            setTimeout(() => {
                attempts--;
                isRunning = false;
            }, 500);
        } else {
            startFleeingToWormhole();
        }
    }
});

function moveNoAway(yesBtnRect) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const btnWidth = noBtn.offsetWidth;
    const btnHeight = noBtn.offsetHeight;
    
    let newTop, newLeft;
    let attemptsMove = 0;
    let validPosition = false;
    
    while (!validPosition && attemptsMove < 50) {
        newTop = Math.random() * (screenHeight - btnHeight - 60) + 30;
        newLeft = Math.random() * (screenWidth - btnWidth - 60) + 30;
        
        const yesCenterX = yesBtnRect.left + yesBtnRect.width / 2;
        const yesCenterY = yesBtnRect.top + yesBtnRect.height / 2;
        
        const distToYes = Math.sqrt(
            Math.pow((newLeft + btnWidth/2) - yesCenterX, 2) + 
            Math.pow((newTop + btnHeight/2) - yesCenterY, 2)
        );
        
        if (distToYes > 160) {
            validPosition = true;
        }
        attemptsMove++;
    }
    
    noBtn.style.top = newTop + 'px';
    noBtn.style.left = newLeft + 'px';
}

// --- SEQUÊNCIA DO BURACO DE MINHOCA ---
function startFleeingToWormhole() {
    canClick = true;
    initAudio();
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    const whWidth = 120;
    const whHeight = 120;
    
    // Posiciona o buraco de minhoca no canto inferior direito
    const whLeft = screenWidth - whWidth - 60;
    const whTop = screenHeight - whHeight - 60;
    
    wormhole.style.left = whLeft + 'px';
    wormhole.style.top = whTop + 'px';
    wormhole.classList.remove('hidden');
    
    // Efeito visual de tremor no portal
    wormhole.style.transform = 'scale(0.8)';
    setTimeout(() => {
        wormhole.style.transform = 'scale(1)';
    }, 150);
    
    // Prepara a fuga do botão para dentro do buraco
    noBtn.style.transition = 'top 2.5s cubic-bezier(0.25, 0.1, 0.25, 1), left 2.5s cubic-bezier(0.25, 0.1, 0.25, 1), transform 2.5s ease, opacity 2.5s ease';
    
    // Slide e encolhimento do botão
    setTimeout(() => {
        noBtn.style.left = (whLeft + whWidth/2 - noBtn.offsetWidth/2) + 'px';
        noBtn.style.top = (whTop + whHeight/2 - noBtn.offsetHeight/2) + 'px';
        noBtn.style.transform = 'scale(0.05) rotate(720deg)';
        noBtn.style.opacity = '0.1';
    }, 50);
    
    // Captura clique no botão em movimento
    noBtn.onclick = function() {
        if (clickedFleeing) return;
        clickedFleeing = true;
        triggerMiniGamesSequence();
    };
    
    // Permite clicar no próprio buraco para segui-lo
    wormhole.onclick = function() {
        if (clickedFleeing) return;
        clickedFleeing = true;
        triggerMiniGamesSequence();
    };
    
    // Após sumir no buraco, se o usuário não clicou a tempo, avisa para clicar no buraco
    setTimeout(() => {
        if (!clickedFleeing) {
            noBtn.style.display = 'none';
            wormhole.style.boxShadow = '0 0 45px var(--neon-red), inset 0 0 30px var(--neon-red)';
            
            const prompt = document.createElement('div');
            prompt.id = 'follow-prompt';
            prompt.innerText = 'SIGA O BOTÃO PELO BURACO!';
            prompt.style.position = 'fixed';
            prompt.style.left = (whLeft - 60) + 'px';
            prompt.style.top = (whTop - 35) + 'px';
            prompt.style.color = 'var(--neon-red)';
            prompt.style.fontFamily = "'Orbitron', sans-serif";
            prompt.style.fontSize = '0.9rem';
            prompt.style.textShadow = '0 0 8px var(--neon-red)';
            prompt.style.zIndex = '60';
            prompt.style.animation = 'pulseText 1s infinite alternate';
            
            // Adiciona keyframe dinâmico para o texto do prompt
            if (!document.getElementById('prompt-style')) {
                const style = document.createElement('style');
                style.id = 'prompt-style';
                style.innerHTML = `@keyframes pulseText { from { opacity: 0.6; } to { opacity: 1; } }`;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(prompt);
        }
    }, 2500);
}

function triggerMiniGamesSequence() {
    wormhole.classList.add('hidden');
    noBtn.style.display = 'none';
    const prompt = document.getElementById('follow-prompt');
    if (prompt) prompt.remove();
    
    // Inicia os mini-jogos
    onNoClicked();
}

// --- ACIONAMENTO DOS MINI-JOGOS ---
function onNoClicked() {
    // Permite acionar apenas se puder clicar (ex: passou a fase do buraco)
    if (!canClick) return;
    
    let currentTrap = parseInt(localStorage.getItem('currentTrap') || '1');
    
    if (currentTrap === 1) {
        startMiniGame1();
        localStorage.setItem('currentTrap', '2');
    } else if (currentTrap === 2) {
        startMiniGame2();
        localStorage.setItem('currentTrap', '3');
    } else {
        localStorage.setItem('currentTrap', '1');
        returnToMain();
    }
}

// --- MINI-JOGO 1: ESQUIVA DE DISPAROS (CANVAS) ---
const game1 = document.getElementById('game1');
const gameArea1 = document.getElementById('gameArea1');
const canvas = document.getElementById('dodgeCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = false;
let lasers = [];
let lastFireTime = 0;
let fireInterval = 1100; // ms
let lasersDodged = 0;
const targetDodges = 5;

let player = {
    x: 45,
    y: 150,
    width: 28,
    height: 18,
    targetY: 150,
    speed: 6.5
};

let enemy = {
    x: 445,
    y: 150,
    width: 28,
    height: 32
};

let keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    player.targetY = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const scaleY = canvas.height / rect.height;
        player.targetY = (e.touches[0].clientY - rect.top) * scaleY;
    }
}, { passive: true });

let canvasStars = [];
function initCanvasStars() {
    canvasStars = [];
    for (let i = 0; i < 20; i++) {
        canvasStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.5,
            speed: 0.5 + Math.random() * 1.5
        });
    }
}

function drawCanvasStars() {
    ctx.fillStyle = '#ffffff';
    canvasStars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
        ctx.fillRect(star.x, star.y, star.size, star.size);
    });
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Fogo da turbina
    const flameSize = 7 + Math.random() * 5;
    ctx.fillStyle = '#00f3ff';
    ctx.beginPath();
    ctx.moveTo(-14, -2.5);
    ctx.lineTo(-14 - flameSize, 0);
    ctx.lineTo(-14, 2.5);
    ctx.closePath();
    ctx.fill();
    
    // Asas
    ctx.strokeStyle = '#a0a0a0';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.lineTo(-14, -10);
    ctx.lineTo(-4, -10);
    ctx.lineTo(4, -2);
    ctx.closePath();
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(-9, 2);
    ctx.lineTo(-14, 10);
    ctx.lineTo(-4, 10);
    ctx.lineTo(4, 2);
    ctx.closePath();
    ctx.fillStyle = '#e0e0e0';
    ctx.fill();
    ctx.stroke();
    
    // Fuselagem
    ctx.fillStyle = '#e0e0e0';
    ctx.strokeStyle = '#808080';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Cockpit
    ctx.fillStyle = 'rgba(0, 243, 255, 0.75)';
    ctx.beginPath();
    ctx.ellipse(2, -1.8, 4.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Canhões Laser
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(-4, -11, 10, 1.2);
    ctx.fillRect(-4, 10, 10, 1.2);
    
    ctx.restore();
}

function drawEnemy() {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
    // Painéis solares (TIE Fighter)
    ctx.fillStyle = '#1e1e1e';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(-8, -18);
    ctx.lineTo(-12, -13);
    ctx.lineTo(-12, 13);
    ctx.lineTo(-8, 18);
    ctx.lineTo(-4, 13);
    ctx.lineTo(-4, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(8, -18);
    ctx.lineTo(4, -13);
    ctx.lineTo(4, 13);
    ctx.lineTo(8, 18);
    ctx.lineTo(12, 13);
    ctx.lineTo(12, -13);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Eixos
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.stroke();
    
    // Cabine
    ctx.fillStyle = '#2d2d2d';
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Janela
    ctx.fillStyle = 'rgba(255, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.arc(-1.5, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function fireLaser() {
    let laserSpeed = 5.2 + Math.random() * 2.2;
    lasers.push({
        x: enemy.x - 12,
        y: enemy.y,
        width: 14,
        height: 3,
        speed: laserSpeed
    });
    playLaserSound();
}

function drawLasers() {
    lasers.forEach(laser => {
        ctx.save();
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 6;
        ctx.fillRect(laser.x, laser.y - laser.height/2, laser.width, laser.height);
        ctx.restore();
    });
}

function checkLaserCollision(laser, plyr) {
    const plyrLeft = plyr.x - plyr.width/2;
    const plyrRight = plyr.x + plyr.width/2;
    const plyrTop = plyr.y - plyr.height/2;
    const plyrBottom = plyr.y + plyr.height/2;
    
    return laser.x < plyrRight &&
           laser.x + laser.width > plyrLeft &&
           laser.y < plyrBottom &&
           laser.y + laser.height > plyrTop;
}

function handlePlayerHit() {
    playExplosionSound();
    
    const area = document.getElementById('gameArea1');
    area.style.borderColor = 'white';
    area.style.background = 'rgba(255, 0, 0, 0.45)';
    setTimeout(() => {
        area.style.borderColor = '';
        area.style.background = '';
    }, 150);
    
    lasers = [];
    lasersDodged = 0;
    lastFireTime = Date.now() + 500;
    updateScoreUI();
}

function updateScoreUI() {
    const scoreVal = Math.max(0, targetDodges - lasersDodged);
    document.getElementById('score1').innerText = 'Disparos restantes: ' + scoreVal;
}

function handleVictory() {
    gameRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    closeGame(1);
    finishGame(true);
}

function updateDodgeGame() {
    if (!gameRunning) return;
    
    const diff = player.targetY - player.y;
    player.y += diff * 0.18;
    
    if (keys['ArrowUp'] || keys['KeyW']) {
        player.targetY = Math.max(player.height/2, player.targetY - player.speed);
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        player.targetY = Math.min(canvas.height - player.height/2, player.targetY + player.speed);
    }
    
    player.y = Math.max(player.height/2, Math.min(canvas.height - player.height/2, player.y));
    
    enemy.y = 150 + Math.sin(Date.now() * 0.0035) * 95;
    
    const now = Date.now();
    if (now - lastFireTime > fireInterval) {
        fireLaser();
        lastFireTime = now;
    }
    
    for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.x -= laser.speed;
        
        if (checkLaserCollision(laser, player)) {
            handlePlayerHit();
            return;
        }
        
        if (laser.x + laser.width < 0) {
            lasers.splice(i, 1);
            lasersDodged++;
            playR2D2Sound();
            updateScoreUI();
            
            if (lasersDodged >= targetDodges) {
                handleVictory();
                return;
            }
        }
    }
}

let animationFrameId = null;
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvasStars();
    updateDodgeGame();
    drawPlayer();
    drawEnemy();
    drawLasers();
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

function startMiniGame1() {
    initAudio();
    initCanvasStars();
    lasers = [];
    lasersDodged = 0;
    updateScoreUI();
    player.y = canvas.height / 2;
    player.targetY = canvas.height / 2;
    lastFireTime = Date.now() + 800;
    gameRunning = true;
    game1.classList.add('active');
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop();
}

// --- MINI-JOGO 2: BOTÃO RESISTIR ---
let resistClicks = 0;
const game2 = document.getElementById('game2');

function startMiniGame2() {
    resistClicks = 0;
    document.getElementById('counter2').innerText = 'Força restante: 10';
    game2.classList.add('active');
}

function surviveGame() {
    initAudio();
    playLaserSound(); // Som curto de clique de feedback
    
    resistClicks++;
    const remaining = 10 - resistClicks;
    document.getElementById('counter2').innerText = 'Força restante: ' + remaining;
    
    if (resistClicks >= 10) {
        closeGame(2);
        finishGame(true);
    }
}

// --- FLUXO GERAL E ENCERRAMENTO ---
function closeGame(id) {
    if (id === 1) {
        gameRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        game1.classList.remove('active');
    }
    if (id === 2) game2.classList.remove('active');
}

function returnToMain() {
    closeGame(1);
    closeGame(2);
    
    // Reseta o estado do botão Não e o buraco de minhoca
    attempts = 5;
    canClick = false;
    isRunning = false;
    isFixed = false;
    clickedFleeing = false;
    
    noBtn.style.display = '';
    noBtn.style.position = 'relative';
    noBtn.style.top = '';
    noBtn.style.left = '';
    noBtn.style.transform = '';
    noBtn.style.opacity = '';
    noBtn.style.transition = '';
    noBtn.onclick = onNoClicked;
    
    const prompt = document.getElementById('follow-prompt');
    if (prompt) prompt.remove();
    wormhole.classList.add('hidden');
}

function finishGame(won) {
    if (won) {
        closeGame(1);
        closeGame(2);
        document.getElementById('successScreen').classList.add('active');
    }
}