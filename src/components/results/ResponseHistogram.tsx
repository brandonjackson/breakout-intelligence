import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
} from 'recharts';
import { likertColors } from '../../lib/colors';
import { mean as calcMean, median as calcMedian } from '../../lib/stats';

interface Props {
  labels: string[];
  values: number[]; // one value per response (1-indexed)
  title?: string;
}

export default function ResponseHistogram({ labels, values, title }: Props) {
  const colors = likertColors(labels.length);

  // Count responses per option (1-indexed values)
  const counts = labels.map((_, i) => values.filter((v) => v === i + 1).length);
  const data = labels.map((label, i) => ({ label, count: counts[i] }));

  const avg = calcMean(values);
  const med = calcMedian(values);

  return (
    <div className="mb-4">
      {title && <h4 className="text-sm font-semibold text-gray-700 mb-2">{title}</h4>}
      <ResponsiveContainer width="100%" height={labels.length * 44 + 20}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 40, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" allowDecimals={false} />
          <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 12 }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
            <LabelList dataKey="count" position="right" style={{ fontSize: 12, fill: '#374151' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-3 text-xs text-gray-500 mt-1">
        <span>Mean: {avg.toFixed(1)}</span>
        <span>Median: {med.toFixed(1)}</span>
      </div>
    </div>
  );
}
