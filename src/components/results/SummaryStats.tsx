import { mean, median, standardDeviation } from '../../lib/stats';

interface Props {
  values: number[];
}

export default function SummaryStats({ values }: Props) {
  if (values.length === 0) {
    return <p className="text-sm text-gray-400">No responses yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">
        Mean: {mean(values).toFixed(2)}
      </span>
      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">
        Median: {median(values).toFixed(1)}
      </span>
      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">
        SD: {standardDeviation(values).toFixed(2)}
      </span>
      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-700">
        n: {values.length}
      </span>
    </div>
  );
}
