const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
const canvasSize = 400;
const rows = canvasSize / box;
const columns = canvasSize / box;

let snake;
let food;
let direction;
let score;
let game;
let highScores = [];
let gameSpeed = 100;

const highScoreListElement = document.getElementById('highScoreList');
const difficultySelect = document.getElementById('difficultySelect');

difficultySelect.addEventListener('change', setDifficulty);

function setDifficulty() {
    const difficulty = difficultySelect.value;
    if (difficulty === 'easy') {
        gameSpeed = 150;
    } else if (difficulty === 'medium') {
        gameSpeed = 100;
    } else if (difficulty === 'hard') {
        gameSpeed = 50;
    }
    if (game) {
        clearInterval(game);
        game = setInterval(gameLoop, gameSpeed);
    }
}

function init() {
    loadHighScores();
    updateHighScoreList();
    setDifficulty();

    snake = [];
    snake[0] = { x: Math.floor(columns / 2) * box, y: Math.floor(rows / 2) * box };

    food = generateFood();

    direction = null;
    score = 0;

    if (game) clearInterval(game);
    game = setInterval(gameLoop, gameSpeed);
    document.getElementById('playAgain').style.display = 'none';
}

function restartGame() {
    init();
}

document.addEventListener('keydown', setDirection);

function setDirection(event) {
    if (event.keyCode === 37 && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (event.keyCode === 38 && direction !== 'DOWN') {
        direction = 'UP';
    } else if (event.keyCode === 39 && direction !== 'LEFT') {
        direction = 'RIGHT';
    } else if (event.keyCode === 40 && direction !== 'UP') {
        direction = 'DOWN';
    }
}

function gameLoop() {
    update();
    draw();
}

function draw() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? '#61dafb' : '#ffffff';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = '#20232a';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = '#ff5555';
    ctx.fillRect(food.x, food.y, box, box);

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
}

function update() {
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
        score++;
        food = generateFood();
    } else {
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvasSize || snakeY >= canvasSize || collision(newHead, snake)) {
        clearInterval(game);
        saveHighScore(score);
        document.getElementById('playAgain').style.display = 'block';
    }

    snake.unshift(newHead);
}

function generateFood() {
    const food = {
        x: Math.floor(Math.random() * columns) * box,
        y: Math.floor(Math.random() * rows) * box
    };
    const foodElement = document.createElement('div');
    foodElement.classList.add('food');
    document.body.appendChild(foodElement);
    setTimeout(() => document.body.removeChild(foodElement), 300);
    return food;
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            animateCollision();
            return true;
        }
    }
    return false;
}

function animateCollision() {
    canvas.style.animation = 'collisionFlash 0.5s';
    canvas.addEventListener('animationend', () => {
        canvas.style.animation = '';
    });
}

function loadHighScores() {
    const savedScores = localStorage.getItem('highScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    }
}

function saveHighScore(score) {
    highScores.push(score);
    highScores.sort((a, b) => b - a);
    highScores = highScores.slice(0, 5); 
    localStorage.setItem('highScores', JSON.stringify(highScores));
    updateHighScoreList();
}

function updateHighScoreList() {
    highScoreListElement.innerHTML = '';
    highScores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        highScoreListElement.appendChild(li);
    });
}

init();