'use client'; // Obrigatório para usar hooks (useState, useEffect)

import { useEffect, useState } from 'react';
import { generateMockExam, GeneratedExam } from '../services/api';

export default function Home() {
  const [exam, setExam] = useState<GeneratedExam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Component mounted, fetching exam...');
    generateMockExam()
      .then(data => {
        console.log('Exam data received:', data);
        setExam(data);
      })
      .catch(err => {
        console.error('Error fetching exam:', err);
        setError(err.message);
      })
      .finally(() => setIsLoading(false));
  }, []); // O array vazio [] faz com que isso rode apenas uma vez

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-500">Loading exam from server...</p>;
    }
    if (error) {
      return <p className="text-red-500 font-semibold">Error: {error}</p>;
    }
    if (exam) {
      return (
        <section className="space-y-6">
          {exam.questions.map((q, index) => (
            <div key={q.id} className="p-6 border rounded-lg bg-white shadow">
              <p className="font-bold text-lg text-gray-800">
                {index + 1}. {q.prompt}
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
      );
    }
    return null;
  };

  return (
    <main className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 pb-4 border-b">
        Exam Generator
      </h1>
      {renderContent()}
    </main>
  );
}