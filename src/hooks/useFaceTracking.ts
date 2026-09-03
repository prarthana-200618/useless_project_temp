import { useEffect, useRef, useCallback } from 'react';
import {
    createFaceLandmarker,
    detectFace,
    getNoseTip,
    destroyFaceLandmarker,
} from '../vision/faceTracking';
import { createSmoother } from '../utils/smoothing';
import { toCanvasCoords } from '../vision/coordinateMapping';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';

export interface NosePosition {
    x: number; // canvas pixels (mirrored)
    y: number;
    normalized: { x: number; y: number }; // raw 0..1
}

export interface UseFaceTrackingOptions {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isVideoReady: boolean;
    canvasWidth: number;
    canvasHeight: number;
    onNoseMove?: (pos: NosePosition) => void;
    onFaceDetected?: (detected: boolean) => void;
}

export function useFaceTracking({
    videoRef,
    isVideoReady,
    canvasWidth,
    canvasHeight,
    onNoseMove,
    onFaceDetected,
}: UseFaceTrackingOptions) {
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const rafRef = useRef<number | null>(null);
    const smoother = useRef(createSmoother(0.6));
    const lastDetectedRef = useRef<boolean>(false);
    const lastVideoTimeRef = useRef(-1);
    const initializingRef = useRef(false);

    // Store callbacks in refs to avoid stale closures
    const onNoseMoveRef = useRef(onNoseMove);
    const onFaceDetectedRef = useRef(onFaceDetected);
    useEffect(() => { onNoseMoveRef.current = onNoseMove; }, [onNoseMove]);
    useEffect(() => { onFaceDetectedRef.current = onFaceDetected; }, [onFaceDetected]);

    const canvasWidthRef = useRef(canvasWidth);
    const canvasHeightRef = useRef(canvasHeight);
    useEffect(() => { canvasWidthRef.current = canvasWidth; }, [canvasWidth]);
    useEffect(() => { canvasHeightRef.current = canvasHeight; }, [canvasHeight]);

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
                    const result = detectFace(landmarker, video, timestampMs);
                    const noseTip = getNoseTip(result);
                    const detected = noseTip !== null;

                    if (detected !== lastDetectedRef.current) {
                        lastDetectedRef.current = detected;
                        onFaceDetectedRef.current?.(detected);
                    }

                    if (noseTip) {
                        const smoothed = smoother.current.smooth(noseTip.x, noseTip.y);
                        const canvasPos = toCanvasCoords(
                            smoothed,
                            canvasWidthRef.current,
                            canvasHeightRef.current,
                            true // mirrored
                        );
                        onNoseMoveRef.current?.({
                            x: canvasPos.x,
                            y: canvasPos.y,
                            normalized: smoothed,
                        });
                    }
                } catch (err) {
                    console.error('Face tracking error:', err);
                }
            } // end of video.currentTime check

            rafRef.current = requestAnimationFrame(loop);
        }

        rafRef.current = requestAnimationFrame(loop);
    }, [videoRef]);

    useEffect(() => {
        if (!isVideoReady || initializingRef.current) return;
        initializingRef.current = true;

        createFaceLandmarker()
            .then((lm) => {
                landmarkerRef.current = lm;
                smoother.current.reset();
                startLoop();
            })
            .catch((err) => {
                console.error('FaceLandmarker init failed:', err);
            });

        return () => {
            stopLoop();
            destroyFaceLandmarker();
            initializingRef.current = false;
        };
    }, [isVideoReady, startLoop, stopLoop]);

    return { stopLoop };
}
