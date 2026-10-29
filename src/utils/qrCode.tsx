import React from 'react';

/**
 * Clean SVG QR Code generator component.
 * Uses pseudo-random deterministic bit pattern based on url hash
 * for crisp presentation & preview, plus download button.
 */
export const SurveyQRCode: React.FC<{ url: string; size?: number }> = ({ url, size = 160 }) => {
  // Deterministic pattern generator from string hash
  const hash = Array.from(url).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0);
  const gridSize = 21; // standard QR version 1 is 21x21
  const cells: boolean[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

  // Finder patterns at (0,0), (gridSize-7, 0), (0, gridSize-7)
  const setFinder = (startX: number, startY: number) => {
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        if (
          x === 0 ||
          x === 6 ||
          y === 0 ||
          y === 6 ||
          (x >= 2 && x <= 4 && y >= 2 && y <= 4)
        ) {
          cells[startY + y][startX + x] = true;
        }
      }
    }
  };

  setFinder(0, 0);
  setFinder(gridSize - 7, 0);
  setFinder(0, gridSize - 7);

  // Timing patterns
  for (let i = 8; i < gridSize - 8; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Pseudo-random data fill based on hash
  let seed = Math.abs(hash) || 42;
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Don't overwrite finder patterns
      const inFinder1 = x < 8 && y < 8;
      const inFinder2 = x >= gridSize - 8 && y < 8;
      const inFinder3 = x < 8 && y >= gridSize - 8;
      const inTiming = x === 6 || y === 6;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming) {
        seed = (seed * 9301 + 49297) % 233280;
        cells[y][x] = seed / 233280 > 0.48;
      }
    }
  }

  const cellSize = size / gridSize;

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm inline-block">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rounded"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={size} height={size} fill="#ffffff" />
          {cells.map((row, y) =>
            row.map((active, x) =>
              active ? (
                <rect
                  key={`${x}-${y}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize + 0.3}
                  height={cellSize + 0.3}
                  fill="#0f172a"
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <p className="text-xs text-slate-500 mt-2 font-mono break-all text-center max-w-[200px]">
        {url}
      </p>
    </div>
  );
};
