import type { QuestionDef } from '../../lib/types';
import { likertColors } from '../../lib/colors';

interface Props {
  question: QuestionDef;
  value: number | undefined;
  onChange: (questionId: string, value: number) => void;
}

export default function LikertQuestion({ question, value, onChange }: Props) {
  const colors = likertColors(question.likert_labels.length);

  return (
    <div className="mb-8">
      <p className="text-base font-medium text-gray-900 mb-3">{question.prompt}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        {question.likert_labels.map((label, idx) => {
          const isSelected = value === idx;
          return (
            <button
              key={idx}
              onClick={() => onChange(question.id, idx)}
              className="min-h-[48px] px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-150 text-left sm:text-center sm:flex-1"
              style={{
                borderColor: isSelected ? colors[idx] : '#e5e7eb',
                backgroundColor: isSelected ? colors[idx] : 'white',
                color: isSelected ? 'white' : '#374151',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
