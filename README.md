# MathBlocks - Fun Math Puzzles for Kids

**Interactive math puzzles that make learning feel like playing a game!**

A beautifully designed web application featuring 6 different puzzle types, progress tracking, achievements, and engaging animations. Built for kids ages 5-12 to practice math independently while having fun.

---

## Features

### 6 Puzzle Types

| Puzzle | Description | Best For |
|--------|-------------|----------|
| **Color by Number** | Solve problems, color the grid based on answers | All grades |
| **Mystery Picture** | Reveal hidden images by solving equations | Grades 2-6 |
| **Math Maze** | Navigate from start to finish by solving problems | Grades 1-5 |
| **Pattern Sequences** | Discover what comes next in number patterns | All grades |
| **Number Bonds** | Find missing numbers that add up to a total | Grades 1-3 |
| **Numberblocks** | Color stackable character blocks | Grades K-2 |

### Learning Features

- **7 Grade Levels** - From simple addition (Grade 1) to order of operations (Grade 7)
- **3 Difficulty Modes** - Practice, Mixed, and Challenge
- **Self-Verification** - Checksum totals let kids confirm their work
- **Instant Feedback** - Color-coded results show correct/incorrect answers

### Engagement Features

- **Progress Tracking** - Puzzles completed, stars earned, accuracy stats
- **8 Achievements** - Unlock badges for milestones
- **Sound Effects** - Satisfying audio feedback (can be muted)
- **Confetti Celebrations** - Reward successful puzzle completion
- **Responsive Design** - Works on desktop, tablet, and mobile

---

## Quick Start

### Run Locally

```bash
# Clone the repository
git clone https://github.com/NerdGGuy/numberActivities.git
cd numberActivities

# Open directly in browser — no build step required!
open index.html

# Or use a local server
npx serve .
# or
python -m http.server 8000
```

### Deploy

Works anywhere that can serve static files:

- **GitHub Pages** - Enable in repository settings
- **Netlify** - Drag and drop the folder
- **Vercel** - Connect the repository
- **Any web server** - Just copy the files

---

## Project Structure

```
numberActivities/
├── index.html          # Main application page
├── css/
│   └── styles.css      # Complete stylesheet with animations
├── js/
│   └── app.js          # Application logic and puzzle generators
├── assets/             # (Reserved for future assets)
└── README.md
```

---

## How It Works

### Answer Range: 1-8

All puzzle answers fall between **1-8**, matching standard crayon boxes. This keeps the color key simple and memorable.

### Grade-Appropriate Problems

| Grade | Operations | Example Problems |
|-------|------------|------------------|
| 1-2 | + and − | `2+3`, `7-4` |
| 3 | +, −, × | `4×2`, `15-9` |
| 4 | +, −, ×, ÷ | `24÷6`, `13-8` |
| 5 | Two-step | `(2×3)+1` |
| 6-7 | PEMDAS | `2+3×2` |

### Self-Checking

Every grid puzzle includes a verification checksum:
> "Add up all your answers. You should get: **48**"

Kids can confirm their work without adult help.

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires JavaScript enabled. Uses Web Audio API for sounds (graceful fallback if unavailable).

---

## Local Storage

Progress and achievements are saved to browser localStorage:
- `mathblocks_stats` - Puzzle completion statistics
- `mathblocks_achievements` - Unlocked achievement IDs

Clear browser data to reset progress.

---

## Print Support

Puzzles are designed for printing:
- Clean layout with no-print controls
- Color key included on printout
- Name/date field for paper worksheets
- Optimized for standard letter paper

---

## Technology Stack

| Library | Purpose |
|---------|---------|
| Vanilla JavaScript | Core logic |
| CSS3 | Styling and animations |
| Google Fonts (Nunito) | Typography |
| Canvas Confetti | Celebration effects |
| Web Audio API | Sound effects |

No build tools required. No dependencies to install.

---

## Contributing

Ideas welcome! Consider:
- New puzzle types
- Additional mystery picture templates
- Accessibility improvements
- Translations

---

## License

MIT License - Free for teachers, parents, schools, and anyone helping kids learn.

---

**Made with love for kids discovering that numbers are actually pretty cool!**
