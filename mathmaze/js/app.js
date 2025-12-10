/**
 * Math Maze - Color Your Way Through!
 * A fun educational puzzle where kids solve math problems to color the maze path
 */

// ============================================
// State Management
// ============================================

const GameState = {
    maze: null,
    path: [],
    size: 5,
    grade: 1,
    mode: 'easy',
    selectedColor: null,
    isEraser: false,
    userColors: {},
    soundEnabled: true,
    activeColors: [],
    targetColor: null,      // The ONE color for the entire path
    pathCellCount: 0,       // Total path cells (for progress)
    correctCellCount: 0     // Correctly colored path cells
};

// Color mapping with 8 colors
const COLORS = {
    1: { name: 'Red', hex: '#EF4444' },
    2: { name: 'Orange', hex: '#F97316' },
    3: { name: 'Yellow', hex: '#FBBF24' },
    4: { name: 'Green', hex: '#22C55E' },
    5: { name: 'Blue', hex: '#3B82F6' },
    6: { name: 'Purple', hex: '#A855F7' },
    7: { name: 'Brown', hex: '#92400E' },
    8: { name: 'Black', hex: '#1F2937' }
};

// Mode configurations
const MODE_CONFIG = {
    easy: { colors: [1, 4, 5], name: 'Easy' },      // Red, Green, Blue
    medium: { colors: [1, 2, 3, 4, 5], name: 'Medium' },  // First 5 colors
    hard: { colors: [1, 2, 3, 4, 5, 6, 7, 8], name: 'Hard' }  // All 8 colors
};

// Size configurations with A4 print support
const SIZE_CONFIG = {
    small: { size: 5, cellClass: 'small', label: 'Small (5×5)' },
    medium: { size: 7, cellClass: 'medium', label: 'Medium (7×7)' },
    large: { size: 9, cellClass: 'large', label: 'Large (9×9)' },
    a4Small: { size: 10, cellClass: 'a4-sm', label: 'A4 Small (10×10)' },
    a4Medium: { size: 12, cellClass: 'a4-md', label: 'A4 Medium (12×12)' },
    a4Large: { size: 15, cellClass: 'a4-lg', label: 'A4 Large (15×15)' },
    a4XL: { size: 18, cellClass: 'a4-xl', label: 'A4 Extra Large (18×18)' }
};

// ============================================
// Audio System (Simple Web Audio)
// ============================================

let audioContext = null;

function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Web Audio API not supported');
    }
}

function playSound(type) {
    if (!GameState.soundEnabled || !audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

    switch (type) {
        case 'click':
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'correct':
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            oscillator.type = 'sine';
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'wrong':
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.type = 'sawtooth';
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'complete':
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.setValueAtTime(freq, audioContext.currentTime);
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.2);
                osc.start(audioContext.currentTime + i * 0.15);
                osc.stop(audioContext.currentTime + i * 0.15 + 0.2);
            });
            break;
    }
}

// ============================================
// Math Problem Generation
// ============================================

function generateProblem(target, grade) {
    if (grade <= 2) {
        return generateAdditionOrSubtraction(target);
    } else if (grade === 3) {
        const type = Math.random();
        if (type < 0.4) return generateAdditionOrSubtraction(target);
        if (type < 0.8) return generateMultiplication(target);
        return generateAdditionOrSubtraction(target);
    } else if (grade === 4) {
        const type = Math.random();
        if (type < 0.3) return generateAdditionOrSubtraction(target);
        if (type < 0.6) return generateMultiplication(target);
        if (type < 0.9) return generateDivision(target);
        return generateAdditionOrSubtraction(target);
    } else {
        return generateTwoStep(target);
    }
}

function generateAdditionOrSubtraction(target) {
    if (Math.random() > 0.5) {
        // Addition
        const a = Math.floor(Math.random() * target) + 1;
        const b = target - a;
        return { expression: `${a}+${b}`, answer: target };
    } else {
        // Subtraction
        const a = target + Math.floor(Math.random() * 10) + 1;
        const b = a - target;
        return { expression: `${a}-${b}`, answer: target };
    }
}

