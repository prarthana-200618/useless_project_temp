import type { Point } from '../data/characterTasks';

/**
 * Resamples a path (array of points) into exactly `numPoints` evenly spaced points
 */
export function resampleStroke(stroke: Point[], numPoints: number = 64): Point[] {
    if (stroke.length === 0) return [];
    if (stroke.length === 1) {
        return Array(numPoints).fill({ ...stroke[0] });
    }

    // Calculate total path length
    let totalLength = 0;
    for (let i = 1; i < stroke.length; i++) {
        const dx = stroke[i].x - stroke[i - 1].x;
        const dy = stroke[i].y - stroke[i - 1].y;
        totalLength += Math.hypot(dx, dy);
    }

    const interval = totalLength / (numPoints - 1);
    const resampled: Point[] = [{ ...stroke[0] }];

    let currentDist = 0;
    for (let i = 1; i < stroke.length; i++) {
        const prev = stroke[i - 1];
        const curr = stroke[i];
        const dx = curr.x - prev.x;
        const dy = curr.y - prev.y;
        const segmentLength = Math.hypot(dx, dy);

        while (currentDist + segmentLength >= interval * resampled.length && resampled.length < numPoints) {
            const remainingDist = interval * resampled.length - currentDist;
            const ratio = segmentLength > 0 ? remainingDist / segmentLength : 0;

            const newX = prev.x + ratio * dx;
            const newY = prev.y + ratio * dy;

            resampled.push({ x: newX, y: newY, timestamp: 0 }); // timestamp not strictly needed for resampled comparison
        }
        currentDist += segmentLength;
    }

    // Handle rounding issues (ensure exactly numPoints)
    while (resampled.length < numPoints) {
        resampled.push({ ...stroke[stroke.length - 1] });
    }

    return resampled;
}
