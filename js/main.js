// Main controller
document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const seedInput = document.getElementById('seed');
    const iterationsSlider = document.getElementById('iterations');
    const iterationsValue = document.getElementById('iterations-value');
    const generateBtn = document.getElementById('generate-btn');
    const runBtn = document.getElementById('run-btn');
    const stepBtn = document.getElementById('step-btn');

    const currentHeightEl = document.getElementById('current-height');
    const currentIterationEl = document.getElementById('current-iteration');
    const totalIterationsEl = document.getElementById('total-iterations');
    const currentPieceEl = document.getElementById('current-piece');

    const boardCanvas = document.getElementById('board-canvas');
    const chartCanvas = document.getElementById('chart-canvas');

    // Renderers
    const boardRenderer = new BoardRenderer(boardCanvas);
    const chartRenderer = new ChartRenderer(chartCanvas);

    // State
    let board = null;
    let originalBoard = null;
    let simulation = null;
    let stepGenerator = null;
    let isRunning = false;

    // Update iterations display
    iterationsSlider.addEventListener('input', () => {
        iterationsValue.textContent = iterationsSlider.value;
    });

    // Generate board
    function generateBoard() {
        const seed = parseInt(seedInput.value) || 12345;
        board = Board.generate(seed);
        originalBoard = board.clone();

        // Create simulation with seed offset for different random ordering
        simulation = new ShapleySimulation(originalBoard, seed + 1000);
        stepGenerator = null;

        updateDisplay();
        renderBoard(board);
        renderChart(new Map());
    }

    // Render board
    function renderBoard(b) {
        boardRenderer.render(b);
    }

    // Render chart
    function renderChart(contributions) {
        chartRenderer.render(originalBoard, contributions);
    }

    // Update info display
    function updateDisplay(stepData = null) {
        if (stepData) {
            currentHeightEl.textContent = stepData.heightAfter !== undefined ? stepData.heightAfter : stepData.height;
            currentIterationEl.textContent = stepData.iteration;
            currentPieceEl.textContent = stepData.pieceId !== undefined ? `#${stepData.pieceId}` : '-';
        } else if (board) {
            currentHeightEl.textContent = board.getHeight();
            currentIterationEl.textContent = simulation ? simulation.getTotalIterations() : 0;
            currentPieceEl.textContent = '-';
        }
        totalIterationsEl.textContent = iterationsSlider.value;
    }

    // Step through simulation
    function step() {
        if (!simulation) return;

        if (!stepGenerator) {
            stepGenerator = simulation.runIteration();
        }

        const result = stepGenerator.next();

        if (result.done) {
            stepGenerator = null;
            boardRenderer.setHighlightedPiece(null);
            renderBoard(originalBoard);
            renderChart(simulation.getAverageContributions());
            updateDisplay({ iteration: simulation.getTotalIterations(), height: originalBoard.getHeight() });
            return;
        }

        const data = result.value;

        if (data.type === 'start') {
            board = data.board;
            renderBoard(board);
            updateDisplay(data);
        } else if (data.type === 'step') {
            board = data.board;
            boardRenderer.setHighlightedPiece(null);
            renderBoard(board);
            renderChart(data.currentContributions);
            updateDisplay(data);
        } else if (data.type === 'end') {
            renderChart(data.contributions);
        }
    }

    // Run simulation
    async function runSimulation() {
        if (!simulation || isRunning) return;

        isRunning = true;
        runBtn.textContent = 'Running...';
        runBtn.disabled = true;
        stepBtn.disabled = true;
        generateBtn.disabled = true;

        const targetIterations = parseInt(iterationsSlider.value);
        const currentIterations = simulation.getTotalIterations();
        const remaining = targetIterations - currentIterations;

        if (remaining <= 0) {
            simulation.reset();
        }

        const iterationsToRun = remaining > 0 ? remaining : targetIterations;

        // Run in batches to keep UI responsive
        const batchSize = 10;
        let completed = 0;

        while (completed < iterationsToRun) {
            const batch = Math.min(batchSize, iterationsToRun - completed);
            simulation.runIterations(batch);
            completed += batch;

            // Update display
            currentIterationEl.textContent = simulation.getTotalIterations();
            renderChart(simulation.getAverageContributions());

            // Yield to browser
            await new Promise(resolve => setTimeout(resolve, 0));
        }

        isRunning = false;
        runBtn.textContent = 'Run Simulation';
        runBtn.disabled = false;
        stepBtn.disabled = false;
        generateBtn.disabled = false;

        updateDisplay({ iteration: simulation.getTotalIterations(), height: originalBoard.getHeight() });
    }

    // Event listeners
    generateBtn.addEventListener('click', generateBoard);
    runBtn.addEventListener('click', runSimulation);
    stepBtn.addEventListener('click', step);

    // Initial generation
    generateBoard();
});
