'use client';

import { IExam } from '@exam-generator/core/src/exam.interface';
import { TranslationFunction } from '../hooks/useTranslation';

interface AnswerKeyProps {
  exam: IExam;
  t: TranslationFunction;
}

export default function AnswerKey({ exam, t }: AnswerKeyProps) {
  const getCorrectLetter = (questionId: string): string => {
    const question = exam.questions.find((q) => q.id === questionId);
    const answer = exam.answerKey.find((a) => a.questionId === questionId);
    if (!question || !answer || !answer.correctAnswer) return '?';
    if (!question.options || question.options.length === 0) return '?';
    const correctIndex = question.options.indexOf(answer.correctAnswer);
    if (correctIndex === -1) return '?';
    return String.fromCharCode(65 + correctIndex);
  };

  return (
    <aside className="answer-key-section mt-8">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold border-b pb-2 mb-4">
          {t('answerKeyHeader')}
        </h2>
        <ol className="list-decimal list-inside space-y-2 font-mono text-lg text-black">
          {exam.answerKey.map((answer, index) => {
            const letter = getCorrectLetter(answer.questionId);
            return (
              <li key={answer.questionId}>
                {t('questionLabel')} {index + 1}:{' '}
                {letter !== '?' ? (
                  <span className="font-bold">{letter}</span>
                ) : (
                  <span className="font-normal text-sm italic ml-2">
                    {answer.correctAnswer}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
