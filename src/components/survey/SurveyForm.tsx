import { useState } from 'react';
import type { QuestionDef } from '../../lib/types';
import LikertQuestion from './LikertQuestion';

interface Props {
  questions: QuestionDef[];
  initialAnswers?: Record<string, number>;
  isUpdate?: boolean;
  onSubmit: (answers: Record<string, number>) => void;
}

export default function SurveyForm({ questions, initialAnswers, isUpdate, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers ?? {});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    onSubmit(answers);
    setSubmitted(true);
  };

  return (
    <div className="pb-24">
      {questions.map((q) => (
        <LikertQuestion
          key={q.id}
          question={q}
          value={answers[q.id]}
          onChange={handleChange}
        />
      ))}

      {submitted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
          Responses {isUpdate ? 'updated' : 'submitted'} successfully.
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:static sm:border-0 sm:p-0 sm:bg-transparent">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors"
          >
            {isUpdate ? 'Update Responses' : 'Submit Responses'}
          </button>
        </div>
      </div>
    </div>
  );
}
