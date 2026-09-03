import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useCamera } from './hooks/useCamera';
import { useFaceTracking } from './hooks/useFaceTracking';
import { useHandTracking } from './hooks/useHandTracking';
import { CameraView } from './components/CameraView';
import { DrawingCanvas, type DrawingCanvasHandle } from './components/DrawingCanvas';
import { NoseCursor } from './components/NoseCursor';
import { StatusIndicator } from './components/StatusIndicator';
import { ControlPanel } from './components/ControlPanel';
import { GestureGuide } from './components/GestureGuide';
import { Onboarding, shouldShowOnboarding } from './components/Onboarding';
import type { GestureType } from './vision/gestureRecognition';

type AppState = 'idle' | 'drawing' | 'paused' | 'error' | 'no_face';

const DEFAULT_BRUSH_COLOR = '#ffffff';
const DEFAULT_BRUSH_SIZE = 8;

export default function App() {
  // ── App state (React state — low frequency) ──
  const [appState, setAppState] = useState<AppState>('idle');
  const [faceDetected, setFaceDetected] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(shouldShowOnboarding());
  const [brushColor, setBrushColor] = useState(DEFAULT_BRUSH_COLOR);
  const [brushSize, setBrushSize] = useState(DEFAULT_BRUSH_SIZE);
  const [fistCountdown, setFistCountdown] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [currentGesture, setCurrentGesture] = useState<GestureType>('none');

  // ── High-frequency refs (never trigger re-renders) ──
  const noseRef = useRef<{ x: number; y: number } | null>(null);
  const appStateRef = useRef<AppState>('idle');
  const fistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fistIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fistStartRef = useRef<number | null>(null);
  const noseDisplayRef = useRef<{ x: number; y: number } | null>(null);
  const noseCursorDomRef = useRef<{ update: (x: number, y: number) => void } | null>(null);

  // ── Canvas ref ──
  const drawingCanvasRef = useRef<DrawingCanvasHandle | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ── Camera ──
  const { videoRef, isReady: cameraReady, error: cameraError } = useCamera();

  // Update appStateRef in sync with appState
  useEffect(() => {
    appStateRef.current = appState;
  }, [appState]);

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
    if (cameraError) setAppState('error');
  }, [cameraError]);

  // ── Nose movement handler (runs in RAF, never triggers React state) ──
  const onNoseMove = useCallback((pos: { x: number; y: number }) => {
    noseRef.current = pos;

    // Directly update the cursor DOM element position via a lightweight approach
    // We store it and the NoseCursor will be driven by a separate RAF loop
    noseDisplayRef.current = pos;

    const state = appStateRef.current;
    if (state === 'drawing') {
      const canvas = drawingCanvasRef.current;
      if (canvas) {
        canvas.continueStrokeAt(pos.x, pos.y);
      }
    }
  }, []);

  // ── Face detection change ──
  const onFaceDetected = useCallback((detected: boolean) => {
    setFaceDetected(detected);
    if (!detected) {
      // When face lost, end any active stroke
      drawingCanvasRef.current?.endStroke();
    }
  }, []);

  // ── Face tracking ──
  useFaceTracking({
    videoRef,
    isVideoReady: cameraReady,
    canvasWidth: canvasSize.w,
    canvasHeight: canvasSize.h,
    onNoseMove,
    onFaceDetected,
  });

  // ── Cancel fist timer ──
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

  // ── Start fist countdown to clear ──
  const startFistCountdown = useCallback(() => {
    if (fistStartRef.current !== null) return; // already running
    fistStartRef.current = Date.now();
    setFistCountdown(3);

    fistIntervalRef.current = setInterval(() => {
      if (fistStartRef.current === null) return;
      const elapsed = (Date.now() - fistStartRef.current) / 1000;
      const remaining = Math.max(0, 3 - elapsed);
      setFistCountdown(remaining);
    }, 50);

    fistTimerRef.current = setTimeout(() => {
      drawingCanvasRef.current?.clear();
      cancelFistTimer();
      setAppState('idle');
    }, 3000);
  }, [cancelFistTimer]);

  // ── Gesture handler ──
  const onGesture = useCallback((gesture: GestureType) => {
    setCurrentGesture(gesture);
    const state = appStateRef.current;

    if (gesture === 'index_up') {
      cancelFistTimer();
      if (state === 'idle' || state === 'paused') {
        setAppState('drawing');
        // Start stroke from current nose position
        const nose = noseRef.current;
        if (nose) drawingCanvasRef.current?.beginStroke(nose.x, nose.y);
      }
    } else if (gesture === 'open_palm') {
      cancelFistTimer();
      if (state === 'drawing') {
        drawingCanvasRef.current?.endStroke();
        setAppState('paused');
      }
    } else if (gesture === 'fist') {
      if (fistStartRef.current === null) {
        startFistCountdown();
      }
    } else {
      // Non-fist gesture: cancel countdown
      if (fistStartRef.current !== null) {
        cancelFistTimer();
      }
    }
  }, [cancelFistTimer, startFistCountdown]);

  // ── Hand tracking ──
  useHandTracking({
    videoRef,
    isVideoReady: cameraReady,
    onGesture,
  });

  // ── Nose cursor driven by a separate RAF for smooth updates ──
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

  // ── Drawing state management ──
  useEffect(() => {
    if (appState === 'drawing') {
      const nose = noseRef.current;
      if (nose) drawingCanvasRef.current?.beginStroke(nose.x, nose.y);
    }
    if (appState !== 'drawing') {
      drawingCanvasRef.current?.endStroke();
    }
  }, [appState]);

  // ── Control panel actions ──
  function handleStartDrawing() {
    setAppState('drawing');
    const nose = noseRef.current;
    if (nose) drawingCanvasRef.current?.beginStroke(nose.x, nose.y);
  }

  function handlePause() {
    drawingCanvasRef.current?.endStroke();
    setAppState('paused');
  }

  function handleClear() {
    cancelFistTimer();
    drawingCanvasRef.current?.clear();
    setAppState('idle');
  }

  function handleSave() {
    drawingCanvasRef.current?.exportPng();
  }

  function handleSaveComposite() {
    if (videoRef.current) {
      drawingCanvasRef.current?.exportCompositePng(videoRef.current);
    }
  }

  const effectiveState: AppState = !faceDetected && appState !== 'error' ? 'no_face' : appState;

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

      {/* ══ Drawing Canvas ══ */}
      <DrawingCanvas
        ref={drawingCanvasRef}
        brushColor={brushColor}
        brushSize={brushSize}
        isDrawing={appState === 'drawing'}
      />

      {/* ══ Nose Cursor ══ */}
      {noseCursorPos && faceDetected && (
        <NoseCursor
          x={noseCursorPos.x}
          y={noseCursorPos.y}
          state={effectiveState}
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
            fontSize: 'clamp(9px, 1.5vw, 13px)',
            color: 'rgba(168,168,192,0.75)',
            fontStyle: 'italic',
            letterSpacing: '0.04em',
            marginBottom: 4,
          }}
        >
          Mookukond Iksha, injaa, gaagga varakum
        </p>
        <p
          style={{
            fontSize: 'clamp(8px, 1.2vw, 11px)',
            color: 'rgba(139,92,246,0.6)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          A Nose-Powered Drawing Experiment
        </p>
      </div>

      {/* ══ Status Indicator ══ */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 70,
        }}
      >
        <StatusIndicator state={effectiveState} faceDetected={faceDetected} />
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
      <ControlPanel
        appState={effectiveState}
        brushColor={brushColor}
        brushSize={brushSize}
        onSetBrushColor={setBrushColor}
        onSetBrushSize={setBrushSize}
        onStartDrawing={handleStartDrawing}
        onPause={handlePause}
        onClear={handleClear}
        onSave={handleSave}
        onSaveComposite={handleSaveComposite}
        onHelp={() => setShowOnboarding(true)}
      />

      {/* ══ Onboarding ══ */}
      {showOnboarding && (
        <Onboarding onDismiss={() => setShowOnboarding(false)} />
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
