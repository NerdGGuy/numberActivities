/**
 * Math Maze - Color Your Way Through!
 * A fun educational puzzle where kids solve math problems to color the maze path
 */

// ============================================
// State Management
// ============================================

const GameState = {
    puzzles: [],            // Array of puzzle objects when multiple puzzles
    puzzleCount: 1,         // Number of puzzles to generate
    size: 5,
    grade: 1,
    mode: 'easy',
    selectedColor: null,
    isEraser: false,
    soundEnabled: true,
    activeColors: [],
    totalPathCells: 0,      // Total path cells across all puzzles
    totalCorrectCells: 0    // Correctly colored cells across all puzzles
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
    GameState.puzzleCount = parseInt(document.getElementById('puzzleCountSelect').value);
    GameState.activeColors = MODE_CONFIG[GameState.mode].colors;
    GameState.totalPathCells = 0;
    GameState.totalCorrectCells = 0;

    // Generate all puzzles
    GameState.puzzles = [];
    for (let i = 0; i < GameState.puzzleCount; i++) {
        const puzzle = generateSinglePuzzle(size, cellClass, GameState.grade, GameState.activeColors);
        GameState.puzzles.push(puzzle);
        GameState.totalPathCells += puzzle.pathCellCount;
    }

    renderAllPuzzles();
    renderColorLegend();
    renderColorPalette();
    updateProgress();
    hideMessage();
}

/**
 * Generate a single puzzle with its own maze, path, and target color
 */
function generateSinglePuzzle(size, cellClass, grade, activeColors) {
    // Select ONE target color for this puzzle's path
    const targetColor = activeColors[Math.floor(Math.random() * activeColors.length)];

    // Initialize maze grid
    const maze = [];
    for (let i = 0; i < size; i++) {
        maze.push(new Array(size).fill(null));
    }

    // Generate a corridor-style path from top-left to bottom-right
    const path = generateCorridorPath(size);
    const pathCellCount = path.length - 2; // Exclude START and END

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
        pathCellCount,
        correctCellCount: 0,
        userColors: {}
    };
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

/**
 * Render all puzzles in the main container
 */
function renderAllPuzzles() {
    const container = document.getElementById('mazeContainer');
    const { puzzles } = GameState;

    let html = '<div class="puzzles-container">';

    puzzles.forEach((puzzle, puzzleIndex) => {
        html += renderSinglePuzzle(puzzle, puzzleIndex);
    });

    html += '</div>';
    container.innerHTML = html;
}

/**
 * Render a single puzzle with its target color display and maze grid
 */
