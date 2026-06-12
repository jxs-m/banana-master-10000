/* ==========================================================================
   GAME ENGINE: STAR WARS TRENCH RUN (FASE 1)
   ========================================================================== */

// Configurações padrão do jogo
const DEFAULT_CONFIG = {
    nextStageUrl: "inicio/index.html",
    winScore: 10,
    difficulty: "medium", // easy, medium, hard
    volume: 0.5
};

// Carrega a configuração do localStorage ou usa as padrões
let gameConfig = { ...DEFAULT_CONFIG };
try {
    const savedConfig = localStorage.getItem("sw_trench_run_config");
    if (savedConfig) {
        gameConfig = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
        if (gameConfig.nextStageUrl === "../fase2/index.html") {
            gameConfig.nextStageUrl = "inicio/index.html";
        }
    }
} catch (e) {
    console.error("Erro ao carregar configurações do localStorage", e);
}

// Estados do Jogo
const STATES = {
    INTRO: "INTRO",
    PLAYING: "PLAYING",
    GAMEOVER: "GAMEOVER",
    VICTORY: "VICTORY"
};
let currentState = STATES.INTRO;

// Elementos do DOM
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const introScreen = document.getElementById("intro-screen");
const gameHud = document.getElementById("game-hud");
const gameOverScreen = document.getElementById("game-over-screen");
const victoryScreen = document.getElementById("victory-screen");
const settingsModal = document.getElementById("settings-modal");

// Elementos de HUD e Modais
const currentScoreEl = document.getElementById("current-score");
const targetScoreDisplayEl = document.getElementById("target-score-display");
const progressBarEl = document.getElementById("progress-bar");
const finalScoreEl = document.getElementById("final-score");
const countdownTimerEl = document.getElementById("countdown-timer");

// Inputs de Configuração
const inputNextStageUrl = document.getElementById("next-stage-url");
const inputWinScore = document.getElementById("win-score");
const selectGameSpeed = document.getElementById("game-speed");
const inputAudioVolume = document.getElementById("audio-volume");

// Inicialização dos botões
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("skip-intro-btn").addEventListener("click", skipIntro);
document.getElementById("restart-btn").addEventListener("click", resetGame);
document.getElementById("settings-btn").addEventListener("click", openSettings);
document.getElementById("close-settings-btn").addEventListener("click", closeSettings);
document.getElementById("save-settings-btn").addEventListener("click", saveSettings);
document.getElementById("redirect-now-btn").addEventListener("click", redirectToNextStage);

// ==========================================================================
// SISTEMA DE ÁUDIO SINTETIZADO (WEB AUDIO API)
// ==========================================================================
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Toca som de propulsor da nave (Flap)
function playPropulsionSound() {
    if (!audioCtx || gameConfig.volume === 0) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Tipo de onda triangular dá um som de motor retrô
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    // Rampa de frequência descendente rápida
    osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.15);
    
    // Controle de volume (Envelope)
    gainNode.gain.setValueAtTime(gameConfig.volume * 0.4, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.18);
    
    // Adiciona um ruído branco curto filtrado para dar o efeito de ar/vento de propulsão
    playNoiseBurst(0.12, 400, 0.2);
}

// Toca ruído branco filtrado (auxiliar)
function playNoiseBurst(duration, filterFreq, volMultiplier) {
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, audioCtx.currentTime);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(gameConfig.volume * volMultiplier, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noiseNode.start();
    noiseNode.stop(audioCtx.currentTime + duration);
}

// Toca bip simpático estilo R2-D2 ao pontuar
function playR2D2Sound() {
    if (!audioCtx || gameConfig.volume === 0) return;
    
    const now = audioCtx.currentTime;
    
    // Nota 1
    playTone(1100, 0.06, now, 0.2, "sine");
    // Nota 2 rapidinha
    playTone(1500, 0.08, now + 0.06, 0.18, "sine");
    // Nota 3 de retorno
    playTone(950, 0.05, now + 0.14, 0.2, "sine");
}

