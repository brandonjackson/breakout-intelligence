import type { SessionDef } from '../../lib/types';

interface Props {
  session: SessionDef;
  groupName?: string | null;
  onChangeGroup?: () => void;
}

export default function SessionHeader({ session, groupName, onChangeGroup }: Props) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-bold text-gray-900">{session.name}</h1>
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            session.type === 'plenary'
              ? 'bg-indigo-100 text-indigo-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {session.type === 'plenary' ? 'Plenary' : 'Breakout'}
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            session.status === 'open'
              ? 'bg-green-100 text-green-700'
              : session.status === 'closed'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-yellow-100 text-yellow-700'
          }`}
        >
          {session.status}
        </span>
        {groupName && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
            {groupName}
            {onChangeGroup && (
              <button onClick={onChangeGroup} className="underline ml-1 text-blue-600">
                change
              </button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
