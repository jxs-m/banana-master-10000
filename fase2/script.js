// --- SELETORES DO MINI GAME 2 ---
const gameArea2 = document.getElementById('gameArea2');
const babyYoda = document.getElementById('baby-yoda');
const runnerPlayer = document.getElementById('runner-player');
const runnerObstacle = document.getElementById('runner-obstacle');
const scoreDisplay2 = document.getElementById('score2');
const imperialShip = document.getElementById('imperial-ship');

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

window.onload = () => {
    startMiniGame2();
};

function startMiniGame2() {
    isRunnerActive = true;
    runnerScore = 0;
    scoreDisplay2.innerText = `Progresso da Perseguição: 0%`;
    scoreDisplay2.style.color = '#fff';
    
    // Reseta estados e animações do Baby Yoda
    babyYoda.classList.remove('yoda-enter-ship');
    babyYoda.style.bottom = '0';
    babyYoda.style.opacity = '1';

    // Reseta estados e animações do botão "NÃO"
    runnerPlayer.classList.remove('button-fly-away');
    runnerPlayer.style.bottom = '0';
    runnerPlayer.style.opacity = '1';
    runnerPlayer.style.left = '210px';
    
    // Reseta a Nave Imperial
    imperialShip.classList.remove('ship-arrive-yoda', 'ship-escape-yoda');

    // Reinicia o obstáculo
    runnerObstacle.style.display = 'block';
    runnerObstacle.classList.remove('obstacle-move');
    runnerObstacle.offsetHeight; 
    runnerObstacle.classList.add('obstacle-move');

    document.addEventListener('keydown', handleYodaJump);
    gameArea2.addEventListener('mousedown', handleYodaJump);
    
    clearInterval(loopInterval);
    loopInterval = setInterval(checkRunnerPhysics, 20);
}

function handleYodaJump(e) {
    if (!isRunnerActive) return;
    if (e.type === 'keydown' && e.code !== 'Space' && e.code !== 'ArrowUp') return;

    if (!babyYoda.classList.contains('jump-yoda')) {
        babyYoda.classList.add('jump-yoda');
        initAudio();
        playJumpSound();
        
        setTimeout(() => {
            babyYoda.classList.remove('jump-yoda');
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
        if (!runnerPlayer.classList.contains('jump-button')) {
            runnerPlayer.classList.add('jump-button');
            setTimeout(() => {
                runnerPlayer.classList.remove('jump-button');
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
        
        runnerObstacle.classList.remove('obstacle-move');
        playHitSound();
        
        gameArea2.style.boxShadow = '0 0 30px var(--neon-red) inset';
        scoreDisplay2.innerText = "Você foi atingido pelo Stormtrooper!";
        scoreDisplay2.style.color = "var(--neon-red)";
        
        document.removeEventListener('keydown', handleYodaJump);

        setTimeout(() => {
            gameArea2.style.boxShadow = '';
            startMiniGame2();
        }, 1500);
        return;
    }

    // ALTERAÇÃO AQUI: Mudando de 0.4 para 0.2 faz o progresso demorar 10s para chegar a 100%
    runnerScore += 0.2; 
    
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
    
    // 1. O botão "NÃO" decola para o espaço encolhendo até sumir da página
    setTimeout(() => {
        runnerPlayer.classList.add('button-fly-away');
    }, 500);

    // 2. A nave surge vinda de cima e para logo acima do Baby Yoda
    setTimeout(() => {
        scoreDisplay2.innerText = "O botão está fugindo!";
        scoreDisplay2.style.color = "#ff00a0";
        imperialShip.classList.add('ship-arrive-yoda');
    }, 2000);

    // 3. O Baby Yoda é abduzido (sobe reto para a nave e desaparece)
    setTimeout(() => {
        babyYoda.classList.add('yoda-enter-ship');
    }, 3500);

    // 4. A nave decola para o espaço levando o Baby Yoda (encolhendo até sumir da página)
    setTimeout(() => {
        imperialShip.classList.remove('ship-arrive-yoda');
        imperialShip.classList.add('ship-escape-yoda');
        scoreDisplay2.innerText = "Continua...";
        scoreDisplay2.style.color = "var(--neon-blue)";
    }, 4700);

    // 5. O jogo reinicia automaticamente
    setTimeout(() => {
        startMiniGame2();
    }, 6700);
}