function generateMultiplication(target) {
    // Find factors of target
    const factors = [];
    for (let i = 1; i <= Math.sqrt(target); i++) {
        if (target % i === 0) {
            factors.push([i, target / i]);
        }
    }

    if (factors.length > 0) {
        const [a, b] = factors[Math.floor(Math.random() * factors.length)];
        if (Math.random() > 0.5) {
            return { expression: `${a}×${b}`, answer: target };
        } else {
            return { expression: `${b}×${a}`, answer: target };
        }
    }

    // Fallback to addition if no good factors
    return generateAdditionOrSubtraction(target);
}

function generateDivision(target) {
    const multiplier = Math.floor(Math.random() * 10) + 2;
    const dividend = target * multiplier;
    return { expression: `${dividend}÷${multiplier}`, answer: target };
}

function generateTwoStep(target) {
    // (a × b) + c = target or (a + b) × c = target
    if (Math.random() > 0.5 && target > 2) {
        // (a × b) + c
        const product = Math.floor(Math.random() * (target - 1)) + 1;
        const factors = [];
        for (let i = 1; i <= Math.sqrt(product); i++) {
            if (product % i === 0 && i > 1 && product / i > 1) {
                factors.push([i, product / i]);
            }
        }

        if (factors.length > 0) {
            const [a, b] = factors[Math.floor(Math.random() * factors.length)];
            const c = target - product;
            if (c > 0) {
                return { expression: `${a}×${b}+${c}`, answer: target };
            }
        }
    }

    // Fallback to simpler two-step
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const product = a * b;
    const c = target - product;

    if (c > 0) {
        return { expression: `${a}×${b}+${c}`, answer: target };
    } else if (c < 0) {
        return { expression: `${a}×${b}${c}`, answer: target };
    } else {
        return { expression: `${a}×${b}`, answer: target };
    }
}

// ============================================
// Maze Generation
// ============================================

function generateMaze() {
    const sizeKey = document.getElementById('sizeSelect').value;
    const { size, cellClass } = SIZE_CONFIG[sizeKey];
    GameState.size = size;
    GameState.cellClass = cellClass;
    GameState.grade = parseInt(document.getElementById('gradeSelect').value);
    GameState.mode = document.getElementById('modeSelect').value;
    GameState.activeColors = MODE_CONFIG[GameState.mode].colors;
    GameState.userColors = {};
    GameState.correctCellCount = 0;

    // Select ONE target color for the entire path
    GameState.targetColor = GameState.activeColors[Math.floor(Math.random() * GameState.activeColors.length)];

    // Initialize maze grid
    const maze = [];
    for (let i = 0; i < size; i++) {
        maze.push(new Array(size).fill(null));
    }

    // Generate a corridor-style path from top-left to bottom-right
    const path = generateCorridorPath(size);
    GameState.path = path;
    GameState.pathCellCount = path.length - 2; // Exclude START and END

    // Mark path cells - ALL use the same target color!
    path.forEach((pos, idx) => {
        const problem = generateProblem(GameState.targetColor, GameState.grade);

        maze[pos.y][pos.x] = {
            type: 'path',
            ...problem,
            colorIndex: GameState.targetColor, // Same color for ALL path cells
            isStart: idx === 0,
            isEnd: idx === path.length - 1
        };
    });

    // Generate decoy colors (everything EXCEPT the target)
    const decoyColors = GameState.activeColors.filter(c => c !== GameState.targetColor);

    // Fill remaining cells with decoys and walls
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!maze[y][x]) {
                const isAdjacentToPath = isAdjacentTo(x, y, path);
                // More decoys near path to create challenge
                const shouldBeDecoy = isAdjacentToPath ? Math.random() > 0.25 : Math.random() > 0.55;

                if (shouldBeDecoy && decoyColors.length > 0) {
                    // Decoy cells use NON-target colors
                    const decoyColor = decoyColors[Math.floor(Math.random() * decoyColors.length)];
                    const problem = generateProblem(decoyColor, GameState.grade);
                    maze[y][x] = {
                        type: 'decoy',
                        ...problem,
                        colorIndex: decoyColor
                    };
                } else {
                    maze[y][x] = { type: 'wall' };
                }
            }
        }
    }

    GameState.maze = maze;
    renderMaze();
    renderTargetColor();
    renderColorLegend();
    renderColorPalette();
    updateProgress();
    hideMessage();
}

/**
 * Generate a corridor-style path with long straight sections
 * This creates a more maze-like feel with clear corridors
 */
