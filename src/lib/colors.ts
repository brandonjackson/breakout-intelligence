// Diverging color ramp for Likert scales
// From warm (negative) through neutral to cool (positive)
const RAMP_5 = ['#dc2626', '#F2B104', '#a3a3a3', '#2951FF', '#1F800F'];
const RAMP_4 = ['#dc2626', '#F2B104', '#2951FF', '#1F800F'];
const RAMP_3 = ['#dc2626', '#a3a3a3', '#1F800F'];

export function likertColors(n: number): string[] {
  if (n === 3) return RAMP_3;
  if (n === 4) return RAMP_4;
  if (n === 5) return RAMP_5;

  // Generate for arbitrary N
  const colors: string[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    if (t < 0.25) colors.push(interpolateHex('#dc2626', '#F2B104', t / 0.25));
    else if (t < 0.5) colors.push(interpolateHex('#F2B104', '#a3a3a3', (t - 0.25) / 0.25));
    else if (t < 0.75) colors.push(interpolateHex('#a3a3a3', '#2951FF', (t - 0.5) / 0.25));
    else colors.push(interpolateHex('#2951FF', '#1F800F', (t - 0.75) / 0.25));
  }
  return colors;
}

function interpolateHex(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}
