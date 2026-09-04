import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from './hooks/useCamera';
import { useFaceTracking } from './hooks/useFaceTracking';
import { useHandTracking } from './hooks/useHandTracking';
import { useAttemptRecording } from './hooks/useAttemptRecording';
import { CameraView } from './components/CameraView';
import { DrawingCanvas, type DrawingCanvasHandle } from './components/DrawingCanvas';
import { NoseCursor } from './components/NoseCursor';
import { StatusIndicator } from './components/StatusIndicator';
import { ControlPanel } from './components/ControlPanel';
import { GestureGuide } from './components/GestureGuide';
import { Onboarding, shouldShowOnboarding } from './components/Onboarding';
import type { GestureType } from './vision/gestureRecognition';

// --- Challenge Components & Logic ---
import { CHARACTER_TASKS } from './data/characterTasks';
import { recognizeCharacter, type RecognitionResult } from './recognition/characterRecognizer';
import { TaskIntro } from './components/TaskIntro';
import { CharacterGuide } from './components/CharacterGuide';
import { SuccessCelebration } from './components/SuccessCelebration';
import { RetryOverlay } from './components/RetryOverlay';
import { FinalSuccess } from './components/FinalSuccess';
import { ProgressIndicator } from './components/ProgressIndicator';

export type AppStage = 'task-intro' | 'drawing' | 'evaluating' | 'success' | 'retry' | 'final-success' | 'error';
// We remove 'paused' from AppStage as pause now directly triggers 'evaluating' or serves as an internal mechanism.
// 'no_face' will be displayed as status overlay, but stage remains what it is.

const DEFAULT_BRUSH_COLOR = '#ffffff';
const DEFAULT_BRUSH_SIZE = 8;

