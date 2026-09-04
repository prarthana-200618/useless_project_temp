import React from 'react';

interface CharacterGuideProps {
    character: string;
    isVisible: boolean;
}

export function CharacterGuide({ character, isVisible }: CharacterGuideProps) {
    if (!isVisible) return null;

    return (
        <div
            style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 20, // Between Camera (which is fixed behind) and Canvas (zIndex: 10? wait, I'll set canvas zIndex to 30)
                opacity: 0.3,
            }}
        >
            <div
                style={{
                    fontFamily: 'sans-serif',
                    fontSize: 'min(50vw, 50vh)',
                    color: '#ffffff',
                    textShadow: '0 0 40px rgba(255,255,255,1)',
                    WebkitTextStroke: '2px rgba(255,255,255,0.8)',
                    lineHeight: 1,
                    animation: 'pulse 3s infinite ease-in-out',
                }}
            >
                {character}
            </div>
        </div>
    );
}