function playTone(freq, duration, startTime, vol, type = "sine") {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gainNode.gain.setValueAtTime(gameConfig.volume * vol, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}

// Som de explosão ao colidir (Game Over)
function playExplosionSound() {
    if (!audioCtx || gameConfig.volume === 0) return;
    
    // Som grave e áspero
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(120, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(10, audioCtx.currentTime + 0.45);
    
    gainNode.gain.setValueAtTime(gameConfig.volume * 0.6, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
    
    // Ruído branco grave para o estouro
    playNoiseBurst(0.6, 250, 0.7);
}

// Tocador de partitura de vitória (Trilha Sonora Espacial retrô)
function playVictoryFanfare() {
    if (!audioCtx || gameConfig.volume === 0) return;
    
    const now = audioCtx.currentTime;
    const vol = 0.25;
    
    // Notas da fanfarra triunfante
    const notes = [
        { freq: 261.63, dur: 0.25, time: 0.0 }, // C4
        { freq: 392.00, dur: 0.25, time: 0.25 }, // G4
        { freq: 349.23, dur: 0.12, time: 0.5 },  // F4
        { freq: 329.63, dur: 0.12, time: 0.62 }, // E4
        { freq: 293.66, dur: 0.12, time: 0.74 }, // D4
        { freq: 523.25, dur: 0.35, time: 0.86 }, // C5
        { freq: 392.00, dur: 0.25, time: 1.25 }, // G4
        { freq: 349.23, dur: 0.12, time: 1.5 },  // F4
        { freq: 329.63, dur: 0.12, time: 1.62 }, // E4
        { freq: 293.66, dur: 0.12, time: 1.74 }, // D4
        { freq: 523.25, dur: 0.40, time: 1.86 }  // C5
    ];
    
    notes.forEach(note => {
        playTone(note.freq, note.dur, now + note.time, vol, "triangle");
    });
}

// ==========================================================================
// FÍSICA E PARÂMETROS DE DIFICULDADE
// ==========================================================================
let physics = {
    gravity: 0.25,
    jumpForce: -5.8,
    pipeSpeed: 2.2,
    pipeSpacing: 210,
    pipeGap: 145
};

function updatePhysicsDifficulty() {
    switch (gameConfig.difficulty) {
        case "easy":
            physics.gravity = 0.20;
            physics.jumpForce = -5.2;
            physics.pipeSpeed = 1.8;
            physics.pipeSpacing = 240;
            physics.pipeGap = 165;
            break;
        case "hard":
            physics.gravity = 0.30;
            physics.jumpForce = -6.4;
            physics.pipeSpeed = 2.8;
            physics.pipeSpacing = 185;
            physics.pipeGap = 125;
            break;
        case "medium":
default:
            physics.gravity = 0.25;
            physics.jumpForce = -5.8;
            physics.pipeSpeed = 2.2;
            physics.pipeSpacing = 210;
            physics.pipeGap = 145;
            break;
    }
}

// ==========================================================================
// ENTIDADES DO JOGO
// ==========================================================================

// 1. Nave Espacial (X-Wing)
const player = {
    x: 80,
    y: 280,
    radius: 16,
    velocity: 0,
    angle: 0,
    engineThrust: 0, // Controla tamanho do jato azul da turbina
    
    jump: function() {
        if (currentState !== STATES.PLAYING) return;
        this.velocity = physics.jumpForce;
        this.engineThrust = 10; // Liga propulsão
        playPropulsionSound();
    },
    
    update: function() {
        // Gravidade atua sobre a velocidade da nave
        this.velocity += physics.gravity;
        this.y += this.velocity;
        
        // Inclina a nave baseado na velocidade de queda/subida
        this.angle = Math.min(Math.max(this.velocity * 0.06, -0.4), 0.6);
        
        // Diminui o rastro visual de propulsão
        if (this.engineThrust > 0) this.engineThrust -= 0.8;
        
        // Colisão com os limites da tela (chão e teto)
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            gameOver();
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.velocity = 0.5; // rebate de leve no teto
        }
    },
    
    draw: function() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Efeito Brilho do Motor Traseiro (Laser Blue)
        if (this.engineThrust > 0) {
            const thrustLength = 10 + this.engineThrust + Math.random() * 5;
            const gradient = ctx.createLinearGradient(-15, 0, -15 - thrustLength, 0);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, 'rgba(0, 229, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 100, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(-15, -4);
            ctx.lineTo(-15 - thrustLength, 0);
            ctx.lineTo(-15, 4);
            ctx.closePath();
            ctx.fill();
        }
        
        // DESENHO VETORIAL DA X-WING (Lado/Perspectiva Traseira diagonal)
        ctx.lineWidth = 2;
        
        // 1. Corpo/Fuselagem Central (Cinza Claro)
        ctx.fillStyle = "#e0e0e0";
        ctx.strokeStyle = "#9e9e9e";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 2. Cockpit (Azul Transparente)
        ctx.fillStyle = "rgba(0, 229, 255, 0.7)";
        ctx.strokeStyle = "#00e5ff";
        ctx.beginPath();
        ctx.ellipse(3, -2, 6, 3, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 3. Turbinas/Motores Traseiros (Cinza Escuro com núcleo vermelho)
        ctx.fillStyle = "#555";
        ctx.strokeStyle = "#333";
        ctx.fillRect(-15, -5, 6, 4);
        ctx.strokeRect(-15, -5, 6, 4);
        ctx.fillRect(-15, 1, 6, 4);
        ctx.strokeRect(-15, 1, 6, 4);
        
        // Bocal brilhante da turbina
        ctx.fillStyle = "#ff3d00";
        ctx.fillRect(-16, -4, 1, 2);
        ctx.fillRect(-16, 2, 1, 2);
        
        // 4. Asas (Design clássico X-Wing)
        ctx.strokeStyle = "#d0d0d0";
        ctx.fillStyle = "#f5f5f5";
        
        // Asas superiores (inclinadas para cima e trás)
        ctx.beginPath();
        ctx.moveTo(-6, -3);
        ctx.lineTo(-12, -18);
        ctx.lineTo(-2, -18);
        ctx.lineTo(4, -3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Asas inferiores (inclinadas para baixo e trás)
        ctx.beginPath();
        ctx.moveTo(-6, 3);
        ctx.lineTo(-12, 18);
        ctx.lineTo(-2, 18);
        ctx.lineTo(4, 3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 5. Canhões Laser (nas pontas das asas)
        ctx.strokeStyle = "#a0a0a0";
        ctx.lineWidth = 1.5;
        
        // Laser superior
        ctx.beginPath();
        ctx.moveTo(-8, -18);
        ctx.lineTo(12, -18);
        ctx.stroke();
        // Laser inferior
        ctx.beginPath();
        ctx.moveTo(-8, 18);
        ctx.lineTo(12, 18);
        ctx.stroke();
        
        // Ponteira vermelha nos lasers
        ctx.fillStyle = "#ff1e56";
        ctx.fillRect(12, -19, 3, 2);
        ctx.fillRect(12, 17, 3, 2);
        
        // Detalhe Rebelde (Listras laranjas na fuselagem)
        ctx.fillStyle = "#ff6f00";
        ctx.fillRect(-2, -3, 3, 1);
        ctx.fillRect(-4, 2, 3, 1);
        
        ctx.restore();
    }
};

// 2. Obstáculos (Torres Laser da Estrela da Morte)
let pipes = [];

class Pipe {
    constructor(x) {
        this.x = x;
        this.width = 54;
        
        // Define a altura livre aleatória entre o topo e o fundo
        const minHeight = 60;
        const maxHeight = canvas.height - physics.pipeGap - minHeight;
        this.topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        this.bottomHeight = canvas.height - physics.pipeGap - this.topHeight;
        this.passed = false;
        
        // Cor dos painéis e lasers das torres imperiais
        this.panelColor = "#2d303a";
        this.panelBorderColor = "#1a1b21";
        this.laserNodeColor = "#ff1e56"; // Vermelho do Império
    }
    
    update() {
        this.x -= physics.pipeSpeed;
    }
    
    draw() {
        ctx.save();
        
        // Adiciona sombra suave nas torres para dar efeito 3D
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 3;
        
        // --- TORRE SUPERIOR ---
        this.drawTower(this.x, 0, this.width, this.topHeight, true);
        
        // --- TORRE INFERIOR ---
        this.drawTower(this.x, canvas.height - this.bottomHeight, this.width, this.bottomHeight, false);
        
        ctx.restore();
    }
    
    drawTower(x, y, w, h, isTop) {
        // Corpo principal da torre (Preenchimento cinza escuro blindado imperial)
        ctx.fillStyle = this.panelColor;
        ctx.strokeStyle = this.panelBorderColor;
        ctx.lineWidth = 3;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        
        // Linhas de painel metálico interno (Detalhe sci-fi)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1.5;
        const panelSize = 25;
        for (let py = y + 10; py < y + h - 10; py += panelSize) {
            ctx.beginPath();
            ctx.moveTo(x + 4, py);
            ctx.lineTo(x + w - 4, py);
            ctx.stroke();
        }
        
        // Linha central vertical de ventilação ou detalhe tecnológico
        ctx.fillStyle = "#16171d";
        ctx.fillRect(x + w/2 - 3, y + 5, 6, h - 10);
        
        // Ponta da Torre (Emissor de Laser Imperial)
        const capHeight = 16;
        const capY = isTop ? y + h - capHeight : y;
        
        ctx.fillStyle = "#1e2129";
        ctx.strokeStyle = this.panelBorderColor;
        ctx.lineWidth = 2.5;
        ctx.fillRect(x - 2, capY, w + 4, capHeight);
        ctx.strokeRect(x - 2, capY, w + 4, capHeight);
        
        // Luz de energia brilhante na ponta do canhão de defesa
        const lightX = x + w / 2;
        const lightY = isTop ? capY + capHeight - 4 : capY + 4;
        
        ctx.fillStyle = this.laserNodeColor;
        ctx.shadowColor = this.laserNodeColor;
        ctx.shadowBlur = Math.sin(Date.now() * 0.01) * 4 + 8; // Efeito pulsar
        
        ctx.beginPath();
        ctx.arc(lightX, lightY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Pequeno canhão laser projetado
        ctx.fillStyle = "#0c0d10";
        ctx.shadowBlur = 0; // Desliga sombra para o metal
        if (isTop) {
            ctx.fillRect(lightX - 3, lightY + 2, 6, 8);
        } else {
            ctx.fillRect(lightX - 3, lightY - 10, 6, 8);
        }
    }
    
    // Verifica colisão precisa
    checkCollision(playerObj) {
        // Encontra o ponto mais próximo dentro da torre retangular
        // Torre de cima:
        const topCollide = this.checkRectCollision(playerObj, this.x, 0, this.width, this.topHeight);
        // Torre de baixo:
        const bottomCollide = this.checkRectCollision(playerObj, this.x, canvas.height - this.bottomHeight, this.width, this.bottomHeight);
        
        return topCollide || bottomCollide;
    }
    
    checkRectCollision(circle, rx, ry, rw, rh) {
        // Ponto mais próximo do centro do círculo no retângulo
        const closestX = Math.max(rx, Math.min(circle.x, rx + rw));
        const closestY = Math.max(ry, Math.min(circle.y, ry + rh));
        
        // Distância entre o ponto mais próximo e o centro do círculo
        const distanceX = circle.x - closestX;
        const distanceY = circle.y - closestY;
        
        // Teorema de Pitágoras
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        
        // Colide se a distância for menor que o raio da nave
        return distanceSquared < (circle.radius * circle.radius);
    }
}

// 3. Estrelas de Fundo Animadas (Efeito Hiperespaço/Paralaxe)
let stars = [];
const STAR_COUNT = 65;

function initStars() {
    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 1.8 + 0.5,
            speed: Math.random() * 0.6 + 0.1, // velocidade para o paralaxe básico
            color: getRandomStarColor()
        });
    }
}

function getRandomStarColor() {
    const colors = ["#ffffff", "#e0f7fa", "#ffe81f", "#b3e5fc"];
    return colors[Math.floor(Math.random() * colors.length)];
}

function updateStars(isWarpSpeed = false) {
    stars.forEach(star => {
        if (isWarpSpeed) {
            // No hiperespaço, as estrelas voam extremamente rápido para a esquerda
            star.x -= star.speed * 28;
        } else {
            // Paralaxe normal
            star.x -= star.speed * (physics.pipeSpeed * 0.4);
        }
        
        // Se a estrela sair da tela, reseta no canto direito
        if (star.x < -15) {
            star.x = canvas.width + 10;
            star.y = Math.random() * canvas.height;
            star.size = Math.random() * 1.8 + 0.5;
            star.speed = Math.random() * 0.6 + 0.1;
        }
    });
}

function drawStars(isWarpSpeed = false) {
    stars.forEach(star => {
        ctx.fillStyle = star.color;
        
        if (isWarpSpeed) {
            // Desenha linhas longas imitando efeito clássico de Star Wars entrando na velocidade da luz
            ctx.strokeStyle = star.color;
            ctx.lineWidth = star.size * 0.8;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            // Comprimento da linha de dobra depende da velocidade
            ctx.lineTo(star.x + star.speed * 45, star.y);
            ctx.stroke();
        } else {
            // Desenha estrela pontual
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

// ==========================================================================
// CONTROLE DE FLUXO DO JOGO
// ==========================================================================
let score = 0;
let animationFrameId = null;
let countdownInterval = null;

// Inicialização Geral ao Carregar
initStars();
updatePhysicsDifficulty();
renderStartMenu();

// Renderiza a primeira tela estática por trás do crawl
function renderStartMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars(false);
    player.draw();
}

// Pula Letreiro de Intro e mostra a tela para iniciar
function skipIntro() {
    initAudio();
    introScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    victoryScreen.classList.add("hidden");
    gameHud.classList.remove("hidden");
    
    // Configura tela inicial de pré-jogo
    score = 0;
    updateScoreUI();
    resetEntities();
    
    currentState = STATES.PLAYING;
    gameLoop();
}

function startGame() {
    initAudio();
    skipIntro();
}

function resetEntities() {
    player.x = 80;
    player.y = canvas.height / 2;
    player.velocity = 0;
    player.angle = 0;
    player.engineThrust = 0;
    
    pipes = [];
    // Adiciona o primeiro obstáculo a uma distância segura
    pipes.push(new Pipe(canvas.width + 100));
}

// Loop Principal do Jogo (Canvas)
function gameLoop() {
    if (currentState !== STATES.PLAYING && currentState !== STATES.VICTORY) {
        return;
    }
    
    // Limpa tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 1. Atualizar e Desenhar Estrelas
    const isWarp = (currentState === STATES.VICTORY);
    updateStars(isWarp);
    drawStars(isWarp);
    
    // Se estiver em modo de vitória, só renderiza o hiperespaço e a nave acelerando
    if (currentState === STATES.VICTORY) {
        player.x += 3.5; // Nave avança acelerando para fora da tela
        player.angle = 0;
        player.engineThrust = 15;
        player.update();
        player.draw();
        
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }
    
    // 2. Atualizar e Desenhar Nave
    player.update();
    player.draw();
    
    // 3. Atualizar e Desenhar Obstáculos (Torres)
    if (pipes.length === 0 || (canvas.width - pipes[pipes.length - 1].x) >= physics.pipeSpacing) {
        pipes.push(new Pipe(canvas.width));
    }
    
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].update();
        pipes[i].draw();
        
        // Verifica Colisão
        if (pipes[i].checkCollision(player)) {
            gameOver();
            return;
        }
        
        // Adiciona ponto se a nave passou a torre com sucesso
        if (!pipes[i].passed && pipes[i].x + pipes[i].width < player.x) {
            pipes[i].passed = true;
            score++;
            playR2D2Sound();
            updateScoreUI();
            
            // Checa condição de vitória
            if (score >= gameConfig.winScore) {
                triggerVictory();
                return;
            }
        }
        
        // Remove torres fora da tela
        if (pipes[i].x < -pipes[i].width - 10) {
            pipes.splice(i, 1);
        }
    }
    
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Atualiza placar na tela
function updateScoreUI() {
    currentScoreEl.textContent = score.toString().padStart(2, '0');
    targetScoreDisplayEl.textContent = gameConfig.winScore.toString().padStart(2, '0');
    
    // Calcula progresso para a barra de hiperespaço
    const progressPercent = Math.min((score / gameConfig.winScore) * 100, 100);
    progressBarEl.style.width = `${progressPercent}%`;
}

// Fim de Jogo (Game Over)
function gameOver() {
    currentState = STATES.GAMEOVER;
    cancelAnimationFrame(animationFrameId);
    
    playExplosionSound();
    
    finalScoreEl.textContent = score;
    gameHud.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");
}

// Reseta e volta a jogar
function resetGame() {
    gameOverScreen.classList.add("hidden");
    victoryScreen.classList.add("hidden");
    gameHud.classList.remove("hidden");
    
    score = 0;
    updateScoreUI();
    resetEntities();
    
    currentState = STATES.PLAYING;
    gameLoop();
}

// Disparo da Tela de Vitória
function triggerVictory() {
    currentState = STATES.VICTORY;
    
    // Toca música espacial e ativa hiperespaço
    playVictoryFanfare();
    
    gameHud.classList.add("hidden");
    victoryScreen.classList.remove("hidden");
    
    // Inicia contagem regressiva para a próxima fase
    let secondsLeft = 3;
    countdownTimerEl.textContent = secondsLeft;
    
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        secondsLeft--;
        countdownTimerEl.textContent = secondsLeft;
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            redirectToNextStage();
        }
    }, 1000);
}

// Redirecionamento de Página
function redirectToNextStage() {
    if (countdownInterval) clearInterval(countdownInterval);
    
    // Tenta navegar para a página configurada
    const destUrl = gameConfig.nextStageUrl || "inicio/index.html";
    console.log("Redirecionando para:", destUrl);
    window.location.href = destUrl;
}

// ==========================================================================
// CONTROLES DE INPUT (TECLADO, MOUSE, TOUCH)
// ==========================================================================

// Teclado
window.addEventListener("keydown", function(e) {
    if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault(); // Evita rolagem do espaço
        handleGameTrigger();
    }
});

