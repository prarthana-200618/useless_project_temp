import type { Point, StrokeTemplate } from '../data/characterTasks';

// Simplified synthetic templates mapped into [0, 1] normalized space. 
// These can be tuned during dev to match actual user nose patterns.

// ക്ഷ (Ksha) - Roughly looks like a backwards S that loops into a round bottom and a top loop.
export const KSHA_TEMPLATE: StrokeTemplate = {
    strokes: [
        [
            { x: 0.8, y: 0.2, timestamp: 0 },
            { x: 0.6, y: 0.1, timestamp: 0 },
            { x: 0.4, y: 0.1, timestamp: 0 },
            { x: 0.2, y: 0.3, timestamp: 0 },
            { x: 0.2, y: 0.6, timestamp: 0 },
            { x: 0.4, y: 0.8, timestamp: 0 },
            { x: 0.6, y: 0.9, timestamp: 0 },
            { x: 0.8, y: 0.7, timestamp: 0 },
            { x: 0.7, y: 0.4, timestamp: 0 },
            { x: 0.4, y: 0.4, timestamp: 0 },
            { x: 0.2, y: 0.4, timestamp: 0 },
            { x: 0.1, y: 0.6, timestamp: 0 },
            { x: 0.3, y: 0.9, timestamp: 0 },
            { x: 0.6, y: 0.9, timestamp: 0 },
            { x: 0.8, y: 0.6, timestamp: 0 },
            { x: 0.6, y: 0.2, timestamp: 0 },
            { x: 0.9, y: 0.2, timestamp: 0 }
        ]
    ]
};

// ഞ്ഞ (Njna) - Similar to ഞ but with a connected sub-stroke / loop.
export const NJNA_TEMPLATE: StrokeTemplate = {
    strokes: [
        [
            { x: 0.2, y: 0.2, timestamp: 0 },
            { x: 0.1, y: 0.4, timestamp: 0 },
            { x: 0.2, y: 0.6, timestamp: 0 },
            { x: 0.4, y: 0.7, timestamp: 0 },
            { x: 0.6, y: 0.5, timestamp: 0 },
            { x: 0.6, y: 0.3, timestamp: 0 },
            { x: 0.4, y: 0.1, timestamp: 0 },
            { x: 0.2, y: 0.1, timestamp: 0 }
        ],
        [
            { x: 0.6, y: 0.5, timestamp: 0 },
            { x: 0.8, y: 0.6, timestamp: 0 },
            { x: 0.9, y: 0.8, timestamp: 0 },
            { x: 0.7, y: 1.0, timestamp: 0 },
            { x: 0.4, y: 0.9, timestamp: 0 }
        ]
    ]
};
