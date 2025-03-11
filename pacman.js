// Initialize variables
const canvas = document.getElementById('pacman-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// Game settings
const CELL_SIZE = 20;
const GRID_WIDTH = canvas.width / CELL_SIZE;
const GRID_HEIGHT = canvas.height / CELL_SIZE;
const PACMAN_SPEED = 2; // Reduced from 5 to 2

// Game state
let score = 0;
let gameRunning = false;
let animationId;

// Maze layout - 0: empty path, 1: wall
const maze = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Directions
const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// Pacman object
const pacman = {
    x: 1 * CELL_SIZE,
    y: 1 * CELL_SIZE,
    radius: CELL_SIZE / 2,
    direction: DIRECTIONS.RIGHT,
    nextDirection: DIRECTIONS.RIGHT,
    speed: PACMAN_SPEED,
    mouthOpen: 0.2,
    mouthChange: 0.02,
    color: 'yellow'
};

// Ghosts array
const ghosts = [
    { x: 1 * CELL_SIZE, y: 3 * CELL_SIZE, color: 'red', direction: DIRECTIONS.RIGHT, speed: 1.5 },
    { x: 18 * CELL_SIZE, y: 1 * CELL_SIZE, color: 'pink', direction: DIRECTIONS.LEFT, speed: 1.2 },
    { x: 1 * CELL_SIZE, y: 18 * CELL_SIZE, color: 'cyan', direction: DIRECTIONS.UP, speed: 1.4 },
    { x: 18 * CELL_SIZE, y: 18 * CELL_SIZE, color: 'orange', direction: DIRECTIONS.DOWN, speed: 1.3 }
];

// Food dots
let dots = [];

// Initialize food dots
function initDots() {
    dots = [];
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            // Only add dots in empty spaces (not walls)
            if (maze[y][x] === 0) {
                // Skip where ghosts and pacman start
                if ((x === 10 && y === 10) || 
                    (x === 5 && y === 5) || 
                    (x === 15 && y === 5) || 
                    (x === 5 && y === 15) || 
                    (x === 15 && y === 15)) {
                    continue;
                }
                
                dots.push({ x: x * CELL_SIZE, y: y * CELL_SIZE, eaten: false });
            }
        }
    }
}

// Handle keyboard input
document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;
    
    switch (e.key) {
        case 'ArrowUp':
            pacman.nextDirection = DIRECTIONS.UP;
            break;
        case 'ArrowDown':
            pacman.nextDirection = DIRECTIONS.DOWN;
            break;
        case 'ArrowLeft':
            pacman.nextDirection = DIRECTIONS.LEFT;
            break;
        case 'ArrowRight':
            pacman.nextDirection = DIRECTIONS.RIGHT;
            break;
    }
});

// Draw pacman
function drawPacman() {
    // Update mouth animation
    pacman.mouthOpen += pacman.mouthChange;
    if (pacman.mouthOpen > 0.5 || pacman.mouthOpen < 0.05) {
        pacman.mouthChange *= -1;
    }
    
    // Calculate mouth angles based on direction
    let startAngle = 0;
    let endAngle = 2 * Math.PI;
    
    if (pacman.direction === DIRECTIONS.RIGHT) {
        startAngle = pacman.mouthOpen * Math.PI;
        endAngle = (2 - pacman.mouthOpen) * Math.PI;
    } else if (pacman.direction === DIRECTIONS.LEFT) {
        startAngle = (1 + pacman.mouthOpen) * Math.PI;
        endAngle = (1 - pacman.mouthOpen) * Math.PI;
    } else if (pacman.direction === DIRECTIONS.UP) {
        startAngle = (1.5 + pacman.mouthOpen/2) * Math.PI;
        endAngle = (1.5 - pacman.mouthOpen/2) * Math.PI;
    } else if (pacman.direction === DIRECTIONS.DOWN) {
        startAngle = (0.5 + pacman.mouthOpen/2) * Math.PI;
        endAngle = (0.5 - pacman.mouthOpen/2) * Math.PI;
    }
    
    // Draw pacman
    ctx.beginPath();
    ctx.arc(pacman.x + pacman.radius, pacman.y + pacman.radius, pacman.radius, startAngle, endAngle);
    ctx.lineTo(pacman.x + pacman.radius, pacman.y + pacman.radius);
    ctx.closePath();
    ctx.fillStyle = pacman.color;
    ctx.fill();
}