// Clique do Mouse
canvas.addEventListener("mousedown", function(e) {
    if (e.button === 0) { // Botão esquerdo
        handleGameTrigger();
    }
});

// Toque na Tela (Celulares)
canvas.addEventListener("touchstart", function(e) {
    e.preventDefault(); // Evita zoom e scroll do toque
    handleGameTrigger();
}, { passive: false });

// Função centralizada para lidar com a interação principal
function handleGameTrigger() {
    initAudio();
    
    if (currentState === STATES.PLAYING) {
        player.jump();
    } else if (currentState === STATES.GAMEOVER) {
        resetGame();
    } else if (currentState === STATES.INTRO) {
        startGame();
    }
}

// ==========================================================================
// PAINEL DE CONFIGURAÇÕES (GERENCIAMENTO)
// ==========================================================================

function openSettings() {
    // Carrega valores vigentes nos inputs
    inputNextStageUrl.value = gameConfig.nextStageUrl;
    inputWinScore.value = gameConfig.winScore;
    selectGameSpeed.value = gameConfig.difficulty;
    inputAudioVolume.value = Math.round(gameConfig.volume * 100);
    
    // Pausa loop temporariamente exibindo modal
    if (currentState === STATES.PLAYING) {
        cancelAnimationFrame(animationFrameId);
    }
    settingsModal.classList.remove("hidden");
}

function closeSettings() {
    settingsModal.classList.add("hidden");
    // Resume o loop de onde parou caso estivesse jogando
    if (currentState === STATES.PLAYING) {
        gameLoop();
    }
}

function saveSettings() {
    // Valida pontuação
    let newWinScore = parseInt(inputWinScore.value);
    if (isNaN(newWinScore) || newWinScore < 1) newWinScore = 10;
    
    // Atualiza objeto de configuração
    gameConfig.nextStageUrl = inputNextStageUrl.value.trim() || "inicio/index.html";
    gameConfig.winScore = newWinScore;
    gameConfig.difficulty = selectGameSpeed.value;
    gameConfig.volume = parseFloat(inputAudioVolume.value) / 100;
    
    // Salva no localStorage
    try {
        localStorage.setItem("sw_trench_run_config", JSON.stringify(gameConfig));
    } catch (e) {
        console.error("Não foi possível salvar no localStorage", e);
    }
    
    // Atualiza física e HUD
    updatePhysicsDifficulty();
    updateScoreUI();
    
    // Fecha modal e reinicia jogo
    settingsModal.classList.add("hidden");
    resetGame();
}
