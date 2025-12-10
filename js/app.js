/**
 * MathBlocks - Fun Math Puzzles for Kids
 * Main Application JavaScript
 */

// ============================================
// State Management
// ============================================

const AppState = {
    currentPuzzle: null,
    currentPuzzleType: 'grid',
    showingAnswers: false,
    soundEnabled: true,
    stats: {
        puzzlesCompleted: 0,
        starsEarned: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        streak: 0,
        lastPlayDate: null
    },
    achievements: []
};

// Color mapping
const COLORS = {
    1: { name: 'Red', class: 'color-1', hex: '#EF4444' },
    2: { name: 'Orange', class: 'color-2', hex: '#F97316' },
    3: { name: 'Yellow', class: 'color-3', hex: '#FBBF24' },
    4: { name: 'Green', class: 'color-4', hex: '#22C55E' },
    5: { name: 'Blue', class: 'color-5', hex: '#3B82F6' },
    6: { name: 'Purple', class: 'color-6', hex: '#A855F7' },
    7: { name: 'Brown', class: 'color-7', hex: '#92400E' },
    8: { name: 'Black', class: 'color-8', hex: '#1F2937' }
};

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_puzzle', name: 'First Steps', desc: 'Complete your first puzzle', icon: '🎯', condition: s => s.puzzlesCompleted >= 1 },
    { id: 'five_puzzles', name: 'Getting Started', desc: 'Complete 5 puzzles', icon: '🌟', condition: s => s.puzzlesCompleted >= 5 },
    { id: 'ten_puzzles', name: 'Puzzle Pro', desc: 'Complete 10 puzzles', icon: '🏆', condition: s => s.puzzlesCompleted >= 10 },
    { id: 'twenty_five', name: 'Math Master', desc: 'Complete 25 puzzles', icon: '👑', condition: s => s.puzzlesCompleted >= 25 },
    { id: 'fifty_puzzles', name: 'Legend', desc: 'Complete 50 puzzles', icon: '🌈', condition: s => s.puzzlesCompleted >= 50 },
    { id: 'perfect_ten', name: 'Perfect 10', desc: 'Get 10 correct in a row', icon: '💯', condition: s => s.streak >= 10 },
    { id: 'star_collector', name: 'Star Collector', desc: 'Earn 50 stars', icon: '⭐', condition: s => s.starsEarned >= 50 },
    { id: 'accuracy_king', name: 'Sharp Shooter', desc: 'Achieve 90% accuracy', icon: '🎯', condition: s => s.totalAnswers >= 20 && (s.correctAnswers / s.totalAnswers) >= 0.9 }
];

// Mystery picture patterns (simplified pixel art)
const MYSTERY_PICTURES = [
    {
        name: 'Star',
        grid: [
            [0,0,0,1,0,0,0],
            [0,0,1,1,1,0,0],
            [1,1,1,1,1,1,1],
            [0,1,1,1,1,1,0],
            [0,0,1,1,1,0,0],
            [0,1,0,1,0,1,0],
            [1,0,0,1,0,0,1]
        ],
        colors: { 0: 5, 1: 3 } // Blue background, yellow star
    },
    {
        name: 'Heart',
        grid: [
            [0,1,1,0,1,1,0],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1],
            [0,1,1,1,1,1,0],
            [0,0,1,1,1,0,0],
            [0,0,0,1,0,0,0],
            [0,0,0,0,0,0,0]
        ],
        colors: { 0: 6, 1: 1 } // Purple background, red heart
    },
    {
        name: 'Smiley',
        grid: [
            [0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1],
            [1,2,1,1,1,2,1],
            [1,1,1,1,1,1,1],
            [1,2,1,1,1,2,1],
            [1,1,2,2,2,1,1],
            [0,1,1,1,1,1,0]
        ],
        colors: { 0: 5, 1: 3, 2: 8 } // Blue bg, yellow face, black features
    },
    {
        name: 'Tree',
        grid: [
            [0,0,0,1,0,0,0],
            [0,0,1,1,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1],
            [0,0,0,2,0,0,0],
            [0,0,0,2,0,0,0],
            [0,0,0,2,0,0,0]
        ],
        colors: { 0: 5, 1: 4, 2: 7 } // Blue sky, green tree, brown trunk
    },
    {
        name: 'Rainbow',
        grid: [
            [0,0,1,1,1,0,0],
            [0,1,2,2,2,1,0],
            [1,2,3,3,3,2,1],
            [1,2,3,0,3,2,1],
            [1,2,3,0,3,2,1],
            [0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0]
        ],
        colors: { 0: 5, 1: 1, 2: 2, 3: 3 }
    }
];

// ============================================
// Storage Functions
// ============================================