// Draw ghosts
function drawGhosts() {
    ghosts.forEach(ghost => {
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE/2, ghost.y + CELL_SIZE/2, CELL_SIZE/2, 0, Math.PI, true);
        ctx.rect(ghost.x, ghost.y + CELL_SIZE/2, CELL_SIZE, CELL_SIZE/2);
        ctx.fillStyle = ghost.color;
        ctx.fill();
        
        // Draw eyes
        const eyeRadius = CELL_SIZE/6;
        const eyeOffset = CELL_SIZE/5;
        
        // Left eye
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE/2 - eyeOffset, ghost.y + CELL_SIZE/2 - eyeOffset, eyeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE/2 + eyeOffset, ghost.y + CELL_SIZE/2 - eyeOffset, eyeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Pupils (look in the direction the ghost is moving)
        const pupilRadius = eyeRadius/2;
        let pupilOffsetX = 0;
        let pupilOffsetY = 0;
        
        if (ghost.direction === DIRECTIONS.RIGHT) pupilOffsetX = eyeRadius/3;
        else if (ghost.direction === DIRECTIONS.LEFT) pupilOffsetX = -eyeRadius/3;
        else if (ghost.direction === DIRECTIONS.UP) pupilOffsetY = -eyeRadius/3;
        else if (ghost.direction === DIRECTIONS.DOWN) pupilOffsetY = eyeRadius/3;
        
        // Left pupil
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE/2 - eyeOffset + pupilOffsetX, ghost.y + CELL_SIZE/2 - eyeOffset + pupilOffsetY, pupilRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
        
        // Right pupil
        ctx.beginPath();
        ctx.arc(ghost.x + CELL_SIZE/2 + eyeOffset + pupilOffsetX, ghost.y + CELL_SIZE/2 - eyeOffset + pupilOffsetY, pupilRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
    });
}

