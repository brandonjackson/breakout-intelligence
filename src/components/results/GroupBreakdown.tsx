import { useState } from 'react';
import type { GroupDef } from '../../lib/types';
import ResponseHistogram from './ResponseHistogram';

interface GroupValues {
  group: GroupDef;
  values: number[];
}

interface Props {
  labels: string[];
  groups: GroupValues[];
}

export default function GroupBreakdown({ labels, groups }: Props) {
  const sorted = [...groups].sort((a, b) => a.group.name.localeCompare(b.group.name));

  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-2">Group Breakdown</h4>
      <div className="space-y-2">
        {sorted.map((g) => (
          <GroupAccordion key={g.group.id} group={g} labels={labels} />
        ))}
      </div>
    </div>
  );
}

function GroupAccordion({ group, labels }: { group: GroupValues; labels: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left"
      >
        <span className="text-sm font-medium text-gray-800">
          {group.group.name}{' '}
          <span className="text-gray-400 font-normal">(n={group.values.length})</span>
        </span>
        <span className="text-gray-400 text-sm">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          {group.values.length > 0 ? (
            <ResponseHistogram labels={labels} values={group.values} />
          ) : (
            <p className="text-sm text-gray-400">No responses in this group.</p>
          )}
        </div>
      )}
    </div>
  );
}
