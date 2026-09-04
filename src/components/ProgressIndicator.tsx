import React from 'react';

interface ProgressIndicatorProps {
    currentTaskIndex: number;
    totalTasks: number;
}

export function ProgressIndicator({ currentTaskIndex, totalTasks }: ProgressIndicatorProps) {
    return (
        <div
            style={{
                position: 'fixed',
                bottom: 30,
                left: 30,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                zIndex: 80,
            }}
        >
            <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: totalTasks }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: i <= currentTaskIndex ? '#06b6d4' : 'rgba(255,255,255,0.2)',
                            boxShadow: i <= currentTaskIndex ? '0 0 8px #06b6d4' : 'none',
                            transition: 'all 0.3s ease',
                        }}
                    />
                ))}
            </div>
            <div
                style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#a8a8c0',
                    letterSpacing: '0.1em'
                }}
            >
                {currentTaskIndex + 1} / {totalTasks}
            </div>
        </div>
    );
}
