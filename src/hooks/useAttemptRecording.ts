import { useRef, useCallback } from 'react';
import type { Point } from '../data/characterTasks';

export type DrawingAttempt = {
    strokes: Point[][];
};

export function useAttemptRecording() {
    const attemptRef = useRef<DrawingAttempt>({ strokes: [] });

    const recordPoint = useCallback((x: number, y: number, timestamp: number) => {
        const strokes = attemptRef.current.strokes;
        if (strokes.length === 0) {
            // Start initial stroke if we somehow get here
            strokes.push([]);
        }
        const currentStroke = strokes[strokes.length - 1];

        // Avoid duplicating exactly identical points to save memory and recognition complexity
        if (currentStroke.length > 0) {
            const lastPoint = currentStroke[currentStroke.length - 1];
            const dist = Math.hypot(lastPoint.x - x, lastPoint.y - y);
            if (dist < 1.0) return; // ignore sub-pixel movements
        }

        currentStroke.push({ x, y, timestamp });
    }, []);

    const endCurrentStroke = useCallback(() => {
        const strokes = attemptRef.current.strokes;
        if (strokes.length > 0 && strokes[strokes.length - 1].length > 0) {
            strokes.push([]); // prepare next stroke
        }
    }, []);

    const clearAttempt = useCallback(() => {
        attemptRef.current = { strokes: [] };
    }, []);

    const getAttempt = useCallback((): DrawingAttempt => {
        // Filter out trailing empty strokes before returning
        const strokes = attemptRef.current.strokes.filter(s => s.length > 0);
        return { strokes: strokes.map(s => [...s]) }; // clone to avoid mutation
    }, []);

    return {
        attemptRef, // Exposed in case we need direct high-perf access
        recordPoint,
        endCurrentStroke,
        clearAttempt,
        getAttempt,
    };
}
