# Shapley Value Tetris Visualization - Implementation Plan

## Overview
Create a JavaScript visualization demonstrating Shapley value estimation via Monte Carlo simulation, using a Tetris board as the visual metaphor.

## Key Concepts
- **Shapley Values**: Measure each piece's average marginal contribution to the total board height
- **Monte Carlo Simulation**: Randomly order pieces, remove them sequentially, attribute height changes to each piece
- **Visualization**: Show simulation on left, cumulative blame/contribution on right

## Project Structure
```
shapley-viz/
├── index.html          # Main HTML file
├── styles.css          # Styling for the visualization
├── js/
│   ├── main.js         # Entry point, UI controls
│   ├── board.js        # Tetris board generation and manipulation
│   ├── simulation.js   # Monte Carlo Shapley value simulation
│   └── render.js       # Canvas/DOM rendering logic
└── plan.md             # Original requirements
```

## Implementation Steps

### Step 1: Create HTML Structure
- Split layout: simulation view (LHS) and contribution chart (RHS)
- Controls: random seed input, "Run Simulation" button, iteration count
- Canvas or div-based grid for Tetris board

### Step 2: Board Generation (`board.js`)
- Create a 10-wide × 20-tall grid (standard Tetris dimensions)
- Represent pieces as colored connected cells with unique piece IDs
- Generate a mostly-filled board (70-80% filled) using:
  - Standard Tetris piece shapes (I, O, T, S, Z, J, L)
  - Place pieces bottom-up to simulate a realistic game state
- Each cell stores: `{ pieceId, color }` or `null` if empty
- `removePiece(pieceId)`: Remove all cells of a piece
- `applyGravity()`: Drop each piece until it rests on bottom/other pieces
- `getHeight()`: Return index of highest occupied row

### Step 3: Height Calculation & Gravity
- Board "height" = highest row with any filled cell
- When a piece is removed:
  1. Remove all cells belonging to that piece
  2. Apply gravity: each remaining piece falls until it rests on the bottom or another piece
  3. Recalculate height
- The height difference (before removal - after settling) is attributed to that piece
- Note: Pieces fall as units (all cells of a piece move together)

### Step 4: Shapley Simulation (`simulation.js`)
```javascript
function runShapleySimulation(board, numIterations) {
  // For each iteration:
  //   1. Get random permutation of piece IDs
  //   2. Start with full board, track initial height
  //   3. Remove pieces in order, tracking height after each removal
  //   4. Marginal contribution = height_before - height_after
  //   5. Accumulate contributions per piece
  // Return average contribution per piece
}
```
- Use seeded PRNG (e.g., mulberry32) for reproducibility
- Track running averages as iterations progress

### Step 5: Rendering (`render.js`)
**Left Panel - Simulation View:**
- Draw the Tetris grid with colored pieces
- Animate piece removal during simulation (optional: step-by-step mode)
- Highlight current piece being evaluated

**Right Panel - Contribution Chart:**
- Bar chart showing accumulated Shapley values per piece
- Color-code bars to match piece colors
- Update in real-time as simulation runs

### Step 6: Main Controller (`main.js`)
- Parse seed from input (or generate random)
- Initialize board from seed
- Run simulation with configurable iteration count
- Coordinate rendering updates

## Visual Design
- Grid: 10×20, each cell ~20-30px
- Colors: Standard Tetris colors (cyan, yellow, purple, green, red, blue, orange)
- LHS: ~300px wide for board + padding
- RHS: ~400px wide for horizontal bar chart
- Controls: Top bar with seed input, iteration slider, run button

## Seeded Randomness
```javascript
// Mulberry32 PRNG
function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
```
- Same seed → same board → same simulation order (if iterations match)

## Verification
1. Open `index.html` in a browser
2. Enter a seed value and click "Run Simulation"
3. Verify the same seed produces identical results
4. Confirm pieces are visually removed and blamed correctly
5. Check that the contribution chart updates as simulation progresses
6. Test with different iteration counts (10, 100, 1000) to see values converge

## Files to Create
1. `index.html` - HTML structure with LHS/RHS layout
2. `styles.css` - Grid styling, bar chart styling, controls
3. `js/board.js` - Board class, piece generation, height calculation
4. `js/simulation.js` - Monte Carlo Shapley logic
5. `js/render.js` - Canvas/DOM rendering
6. `js/main.js` - UI controls, orchestration
