/**
 * Code 128 Barcode Generator Utility
 * 
 * Standard Code 128 (Sets B and C) vector barcode generator.
 * Encodes alphanumeric and numeric reference IDs into precise SVG / binary bar patterns
 * conforming to ISO/IEC 15417 standards used in official identity and registration documents.
 */

// 107 Standard Code 128 Patterns (b1, s1, b2, s2, b3, s3)
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", // 0-9
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", // 10-19
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", // 20-29
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", // 30-39
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", // 40-49
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", // 50-59
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", // 60-69
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", // 70-79
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", // 80-89
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", // 90-99
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112" // 100-106 (106 is Stop)
];

const START_B = 104;
const START_C = 105;
const STOP = 106;

export interface BarcodeBar {
  x: number;
  width: number;
}

export interface BarcodeRenderResult {
  bars: BarcodeBar[];
  totalWidth: number;
  encodedString: string;
  checksum: number;
}

/**
 * Encodes text into Code 128 barcode format.
 * Automatically chooses Code C for even-length numeric strings (e.g. 17-digit BRN),
 * or Code B for alphanumeric reference codes.
 */
export function generateCode128(text: string): BarcodeRenderResult {
  const clean = text ? text.trim() : '19879318513121621';
  const isPureDigits = /^\d+$/.test(clean);
  
  const codes: number[] = [];
  let checksumSum = 0;

  if (isPureDigits && clean.length >= 4) {
    // If odd number of digits, pad or start with B then switch
    // For standard 17-digit BRN, let's use Code C with first 16 digits as 8 pairs and last as Code B
    // Or full Code B / hybrid
    if (clean.length % 2 === 0) {
      // Pure Code C
      codes.push(START_C);
      checksumSum += START_C;
      for (let i = 0; i < clean.length; i += 2) {
        const pair = parseInt(clean.substring(i, i + 2), 10);
        codes.push(pair);
      }
    } else {
      // 17 digits: Start C, encode first 16 in pairs (8 pairs), switch to B (code 100), encode last digit
      codes.push(START_C);
      checksumSum += START_C;
      for (let i = 0; i < clean.length - 1; i += 2) {
        const pair = parseInt(clean.substring(i, i + 2), 10);
        codes.push(pair);
      }
      // Code to switch to Code B is 100
      codes.push(100);
      const lastChar = clean.charCodeAt(clean.length - 1) - 32;
      codes.push(lastChar);
    }
  } else {
    // Standard Code B for alphanumeric reference IDs (e.g. DEMO-20260829-0001)
    codes.push(START_B);
    checksumSum += START_B;
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i) - 32;
      codes.push(Math.max(0, Math.min(95, code)));
    }
  }

  // Calculate Checksum Modulo 103
  // Checksum formula: (StartCode + Sum(Code_i * i)) % 103 for i = 1..n
  let weightedSum = codes[0];
  for (let i = 1; i < codes.length; i++) {
    weightedSum += codes[i] * i;
  }
  const checksum = weightedSum % 103;
  codes.push(checksum);
  codes.push(STOP);

  // Convert codes into physical bar coordinates
  const moduleWidth = 1.4; // 1 unit width in px
  const quietZone = 6 * moduleWidth; // Quiet margin
  let currentX = quietZone;
  const bars: BarcodeBar[] = [];

  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
    let isBar = true;
    for (let j = 0; j < pattern.length; j++) {
      const w = parseInt(pattern[j], 10) * moduleWidth;
      if (isBar) {
        bars.push({
          x: currentX,
          width: w
        });
      }
      currentX += w;
      isBar = !isBar;
    }
  }

  // Add trailing quiet zone
  currentX += quietZone;

  return {
    bars,
    totalWidth: currentX,
    encodedString: clean,
    checksum
  };
}