// Draw food dots
function drawDots() {
    ctx.fillStyle = 'white';
    dots.forEach(dot => {
        if (!dot.eaten) {
            ctx.beginPath();
            ctx.arc(dot.x + CELL_SIZE/2, dot.y + CELL_SIZE/2, CELL_SIZE/6, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

// Draw maze
function drawMaze() {
    ctx.fillStyle = 'blue';
    
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === 1) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

// Check if a position collides with a wall
function checkWallCollision(x, y) {
    // Convert pixel position to grid position
    const gridX = Math.floor(x / CELL_SIZE);
    const gridY = Math.floor(y / CELL_SIZE);
    
    // Check if there's a wall at this position
    return gridX < 0 || gridY < 0 || 
           gridX >= maze[0].length || gridY >= maze.length || 
           maze[gridY][gridX] === 1;
}

// Update pacman position
function updatePacman() {
    // Try to change direction if there's a pending direction change
    if (pacman.nextDirection !== pacman.direction) {
        // Check if we can move in the new direction without hitting a wall
        const nextX = pacman.x + pacman.nextDirection.x * pacman.speed;
        const nextY = pacman.y + pacman.nextDirection.y * pacman.speed;
        
        // Check wall collision for each corner of Pacman's body
        const hasCollision = 
            checkWallCollision(nextX, nextY) || 
            checkWallCollision(nextX + CELL_SIZE - 1, nextY) ||
            checkWallCollision(nextX, nextY + CELL_SIZE - 1) ||
            checkWallCollision(nextX + CELL_SIZE - 1, nextY + CELL_SIZE - 1);
        
        if (!hasCollision) {
            pacman.direction = pacman.nextDirection;
        }
    }
    
    // Calculate next position
    const nextX = pacman.x + pacman.direction.x * pacman.speed;
    const nextY = pacman.y + pacman.direction.y * pacman.speed;
    
    // Check wall collision for each corner of Pacman's body
    const hasCollision = 
        checkWallCollision(nextX, nextY) || 
        checkWallCollision(nextX + CELL_SIZE - 1, nextY) ||
        checkWallCollision(nextX, nextY + CELL_SIZE - 1) ||
        checkWallCollision(nextX + CELL_SIZE - 1, nextY + CELL_SIZE - 1);
    
    // Move pacman if there's no collision
    if (!hasCollision) {
        pacman.x = nextX;
        pacman.y = nextY;
    }
    
    // Check boundaries for tunnels
    if (pacman.x < 0) {
        pacman.x = canvas.width - CELL_SIZE;
    } else if (pacman.x >= canvas.width) {
        pacman.x = 0;
    }
    
    if (pacman.y < 0) {
        pacman.y = canvas.height - CELL_SIZE;
    } else if (pacman.y >= canvas.height) {
        pacman.y = 0;
    }
    
    // Check for dots collision
    const pacmanCenterX = pacman.x + pacman.radius;
    const pacmanCenterY = pacman.y + pacman.radius;
    
    dots.forEach(dot => {
        if (!dot.eaten) {
            const dotCenterX = dot.x + CELL_SIZE/2;
            const dotCenterY = dot.y + CELL_SIZE/2;
            
            const distance = Math.sqrt(
                Math.pow(pacmanCenterX - dotCenterX, 2) + 
                Math.pow(pacmanCenterY - dotCenterY, 2)
            );
            
            if (distance < pacman.radius) {
                dot.eaten = true;
                score += 10;
                scoreElement.textContent = score;
                
                // Check if all dots are eaten
                if (dots.filter(d => !d.eaten).length === 0) {
                    endGame(true);
                }
            }
        }
    });
    
    // Check for ghost collision
    ghosts.forEach(ghost => {
        const ghostCenterX = ghost.x + CELL_SIZE/2;
        const ghostCenterY = ghost.y + CELL_SIZE/2;
        
        const distance = Math.sqrt(
            Math.pow(pacmanCenterX - ghostCenterX, 2) + 
            Math.pow(pacmanCenterY - ghostCenterY, 2)
        );
        
        if (distance < pacman.radius + CELL_SIZE/2) {
            endGame(false);
        }
    });
}

// Update ghost positions
function updateGhosts() {
    ghosts.forEach(ghost => {
        // Random direction change (5% chance)
        if (Math.random() < 0.05) {
            // Get valid directions (not walls)
            const validDirections = [];
            for (const dir of Object.values(DIRECTIONS)) {
                const nextX = ghost.x + dir.x * ghost.speed;
                const nextY = ghost.y + dir.y * ghost.speed;
                
                const hasCollision = 
                    checkWallCollision(nextX, nextY) || 
                    checkWallCollision(nextX + CELL_SIZE - 1, nextY) ||
                    checkWallCollision(nextX, nextY + CELL_SIZE - 1) ||
                    checkWallCollision(nextX + CELL_SIZE - 1, nextY + CELL_SIZE - 1);
                
                if (!hasCollision) {
                    validDirections.push(dir);
                }
            }
            
            // Choose a random valid direction
            if (validDirections.length > 0) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        }
        
        // Calculate next position
        const nextX = ghost.x + ghost.direction.x * ghost.speed;
        const nextY = ghost.y + ghost.direction.y * ghost.speed;
        
        // Check wall collision for each corner of ghost's body
        const hasCollision = 
            checkWallCollision(nextX, nextY) || 
            checkWallCollision(nextX + CELL_SIZE - 1, nextY) ||
            checkWallCollision(nextX, nextY + CELL_SIZE - 1) ||
            checkWallCollision(nextX + CELL_SIZE - 1, nextY + CELL_SIZE - 1);
        
        // Move ghost if there's no collision, otherwise change direction
        if (!hasCollision) {
            ghost.x = nextX;
            ghost.y = nextY;
        } else {
            // Choose a new random valid direction
            const validDirections = [];
            for (const dir of Object.values(DIRECTIONS)) {
                const nextX = ghost.x + dir.x * ghost.speed;
                const nextY = ghost.y + dir.y * ghost.speed;
                
                const hasCollision = 
                    checkWallCollision(nextX, nextY) || 
                    checkWallCollision(nextX + CELL_SIZE - 1, nextY) ||
                    checkWallCollision(nextX, nextY + CELL_SIZE - 1) ||
                    checkWallCollision(nextX + CELL_SIZE - 1, nextY + CELL_SIZE - 1);
                
                if (!hasCollision) {
                    validDirections.push(dir);
                }
            }
            
            if (validDirections.length > 0) {
                ghost.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
            }
        }
        
        // Check boundaries for tunnels
        if (ghost.x < 0) {
            ghost.x = canvas.width - CELL_SIZE;
        } else if (ghost.x >= canvas.width) {
            ghost.x = 0;
        }
        
        if (ghost.y < 0) {
            ghost.y = canvas.height - CELL_SIZE;
        } else if (ghost.y >= canvas.height) {
            ghost.y = 0;
        }
    });
}

// Game loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game elements
    drawMaze();
    drawDots();
    drawPacman();
    drawGhosts();
    
    // Update positions
    updatePacman();
    updateGhosts();
    
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    if (gameRunning) return;
    
    // Reset game state
    score = 0;
    scoreElement.textContent = score;
    
    // Reset pacman
    pacman.x = 1 * CELL_SIZE;
    pacman.y = 1 * CELL_SIZE;
    pacman.direction = DIRECTIONS.RIGHT;
    pacman.nextDirection = DIRECTIONS.RIGHT;
    
    // Reset ghosts
    ghosts[0].x = 1 * CELL_SIZE;
    ghosts[0].y = 3 * CELL_SIZE;
    ghosts[1].x = 18 * CELL_SIZE;
    ghosts[1].y = 1 * CELL_SIZE;
    ghosts[2].x = 1 * CELL_SIZE;
    ghosts[2].y = 18 * CELL_SIZE;
    ghosts[3].x = 18 * CELL_SIZE;
    ghosts[3].y = 18 * CELL_SIZE;
    
    // Initialize dots
    initDots();
    
    // Start game loop
    gameRunning = true;
    gameLoop();
}

// End game
function endGame(won) {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    
    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(won ? 'You Win!' : 'Game Over', canvas.width/2, canvas.height/2 - 15);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2 + 20);
    ctx.fillText('Press Start to Play Again', canvas.width/2, canvas.height/2 + 50);
}

// Initialize the game board
function initGame() {
    // Draw initial game state
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    
    // Draw welcome screen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    ctx.fillText('PACMAN', canvas.width/2, canvas.height/2 - 40);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('Use arrow keys to move', canvas.width/2, canvas.height/2);
    ctx.fillText('Avoid ghosts and eat all dots', canvas.width/2, canvas.height/2 + 30);
    ctx.fillText('Navigate through the maze', canvas.width/2, canvas.height/2 + 55);
    ctx.fillText('Press Start to Play', canvas.width/2, canvas.height/2 + 90);
    
    // Draw pacman
    ctx.beginPath();
    ctx.arc(canvas.width/2 - 100, canvas.height/2 - 40, 20, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(canvas.width/2 - 100, canvas.height/2 - 40);
    ctx.closePath();
    ctx.fillStyle = 'yellow';
    ctx.fill();
    
    // Draw ghost
    ctx.beginPath();
    ctx.arc(canvas.width/2 + 100, canvas.height/2 - 40, 20, Math.PI, 2 * Math.PI);
    ctx.rect(canvas.width/2 + 80, canvas.height/2 - 40, 40, 20);
    ctx.fillStyle = 'red';
    ctx.fill();
}

// Initialize the game
initGame();