function generateCorridorPath(size) {
    const path = [];
    let x = 0, y = 0;
    path.push({ x, y });

    // Minimum corridor length before turning (creates straight sections)
    const minCorridorLength = Math.max(2, Math.floor(size / 4));
    let currentDirection = Math.random() > 0.5 ? 'right' : 'down';
    let stepsInDirection = 0;

    while (x < size - 1 || y < size - 1) {
        const canGoRight = x < size - 1;
        const canGoDown = y < size - 1;

        // Determine if we should continue in current direction or turn
        let shouldTurn = false;

        if (currentDirection === 'right' && !canGoRight) {
            shouldTurn = true;
        } else if (currentDirection === 'down' && !canGoDown) {
            shouldTurn = true;
        } else if (stepsInDirection >= minCorridorLength) {
            // After minimum corridor length, chance to turn
            shouldTurn = Math.random() > 0.6;
        }

        if (shouldTurn) {
            // Switch direction
            if (currentDirection === 'right' && canGoDown) {
                currentDirection = 'down';
                stepsInDirection = 0;
            } else if (currentDirection === 'down' && canGoRight) {
                currentDirection = 'right';
                stepsInDirection = 0;
            }
        }

        // Move in current direction
        if (currentDirection === 'right' && canGoRight) {
            x++;
            stepsInDirection++;
        } else if (currentDirection === 'down' && canGoDown) {
            y++;
            stepsInDirection++;
        } else if (canGoRight) {
            x++;
            currentDirection = 'right';
            stepsInDirection = 1;
        } else if (canGoDown) {
            y++;
            currentDirection = 'down';
            stepsInDirection = 1;
        }

        path.push({ x, y });
    }

    return path;
}

// Keep old function for reference but use new corridor version
function generatePath(size) {
    return generateCorridorPath(size);
}

function isAdjacentTo(x, y, path) {
    const directions = [
        { dx: 0, dy: -1 },  // up
        { dx: 0, dy: 1 },   // down
        { dx: -1, dy: 0 },  // left
        { dx: 1, dy: 0 }    // right
    ];

    return path.some(pos =>
        directions.some(dir => pos.x + dir.dx === x && pos.y + dir.dy === y)
    );
}

// ============================================
// Rendering
// ============================================

function renderMaze() {
    const container = document.getElementById('mazeContainer');
    const { maze, size, cellClass } = GameState;

    let html = `<div class="maze-grid" style="grid-template-columns: repeat(${size}, 1fr);">`;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = maze[y][x];
            const cellId = `cell-${y}-${x}`;
            const userColor = GameState.userColors[cellId];

            if (cell.type === 'wall') {
                html += `<div class="maze-cell ${cellClass} wall"></div>`;
            } else if (cell.isStart) {
                html += `<div class="maze-cell ${cellClass} start">START</div>`;
            } else if (cell.isEnd) {
                html += `<div class="maze-cell ${cellClass} end">END</div>`;
            } else {
                let colorClass = userColor ? `color-${userColor} colored` : '';
                html += `
                    <div class="maze-cell ${cellClass} ${colorClass}"
                         id="${cellId}"
                         data-x="${x}"
                         data-y="${y}"
                         data-answer="${cell.answer}"
                         data-type="${cell.type}"
                         onclick="handleCellClick(this)">
                        ${cell.expression}
                    </div>
                `;
            }
        }
    }

    html += '</div>';
    container.innerHTML = html;
}

function renderColorLegend() {
    const container = document.getElementById('legendItems');
    const { activeColors } = GameState;

    let html = '';
    activeColors.forEach(colorNum => {
        const color = COLORS[colorNum];
        html += `
            <div class="legend-item">
                <div class="legend-color" style="background: ${color.hex};"></div>
                <span class="legend-number">= ${colorNum}</span>
                <span class="legend-name">(${color.name})</span>
            </div>
        `;
    });

    container.innerHTML = html;
}

function renderColorPalette() {
    const container = document.getElementById('paletteColors');
    const { activeColors } = GameState;

    let html = '';
    activeColors.forEach(colorNum => {
        const color = COLORS[colorNum];
        html += `
            <div class="palette-color color-${colorNum}"
                 data-color="${colorNum}"
                 title="${color.name} (Answer: ${colorNum})"
                 onclick="selectColor(${colorNum})">
                ${colorNum}
            </div>
        `;
    });

    container.innerHTML = html;
}

/**
 * Render the prominent target color display
 * Shows kids exactly which color they're looking for
 */
