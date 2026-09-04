import type { Point } from '../data/characterTasks';

/**
 * Calculates a similarity score [0, 1] between two normalized, equally-resampled strokes
 * Returns 1 if identical, closer to 0 if very different.
 */
export function calculatePathSimilarity(stroke1: Point[], stroke2: Point[]): number {
    if (stroke1.length !== stroke2.length || stroke1.length === 0) return 0;

    let totalDistance = 0;
    for (let i = 0; i < stroke1.length; i++) {
        const pt1 = stroke1[i];
        const pt2 = stroke2[i];
        totalDistance += Math.hypot(pt1.x - pt2.x, pt1.y - pt2.y);
    }

    const avgDistance = totalDistance / stroke1.length;

    // Transform distance to similarity score
    // Assuming space is normalized [0,1], max possible distance across box is ~1.41
    // A distance of 0 -> 1.0 similarity.
    // A distance of 0.2 -> e.g. 0.6 similarity.
    return Math.max(0, 1 - (avgDistance * 3)); // tunable constant
}
