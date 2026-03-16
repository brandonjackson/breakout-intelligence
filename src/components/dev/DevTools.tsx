import { useState, useEffect } from 'react';
import { useEventConfig } from '../../hooks/useEventConfig';
import { useResponseContext } from '../../context/ResponseContext';
import { clearSessionResponses } from '../../hooks/useResponses';
import type { SessionDef, StoredResponse } from '../../lib/types';

export default function DevTools() {
  const [open, setOpen] = useState(false);
  const config = useEventConfig();
  const { invalidate } = useResponseContext();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  const event = config.events[0];
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30">
      <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Dev Tools</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">
            &times;
          </button>
        </div>
        <div className="p-4 space-y-6">
          {event.sessions.map((session) => (
            <SessionDevPanel
              key={session.id}
              eventId={event.id}
              session={session}
              groups={session.groups}
              onMutate={invalidate}
            />
          ))}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">localStorage</h3>
            <LocalStorageViewer />
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionDevPanel({
  eventId,
  session,
  groups,
  onMutate,
}: {
  eventId: string;
  session: SessionDef;
  groups?: { id: string; name: string }[];
  onMutate: () => void;
}) {
  const [count, setCount] = useState(10);
  const [targetGroup, setTargetGroup] = useState<string | 'random'>('random');

  const addMockResponses = () => {
    for (let i = 0; i < count; i++) {
      const slug = `mock-participant-${Date.now()}-${i}`;
      let groupId: string | null = null;

      if (session.type === 'breakout' && groups && groups.length > 0) {
        if (targetGroup === 'random') {
          groupId = groups[Math.floor(Math.random() * groups.length)].id;
        } else {
          groupId = targetGroup;
        }

        // Save group assignment
        const groupKey = `bi:groups:${eventId}:${slug}`;
        const groupData = { [session.id]: groupId };
        localStorage.setItem(groupKey, JSON.stringify(groupData));
      }

      const answers: Record<string, number> = {};
      session.questions.forEach((q) => {
        answers[q.id] = Math.floor(Math.random() * q.likert_labels.length);
      });

      const response: StoredResponse = {
        groupId,
        answers,
        submittedAt: new Date().toISOString(),
      };

      const key = `bi:responses:${eventId}:${session.id}:${slug}`;
      localStorage.setItem(key, JSON.stringify(response));
    }
    onMutate();
  };

  const clearResponses = () => {
    clearSessionResponses(eventId, session.id);
    onMutate();
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">{session.name}</h3>
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-500">Count:</label>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value) || 1)}
          className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
          min={1}
          max={100}
        />
        {session.type === 'breakout' && groups && (
          <>
            <label className="text-xs text-gray-500">Group:</label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="random">Random</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={addMockResponses}
          className="text-xs bg-brand-blue text-white px-3 py-1.5 rounded hover:bg-brand-deep"
        >
          Add Mock Responses
        </button>
        <button
          onClick={clearResponses}
          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
        >
          Clear Responses
        </button>
      </div>
    </div>
  );
}

function LocalStorageViewer() {
  const [expanded, setExpanded] = useState(false);

  const items: { key: string; value: string }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bi:')) {
      items.push({ key, value: localStorage.getItem(key) ?? '' });
    }
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-brand-blue hover:text-brand-deep mb-2"
      >
        {expanded ? 'Hide' : `Show ${items.length} items`}
      </button>
      {expanded && (
        <div className="max-h-48 overflow-y-auto text-xs font-mono bg-gray-50 rounded p-2 space-y-1">
          {items.map((item) => (
            <div key={item.key} className="break-all">
              <span className="text-brand-blue">{item.key}</span>
              <span className="text-gray-400"> = </span>
              <span className="text-gray-600">{item.value}</span>
            </div>
          ))}
          {items.length === 0 && <span className="text-gray-400">No bi: keys found</span>}
        </div>
      )}
    </div>
  );
}
