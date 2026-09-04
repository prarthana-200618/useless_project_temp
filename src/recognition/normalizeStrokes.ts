import type { Point } from '../data/characterTasks';

/**
 * Normalizes strokes to a [0, 1] coordinate system
 * Preserves the aspect ratio so the character doesn't stretch weirdly
 */
export function normalizeStrokes(strokes: Point[][]): Point[][] {
    const allPoints = strokes.flat();
    if (allPoints.length === 0) return [];

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const pt of allPoints) {
        if (pt.x < minX) minX = pt.x;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.y > maxY) maxY = pt.y;
    }

    const width = Math.max(maxX - minX, 0.001);
    const height = Math.max(maxY - minY, 0.001);
    const size = Math.max(width, height); // Preserve aspect ratio

    // Center horizontally and vertically within the [0, 1] normalized box
    const offsetX = (size - width) / 2;
    const offsetY = (size - height) / 2;

    return strokes.map(stroke =>
        stroke.map(pt => ({
            x: (pt.x - minX + offsetX) / size,
            y: (pt.y - minY + offsetY) / size,
            timestamp: pt.timestamp,
        }))
    );
}
