import {
    FaceLandmarker,
    FilesetResolver,
    type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;

export async function createFaceLandmarker(): Promise<FaceLandmarker> {
    const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
    });

    return faceLandmarker;
}

export function detectFace(
    landmarker: FaceLandmarker,
    video: HTMLVideoElement,
    timestampMs: number
): FaceLandmarkerResult {
    return landmarker.detectForVideo(video, timestampMs);
}

// Nose tip is landmark index 4 in MediaPipe Face Mesh
export const NOSE_TIP_INDEX = 4;

export function getNoseTip(result: FaceLandmarkerResult): { x: number; y: number } | null {
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
    const landmarks = result.faceLandmarks[0];
    const nose = landmarks[NOSE_TIP_INDEX];
    if (!nose) return null;
    return { x: nose.x, y: nose.y };
}

export function destroyFaceLandmarker() {
    if (faceLandmarker) {
        faceLandmarker.close();
        faceLandmarker = null;
    }
}
