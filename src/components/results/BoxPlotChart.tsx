import { boxPlotStats } from '../../lib/stats';

interface GroupData {
  groupName: string;
  values: number[];
}

interface Props {
  labels: string[];
  groups: GroupData[];
}

const BOX_COLOR = '#6366f1'; // indigo-500
const MEDIAN_COLOR = '#ffffff';
const WHISKER_COLOR = '#4b5563'; // gray-600

export default function BoxPlotChart({ labels, groups }: Props) {
  const n = labels.length;
  const scaleMin = 1;
  const scaleMax = n;

  // Filter groups that have data
  const activeGroups = groups
    .map((g) => ({ ...g, stats: boxPlotStats(g.values) }))
    .filter((g) => g.stats !== null);

  if (activeGroups.length === 0) return null;

  const rowHeight = 40;
  const topPadding = 8;
  const bottomPadding = 36;
  const leftPadding = 120;
  const rightPadding = 48;
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

        {/* Box plots per group */}
        {activeGroups.map((g, i) => {
          const stats = g.stats!;
          const cy = topPadding + i * rowHeight + rowHeight / 2;
          const boxH = 20;

          const xWhiskerLow = toX(stats.whiskerLow, 500);
          const xWhiskerHigh = toX(stats.whiskerHigh, 500);
          const xQ1 = toX(stats.q1, 500);
          const xQ3 = toX(stats.q3, 500);
          const xMedian = toX(stats.median, 500);

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

              {/* Whisker line */}
              <line
                x1={xWhiskerLow} y1={cy}
                x2={xWhiskerHigh} y2={cy}
                stroke={WHISKER_COLOR} strokeWidth={1.5}
              />

              {/* Whisker caps */}
              <line
                x1={xWhiskerLow} y1={cy - boxH / 4}
                x2={xWhiskerLow} y2={cy + boxH / 4}
                stroke={WHISKER_COLOR} strokeWidth={1.5}
              />
              <line
                x1={xWhiskerHigh} y1={cy - boxH / 4}
                x2={xWhiskerHigh} y2={cy + boxH / 4}
                stroke={WHISKER_COLOR} strokeWidth={1.5}
              />

              {/* IQR box */}
              <rect
                x={xQ1}
                y={cy - boxH / 2}
                width={Math.max(xQ3 - xQ1, 1)}
                height={boxH}
                fill={BOX_COLOR}
                fillOpacity={0.7}
                rx={3}
              />

              {/* Median line */}
              <line
                x1={xMedian} y1={cy - boxH / 2}
                x2={xMedian} y2={cy + boxH / 2}
                stroke={MEDIAN_COLOR} strokeWidth={2}
              />

              {/* Sample size */}
              <text
                x={500 - rightPadding + 8}
                y={cy + 1}
                dominantBaseline="middle"
                fontSize={10}
                fill="#9ca3af"
              >
                n={g.values.length}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
