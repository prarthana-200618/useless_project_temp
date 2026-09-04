import React, { useEffect } from 'react';
import type { CharacterTask } from '../data/characterTasks';

interface SuccessCelebrationProps {
    task: CharacterTask;
    score: number;
    onNext: () => void;
}

export function SuccessCelebration({ task, score, onNext }: SuccessCelebrationProps) {
    // We'll show the celebration for 3 seconds, then naturally transition, OR the user can click.
    // Wait, the prompt says "Show HURRAY... Transition to Next task". 
    // Let's provide a NEXT button instead of auto-skipping, so they can admire it.

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(9, 9, 15, 0.95)',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                zIndex: 110,
                animation: 'zoomIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }}
        >
            <div style={{ fontSize: 72, marginBottom: 12 }}>🎉</div>
            <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(32px, 8vw, 64px)',
                color: '#8b5cf6',
                letterSpacing: '0.05em',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: 8
            }}>
                CONGRATULATIONS!
            </h1>

            <div style={{ fontSize: 16, color: '#a8a8c0', marginBottom: 6 }}>You wrote</div>
            <div style={{ fontSize: 14, color: '#06b6d4', marginBottom: 18, fontWeight: 600 }}>അഭിനന്ദനങ്ങൾ · Congrats ✓</div>

            <div style={{
                fontSize: 120,
                fontFamily: 'sans-serif',
                lineHeight: 1,
                marginBottom: 20,
                animation: 'pulse 2s infinite'
            }}>
                {task.character}
            </div>

            <div style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '8px 16px',
                borderRadius: 20,
                color: '#06b6d4',
                fontWeight: 600,
                marginBottom: 40
            }}>
                {Math.round(score * 100)}% match
            </div>

            <button
                className="btn btn-primary"
                onClick={onNext}
                style={{
                    padding: '16px 48px',
                    fontSize: 16,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    borderRadius: 12,
                    cursor: 'pointer',
                }}
            >
                NEXT CHALLENGE →
            </button>

        </div>
    );
}
