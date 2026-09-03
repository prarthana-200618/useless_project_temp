import {
    HandLandmarker,
    FilesetResolver,
    type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';

let handLandmarker: HandLandmarker | null = null;

export async function createHandLandmarker(): Promise<HandLandmarker> {
    const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numHands: 1,
    });

    return handLandmarker;
}

export function detectHands(
    landmarker: HandLandmarker,
    video: HTMLVideoElement,
    timestampMs: number
): HandLandmarkerResult {
    return landmarker.detectForVideo(video, timestampMs);
}

export function destroyHandLandmarker() {
    if (handLandmarker) {
        handLandmarker.close();
        handLandmarker = null;
    }
}
