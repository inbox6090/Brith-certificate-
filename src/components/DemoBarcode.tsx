import React, { useMemo } from 'react';
import { generateCode128 } from '../utils/barcodeGenerator';

interface DemoBarcodeProps {
  className?: string;
  referenceNumber?: string;
  isInlineEditing?: boolean;
  onBarcodeChange?: (val: string) => void;
  showText?: boolean;
  height?: number;
}

export const DemoBarcode: React.FC<DemoBarcodeProps> = ({
  className = '',
  referenceNumber = '19879318513121621',
  isInlineEditing = false,
  onBarcodeChange,
  showText = false,
  height = 32
}) => {
  const effectiveRef = referenceNumber?.trim() || '19879318513121621';

  // Compute standard Code 128 vector bars
  const barcodeData = useMemo(() => {
    return generateCode128(effectiveRef);
  }, [effectiveRef]);

  return (
    <div 
      id="demo-barcode-container"
      className={`inline-flex flex-col items-end select-none text-right ${className}`}
      title={`Official Code 128 Barcode: ${effectiveRef}`}
    >
      <div className="flex items-center justify-end bg-white/50 p-0.5 rounded">
        {/* Crisp Standard Code 128 Vector Barcode matching official BDRIS Certificate header */}
        <svg 
          viewBox={`0 0 ${barcodeData.totalWidth} ${height}`} 
          style={{ height: `${height}px`, width: 'auto', maxWidth: '140px' }}
          className="text-black overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges"
        >
          {barcodeData.bars.map((bar, idx) => (
            <rect 
              key={idx} 
              x={bar.x} 
              y="0" 
              width={bar.width} 
              height={height} 
              fill="currentColor" 
            />
          ))}
        </svg>
      </div>

      {showText && (
        <span className="text-[9px] font-mono tracking-wider text-slate-800 font-semibold mt-0.5">
          {effectiveRef}
        </span>
      )}

      {isInlineEditing && (
        <input
          type="text"
          value={referenceNumber}
          onChange={(e) => onBarcodeChange?.(e.target.value)}
          className="text-[10px] font-mono text-slate-800 mt-1 font-bold w-32 text-right bg-amber-50/90 border border-amber-400 rounded px-1 py-0"
          title="বারকোড মান পরিবর্তন করুন"
        />
      )}
    </div>
  );
};
