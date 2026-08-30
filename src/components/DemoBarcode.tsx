import React from 'react';

interface DemoBarcodeProps {
  className?: string;
  referenceNumber?: string;
  isInlineEditing?: boolean;
  onBarcodeChange?: (val: string) => void;
}

export const DemoBarcode: React.FC<DemoBarcodeProps> = ({
  className = '',
  referenceNumber = '19879318513121621',
  isInlineEditing = false,
  onBarcodeChange
}) => {
  // Generate deterministic bar widths based on reference number
  const bars = React.useMemo(() => {
    const raw = (referenceNumber || '19879318513121621').replace(/\D/g, '') || '19879318513121621';
    const result: { x: number; width: number }[] = [];
    let currentX = 0;

    // Start pattern
    result.push({ x: currentX, width: 2 });
    currentX += 4;
    result.push({ x: currentX, width: 1.5 });
    currentX += 3;
    result.push({ x: currentX, width: 3 });
    currentX += 5;

    // Digits pattern
    for (let i = 0; i < raw.length; i++) {
      const digit = parseInt(raw[i], 10) || 1;
      const w1 = (digit % 3) * 0.8 + 1.2;
      const w2 = ((digit + 1) % 4) * 0.7 + 1.0;
      const gap1 = ((digit + 2) % 3) * 0.8 + 1.5;
      const gap2 = ((digit + 3) % 4) * 0.7 + 1.8;

      result.push({ x: currentX, width: w1 });
      currentX += w1 + gap1;
      result.push({ x: currentX, width: w2 });
      currentX += w2 + gap2;
    }

    // Stop pattern
    result.push({ x: currentX, width: 3 });
    currentX += 5;
    result.push({ x: currentX, width: 1.5 });
    currentX += 3;
    result.push({ x: currentX, width: 2 });
    currentX += 2;

    return { bars: result, totalWidth: currentX };
  }, [referenceNumber]);

  return (
    <div 
      id="demo-barcode-container"
      className={`inline-flex flex-col items-end select-none text-right ${className}`}
      title={`Barcode: ${referenceNumber}`}
    >
      <div className="flex items-center justify-end">
        {/* SVG Vector Barcode Lines matching official BDRIS page 1 */}
        <svg 
          viewBox={`0 0 ${Math.max(bars.totalWidth, 160)} 38`} 
          className="w-32 h-8 text-black"
          xmlns="http://www.w3.org/2000/svg"
        >
          {bars.bars.map((bar, idx) => (
            <rect 
              key={idx} 
              x={bar.x} 
              y="0" 
              width={bar.width} 
              height="38" 
              fill="currentColor" 
            />
          ))}
        </svg>
      </div>

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