export default function App() {
  // ── App state (React state — low frequency) ──
  const [appStage, setAppStage] = useState<AppStage>('task-intro');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);

  // Show standard boarding? We can skip or show once. We'll disable it for the challenge to reduce clicks,
  // or keep it if they need to see how nose tracking works. The prompt didn't say remove it.
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding());

  const [brushColor, setBrushColor] = useState(DEFAULT_BRUSH_COLOR);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [fistCountdown, setFistCountdown] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [currentGesture, setCurrentGesture] = useState<GestureType>('none');
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null);

  // ── High-frequency refs ──
  const noseRef = useRef<{ x: number; y: number; normalized: { x: number, y: number } } | null>(null);
  const appStageRef = useRef<AppStage>('task-intro');
  const fistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fistIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fistStartRef = useRef<number | null>(null);
  const noseDisplayRef = useRef<{ x: number; y: number } | null>(null);

  // ── Canvas ref ──
  const drawingCanvasRef = useRef<DrawingCanvasHandle | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Whether the user has explicitly enabled drawing (via Start button or index gesture)
  const drawingEnabledRef = useRef(false);

  // ── Camera ──
  const { videoRef, isReady: cameraReady, error: cameraError } = useCamera();

  // ── Attempt Recording ──
  const { recordPoint, endCurrentStroke, clearAttempt, getAttempt } = useAttemptRecording();

  // Update appStageRef in sync with appStage
  useEffect(() => {
    appStageRef.current = appStage;
  }, [appStage]);

  // Canvas size tracking
  useEffect(() => {
    function onResize() {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Camera error → error state
  useEffect(() => {
    if (cameraError) setAppStage('error');
  }, [cameraError]);

  // ── Nose movement handler (runs in RAF) ──
  const onNoseMove = useCallback((pos: { x: number; y: number; normalized: { x: number, y: number } }) => {
    noseRef.current = pos;
    noseDisplayRef.current = pos;

    const stage = appStageRef.current;
    // Only continue drawing/recording when in drawing stage and the user has explicitly enabled drawing
    if (stage === 'drawing' && drawingEnabledRef.current) {
      const canvas = drawingCanvasRef.current;
      if (canvas) {
        canvas.continueStrokeAt(pos.x, pos.y);
        recordPoint(pos.normalized.x, pos.normalized.y, performance.now());
      }
    }
  }, [recordPoint]);

  // ── Face detection change ──
  const onFaceDetected = useCallback((detected: boolean) => {
    setFaceDetected(detected);
    if (!detected) {
      if (appStageRef.current === 'drawing') {
        drawingCanvasRef.current?.endStroke();
        endCurrentStroke();
      }
    }
  }, [endCurrentStroke]);

  // ── Face tracking ──
  useFaceTracking({
    videoRef,
    isVideoReady: cameraReady,
    canvasWidth: canvasSize.w,
    canvasHeight: canvasSize.h,
    onNoseMove,
    onFaceDetected,
  });

  // ── Fist Timer / Clear Logic ──
  const cancelFistTimer = useCallback(() => {
    if (fistTimerRef.current) {
      clearTimeout(fistTimerRef.current);
      fistTimerRef.current = null;
    }
    if (fistIntervalRef.current) {
      clearInterval(fistIntervalRef.current);
      fistIntervalRef.current = null;
    }
    fistStartRef.current = null;
    setFistCountdown(null);
  }, []);

  const handleClear = useCallback(() => {
    cancelFistTimer();
    drawingCanvasRef.current?.clear();
    clearAttempt();
    setRecognitionResult(null);
    if (appStageRef.current !== 'task-intro' && appStageRef.current !== 'final-success') {
      setAppStage('drawing'); // Reset to attempting the same task
    }
  }, [cancelFistTimer, clearAttempt]);

  const startFistCountdown = useCallback(() => {
    if (fistStartRef.current !== null) return;

    // Disable fist processing outside of drawing interaction
    if (appStageRef.current === 'task-intro' || appStageRef.current === 'final-success' || appStageRef.current === 'success') return;

    fistStartRef.current = Date.now();
    setFistCountdown(3);

    fistIntervalRef.current = setInterval(() => {
      if (fistStartRef.current === null) return;
      const elapsed = (Date.now() - fistStartRef.current) / 1000;
      const remaining = Math.max(0, 3 - elapsed);
      setFistCountdown(remaining);
    }, 50);

    fistTimerRef.current = setTimeout(() => {
      handleClear();
    }, 3000);
  }, [handleClear]);

  // ── Recognition Execution ──
  const evaluateAttempt = useCallback(() => {
    const currentTask = CHARACTER_TASKS[currentTaskIndex];
    const attempt = getAttempt();

    setAppStage('evaluating');

    // Evaluate (small timeout to allow overlay to render)
    setTimeout(() => {
      const result = recognizeCharacter(attempt.strokes, currentTask.template, currentTask.character);
      setRecognitionResult(result);
      if (result.matched) {
        setAppStage('success');
        // disable drawing until user explicitly restarts
        drawingEnabledRef.current = false;
      } else {
        setAppStage('retry');
      }
    }, 100);
  }, [currentTaskIndex, getAttempt]);

  // ── Gesture handler ──
  const onGesture = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);
    const stage = appStageRef.current;

    // Fist Clear Gesture
    if (gesture === 'fist') {
      if (fistStartRef.current === null) startFistCountdown();
      return; // Prioritize fist execution without letting it fall through
    } else {
      if (fistStartRef.current !== null) cancelFistTimer();
    }

    if (gesture === 'index_up') {
      if (stage === 'task-intro') return; // Can't start drawing in intro from gesture right now
      if (stage === 'retry') {
        // Restart on index up while in retry instead of waiting for button click
        setAppStage('drawing');
        clearAttempt();
        drawingCanvasRef.current?.clear();
        return;
      }

      // Start drawing if we are evaluating or paused/drawing logic happens implicitly
      // We don't have an explicit 'paused' stage anymore, we evaluate on open_palm.
      // E.g. we might have stopped tracking briefly because face left view.
      if (stage === 'drawing' && faceDetected) {
        // Resume explicit stroke (also mark that the user enabled drawing via gesture)
        drawingEnabledRef.current = true;
        const nose = noseRef.current;
        if (nose) drawingCanvasRef.current?.beginStroke(nose.x, nose.y);
      }
    }

    if (gesture === 'open_palm') {
      if (stage === 'drawing') {
        drawingCanvasRef.current?.endStroke();
        endCurrentStroke();
        evaluateAttempt();
      }
    }
  }, [startFistCountdown, cancelFistTimer, evaluateAttempt, faceDetected, clearAttempt]);

  // ── Hand tracking ──
  useHandTracking({
    videoRef,
    isVideoReady: cameraReady,
    onGesture,
  });

  // ── Nose cursor loop ──
  const [noseCursorPos, setNoseCursorPos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    let raf: number;
    function updateCursor() {
      setNoseCursorPos(noseDisplayRef.current ? { ...noseDisplayRef.current } : null);
      raf = requestAnimationFrame(updateCursor);
    }
    raf = requestAnimationFrame(updateCursor);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── Navigation Functions ──
  const startDrawingTask = () => {
    drawingCanvasRef.current?.clear();
    clearAttempt();
    // enable drawing only after user clicked Start
    drawingEnabledRef.current = true;
    setAppStage('drawing');
    // If we already have a detected nose, begin the stroke immediately so drawing begins smoothly
    const nose = noseRef.current;
    if (nose && faceDetected) {
      drawingCanvasRef.current?.beginStroke(nose.x, nose.y);
    }
  };

  const handleNextTask = () => {
    if (currentTaskIndex + 1 < CHARACTER_TASKS.length) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setAppStage('task-intro');
      drawingCanvasRef.current?.clear();
      clearAttempt();
      setRecognitionResult(null);
    } else {
      setAppStage('final-success');
    }
  };

  const handleDrawAgain = () => {
    setCurrentTaskIndex(0);
    setAppStage('task-intro');
    drawingCanvasRef.current?.clear();
    clearAttempt();
    setRecognitionResult(null);
  };

  const handleRetry = () => {
    drawingCanvasRef.current?.clear();
    clearAttempt();
    // re-enable drawing when retrying
    drawingEnabledRef.current = true;
    setAppStage('drawing');
  };

  // ── Existing Manual Controls ──
  function handleSave() {
    drawingCanvasRef.current?.exportPng();
  }

  function handleSaveComposite() {
    if (videoRef.current) drawingCanvasRef.current?.exportCompositePng(videoRef.current);
  }

  // Visual status
  const effectiveState = !faceDetected && appStage !== 'error' ? 'no_face' :
    appStage === 'drawing' ? 'drawing' : 'paused'; // Using existing generic icon mapping for cursor/pill

  const currentTask = CHARACTER_TASKS[currentTaskIndex];
  const isDrawingOrEvaluating = appStage === 'drawing' || appStage === 'evaluating' || appStage === 'retry';

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        background: '#09090f',
        overflow: 'hidden',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* ══ Camera View ══ */}
      <CameraView videoRef={videoRef} isReady={cameraReady} />

      {/* ══ Character Guide Overlay ══ */}
      <CharacterGuide character={currentTask.character} isVisible={isDrawingOrEvaluating} />

      {/* ══ Drawing Canvas ══ */}
      <DrawingCanvas
        ref={drawingCanvasRef}
        brushColor={brushColor}
        brushSize={brushSize}
        isDrawing={appStage === 'drawing'}
      />

      {/* ══ Nose Cursor ══ */}
      {noseCursorPos && faceDetected && appStage !== 'task-intro' && (
        <NoseCursor
          x={noseCursorPos.x}
          y={noseCursorPos.y}
          state={effectiveState as any}
          visible={cameraReady && faceDetected}
        />
      )}

      {/* ══ Header ══ */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 70,
          pointerEvents: 'none',
        }}
      >
        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(20px, 4vw, 36px)',
            fontWeight: 900,
            letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #ec4899 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 2,
            textTransform: 'uppercase',
          }}
        >
          Iksha Inja
        </h1>
        <p
          style={{
            fontSize: 'clamp(8px, 1.2vw, 11px)',
            color: 'rgba(139,92,246,0.6)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          MALAYALAM CHARACTER CHALLENGE
        </p>
      </div>

      {/* ══ Progress Indicator ══ */}
      {(appStage === 'drawing' || appStage === 'task-intro') && (
        <ProgressIndicator currentTaskIndex={currentTaskIndex} totalTasks={CHARACTER_TASKS.length} />
      )}

      {/* ══ Status Indicator ══ */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 70,
        }}
      >
        <StatusIndicator state={effectiveState as any} faceDetected={faceDetected} />
      </div>

      {/* ══ Error States ══ */}
      {cameraError && (
        <CameraErrorOverlay error={cameraError} />
      )}

      {/* ══ Loading State ══ */}
      {!cameraReady && !cameraError && (
        <LoadingOverlay />
      )}

      {/* ══ Gesture Guide ══ */}
      <GestureGuide
        gesture={currentGesture}
        fistCountdown={fistCountdown}
        onClearConfirmed={handleClear}
        onClearCancelled={cancelFistTimer}
      />

      {/* ══ Control Panel ══ */}
      {(appStage === 'drawing' || appStage === 'retry') && (
        <ControlPanel
          appState={effectiveState as any}
          brushColor={brushColor}
          brushSize={brushSize}
          onSetBrushColor={setBrushColor}
          onSetBrushSize={setBrushSize}
          onStartDrawing={() => { }} // Disabled explicit play/pause button since gesture drives logic
          onPause={() => { }}
          onClear={handleClear}
          onSave={handleSave}
          onSaveComposite={handleSaveComposite}
          onHelp={() => setShowOnboarding(true)}
        />
      )}

      {/* ══ Task Intro ══ */}
      {appStage === 'task-intro' && !showOnboarding && cameraReady && (
        <TaskIntro task={currentTask} taskIndex={currentTaskIndex} onStart={startDrawingTask} />
      )}

      {/* ══ Retry Overlay ══ */}
      {appStage === 'retry' && recognitionResult && (
        <RetryOverlay score={recognitionResult.score} onRetry={handleRetry} />
      )}

      {/* ══ Success Celebration ══ */}
      {appStage === 'success' && recognitionResult && (
        <SuccessCelebration task={currentTask} score={recognitionResult.score} onNext={handleNextTask} />
      )}

      {/* ══ Evaluating Overlay ══ */}
      {appStage === 'evaluating' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: 24, animation: 'pulse 1s infinite' }}>Checking your nose masterpiece... 👃</h2>
        </div>
      )}

      {/* ══ Final Success ══ */}
      {appStage === 'final-success' && (
        <FinalSuccess onRestart={handleDrawAgain} />
      )}

      {/* ══ Onboarding ══ */}
      {showOnboarding && (
        <Onboarding
          onDismiss={() => setShowOnboarding(false)}
          tasks={CHARACTER_TASKS}
          onSelectTask={(i) => {
            setCurrentTaskIndex(i);
            setShowOnboarding(false);
            setAppStage('task-intro');
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components for error/loading states ──

function CameraErrorOverlay({ error }: { error: string }) {
  const messages: Record<string, { title: string; desc: string; fix: string }> = {
    permission_denied: {
      title: '🚫 Camera Access Denied',
      desc: 'Camera access is required for Iksha Inja.',
      fix: 'Click the camera icon in your browser address bar and allow access, then refresh.',
    },
    not_found: {
      title: '📷 No Camera Found',
      desc: 'No webcam was detected on your device.',
      fix: 'Connect a webcam and refresh the page.',
    },
    unavailable: {
      title: '⚠️ Camera Unavailable',
      desc: 'Your camera could not be accessed.',
      fix: 'Check if another application is using the camera, then refresh.',
    },
  };

  const msg = messages[error] ?? messages['unavailable'];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(9,9,15,0.95)',
        zIndex: 90,
      }}
    >
      <div
        className="glass"
        style={{
          maxWidth: 440,
          width: '90%',
          padding: '40px 36px',
          textAlign: 'center',
          animation: 'slideUp 0.4s ease',
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          {msg.title}
        </h2>
        <p style={{ color: '#a8a8c0', fontSize: 15, marginBottom: 16 }}>{msg.desc}</p>
        <p style={{ color: '#6060a0', fontSize: 13, lineHeight: 1.6 }}>{msg.fix}</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 24, width: '100%' }}
          onClick={() => window.location.reload()}
        >
          🔄 Try Again
        </button>
      </div>
    </div>
  );
}

function LoadingOverlay() {
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
        zIndex: 90,
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          border: '3px solid rgba(139,92,246,0.2)',
          borderTop: '3px solid #8b5cf6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 24,
        }}
      />
      <div style={{ fontFamily: 'Outfit', fontSize: 18, fontWeight: 600, color: '#8b5cf6', marginBottom: 8 }}>
        Starting Iksha Inja...
      </div>
      <div style={{ fontSize: 13, color: '#606080' }}>
        Requesting camera access 👃
      </div>
    </div>
  );
}
