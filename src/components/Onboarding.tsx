import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'iksha_inja_onboarded';

interface OnboardingProps {
    onDismiss: () => void;
}

const steps = [
    {
        icon: '📷',
        title: 'Look at the camera',
        desc: 'Let the app find your nose.',
    },
    {
        icon: '☝️',
        title: 'Raise your index finger',
        desc: 'Start drawing mode.',
    },
    {
        icon: '👃',
        title: 'Move your nose',
        desc: 'Your nose controls the brush!',
    },
    {
        icon: '🖐️',
        title: 'Open your palm',
        desc: 'Pause drawing.',
    },
    {
        icon: '✊',
        title: 'Make a fist',
        desc: 'Clear the canvas (confirmation shown).',
    },
];

export function Onboarding({ onDismiss }: OnboardingProps) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // small delay for fade-in
        const t = setTimeout(() => setVisible(true), 50);
        return () => clearTimeout(t);
    }, []);

    function handleDismiss() {
        localStorage.setItem(STORAGE_KEY, '1');
        onDismiss();
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(9, 9, 15, 0.92)',
                backdropFilter: 'blur(20px)',
                opacity: visible ? 1 : 0,
                transition: 'opacity 0.4s ease',
            }}
        >
            <div
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 24,
                    padding: '40px 44px',
                    maxWidth: 520,
                    width: '90%',
                    animation: 'slideUp 0.5s ease forwards',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(139,92,246,0.12)',
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 52, marginBottom: 12, animation: 'bounce-gentle 2s ease infinite' }}>
                        👃
                    </div>
                    <h1 style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 28,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: 8,
                    }}>
                        Welcome to Iksha Inja
                    </h1>
                    <p style={{ color: '#a8a8c0', fontSize: 15, fontStyle: 'italic' }}>
                        Your nose is now your mouse.
                    </p>
                </div>

                {/* Steps */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 14,
                                padding: '12px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                borderRadius: 12,
                                animation: `slideUp 0.4s ease ${0.1 + i * 0.08}s both`,
                            }}
                        >
                            <span style={{ fontSize: 24, minWidth: 36, textAlign: 'center' }}>{step.icon}</span>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14, color: '#f8f8ff', marginBottom: 2 }}>
                                    {i + 1}. {step.title}
                                </div>
                                <div style={{ fontSize: 13, color: '#a8a8c0' }}>{step.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <button
                    onClick={handleDismiss}
                    style={{
                        width: '100%',
                        padding: '14px',
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        border: 'none',
                        borderRadius: 12,
                        color: '#fff',
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 16,
                        fontWeight: 700,
                        cursor: 'pointer',
                        letterSpacing: '0.02em',
                        boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                        (e.target as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(139,92,246,0.6)';
                        (e.target as HTMLButtonElement).style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                        (e.target as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(139,92,246,0.4)';
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                >
                    Got it — Let me Draw! 🎨
                </button>

                <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#606080' }}>
                    Mooku ready cheyyuka — nose will lead, canvas will follow.
                </p>
            </div>
        </div>
    );
}

export function shouldShowOnboarding(): boolean {
    return !localStorage.getItem(STORAGE_KEY);
}
