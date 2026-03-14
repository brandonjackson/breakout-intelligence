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