function loadStats() {
    try {
        const saved = localStorage.getItem('mathblocks_stats');
        if (saved) {
            AppState.stats = { ...AppState.stats, ...JSON.parse(saved) };
        }
        const savedAchievements = localStorage.getItem('mathblocks_achievements');
        if (savedAchievements) {
            AppState.achievements = JSON.parse(savedAchievements);
        }
    } catch (e) {
        console.log('Could not load saved stats');
    }
    updateStatsDisplay();
}

function saveStats() {
    try {
        localStorage.setItem('mathblocks_stats', JSON.stringify(AppState.stats));
        localStorage.setItem('mathblocks_achievements', JSON.stringify(AppState.achievements));
    } catch (e) {
        console.log('Could not save stats');
    }
}

function updateStatsDisplay() {
    const totalStars = document.getElementById('totalStars');
    if (totalStars) totalStars.textContent = AppState.stats.starsEarned;

    const statPuzzles = document.getElementById('statPuzzlesCompleted');
    if (statPuzzles) statPuzzles.textContent = AppState.stats.puzzlesCompleted;

    const statStars = document.getElementById('statStarsEarned');
    if (statStars) statStars.textContent = AppState.stats.starsEarned;

    const statStreak = document.getElementById('statStreak');
    if (statStreak) statStreak.textContent = AppState.stats.streak;

    const statAccuracy = document.getElementById('statAccuracy');
    if (statAccuracy) {
        const accuracy = AppState.stats.totalAnswers > 0
            ? Math.round((AppState.stats.correctAnswers / AppState.stats.totalAnswers) * 100)
            : 0;
        statAccuracy.textContent = accuracy + '%';
    }
}

// ============================================
// Navigation Functions
// ============================================

function showHome() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('puzzlePage').style.display = 'none';
    document.getElementById('progressPage').style.display = 'none';
    updateNavActive('home');
}

function showPuzzleSelect() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('puzzlePage').style.display = 'none';
    document.getElementById('progressPage').style.display = 'none';
    updateNavActive('puzzles');
    // Scroll to puzzle cards
    document.querySelector('.puzzle-grid').scrollIntoView({ behavior: 'smooth' });
}

function showProgress() {
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('puzzlePage').style.display = 'none';
    document.getElementById('progressPage').style.display = 'block';
    updateNavActive('progress');
    renderAchievements();
    updateStatsDisplay();
}

function updateNavActive(page) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
}

// ============================================
// Sound Functions
// ============================================

function toggleSound() {
    AppState.soundEnabled = !AppState.soundEnabled;
    const icon = document.getElementById('soundIcon');
    icon.textContent = AppState.soundEnabled ? '🔊' : '🔇';
}

function playSound(type) {
    if (!AppState.soundEnabled) return;

    // Use Web Audio API for simple sounds
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch (type) {
            case 'correct':
                oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
                oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
                oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.4);
                break;
            case 'wrong':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
            case 'click':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.05);
                break;
            case 'complete':
                const notes = [523.25, 659.25, 783.99, 1046.50];
                notes.forEach((freq, i) => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.15);
                    gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                    osc.start(audioContext.currentTime + i * 0.15);
                    osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
                });
                break;
        }
    } catch (e) {
        // Audio not supported
    }
}

// ============================================
// Toast Notifications
// ============================================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };

    toast.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// Problem Generation
// ============================================

function getOperationsForGrade(grade) {
    switch (parseInt(grade)) {
        case 1:
        case 2:
            return ['+', '-'];
        case 3:
            return ['+', '-', '*'];
        case 4:
            return ['+', '-', '*', '/'];
        case 5:
            return ['two-step'];
        case 6:
        case 7:
            return ['pemdas'];
        default:
            return ['+', '-'];
    }
}

function generateProblem(target, grade, difficulty) {
    const operations = getOperationsForGrade(grade);
    const op = operations[Math.floor(Math.random() * operations.length)];

    switch (op) {
        case '+':
            return generateAddition(target, grade);
        case '-':
            return generateSubtraction(target, grade);
        case '*':
            return generateMultiplication(target, grade);
        case '/':
            return generateDivision(target, grade);
        case 'two-step':
            return generateTwoStep(target, grade);
        case 'pemdas':
            return generatePemdas(target, grade);
        default:
            return generateAddition(target, grade);
    }
}

function generateAddition(target, grade) {
    const maxNum = grade <= 2 ? 10 : 20;
    const a = Math.floor(Math.random() * Math.min(target, maxNum - target + 1));
    const b = target - a;
    return { expression: `${a} + ${b}`, answer: target };
}

function generateSubtraction(target, grade) {
    const maxNum = grade <= 2 ? 10 : 20;
    const b = Math.floor(Math.random() * (maxNum - target)) + 1;
    const a = target + b;
    return { expression: `${a} - ${b}`, answer: target };
}

