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
    activeColors: []
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

// Size configurations
const SIZE_CONFIG = {
    small: { size: 5, cellClass: 'small' },
    medium: { size: 7, cellClass: 'medium' },
    large: { size: 9, cellClass: 'large' }
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

    // Initialize maze grid (0 = wall, 1 = path)
    const maze = [];
    for (let i = 0; i < size; i++) {
        maze.push(new Array(size).fill(null));
    }

    // Generate a valid path from top-left to bottom-right
    const path = generatePath(size);
    GameState.path = path;

    // Mark path cells and add problems
    path.forEach((pos, idx) => {
        const colorIndex = GameState.activeColors[Math.floor(Math.random() * GameState.activeColors.length)];
        const problem = generateProblem(colorIndex, GameState.grade);

        maze[pos.y][pos.x] = {
            type: 'path',
            ...problem,
            colorIndex,
            isStart: idx === 0,
            isEnd: idx === path.length - 1
        };
    });

    // Fill remaining cells - some as decoys (solvable but not on path), some as walls
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            if (!maze[y][x]) {
                // Determine if this should be a wall or decoy
                // Cells adjacent to path are more likely to be decoys
                const isAdjacentToPath = isAdjacentTo(x, y, path);
                const shouldBeDecoy = isAdjacentToPath ? Math.random() > 0.3 : Math.random() > 0.6;

                if (shouldBeDecoy) {
                    // Create a decoy cell with a math problem
                    const colorIndex = GameState.activeColors[Math.floor(Math.random() * GameState.activeColors.length)];
                    const problem = generateProblem(colorIndex, GameState.grade);
                    maze[y][x] = {
                        type: 'decoy',
                        ...problem,
                        colorIndex
                    };
                } else {
                    maze[y][x] = { type: 'wall' };
                }
            }
        }
    }

    GameState.maze = maze;
    renderMaze();
    renderColorLegend();
    renderColorPalette();
    hideMessage();
}

function generatePath(size) {
    const path = [];
    let x = 0, y = 0;
    path.push({ x, y });

    // Create a winding path that goes from top-left to bottom-right
    // Path can go right, down, or sometimes backtrack slightly for interest
    while (x < size - 1 || y < size - 1) {
        const canGoRight = x < size - 1;
        const canGoDown = y < size - 1;

        // Bias towards moving forward but allow some variation
        if (canGoRight && canGoDown) {
            // Random choice with slight bias toward progress
            const rand = Math.random();
            if (rand < 0.45) {
                x++;
            } else if (rand < 0.9) {
                y++;
            } else {
                // Occasionally add a small detour
                x++;
            }
        } else if (canGoRight) {
            x++;
        } else {
            y++;
        }

        path.push({ x, y });
    }

    return path;
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
    const { maze, size, path } = GameState;
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
                // Decoy cells: show if colored correctly (even though not on path)
                if (userColor === cell.colorIndex) {
                    cellElement.classList.add('correct');
                    cellElement.classList.remove('wrong');
                } else {
                    cellElement.classList.add('wrong');
                    cellElement.classList.remove('correct');
                }
            }
        }
    }

    // Show result message
    if (allCorrect && correctCount === totalPath) {
        showMessage(`Perfect! You colored all ${totalPath} path cells correctly!`, 'success');
        playSound('complete');
        celebrate();
    } else if (correctCount === 0) {
        showMessage('No path cells colored yet. Solve the math problems and color the cells!', 'info');
        playSound('wrong');
    } else {
        showMessage(`${correctCount} of ${totalPath} path cells correct. Keep going!`, 'info');
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
    renderMaze();
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
