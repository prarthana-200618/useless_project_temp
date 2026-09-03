// Coordinate mapping: normalized MediaPipe coords → canvas pixels
export interface NormalizedPoint {
    x: number; // 0..1
    y: number; // 0..1
}

export interface CanvasPoint {
    x: number;
    y: number;
}

/**
 * Convert a normalized MediaPipe landmark to canvas pixel coords.
 * The webcam is displayed mirrored (scaleX(-1)), so we need to flip X.
 *
 * MediaPipe returns raw camera coords (unmirrored).
 * To match what the user sees on screen, we mirror X.
 */
export function toCanvasCoords(
    normalized: NormalizedPoint,
    canvasWidth: number,
    canvasHeight: number,
    mirrored = true
): CanvasPoint {
    const x = mirrored
        ? (1 - normalized.x) * canvasWidth
        : normalized.x * canvasWidth;
    const y = normalized.y * canvasHeight;
    return { x, y };
}

/**
 * Scale canvas coordinates from video resolution to canvas display size.
 */
export function scaleCoords(
    point: CanvasPoint,
    fromWidth: number,
    fromHeight: number,
    toWidth: number,
    toHeight: number
): CanvasPoint {
    return {
        x: (point.x / fromWidth) * toWidth,
        y: (point.y / fromHeight) * toHeight,
    };
}
