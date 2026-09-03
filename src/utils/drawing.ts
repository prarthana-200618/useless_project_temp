export interface DrawPoint {
    x: number;
    y: number;
}

export interface StrokeStyle {
    color: string;
    width: number;
}

// Begin a new stroke path
export function beginStroke(
    ctx: CanvasRenderingContext2D,
    point: DrawPoint,
    style: StrokeStyle
) {
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
}

// Continue drawing the stroke using quadratic bezier interpolation
export function continueStroke(
    ctx: CanvasRenderingContext2D,
    prevPoint: DrawPoint,
    currentPoint: DrawPoint,
    style: StrokeStyle
) {
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const midX = (prevPoint.x + currentPoint.x) / 2;
    const midY = (prevPoint.y + currentPoint.y) / 2;

    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, currentPoint.x, currentPoint.y);
    ctx.stroke();
}

// Draw a single dot (for stroke start)
export function drawDot(
    ctx: CanvasRenderingContext2D,
    point: DrawPoint,
    style: StrokeStyle
) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, style.width / 2, 0, Math.PI * 2);
    ctx.fillStyle = style.color;
    ctx.fill();
}

// Clear the full canvas
export function clearCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}
