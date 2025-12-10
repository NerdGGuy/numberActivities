# Math Maze - Color Your Way Through!

An educational puzzle game where children solve math problems to reveal and color a hidden path through a maze. Redesigned for clarity and engagement.

---

## Key Features

### Single Target Color System
The entire correct path uses **ONE color**. This solves the original confusion where each path cell had a different color.

**How it works:**
- A random "path color" is selected (e.g., Green = 4)
- ALL path cells have math problems that equal 4
- Decoy cells have problems that equal OTHER numbers
- Kids simply look for: "Color all cells that equal 4 GREEN!"

### Corridor-Style Maze Generation
The new maze algorithm creates **long straight corridors** before turning, making the puzzle feel more like a real maze:
- Minimum corridor length of 2-4 cells before branching
- Path only goes right or down (clear rules for kids)
- Creates visual "corridors" that kids can follow

### A4 Print Support
Large format sizes optimized for A4 paper printing:
- **A4 Small**: 10×10 grid (16mm cells)
- **A4 Medium**: 12×12 grid (14mm cells)
- **A4 Large**: 15×15 grid (11mm cells)
- **A4 Extra Large**: 18×18 grid (9mm cells)

### Kid-Friendly UI

**Target Color Display**: Large, prominent box showing:
- The exact color to find
- The target number
- Simple instruction: "Color all cells that equal X"

**Progress Indicator**: Shows how many path cells found vs. total

---

## How to Play

1. **Look at the Target Color** - It shows which color and number to find
2. **Solve math problems** - If the answer equals the target number, it's on the path!
3. **Select the target color** from the palette
4. **Click path cells** to color them
5. **Find all path cells** from START to END to win!

**Tips:**
- ALL path cells have the SAME answer - the target number
- The path only goes right or down
- Decoy cells have different answers - don't be fooled!
- Watch the progress bar to track your progress

---

## Technical Implementation

### Files Structure
```
mathmaze/
├── index.html      # Main HTML structure
├── css/
│   └── styles.css  # All styling including A4 print
└── js/
    └── app.js      # Game logic and maze generation
```

### Key Functions

**`generateMaze()`** - Creates the puzzle:
1. Selects ONE target color for the entire path
2. Generates corridor-style path using `generateCorridorPath()`
3. Creates all path cell problems to equal target color
4. Fills decoys with NON-target color problems

**`generateCorridorPath(size)`** - Creates maze-like path:
- Enforces minimum corridor length before turning
- Creates longer straight sections
- Provides more maze-like feel

**`renderTargetColor()`** - Shows prominent target display

**`updateProgress()`** - Updates progress indicator

### Size Configuration
```javascript
const SIZE_CONFIG = {
    small:    { size: 5,  cellClass: 'small' },
    medium:   { size: 7,  cellClass: 'medium' },
    large:    { size: 9,  cellClass: 'large' },
    a4Small:  { size: 10, cellClass: 'a4-sm' },
    a4Medium: { size: 12, cellClass: 'a4-md' },
    a4Large:  { size: 15, cellClass: 'a4-lg' },
    a4XL:     { size: 18, cellClass: 'a4-xl' }
};
```

---

## Completed Improvements

- [x] **Single target color system** - All path cells equal ONE number
- [x] **Corridor-based maze generation** - Long straight sections
- [x] **A4 size options** - 10×10, 12×12, 15×15, 18×18 grids
- [x] **Prominent target display** - Shows kids exactly which color to find
- [x] **Progress indicator** - Shows path cells found vs. total
- [x] **Thicker walls** - Better visual maze boundaries
- [x] **A4 print optimization** - Proper sizing for paper printing
- [x] **Updated help instructions** - Explains new single-color system
- [x] **Responsive design** - Works on mobile devices

---

## Outstanding Work / Future Enhancements

### High Priority
- [ ] Add "Show Solution" button for teachers
- [ ] Create answer key page for printed worksheets
- [ ] Add maze title/name field for printed versions

### Medium Priority
- [ ] Multiple puzzles per A4 page option
- [ ] Landscape orientation for larger grids
- [ ] Custom color theme selector
- [ ] Difficulty auto-adjustment based on grade

### Low Priority
- [ ] Timed challenge mode
- [ ] Daily puzzle feature
- [ ] Achievement/badge system
- [ ] Save/load puzzle progress

### Future Considerations
- [ ] True maze generation (recursive backtracking, Prim's algorithm)
- [ ] Multi-directional paths (up, left, right, down)
- [ ] Branching paths with multiple solutions
- [ ] Animated path reveal on completion

---

## Design Rationale

### Why Single Target Color?

**Before (Confusing):**
```
Path: [2+1=3 Yellow] → [4+1=5 Blue] → [2+2=4 Green] → ...
Kids: "Which color is the path? They're all different!"
```

**After (Clear):**
```
Target: GREEN (=4)
Path: [2+2=4 Green] → [1+3=4 Green] → [8-4=4 Green] → ...
Kids: "I need to find all the 4s and color them green!"
```

### Why Corridor-Style?

Traditional maze feel with:
- Long straight sections build anticipation
- Fewer decision points reduce confusion
- Clear visual "corridors" guide the eye
- Dead-ends become more obvious

### Why A4 Sizes?

For classroom use:
- Teachers can print worksheets easily
- Standard paper size worldwide
- Multiple difficulty levels for different ages
- Cells sized appropriately for hand coloring

---

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Print functionality tested on Chrome and Firefox.

---

## Credits

Part of the MathBlocks educational puzzle suite.
