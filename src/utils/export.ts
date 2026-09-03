// Export the drawing canvas as a PNG file download
export function downloadCanvasPng(
    canvas: HTMLCanvasElement,
    filename = 'iksha-inja-drawing.png'
) {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Export composite: drawing + camera frame
export function downloadCompositePng(
    drawingCanvas: HTMLCanvasElement,
    videoElement: HTMLVideoElement,
    filename = 'iksha-inja-composite.png'
) {
    const composite = document.createElement('canvas');
    composite.width = drawingCanvas.width;
    composite.height = drawingCanvas.height;
    const ctx = composite.getContext('2d');
    if (!ctx) return;

    // Draw video frame (mirrored to match display)
    ctx.save();
    ctx.translate(composite.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoElement, 0, 0, composite.width, composite.height);
    ctx.restore();

    // Draw the drawing layer on top
    ctx.drawImage(drawingCanvas, 0, 0);

    const dataUrl = composite.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
