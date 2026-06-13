        // SPA Router
        window.goToPhase = function(phaseId) {
            // Stop running loops
            if (window.f1StartGame) {
                // We should stop F1 loop when switching away.
                // We'll set a running = false if accessible, but for now f1StartGame handles setup.
            }
            
            document.querySelectorAll('.spa-screen').forEach(el => el.classList.remove('active'));
            document.getElementById('screen-' + phaseId).classList.add('active');
            
            // Trigger specific init functions if needed
            if(phaseId === 'fase1') {
                if(window.f1StartGame) {
                    window.f1StartGame();
                }
            }
            if(phaseId === 'fase2') {
                if(window.f2StartGame) {
                    window.f2StartGame();
                }
            }
            if(phaseId === 'fase3') {
                // Try to click the play button in fase3 automatically or just let the user see the start screen of fase3
                // F3 start-screen is visible by default
            }
        };

        // F0 JS
        (function(){ 
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
    
    // Inicia diretamente a Fase 1
    window.goToPhase('fase1');
}

// --- ACIONAMENTO DOS MINI-JOGOS ---
function onNoClicked() {
    // Permite acionar apenas se puder clicar (ex: passou a fase do buraco)
    if (!canClick) return;
    
    startMiniGame1();
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


// --- FLUXO GERAL E ENCERRAMENTO ---
function closeGame(id) {
    if (id === 1) {
        gameRunning = false;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        game1.classList.remove('active');
    }
}

function returnToMain() {
    closeGame(1);
    
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
        document.getElementById('successScreen').classList.add('active');
    }
}
 })();

        // F1 JS
        (function(){ 
const wrap = document.getElementById('f1-wrap');
const gc = document.getElementById('f1-gc');
const ctrls = document.getElementById('f1-ctrls');
const clbl = document.getElementById('f1-clbl');
const ctx = gc.getContext('2d');

// --- ESPAÇO PARA SPRITES (IMAGENS) ---
const playerSprite = new Image();
playerSprite.src = 'fase1/naveplayer.png'; 

const enemySprite = new Image();
enemySprite.src = 'fase1/naveinimiga.png';

let playerSpriteLoaded = false;
let enemySpriteLoaded = false;
playerSprite.onload = () => playerSpriteLoaded = true;
enemySprite.onload = () => enemySpriteLoaded = true;

// CONFIGURAÇÃO DE ROTAÇÃO DA SUA IMAGEM:
const SPRITE_ROTATION = -90 * Math.PI / 180; 
// -------------------------------------

let W, H;
function resize(){
    W = window.innerWidth;
    const controlsHeight = ctrls.offsetHeight + clbl.offsetHeight;
    H = window.innerHeight - controlsHeight;

    gc.width = W;
    gc.height = H;
    LANE_X = W / 2 - LANE_W / 2;
}

const WORLD_H = 8000;
const LANE_W = Math.min(280, W * 0.8 || 280);
let LANE_X = 0;

const keys = {ArrowUp:0,ArrowDown:0,ArrowLeft:0,ArrowRight:0};
document.addEventListener('keydown', e => { if(e.key in keys) { keys[e.key]=1; e.preventDefault(); } });
document.addEventListener('keyup', e => { if(e.key in keys) keys[e.key]=0; });

function bindBtn(id, k){
  const b = document.getElementById(id);
  ['mousedown','touchstart'].forEach(ev => b.addEventListener(ev, e => { keys[k]=1; e.preventDefault(); }, {passive:false}));
  ['mouseup','mouseleave','touchend','touchcancel'].forEach(ev => b.addEventListener(ev, () => keys[k]=0));
}
bindBtn('f1-bl','ArrowLeft'); bindBtn('f1-br','ArrowRight'); bindBtn('f1-bu','ArrowUp'); bindBtn('f1-bd','ArrowDown');

let running = false;
let camY = 0;
let player, bullets, enemies, meteors, particles, explosions;
let lives, invincible, invTimer, gameOver, won;
const FINISH_Y = 200;

let naoBlock;
let cutscene = false;
let playerFly = false; 
let planet = { x: 0, y: 0, r: 100, targetR: 100, appeared: false }; 

let stars = [];
function initStars(){
  stars = [];
  for(let i=0; i<600; i++) stars.push({x:Math.random()*W, y:Math.random()*WORLD_H, r:Math.random()*1.4+0.4, b:Math.random()*0.8+0.2});
}

function initGame(){
  lives = 3; invincible = false; invTimer = 0; gameOver = false; won = false;
  cutscene = false;
  playerFly = false;
  document.getElementById('f1-cutsceneOverlay').style.display = 'none';

  camY = WORLD_H - H;
  player = {x:W/2, y:camY + H - 80, vx:0, vy:0, w:36, h:36, alive:true, trail:[]};
  bullets = []; explosions = []; particles = []; meteors = [];

  naoBlock = {
    x: W / 2,
    y: camY + 90, 
    w: 70,
    h: 35,
    angle: 0,
    rot: 0 
  };

  planet.appeared = false;
  planet.r = 20;       
  planet.targetR = 110; 

  const enemyY = camY + 150;
  
  enemies = [
    {x:W/2-60, y:enemyY, vx: 1.2, w:38, h:38, fireTimer: 400 + Math.random()*400, col:'#ff3333'},
    {x:W/2+60, y:enemyY, vx: -1.5, w:38, h:38, fireTimer: 1100 + Math.random()*400, col:'#ff6633'},
    {x:W/2,    y:enemyY, vx: 1.8, w:38, h:38, fireTimer: 1800 + Math.random()*500, col:'#ff3366'},
  ];
  initStars();
  meteorTimer = 1000;
}

function spawnMeteor(){
  if(cutscene) return; 
  meteors.push({
    x: LANE_X + 15 + Math.random() * (LANE_W - 30), 
    y: camY - 80, 
    vy: 1.2 + Math.random() * 0.8,
    r: 10 + Math.random() * 14,
    rot: Math.random() * Math.PI * 2,
    rotSpd: (Math.random()-0.5) * 0.05,
    alive: true
  });
}

function spawnParticles(x,y,col,n){
  for(let i=0; i<n; i++){
    const ang = Math.random() * Math.PI * 2;
    const spd = 1 + Math.random() * 3;
    particles.push({x,y, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, r:1.5+Math.random()*2, life:1, col:col||'#ff3333'});
  }
}

function spawnExplosion(x,y,big){
  const n = big ? 40 : 18;
  spawnParticles(x,y,'#ff5555',Math.floor(n*0.5));
  spawnParticles(x,y,'#ffffff',Math.floor(n*0.3));
  spawnParticles(x,y,'#ffaa44',Math.floor(n*0.2));
}

function fireEnemy(e){
  if(cutscene) return; 
  const angle = (Math.random() - 0.5) * 0.2;
  const spd = 6.5; 
  bullets.push({
    x: e.x, 
    y: e.y + 15, 
    vx: Math.sin(angle) * 1.0, 
    vy: spd, 
    w: 3,   
    h: 14,  
    alive: true
  });
}

function updatePlayer(dt){
  const f = dt / 16;
  
  if (cutscene) {
    if (playerFly) {
      player.vx *= 0.9;
      player.x += (W/2 - player.x) * 0.08 * f;
      player.y -= 7.0 * f; 
    } else {
      player.vx *= 0.8; player.vy *= 0.8;
      player.x += player.vx * f; player.y += player.vy * f;
    }
  } else {
    const ax = keys.ArrowLeft ? -5 : keys.ArrowRight ? 5 : 0;
    const ay = keys.ArrowUp ? -4 : keys.ArrowDown ? 4 : 0;
    player.vx += (ax - player.vx) * 0.3 * f;
    player.vy += (ay - player.vy) * 0.3 * f;
    
    player.x = Math.max(LANE_X + 16, Math.min(LANE_X + LANE_W - 16, player.x + player.vx * f));
    player.y = Math.max(camY + 20, Math.min(camY + H - 20, player.y + player.vy * f));
  }
  
  player.trail.push({x:player.x, y:player.y, a:1});
  if(player.trail.length > 12) player.trail.shift();
  player.trail.forEach(p => p.a = Math.max(0, p.a - 0.09));
  
  if(invincible) { invTimer -= dt; if(invTimer <= 0) invincible = false; }
}

function updateEnemies(dt){
  const f = dt / 16;
  const scrollSpd = getScrollSpd();
  
  enemies.forEach(e => {
    e.y -= scrollSpd * f;

    if (!cutscene) {
      e.x += e.vx * f;
      const minX = LANE_X + e.w/2; 
      const maxX = LANE_X + LANE_W - e.w/2;
      
      if (e.x < minX || e.x > maxX) {
        e.vx *= -1; 
        e.x = Math.max(minX, Math.min(maxX, e.x)); 
      }
    }

    e.fireTimer -= dt;
    if(e.fireTimer <= 0){
      fireEnemy(e);
      e.fireTimer = 1600 + Math.random() * 700;
    }
  });
}

function getScrollSpd(){
  if (cutscene) return 0; 
  return 2.5 + Math.max(0, (WORLD_H - camY) / WORLD_H) * 2;
}

function updateBullets(dt){
  const f = dt / 16;
  bullets.forEach(b => {
    b.x += b.vx * f; b.y += b.vy * f;
    if(b.y > camY + H + 40 || b.y < camY - 40 || b.x < 0 || b.x > W) b.alive = false;
    
    if(!invincible && b.alive){
      const dx = Math.abs(b.x - player.x);
      const dy = Math.abs(b.y - player.y);
      if(dx < 14 && dy < 16){
        b.alive = false;
        hitPlayer(b.x, b.y);
      }
    }
  });
  bullets = bullets.filter(b => b.alive);
}

function updateMeteors(dt){
  const f = dt / 16;
  meteors.forEach(m => {
    m.y += m.vy * f; m.rot += m.rotSpd * f;
    if(m.y > camY + H + 80) m.alive = false;
    
    if(m.alive && !invincible){
      const dx = m.x - player.x, dy = m.y - player.y;
      if(Math.sqrt(dx*dx + dy*dy) < m.r + 14){
        m.alive = false;
        spawnExplosion(m.x, m.y, false);
        hitPlayer(m.x, m.y);
      }
    }
  });
  meteors = meteors.filter(m => m.alive);
}

function updateParticles(dt){
  const f = dt / 16;
  particles.forEach(p => { p.x += p.vx*f; p.y += p.vy*f; p.life -= 0.04*f; p.vx*=0.97; p.vy*=0.97; });
  particles = particles.filter(p => p.life > 0);
}

function hitPlayer(hx,hy){
  if(invincible || cutscene) return;
  spawnExplosion(hx||player.x, hy||player.y, false);
  lives--;
  if(lives <= 0){
    spawnExplosion(player.x, player.y, true);
    endGame(false);
  } else {
    invincible = true; invTimer = 2000;
  }
}

function endGame(pw){
  running = false; won = pw;
  document.getElementById('f1-cutsceneOverlay').style.display = 'none';
  const go = document.getElementById('f1-gameover');
  document.getElementById('f1-goTitle').textContent = pw ? 'SUCESSO!' : 'FIM DE JOGO';
  document.getElementById('f1-goTitle').style.color = pw ? '#10b981' : '#f55';
  document.getElementById('f1-goMsg').textContent = pw ? 'Você está quase pegando ele Jedi!.' : 'Sua nave foi desintegrada pelos lasers inimigos!';
  document.getElementById('f1-naoBtn').style.display = pw ? 'inline-block' : 'none';
  go.style.display = 'flex';
}

window.f1RestartGame = function(){
  document.getElementById('f1-gameover').style.display = 'none';
  initGame(); running = true; last = 0; requestAnimationFrame(loop);
};

function drawBg(){
  ctx.fillStyle = '#000000'; ctx.fillRect(0,0,W,H);
  
  stars.forEach(st => {
    const sy = st.y - camY;
    if(sy < -4 || sy > H + 4) return;
    ctx.beginPath(); ctx.arc(st.x, sy, st.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255, 255, 255, ${st.b})`; ctx.fill();
  });

  planet.x = W / 2;
  planet.y = camY + 160; 

  if(planet.appeared) {
    ctx.save();
    let pGrad = ctx.createRadialGradient(planet.x - planet.r*0.2, planet.y - planet.r*0.2, planet.r*0.1, planet.x, planet.y, planet.r);
    pGrad.addColorStop(0, '#3a3a44');
    pGrad.addColorStop(0.7, '#1a1a22');
    pGrad.addColorStop(1, '#050508');
    ctx.beginPath(); ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI*2);
    ctx.fillStyle = pGrad; ctx.fill();
    ctx.beginPath(); ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
}

function drawTrack(){
  if(cutscene) return; 
  const top = 0, bot = H;
  ctx.fillStyle = 'rgba(50, 50, 55, 0.35)';
  ctx.fillRect(LANE_X, top, LANE_W, bot);
  
  ctx.strokeStyle = 'rgba(140, 140, 145, 0.5)'; ctx.lineWidth = 2; ctx.setLineDash([15,10]);
  ctx.beginPath(); ctx.moveTo(LANE_X, top); ctx.lineTo(LANE_X, bot); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(LANE_X + LANE_W, top); ctx.lineTo(LANE_X + LANE_W, bot); ctx.stroke();
  ctx.setLineDash([]);
}

function drawPlayer(){
  if(!player.alive) return;
  const sy = player.y - camY;

  player.trail.forEach((p,i) => {
    const psy = p.y - camY;
    const frac = (i+1) / player.trail.length;
    ctx.beginPath(); ctx.arc(p.x, psy, 4*frac*p.a, 0, Math.PI*2);
    ctx.fillStyle = `rgba(0, 212, 255, ${p.a * 0.5})`; ctx.fill();
  });

  if(invincible && Math.floor(Date.now() / 100) % 2 === 0) return;
  
  ctx.save(); 
  ctx.translate(player.x, sy);
  
  if (playerSpriteLoaded) {
    ctx.save();
    ctx.rotate(SPRITE_ROTATION); 
    ctx.drawImage(playerSprite, -player.w/2, -player.h/2, player.w, player.h);
    ctx.restore();
  } else {
    ctx.save();
    ctx.rotate(-Math.PI/2);
    ctx.beginPath(); ctx.moveTo(18,0); ctx.lineTo(-12,12); ctx.lineTo(-6,0); ctx.lineTo(-12,-12); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#888888'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
  
  const fireLength = playerFly ? 35 : 22;
  ctx.beginPath(); 
  ctx.moveTo(0, player.h / 2); 
  ctx.lineTo((Math.random() - 0.5) * 4, player.h / 2 + fireLength + (Math.random() - 0.5) * 4);
  ctx.strokeStyle = playerFly ? '#10b981' : '#00d4ff'; 
  ctx.lineWidth = 3; 
  ctx.stroke();
  
  ctx.restore();
}

function drawNaoBlock() {
  if (naoBlock.w <= 0) return; 
  const sy = naoBlock.y - camY;
  ctx.save();
  ctx.translate(naoBlock.x, sy);
  if (naoBlock.rot) ctx.rotate(naoBlock.rot);
  
  ctx.fillStyle = '#111111';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = '#ffffff';
  
  ctx.beginPath();
  ctx.roundRect(-naoBlock.w/2, -naoBlock.h/2, naoBlock.w, naoBlock.h, 6);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(9, naoBlock.h * 0.45)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('NÃO', 0, 0);
  ctx.restore();
}

function drawEnemies(){
  enemies.forEach(e => {
    const sy = e.y - camY;
    if(sy < -60 || sy > H + 60) return;
    
    ctx.save(); 
    ctx.translate(e.x, sy);
    
    if (enemySpriteLoaded) {
      ctx.drawImage(enemySprite, -e.w/2, -e.h/2, e.w, e.h);
    } else {
      ctx.rotate(Math.PI/2);
      ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-12,10); ctx.lineTo(-6,0); ctx.lineTo(-12,-10); ctx.closePath();
      ctx.fillStyle = '#333333'; ctx.fill(); ctx.strokeStyle = e.col; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  });
}

function drawBullets(){
  bullets.forEach(b => {
    const sy = b.y - camY;
    if(sy < -20 || sy > H + 20) return;
    
    ctx.save();
    ctx.fillStyle = '#ff3333';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#ff0000'; 
    
    ctx.fillRect(b.x - b.w/2, sy - b.h/2, b.w, b.h);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(b.x - b.w/6, sy - b.h/2 + 2, b.w/3, b.h - 4);
    
    ctx.restore();
  });
}

function drawMeteors(){
  meteors.forEach(m => {
    const sy = m.y - camY;
    if(sy < -60 || sy > H + 60) return;
    ctx.save(); ctx.translate(m.x, sy); ctx.rotate(m.rot);
    
    const sides = 6;
    ctx.beginPath();
    for(let i=0; i<sides; i++){
      const ang = (i/sides) * Math.PI * 2;
      const rr = m.r * (0.75 + 0.25 * Math.sin(i*2));
      if(i===0) ctx.moveTo(Math.cos(ang)*rr, Math.sin(ang)*rr);
      else ctx.lineTo(Math.cos(ang)*rr, Math.sin(ang)*rr);
    }
    ctx.closePath();
    ctx.fillStyle = '#222222'; ctx.fill(); ctx.strokeStyle = '#555555'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  });
}

function drawParticles(){
  particles.forEach(p => {
    const sy = p.y - camY;
    if(sy < -10 || sy > H + 10) return;
    ctx.beginPath(); ctx.arc(p.x, sy, p.r * p.life, 0, Math.PI*2);
    ctx.fillStyle = p.col; ctx.fill();
  });
}

function drawHUD(){
  if(cutscene) return; 
  const prog = Math.max(0, Math.min(100, Math.round(100 - ((camY - FINISH_Y) / (WORLD_H - H - FINISH_Y)) * 100)));
  document.getElementById('f1-hprog').textContent = prog + '%';
  document.getElementById('f1-hlives').textContent = '❤'.repeat(lives) + '♡'.repeat(Math.max(0, 3-lives));
  document.getElementById('f1-hspd').textContent = Math.round(getScrollSpd()*40);
  
  const barW = LANE_W - 20;
  const barX = W/2 - barW/2;
  const barY = 50;
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(barX, barY, barW, 4);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(barX, barY, barW * (prog/100), 4);
}

let meteorTimer = 0;
let last = 0;
function loop(ts){
  if(!running) return;
  const dt = Math.min(ts - last, 40); last = ts;
  const scrollSpd = getScrollSpd();
  
  if (!cutscene) {
    camY = Math.max(FINISH_Y, camY - scrollSpd * (dt / 16));
    player.y = Math.min(player.y, camY + H - 30);
    
    naoBlock.angle += 0.04 * (dt / 16);
    naoBlock.x = W / 2 + Math.sin(naoBlock.angle) * (LANE_W / 2.3);
    naoBlock.y = camY + 80; 

    if (camY < WORLD_H * 0.3) {
      planet.appeared = true;
      if (planet.r < planet.targetR) planet.r += 0.4 * (dt/16);
    }

    if (camY <= FINISH_Y) {
      cutscene = true;
      document.getElementById('f1-cutsceneOverlay').style.display = 'flex';
    }
  } else {
    naoBlock.y += (planet.y - naoBlock.y) * 0.05 * (dt / 16);
    naoBlock.x += (planet.x - naoBlock.x) * 0.05 * (dt / 16);
    naoBlock.rot += 0.18 * (dt / 16);
    
    if(naoBlock.w > 1) {
      naoBlock.w -= 0.8 * (dt / 16);
      naoBlock.h -= 0.4 * (dt / 16);
    } else {
      naoBlock.w = 0; naoBlock.h = 0;
    }

    const playerScreenY = player.y - camY;
    const planetScreenY = planet.y - camY;

    if (playerFly && playerScreenY < planetScreenY + 10) {
       endGame(true);
       return;
    }
  }
  
  updatePlayer(dt);
  updateEnemies(dt);
  updateBullets(dt);
  
  if(camY < WORLD_H * 0.55 && !cutscene){
    meteorTimer -= dt;
    if(meteorTimer <= 0){
      spawnMeteor();
      meteorTimer = 700 + Math.random() * 700;
    }
  }
  
  updateMeteors(dt);
  updateParticles(dt);
  
  drawBg();
  drawTrack();
  drawMeteors();
  drawBullets();
  drawPlayer();
  drawNaoBlock(); 
  drawEnemies();
  drawParticles();
  drawHUD();
  
  requestAnimationFrame(loop);
}

document.getElementById('f1-goToPlanetBtn').addEventListener('click', () => {
    document.getElementById('f1-cutsceneOverlay').style.display = 'none';
    playerFly = true;
});

// FUNÇÃO PARA ATIVAR O JOGO AUTOMATICAMENTE COM FADE OUT DO BANNER
function autoStartGame() {
  resize();
  initGame();
  running = true;
  last = 0;
  requestAnimationFrame(loop);

  // Aguarda 3 segundos e faz o fade out do título/legenda
  setTimeout(() => {
    const overlay = document.getElementById('f1-overlay');
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
  }, 3000);
}

window.addEventListener('resize', resize);

// Inicia automaticamente assim que o script roda
window.f1StartGame = autoStartGame;
        })();

        // F2 JS
        (function(){ 

const gameArea2 = document.getElementById('f2-gameArea2');
const babyYoda = document.getElementById('f2-baby-yoda');
const runnerPlayer = document.getElementById('f2-runner-player');
const runnerObstacle = document.getElementById('f2-runner-obstacle');
const scoreDisplay2 = document.getElementById('f2-score2');
const imperialShip = document.getElementById('f2-imperial-ship');

let runnerScore = 0;
let loopInterval;
let isRunnerActive = false;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playJumpSound() {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(580, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch(e){}
}

function playHitSound() {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(30, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch(e){}
}

function startMiniGame2() {
    isRunnerActive = true;
    runnerScore = 0;
    scoreDisplay2.innerText = `Progresso da Perseguição: 0%`;
    scoreDisplay2.style.color = '#fff';
    
    // Reseta estados e animações do Baby Yoda
    babyYoda.classList.remove('f2-yoda-enter-ship');
    babyYoda.style.bottom = '0';
    babyYoda.style.opacity = '1';

    // Reseta estados e animações do botão "NÃO"
    runnerPlayer.classList.remove('f2-button-fly-away');
    runnerPlayer.style.bottom = '0';
    runnerPlayer.style.opacity = '1';
    runnerPlayer.style.left = '210px';
    
    // Reseta a Nave Imperial
    imperialShip.classList.remove('f2-ship-arrive-yoda', 'f2-ship-escape-yoda');

    // Reinicia o obstáculo
    runnerObstacle.style.display = 'block';
    runnerObstacle.classList.remove('f2-obstacle-move');
    runnerObstacle.offsetHeight; 
    runnerObstacle.classList.add('f2-obstacle-move');

    document.addEventListener('keydown', handleYodaJump);
    gameArea2.addEventListener('mousedown', handleYodaJump);
    gameArea2.addEventListener('touchstart', handleYodaJump, { passive: true });
    
    clearInterval(loopInterval);
    loopInterval = setInterval(checkRunnerPhysics, 20);
}

function handleYodaJump(e) {
    if (!isRunnerActive) return;
    if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;

    if (!babyYoda.classList.contains('f2-jump-yoda')) {
        babyYoda.classList.add('f2-jump-yoda');
        initAudio();
        playJumpSound();
        
        setTimeout(() => {
            babyYoda.classList.remove('f2-jump-yoda');
        }, 520);
    }
}

function checkRunnerPhysics() {
    // Bloqueia execução se o jogo acabou para não haver conflitos visuais
    if (!isRunnerActive || runnerScore > 100) return;

    const yodaRect = babyYoda.getBoundingClientRect();
    const buttonRect = runnerPlayer.getBoundingClientRect();
    const obstacleRect = runnerObstacle.getBoundingClientRect();

    // esperando o laser chegar bem perto para não subir antes da hora!
    if (obstacleRect.left - buttonRect.right < 55 && obstacleRect.left > buttonRect.left) {
        if (!runnerPlayer.classList.contains('f2-jump-button')) {
            runnerPlayer.classList.add('f2-jump-button');
            setTimeout(() => {
                runnerPlayer.classList.remove('f2-jump-button');
            }, 480);
        }
    }

    // DETECÇÃO DE COLISÃO DO BABY YODA
    if (
        obstacleRect.left < yodaRect.right &&
        obstacleRect.right > yodaRect.left &&
        obstacleRect.top < yodaRect.bottom &&
        obstacleRect.bottom > yodaRect.top
    ) {
        isRunnerActive = false;
        clearInterval(loopInterval);
        
        runnerObstacle.classList.remove('f2-obstacle-move');
        playHitSound();
        
        gameArea2.style.boxShadow = '0 0 30px var(--neon-red) inset';
        scoreDisplay2.innerText = "Você foi atingido pelo Stormtrooper!";
        scoreDisplay2.style.color = "var(--neon-red)";
        
        document.removeEventListener('keydown', handleYodaJump);
        gameArea2.removeEventListener('mousedown', handleYodaJump);
        gameArea2.removeEventListener('touchstart', handleYodaJump);

        setTimeout(() => {
            gameArea2.style.boxShadow = '';
            startMiniGame2();
        }, 1500);
        return;
    }

    // Incrementa a pontuação
    runnerScore += 0.4;
    if (runnerScore <= 100) {
        scoreDisplay2.innerText = `Progresso da Perseguição: ${Math.floor(runnerScore)}%`;
    } else {
        winRunnerGame();
    }
}

// SEQUÊNCIA DE VITÓRIA CINEMATOGRÁFICA
function winRunnerGame() {
    isRunnerActive = false;
    clearInterval(loopInterval);
    
    runnerObstacle.style.display = 'none';
    scoreDisplay2.innerText = "O botão 'NÃO' escapou voando para o espaço!";
    scoreDisplay2.style.color = "var(--neon-red)";
    
    document.removeEventListener('keydown', handleYodaJump);
    gameArea2.removeEventListener('mousedown', handleYodaJump);
    gameArea2.removeEventListener('touchstart', handleYodaJump);
    
    // 1. O botão "NÃO" decola para o espaço encolhendo até sumir da página
    setTimeout(() => {
        runnerPlayer.classList.add('f2-button-fly-away');
    }, 500);

    // 2. A nave surge vinda de cima e para logo acima do Baby Yoda
    setTimeout(() => {
        scoreDisplay2.innerText = "O botão está fugindo!";
        scoreDisplay2.style.color = "#ff00a0";
        imperialShip.classList.add('f2-ship-arrive-yoda');
    }, 2000);

    // 3. O Baby Yoda é abduzido (sobe reto para a nave e desaparece)
    setTimeout(() => {
        babyYoda.classList.add('f2-yoda-enter-ship');
    }, 3500);

    // 4. A nave decola para o espaço levando o Baby Yoda (encolhendo até sumir da página)
    setTimeout(() => {
        imperialShip.classList.remove('f2-ship-arrive-yoda');
        imperialShip.classList.add('f2-ship-escape-yoda');
        scoreDisplay2.innerText = "Continua...";
        scoreDisplay2.style.color = "var(--neon-blue)";
    }, 4700);

    // 5. Transiciona para a Fase 3
    setTimeout(() => {
        window.goToPhase('fase3');
    }, 6700);
}

window.f2StartGame = startMiniGame2;

 })();

        // F3 JS
        (function(){ 

        /* ==========================================================================
           1. ARQUIVOS DE SPRITES (VARIÁVEIS DE CONFIGURAÇÃO DO DESIGNER)
           Se as imagens existirem na pasta assets, o jogo as renderiza automaticamente.
           Caso contrário, os desenhos em Canvas Vetorial (fallbacks) serão utilizados.
           ========================================================================== */
        const imgPlayer = new Image();
        imgPlayer.src = './assets/xwing.png';

        const imgNoButton = new Image();
        imgNoButton.src = './assets/no_button.png';

        const imgObstacleTop = new Image();
        imgObstacleTop.src = './assets/at_at_top.png';

        const imgObstacleBottom = new Image();
        imgObstacleBottom.src = './assets/at_at_bottom.png';


        /* ==========================================================================
           2. CLASSE: SoundEffects (ÁUDIO SINTETIZADO COM WEB AUDIO API)
           Sintetiza efeitos sonoros retro sci-fi sem necessidade de arquivos externos.
           ========================================================================== */
        class SoundEffects {
            constructor() {
                this.ctx = null;
                this.volume = 0.4;
            }

            init() {
                if (!this.ctx) {
                    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.ctx.state === 'suspended') {
                    this.ctx.resume();
                }
            }

            // Som do salto (Pew!)
            playJump() {
                this.init();
                if (!this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gainNode = this.ctx.createGain();
                    
                    osc.connect(gainNode);
                    gainNode.connect(this.ctx.destination);
                    
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(140, now);
                    // Rampa exponencial de frequência ascendente
                    osc.frequency.exponentialRampToValueAtTime(650, now + 0.12);
                    
                    gainNode.gain.setValueAtTime(this.volume * 0.15, now);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.12);
                    
                    osc.start(now);
                    osc.stop(now + 0.12);
                } catch (e) { console.warn(e); }
            }

            // Som da colisão/explosão (Boom!)
            playExplosion() {
                this.init();
                if (!this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    // Gera ruído branco para a explosão
                    const bufferSize = this.ctx.sampleRate * 0.4;
                    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                    const data = buffer.getChannelData(0);
                    for (let i = 0; i < bufferSize; i++) {
                        data[i] = Math.random() * 2 - 1;
                    }
                    
                    const noiseNode = this.ctx.createBufferSource();
                    noiseNode.buffer = buffer;
                    
                    const filter = this.ctx.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(250, now);
                    filter.frequency.exponentialRampToValueAtTime(10, now + 0.4);
                    
                    const gainNode = this.ctx.createGain();
                    gainNode.gain.setValueAtTime(this.volume * 0.4, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                    
                    noiseNode.connect(filter);
                    filter.connect(gainNode);
                    gainNode.connect(this.ctx.destination);
                    
                    noiseNode.start(now);
                    noiseNode.stop(now + 0.4);
                } catch (e) { console.warn(e); }
            }

            // Som de ponto marcado (Beep de droide)
            playScore() {
                this.init();
                if (!this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    const osc = this.ctx.createOscillator();
                    const gainNode = this.ctx.createGain();
                    
                    osc.connect(gainNode);
                    gainNode.connect(this.ctx.destination);
                    
                    osc.type = 'sine';
                    // Sons sequenciais rápidos simulando o R2D2
                    osc.frequency.setValueAtTime(900, now);
                    osc.frequency.setValueAtTime(1350, now + 0.07);
                    
                    gainNode.gain.setValueAtTime(this.volume * 0.08, now);
                    gainNode.gain.setValueAtTime(this.volume * 0.08, now + 0.07);
                    gainNode.gain.linearRampToValueAtTime(0.01, now + 0.18);
                    
                    osc.start(now);
                    osc.stop(now + 0.18);
                } catch (e) { console.warn(e); }
            }

            // Som de vitória (Fanfarra da Força)
            playVictory() {
                this.init();
                if (!this.ctx) return;
                try {
                    const now = this.ctx.currentTime;
                    // Notas simplificadas do tema de Star Wars
                    const notes = [
                        { f: 587.33, d: 0.15 }, // D5
                        { f: 587.33, d: 0.15 }, // D5
                        { f: 587.33, d: 0.15 }, // D5
                        { f: 783.99, d: 0.45 }, // G5
                        { f: 1174.66, d: 0.45 }, // D6
                        { f: 1046.50, d: 0.15 }, // C6
                        { f: 987.77, d: 0.15 }, // B5
                        { f: 880.00, d: 0.15 }, // A5
                        { f: 1567.98, d: 0.45 }, // G6
                        { f: 1174.66, d: 0.3 }   // D6
                    ];
                    
                    let timeOffset = now;
                    notes.forEach(note => {
                        const osc = this.ctx.createOscillator();
                        const gainNode = this.ctx.createGain();
                        
                        osc.connect(gainNode);
                        gainNode.connect(this.ctx.destination);
                        
                        osc.type = 'square'; // Som com pegada retro 8bit
                        osc.frequency.setValueAtTime(note.f, timeOffset);
                        
                        gainNode.gain.setValueAtTime(this.volume * 0.06, timeOffset);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, timeOffset + note.d);
                        
                        osc.start(timeOffset);
                        osc.stop(timeOffset + note.d);
                        
                        timeOffset += note.d + 0.02; // Pequena folga entre notas
                    });
                } catch (e) { console.warn(e); }
            }
        }


        /* ==========================================================================
           3. CLASSE: Particle (EFEITOS DE RASTRO E EXPLOSÕES)
           ========================================================================== */
        class Particle {
            constructor(x, y, vx, vy, color, size, maxLife) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.color = color;
                this.size = size;
                this.life = maxLife;
                this.maxLife = maxLife;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.life--;
            }

            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }


        /* ==========================================================================
           4. CLASSE: Star (FUNDO PARALAXE DE ESTRELAS NO CANVAS)
           ========================================================================== */
        class Star {
            constructor(canvasWidth, canvasHeight, isFar = false) {
                this.canvasWidth = canvasWidth;
                this.canvasHeight = canvasHeight;
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() * canvasHeight;
                // Estrelas distantes são menores e mais lentas, próximas são maiores e velozes
                this.size = isFar ? 0.5 + Math.random() * 0.8 : 1.2 + Math.random() * 1.5;
                this.speed = isFar ? 0.15 + Math.random() * 0.3 : 0.7 + Math.random() * 1.0;
                this.color = isFar ? 'rgba(255, 255, 255, 0.35)' : (Math.random() > 0.85 ? 'rgba(0, 229, 255, 0.75)' : 'rgba(255, 255, 255, 0.75)');
            }

            update(speedMultiplier) {
                this.x -= this.speed * speedMultiplier;
                if (this.x < 0) {
                    this.x = this.canvasWidth;
                    this.y = Math.random() * this.canvasHeight;
                }
            }

            draw(ctx) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        }


        /* ==========================================================================
           5. CLASSE: Player (FÍSICA DA NAVE E DESENHO VETORIAL DE FALLBACK)
           ========================================================================== */
        class Player {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 44;
                this.height = 24;
                this.vy = 0;
                this.gravity = 0.44;
                this.jumpStrength = -7.5;
                this.rotation = 0;
            }

            jump() {
                this.vy = this.jumpStrength;
            }

            update(isDead, groundY) {
                if (!isDead) {
                    this.vy += this.gravity;
                    if (this.vy > 9.5) this.vy = 9.5; // Velocidade terminal de queda
                    this.y += this.vy;
                    // Rotaciona a nave baseado na direção vertical
                    this.rotation = Math.max(-0.4, Math.min(0.6, this.vy * 0.08));
                } else {
                    // Se estiver destruída, cai girando
                    this.vy += this.gravity * 1.5;
                    this.y += this.vy;
                    this.rotation = Math.min(Math.PI / 2, this.rotation + 0.1);
                    if (this.y > groundY - this.height/2) {
                        this.y = groundY - this.height/2;
                        this.vy = 0;
                    }
                }
            }

            draw(ctx, imgRef, particles, isDead) {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                // Efeito visual do propulsor (Fogo azul)
                if (!isDead) {
                    const flameSize = 10 + Math.random() * 8;
                    // Desenha o rastro do propulsor primário
                    ctx.fillStyle = '#00e5ff';
                    ctx.beginPath();
                    ctx.moveTo(-18, -4);
                    ctx.lineTo(-18 - flameSize, -4);
                    ctx.lineTo(-18, -2);
                    ctx.closePath();
                    ctx.fill();

                    ctx.beginPath();
                    ctx.moveTo(-18, 4);
                    ctx.lineTo(-18 - flameSize, 4);
                    ctx.lineTo(-18, 2);
                    ctx.closePath();
                    ctx.fill();

                    // Insere partículas no array de fumaça atrás da nave
                    if (Math.random() > 0.4) {
                        particles.push(new Particle(
                            this.x - 20,
                            this.y + (Math.random() * 8 - 4),
                            -2 - Math.random() * 2,
                            Math.random() * 1.6 - 0.8,
                            Math.random() > 0.5 ? 'rgba(0, 229, 255, 0.6)' : 'rgba(255, 255, 255, 0.4)',
                            2 + Math.random() * 2,
                            12 + Math.random() * 10
                        ));
                    }
                }

                // Renderiza a Imagem do Player se estiver carregada
                if (imgRef && imgRef.complete && imgRef.naturalWidth !== 0) {
                    ctx.drawImage(imgRef, -this.width / 2, -this.height / 2, this.width, this.height);
                } else {
                    /* --------------------------------------------------------------
                       FALLBACK: RENDER VETORIAL DE ALTA FIDELIDADE DE UMA X-WING
                       -------------------------------------------------------------- */
                    // 1. Asas Abertas (S-foils em posição de ataque)
                    ctx.strokeStyle = '#9ca4b0';
                    ctx.lineWidth = 2.5;

                    // Asa superior esquerda
                    ctx.beginPath();
                    ctx.moveTo(-4, -2);
                    ctx.lineTo(-18, -13);
                    ctx.lineTo(-6, -13);
                    ctx.lineTo(8, -2);
                    ctx.closePath();
                    ctx.fillStyle = '#d0d5dd';
                    ctx.fill();
                    ctx.stroke();

                    // Asa inferior esquerda
                    ctx.beginPath();
                    ctx.moveTo(-4, 2);
                    ctx.lineTo(-18, 13);
                    ctx.lineTo(-6, 13);
                    ctx.lineTo(8, 2);
                    ctx.closePath();
                    ctx.fillStyle = '#d0d5dd';
                    ctx.fill();
                    ctx.stroke();

                    // Ponta vermelha dos canhões laser rebeldes
                    ctx.fillStyle = '#ff1e56';
                    ctx.fillRect(-22, -14, 5, 2);
                    ctx.fillRect(-22, 12, 5, 2);

                    // 2. Fuselagem Principal (Corpo da X-Wing)
                    ctx.fillStyle = '#e3e8f0';
                    ctx.strokeStyle = '#5a6275';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(18, 0); // Bico (Nose)
                    ctx.bezierCurveTo(8, -5, -12, -6, -16, -3);
                    ctx.lineTo(-16, 3);
                    ctx.bezierCurveTo(-12, 6, 8, 5, 18, 0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // 3. Faixas Detalhadas de Decoração (Vermelho/Laranja Rebelde)
                    ctx.fillStyle = '#ff5e00';
                    ctx.beginPath();
                    ctx.moveTo(6, -2);
                    ctx.lineTo(11, -1);
                    ctx.lineTo(11, 1);
                    ctx.lineTo(6, 2);
                    ctx.closePath();
                    ctx.fill();

                    // 4. Cockpit (Canopy em azul neon brilhante)
                    ctx.fillStyle = 'rgba(0, 229, 255, 0.7)';
                    ctx.strokeStyle = '#00e5ff';
                    ctx.beginPath();
                    ctx.ellipse(3, -1, 6, 3, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // 5. Droide Astromecânico R2-D2 atrás da cabine
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(-4, -1.8, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#080b1e'; // Linhas azuis
                    ctx.fillRect(-4, -3.8, 1, 2);
                }

                ctx.restore();
            }
        }


        /* ==========================================================================
           6. CLASSE: NoButton (O BOTÃO "NÃO" FUJITIVO COM FOGUETES E FALHA)
           ========================================================================== */
        class NoButton {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.width = 62;
                this.height = 32;
                this.bobTimer = 0;
                this.vy = 0;
                this.gravity = 0.35;
                this.outOfFuel = false;
                this.crashed = false;
            }

            // O botão persegue o vão do obstáculo à frente ou acompanha a altura do jogador
            update(playerY, nextObstacle, groundY) {
                if (!this.outOfFuel) {
                    this.bobTimer += 0.07;
                    const bobOffset = Math.sin(this.bobTimer) * 12;

                    let targetY = playerY;
                    
                    // Se houver um obstáculo próximo vindo, o botão voa centralizado no espaço vazio!
                    if (nextObstacle && nextObstacle.x > this.x - 40) {
                        targetY = nextObstacle.topHeight + nextObstacle.gap / 2;
                    }

                    // Interpolação suave para simular voo inteligente
                    this.y += (targetY + bobOffset - this.y) * 0.07;
                } else if (!this.crashed) {
                    // Sem combustível: cai sobre a ação da gravidade
                    this.vy += this.gravity;
                    this.y += this.vy;

                    // Limite com o chão
                    if (this.y > groundY - this.height / 2) {
                        this.y = groundY - this.height / 2;
                        this.vy = 0;
                        this.crashed = true;
                    }
                }
            }

            draw(ctx, imgRef, particles) {
                ctx.save();
                
                // Rotaciona o botão quando ele estiver caindo desgovernado
                if (this.outOfFuel && !this.crashed) {
                    const rotation = Math.min(0.8, this.vy * 0.05);
                    ctx.translate(this.x, this.y);
                    ctx.rotate(rotation);
                } else {
                    ctx.translate(this.x, this.y);
                }

                // Efeitos visuais do motor a jato
                if (!this.outOfFuel) {
                    const flameSize = 10 + Math.random() * 8;
                    ctx.fillStyle = '#ff1e56';
                    
                    // Jato de fogo superior
                    ctx.beginPath();
                    ctx.moveTo(-this.width / 2, -6);
                    ctx.lineTo(-this.width / 2 - flameSize, -8);
                    ctx.lineTo(-this.width / 2, -10);
                    ctx.closePath();
                    ctx.fill();

                    // Jato de fogo inferior
                    ctx.beginPath();
                    ctx.moveTo(-this.width / 2, 10);
                    ctx.lineTo(-this.width / 2 - flameSize, 8);
                    ctx.lineTo(-this.width / 2, 6);
                    ctx.closePath();
                    ctx.fill();

                    // Core azul na base
                    ctx.fillStyle = '#ffe81f';
                    ctx.fillRect(-this.width / 2 - 2, -9, 3, 2);
                    ctx.fillRect(-this.width / 2 - 2, 7, 3, 2);

                    // Partículas de faísca
                    if (Math.random() > 0.6) {
                        particles.push(new Particle(
                            this.x - this.width / 2,
                            this.y + (Math.random() * 20 - 10),
                            -3 - Math.random() * 2,
                            Math.random() * 2 - 1,
                            '#ff5e00',
                            1.5 + Math.random() * 1.5,
                            10 + Math.random() * 10
                        ));
                    }
                } else if (!this.crashed) {
                    // Sem combustível: cospe fumaça preta e fagulhas
                    if (Math.random() > 0.25) {
                        particles.push(new Particle(
                            this.x - 5,
                            this.y + (Math.random() * 10 - 5),
                            -1 - Math.random() * 2,
                            -0.5 - Math.random() * 1.5,
                            Math.random() > 0.4 ? 'rgba(75, 75, 75, 0.8)' : 'rgba(30, 30, 30, 0.8)',
                            3.5 + Math.random() * 3,
                            30 + Math.random() * 20
                        ));
                    }
                    if (Math.random() > 0.7) {
                        particles.push(new Particle(
                            this.x - 5,
                            this.y + (Math.random() * 10 - 5),
                            -2 - Math.random() * 2,
                            Math.random() * 4 - 2,
                            '#ffe81f',
                            1 + Math.random() * 1,
                            8 + Math.random() * 10
                        ));
                    }
                }

                // Renderiza Imagem se carregada
                if (imgRef && imgRef.complete && imgRef.naturalWidth !== 0) {
                    ctx.drawImage(imgRef, -this.width / 2, -this.height / 2, this.width, this.height);
                } else {
                    /* --------------------------------------------------------------
                       FALLBACK: BOTÃO GLASSMORPHIC "NÃO" COM NEON E HASTES METAL
                       -------------------------------------------------------------- */
                    // Glow de fundo
                    ctx.shadowColor = this.outOfFuel ? '#444' : '#ff1e56';
                    ctx.shadowBlur = this.outOfFuel ? 2 : 12;

                    // Corpo Vermelho
                    ctx.fillStyle = this.outOfFuel ? '#3b1c21' : '#ff1e56';
                    ctx.strokeStyle = this.outOfFuel ? '#666' : '#ffe81f';
                    ctx.lineWidth = 2.5;

                    // Formato de cápsula
                    const radius = this.height / 2;
                    ctx.beginPath();
                    ctx.arc(-this.width/2 + radius, 0, radius, Math.PI/2, 3*Math.PI/2);
                    ctx.lineTo(this.width/2 - radius, -radius);
                    ctx.arc(this.width/2 - radius, 0, radius, 3*Math.PI/2, Math.PI/2);
                    ctx.lineTo(-this.width/2 + radius, radius);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    // Remove sombras para o texto e detalhes
                    ctx.shadowBlur = 0;

                    // Reflexo brilhante de vidro superior
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
                    ctx.beginPath();
                    ctx.arc(-this.width/2 + radius, 0, radius - 2, Math.PI, 3*Math.PI/2);
                    ctx.lineTo(this.width/2 - radius, -radius + 2);
                    ctx.lineTo(this.width/2 - radius, 0);
                    ctx.lineTo(-this.width/2 + radius, 0);
                    ctx.closePath();
                    ctx.fill();

                    // Texto central "NÃO"
                    ctx.fillStyle = this.outOfFuel ? '#8a8888' : '#ffffff';
                    ctx.font = '900 11px "Orbitron", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('NÃO', 0, 1.5);

                    // Suportes mecânicos traseiros
                    ctx.strokeStyle = this.outOfFuel ? '#555' : '#8a92a3';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(-15, -radius);
                    ctx.lineTo(-24, -radius - 2);
                    ctx.moveTo(-15, radius);
                    ctx.lineTo(-24, radius + 2);
                    ctx.stroke();
                }

                ctx.restore();
            }
        }


        /* ==========================================================================
           7. CLASSE: Obstacle (OBSTÁCULOS / PERNAS DOS AT-AT E ESTRUTURA METAL)
           ========================================================================== */
        class Obstacle {
            constructor(canvasWidth, canvasHeight, index) {
                this.canvasWidth = canvasWidth;
                this.canvasHeight = canvasHeight;
                this.x = canvasWidth;
                this.width = 65;
                this.gap = 145; // Altura da abertura para passar
                this.passed = false;
                this.index = index;

                // Define as alturas superior e inferior mantendo espaço seguro
                const edgeMargin = 75;
                const groundHeight = 40;
                const minPos = edgeMargin;
                const maxPos = canvasHeight - this.gap - edgeMargin - groundHeight;
                
                this.topHeight = minPos + Math.random() * (maxPos - minPos);
                this.bottomY = this.topHeight + this.gap;
                this.bottomHeight = canvasHeight - this.bottomY - groundHeight;
            }

            update(speed) {
                this.x -= speed;
            }

            draw(ctx, imgTop, imgBottom) {
                ctx.save();
                
                // Desenha Obstáculo Superior
                if (imgTop && imgTop.complete && imgTop.naturalWidth !== 0) {
                    ctx.drawImage(imgTop, this.x, 0, this.width, this.topHeight);
                } else {
                    this.drawPillarFallback(ctx, this.x, 0, this.width, this.topHeight, true);
                }

                // Desenha Obstáculo Inferior
                if (imgBottom && imgBottom.complete && imgBottom.naturalWidth !== 0) {
                    ctx.drawImage(imgBottom, this.x, this.bottomY, this.width, this.bottomHeight);
                } else {
                    this.drawPillarFallback(ctx, this.x, this.bottomY, this.width, this.bottomHeight, false);
                }

                ctx.restore();
            }

            // Fallback de pilares mecânicos com estilo de pernas de AT-AT ou torres imperiais
            drawPillarFallback(ctx, x, y, width, height, isTop) {
                // Degradê metálico
                const grad = ctx.createLinearGradient(x, y, x + width, y);
                grad.addColorStop(0, '#2e3340');
                grad.addColorStop(0.3, '#4d5568');
                grad.addColorStop(0.7, '#2e3340');
                grad.addColorStop(1, '#181b22');
                
                ctx.fillStyle = grad;
                ctx.fillRect(x, y, width, height);

                // Desenha painéis e linhas de junção de aço
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
                ctx.lineWidth = 1.8;
                ctx.strokeRect(x + 5, y, width - 10, height);

                // Rebites ou parafusos estruturais em intervalos verticais
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                for (let h = 15; h < height - 10; h += 35) {
                    ctx.beginPath();
                    ctx.arc(x + 10, y + h, 2, 0, Math.PI*2);
                    ctx.arc(x + width - 10, y + h, 2, 0, Math.PI*2);
                    ctx.fill();
                }

                // Faixas de aviso listradas (Amarelo e Preto) nas pontas/extremidades do vão
                ctx.save();
                ctx.beginPath();
                const warningHeight = 16;
                const warningY = isTop ? y + height - warningHeight : y;
                ctx.rect(x, warningY, width, warningHeight);
                ctx.clip();

                ctx.fillStyle = '#ffe81f';
                ctx.fillRect(x, warningY, width, warningHeight);

                // Riscos diagonais pretos
                ctx.strokeStyle = '#020205';
                ctx.lineWidth = 4;
                for (let offset = -20; offset < width + 20; offset += 9) {
                    ctx.beginPath();
                    ctx.moveTo(x + offset, warningY);
                    ctx.lineTo(x + offset + 8, warningY + warningHeight);
                    ctx.stroke();
                }
                ctx.restore();

                // Cabeçote saliente metálico na borda do vão
                const headY = isTop ? y + height - 6 : y;
                ctx.fillStyle = '#656e82';
                ctx.fillRect(x - 3, headY, width + 6, 6);
                ctx.strokeStyle = '#121419';
                ctx.strokeRect(x - 3, headY, width + 6, 6);

                // Luz piloto vermelha piscando na ponta
                const lightY = isTop ? y + height - 25 : y + 25;
                const glow = (Math.floor(Date.now() / 380) % 2 === 0);
                
                ctx.fillStyle = glow ? '#ff1e56' : '#500';
                ctx.shadowColor = glow ? '#ff1e56' : 'transparent';
                ctx.shadowBlur = glow ? 8 : 0;
                
                ctx.beginPath();
                ctx.arc(x + width/2, lightY, 3.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }


        /* ==========================================================================
           8. CLASSE: Game (GERENCIADOR DO ESTADO, INPUTS E FLUXO PRINCIPAL)
           ========================================================================== */
        class Game {
            constructor() {
                this.canvas = document.getElementById('f3-game-canvas');
                this.ctx = this.canvas.getContext('2d');
                
                // Dimensões estáticas
                this.width = this.canvas.width;
                this.height = this.canvas.height;
                this.groundHeight = 40;
                this.groundY = this.height - this.groundHeight;

                // Áudio e Efeitos
                this.sfx = new SoundEffects();
                
                // Elementos de UI DOM
                this.startScreen = document.getElementById('f3-start-screen');
                this.gameOverScreen = document.getElementById('f3-game-over-screen');
                this.victoryScreen = document.getElementById('f3-victory-screen');
                this.hud = document.getElementById('f3-game-hud');
                this.currentScoreEl = document.getElementById('f3-current-score');
                this.finalScoreEl = document.getElementById('f3-final-score');
                this.fuelBarEl = document.getElementById('f3-fuel-bar');
                this.fuelTxtEl = document.getElementById('f3-fuel-txt');
                this.countdownEl = document.getElementById('f3-countdown-timer');

                // Estado do Jogo (START, PLAYING, GAMEOVER, VICTORY)
                this.state = 'START';
                
                // Configurações
                this.gameSpeed = 3.2; // Velocidade de rolagem horizontal
                this.targetScore = 10; // Meta de desvios para vitória
                this.distanceBetweenObstacles = 230; // Distância horizontal entre canos

                // Entidades e Listas
                this.stars = [];
                this.particles = [];
                this.obstacles = [];
                this.player = null;
                this.noButton = null;
                this.score = 0;
                
                // Variáveis internas auxiliares
                this.spawnDistanceCounter = 0;
                this.obstaclesSpawnedCount = 0;
                this.victoryCountdown = 3;
                this.countdownInterval = null;
                this.reqId = null;

                this.initStars();
                this.setupEventListeners();
            }

            // Inicializa fundo estrelado
            initStars() {
                this.stars = [];
                // 35 estrelas de fundo distantes
                for (let i = 0; i < 35; i++) {
                    this.stars.push(new Star(this.width, this.height, true));
                }
                // 15 estrelas mais próximas (velozes)
                for (let i = 0; i < 15; i++) {
                    this.stars.push(new Star(this.width, this.height, false));
                }
            }

            setupEventListeners() {
                // Salto ao apertar espaço ou clicar/tocar
                const triggerJump = () => {
                    if (this.state === 'PLAYING' && !this.player.isDead) {
                        this.player.jump();
                        this.sfx.playJump();
                    } else if (this.state === 'START') {
                        this.startGame();
                    } else if (this.state === 'GAMEOVER') {
                        this.restartGame();
                    }
                };

                window.addEventListener('keydown', (e) => {
                    if (e.code === 'Space') {
                        e.preventDefault(); // Evita scroll de página
                        triggerJump();
                    }
                });

                this.canvas.addEventListener('mousedown', (e) => {
                    if (e.button === 0) { // Clique esquerdo
                        triggerJump();
                    }
                });

                this.canvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    triggerJump();
                }, { passive: false });

                // Eventos de botões na interface
                document.getElementById('f3-play-btn').addEventListener('click', () => {
                    this.startGame();
                });

                document.getElementById('f3-restart-btn').addEventListener('click', () => {
                    this.restartGame();
                });

                const concludeBtn = document.getElementById('f3-next-btn');
                const runNextPhaseCallback = () => {
                    console.log("Fim da Fase 3 - Chamar próxima tela");
                    alert("Fase 3 Concluída! (Verifique o console.log para fluxo de integração)");
                };
                concludeBtn.addEventListener('click', runNextPhaseCallback);
            }

            startGame() {
                this.sfx.init();
                this.state = 'PLAYING';
                
                // Reseta variáveis do jogo
                this.score = 0;
                this.spawnDistanceCounter = this.distanceBetweenObstacles; // Garante spawn inicial logo
                this.obstaclesSpawnedCount = 0;
                this.obstacles = [];
                this.particles = [];
                
                // Instancia Jogador e Alvo
                this.player = new Player(100, 250);
                this.noButton = new NoButton(320, 250);

                // Configura HUD
                this.currentScoreEl.innerText = '00';
                this.updateFuelBar(100);

                // Altera overlays
                this.startScreen.classList.add('hidden');
                this.gameOverScreen.classList.add('hidden');
                this.victoryScreen.classList.add('hidden');
                this.hud.classList.remove('hidden');

                if (this.reqId) cancelAnimationFrame(this.reqId);
                this.gameLoop();
            }

            restartGame() {
                this.startGame();
            }

            triggerGameOver() {
                this.state = 'GAMEOVER';
                this.sfx.playExplosion();
                this.player.isDead = true;

                // Efeito visual na tela de tremor/piscada de impacto
                this.canvas.style.animation = 'none';
                this.canvas.offsetHeight; /* Trigger reflow */
                this.canvas.style.outline = '5px solid #ff1e56';
                setTimeout(() => {
                    this.canvas.style.outline = 'none';
                }, 150);

                // Cria uma grande explosão de partículas amarelas, laranjas e vermelhas no ponto da colisão
                for (let i = 0; i < 40; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1.5 + Math.random() * 5;
                    this.particles.push(new Particle(
                        this.player.x,
                        this.player.y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() > 0.45 ? (Math.random() > 0.5 ? '#ffe81f' : '#ff5e00') : '#ff1e56',
                        2.5 + Math.random() * 3.5,
                        30 + Math.random() * 20
                    ));
                }

                // Atualiza pontuação final no DOM e mostra overlay
                this.finalScoreEl.innerText = this.score;
                
                setTimeout(() => {
                    if (this.state === 'GAMEOVER') {
                        this.gameOverScreen.classList.remove('hidden');
                        this.hud.classList.add('hidden');
                    }
                }, 1000); // Exibe o overlay após 1 segundo de queda dramática da nave
            }

            triggerVictory() {
                this.state = 'VICTORY';
                this.sfx.playVictory();

                // Cria micro explosão azul/verde de pó de combustível no botão caindo
                for (let i = 0; i < 25; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 3.5;
                    this.particles.push(new Particle(
                        this.noButton.x,
                        this.noButton.y,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        Math.random() > 0.5 ? '#39ff14' : '#00e5ff',
                        2 + Math.random() * 2,
                        25 + Math.random() * 15
                    ));
                }

                // Inicia countdown de transição
                this.victoryCountdown = 3;
                this.countdownEl.innerText = this.victoryCountdown;

                if (this.countdownInterval) clearInterval(this.countdownInterval);
                this.countdownInterval = setInterval(() => {
                    this.victoryCountdown--;
                    this.countdownEl.innerText = this.victoryCountdown;
                    
                    if (this.victoryCountdown <= 0) {
                        clearInterval(this.countdownInterval);
                        console.log("Fim da Fase 3 - Chamar próxima tela");
                    }
                }, 1000);

                // Mostra overlay de vitória
                setTimeout(() => {
                    this.victoryScreen.classList.remove('hidden');
                    this.hud.classList.add('hidden');
                }, 800);
            }

            updateFuelBar(percentage) {
                this.fuelBarEl.style.width = percentage + '%';
                this.fuelTxtEl.innerText = Math.round(percentage) + '%';
                
                // Fica vermelho neon quando o combustível está crítico
                if (percentage < 30) {
                    this.fuelBarEl.style.background = 'var(--imperial-red)';
                    this.fuelBarEl.style.boxShadow = '0 0 10px var(--imperial-red)';
                } else {
                    this.fuelBarEl.style.background = 'linear-gradient(to right, var(--imperial-red), var(--rebel-orange))';
                    this.fuelBarEl.style.boxShadow = '0 0 8px var(--imperial-red)';
                }
            }

            checkCollisions() {
                if (this.player.isDead || this.state !== 'PLAYING') return;

                // 1. Colisão com o Chão (Y > groundY)
                if (this.player.y + this.player.height/2 > this.groundY) {
                    this.triggerGameOver();
                    return;
                }

                // 2. Colisão com o Teto (Y < 0)
                if (this.player.y - this.player.height/2 < 0) {
                    this.triggerGameOver();
                    return;
                }

                // AABB Box para o player
                const pLeft = this.player.x - this.player.width/2 + 4; // Tolerância extra de colisão
                const pRight = this.player.x + this.player.width/2 - 4;
                const pTop = this.player.y - this.player.height/2 + 3;
                const pBottom = this.player.y + this.player.height/2 - 3;

                // 3. Colisão com os Obstáculos
                for (let i = 0; i < this.obstacles.length; i++) {
                    const obs = this.obstacles[i];
                    
                    // Se a caixa colidir com as pernas superiores ou inferiores
                    const isInsideX = pRight > obs.x && pLeft < obs.x + obs.width;
                    const hitsTop = pTop < obs.topHeight;
                    const hitsBottom = pBottom > obs.bottomY;

                    if (isInsideX && (hitsTop || hitsBottom)) {
                        this.triggerGameOver();
                        return;
                    }
                }
            }

            // Loop de Animação Principal
            gameLoop() {
                this.ctx.clearRect(0, 0, this.width, this.height);

                // --- 1. ATUALIZAÇÕES ---
                
                // Velocidade das estrelas aumenta se o jogador estiver em movimento ativo
                const starsSpeed = (this.state === 'PLAYING' && !this.player.isDead) ? 1 : 0.25;
                this.stars.forEach(star => star.update(starsSpeed));

                // Partículas
                for (let i = this.particles.length - 1; i >= 0; i--) {
                    const p = this.particles[i];
                    p.update();
                    if (p.life <= 0) {
                        this.particles.splice(i, 1);
                    }
                }

                if (this.state === 'PLAYING') {
                    // Atualiza jogador
                    this.player.update(this.player.isDead, this.groundY);

                    // Acha o próximo obstáculo para guiar o botão
                    const nextObs = this.obstacles.find(obs => obs.x + obs.width > this.noButton.x);
                    
                    // Atualiza botão fugitivo
                    this.noButton.update(this.player.y, nextObs, this.groundY);

                    if (!this.player.isDead) {
                        // Verifica vitória: se completou a meta de desvios e o botão colidiu no chão
                        if (this.score >= this.targetScore) {
                            if (!this.noButton.outOfFuel) {
                                this.noButton.outOfFuel = true;
                                this.updateFuelBar(0);
                            }
                            if (this.noButton.crashed) {
                                this.triggerVictory();
                            }
                        }

                        // Geração / Spawn de novos obstáculos
                        if (this.obstaclesSpawnedCount < this.targetScore) {
                            this.spawnDistanceCounter += this.gameSpeed;
                            if (this.spawnDistanceCounter >= this.distanceBetweenObstacles) {
                                this.obstacles.push(new Obstacle(this.width, this.height, this.obstaclesSpawnedCount + 1));
                                this.obstaclesSpawnedCount++;
                                this.spawnDistanceCounter = 0;
                            }
                        }

                        // Atualiza e remove obstáculos passados
                        for (let i = this.obstacles.length - 1; i >= 0; i--) {
                            const obs = this.obstacles[i];
                            obs.update(this.gameSpeed);

                            // Marca pontuação quando passa do meio do obstáculo
                            if (!obs.passed && obs.x + obs.width/2 < this.player.x) {
                                obs.passed = true;
                                this.score++;
                                this.sfx.playScore();
                                
                                // Formatação de score
                                this.currentScoreEl.innerText = this.score.toString().padStart(2, '0');
                                
                                // Calcula combustível restante do botão fugitivo
                                const fuelPercent = Math.max(0, 100 - (this.score * (100 / this.targetScore)));
                                this.updateFuelBar(fuelPercent);
                            }

                            // Limpa obstáculos fora da tela
                            if (obs.x + obs.width < 0) {
                                this.obstacles.splice(i, 1);
                            }
                        }

                        // Detecção de colisão ativa
                        this.checkCollisions();
                    }
                } else if (this.state === 'GAMEOVER') {
                    // Queda dramática da nave no chão
                    this.player.update(true, this.groundY);
                } else if (this.state === 'VICTORY') {
                    // O player continua voando calmamente para fora do cenário
                    this.player.vy = 0;
                    this.player.y += (this.groundY / 2 - this.player.y) * 0.03;
                    this.player.x += 1.8;
                }

                // --- 2. RENDERIZAÇÃO ---

                // Estrelas
                this.stars.forEach(star => star.draw(this.ctx));

                // Desenha obstáculos
                this.obstacles.forEach(obs => obs.draw(this.ctx, imgObstacleTop, imgObstacleBottom));

                // Desenha o botão "NÃO"
                if (this.noButton) {
                    this.noButton.draw(this.ctx, imgNoButton, this.particles);
                }

                // Desenha as partículas (fumaça e fogo)
                this.particles.forEach(p => p.draw(this.ctx));

                // Desenha o Jogador (Nave)
                if (this.player) {
                    this.player.draw(this.ctx, imgPlayer, this.particles, this.player.isDead);
                }

                // Desenha a faixa de terra/chão
                this.drawGround();

                // Mantém o loop ativo
                this.reqId = requestAnimationFrame(() => this.gameLoop());
            }

            // Desenha o chão estelar
            drawGround() {
                this.ctx.save();
                
                // Gradiente para o solo
                const groundGrad = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
                groundGrad.addColorStop(0, '#0a0d1e');
                groundGrad.addColorStop(1, '#020308');
                
                this.ctx.fillStyle = groundGrad;
                this.ctx.fillRect(0, this.groundY, this.width, this.groundHeight);
                
                // Linha superior de neon ciano dividindo o solo do espaço
                this.ctx.strokeStyle = '#00e5ff';
                this.ctx.lineWidth = 2.5;
                this.ctx.shadowColor = '#00e5ff';
                this.ctx.shadowBlur = 8;
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.groundY);
                this.ctx.lineTo(this.width, this.groundY);
                this.ctx.stroke();

                // Linha fina verde rebelde interna
                this.ctx.shadowBlur = 0;
                this.ctx.strokeStyle = '#39ff14';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(0, this.groundY + 4);
                this.ctx.lineTo(this.width, this.groundY + 4);
                this.ctx.stroke();
                
                this.ctx.restore();
            }
        }

        // Instanciação inicial ao abrir a página
        window.addEventListener('DOMContentLoaded', () => {
            window.gameInstance = new Game();
        });
    
 })();

        // Desfecho JS
        (function(){ 

const desfechoYes = document.getElementById('desfecho-yes');
const desfechoNo = document.getElementById('desfecho-no');

desfechoNo.addEventListener('mouseover', () => {
    document.getElementById('jedi-force').style.display = 'block';
    
    // Move NO out of the way, and grow YES
    desfechoNo.style.transform = 'translateY(200px) scale(0.5)';
    desfechoNo.style.transition = 'all 0.5s';
    
    desfechoYes.style.transform = 'scale(2)';
    desfechoYes.style.transition = 'all 0.5s';
    desfechoYes.style.boxShadow = '0 0 30px lime';
});

desfechoYes.addEventListener('click', () => {
    document.body.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100vh; background:black; color:white; font-family:sans-serif; font-size:2em; text-align:center;">PARABÉNS!<br><br>Você se juntou à Aliança e completou a disciplina!</div>';
});
