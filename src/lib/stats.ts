export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((v) => (v - avg) ** 2);
  return Math.sqrt(squareDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

export interface BoxPlotStats {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  whiskerLow: number;
  whiskerHigh: number;
}

export function boxPlotStats(values: number[]): BoxPlotStats | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  const q = (p: number): number => {
    const pos = p * (n - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  };

  const q1 = q(0.25);
  const med = q(0.5);
  const q3 = q(0.75);
  const iqr = q3 - q1;

  const whiskerLow = Math.max(sorted[0], q1 - 1.5 * iqr);
  const whiskerHigh = Math.min(sorted[n - 1], q3 + 1.5 * iqr);

  return {
    min: sorted[0],
    q1,
    median: med,
    q3,
    max: sorted[n - 1],
    whiskerLow,
    whiskerHigh,
  };
}

export function gaussianKDE(
  values: number[],
  bandwidth?: number,
  points: number = 100
): { x: number; y: number }[] {
  if (values.length === 0) return [];
  const n = values.length;
  const sd = standardDeviation(values);
  const h = bandwidth ?? 1.06 * (sd || 1) * Math.pow(n, -0.2);

  const min = Math.min(...values);
  const max = Math.max(...values);
  const step = (max - min) / (points - 1) || 1 / (points - 1);

  const result: { x: number; y: number }[] = [];
  for (let i = 0; i < points; i++) {
    const x = min + i * step;
    let density = 0;
    for (const v of values) {
      const z = (x - v) / h;
      density += Math.exp(-0.5 * z * z) / (h * Math.sqrt(2 * Math.PI));
    }
    density /= n;
    result.push({ x, y: density });
  }
  return result;
}
