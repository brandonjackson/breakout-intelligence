import { Link } from 'react-router-dom';
import { useSlug } from '../hooks/useSlug';

export default function EventHome() {
  const slugResult = useSlug();

  if (!slugResult.found) {
    return (
      <div className="text-center py-16">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Invite Link</h1>
        <p className="text-gray-600">
          This invite link isn't valid. Check with your workshop organiser.
        </p>
      </div>
    );
  }

  const { event, slug } = slugResult;

  if (event.status === 'finished') {
    return (
      <div className="text-center py-16">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{event.name}</h1>
        <p className="text-gray-600">This event has ended. Thanks for participating.</p>
      </div>
    );
  }

  const visibleSessions = event.sessions
    .filter((s) => s.status !== 'draft')
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">Welcome, {slug}</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{event.name}</h1>
      <p className="text-gray-600 mb-6">{event.description}</p>

      <h2 className="text-lg font-semibold text-gray-900 mb-3">Sessions</h2>
      <div className="space-y-3">
        {visibleSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{session.name}</p>
              <div className="flex gap-2 mt-1">
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
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {session.status}
                </span>
              </div>
            </div>
            {session.status === 'open' ? (
              <Link
                to={`/invite/${slug}/session/${session.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
              >
                Join
              </Link>
            ) : (
              <Link
                to={`/invite/${slug}/session/${session.id}/results`}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                View Results
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
