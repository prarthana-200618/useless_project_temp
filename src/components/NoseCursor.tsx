import React from 'react';

type AppState = 'idle' | 'drawing' | 'paused' | 'error' | 'no_face';

interface NoseCursorProps {
    x: number;
    y: number;
    state: AppState;
    visible: boolean;
}

export function NoseCursor({ x, y, state, visible }: NoseCursorProps) {
    if (!visible) return null;

    const cursorClass =
        state === 'drawing'
            ? 'nose-cursor-drawing'
            : state === 'paused'
                ? 'nose-cursor-paused'
                : 'nose-cursor-idle';

    return (
        <>
            {/* Main cursor ring */}
            <div
                className={cursorClass}
                style={{ left: x, top: y }}
            />
            {/* Nose emoji indicator */}
            <div
                style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                    fontSize: 14,
                    lineHeight: 1,
                    pointerEvents: 'none',
                    zIndex: 51,
                    userSelect: 'none',
                    filter: state === 'paused' ? 'grayscale(0.5) opacity(0.6)' : 'none',
                }}
            >
                👃
            </div>
        </>
    );
}
