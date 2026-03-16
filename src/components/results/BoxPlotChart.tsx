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

export default function BoxPlotChart({ labels, groups }: Props) {
  const n = labels.length;
  const scaleMin = 1;
  const scaleMax = n;

  const activeGroups = groups.filter((g) => g.values.length > 0);

  if (activeGroups.length === 0) return null;

  const rowHeight = 40;
  const topPadding = 8;
  const bottomPadding = 36;
  const leftPadding = 120;
  const rightPadding = 16;
  const chartHeight = activeGroups.length * rowHeight + topPadding + bottomPadding;

  const toX = (val: number, width: number) => {
    return leftPadding + ((val - scaleMin) / (scaleMax - scaleMin)) * (width - leftPadding - rightPadding);
  };

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Group Comparison</h4>
      <svg
        viewBox={`0 0 500 ${chartHeight}`}
        className="w-full"
        style={{ maxHeight: chartHeight }}
      >
        {/* X-axis tick marks and labels */}
        {labels.map((label, i) => {
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
                fontSize={9}
                fill="#6b7280"
              >
                {label.length > 14 ? label.slice(0, 12) + '…' : label}
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
                fontSize={11}
                fill="#374151"
              >
                {g.groupName}
              </text>

              {/* Individual vote dots */}
              {g.values.map((v, j) => (
                <circle
                  key={j}
                  cx={toX(v, 500)}
                  cy={cy}
                  r={4}
                  fill={color}
                  fillOpacity={0.3}
                />
              ))}

              {/* Mean dot */}
              <circle
                cx={toX(mean, 500)}
                cy={cy}
                r={7}
                fill={color}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
