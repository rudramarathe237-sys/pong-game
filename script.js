// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gameWidth = canvas.width;
const gameHeight = canvas.height;
const paddleHeight = 100;
const paddleWidth = 10;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeed = 4;

let gameRunning = false;
let gamesPaused = false;

// Player paddle (left)
const playerPaddle = {
    x: 10,
    y: gameHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed
};

// Computer paddle (right)
const computerPaddle = {
    x: gameWidth - paddleWidth - 10,
    y: gameHeight / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: paddleSpeed * 0.8
};

// Ball
const ball = {
    x: gameWidth / 2,
    y: gameHeight / 2,
    radius: ballSize,
    dx: ballSpeed,
    dy: ballSpeed,
    speed: ballSpeed
};

// Score
let playerScore = 0;
let computerScore = 0;

// Keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Space to start/pause
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse input for player paddle
let mouseY = gameHeight / 2;
window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update game state
function update() {
    if (!gameRunning) return;

    // Player paddle movement - Arrow keys and mouse
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        playerPaddle.y -= playerPaddle.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        playerPaddle.y += playerPaddle.speed;
    }
    
    // Also allow mouse movement for smoother control
    const mouseDistanceFromPaddle = Math.abs(mouseY - (playerPaddle.y + paddleHeight / 2));
    if (mouseDistanceFromPaddle > 10) {
        if (mouseY < playerPaddle.y + paddleHeight / 2) {
            playerPaddle.y -= playerPaddle.speed;
        } else if (mouseY > playerPaddle.y + paddleHeight / 2) {
            playerPaddle.y += playerPaddle.speed;
        }
    }

    // Paddle boundary collision (player)
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > gameHeight) {
        playerPaddle.y = gameHeight - playerPaddle.height;
    }

    // Computer AI - follows the ball with some predictive logic
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    const aiReactionDistance = 50;

    if (ballCenter < computerCenter - aiReactionDistance) {
        computerPaddle.y -= computerPaddle.speed;
    } else if (ballCenter > computerCenter + aiReactionDistance) {
        computerPaddle.y += computerPaddle.speed;
    }

    // Paddle boundary collision (computer)
    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > gameHeight) {
        computerPaddle.y = gameHeight - computerPaddle.height;
    }

    // Ball movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > gameHeight) {
        ball.dy = -ball.dy;
        // Clamp ball position to avoid getting stuck
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
        }
        if (ball.y + ball.radius > gameHeight) {
            ball.y = gameHeight - ball.radius;
        }
    }

    // Ball collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        if (ball.dx < 0) {
            ball.dx = -ball.dx;
            ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
            
            // Add spin based on where ball hits paddle
            const collidePoint = ball.y - (playerPaddle.y + playerPaddle.height / 2);
            ball.dy = (collidePoint / (playerPaddle.height / 2)) * ball.speed;
            
            // Increase ball speed slightly
            ball.speed = Math.min(ball.speed + 0.3, 8);
            ball.dx = ball.speed;
        }
    }

    // Computer paddle collision
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        if (ball.dx > 0) {
            ball.dx = -ball.dx;
            ball.x = computerPaddle.x - ball.radius;
            
            // Add spin based on where ball hits paddle
            const collidePoint = ball.y - (computerPaddle.y + computerPaddle.height / 2);
            ball.dy = (collidePoint / (computerPaddle.height / 2)) * ball.speed;
            
            // Increase ball speed slightly
            ball.speed = Math.min(ball.speed + 0.3, 8);
            ball.dx = -ball.speed;
        }
    }

    // Ball out of bounds (scoring)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScore();
        resetBall();
    }
    if (ball.x + ball.radius > gameWidth) {
        playerScore++;
        updateScore();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = gameWidth / 2;
    ball.y = gameHeight / 2;
    ball.speed = ballSpeed;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeed;
    ball.dy = (Math.random() - 0.5) * ballSpeed;
    gameRunning = false;
}

// Draw game elements
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, gameWidth, gameHeight);

    // Draw center line
    ctx.strokeStyle = '#667eea';
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(gameWidth / 2, 0);
    ctx.lineTo(gameWidth / 2, gameHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = '#667eea';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

    // Draw ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw "Press Space to Start" text when game is not running
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to Start', gameWidth / 2, gameHeight / 2 - 40);
    }
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();

// Initialize score display
updateScore();