function renderSinglePuzzle(puzzle, puzzleIndex) {
    const { maze, size, cellClass, targetColor } = puzzle;
    const color = COLORS[targetColor];

    let html = `<div class="puzzle-wrapper" data-puzzle-index="${puzzleIndex}">`;

    // Puzzle number header (only show if multiple puzzles)
    if (GameState.puzzleCount > 1) {
        html += `<div class="puzzle-header">Puzzle ${puzzleIndex + 1}</div>`;
    }

    // Target color display for this puzzle
    html += `
        <div class="target-color-display">
            <div class="target-color-box color-${targetColor}"></div>
            <div class="target-color-info">
                <span class="target-label">Find the path!</span>
                <span class="target-instruction">Color all cells that equal <strong>${targetColor}</strong></span>
                <span class="target-color-name">${color.name}</span>
            </div>
        </div>
    `;

    // Maze grid
    html += `<div class="maze-container">`;
    html += `<div class="maze-grid" style="grid-template-columns: repeat(${size}, 1fr);">`;

    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const cell = maze[y][x];
            const cellId = `cell-${puzzleIndex}-${y}-${x}`;
            const userColor = puzzle.userColors[cellId];

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
                         data-puzzle="${puzzleIndex}"
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

    html += '</div></div></div>';
    return html;
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
 * Update the progress indicator (counts across all puzzles)
 */
function updateProgress() {
    const container = document.getElementById('progressIndicator');
    if (!container) return;

    const { totalPathCells, totalCorrectCells } = GameState;
    const percentage = totalPathCells > 0 ? Math.round((totalCorrectCells / totalPathCells) * 100) : 0;

    container.innerHTML = `
        <div class="progress-text">
            <span>Path Progress:</span>
            <strong>${totalCorrectCells} of ${totalPathCells}</strong>
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
    const puzzleIndex = parseInt(cellElement.dataset.puzzle);
    const puzzle = GameState.puzzles[puzzleIndex];

    if (!puzzle) return;

    if (GameState.isEraser) {
        // Erase the color
        delete puzzle.userColors[cellId];
        cellElement.classList.remove('colored', 'color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6', 'color-7', 'color-8', 'correct', 'wrong');
        playSound('click');
    } else if (GameState.selectedColor) {
        // Apply the selected color
        const colorNum = GameState.selectedColor;
        puzzle.userColors[cellId] = colorNum;

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
    const { puzzles } = GameState;
    let totalCorrect = 0;
    let totalPath = 0;
    let allCorrect = true;

    // Check each puzzle
    puzzles.forEach((puzzle, puzzleIndex) => {
        const { maze, size, targetColor } = puzzle;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = maze[y][x];
                if (cell.type === 'wall' || cell.isStart || cell.isEnd) continue;

                const cellId = `cell-${puzzleIndex}-${y}-${x}`;
                const cellElement = document.getElementById(cellId);
                const userColor = puzzle.userColors[cellId];

                if (cell.type === 'path') {
                    totalPath++;

                    if (userColor === cell.colorIndex) {
                        totalCorrect++;
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
                        cellElement.classList.remove('correct', 'wrong');
                    } else {
                        cellElement.classList.add('wrong');
                        cellElement.classList.remove('correct');
                    }
                }
            }
        }

        puzzle.correctCellCount = 0;
        for (const pos of puzzle.path) {
            if (pos === puzzle.path[0] || pos === puzzle.path[puzzle.path.length - 1]) continue;
            const cellId = `cell-${puzzleIndex}-${pos.y}-${pos.x}`;
            if (puzzle.userColors[cellId] === puzzle.targetColor) {
                puzzle.correctCellCount++;
            }
        }
    });

    // Update progress state
    GameState.totalCorrectCells = totalCorrect;
    updateProgress();

    // Show result message
    const puzzleWord = puzzles.length > 1 ? 'puzzles' : 'puzzle';
    if (allCorrect && totalCorrect === totalPath) {
        showMessage(`Perfect! You solved all ${puzzles.length} ${puzzleWord}!`, 'success');
        playSound('complete');
        celebrate();
    } else if (totalCorrect === 0) {
        showMessage(`Find and color the path cells in each puzzle!`, 'info');
        playSound('wrong');
    } else {
        showMessage(`${totalCorrect} of ${totalPath} path cells found. Keep going!`, 'info');
        playSound('click');
    }
}

function showHint() {
    const { puzzles } = GameState;

    // Find all uncolored or incorrectly colored path cells across all puzzles
    const uncoloredPath = [];

    puzzles.forEach((puzzle, puzzleIndex) => {
        const { maze, path } = puzzle;

        for (const pos of path) {
            const cell = maze[pos.y][pos.x];
            if (cell.isStart || cell.isEnd) continue;

            const cellId = `cell-${puzzleIndex}-${pos.y}-${pos.x}`;
            const userColor = puzzle.userColors[cellId];

            if (!userColor || userColor !== cell.colorIndex) {
                uncoloredPath.push({ pos, cell, cellId, puzzleIndex });
            }
        }
    });

    if (uncoloredPath.length === 0) {
        showMessage('All path cells are correctly colored!', 'success');
        return;
    }

    // Pick a random one to hint
    const hint = uncoloredPath[Math.floor(Math.random() * uncoloredPath.length)];
    const colorName = COLORS[hint.cell.colorIndex].name;
    const puzzleNum = puzzles.length > 1 ? ` (Puzzle ${hint.puzzleIndex + 1})` : '';

    showMessage(`Hint${puzzleNum}: ${hint.cell.expression} = ${hint.cell.answer}, so color it ${colorName}!`, 'info');

    // Briefly highlight the cell
    const cellElement = document.getElementById(hint.cellId);
    cellElement.style.boxShadow = '0 0 0 4px gold';
    setTimeout(() => {
        cellElement.style.boxShadow = '';
    }, 2000);

    playSound('click');
}

function resetMaze() {
    // Reset all puzzles
    GameState.puzzles.forEach(puzzle => {
        puzzle.userColors = {};
        puzzle.correctCellCount = 0;
    });
    GameState.totalCorrectCells = 0;
    renderAllPuzzles();
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

    // Close modal on background click
    document.getElementById('helpModal').addEventListener('click', (e) => {
        if (e.target.id === 'helpModal') {
            hideHelp();
        }
    });

    // Generate initial maze
    generateMaze();
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', init);