function generateMultiplication(target, grade) {
    const factors = [];
    for (let i = 1; i <= target; i++) {
        if (target % i === 0 && i <= 4 && (target / i) <= 10) {
            factors.push([i, target / i]);
        }
    }

    if (factors.length === 0) {
        return generateAddition(target, grade);
    }

    const [a, b] = factors[Math.floor(Math.random() * factors.length)];
    if (Math.random() > 0.5) {
        return { expression: `${a} × ${b}`, answer: target };
    }
    return { expression: `${b} × ${a}`, answer: target };
}

function generateDivision(target, grade) {
    const multipliers = [2, 3, 4, 5, 6];
    const mult = multipliers[Math.floor(Math.random() * multipliers.length)];
    const dividend = target * mult;
    return { expression: `${dividend} ÷ ${mult}`, answer: target };
}

function generateTwoStep(target, grade) {
    const patterns = [
        () => {
            const a = Math.floor(Math.random() * target);
            const b = target - a;
            const c = Math.floor(Math.random() * 5) + 1;
            return {
                expression: `(${a + c} - ${c}) + ${b}`,
                answer: target
            };
        },
        () => {
            const c = Math.floor(Math.random() * (target - 1)) + 1;
            const remainder = target - c;
            if (remainder >= 2) {
                const factors = [];
                for (let i = 1; i <= remainder; i++) {
                    if (remainder % i === 0 && i <= 4 && (remainder / i) <= 4) {
                        factors.push([i, remainder / i]);
                    }
                }
                if (factors.length > 0) {
                    const [a, b] = factors[Math.floor(Math.random() * factors.length)];
                    return { expression: `${a} × ${b} + ${c}`, answer: target };
                }
            }
            return generateAddition(target, grade);
        }
    ];

    return patterns[Math.floor(Math.random() * patterns.length)]();
}

function generatePemdas(target, grade) {
    const patterns = [
        () => {
            for (let b = 1; b <= 3; b++) {
                for (let c = 1; c <= 3; c++) {
                    const product = b * c;
                    const a = target - product;
                    if (a >= 0 && a <= 10) {
                        return { expression: `${a} + ${b} × ${c}`, answer: target };
                    }
                }
            }
            return generateAddition(target, grade);
        },
        () => {
            const c = Math.floor(Math.random() * 3) + 2;
            const sum = target * c;
            const a = Math.floor(Math.random() * sum);
            const b = sum - a;
            if (a >= 0 && b >= 0) {
                return { expression: `(${a} + ${b}) ÷ ${c}`, answer: target };
            }
            return generateDivision(target, grade);
        }
    ];

    return patterns[Math.floor(Math.random() * patterns.length)]();
}

// ============================================
// Puzzle Generators
// ============================================

function startPuzzle(type) {
    AppState.currentPuzzleType = type;
    AppState.showingAnswers = false;

    document.getElementById('homePage').style.display = 'none';
    document.getElementById('puzzlePage').style.display = 'block';
    document.getElementById('progressPage').style.display = 'none';

    // Show/hide grid size option based on puzzle type
    const gridSizeGroup = document.getElementById('gridSizeGroup');
    if (type === 'grid' || type === 'mystery') {
        gridSizeGroup.style.display = 'block';
    } else {
        gridSizeGroup.style.display = 'none';
    }

    generateCurrentPuzzle();
}

function generateCurrentPuzzle() {
    const grade = document.getElementById('gradeLevel').value;
    const gridSize = parseInt(document.getElementById('gridSize').value);
    const difficulty = document.getElementById('difficulty').value;

    AppState.showingAnswers = false;

    switch (AppState.currentPuzzleType) {
        case 'grid':
            AppState.currentPuzzle = generateGridPuzzle(gridSize, grade, difficulty);
            break;
        case 'mystery':
            AppState.currentPuzzle = generateMysteryPuzzle(grade, difficulty);
            break;
        case 'maze':
            AppState.currentPuzzle = generateMazePuzzle(grade, difficulty);
            break;
        case 'pattern':
            AppState.currentPuzzle = generatePatternPuzzle(grade, difficulty);
            break;
        case 'bonds':
            AppState.currentPuzzle = generateBondsPuzzle(grade, difficulty);
            break;
        case 'numberblock':
            AppState.currentPuzzle = generateNumberblockPuzzle(grade, difficulty);
            break;
        default:
            AppState.currentPuzzle = generateGridPuzzle(gridSize, grade, difficulty);
    }

    renderCurrentPuzzle();
}

// Grid Puzzle
function generateGridPuzzle(size, grade, difficulty) {
    const grid = [];
    let checksum = 0;

    for (let row = 0; row < size; row++) {
        const rowData = [];
        for (let col = 0; col < size; col++) {
            let effectiveGrade = grade;
            if (difficulty === 'challenge' && row >= size / 2) {
                effectiveGrade = Math.min(7, parseInt(grade) + 1);
            }

            const target = Math.floor(Math.random() * 8) + 1;
            const problem = generateProblem(target, effectiveGrade, difficulty);

            rowData.push(problem);
            checksum += problem.answer;
        }
        grid.push(rowData);
    }

    return { type: 'grid', grid, checksum, size };
}

