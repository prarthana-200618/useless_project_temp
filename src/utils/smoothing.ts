// Exponential smoothing for nose coordinates
export interface Smoother {
    smooth: (x: number, y: number) => { x: number; y: number };
    reset: () => void;
}

export function createSmoother(factor = 0.6): Smoother {
    let prevX: number | null = null;
    let prevY: number | null = null;

    return {
        smooth(x: number, y: number) {
            if (prevX === null || prevY === null) {
                prevX = x;
                prevY = y;
                return { x, y };
            }
            const smoothedX = prevX * factor + x * (1 - factor);
            const smoothedY = prevY * factor + y * (1 - factor);
            prevX = smoothedX;
            prevY = smoothedY;
            return { x: smoothedX, y: smoothedY };
        },
        reset() {
            prevX = null;
            prevY = null;
        },
    };
}
