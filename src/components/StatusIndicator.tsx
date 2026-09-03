import React from 'react';

type AppState = 'idle' | 'drawing' | 'paused' | 'error' | 'no_face';

interface StatusIndicatorProps {
    state: AppState;
    faceDetected: boolean;
}

const CONFIG: Record<AppState, { dot: string; label: string; subtitle: string; bg: string }> = {
    idle: {
        dot: '#22c55e',
        label: '🟢 READY',
        subtitle: 'Nose ready 👃',
        bg: 'rgba(34,197,94,0.08)',
    },
    drawing: {
        dot: '#ef4444',
        label: '🔴 DRAWING',
        subtitle: 'Injaa starts!',
        bg: 'rgba(239,68,68,0.08)',
    },
    paused: {
        dot: '#eab308',
        label: '🟡 PAUSED',
        subtitle: 'Gaagga varakum!',
        bg: 'rgba(234,179,8,0.08)',
    },
    error: {
        dot: '#f97316',
        label: '⚠️ ERROR',
        subtitle: 'Camera issue',
        bg: 'rgba(249,115,22,0.08)',
    },
    no_face: {
        dot: '#f97316',
        label: '⚠️ NO FACE',
        subtitle: 'Mooku move cheyyu',
        bg: 'rgba(249,115,22,0.08)',
    },
};

export function StatusIndicator({ state, faceDetected }: StatusIndicatorProps) {
    const effectiveState = !faceDetected && state !== 'error' ? 'no_face' : state;
    const cfg = CONFIG[effectiveState];

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                background: cfg.bg,
                border: `1px solid ${cfg.dot}33`,
                borderRadius: 999,
                backdropFilter: 'blur(12px)',
                transition: 'all 0.3s ease',
            }}
        >
            <span
                style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: cfg.dot,
                    boxShadow: `0 0 6px ${cfg.dot}`,
                    animation: effectiveState === 'drawing' ? 'pulse-drawing 1s ease-in-out infinite' : 'none',
                    flexShrink: 0,
                }}
            />
            <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: '#f8f8ff' }}>
                    {cfg.label}
                </div>
                <div style={{ fontSize: 10, color: '#a8a8c0', marginTop: 1 }}>{cfg.subtitle}</div>
            </div>
        </div>
    );
}