function renderTargetColor() {
    const container = document.getElementById('targetColorDisplay');
    if (!container) return;

    const { targetColor } = GameState;
    const color = COLORS[targetColor];

    container.innerHTML = `
        <div class="target-color-box color-${targetColor}"></div>
        <div class="target-color-info">
            <span class="target-label">Find the path!</span>
            <span class="target-instruction">Color all cells that equal <strong>${targetColor}</strong></span>
            <span class="target-color-name">${color.name}</span>
        </div>
    `;
    container.className = 'target-color-display';
}

/**
 * Update the progress indicator
 */
function updateProgress() {
    const container = document.getElementById('progressIndicator');
    if (!container) return;

    const { pathCellCount, correctCellCount } = GameState;
    const percentage = pathCellCount > 0 ? Math.round((correctCellCount / pathCellCount) * 100) : 0;

    container.innerHTML = `
        <div class="progress-text">
            <span>Path Progress:</span>
            <strong>${correctCellCount} of ${pathCellCount}</strong>
        </div>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
    `;
}

// ============================================
// User Interaction
// ============================================

function selectColor(colorNum) {
    GameState.selectedColor = colorNum;
    GameState.isEraser = false;

    // Update UI
    document.querySelectorAll('.palette-color').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.color) === colorNum);
    });
    document.getElementById('eraserBtn').classList.remove('selected');

    playSound('click');
}

function selectEraser() {
    GameState.selectedColor = null;
    GameState.isEraser = true;

    // Update UI
    document.querySelectorAll('.palette-color').forEach(el => {
        el.classList.remove('selected');
    });
    document.getElementById('eraserBtn').classList.add('selected');

    playSound('click');
}

function handleCellClick(cellElement) {
    const cellId = cellElement.id;

    if (GameState.isEraser) {
        // Erase the color
        delete GameState.userColors[cellId];
        cellElement.classList.remove('colored', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8', 'correct', 'wrong');
        playSound('click');
    } else if (GameState.selectedColor) {
        // Apply the selected color
        const colorNum = GameState.selectedColor;
        GameState.userColors[cellId] = colorNum;

        // Remove old color classes and add new one
        cellElement.classList.remove('color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8', 'correct', 'wrong');
        cellElement.classList.add(`color-${colorNum}`, 'colored');

        playSound('click');
    }

    hideMessage();
}

// ============================================
// Game Logic
// ============================================

function checkAnswers() {
    const { maze, size, path, targetColor } = GameState;
    const colorName = COLORS[targetColor].name;
    let correctCount = 0;
    let totalPath = 0;
    let allCorrect = true;

    // Check all non-wall, non-start, non-end cells
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = maze[y][x];
            if (cell.type === 'wall' || cell.isStart || cell.isEnd) continue;

            const cellId = `cell-${y}-${x}`;
            const cellElement = document.getElementById(cellId);
            const userColor = GameState.userColors[cellId];

            if (cell.type === 'path') {
                totalPath++;

                if (userColor === cell.colorIndex) {
                    correctCount++;
                    cellElement.classList.add('correct');
                    cellElement.classList.remove('wrong');
                } else if (userColor) {
                    cellElement.classList.add('wrong');
                    cellElement.classList.remove('correct');
                    allCorrect = false;
                } else {
                    cellElement.classList.remove('correct', 'wrong');
                    allCorrect = false;
                }
            } else if (cell.type === 'decoy' && userColor) {
                // Decoy cells colored with target color are WRONG (not on path)
                if (userColor === targetColor) {
                    cellElement.classList.add('wrong');
                    cellElement.classList.remove('correct');
                } else if (userColor === cell.colorIndex) {
                    // Colored correctly but not part of path - show as neutral
                    cellElement.classList.remove('correct', 'wrong');
                } else {
                    cellElement.classList.add('wrong');
                    cellElement.classList.remove('correct');
                }
            }
        }
    }

    // Update progress state
    GameState.correctCellCount = correctCount;
    updateProgress();

    // Show result message
    if (allCorrect && correctCount === totalPath) {
        showMessage(`Perfect! You found the ${colorName} path!`, 'success');
        playSound('complete');
        celebrate();
    } else if (correctCount === 0) {
        showMessage(`Find all cells that equal ${targetColor} and color them ${colorName}!`, 'info');
        playSound('wrong');
    } else {
        showMessage(`${correctCount} of ${totalPath} path cells found. Keep looking for ${colorName}!`, 'info');
        playSound('click');
    }
}

