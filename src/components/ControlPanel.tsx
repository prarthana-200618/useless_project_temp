import React from 'react';

const PRESET_COLORS = [
    '#ffffff', // white
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#06b6d4', // cyan
    '#8b5cf6', // purple
    '#ec4899', // pink
];

const BRUSH_SIZES = [4, 8, 14, 22, 32];

interface ControlPanelProps {
    appState: 'idle' | 'drawing' | 'paused' | 'error' | 'no_face';
    brushColor: string;
    brushSize: number;
    onSetBrushColor: (c: string) => void;
    onSetBrushSize: (s: number) => void;
    onStartDrawing: () => void;
    onPause: () => void;
    onClear: () => void;
    onSave: () => void;
    onSaveComposite: () => void;
    onHelp: () => void;
}

export function ControlPanel({
    appState,
    brushColor,
    brushSize,
    onSetBrushColor,
    onSetBrushSize,
    onStartDrawing,
    onPause,
    onClear,
    onSave,
    onSaveComposite,
    onHelp,
}: ControlPanelProps) {
    const isDrawing = appState === 'drawing';
    const isPaused = appState === 'paused';
    const canDraw = appState === 'idle' || appState === 'paused';

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 24,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 18px',
                background: 'rgba(9,9,15,0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.1)',
                zIndex: 80,
                flexWrap: 'wrap',
                justifyContent: 'center',
                maxWidth: '95vw',
            }}
        >
            {/* Draw / Resume */}
            {canDraw && (
                <button
                    className="btn btn-primary"
                    onClick={onStartDrawing}
                    title="Start Drawing (☝️ index finger)"
                >
                    🎨 {isPaused ? 'Resume' : 'Draw'}
                </button>
            )}

            {/* Pause */}
            {isDrawing && (
                <button
                    className="btn"
                    onClick={onPause}
                    title="Pause (🖐️ open palm)"
                    style={{ borderColor: 'rgba(234,179,8,0.35)', color: '#fde047' }}
                >
                    ⏸️ Pause
                </button>
            )}

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

            {/* Color swatches */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                {PRESET_COLORS.map((c) => (
                    <button
                        key={c}
                        onClick={() => onSetBrushColor(c)}
                        title={c}
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: c,
                            border: brushColor === c ? '2px solid #fff' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'transform 0.15s',
                            padding: 0,
                            boxShadow: brushColor === c ? `0 0 8px ${c}` : 'none',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.25)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                ))}
                {/* Custom color picker */}
                <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => onSetBrushColor(e.target.value)}
                    title="Custom color"
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        padding: 0,
                        background: 'transparent',
                    }}
                />
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

            {/* Brush size */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {BRUSH_SIZES.map((s) => (
                    <button
                        key={s}
                        onClick={() => onSetBrushSize(s)}
                        title={`Brush size ${s}`}
                        style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: brushSize === s ? brushColor : 'rgba(255,255,255,0.15)',
                            border: brushSize === s ? `1.5px solid #fff` : '1px solid rgba(255,255,255,0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0,
                            transition: 'transform 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                        <div style={{
                            width: Math.max(4, s * 0.5),
                            height: Math.max(4, s * 0.5),
                            borderRadius: '50%',
                            background: brushSize === s ? '#fff' : 'rgba(255,255,255,0.6)',
                        }} />
                    </button>
                ))}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

            {/* Clear */}
            <button className="btn btn-danger btn-sm" onClick={onClear} title="Clear canvas (✊ fist)">
                🗑️ Clear
            </button>

            {/* Save (drawing only) */}
            <button className="btn btn-sm" onClick={onSave} title="Save drawing as PNG">
                💾 Save
            </button>

            {/* Save composite */}
            <button className="btn btn-sm" onClick={onSaveComposite} title="Save drawing + camera as PNG">
                📸 +Cam
            </button>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }} />

            {/* Help */}
            <button className="btn btn-sm" onClick={onHelp} title="Help">
                ❓
            </button>
        </div>
    );
}
