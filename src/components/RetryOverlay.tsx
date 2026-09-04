import React from 'react';

interface RetryOverlayProps {
    score: number;
    onRetry: () => void;
}

export function RetryOverlay({ score, onRetry }: RetryOverlayProps) {
    const percent = Math.round(score * 100);
    const isClose = percent >= 50;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(9, 9, 15, 0.90)',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                zIndex: 110,
                animation: 'fadeIn 0.3s ease',
            }}
        >
            <div className="glass" style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 60px',
                borderRadius: 24,
                background: 'rgba(255,40,90,0.05)',
                border: '1px solid rgba(255,40,90,0.1)'
            }}>
                <h2 style={{ fontSize: 32, marginBottom: 12, color: isClose ? '#fbbf24' : '#f87171' }}>
                    {isClose ? 'Almost! 👃' : 'Nice try! 👃'}
                </h2>

                <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: '#fff' }}>
                    {percent}% match
                </div>

                <p style={{ color: '#a8a8c0', marginBottom: 32 }}>
                    {isClose ? "You're getting there." : "Trace the guide more closely."}
                </p>

                <button
                    className="btn btn-primary"
                    onClick={onRetry}
                    style={{
                        padding: '12px 36px',
                        fontSize: 16,
                        fontWeight: 600,
                        background: 'transparent',
                        border: '2px solid #fff',
                        borderRadius: 12,
                        cursor: 'pointer',
                    }}
                >
                    [ TRY AGAIN ]
                </button>
            </div>
        </div>
    );
}
