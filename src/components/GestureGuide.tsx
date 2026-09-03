import React, { useEffect, useState } from 'react';

type GestureType = 'index_up' | 'open_palm' | 'fist' | 'none';

interface GestureGuideProps {
    gesture: GestureType;
    fistCountdown: number | null; // seconds remaining, null if not counting
    onClearConfirmed: () => void;
    onClearCancelled: () => void;
}

const GESTURE_LABELS: Record<GestureType, string | null> = {
    index_up: '☝️ Index Up — Start Drawing',
    open_palm: '🖐️ Open Palm — Pause',
    fist: '✊ Fist — Clearing...',
    none: null,
};

export function GestureGuide({ gesture, fistCountdown, onClearConfirmed, onClearCancelled }: GestureGuideProps) {
    const label = GESTURE_LABELS[gesture];

    return (
        <>
            {/* Gesture hint */}
            {label && gesture !== 'fist' && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 100,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '8px 18px',
                        background: 'rgba(139,92,246,0.15)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        borderRadius: 999,
                        color: '#c4b5fd',
                        fontSize: 13,
                        fontWeight: 600,
                        backdropFilter: 'blur(12px)',
                        zIndex: 100,
                        animation: 'fadeIn 0.2s ease',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {label}
                </div>
            )}

            {/* Fist countdown overlay */}
            {fistCountdown !== null && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 150,
                        background: 'rgba(9,9,15,0.7)',
                        backdropFilter: 'blur(8px)',
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            width: 140,
                            height: 140,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 20,
                        }}
                    >
                        <svg
                            width="140"
                            height="140"
                            style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}
                        >
                            <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(239,68,68,0.2)" strokeWidth="6" />
                            <circle
                                cx="70"
                                cy="70"
                                r="60"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray="377"
                                strokeDashoffset={377 * (1 - fistCountdown / 3)}
                                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                            />
                        </svg>
                        <div
                            style={{
                                fontSize: 52,
                                fontFamily: 'Outfit, sans-serif',
                                fontWeight: 900,
                                color: '#ef4444',
                            }}
                        >
                            {Math.ceil(fistCountdown)}
                        </div>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#f8f8ff', marginBottom: 8 }}>
                        ✊ Clearing canvas...
                    </div>
                    <div style={{ fontSize: 14, color: '#a8a8c0', marginBottom: 24 }}>
                        Lower your fist to cancel
                    </div>
                    <button
                        onClick={onClearCancelled}
                        className="btn btn-sm"
                        style={{ fontSize: 13 }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </>
    );
}