// Mystery Picture Puzzle
function generateMysteryPuzzle(grade, difficulty) {
    const picture = MYSTERY_PICTURES[Math.floor(Math.random() * MYSTERY_PICTURES.length)];
    const grid = [];
    let checksum = 0;

    for (let row = 0; row < picture.grid.length; row++) {
        const rowData = [];
        for (let col = 0; col < picture.grid[0].length; col++) {
            const pixelValue = picture.grid[row][col];
            const colorNum = picture.colors[pixelValue];
            const problem = generateProblem(colorNum, grade, difficulty);
            rowData.push({ ...problem, colorNum });
            checksum += colorNum;
        }
        grid.push(rowData);
    }

    return {
        type: 'mystery',
        name: picture.name,
        grid,
        checksum,
        rows: picture.grid.length,
        cols: picture.grid[0].length
    };
}

// Math Maze Puzzle
function generateMazePuzzle(grade, difficulty) {
    const size = 5;
    const maze = [];
    const path = [];

    // Generate a simple maze with a valid path
    // Start at top-left, end at bottom-right
    for (let i = 0; i < size; i++) {
        maze.push(new Array(size).fill(null));
    }

    // Create a path from start to end
    let x = 0, y = 0;
    path.push({ x, y });

    while (x < size - 1 || y < size - 1) {
        if (x < size - 1 && y < size - 1) {
            if (Math.random() > 0.5) {
                x++;
            } else {
                y++;
            }
        } else if (x < size - 1) {
            x++;
        } else {
            y++;
        }
        path.push({ x, y });
    }

    // Mark path cells with problems
    let checksum = 0;
    path.forEach((pos, idx) => {
        const target = Math.floor(Math.random() * 8) + 1;
        const problem = generateProblem(target, grade, difficulty);
        maze[pos.y][pos.x] = { ...problem, isPath: true, isStart: idx === 0, isEnd: idx === path.length - 1 };
        checksum += target;
    });

    // Fill remaining cells with decoy problems
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (!maze[row][col]) {
                const target = Math.floor(Math.random() * 8) + 1;
                const problem = generateProblem(target, grade, difficulty);
                maze[row][col] = { ...problem, isPath: false };
            }
        }
    }

    return { type: 'maze', maze, path, checksum, size };
}

// Pattern Sequence Puzzle
function generatePatternPuzzle(grade, difficulty) {
    const patterns = [];
    const numProblems = 5;

    for (let i = 0; i < numProblems; i++) {
        const patternType = Math.floor(Math.random() * 4);
        let sequence, answer, choices;

        switch (patternType) {
            case 0: // Add constant
                const addVal = Math.floor(Math.random() * 4) + 1;
                const start1 = Math.floor(Math.random() * 5) + 1;
                sequence = [start1, start1 + addVal, start1 + addVal * 2, start1 + addVal * 3];
                answer = start1 + addVal * 4;
                break;
            case 1: // Multiply by 2
                const start2 = Math.floor(Math.random() * 3) + 1;
                sequence = [start2, start2 * 2, start2 * 4, start2 * 8];
                answer = start2 * 16;
                break;
            case 2: // Subtract constant
                const subVal = Math.floor(Math.random() * 3) + 1;
                const start3 = 20 + Math.floor(Math.random() * 10);
                sequence = [start3, start3 - subVal, start3 - subVal * 2, start3 - subVal * 3];
                answer = start3 - subVal * 4;
                break;
            case 3: // Alternating add
                const start4 = Math.floor(Math.random() * 5) + 1;
                const alt1 = Math.floor(Math.random() * 3) + 1;
                const alt2 = Math.floor(Math.random() * 3) + 2;
                sequence = [start4, start4 + alt1, start4 + alt1 + alt2, start4 + alt1 * 2 + alt2];
                answer = start4 + alt1 * 2 + alt2 * 2;
                break;
        }

        // Generate wrong choices
        choices = [answer];
        while (choices.length < 4) {
            const wrong = answer + (Math.floor(Math.random() * 10) - 5);
            if (wrong > 0 && wrong !== answer && !choices.includes(wrong)) {
                choices.push(wrong);
            }
        }
        choices = choices.sort(() => Math.random() - 0.5);

        patterns.push({ sequence, answer, choices, userAnswer: null });
    }

    return { type: 'pattern', patterns, currentIndex: 0 };
}

