interface GroupData {
  groupName: string;
  values: number[];
}

interface Props {
  labels: string[];
  groups: GroupData[];
}

const GROUP_COLORS = [
  '#6366f1', // indigo-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

// Mulberry32 seeded PRNG — deterministic across re-renders
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function BoxPlotChart({ labels, groups }: Props) {
  const scaleMin = 1;
  const scaleMax = labels.length;

  const activeGroups = groups.filter((g) => g.values.length > 0);

  if (activeGroups.length === 0) return null;

  const rowHeight = 60;
  const topPadding = 8;
  const bottomPadding = 28;
  const leftPadding = 120;
  const rightPadding = 16;
  const chartHeight = activeGroups.length * rowHeight + topPadding + bottomPadding;

  const smallR = rowHeight * 0.2;   // 40% row height diameter
  const largeR = rowHeight * 0.4;   // 80% row height diameter
  const jitterMag = 0.8 * smallR;   // ±0.8 × smallDotRadius in SVG units

  const toX = (val: number, width: number) => {
    return leftPadding + ((val - scaleMin) / (scaleMax - scaleMin)) * (width - leftPadding - rightPadding);
  };

  const rand = mulberry32(42);

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Group Comparison</h4>
      <svg
        viewBox={`0 0 500 ${chartHeight}`}
        className="w-full"
      >
        {/* Light vertical gridlines at each scale point */}
        {labels.map((_, i) => {
          const x = toX(i + 1, 500);
          return (
            <g key={i}>
              <line
                x1={x} y1={topPadding}
                x2={x} y2={chartHeight - bottomPadding}
                stroke="#e5e7eb" strokeWidth={1}
              />
              <text
                x={x}
                y={chartHeight - bottomPadding + 14}
                textAnchor="middle"
                fontSize={11}
                fill="#6b7280"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Dot plots per group */}
        {activeGroups.map((g, i) => {
          const color = GROUP_COLORS[i % GROUP_COLORS.length];
          const cy = topPadding + i * rowHeight + rowHeight / 2;
          const mean = g.values.reduce((sum, v) => sum + v, 0) / g.values.length;

          return (
            <g key={g.groupName}>
              {/* Group label */}
              <text
                x={leftPadding - 8}
                y={cy + 1}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={12}
                fill="#374151"
              >
                {g.groupName}
              </text>

              {/* Individual response dots with x-axis jitter */}
              {g.values.map((v, j) => {
                const jitter = (rand() - 0.5) * 2 * jitterMag;
                return (
                  <circle
                    key={j}
                    cx={toX(v, 500) + jitter}
                    cy={cy}
                    r={smallR}
                    fill={color}
                    fillOpacity={0.25}
                  />
                );
              })}

              {/* Mean dot with value label */}
              <circle
                cx={toX(mean, 500)}
                cy={cy}
                r={largeR}
                fill={color}
              />
              <text
                x={toX(mean, 500)}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={10}
                fontWeight="bold"
                fill="#ffffff"
              >
                {mean.toFixed(1)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
