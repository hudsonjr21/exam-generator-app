'use client';

import { useState, FormEvent } from 'react';
import { generateExam } from '../services/api';
// Verifique se a importação do IExam está correta
import { IExam } from '@exam-generator/core/src/exam.interface';

export default function Home() {
  const [subject, setSubject] = useState('Math');
  const [count, setCount] = useState(2);
  const [exam, setExam] = useState<IExam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setExam(null);

    try {
      const data = await generateExam(subject, count);
      setExam(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para encontrar a letra correta (A, B, C...)
  const getCorrectLetter = (questionId: string): string => {
    const question = exam?.questions.find(q => q.id === questionId);
    const answer = exam?.answerKey.find(a => a.questionId === questionId);
    if (!question || !answer) return '?';
    const correctIndex = question.options.indexOf(answer.correctAnswer);
    return String.fromCharCode(65 + correctIndex); // 65 é 'A' em ASCII
  };

  return (
    <main className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b">
        Exam Generator
      </h1>

      <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)} // <-- USANDO setSubject
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-700">
              Number of Questions
            </label>
            <input
              type="number"
              id="count"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10))} // <-- USANDO setCount
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              min="1"
            />
          </div>
          <div className="md:pt-6">
            <button
              type="submit"
              disabled={isLoading} // <-- USANDO isLoading
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
              {isLoading ? 'Generating...' : 'Generate Exam'} {/* <-- USANDO isLoading */}
            </button>
          </div>
        </div>
      </form>

      {error && <p className="text-red-500 font-semibold mb-4">Error: {error}</p>}
      
      {exam && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Generated Exam for: {subject}</h2>
            {exam.questions.map((q, index) => ( // <-- USANDO index
              <div key={q.id} className="p-6 border rounded-lg bg-white shadow">
                <p className="font-bold text-lg text-gray-800">
                  {index + 1}. {q.prompt} {/* <-- USANDO index */}
                </p>
                <div className="mt-4 space-y-2">
                  {q.options.map(opt => (
                    <div key={opt} className="flex items-center">
                      <input type="radio" name={q.id} id={`${q.id}-${opt}`} className="mr-3" />
                      <label htmlFor={`${q.id}-${opt}`} className="text-gray-700">{opt}</label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
          
          <aside>
            <div className="p-6 bg-white rounded-lg shadow sticky top-8">
              <h2 className="text-2xl font-bold border-b pb-2 mb-4">Answer Key</h2>
              <ol className="list-decimal list-inside space-y-2 font-mono">
                {exam.answerKey.map((answer, index) => ( // <-- USANDO index
                  <li key={answer.questionId}>
                     Question {index + 1}: <span className="font-bold">{getCorrectLetter(answer.questionId)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}