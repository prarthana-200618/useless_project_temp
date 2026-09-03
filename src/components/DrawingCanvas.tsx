import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { continueStroke, clearCanvas, drawDot } from '../utils/drawing';

export interface DrawingCanvasHandle {
    beginStroke: (x: number, y: number) => void;
    continueStrokeAt: (x: number, y: number) => void;
    endStroke: () => void;
    clear: () => void;
    exportPng: () => void;
    exportCompositePng: (video: HTMLVideoElement) => void;
}

interface DrawingCanvasProps {
    brushColor: string;
    brushSize: number;
    isDrawing: boolean;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(
    ({ brushColor, brushSize, isDrawing }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const prevPointRef = useRef<{ x: number; y: number } | null>(null);

        // Sync brush refs so the RAF loop always has current values
        const brushColorRef = useRef(brushColor);
        const brushSizeRef = useRef(brushSize);
        useEffect(() => { brushColorRef.current = brushColor; }, [brushColor]);
        useEffect(() => { brushSizeRef.current = brushSize; }, [brushSize]);

        // Resize canvas to container
        useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            function resize() {
                if (!canvas) return;
                const rect = canvas.parentElement!.getBoundingClientRect();
                // Save existing content
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx?.drawImage(canvas, 0, 0);

                canvas.width = rect.width;
                canvas.height = rect.height;

                // Restore content
                const ctx = canvas.getContext('2d');
                if (ctx && tempCanvas.width > 0 && tempCanvas.height > 0) {
                    ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
                }
            }

            resize();
            const ro = new ResizeObserver(resize);
            if (canvas.parentElement) ro.observe(canvas.parentElement);
            return () => ro.disconnect();
        }, []);

        useImperativeHandle(ref, () => ({
            beginStroke(x: number, y: number) {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                prevPointRef.current = { x, y };
                drawDot(ctx, { x, y }, { color: brushColorRef.current, width: brushSizeRef.current });
            },

            continueStrokeAt(x: number, y: number) {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const prev = prevPointRef.current;
                if (prev) {
                    continueStroke(ctx, prev, { x, y }, {
                        color: brushColorRef.current,
                        width: brushSizeRef.current,
                    });
                }
                prevPointRef.current = { x, y };
            },

            endStroke() {
                prevPointRef.current = null;
            },

            clear() {
                const canvas = canvasRef.current;
                if (canvas) clearCanvas(canvas);
                prevPointRef.current = null;
            },

            exportPng() {
                const canvas = canvasRef.current;
                if (!canvas) return;
                const dataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `iksha-inja-drawing-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },

            exportCompositePng(video: HTMLVideoElement) {
                const canvas = canvasRef.current;
                if (!canvas) return;

                const composite = document.createElement('canvas');
                composite.width = canvas.width;
                composite.height = canvas.height;
                const ctx = composite.getContext('2d');
                if (!ctx) return;

                ctx.save();
                ctx.translate(composite.width, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(video, 0, 0, composite.width, composite.height);
                ctx.restore();
                ctx.drawImage(canvas, 0, 0);

                const dataUrl = composite.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `iksha-inja-composite-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
        }));

        // When isDrawing turns false, end the stroke
        useEffect(() => {
            if (!isDrawing) {
                prevPointRef.current = null;
            }
        }, [isDrawing]);

        return (
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />
        );
    }
);

DrawingCanvas.displayName = 'DrawingCanvas';
