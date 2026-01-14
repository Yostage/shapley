class BoardRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 30;
        this.highlightedPiece = null;
    }

    render(board) {
        const ctx = this.ctx;
        const cellSize = this.cellSize;

        // Clear canvas
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        ctx.strokeStyle = '#2a2a4a';
        ctx.lineWidth = 1;
        for (let x = 0; x <= board.width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, board.height * cellSize);
            ctx.stroke();
        }
        for (let y = 0; y <= board.height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(board.width * cellSize, y * cellSize);
            ctx.stroke();
        }

        // Draw cells (y=0 is bottom, so we flip for display)
        for (let y = 0; y < board.height; y++) {
            for (let x = 0; x < board.width; x++) {
                const cell = board.grid[y][x];
                if (cell) {
                    const displayY = (board.height - 1 - y) * cellSize;
                    const displayX = x * cellSize;

                    // Fill with piece color
                    ctx.fillStyle = cell.color;
                    ctx.fillRect(displayX + 1, displayY + 1, cellSize - 2, cellSize - 2);

                    // Highlight if this is the highlighted piece
                    if (cell.pieceId === this.highlightedPiece) {
                        ctx.strokeStyle = '#fff';
                        ctx.lineWidth = 3;
                        ctx.strokeRect(displayX + 2, displayY + 2, cellSize - 4, cellSize - 4);
                    }

                    // Add a subtle 3D effect
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(displayX + 1, displayY + 1, cellSize - 2, 3);
                    ctx.fillRect(displayX + 1, displayY + 1, 3, cellSize - 2);

                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(displayX + 1, displayY + cellSize - 4, cellSize - 2, 3);
                    ctx.fillRect(displayX + cellSize - 4, displayY + 1, 3, cellSize - 2);
                }
            }
        }

        // Draw height indicator
        const height = board.getHeight();
        if (height > 0) {
            const indicatorY = (board.height - height) * cellSize;
            ctx.strokeStyle = '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(0, indicatorY);
            ctx.lineTo(board.width * cellSize, indicatorY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Height label
            ctx.fillStyle = '#ff6b6b';
            ctx.font = '12px sans-serif';
            ctx.fillText(`h=${height}`, board.width * cellSize + 5, indicatorY + 4);
        }
    }

    setHighlightedPiece(pieceId) {
        this.highlightedPiece = pieceId;
    }
}

class ChartRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    render(board, contributions) {
        const ctx = this.ctx;
        const padding = { top: 30, right: 80, bottom: 20, left: 60 };

        // Clear
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const pieceIds = board.getPieceIds();
        if (pieceIds.length === 0) return;

        // Get max contribution for scaling
        let maxContrib = 0;
        for (const id of pieceIds) {
            const contrib = contributions.get(id) || 0;
            maxContrib = Math.max(maxContrib, Math.abs(contrib));
        }
        maxContrib = Math.max(maxContrib, 1); // Avoid division by zero

        const chartWidth = this.canvas.width - padding.left - padding.right;
        const chartHeight = this.canvas.height - padding.top - padding.bottom;
        const barHeight = Math.min(20, chartHeight / pieceIds.length - 2);
        const barSpacing = chartHeight / pieceIds.length;

        // Draw axis
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, this.canvas.height - padding.bottom);
        ctx.stroke();

        // Sort pieces by contribution for better visualization
        const sortedPieces = [...pieceIds].sort((a, b) => {
            return (contributions.get(b) || 0) - (contributions.get(a) || 0);
        });

        // Draw bars
        for (let i = 0; i < sortedPieces.length; i++) {
            const pieceId = sortedPieces[i];
            const piece = board.getPiece(pieceId);
            const contrib = contributions.get(pieceId) || 0;

            const y = padding.top + i * barSpacing + (barSpacing - barHeight) / 2;
            const barWidth = (contrib / maxContrib) * chartWidth;

            // Draw bar
            ctx.fillStyle = piece ? piece.color : '#888';
            ctx.fillRect(padding.left, y, Math.max(barWidth, 2), barHeight);

            // Draw piece ID label
            ctx.fillStyle = '#aaa';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`#${pieceId}`, padding.left - 5, y + barHeight / 2 + 4);

            // Draw value label
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'left';
            ctx.fillText(contrib.toFixed(2), padding.left + barWidth + 5, y + barHeight / 2 + 4);
        }

        // Title
        ctx.fillStyle = '#aaa';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Average contribution to height', this.canvas.width / 2, 15);
    }
}

window.BoardRenderer = BoardRenderer;
window.ChartRenderer = ChartRenderer;
