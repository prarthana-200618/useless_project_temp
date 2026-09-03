import React from 'react';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isReady: boolean;
}

export function CameraView({ videoRef, isReady }: CameraViewProps) {
    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: 'scaleX(-1)', // Mirror for natural selfie view
                opacity: isReady ? 1 : 0,
                transition: 'opacity 0.5s ease',
                borderRadius: 0,
            }}
        />
    );
}
