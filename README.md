# MathBlocks Coloring Puzzles

**A fun, interactive web app that generates printable math coloring pages featuring adorable number block characters!**

Kids learn addition, subtraction, multiplication, and division by solving math problems and coloring in the correct number of blocks. Each puzzle transforms into a beautiful coloring page that reinforces mathematical concepts through hands-on creativity.

---

## ✨ Features

- **Four Operations**: Addition, subtraction, multiplication, and division puzzles
- **Grade Levels 1-7**: Progressive difficulty scaling from simple single-digit problems to complex multi-step equations
- **Numberblocks-Style Characters**: Cute, stackable block characters with friendly faces—just like the beloved TV show
- **Print-Ready Output**: Optimized layouts for A4/Letter paper with clean black-and-white outlines
- **Color-by-Answer Mechanics**: Each answer corresponds to a specific color, creating beautiful patterns when completed
- **Instant Generation**: Create unlimited unique puzzles with one click
- **No Server Required**: Runs entirely in the browser—perfect for GitHub Pages

---

## 🎯 How It Works

1. **Select a grade level** (1-7) to set the difficulty
2. **Choose an operation** (or mix them together)
3. **Generate a puzzle** with randomized problems
4. **Print the page** for your child to solve
5. **Kids solve each problem** and color the corresponding blocks using the color key
6. **Reveal the hidden picture** when all blocks are colored correctly!

---

## 📚 Grade Level Guide

| Grade | Operations | Number Range | Concepts |
|-------|-----------|--------------|----------|
| 1 | Addition, Subtraction | 1-10 | Single digits, counting |
| 2 | Addition, Subtraction | 1-20 | Two digits, no regrouping |
| 3 | Addition, Subtraction, Multiplication | 1-50 | Times tables (1-5) |
| 4 | All four operations | 1-100 | Times tables (1-10), simple division |
| 5 | All four operations | 1-500 | Multi-digit, remainders |
| 6 | All four operations | 1-1000 | Long division, order of operations |
| 7 | All four operations | 1-10000 | Complex expressions, PEMDAS |

---

## 🛠️ Technology Stack

### Client-Side Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| **[html2canvas](https://html2canvas.hertzen.com/)** | 1.4.1 | Captures puzzle grids as images for PDF export |
| **[jsPDF](https://github.com/parallax/jsPDF)** | 2.5.1 | Generates downloadable, print-ready PDF files |
| **[Tailwind CSS](https://tailwindcss.com/)** | 3.4 (CDN) | Responsive UI styling with utility classes |
| **[Canvas Confetti](https://github.com/catdad/canvas-confetti)** | 1.9.2 | Celebratory effects for completed puzzles |
| **Vanilla JavaScript** | ES6+ | Core application logic—no framework dependencies |

### Why These Libraries?

- **No build step required**: All libraries load via CDN, making GitHub Pages deployment trivial
- **Offline-capable**: Once loaded, puzzles generate entirely client-side
- **Lightweight**: Total bundle under 200KB for fast loading on school networks
- **Print-optimized**: jsPDF produces crisp vector graphics that scale perfectly

---

## 🚀 Getting Started

### View Live Demo

👉 **[https://yourusername.github.io/mathblocks-coloring](https://yourusername.github.io/mathblocks-coloring)**

### Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/mathblocks-coloring.git

# Navigate to the project folder
cd mathblocks-coloring

# Open in your browser (no server needed!)
open index.html

# Or use a simple local server for best results
npx serve .
```

### Deploy to GitHub Pages

1. Fork this repository
2. Go to **Settings** → **Pages**
3. Set source to **Deploy from a branch**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**—your site will be live in minutes!

---

## 📁 Project Structure

```
mathblocks-coloring/
├── index.html              # Main application entry point
├── css/
│   └── styles.css          # Custom styles + print media queries
├── js/
│   ├── app.js              # Main application controller
│   ├── puzzle-generator.js # Math problem generation engine
│   ├── block-renderer.js   # Numberblocks character drawing
│   ├── grid-builder.js     # Puzzle grid layout system
│   └── pdf-export.js       # Print/PDF functionality
├── assets/
│   ├── fonts/              # Kid-friendly fonts
│   └── images/             # Block face expressions, icons
├── puzzles/
│   └── templates.json      # Pre-designed puzzle templates
├── README.md
└── LICENSE
```

---

## 🎨 The Numberblocks Style

Each number is represented as a stack of cute cubic blocks with:

- **Expressive faces** on the top block (happy, excited, thoughtful)
- **Distinct colors** for each digit (1=red, 2=orange, 3=yellow, 4=green, 5=blue, etc.)
- **Outlined format** for coloring—bold black lines with white fill
- **Stackable design** that visually represents quantity

```
    ┌───┐
    │ 😊│  ← Face on top block
    ├───┤
    │   │  ← Number 3 = 3 blocks stacked
    ├───┤
    │   │
    └───┘
```

---

## 🖨️ Printing Tips

- **Use "Fit to Page"** in your print dialog for best results
- **Select "Black & White"** to save ink (puzzles are designed for B&W)
- **Card stock paper** works great for durability
- **Crayons or colored pencils** recommended over markers (prevents bleed-through)

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report bugs** via [GitHub Issues](https://github.com/yourusername/mathblocks-coloring/issues)
2. **Suggest features** for new puzzle types or difficulty modes
3. **Submit PRs** for code improvements or new block character designs
4. **Share** with teachers and parents who might find this useful!

### Development Setup

```bash
# Install dev dependencies (optional, for linting)
npm install

# Run linter
npm run lint

# Build production version (optional)
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License**—see the [LICENSE](LICENSE) file for details.

**Note**: This project is inspired by but not affiliated with the "Numberblocks" TV series. Numberblocks is a trademark of Blue Zoo Animation Studio and BBC.

---

## 🙏 Acknowledgments

- Inspired by the wonderful [Numberblocks](https://www.bbc.co.uk/cbeebies/shows/numberblocks) educational series
- Built with love for teachers, parents, and curious young mathematicians everywhere
- Special thanks to the open-source community for the amazing libraries that make this possible

---

**Made with ❤️ and 🧮 for kids who love numbers!**
