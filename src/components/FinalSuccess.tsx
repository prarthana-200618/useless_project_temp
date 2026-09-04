import React from 'react';

interface FinalSuccessProps {
    onRestart: () => void;
}

export function FinalSuccess({ onRestart }: FinalSuccessProps) {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#09090f',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                zIndex: 120,
                animation: 'fadeIn 0.6s ease',
            }}
        >
            <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
            <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(40px, 8vw, 72px)',
                color: '#fbbf24',
                marginBottom: 16
            }}>
                YOU DID IT!
            </h1>

            <p style={{ fontSize: 18, color: '#a8a8c0', textAlign: 'center', lineHeight: 1.6, marginBottom: 40 }}>
                You wrote both characters<br />using your nose! 👃
            </p>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                fontSize: 32,
                fontFamily: 'sans-serif',
                marginBottom: 48,
                background: 'rgba(255,255,255,0.05)',
                padding: '24px 48px',
                borderRadius: 24
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span>ക്ഷ</span> <span style={{ color: '#10b981', fontSize: 24 }}>✓</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span>ഞ്ഞ</span> <span style={{ color: '#10b981', fontSize: 24 }}>✓</span>
                </div>
            </div>

            <div style={{ fontSize: 13, color: '#606080', textAlign: 'center', marginBottom: 40, letterSpacing: '0.1em' }}>
                No mouse.<br />
                No keyboard.<br />
                Just nose power.
            </div>

            <button
                className="btn btn-primary"
                onClick={onRestart}
                style={{
                    padding: '16px 48px',
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                }}
            >
                [ DRAW AGAIN ]
            </button>
        </div>
    );
}
