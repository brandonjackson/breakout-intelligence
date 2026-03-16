import { useState } from 'react';
import type { SessionDef, QuestionDef } from '../../lib/types';
import { getAllResponses } from '../../hooks/useResponses';
import { useResponseContext } from '../../context/ResponseContext';
import ResponseHistogram from './ResponseHistogram';
import BoxPlotChart from './BoxPlotChart';
import SummaryStats from './SummaryStats';
import GroupBreakdown from './GroupBreakdown';

interface Props {
  eventId: string;
  session: SessionDef;
}

export default function ResultsDashboard({ eventId, session }: Props) {
  // Subscribe to changes
  useResponseContext();

  const allResponses = getAllResponses(eventId, session.id);

  if (allResponses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No responses yet for this session.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {session.questions.map((question) => (
        <QuestionResults
          key={question.id}
          question={question}
          session={session}
          allResponses={allResponses}
        />
      ))}
    </div>
  );
}

function QuestionResults({
  question,
  session,
  allResponses,
}: {
  question: QuestionDef;
  session: SessionDef;
  allResponses: ReturnType<typeof getAllResponses>;
}) {

  // Collect all values for this question (convert 0-indexed stored value to 1-indexed)
  const allValues = allResponses
    .filter((r) => r.response.answers[question.id] !== undefined)
    .map((r) => r.response.answers[question.id] + 1);

  // Group-level data for breakout sessions
  const groupData =
    session.type === 'breakout' && session.groups
      ? session.groups.map((group) => {
          const groupValues = allResponses
            .filter(
              (r) =>
                r.response.groupId === group.id &&
                r.response.answers[question.id] !== undefined
            )
            .map((r) => r.response.answers[question.id] + 1);

          const counts = question.likert_labels.map(
            (_, i) => groupValues.filter((v) => v === i + 1).length
          );

          return {
            group,
            values: groupValues,
            counts,
          };
        })
      : [];

  // Box plot data for inter-group comparison
  const boxPlotGroups =
    session.type === 'breakout'
      ? groupData.map((g) => ({ groupName: g.group.name, values: g.values }))
      : [{ groupName: 'All', values: allValues }];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">{question.prompt}</h3>

      <div className="lg:grid lg:grid-cols-2 lg:gap-6">
        <div>
          <ResponseHistogram labels={question.likert_labels} values={allValues} />
          <SummaryStats values={allValues} />
        </div>
        <div>
          <BoxPlotChart labels={question.likert_labels} groups={boxPlotGroups} />
        </div>
      </div>

      {session.type === 'breakout' && groupData.length > 0 && (
        <GroupBreakdownCollapsible
          labels={question.likert_labels}
          groups={groupData.map((g) => ({ group: g.group, values: g.values }))}
        />
      )}
    </div>
  );
}

function GroupBreakdownCollapsible({
  labels,
  groups,
}: {
  labels: string[];
  groups: { group: { id: string; name: string }; values: number[] }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 text-left"
      >
        <span className="text-sm font-semibold text-gray-700">See Group Breakdowns</span>
        <span className="text-gray-400 text-sm">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <GroupBreakdown labels={labels} groups={groups} />
        </div>
      )}
    </div>
  );
}
