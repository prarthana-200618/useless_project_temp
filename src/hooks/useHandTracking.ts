import { useEffect, useRef, useCallback } from 'react';
import {
    createHandLandmarker,
    detectHands,
    destroyHandLandmarker,
} from '../vision/handTracking';
import {
    classifyGesture,
    createGestureDebouncer,
    type GestureType,
} from '../vision/gestureRecognition';
import type { HandLandmarker } from '@mediapipe/tasks-vision';

export interface UseHandTrackingOptions {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isVideoReady: boolean;
    onGesture?: (gesture: GestureType) => void;
}

export function useHandTracking({
    videoRef,
    isVideoReady,
    onGesture,
}: UseHandTrackingOptions) {
    const landmarkerRef = useRef<HandLandmarker | null>(null);
    const rafRef = useRef<number | null>(null);
    const debounce = useRef(createGestureDebouncer(15));
    const lastVideoTimeRef = useRef(-1);
    const initializingRef = useRef(false);

    const onGestureRef = useRef(onGesture);
    useEffect(() => { onGestureRef.current = onGesture; }, [onGesture]);

    const stopLoop = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const startLoop = useCallback(() => {
        if (!landmarkerRef.current) return;

        function loop() {
            const video = videoRef.current;
            const landmarker = landmarkerRef.current;
            if (!video || !landmarker || video.readyState < 2) {
                rafRef.current = requestAnimationFrame(loop);
                return;
            }

            if (video.currentTime !== lastVideoTimeRef.current) {
                lastVideoTimeRef.current = video.currentTime;
                const timestampMs = performance.now();
                try {
                    const result = detectHands(landmarker, video, timestampMs);
                    const landmarks = result.landmarks?.[0] ?? [];
                    const rawGesture = classifyGesture(landmarks);
                    const stable = debounce.current(rawGesture);
                    onGestureRef.current?.(stable);
                } catch {
                    // Ignore single frame errors
                }
            }

            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
    }, [videoRef]);

    useEffect(() => {
        if (!isVideoReady || initializingRef.current) return;
        initializingRef.current = true;

        createHandLandmarker()
            .then((lm) => {
                landmarkerRef.current = lm;
                startLoop();
            })
            .catch((err) => {
                console.error('HandLandmarker init failed:', err);
            });

        return () => {
            stopLoop();
            destroyHandLandmarker();
            initializingRef.current = false;
        };
    }, [isVideoReady, startLoop, stopLoop]);

    return { stopLoop };
}
