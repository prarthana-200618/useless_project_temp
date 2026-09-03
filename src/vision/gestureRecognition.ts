import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export type GestureType = 'index_up' | 'open_palm' | 'fist' | 'none';

// Landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_MCP = 5;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;
const MIDDLE_TIP = 12;
const RING_MCP = 13;
const RING_TIP = 16;
const PINKY_MCP = 17;
const PINKY_TIP = 20;

function isExtended(tip: NormalizedLandmark, mcp: NormalizedLandmark): boolean {
    // Finger is extended if tip is above (lower y) mcp
    return tip.y < mcp.y - 0.04;
}

function isCurled(tip: NormalizedLandmark, mcp: NormalizedLandmark): boolean {
    return tip.y > mcp.y - 0.01;
}

export function classifyGesture(landmarks: NormalizedLandmark[]): GestureType {
    if (!landmarks || landmarks.length < 21) return 'none';

    const wrist = landmarks[WRIST];
    const thumbTip = landmarks[THUMB_TIP];
    const indexMcp = landmarks[INDEX_MCP];
    const indexPip = landmarks[INDEX_PIP];
    const indexTip = landmarks[INDEX_TIP];
    const middleMcp = landmarks[MIDDLE_MCP];
    const middleTip = landmarks[MIDDLE_TIP];
    const ringMcp = landmarks[RING_MCP];
    const ringTip = landmarks[RING_TIP];
    const pinkyMcp = landmarks[PINKY_MCP];
    const pinkyTip = landmarks[PINKY_TIP];

    const indexUp = isExtended(indexTip, indexMcp);
    const middleUp = isExtended(middleTip, middleMcp);
    const ringUp = isExtended(ringTip, ringMcp);
    const pinkyUp = isExtended(pinkyTip, pinkyMcp);

    const indexCurled = isCurled(indexTip, indexMcp);
    const middleCurled = isCurled(middleTip, middleMcp);
    const ringCurled = isCurled(ringTip, ringMcp);
    const pinkyCurled = isCurled(pinkyTip, pinkyMcp);

    // Open palm: all 4 fingers extended, hand roughly flat
    if (indexUp && middleUp && ringUp && pinkyUp) {
        // Check thumb is also roughly out (spread palm)
        const thumbOut = Math.abs(thumbTip.x - wrist.x) > 0.05;
        if (thumbOut || middleUp) return 'open_palm';
    }

    // Index finger up: only index extended, others curled
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
        // Extra check: index tip is clearly above PIP
        if (indexTip.y < indexPip.y - 0.01) {
            return 'index_up';
        }
    }

    // Fist: all fingers curled
    if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
        return 'fist';
    }

    return 'none';
}

// Debounce gesture over N frames for stability
export function createGestureDebouncer(requiredFrames = 6) {
    let currentGesture: GestureType = 'none';
    let count = 0;
    let pending: GestureType = 'none';

    return function debounce(raw: GestureType): GestureType {
        if (raw === pending) {
            count++;
        } else {
            pending = raw;
            count = 1;
        }

        if (count >= requiredFrames) {
            currentGesture = pending;
        }

        return currentGesture;
    };
}