function showHint() {
    const { maze, size, path } = GameState;

    // Find a random uncolored or incorrectly colored path cell
    const uncoloredPath = [];

    for (const pos of path) {
        const cell = maze[pos.y][pos.x];
        if (cell.isStart || cell.isEnd) continue;

        const cellId = `cell-${pos.y}-${pos.x}`;
        const userColor = GameState.userColors[cellId];

        if (!userColor || userColor !== cell.colorIndex) {
            uncoloredPath.push({ pos, cell, cellId });
        }
    }

    if (uncoloredPath.length === 0) {
        showMessage('All path cells are correctly colored!', 'success');
        return;
    }

    // Pick a random one to hint
    const hint = uncoloredPath[Math.floor(Math.random() * uncoloredPath.length)];
    const colorName = COLORS[hint.cell.colorIndex].name;

    showMessage(`Hint: ${hint.cell.expression} = ${hint.cell.answer}, so color it ${colorName}!`, 'info');

    // Briefly highlight the cell
    const cellElement = document.getElementById(hint.cellId);
    cellElement.style.boxShadow = '0 0 0 4px gold';
    setTimeout(() => {
        cellElement.style.boxShadow = '';
    }, 2000);

    playSound('click');
}

function resetMaze() {
    GameState.userColors = {};
    GameState.correctCellCount = 0;
    renderMaze();
    updateProgress();
    hideMessage();
    playSound('click');
}

function celebrate() {
    // Show celebration overlay
    document.getElementById('celebration').style.display = 'flex';

    // Fire confetti
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });

        setTimeout(() => {
            confetti({
                particleCount: 50,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 50,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
        }, 250);
    }
}

function hideCelebration() {
    document.getElementById('celebration').style.display = 'none';
}

function showMessage(text, type) {
    const area = document.getElementById('messageArea');
    const content = document.getElementById('messageContent');

    content.textContent = text;
    content.className = `message-content ${type}`;
    area.style.display = 'block';
}

function hideMessage() {
    document.getElementById('messageArea').style.display = 'none';
}

// ============================================
// Modal Controls
// ============================================

function showHelp() {
    document.getElementById('helpModal').style.display = 'flex';
}

function hideHelp() {
    document.getElementById('helpModal').style.display = 'none';
}

// ============================================
// Sound Toggle
// ============================================

function toggleSound() {
    GameState.soundEnabled = !GameState.soundEnabled;

    const soundOn = document.querySelector('.sound-on');
    const soundOff = document.querySelector('.sound-off');

    if (GameState.soundEnabled) {
        soundOn.style.display = 'inline';
        soundOff.style.display = 'none';
    } else {
        soundOn.style.display = 'none';
        soundOff.style.display = 'inline';
    }
}

// ============================================
// Print Function
// ============================================

function printMaze() {
    window.print();
}

function printMazeBW() {
    // Add B&W print class to body for black and white printing
    document.body.classList.add('print-bw');

    // Print the page
    window.print();

    // Remove the class after printing
    // Use a small delay to ensure the print dialog has captured the styles
    setTimeout(() => {
        document.body.classList.remove('print-bw');
    }, 100);
}

// ============================================
// Book Printing Functions
// ============================================

/**
 * Generate a standalone puzzle for book printing
 * Returns the puzzle data without modifying GameState
 */
function generatePuzzleForBook(settings) {
    const { size, cellClass, grade, mode, activeColors } = settings;

    // Select ONE target color for the entire path
    const targetColor = activeColors[Math.floor(Math.random() * activeColors.length)];

    // Initialize maze grid
    const maze = [];
    for (let i = 0; i < size; i++) {
        maze.push(new Array(size).fill(null));
    }

    // Generate a corridor-style path from top-left to bottom-right
    const path = generateCorridorPath(size);

    // Mark path cells - ALL use the same target color!
    path.forEach((pos, idx) => {
        const problem = generateProblem(targetColor, grade);

        maze[pos.y][pos.x] = {
            type: 'path',
            ...problem,
            colorIndex: targetColor,
            isStart: idx === 0,
            isEnd: idx === path.length - 1
        };
    });

    // Generate decoy colors (everything EXCEPT the target)
    const decoyColors = activeColors.filter(c => c !== targetColor);

    // Fill remaining cells with decoys and walls
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!maze[y][x]) {
                const isAdjacentToPath = isAdjacentTo(x, y, path);
                const shouldBeDecoy = isAdjacentToPath ? Math.random() > 0.25 : Math.random() > 0.55;

                if (shouldBeDecoy && decoyColors.length > 0) {
                    const decoyColor = decoyColors[Math.floor(Math.random() * decoyColors.length)];
                    const problem = generateProblem(decoyColor, grade);
                    maze[y][x] = {
                        type: 'decoy',
                        ...problem,
                        colorIndex: decoyColor
                    };
                } else {
                    maze[y][x] = { type: 'wall' };
                }
            }
        }
    }

    return {
        maze,
        path,
        size,
        cellClass,
        targetColor,
        activeColors
    };
}

