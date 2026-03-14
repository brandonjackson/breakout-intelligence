import { likertColors } from '../../lib/colors';

interface GroupData {
  groupName: string;
  counts: number[]; // count per Likert option
}

interface Props {
  labels: string[];
  groups: GroupData[];
}

export default function DivergingBar({ labels, groups }: Props) {
  const n = labels.length;
  const colors = likertColors(n);
  const midpoint = n / 2;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Diverging Comparison</h4>
      <div className="space-y-2">
        {groups.map((group) => {
          const total = group.counts.reduce((s, c) => s + c, 0);
          if (total === 0) return null;

          // Calculate percentages
          const pcts = group.counts.map((c) => (c / total) * 100);

          // Split into negative and positive
          const negPcts = pcts.slice(0, Math.floor(midpoint));
          const posPcts = pcts.slice(Math.ceil(midpoint));
          const neutralPct = n % 2 !== 0 ? pcts[Math.floor(midpoint)] : 0;

          const negTotal = negPcts.reduce((s, p) => s + p, 0);
          const posTotal = posPcts.reduce((s, p) => s + p, 0);

          return (
            <div key={group.groupName} className="flex items-center gap-2">
              <span className="text-xs text-gray-600 w-28 text-right truncate flex-shrink-0">
                {group.groupName}
              </span>
              <div className="flex-1 flex h-7 rounded overflow-hidden">
                {/* Negative side */}
                <div className="flex justify-end" style={{ width: '50%' }}>
                  {negPcts.map((pct, i) => (
                    <div
                      key={`neg-${i}`}
                      style={{
                        width: `${negTotal > 0 ? (pct / 50) * 100 : 0}%`,
                        backgroundColor: colors[i],
                      }}
                    />
                  ))}
                  {n % 2 !== 0 && (
                    <div
                      style={{
                        width: `${(neutralPct / 2 / 50) * 100}%`,
                        backgroundColor: colors[Math.floor(midpoint)],
                      }}
                    />
                  )}
                </div>
                {/* Positive side */}
                <div className="flex" style={{ width: '50%' }}>
                  {n % 2 !== 0 && (
                    <div
                      style={{
                        width: `${(neutralPct / 2 / 50) * 100}%`,
                        backgroundColor: colors[Math.floor(midpoint)],
                      }}
                    />
                  )}
                  {posPcts.map((pct, i) => (
                    <div
                      key={`pos-${i}`}
                      style={{
                        width: `${posTotal > 0 ? (pct / 50) * 100 : 0}%`,
                        backgroundColor: colors[Math.ceil(midpoint) + i],
                      }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-gray-500 w-8 flex-shrink-0">n={total}</span>
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-2">
        {labels.map((label, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors[i] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
