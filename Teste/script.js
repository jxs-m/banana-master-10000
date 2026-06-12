const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const messageOverlay = document.getElementById('messageOverlay');
const messageText = document.getElementById('messageText');

let attempts = 5;
let canClick = false;
let isRunning = false;
let isFixed = false;

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

    if (distanceToMouse < 100 && !isRunning) {
        isRunning = true;
        
        if (!isFixed) {
            noBtn.style.position = 'fixed';
            isFixed = true;
        }
        
        moveNoAway(yesBtnRect);
        
        setTimeout(() => {
            if (attempts > 0) {
                attempts--;
                isRunning = false;
            } else {
                enableClick();
            }
        }, 600);
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
        newTop = Math.random() * (screenHeight - btnHeight - 40) + 20;
        newLeft = Math.random() * (screenWidth - btnWidth - 40) + 20;
        
        const yesCenterX = yesBtnRect.left + yesBtnRect.width / 2;
        const yesCenterY = yesBtnRect.top + yesBtnRect.height / 2;
        
        const distToYes = Math.sqrt(
            Math.pow((newLeft + btnWidth/2) - yesCenterX, 2) + 
            Math.pow((newTop + btnHeight/2) - yesCenterY, 2)
        );
        
        if (distToYes > 150) {
            validPosition = true;
        }
        attemptsMove++;
    }
    
    noBtn.style.top = newTop + 'px';
    noBtn.style.left = newLeft + 'px';
}

function enableClick() {
    canClick = true;
}

function onNoClicked() {
    if (!canClick) {
        return;
    }
    
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

let enemiesKilled = 0;
const game1 = document.getElementById('game1');
const gameArea1 = document.getElementById('gameArea1');
const target1 = document.getElementById('target1');

function startMiniGame1() {
    enemiesKilled = 0;
    document.getElementById('score1').innerText = 'Inimigos restantes: 5';
    game1.classList.add('active');
    moveTarget();
}

function moveTarget() {
    if (!game1.classList.contains('active')) return;
    
    const maxTop = gameArea1.clientHeight - 50;
    const maxLeft = gameArea1.clientWidth - 50;
    
    const newTop = Math.random() * maxTop;
    const newLeft = Math.random() * maxLeft;
    
    target1.style.top = newTop + 'px';
    target1.style.left = newLeft + 'px';
}

target1.addEventListener('click', function() {
    enemiesKilled++;
    const remaining = 5 - enemiesKilled;
    document.getElementById('score1').innerText = 'Inimigos restantes: ' + remaining;
    
    if (enemiesKilled >= 5) {
        closeGame(1);
        finishGame(true);
    } else {
        moveTarget();
    }
});

function closeGame(id) {
    if (id === 1) game1.classList.remove('active');
    if (id === 2) game2.classList.remove('active');
}

function returnToMain() {
    closeGame(1);
    closeGame(2);
}

let resistClicks = 0;
const game2 = document.getElementById('game2');

function startMiniGame2() {
    resistClicks = 0;
    document.getElementById('counter2').innerText = 'Força restante: 10';
    game2.classList.add('active');
}

function surviveGame() {
    resistClicks++;
    const remaining = 10 - resistClicks;
    document.getElementById('counter2').innerText = 'Força restante: ' + remaining;
    
    if (resistClicks >= 10) {
        closeGame(2);
        finishGame(true);
    }
}

function finishGame(won) {
    if (won) {
        closeGame(1);
        closeGame(2);
        document.getElementById('successScreen').classList.add('active');
    }
}