/**
 * Render a puzzle grid as HTML for book printing
 */
function renderPuzzleHTML(puzzle, showAnswers = false) {
    const { maze, size, cellClass, targetColor, activeColors } = puzzle;
    const color = COLORS[targetColor];

    // Target color display
    let html = `
        <div class="book-puzzle-header">
            <div class="book-target-display">
                <div class="book-target-box color-${targetColor}"></div>
                <div class="book-target-info">
                    <span class="book-target-label">Find the path!</span>
                    <span class="book-target-instruction">Color all cells that equal <strong>${targetColor}</strong></span>
                    <span class="book-target-color-name">${color.name}</span>
                </div>
            </div>
        </div>
    `;

    // Maze grid
    html += `<div class="book-maze-container">`;
    html += `<div class="book-maze-grid" style="grid-template-columns: repeat(${size}, 1fr);">`;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = maze[y][x];

            if (cell.type === 'wall') {
                html += `<div class="book-maze-cell ${cellClass} wall"></div>`;
            } else if (cell.isStart) {
                html += `<div class="book-maze-cell ${cellClass} start">START</div>`;
            } else if (cell.isEnd) {
                html += `<div class="book-maze-cell ${cellClass} end">END</div>`;
            } else {
                // For answer key: show the path cells colored
                const isPath = cell.type === 'path';
                let colorClass = '';

                if (showAnswers && isPath) {
                    colorClass = `color-${cell.colorIndex} colored answer-highlight`;
                }

                html += `
                    <div class="book-maze-cell ${cellClass} ${colorClass}">
                        ${cell.expression}
                    </div>
                `;
            }
        }
    }

    html += `</div></div>`;

    // Color legend
    html += `<div class="book-color-legend">`;
    html += `<h4>Color Key</h4>`;
    html += `<div class="book-legend-items">`;

    activeColors.forEach(colorNum => {
        const colorInfo = COLORS[colorNum];
        html += `
            <div class="book-legend-item">
                <div class="book-legend-color color-${colorNum}"></div>
                <span>= ${colorNum}</span>
                <span class="book-legend-name">(${colorInfo.name})</span>
            </div>
        `;
    });

    html += `</div></div>`;

    return html;
}

/**
 * Generate and print a puzzle book
 */
