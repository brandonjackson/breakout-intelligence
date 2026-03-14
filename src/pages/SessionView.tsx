import { useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { useSlug } from '../hooks/useSlug';
import { useResponses } from '../hooks/useResponses';
import { useResponseContext } from '../context/ResponseContext';
import SessionHeader from '../components/layout/SessionHeader';
import GroupSelector from '../components/survey/GroupSelector';
import SurveyForm from '../components/survey/SurveyForm';

export default function SessionView() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const slugResult = useSlug();
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const { invalidate } = useResponseContext();

  // Must call hooks unconditionally
  const eventId = slugResult.found ? slugResult.event.id : '';
  const slug = slugResult.slug ?? '';
  const { getResponse, saveResponse, getGroupAssignment, setGroupAssignment } =
    useResponses(eventId, slug);

  if (!slugResult.found) return <Navigate to="/" />;

  const { event } = slugResult;

  if (event.status === 'finished') return <Navigate to={`/invite/${slug}`} />;

  const session = event.sessions.find((s) => s.id === sessionId);
  if (!session) return <Navigate to={`/invite/${slug}`} />;

  if (session.status === 'closed') {
    return <Navigate to={`/invite/${slug}/session/${sessionId}/results`} />;
  }

  const groupId = session.type === 'breakout' ? getGroupAssignment(session.id) : null;
  const needsGroup = session.type === 'breakout' && !groupId && !showGroupSelector;
  const showingGroupPicker = session.type === 'breakout' && (!groupId || showGroupSelector);

  const existingResponse = getResponse(session.id);
  const groupName = groupId
    ? session.groups?.find((g) => g.id === groupId)?.name ?? null
    : null;

  const handleGroupSelect = (gId: string) => {
    setGroupAssignment(session.id, gId);
    setShowGroupSelector(false);
  };

  const handleSubmit = (answers: Record<string, number>) => {
    const currentGroupId = session.type === 'breakout' ? getGroupAssignment(session.id) : null;
    saveResponse(session.id, {
      groupId: currentGroupId,
      answers,
      submittedAt: new Date().toISOString(),
    });
    invalidate();
  };

  if (needsGroup || showingGroupPicker) {
    return (
      <div>
        <SessionHeader session={session} />
        <GroupSelector
          groups={session.groups ?? []}
          currentGroupId={groupId}
          onSelect={handleGroupSelect}
        />
      </div>
    );
  }

  return (
    <div>
      <SessionHeader
        session={session}
        groupName={groupName}
        onChangeGroup={session.type === 'breakout' ? () => setShowGroupSelector(true) : undefined}
      />
      <SurveyForm
        questions={session.questions}
        initialAnswers={existingResponse?.answers}
        isUpdate={!!existingResponse}
        onSubmit={handleSubmit}
      />
      {existingResponse && (
        <div className="mt-4 text-center">
          <Link
            to={`/invite/${slug}/session/${session.id}/results`}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View Results
          </Link>
        </div>
      )}
    </div>
  );
}
