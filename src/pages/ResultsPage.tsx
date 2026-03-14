import { useParams, Navigate, Link } from 'react-router-dom';
import { useSlug } from '../hooks/useSlug';
import SessionHeader from '../components/layout/SessionHeader';
import ResultsDashboard from '../components/results/ResultsDashboard';

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const slugResult = useSlug();

  if (!slugResult.found) return <Navigate to="/" />;

  const { event, slug } = slugResult;
  const session = event.sessions.find((s) => s.id === sessionId);

  if (!session) return <Navigate to={`/invite/${slug}`} />;

  return (
    <div>
      <SessionHeader session={session} />
      <div className="flex gap-3 mb-6">
        <Link
          to={`/invite/${slug}`}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          Back to Sessions
        </Link>
        {session.status === 'open' && (
          <Link
            to={`/invite/${slug}/session/${session.id}`}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Answer Questions
          </Link>
        )}
      </div>
      <ResultsDashboard eventId={event.id} session={session} />
    </div>
  );
}
