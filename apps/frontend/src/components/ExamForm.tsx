'use client';

import { FormEvent } from 'react';
import { TranslationFunction } from '../hooks/useTranslation';

interface SubjectData {
  subject: string;
  count: number;
}

interface ExamFormProps {
  professor: string;
  setProfessor: (value: string) => void;
  curso: string;
  setCurso: (value: string) => void;
  valor: string;
  setValor: (value: string) => void;
  availableSubjects: SubjectData[];
  selectedSubjectData: SubjectData | null;
  subject: string;
  count: number;
  handleSubjectChange: (value: string) => void;
  setCount: (value: number) => void;
  isLoading: boolean;
  handleSubmit: (event: FormEvent) => void;
  t: TranslationFunction;
}

export default function ExamForm({
  professor,
  setProfessor,
  curso,
  setCurso,
  valor,
  setValor,
  availableSubjects,
  selectedSubjectData,
  subject,
  count,
  handleSubjectChange,
  setCount,
  isLoading,
  handleSubmit,
  t,
}: ExamFormProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-6 bg-white rounded-lg shadow"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-b pb-6 mb-6">
        <h2 className="col-span-full text-lg font-semibold text-gray-800">
          Dados do Cabeçalho
        </h2>
        <div>
          <label
            htmlFor="professor"
            className="block text-sm font-medium text-gray-700"
          >
            Professor(a)
          </label>
          <input
            type="text"
            id="professor"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="curso"
            className="block text-sm font-medium text-gray-700"
          >
            Curso
          </label>
          <input
            type="text"
            id="curso"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="valor"
            className="block text-sm font-medium text-gray-700"
          >
            Valor da Prova
          </label>
          <input
            type="text"
            id="valor"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <h2 className="col-span-full text-lg font-semibold text-gray-800">
          Seleção de Questões
        </h2>
        <div>
          <label
            htmlFor="subject"
            className="block text-sm font-medium text-gray-700"
          >
            {t('subjectLabel')}
          </label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="" disabled>
              Selecione uma matéria
            </option>
            {availableSubjects.map((s) => (
              <option key={s.subject} value={s.subject}>
                {s.subject} ({s.count} questões)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="count"
            className="block text-sm font-medium text-gray-700"
          >
            {t('questionsLabel')}
          </label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value, 10))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            disabled={!selectedSubjectData}
          >
            {selectedSubjectData &&
              Array.from(
                { length: selectedSubjectData.count },
                (_, i) => i + 1,
              ).map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
          </select>
        </div>
        <div className="md:self-end">
          <button
            type="submit"
            disabled={isLoading || !subject}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {isLoading ? t('generatingButton') : t('generateButton')}
          </button>
        </div>
      </div>
    </form>
  );
}