function generateAndPrintBook() {
    const puzzleCount = parseInt(document.getElementById('bookPuzzleCount').value);
    const sizeKey = document.getElementById('bookSize').value;
    const grade = parseInt(document.getElementById('bookGrade').value);
    const mode = document.getElementById('bookMode').value;
    const includeAnswers = document.getElementById('bookIncludeAnswers').checked;
    const bwMode = document.getElementById('bookBWMode').checked;

    const { size, cellClass } = SIZE_CONFIG[sizeKey];
    const activeColors = MODE_CONFIG[mode].colors;

    const settings = {
        size,
        cellClass,
        grade,
        mode,
        activeColors
    };

    // Generate all puzzles
    const puzzles = [];
    for (let i = 0; i < puzzleCount; i++) {
        puzzles.push(generatePuzzleForBook(settings));
    }

    // Build the book HTML
    const container = document.getElementById('bookPrintContainer');
    let bookHTML = '';

    // Title page
    bookHTML += `
        <div class="book-page book-title-page">
            <div class="book-title-content">
                <h1>Math Maze</h1>
                <h2>Puzzle Workbook</h2>
                <div class="book-title-info">
                    <p><strong>${puzzleCount} Puzzles</strong></p>
                    <p>Grade: ${grade <= 2 ? '1-2' : grade}</p>
                    <p>Difficulty: ${MODE_CONFIG[mode].name}</p>
                    <p>Grid Size: ${size}×${size}</p>
                </div>
                <div class="book-title-instructions">
                    <h3>How to Play</h3>
                    <ol>
                        <li>Look at the Target Color box - it shows which color to find!</li>
                        <li>Solve each math problem in the grid.</li>
                        <li>If the answer equals the target number, color that cell with the target color.</li>
                        <li>Find all path cells from START to END!</li>
                    </ol>
                    <p class="book-tip"><strong>Tip:</strong> The path only goes right or down. All path cells have the same answer!</p>
                </div>
            </div>
        </div>
    `;

    // Puzzle pages
    puzzles.forEach((puzzle, index) => {
        bookHTML += `
            <div class="book-page book-puzzle-page">
                <div class="book-page-header">
                    <span class="book-puzzle-number">Puzzle ${index + 1}</span>
                    <span class="book-page-number">Page ${index + 2}</span>
                </div>
                ${renderPuzzleHTML(puzzle, false)}
            </div>
        `;
    });

    // Answer key pages (if enabled)
    if (includeAnswers) {
        bookHTML += `
            <div class="book-page book-answer-header-page">
                <div class="book-answer-title">
                    <h2>Answer Key</h2>
                    <p>The colored cells below show the correct path for each puzzle.</p>
                </div>
            </div>
        `;

        puzzles.forEach((puzzle, index) => {
            bookHTML += `
                <div class="book-page book-answer-page">
                    <div class="book-page-header">
                        <span class="book-puzzle-number">Puzzle ${index + 1} - Answer</span>
                        <span class="book-page-number">Answer ${index + 1}</span>
                    </div>
                    ${renderPuzzleHTML(puzzle, true)}
                </div>
            `;
        });
    }

    container.innerHTML = bookHTML;

    // Hide the modal
    hideBookModal();

    // Add book printing class and B&W class if needed
    document.body.classList.add('print-book');
    if (bwMode) {
        document.body.classList.add('print-bw');
    }

    // Show the book container for printing
    container.style.display = 'block';

    // Print
    setTimeout(() => {
        window.print();

        // Cleanup after print dialog closes
        setTimeout(() => {
            document.body.classList.remove('print-book', 'print-bw');
            container.style.display = 'none';
            container.innerHTML = '';
        }, 100);
    }, 100);
}

/**
 * Show the book printing modal
 */
function showBookModal() {
    // Pre-populate with current settings
    document.getElementById('bookGrade').value = document.getElementById('gradeSelect').value;
    document.getElementById('bookMode').value = document.getElementById('modeSelect').value;

    document.getElementById('bookModal').style.display = 'flex';
}

/**
 * Hide the book printing modal
 */
function hideBookModal() {
    document.getElementById('bookModal').style.display = 'none';
}

// ============================================
// Initialization
// ============================================

function init() {
    // Initialize audio on first user interaction
    document.addEventListener('click', function initAudioOnClick() {
        initAudio();
        document.removeEventListener('click', initAudioOnClick);
    }, { once: true });

    // Event listeners
    document.getElementById('newMazeBtn').addEventListener('click', generateMaze);
    document.getElementById('checkBtn').addEventListener('click', checkAnswers);
    document.getElementById('hintBtn').addEventListener('click', showHint);
    document.getElementById('resetBtn').addEventListener('click', resetMaze);
    document.getElementById('printBtn').addEventListener('click', printMaze);
    document.getElementById('printBWBtn').addEventListener('click', printMazeBW);
    document.getElementById('eraserBtn').addEventListener('click', selectEraser);
    document.getElementById('helpBtn').addEventListener('click', showHelp);
    document.getElementById('closeHelp').addEventListener('click', hideHelp);
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        hideCelebration();
        generateMaze();
    });

    // Book printing modal
    document.getElementById('printBookBtn').addEventListener('click', showBookModal);
    document.getElementById('closeBook').addEventListener('click', hideBookModal);
    document.getElementById('cancelBook').addEventListener('click', hideBookModal);
    document.getElementById('generateBook').addEventListener('click', generateAndPrintBook);

    // Close modal on background click
    document.getElementById('helpModal').addEventListener('click', (e) => {
        if (e.target.id === 'helpModal') {
            hideHelp();
        }
    });

    document.getElementById('bookModal').addEventListener('click', (e) => {
        if (e.target.id === 'bookModal') {
            hideBookModal();
        }
    });

    // Generate initial maze
    generateMaze();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
