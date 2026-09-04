import type { Point, StrokeTemplate } from '../data/characterTasks';
import { normalizeStrokes } from './normalizeStrokes';
import { resampleStroke } from './resampleStroke';
import { calculatePathSimilarity } from './pathSimilarity';
import { calculateDirectionSimilarity } from './directionSimilarity';
import { calculateShapeSimilarity } from './shapeSimilarity';

export const CHARACTER_MATCH_THRESHOLD = 0.70;
export const MIN_POINTS_FOR_RECOGNITION = 25;
export const MIN_STROKE_LENGTH = 50;

export type RecognitionResult = {
    matched: boolean;
    score: number;
    character: string;
};

// Weights for scoring algorithms
const WEIGHT_PATH = 0.60;
const WEIGHT_DIR = 0.25;
const WEIGHT_SHAPE = 0.15;
const RESAMPLE_POINTS = 64;

export function recognizeCharacter(
    userStrokes: Point[][],
    template: StrokeTemplate,
    characterName: string
): RecognitionResult {
    // Reject if barely anything drawn
    const flatPoints = userStrokes.flat();
    if (flatPoints.length < MIN_POINTS_FOR_RECOGNITION) {
        return { matched: false, score: 0, character: characterName };
    }

    // Calculate length to reject tiny scribbles
    let totalLength = 0;
    for (const stroke of userStrokes) {
        for (let i = 1; i < stroke.length; i++) {
            totalLength += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
        }
    }
    if (totalLength < MIN_STROKE_LENGTH) {
        return { matched: false, score: 0, character: characterName };
    }

    // 1. Normalize
    const normUser = normalizeStrokes(userStrokes);
    const normTemplate = normalizeStrokes(template.strokes);

    // Shape similarity (deals with structural bounds and aspect ratios)
    const shapeSim = calculateShapeSimilarity(normUser, normTemplate);

    // We map multi-stroke by just sequentially comparing them, 
    // or flattening them out just for spatial alignment checks.
    // Real character recognition would do Dynamic Time Warping (DTW) on strokes.
    // Here we simplify by resampling each stroke appropriately and averaging their scores.

    let totalPathSim = 0;
    let totalDirSim = 0;

    // If stroke counts differ, we flatten the remaining into 1 standard comparison.
    // To handle users who pause randomly vs template strokes.
    const flatUser = normUser.flat();
    const flatTemp = normTemplate.flat();

    const resampledUser = resampleStroke(flatUser, RESAMPLE_POINTS);
    const resampledTemp = resampleStroke(flatTemp, RESAMPLE_POINTS);

    totalPathSim = calculatePathSimilarity(resampledUser, resampledTemp);
    totalDirSim = calculateDirectionSimilarity(resampledUser, resampledTemp);

    const finalScore =
        (totalPathSim * WEIGHT_PATH) +
        (totalDirSim * WEIGHT_DIR) +
        (shapeSim * WEIGHT_SHAPE);

    return {
        matched: finalScore >= CHARACTER_MATCH_THRESHOLD,
        score: finalScore,
        character: characterName,
    };
}
