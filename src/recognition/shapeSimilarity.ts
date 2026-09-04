import type { Point } from '../data/characterTasks';

/**
 * Calculates a high-level shape similarity covering proportion and spatial footprint matching.
 * Compares aspect ratios and relative lengths.
 * Expects RAW un-normalized strokes (or normalized, doesn't matter, it calculates bounds itself).
 */
export function calculateShapeSimilarity(strokes1: Point[][], strokes2: Point[][]): number {
    const getBounds = (strokes: Point[][]) => {
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let totalLength = 0;

        for (const stroke of strokes) {
            if (stroke.length === 0) continue;

            let strokeLength = 0;
            for (let i = 0; i < stroke.length; i++) {
                const pt = stroke[i];
                if (pt.x < minX) minX = pt.x;
                if (pt.x > maxX) maxX = pt.x;
                if (pt.y < minY) minY = pt.y;
                if (pt.y > maxY) maxY = pt.y;

                if (i > 0) {
                    strokeLength += Math.hypot(pt.x - stroke[i - 1].x, pt.y - stroke[i - 1].y);
                }
            }
            totalLength += strokeLength;
        }

        const width = Math.max(maxX - minX, 0.001);
        const height = Math.max(maxY - minY, 0.001);
        return { width, height, aspectRatio: width / height, totalLength };
    };

    const bounds1 = getBounds(strokes1);
    const bounds2 = getBounds(strokes2);

    // Aspect ratio similarity
    const ratioRatio = Math.min(bounds1.aspectRatio, bounds2.aspectRatio) / Math.max(bounds1.aspectRatio, bounds2.aspectRatio);

    return ratioRatio;
}