// Number Bonds Puzzle
function generateBondsPuzzle(grade, difficulty) {
    const bonds = [];
    const numProblems = 5;

    for (let i = 0; i < numProblems; i++) {
        let total, part1, part2, missingPart;

        if (grade <= 2) {
            total = Math.floor(Math.random() * 10) + 5;
        } else {
            total = Math.floor(Math.random() * 15) + 10;
        }

        part1 = Math.floor(Math.random() * (total - 1)) + 1;
        part2 = total - part1;

        // Randomly hide one part
        missingPart = Math.random() > 0.5 ? 1 : 2;

        bonds.push({
            total,
            part1,
            part2,
            missingPart,
            userAnswer: null
        });
    }

    return { type: 'bonds', bonds, currentIndex: 0 };
}

// Numberblock Puzzle
function generateNumberblockPuzzle(grade, difficulty) {
    const characterNumber = Math.floor(Math.random() * 8) + 1;
    const blocks = [];

    for (let i = 0; i < characterNumber; i++) {
        const problem = generateProblem(characterNumber, grade, difficulty);
        blocks.push(problem);
    }

    const checksum = characterNumber * characterNumber;

    return {
        type: 'numberblock',
        characterNumber,
        blocks,
        checksum,
        color: COLORS[characterNumber]
    };
}

// ============================================
// Puzzle Renderers
// ============================================

function renderCurrentPuzzle() {
    const container = document.getElementById('puzzleContainer');

    switch (AppState.currentPuzzle.type) {
        case 'grid':
            renderGridPuzzle(container);
            break;
        case 'mystery':
            renderMysteryPuzzle(container);
            break;
        case 'maze':
            renderMazePuzzle(container);
            break;
        case 'pattern':
            renderPatternPuzzle(container);
            break;
        case 'bonds':
            renderBondsPuzzle(container);
            break;
        case 'numberblock':
            renderNumberblockPuzzle(container);
            break;
    }
}

function renderColorKey() {
    return `
        <div class="color-key">
            <div class="color-key-title">Color Key</div>
            <div class="color-key-items">
                ${Object.entries(COLORS).map(([num, color]) => `
                    <div class="color-key-item">
                        <div class="color-swatch ${color.class}"></div>
                        <span class="color-label">${num}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderGridPuzzle(container) {
    const { grid, size, checksum } = AppState.currentPuzzle;

    let html = `
        <div class="puzzle-header">
            <div class="puzzle-title">
                <h2>Color by Number</h2>
            </div>
        </div>
        ${renderColorKey()}
        <div class="puzzle-grid-container">
            <div class="mystery-grid" style="grid-template-columns: repeat(${size}, 80px);">
    `;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = grid[row][col];
            html += `
                <div class="puzzle-cell" data-answer="${cell.answer}" data-row="${row}" data-col="${col}"
                     onclick="handleCellClick(this)">
                    ${cell.expression}
                </div>
            `;
        }
    }

    html += `
            </div>
        </div>
        <div class="verification">
            <p><strong>Check your work:</strong> Add up all your answers.</p>
            <p>You should get: <span class="verification-number">${checksum}</span></p>
        </div>
    `;

    container.innerHTML = html;
}

function renderMysteryPuzzle(container) {
    const { grid, rows, cols, checksum, name } = AppState.currentPuzzle;
    const cellSize = cols > 6 ? 50 : 60;

    let html = `
        <div class="puzzle-header">
            <div class="puzzle-title">
                <h2>Mystery Picture</h2>
                <span style="color: var(--text-secondary); font-weight: normal;">Can you reveal the hidden image?</span>
            </div>
        </div>
        ${renderColorKey()}
        <div class="puzzle-grid-container">
            <div class="mystery-grid" style="grid-template-columns: repeat(${cols}, ${cellSize}px);">
    `;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = grid[row][col];
            html += `
                <div class="mystery-cell ${cellSize < 60 ? 'small' : ''}" data-answer="${cell.answer}"
                     data-row="${row}" data-col="${col}" onclick="handleCellClick(this)"
                     style="width: ${cellSize}px; height: ${cellSize}px;">
                    ${cell.expression}
                </div>
            `;
        }
    }

    html += `
            </div>
        </div>
        <div class="verification">
            <p><strong>Check your work:</strong> Add up all your answers.</p>
            <p>You should get: <span class="verification-number">${checksum}</span></p>
        </div>
    `;

    container.innerHTML = html;
}

function renderMazePuzzle(container) {
    const { maze, size, checksum } = AppState.currentPuzzle;

    let html = `
        <div class="puzzle-header">
            <div class="puzzle-title">
                <h2>Math Maze</h2>
                <span style="color: var(--text-secondary); font-weight: normal;">Find the path from START to END!</span>
            </div>
        </div>
        <div class="maze-container">
            <div class="maze-grid" style="grid-template-columns: repeat(${size}, 70px);">
    `;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const cell = maze[row][col];
            let cellClass = 'maze-cell';
            let label = cell.expression;

            if (cell.isStart) {
                cellClass += ' start';
                label = 'START';
            } else if (cell.isEnd) {
                cellClass += ' end';
                label = 'END';
            }

            html += `
                <div class="${cellClass}" data-answer="${cell.answer}" data-is-path="${cell.isPath}"
                     data-row="${row}" data-col="${col}" onclick="handleMazeClick(this)">
                    ${label}
                </div>
            `;
        }
    }

    html += `
            </div>
        </div>
        <div class="verification">
            <p><strong>Hint:</strong> The correct path checksum is: <span class="verification-number">${checksum}</span></p>
        </div>
    `;

    container.innerHTML = html;
}

