import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { gaussianKDE } from '../../lib/stats';

interface Props {
  values: number[];
  min: number;
  max: number;
}

export default function KDEOverlay({ values, min, max }: Props) {
  if (values.length < 15) return null;

  const kdeData = gaussianKDE(values, undefined, 100);

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-1">
        Estimated Distribution
      </h4>
      <p className="text-xs text-gray-400 mb-2">Kernel density estimate (n={values.length})</p>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={kdeData} margin={{ left: 0, right: 0, top: 5, bottom: 5 }}>
          <XAxis dataKey="x" type="number" domain={[min, max]} tick={{ fontSize: 11 }} />
          <YAxis hide />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
