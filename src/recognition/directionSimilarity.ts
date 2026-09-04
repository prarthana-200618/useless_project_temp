import type { Point } from '../data/characterTasks';

/**
 * Calculates direction similarity using cosine similarity of trajectory vectors.
 * Returns [0, 1] score.
 */
export function calculateDirectionSimilarity(stroke1: Point[], stroke2: Point[]): number {
    if (stroke1.length < 2 || stroke2.length < 2 || stroke1.length !== stroke2.length) return 0;

    let totalCosineSimilarity = 0;

    for (let i = 1; i < stroke1.length; i++) {
        const v1x = stroke1[i].x - stroke1[i - 1].x;
        const v1y = stroke1[i].y - stroke1[i - 1].y;

        const v2x = stroke2[i].x - stroke2[i - 1].x;
        const v2y = stroke2[i].y - stroke2[i - 1].y;

        const mag1 = Math.hypot(v1x, v1y);
        const mag2 = Math.hypot(v2x, v2y);

        if (mag1 === 0 || mag2 === 0) {
            // If one point didn't move, it's not a useful vector. Neutral contribution.
            continue;
        }

        const dotProduct = (v1x * v2x) + (v1y * v2y);
        const cosine = dotProduct / (mag1 * mag2);

        // Convert cosine [-1, 1] to [0, 1] similarity
        const normalizedSimilarity = (cosine + 1) / 2;
        totalCosineSimilarity += normalizedSimilarity;
    }

    return totalCosineSimilarity / (stroke1.length - 1);
}
