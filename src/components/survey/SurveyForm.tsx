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
  void isUpdate;
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers ?? {});

  const handleChange = (questionId: string, value: number) => {
    const next = { ...answers, [questionId]: value };
    setAnswers(next);
    onSubmit(next);
  };

  return (
    <div>
      {questions.map((q) => (
        <LikertQuestion
          key={q.id}
          question={q}
          value={answers[q.id]}
          onChange={handleChange}
        />
      ))}
    </div>
  );
}
