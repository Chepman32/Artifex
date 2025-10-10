import { ImageFilter } from '../types';

// Identity matrix for color transforms
const IDENTITY_MATRIX: readonly number[] = [
  1, 0, 0, 0, 0, //
  0, 1, 0, 0, 0, //
  0, 0, 1, 0, 0, //
  0, 0, 0, 1, 0,
];

// Clamp helper to keep intensity within a safe range
const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Base matrices tuned for each supported filter type.
// Values stay within the expected Skia range to avoid clipping when exporting.
const BASE_FILTER_MATRICES: Partial<Record<ImageFilter['type'], readonly number[]>> = {
  bw: [
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0.299, 0.587, 0.114, 0, 0,
    0, 0, 0, 1, 0,
  ],
  sepia: [
    0.5751, 0.5383, 0.1323, 0, 0.018,
    0.2443, 0.7802, 0.1176, 0, 0.008,
    0.1904, 0.3738, 0.3917, 0, -0.012,
    0, 0, 0, 1, 0,
  ],
  vintage: [
    0.9, 0.2, 0.0, 0, 0,
    0.05, 0.85, 0.1, 0, 0,
    0.05, 0.25, 0.8, 0, 0,
    0, 0, 0, 1, 0,
  ],
  cool: [
    0.8, 0.1, 0.0, 0, 0,
    0.05, 0.9, 0.05, 0, 0,
    0.0, 0.2, 1.1, 0, 0,
    0, 0, 0, 1, 0,
  ],
  warm: [
    1.1, 0.05, 0.0, 0, 0,
    0.05, 1.0, 0.0, 0, 0,
    0.0, 0.1, 0.9, 0, 0,
    0, 0, 0, 1, 0,
  ],
};

const mixMatrices = (from: readonly number[], to: readonly number[], amount: number): number[] => {
  const result: number[] = new Array(from.length);
  for (let i = 0; i < from.length; i += 1) {
    const start = from[i];
    const end = to[i];
    result[i] = start + (end - start) * amount;
  }
  return result;
};

export const getFilterColorMatrix = (filter?: ImageFilter | null): number[] | null => {
  if (!filter || filter.type === 'none') {
    return null;
  }

  const baseMatrix = BASE_FILTER_MATRICES[filter.type];
  if (!baseMatrix) {
    return null;
  }

  const intensity = clamp(filter.intensity ?? 1, 0, 1);
  if (intensity <= 0) {
    return Array.from(IDENTITY_MATRIX);
  }

  if (intensity >= 1) {
    return Array.from(baseMatrix);
  }

  return mixMatrices(IDENTITY_MATRIX, baseMatrix, intensity);
};
