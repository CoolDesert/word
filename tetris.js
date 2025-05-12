// 游戏常量
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// 方块形状定义
const SHAPES = [
    null,
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]],                         // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]],                         // L
    [[0, 4, 4], [0, 4, 4], [0, 0, 0]],                         // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]],                         // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]],                         // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]                          // Z
];

// 游戏状态
let board = createMatrix(COLS, ROWS);
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let gameOver = false;
let dropInterval = 1000;
let dropStart = 0;
let gameId = null;

// 初始化游戏板
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// 绘制方块
function drawBlock(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// 绘制游戏板
function drawBoard() {
    const canvas = document.getElementById('game-board');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制已落下的方块
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                drawBlock(ctx, x, y, COLORS[value]);
            }
        });
    });

    // 绘制当前方块
    if (currentPiece) {
        currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    drawBlock(ctx, x + currentPiece.x, y + currentPiece.y, COLORS[value]);
                }
            });
        });
    }
}

// 绘制下一个方块
function drawNextPiece() {
    const canvas = document.getElementById('next-piece');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (nextPiece) {
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const offsetX = (canvas.width / 2) - (nextPiece.shape[0].length * BLOCK_SIZE / 2);
                    const offsetY = (canvas.height / 2) - (nextPiece.shape.length * BLOCK_SIZE / 2);
                    drawBlock(ctx, x + offsetX / BLOCK_SIZE, y + offsetY / BLOCK_SIZE, COLORS[value]);
                }
            });
        });
    }
}

// 创建新方块
function createPiece(type) {
    return {
        shape: SHAPES[type],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0,
        type: type
    };
}

// 碰撞检测
function collide() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x] !== 0 &&
                (board[y + currentPiece.y] === undefined ||
                 board[y + currentPiece.y][x + currentPiece.x] === undefined ||
                 board[y + currentPiece.y][x + currentPiece.x] !== 0)) {
                return true;
            }
        }
    }
    return false;
}

// 合并方块到游戏板
function merge() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                board[y + currentPiece.y][x + currentPiece.x] = value;
            }
        });
    });
}

// 旋转方块
function rotate() {
    const originalShape = currentPiece.shape;
    const N = currentPiece.shape.length;
    const rotated = createMatrix(N, N);

    for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
            rotated[x][N - 1 - y] = currentPiece.shape[y][x];
        }
    }

    currentPiece.shape = rotated;
    if (collide()) {
        currentPiece.shape = originalShape;
    }
}

// 清除已满的行
function clearLines() {
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }

        // 移除已满的行
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        y++; // 重新检查当前行
        linesCleared++;
    }

    // 更新分数
    if (linesCleared > 0) {
        score += linesCleared * 100 * level;
        document.getElementById('score').textContent = score;
        
        // 每1000分升一级
        const newLevel = Math.floor(score / 1000) + 1;
        if (newLevel > level) {
            level = newLevel;
            document.getElementById('level').textContent = level;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
    }
}

// 方块下落
function drop() {
    currentPiece.y++;
    if (collide()) {
        currentPiece.y--;
        merge();
        clearLines();
        if (board[0].some(cell => cell !== 0)) {
            gameOver = true;
            alert('游戏结束! 你的分数: ' + score);
            resetGame();
            return;
        }
        currentPiece = nextPiece;
        nextPiece = createPiece(Math.floor(Math.random() * 7) + 1);
        drawNextPiece();
    }
    dropStart = Date.now();
}

// 重置游戏
function resetGame() {
    board = createMatrix(COLS, ROWS);
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    dropInterval = 1000;
    gameOver = false;
    if (gameId) {
        cancelAnimationFrame(gameId);
    }
}

// 游戏循环
function update() {
    const now = Date.now();
    const delta = now - dropStart;

    if (delta > dropInterval) {
        drop();
    }

    drawBoard();
    gameId = requestAnimationFrame(update);
}

// 键盘控制
document.addEventListener('keydown', event => {
    if (gameOver) return;

    switch (event.keyCode) {
        case 37: // 左箭头
            currentPiece.x--;
            if (collide()) currentPiece.x++;
            break;
        case 39: // 右箭头
            currentPiece.x++;
            if (collide()) currentPiece.x--;
            break;
        case 40: // 下箭头
            drop();
            break;
        case 38: // 上箭头
            rotate();
            break;
    }
});

// 开始游戏
document.getElementById('start-btn').addEventListener('click', () => {
    resetGame();
    currentPiece = createPiece(Math.floor(Math.random() * 7) + 1);
    nextPiece = createPiece(Math.floor(Math.random() * 7) + 1);
    drawNextPiece();
    update();
});