function renderPatternPuzzle(container) {
    const { patterns, currentIndex } = AppState.currentPuzzle;
    const current = patterns[currentIndex];

    let html = `
        <div class="puzzle-header">
            <div class="puzzle-title">
                <h2>Pattern Sequences</h2>
                <span style="color: var(--text-secondary); font-weight: normal;">Problem ${currentIndex + 1} of ${patterns.length}</span>
            </div>
        </div>
        <div class="pattern-container">
            <p style="font-size: 1.25rem; margin-bottom: 1rem;">What comes next in the pattern?</p>
            <div class="pattern-sequence">
                ${current.sequence.map(num => `<div class="pattern-item">${num}</div>`).join('')}
                <div class="pattern-item question">?</div>
            </div>
            <div class="pattern-choices">
                ${current.choices.map((choice, idx) => `
                    <div class="pattern-choice ${current.userAnswer === choice ? 'selected' : ''}"
                         data-choice="${choice}" onclick="handlePatternChoice(${choice})">
                        ${choice}
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                <button class="btn btn-secondary" onclick="prevPattern()" ${currentIndex === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <button class="btn btn-primary" onclick="nextPattern()" ${currentIndex === patterns.length - 1 ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderBondsPuzzle(container) {
    const { bonds, currentIndex } = AppState.currentPuzzle;
    const current = bonds[currentIndex];

    const showPart1 = current.missingPart !== 1 ? current.part1 : '?';
    const showPart2 = current.missingPart !== 2 ? current.part2 : '?';

    let html = `
        <div class="puzzle-header">
            <div class="puzzle-title">
                <h2>Number Bonds</h2>
                <span style="color: var(--text-secondary); font-weight: normal;">Problem ${currentIndex + 1} of ${bonds.length}</span>
            </div>
        </div>
        <div class="bonds-container">
            <p style="font-size: 1.25rem; margin-bottom: 1rem;">Find the missing number!</p>
            <div class="bond-problem">
                <div class="bond-top">${current.total}</div>
                <div class="bond-branches">
                    <div class="bond-bottom ${current.missingPart === 1 ? 'question' : ''}"
                         ${current.missingPart === 1 ? 'onclick="handleBondInput(1)"' : ''}>
                        ${current.missingPart === 1 && current.userAnswer !== null ? current.userAnswer : showPart1}
                    </div>
                    <div class="bond-bottom ${current.missingPart === 2 ? 'question' : ''}"
                         ${current.missingPart === 2 ? 'onclick="handleBondInput(2)"' : ''}>
                        ${current.missingPart === 2 && current.userAnswer !== null ? current.userAnswer : showPart2}
                    </div>
                </div>
            </div>
            <div style="margin-top: 2rem;">
                <input type="number" id="bondAnswer" class="form-input" style="width: 120px; text-align: center; font-size: 1.5rem;"
                       placeholder="?" value="${current.userAnswer || ''}"
                       onchange="saveBondAnswer(this.value)" onkeyup="saveBondAnswer(this.value)">
            </div>
            <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center;">
                <button class="btn btn-secondary" onclick="prevBond()" ${currentIndex === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <button class="btn btn-primary" onclick="nextBond()" ${currentIndex === bonds.length - 1 ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function renderNumberblockPuzzle(container) {
    const { characterNumber, blocks, checksum, color } = AppState.currentPuzzle;

    const numberNames = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

    let html = `
        <div class="puzzle-header">
            <div class="puzzle-title">
                <h2>Numberblocks: ${numberNames[characterNumber]}</h2>
            </div>
        </div>
        ${renderColorKey()}
        <div style="text-align: center;">
            <p style="font-size: 1.25rem; margin-bottom: 1rem;">
                This is "${numberNames[characterNumber]}"! Solve each block - all answers should equal ${characterNumber}.
                <br>Color them all <strong style="color: ${color.hex}">${color.name}</strong>!
            </p>
            <div style="display: inline-flex; flex-direction: column; align-items: center; gap: 0;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">
                    ${characterNumber <= 4 ? '😊' : '😄'}
                </div>
    `;

    for (let i = blocks.length - 1; i >= 0; i--) {
        const block = blocks[i];
        html += `
            <div class="puzzle-cell" data-answer="${block.answer}" data-index="${i}"
                 onclick="handleCellClick(this)" style="width: 100px; height: 60px;">
                ${block.expression}
            </div>
        `;
    }

    html += `
            </div>
        </div>
        <div class="verification">
            <p><strong>Check your work:</strong> Add up all your answers.</p>
            <p>You should get: <span class="verification-number">${checksum}</span></p>
        </div>
    `;

    container.innerHTML = html;
}

// ============================================
// Interaction Handlers
// ============================================

function handleCellClick(cell) {
    const answer = parseInt(cell.dataset.answer);
    playSound('click');

    if (cell.classList.contains('solved')) {
        // Toggle off
        cell.classList.remove('solved');
        Object.values(COLORS).forEach(c => cell.classList.remove(c.class));
    } else {
        // Color it
        cell.classList.add('solved', COLORS[answer].class);
        checkPuzzleComplete();
    }
}

function handleMazeClick(cell) {
    playSound('click');

    if (cell.classList.contains('start') || cell.classList.contains('end')) return;

    if (cell.classList.contains('path')) {
        cell.classList.remove('path');
    } else {
        cell.classList.add('path');
    }

    checkMazeComplete();
}

function handlePatternChoice(choice) {
    const { patterns, currentIndex } = AppState.currentPuzzle;
    patterns[currentIndex].userAnswer = choice;
    playSound('click');
    renderPatternPuzzle(document.getElementById('puzzleContainer'));
}

function prevPattern() {
    if (AppState.currentPuzzle.currentIndex > 0) {
        AppState.currentPuzzle.currentIndex--;
        renderPatternPuzzle(document.getElementById('puzzleContainer'));
    }
}

function nextPattern() {
    const { patterns, currentIndex } = AppState.currentPuzzle;
    if (currentIndex < patterns.length - 1) {
        AppState.currentPuzzle.currentIndex++;
        renderPatternPuzzle(document.getElementById('puzzleContainer'));
    }
}

function saveBondAnswer(value) {
    const { bonds, currentIndex } = AppState.currentPuzzle;
    bonds[currentIndex].userAnswer = value ? parseInt(value) : null;
}

function handleBondInput(part) {
    document.getElementById('bondAnswer').focus();
}

function prevBond() {
    if (AppState.currentPuzzle.currentIndex > 0) {
        AppState.currentPuzzle.currentIndex--;
        renderBondsPuzzle(document.getElementById('puzzleContainer'));
    }
}

function nextBond() {
    const { bonds, currentIndex } = AppState.currentPuzzle;
    if (currentIndex < bonds.length - 1) {
        AppState.currentPuzzle.currentIndex++;
        renderBondsPuzzle(document.getElementById('puzzleContainer'));
    }
}

// ============================================
// Completion Checks
// ============================================

function checkPuzzleComplete() {
    const cells = document.querySelectorAll('.puzzle-cell, .mystery-cell');
    const allSolved = Array.from(cells).every(cell => cell.classList.contains('solved'));

    if (allSolved) {
        celebratePuzzleComplete();
    }
}

function checkMazeComplete() {
    const { path } = AppState.currentPuzzle;
    const cells = document.querySelectorAll('.maze-cell.path');

    // Check if selected cells match the actual path
    const selectedPositions = Array.from(cells).map(c => ({
        x: parseInt(c.dataset.col),
        y: parseInt(c.dataset.row)
    }));

    // Simple check: are all path cells selected?
    const pathCells = document.querySelectorAll('.maze-cell[data-is-path="true"]');
    const allPathSelected = Array.from(pathCells).every(c =>
        c.classList.contains('path') || c.classList.contains('start') || c.classList.contains('end')
    );

    if (allPathSelected && cells.length === path.length - 2) { // -2 for start and end
        celebratePuzzleComplete();
    }
}

function celebratePuzzleComplete() {
    playSound('complete');

    // Confetti!
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }

    // Update stats
    AppState.stats.puzzlesCompleted++;
    AppState.stats.starsEarned += 3;
    AppState.stats.correctAnswers++;
    AppState.stats.totalAnswers++;

    saveStats();
    updateStatsDisplay();
    checkAchievements();

    showToast('Puzzle Complete! +3 Stars', 'success');
}

// ============================================
// Answer Checking
// ============================================

function checkAnswers() {
    const puzzle = AppState.currentPuzzle;

    switch (puzzle.type) {
        case 'pattern':
            checkPatternAnswers();
            break;
        case 'bonds':
            checkBondsAnswers();
            break;
        case 'maze':
            checkMazeAnswers();
            break;
        default:
            checkGridAnswers();
    }
}

function checkGridAnswers() {
    const cells = document.querySelectorAll('.puzzle-cell, .mystery-cell');
    let correct = 0;
    let total = 0;

    cells.forEach(cell => {
        total++;
        const answer = parseInt(cell.dataset.answer);

        if (cell.classList.contains('solved')) {
            const hasCorrectColor = cell.classList.contains(COLORS[answer].class);
            if (hasCorrectColor) {
                correct++;
                cell.style.outline = '3px solid #22C55E';
            } else {
                cell.style.outline = '3px solid #EF4444';
                cell.classList.add('animate-shake');
            }
        } else {
            cell.style.outline = '3px solid #F97316';
        }
    });

    setTimeout(() => {
        cells.forEach(cell => {
            cell.style.outline = '';
            cell.classList.remove('animate-shake');
        });
    }, 2000);

    if (correct === total) {
        celebratePuzzleComplete();
    } else {
        playSound('wrong');
        showToast(`${correct}/${total} correct. Keep trying!`, 'warning');
    }
}

function checkPatternAnswers() {
    const { patterns } = AppState.currentPuzzle;
    let correct = 0;

    patterns.forEach(p => {
        if (p.userAnswer === p.answer) correct++;
    });

    AppState.stats.correctAnswers += correct;
    AppState.stats.totalAnswers += patterns.length;

    if (correct === patterns.length) {
        AppState.stats.puzzlesCompleted++;
        AppState.stats.starsEarned += 5;
        saveStats();
        updateStatsDisplay();
        playSound('complete');
        showToast('All patterns correct! +5 Stars', 'success');

        if (typeof confetti !== 'undefined') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    } else {
        playSound('wrong');
        showToast(`${correct}/${patterns.length} correct. Try again!`, 'warning');
    }

    checkAchievements();
    saveStats();
}

function checkBondsAnswers() {
    const { bonds } = AppState.currentPuzzle;
    let correct = 0;

    bonds.forEach(b => {
        const correctAnswer = b.missingPart === 1 ? b.part1 : b.part2;
        if (b.userAnswer === correctAnswer) correct++;
    });

    AppState.stats.correctAnswers += correct;
    AppState.stats.totalAnswers += bonds.length;

    if (correct === bonds.length) {
        AppState.stats.puzzlesCompleted++;
        AppState.stats.starsEarned += 5;
        saveStats();
        updateStatsDisplay();
        playSound('complete');
        showToast('All bonds correct! +5 Stars', 'success');

        if (typeof confetti !== 'undefined') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    } else {
        playSound('wrong');
        showToast(`${correct}/${bonds.length} correct. Try again!`, 'warning');
    }

    checkAchievements();
    saveStats();
}

function checkMazeAnswers() {
    const { path } = AppState.currentPuzzle;
    const pathCells = document.querySelectorAll('.maze-cell.path');

    // Check if the path is correct
    let allCorrect = true;

    pathCells.forEach(cell => {
        const isActualPath = cell.dataset.isPath === 'true';
        if (isActualPath) {
            cell.classList.add('correct-path');
        } else {
            cell.classList.add('animate-shake');
            allCorrect = false;
        }
    });

    if (allCorrect && pathCells.length === path.length - 2) {
        celebratePuzzleComplete();
    } else {
        playSound('wrong');
        showToast('Not quite right. Try again!', 'warning');
    }

    setTimeout(() => {
        document.querySelectorAll('.maze-cell').forEach(cell => {
            cell.classList.remove('animate-shake', 'correct-path');
        });
    }, 2000);
}

function toggleAnswers() {
    AppState.showingAnswers = !AppState.showingAnswers;

    if (AppState.currentPuzzle.type === 'pattern' || AppState.currentPuzzle.type === 'bonds') {
        if (AppState.showingAnswers) {
            showToast('Answers: Check the sequence patterns', 'info');
        }
        return;
    }

    const cells = document.querySelectorAll('.puzzle-cell, .mystery-cell');

    cells.forEach(cell => {
        const answer = parseInt(cell.dataset.answer);
        if (AppState.showingAnswers) {
            cell.classList.add('solved', COLORS[answer].class);
        } else {
            cell.classList.remove('solved');
            Object.values(COLORS).forEach(c => cell.classList.remove(c.class));
        }
    });
}

// ============================================
// Achievements
// ============================================

function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!AppState.achievements.includes(achievement.id) && achievement.condition(AppState.stats)) {
            AppState.achievements.push(achievement.id);
            showToast(`Achievement Unlocked: ${achievement.name}!`, 'success');
            playSound('complete');
        }
    });
    saveStats();
}

function renderAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;

    grid.innerHTML = ACHIEVEMENTS.map(achievement => {
        const unlocked = AppState.achievements.includes(achievement.id);
        return `
            <div class="achievement ${unlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            </div>
        `;
    }).join('');
}

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    renderAchievements();

    // Add keyboard navigation for patterns and bonds
    document.addEventListener('keydown', (e) => {
        if (AppState.currentPuzzle?.type === 'pattern') {
            if (e.key === 'ArrowLeft') prevPattern();
            if (e.key === 'ArrowRight') nextPattern();
        }
        if (AppState.currentPuzzle?.type === 'bonds') {
            if (e.key === 'ArrowLeft') prevBond();
            if (e.key === 'ArrowRight') nextBond();
        }
    });
});
