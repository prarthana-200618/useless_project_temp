import { useEffect, useRef, useState } from 'react';

export type CameraError = 'permission_denied' | 'not_found' | 'unavailable' | null;

export interface UseCameraResult {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isReady: boolean;
    error: CameraError;
    stream: MediaStream | null;
    stopCamera: () => void;
}

export function useCamera(): UseCameraResult {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isReady, setIsReady] = useState(false);
    const [error, setError] = useState<CameraError>(null);

    useEffect(() => {
        let cancelled = false;

        async function startCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: 'user',
                    },
                });

                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        if (!cancelled) {
                            videoRef.current?.play();
                            setIsReady(true);
                        }
                    };
                }
            } catch (err: unknown) {
                if (cancelled) return;
                const e = err as { name?: string };
                if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                    setError('permission_denied');
                } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
                    setError('not_found');
                } else {
                    setError('unavailable');
                }
            }
        }

        startCamera();

        return () => {
            cancelled = true;
            streamRef.current?.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        };
    }, []);

    function stopCamera() {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setIsReady(false);
    }

    return { videoRef, isReady, error, stream: streamRef.current, stopCamera };
}
