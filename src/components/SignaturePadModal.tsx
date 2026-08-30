import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  PenTool, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Check, 
  Image as ImageIcon,
  Sliders,
  Palette,
  X,
  FileSignature,
  RotateCw,
  Sparkles,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ZoomIn
} from 'lucide-react';

interface SignaturePadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentSignatureUrl?: string;
  currentHeight?: number;
  currentRotation?: number;
  currentVisible?: boolean;
  onSaveSignature: (params: {
    signatureDataUrl: string;
    height: number;
    rotation: number;
    visible: boolean;
  }) => void;
  onRemoveSignature: () => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  onClose,
  title,
  currentSignatureUrl,
  currentHeight = 48,
  currentRotation = 0,
  currentVisible = true,
  onSaveSignature,
  onRemoveSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hiddenProcessCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
  
  // Draw State
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState('#0f172a');
  const [penWidth, setPenWidth] = useState(2.5);

  // Raw uploaded image (base64) before filter processing
  const [rawUploadedImage, setRawUploadedImage] = useState<string | null>(null);
  
  // Processed image output
  const [processedImage, setProcessedImage] = useState<string | null>(currentSignatureUrl || null);

  // Image Filter Controls
  const [autoRemoveBg, setAutoRemoveBg] = useState(true);
  const [bgThreshold, setBgThreshold] = useState(210); // 100 - 250
  const [inkColorMode, setInkColorMode] = useState<'original' | 'navy' | 'black' | 'green' | 'red'>('navy');
  const [contrastBoost, setContrastBoost] = useState(1.4); // 1.0 - 2.5

  // Geometry / Placement Controls
  const [height, setHeight] = useState<number>(currentHeight);
  const [rotation, setRotation] = useState<number>(currentRotation);
  const [visible, setVisible] = useState<boolean>(currentVisible);

  useEffect(() => {
    if (isOpen) {
      setProcessedImage(currentSignatureUrl || null);
      setRawUploadedImage(null);
      setHasDrawn(false);
      setHeight(currentHeight || 48);
      setRotation(currentRotation || 0);
      setVisible(currentVisible !== false);

      // If opening with an existing signature, default to upload tab if it exists
      if (currentSignatureUrl) {
        setActiveTab('upload');
      } else {
        setActiveTab('draw');
      }

      setTimeout(() => {
        setupDrawCanvas();
      }, 60);
    }
  }, [isOpen, currentSignatureUrl, currentHeight, currentRotation, currentVisible]);

  // Setup Drawing Canvas
  const setupDrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
  };

  // Image Processing & Background Removal Engine
  const processImageBackground = useCallback((rawSrc: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;

      // Downscale if giant for smooth processing
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      if (!autoRemoveBg) {
        setProcessedImage(canvas.toDataURL('image/png'));
        return;
      }

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Target Ink Color RGB values
      let targetR = 15, targetG = 23, targetB = 42; // default dark black/slate
      if (inkColorMode === 'navy') {
        targetR = 26; targetG = 54; targetB = 138; // Rich Royal Blue
      } else if (inkColorMode === 'black') {
        targetR = 10; targetG = 15; targetB = 25; // Jet Black
      } else if (inkColorMode === 'green') {
        targetR = 4; targetG = 120; targetB = 87; // Dark Green
      } else if (inkColorMode === 'red') {
        targetR = 185; targetG = 28; targetB = 28; // Stamp Red
      }

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Luminance (brightness)
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        if (luminance >= bgThreshold) {
          // Paper background is fully removed
          data[i + 3] = 0;
        } else {
          // Smooth alpha transition for soft edges & anti-aliasing
          const thresholdDiff = bgThreshold - luminance;
          const alphaRatio = Math.min(1, Math.max(0, thresholdDiff / (bgThreshold * 0.45)));
          const boostedAlpha = Math.min(255, Math.round(alphaRatio * 255 * contrastBoost));

          data[i + 3] = boostedAlpha;

          if (inkColorMode !== 'original') {
            data[i] = targetR;
            data[i + 1] = targetG;
            data[i + 2] = targetB;
          } else {
            // Boost original ink contrast
            data[i] = Math.max(0, Math.round(r * 0.85));
            data[i + 1] = Math.max(0, Math.round(g * 0.85));
            data[i + 2] = Math.max(0, Math.round(b * 0.85));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      const cleanedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(cleanedDataUrl);
    };
    img.src = rawSrc;
  }, [autoRemoveBg, bgThreshold, inkColorMode, contrastBoost]);

  // Trigger processing when raw image or filter controls change
  useEffect(() => {
    if (rawUploadedImage) {
      processImageBackground(rawUploadedImage);
    }
  }, [rawUploadedImage, autoRemoveBg, bgThreshold, inkColorMode, contrastBoost, processImageBackground]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে শুধুমাত্র ইমেজ ফাইল (PNG, JPG, WebP) নির্বাচন করুন।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setRawUploadedImage(result);
      processImageBackground(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    let finalSignatureUrl = '';

    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      if (!hasDrawn && !processedImage) {
        alert('অনুগ্রহ করে প্রথমে প্যাডে স্বাক্ষর আঁকুন বা ছবি আপলোড করুন।');
        return;
      }

      if (hasDrawn) {
        finalSignatureUrl = canvas.toDataURL('image/png');
      } else if (processedImage) {
        finalSignatureUrl = processedImage;
      }
    } else {
      if (!processedImage) {
        alert('অনুগ্রহ করে একটি স্বাক্ষর ছবি আপলোড করুন।');
        return;
      }
      finalSignatureUrl = processedImage;
    }

    if (finalSignatureUrl) {
      onSaveSignature({
        signatureDataUrl: finalSignatureUrl,
        height,
        rotation,
        visible
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSignature className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight flex items-center gap-2">
                <span>{title}</span>
                {!visible && (
                  <span className="text-[10px] bg-red-900/60 text-red-200 px-2 py-0.5 rounded-full border border-red-500/40">
                    লুকানো (Hidden)
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-300">
                স্বাক্ষর আঁকুন, ছবি আপলোড করুন, ব্যাকগ্রাউন্ড রিমুভ ও রোটেট করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher & Visibility Toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('draw')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b-2 transition cursor-pointer ${
                activeTab === 'draw'
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>স্বাক্ষর আঁকুন (Draw)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b-2 transition cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-800 bg-white rounded-t-lg shadow-xs font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ছবি আপলোড ও ব্যাকগ্রাউন্ড রিমুভ</span>
            </button>
          </div>

          {/* Visibility Switch */}
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border transition cursor-pointer ${
              visible 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
            }`}
            title="সনদে স্বাক্ষর প্রদর্শন অথবা সাময়িক লুকানোর সুইচ"
          >
            {visible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
            <span>{visible ? 'সনদে সক্রিয়' : 'লুকানো'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* TAB 1: DRAW SIGNATURE */}
          {activeTab === 'draw' && (
            <div className="space-y-3">
              {/* Canvas Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Pen Colors */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 text-[11px] font-medium">কালি:</span>
                  {[
                    { color: '#0f172a', name: 'কালো (Black)' },
                    { color: '#1e3a8a', name: 'রয়েল ব্লু (Navy Blue)' },
                    { color: '#047857', name: 'সবুজ (Dark Green)' },
                    { color: '#991b1b', name: 'লাল সিল (Red)' },
                  ].map((item) => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => setPenColor(item.color)}
                      title={item.name}
                      style={{ backgroundColor: item.color }}
                      className={`w-5 h-5 rounded-full border-2 transition cursor-pointer ${
                        penColor === item.color ? 'border-amber-400 scale-110 shadow-sm' : 'border-white'
                      }`}
                    />
                  ))}
                </div>

                {/* Pen Width */}
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">পুরুত্ব:</span>
                  <select
                    value={penWidth}
                    onChange={(e) => setPenWidth(parseFloat(e.target.value))}
                    className="text-xs bg-slate-100 border border-slate-300 rounded px-2 py-0.5"
                  >
                    <option value="1.5">চিকন (1.5px)</option>
                    <option value="2.5">স্বাভাবিক (2.5px)</option>
                    <option value="3.5">পুরু (3.5px)</option>
                    <option value="4.5">গাঢ় (4.5px)</option>
                  </select>
                </div>

                {/* Clear Pad */}
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 rounded transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>মুছুন (Clear)</span>
                </button>
              </div>

              {/* Drawing Pad Canvas */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-40 cursor-crosshair touch-none bg-white"
                />
                
                {/* Guidelines */}
                <div className="absolute inset-x-4 bottom-7 border-b border-slate-200 pointer-events-none flex items-center justify-between text-[10px] text-slate-300">
                  <span>স্বাক্ষর রেখা (Sign line)</span>
                  <span>বহেরাতৈল ইউনিয়ন পরিষদ ডিজিটাল সাইন</span>
                </div>

                {!hasDrawn && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic">
                    মাউস বা আঙুল দিয়ে এখানে স্বাক্ষর আঁকুন...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD IMAGE & AUTO BACKGROUND REMOVAL */}
          {activeTab === 'upload' && (
            <div className="space-y-3.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Upload Drop Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-400 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/70 rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-1.5"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  স্বাক্ষর বা সিলের ছবি আপলোড করুন
                </div>
                <p className="text-[11px] text-slate-500 max-w-sm">
                  কাগজে কলমে করা স্বাক্ষরের ছবি আপলোড করলে সিস্টেম স্বয়ংক্রিয়ভাবে সাদা ব্যাকগ্রাউন্ড রিমুভ করে আসল হাতের কালির মত নিখুঁত করে নেবে।
                </p>
              </div>

              {/* Smart Background Removal & Ink Processing Settings */}
              {processedImage && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>ব্যাকগ্রাউন্ড রিমুভার ও কালি প্রসেসিং (AI Clean):</span>
                    </span>

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={autoRemoveBg}
                        onChange={(e) => setAutoRemoveBg(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>অটো ব্যাকগ্রাউন্ড রিমুভ</span>
                    </label>
                  </div>

                  {autoRemoveBg && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {/* Ink Color Tint */}
                      <div>
                        <label className="block text-slate-600 mb-1 font-medium text-[11px]">
                          কালির রঙ নির্বাচন:
                        </label>
                        <select
                          value={inkColorMode}
                          onChange={(e) => setInkColorMode(e.target.value as any)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 font-medium"
                        >
                          <option value="navy">রয়েল ব্লু পেন (Royal Blue Ink)</option>
                          <option value="black">জেট ব্ল্যাক জেল পেন (Black Ink)</option>
                          <option value="original">মূল ছবির রঙ (Original Color)</option>
                          <option value="green">গাঢ় সবুজ কালি (Green Ink)</option>
                          <option value="red">লাল সিল/কালি (Red Stamp)</option>
                        </select>
                      </div>

                      {/* Threshold Sensitivity */}
                      <div>
                        <div className="flex justify-between text-slate-600 mb-1 text-[11px] font-medium">
                          <span>সাদা পেপার রিমুভ সংবেদনশীলতা:</span>
                          <span className="font-mono text-emerald-700 font-bold">{bgThreshold}</span>
                        </div>
                        <input
                          type="range"
                          min="140"
                          max="245"
                          step="2"
                          value={bgThreshold}
                          onChange={(e) => setBgThreshold(parseInt(e.target.value))}
                          className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cleaned Signature Live Preview Box (with checkered transparent background) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span>প্রসেসড সিগনেচার প্রিভিউ (স্বচ্ছ ব্যাকগ্রাউন্ড):</span>
                      <button
                        type="button"
                        onClick={() => {
                          setProcessedImage(null);
                          setRawUploadedImage(null);
                        }}
                        className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>ছবি মুছুন</span>
                      </button>
                    </div>

                    <div 
                      className="p-3 border border-slate-300 rounded-lg flex items-center justify-center min-h-[90px] overflow-hidden"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #f1f5f9 25%, transparent 25%), linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f5f9 75%), linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <img 
                        src={processedImage} 
                        alt="Cleaned Signature" 
                        style={{ 
                          height: `${Math.min(height, 70)}px`,
                          transform: `rotate(${rotation}deg)` 
                        }}
                        className="max-w-full object-contain filter drop-shadow-xs transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* GEOMETRY & ROTATION CONTROLS (Common to both Draw & Upload) */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center justify-between font-bold text-slate-800 border-b border-slate-200 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                <span>সাইনের আকার ছোট-বড় ও কোণ রোটেট (Size & Rotation):</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setHeight(48);
                  setRotation(0);
                }}
                className="text-[11px] text-slate-500 hover:text-emerald-700 font-normal underline"
              >
                ডিফল্ট রিসেট
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Resize Height Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 text-[11px] font-medium">
                  <span>আকার / উচ্চতা (Size):</span>
                  <span className="font-mono text-emerald-700 font-bold">{height}px</span>
                </div>
                <div className="flex items-center gap-2">
                  <Minimize2 className="w-3 h-3 text-slate-400" />
                  <input
                    type="range"
                    min="24"
                    max="96"
                    step="2"
                    value={height}
                    onChange={(e) => setHeight(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <Maximize2 className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Rotate Angle Slider & Quick Slant Presets */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-600 text-[11px] font-medium">
                  <span>কোণ ঘোরানো (Rotation Angle):</span>
                  <span className="font-mono text-emerald-700 font-bold">{rotation > 0 ? `+${rotation}°` : `${rotation}°`}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <input
                    type="range"
                    min="-30"
                    max="30"
                    step="1"
                    value={rotation}
                    onChange={(e) => setRotation(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <RotateCw className="w-3 h-3 text-slate-400" />
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-slate-400">হাতের ঢাল:</span>
                  <div className="flex gap-1">
                    {[-8, -4, 0, 4, 8].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setRotation(deg)}
                        className={`px-1.5 py-0.5 rounded border transition cursor-pointer ${
                          rotation === deg
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {deg === 0 ? '0°' : deg > 0 ? `+${deg}°` : `${deg}°`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delete Option if signature currently exists */}
          {currentSignatureUrl && (
            <div className="flex items-center justify-between p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-xs">
              <span className="text-amber-900 font-medium">
                পূর্বে সংরক্ষিত ডিজিটাল স্বাক্ষর মুছতে চান?
              </span>
              <button
                type="button"
                onClick={() => {
                  onRemoveSignature();
                  setProcessedImage(null);
                  setRawUploadedImage(null);
                  clearCanvas();
                  onClose();
                }}
                className="text-red-600 hover:text-red-800 font-bold inline-flex items-center gap-1 cursor-pointer bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded border border-red-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>স্বাক্ষর স্থায়ীভাবে বাদ দিন</span>
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            বাতিল (Cancel)
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:scale-95 rounded-lg transition cursor-pointer shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>সনদে স্বাক্ষর প্রয়োগ করুন (Apply to Certificate)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
