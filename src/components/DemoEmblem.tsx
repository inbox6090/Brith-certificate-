import React from 'react';

interface DemoTopEmblemProps {
  size?: number;
  opacity?: number;
  visible?: boolean;
  customUrl?: string;
  className?: string;
}

/**
 * Bangladesh Government Emblem for Union Parishad & Registration header.
 * Supports custom upload, resizing, and opacity/visibility controls.
 */
export const DemoTopEmblem: React.FC<DemoTopEmblemProps> = ({ 
  size = 56, 
  opacity = 100, 
  visible = true, 
  customUrl, 
  className = '' 
}) => {
  if (!visible || opacity <= 0) return null;

  const opacityValue = opacity / 100;

  if (customUrl) {
    return (
      <div 
        className={`inline-flex items-center justify-center relative select-none ${className}`} 
        style={{ width: size, height: size, opacity: opacityValue }}
      >
        <img 
          src={customUrl} 
          alt="Top Logo" 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center justify-center relative select-none ${className}`} 
      style={{ width: size, height: size, opacity: opacityValue }}
      title="Government of the People's Republic of Bangladesh"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Outer Circle (Green) */}
        <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#006a4e" strokeWidth="3.2" />
        
        {/* Inner Red Disc */}
        <circle cx="50" cy="50" r="32" fill="#f42a41" />

        {/* Outer Circular Bangla Text Top */}
        <path id="curve-top" d="M 18,50 A 32,32 0 0,1 82,50" fill="none" />
        <text fontSize="6.8" fontWeight="bold" fill="#006a4e" textAnchor="middle" letterSpacing="0.2">
          <textPath href="#curve-top" startOffset="50%">
            গণপ্রজাতন্ত্রী বাংলাদেশ
          </textPath>
        </text>

        {/* Outer Circular Bangla Text Bottom */}
        <path id="curve-bottom" d="M 82,50 A 32,32 0 0,1 18,50" fill="none" />
        <text fontSize="7" fontWeight="bold" fill="#006a4e" textAnchor="middle">
          <textPath href="#curve-bottom" startOffset="50%">
            ★ সরকার ★
          </textPath>
        </text>

        {/* Center Shapla (Water Lily) and Paddy Sheaves in Gold/White */}
        {/* Water waves */}
        <path d="M28 63 Q 39 60, 50 63 T 72 63" stroke="#ffffff" strokeWidth="1.5" fill="none" />
        <path d="M32 67 Q 41 64, 50 67 T 68 67" stroke="#ffffff" strokeWidth="1.5" fill="none" />

        {/* Water lily petals (Shapla) */}
        <path d="M 50 34 C 47 42, 47 54, 50 56 C 53 54, 53 42, 50 34 Z" fill="#ffffff" />
        <path d="M 50 42 C 43 45, 38 52, 42 57 C 46 57, 48 50, 50 46 Z" fill="#ffffff" />
        <path d="M 50 42 C 57 45, 62 52, 58 57 C 54 57, 52 50, 50 46 Z" fill="#ffffff" />

        {/* Top 4 Stars */}
        <circle cx="36" cy="30" r="2.2" fill="#ffd700" />
        <circle cx="43" cy="27" r="2.2" fill="#ffd700" />
        <circle cx="57" cy="27" r="2.2" fill="#ffd700" />
        <circle cx="64" cy="30" r="2.2" fill="#ffd700" />
      </svg>
    </div>
  );
};

interface DemoBackgroundWatermarkProps {
  size?: number;
  opacity?: number;
  visible?: boolean;
  customUrl?: string;
}

/**
 * Clean authentic background watermark seal with Registrar General circular text & mother/child motif
 * Exactly matching BDRIS certificate page 1.
 * Supports custom uploaded image, sizing, and opacity/visibility controls.
 */
export const DemoBackgroundWatermark: React.FC<DemoBackgroundWatermarkProps> = ({
  size = 420,
  opacity = 20,
  visible = true,
  customUrl
}) => {
  if (!visible || opacity <= 0) return null;

  const opacityValue = opacity / 100;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none z-0">
      {customUrl ? (
        <div 
          className="relative flex items-center justify-center transition-all"
          style={{ width: size, height: size, opacity: opacityValue }}
        >
          <img 
            src={customUrl} 
            alt="Watermark" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <div 
          className="rounded-full relative flex items-center justify-center transition-all"
          style={{ width: size, height: size, opacity: opacityValue }}
        >
          <svg viewBox="0 0 300 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Circular textured borders */}
            <circle cx="150" cy="150" r="142" fill="none" stroke="#006a4e" strokeWidth="3" strokeDasharray="5 3" opacity="0.8" />
            <circle cx="150" cy="150" r="132" fill="none" stroke="#006a4e" strokeWidth="2.5" opacity="0.9" />
            <circle cx="150" cy="150" r="98" fill="none" stroke="#006a4e" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

            {/* Curved Bengali Circular Watermark Text */}
            <path id="bg-curve-top" d="M 32,150 A 118,118 0 0,1 268,150" fill="none" />
            <text fontSize="13.5" fontWeight="bold" fill="#006a4e" textAnchor="middle" letterSpacing="2.5" fontFamily="'Noto Sans Bengali', sans-serif">
              <textPath href="#bg-curve-top" startOffset="50%">
                রেজিস্ট্রার জেনারেলের কার্যালয়
              </textPath>
            </text>

            <path id="bg-curve-bottom" d="M 268,150 A 118,118 0 0,1 32,150" fill="none" />
            <text fontSize="13" fontWeight="bold" fill="#006a4e" textAnchor="middle" letterSpacing="2.5" fontFamily="'Noto Sans Bengali', sans-serif">
              <textPath href="#bg-curve-bottom" startOffset="50%">
                জন্ম ও মৃত্যু নিবন্ধন, স্থানীয় সরকার বিভাগ
              </textPath>
            </text>

            {/* Central Mother & Child Motif (Soft rose / salmon pink matching BDRIS watermark) */}
            <circle cx="150" cy="150" r="74" fill="#fda4af" opacity="0.45" />
            
            {/* Mother silhouette */}
            <circle cx="130" cy="128" r="17" fill="#f43f5e" opacity="0.6" />
            <path d="M 108 178 C 108 145, 142 138, 150 178 Z" fill="#f43f5e" opacity="0.6" />

            {/* Child silhouette in mother's arms */}
            <circle cx="164" cy="138" r="12" fill="#fb7185" opacity="0.75" />
            <path d="M 152 178 C 150 152, 178 148, 180 178 Z" fill="#fb7185" opacity="0.75" />

            {/* Caring arms curve */}
            <path d="M 124 160 Q 146 174, 168 158" stroke="#f43f5e" strokeWidth="4" fill="none" opacity="0.7" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

