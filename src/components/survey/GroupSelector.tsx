import { useState } from 'react';
import type { GroupDef } from '../../lib/types';

interface Props {
  groups: GroupDef[];
  currentGroupId: string | null;
  onSelect: (groupId: string) => void;
}

export default function GroupSelector({ groups, currentGroupId, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(currentGroupId);

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose your group</h2>
      <p className="text-sm text-gray-500 mb-4">Select the breakout group you're joining for this session.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelected(group.id)}
            className={`min-h-[56px] px-4 py-3 rounded-lg border-2 text-left font-medium transition-all ${
              selected === group.id
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>
      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        className="mt-4 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors"
      >
        Join Group
      </button>
    </div>
  );
}
