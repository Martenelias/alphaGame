let canvas;
let ctx;
let balls = [];
let x;
let y;
let r = 20;
let rLimit = 40;
let xSpeed = 2;
let ySpeed = 2;
let xSpeedLimit = 4;
let ySpeedLimit = 4;
let ballsLimit = 10;
const baseAlphabet = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "Š ", "Z", "Ž", "T", "U", "V", "W", "Õ", "Ä", "Ö", "Ü", "X", "Y"];
let alphabet = [];
let numbers = "0123456789ABCDEF".split('');
let correctHit = 0;
let startTime;
let wrongClicks = 0;
let missedClicks = 0;
const chime = new Audio();
const audioURL = 'https://tigu.hk.tlu.ee/~andrus.rinde/media/sounds/game_test_response/';
const correct = 'correct.mp3';
const wrong = 'wrong.mp3';
const missed = 'missed.mp3';


window.onload = function(){
    canvas = document.querySelector("#canvas");
    ctx = canvas.getContext("2d");
    canvas.addEventListener('mousedown', checkForHits);
    document.querySelector('#startGame').addEventListener('click', initGame);
    document.querySelector('#restartGame').addEventListener('click', restartGame);
    document.querySelector('#restartGame').disabled = true;
    document.querySelector('#continue').addEventListener('click', closeWindow);
    chime.addEventListener('canplaythrough', audioInfo);
}

function closeWindow() {
    document.querySelector('#screen').style.display = "none";
}

function restartGame() {
    balls = [];
    alphabet = [];
    correctHit = 0;
    wrongClicks = 0;
    missedClicks = 0;
    xSpeedLimit = 2;
    ySpeedLimit = 2;
    
    initGame();
}

function initGame() {
    // Kontrollin, kas on juba 10 palli
    if (balls.length >= ballsLimit) {
        return;
    }
    alphabet = baseAlphabet.slice(0);
    for (let i = 0; i < baseAlphabet.length - ballsLimit; i ++) {
        let oneToRemove = Math.round(Math.random() * (alphabet.length - 1));
        alphabet.splice(oneToRemove, 1);
    }
    addBalls();
    document.querySelector('#startGame').disabled = true;
    document.querySelector('#restartGame').disabled = false;
}

class GameElement {
    constructor(x, y, r, letter) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.letter = letter;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.numbers = numbers;

        this.setSpeed();
        this.setRadius();
        this.getRandomColor();
    }

    setSpeed() {
            this.xSpeed = xSpeedLimit - (Math.round(Math.random() * xSpeedLimit * 2));
            this.ySpeed = ySpeedLimit - (Math.round(Math.random() * ySpeedLimit * 2));
    }

    // annab pallile suvalise raadiuse 20 kuni 40
    setRadius() {
        this.r = Math.floor(Math.random() * (rLimit - 20 + 1)) + 20;
    }

    // annab pallile suvalise hex värvi
    getRandomColor() {
        let color = "#";
        for (let i = 0; i < 6; i++) {
            color += this.numbers[Math.floor(Math.random() * 16)];
        }
        this.color = color;
    }

    drawSelf() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            ctx.fill();
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.font = "bold " + Math.round(this.r * 1.5) + "px Arial";
        ctx.textAlign = "center";
        ctx.textBaseLine = "middle";
        ctx.fillText(this.letter, this.x, this.y + Math.round(this.r / 2));
    }
    moveSelf() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
        if (this.x <= this.r || this.x >= canvas.width - this.r) {
            this.xSpeed *= -1;
        }
        if (this.y <= this.r || this.y >= canvas.height - this.r) {
            this.ySpeed *= -1;
        }
    }

    amIHit(mx, my) {
        ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            let wasHit = ctx.isPointInPath(mx, my);
        ctx.closePath();
        return wasHit;
    }
}

function addBalls() {
    startTime = new Date();
    x = canvas.width / 2;
    y = canvas.height / 2;
    for (let i = alphabet.length - 1; i > -1; i --) {
        balls.push(new GameElement(x, y, r, alphabet[i]));
    }

    drawBalls();
    moveBalls();
}

function drawBalls() {
    for (let i = 0; i < balls.length; i ++) {
        balls[i].drawSelf();
    }
}

function moveBalls() {
    canvas.width = canvas.width;
    for (let i = 0; i < balls.length; i ++) {
        balls[i].moveSelf();
        balls[i].drawSelf();
    }
    let elapsedTime = new Date().getTime() - startTime.getTime();
    let minutes = Math.floor(elapsedTime / 1000 / 60);
    let seconds = Math.floor((elapsedTime / 1000) % 60);
    let milliseconds = elapsedTime % 1000;
    document.querySelector('#time').textContent = `${minutes} . ${seconds} . ${milliseconds}`;
    if (balls.length > 0) {
        requestAnimationFrame(moveBalls);
    } else {
        //mangu lopp!!
        document.querySelector('#restartGame').disabled = false;
    }
}

function checkForHits(e) {
    let mx = e.clientX - e.target.offsetLeft + window.scrollX;
    let my = e.clientY - e.target.offsetTop + window.scrollY;
    let hit = false;

    for (let i = 0; i < balls.length; i ++) {
        if (balls[i].amIHit(mx, my)) {
            hit = true;
            if (balls[i].letter === alphabet[correctHit]) {
                correctHit ++;
                balls.splice(i, 1);
                chime.src = audioURL + correct;
                break;
            } else {
                wrongClicks++;
                chime.src = audioURL + wrong;
                document.querySelector('#wrongClicks').textContent = wrongClicks;
            }
            break;
        }
    }
    if (!hit) {
        missedClicks++;
        chime.src = audioURL + missed;
        document.querySelector('#missedClicks').textContent = missedClicks;
    }
}

function audioInfo() {
    chime.play();
}