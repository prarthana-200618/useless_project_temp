import React from 'react';
import type { CharacterTask } from '../data/characterTasks';

interface TaskIntroProps {
    task: CharacterTask;
    taskIndex: number;
    onStart: () => void;
}

export function TaskIntro({ task, taskIndex, onStart }: TaskIntroProps) {
    const challengeText = taskIndex === 0 ? "YOUR FIRST CHALLENGE" : "YOUR SECOND CHALLENGE";

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
                zIndex: 100,
                animation: 'fadeIn 0.5s ease',
            }}
        >
            <div
                className="glass"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '60px 40px',
                    maxWidth: 600,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 24,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                }}
            >
                <span style={{
                    color: '#06b6d4',
                    letterSpacing: '0.15em',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 16
                }}>
                    {challengeText}
                </span>

                <h2 style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: '#a8a8c0',
                    marginBottom: 32
                }}>
                    Write
                </h2>

                <div style={{
                    fontSize: 120,
                    fontFamily: 'sans-serif',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a8a8c0 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1,
                    marginBottom: 32
                }}>
                    {task.character}
                </div>

                <h2 style={{
                    fontSize: 24,
                    fontWeight: 400,
                    color: '#a8a8c0',
                    marginBottom: 40
                }}>
                    with your nose 👃
                </h2>

                <p style={{
                    color: '#606080',
                    fontSize: 14,
                    marginBottom: 40
                }}>
                    {task.instruction}
                </p>

                <button
                    className="btn btn-primary"
                    onClick={onStart}
                    style={{
                        padding: '16px 48px',
                        fontSize: 16,
                        fontWeight: 600,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                        border: 'none',
                        borderRadius: 12,
                        cursor: 'pointer',
                        transition: 'transform 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    [ START DRAWING ]
                </button>
            </div>
        </div>
    );
}
