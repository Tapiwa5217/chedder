'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

type Props = {
  src: string; // dataURL of the selected image
  onApply: (blob: Blob) => void;
  onCancel: () => void;
};

const CROP_PX = 320; // canvas output resolution
const VIEW_PX = 220; // circle preview diameter (px)

export default function AvatarCropper({ src, onApply, onCancel }: Props) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image to get natural dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      imgRef.current = img;
      // Reset position each time src changes
      setPos({ x: 0, y: 0 });
      setZoom(1);
    };
    img.src = src;
  }, [src]);

  // Scale so the shorter side exactly fills the circle at zoom=1
  const baseScale = VIEW_PX / Math.min(naturalSize.w, naturalSize.h);
  const scale = baseScale * zoom;
  const dispW = naturalSize.w * scale;
  const dispH = naturalSize.h * scale;

  // Image top-left in the preview (centred + user offset)
  const imgLeft = VIEW_PX / 2 - dispW / 2 + pos.x;
  const imgTop = VIEW_PX / 2 - dispH / 2 + pos.y;

  // ── Mouse drag ──────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      setPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    },
    [dragging, dragStart],
  );

  const onMouseUp = useCallback(() => setDragging(false), []);

  // ── Touch drag ──────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setDragging(true);
    setDragStart({ x: t.clientX - pos.x, y: t.clientY - pos.y });
  };

  const onTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const t = e.touches[0];
      setPos({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
    },
    [dragging, dragStart],
  );

  const onTouchEnd = useCallback(() => setDragging(false), []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  // ── Export ─────────────────────────────────────────────────
  const handleApply = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    canvas.width = CROP_PX;
    canvas.height = CROP_PX;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clip to circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(CROP_PX / 2, CROP_PX / 2, CROP_PX / 2, 0, Math.PI * 2);
    ctx.clip();

    // Map preview coords → canvas coords
    const factor = CROP_PX / VIEW_PX;
    ctx.drawImage(img, imgLeft * factor, imgTop * factor, dispW * factor, dispH * factor);
    ctx.restore();

    canvas.toBlob((blob) => { if (blob) onApply(blob); }, 'image/jpeg', 0.92);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">Crop photo</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular preview */}
        <div className="flex justify-center mb-5">
          <div
            className="relative overflow-hidden rounded-full border-4 border-amber-400 shadow-lg select-none"
            style={{
              width: VIEW_PX,
              height: VIEW_PX,
              cursor: dragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
          >
            {/* Background grid so transparent areas show */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(45deg,#888 25%,transparent 25%),' +
                  'linear-gradient(-45deg,#888 25%,transparent 25%),' +
                  'linear-gradient(45deg,transparent 75%,#888 75%),' +
                  'linear-gradient(-45deg,transparent 75%,#888 75%)',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0,0 8px,8px -8px,-8px 0',
              }}
            />
            {/* The image */}
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                position: 'absolute',
                width: dispW,
                height: dispH,
                left: imgLeft,
                top: imgTop,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </div>
        </div>

        {/* Zoom control */}
        <div className="flex items-center gap-3 mb-2">
          <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.02}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-amber-500 cursor-pointer"
          />
          <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </div>
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mb-5">
          Drag to reposition · Slider to zoom
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm"
          >
            Apply
          </button>
        </div>

        {/* Hidden export canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
