'use client';

import { FormEvent } from 'react';
import { TranslationFunction } from '../hooks/useTranslation';

// Interfaces para as props do componente
interface SubjectData {
  subject: string;
  objectiveCount: number;
  discursiveCount: number;
}

interface ExamFormProps {
  disabled: boolean;
  professor: string;
  setProfessor: (value: string) => void;
  curso: string;
  setCurso: (value: string) => void;
  valor: string;
  setValor: (value: string) => void;
  availableSubjects: SubjectData[];
  selectedSubjectData: SubjectData | null;
  subject: string;
  handleSubjectChange: (value: string) => void;
  isLoading: boolean;
  handleSubmit: (event: FormEvent) => void;
  t: TranslationFunction;
  // Novas props para os novos seletores
  objectiveCount: number;
  setObjectiveCount: (value: number) => void;
  discursiveCount: number;
  setDiscursiveCount: (value: number) => void;
  numberOfVersions: number;
  setNumberOfVersions: (value: number) => void;
  validationError: string;
  commonQuestions: number;
  setCommonQuestions: (value: number) => void;
}

export default function ExamForm({
  disabled,
  professor,
  setProfessor,
  curso,
  setCurso,
  valor,
  setValor,
  availableSubjects,
  selectedSubjectData,
  subject,
  handleSubjectChange,
  isLoading,
  handleSubmit,
  t,
  objectiveCount,
  setObjectiveCount,
  discursiveCount,
  setDiscursiveCount,
  numberOfVersions,
  setNumberOfVersions,
  validationError,
}: ExamFormProps) {
  // A opacidade é controlada com base na prop 'disabled'
  const formClasses = `mb-8 p-6 bg-white rounded-lg shadow transition-opacity duration-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`;

  return (
    <fieldset disabled={disabled} className={formClasses}>
      <form onSubmit={handleSubmit}>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
          <h2 className="col-span-full text-lg font-semibold text-gray-800">
            Seleção de Questões
          </h2>
          <div className="lg:col-span-2">
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            >
              <option value="" disabled>
                Selecione uma matéria
              </option>
              {availableSubjects.map((s) => (
                <option key={s.subject} value={s.subject}>
                  {s.subject} (O:{s.objectiveCount}, D:{s.discursiveCount})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="objectiveCount"
              className="block text-sm font-medium text-gray-700"
            >
              Nº Objetivas
            </label>
            <select
              id="objectiveCount"
              value={objectiveCount}
              onChange={(e) => setObjectiveCount(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
              disabled={!selectedSubjectData}
            >
              {selectedSubjectData &&
                Array.from(
                  { length: selectedSubjectData.objectiveCount + 1 },
                  (_, i) => i,
                ).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="discursiveCount"
              className="block text-sm font-medium text-gray-700"
            >
              Nº Discursivas
            </label>
            <select
              id="discursiveCount"
              value={discursiveCount}
              onChange={(e) => setDiscursiveCount(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
              disabled={!selectedSubjectData}
            >
              {selectedSubjectData &&
                Array.from(
                  { length: selectedSubjectData.discursiveCount + 1 },
                  (_, i) => i,
                ).map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label
              htmlFor="versions"
              className="block text-sm font-medium text-gray-700"
            >
              Nº de Versões da Prova
            </label>
            <select
              id="versions"
              value={numberOfVersions}
              onChange={(e) => setNumberOfVersions(parseInt(e.target.value))}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              {[1, 2, 3, 4, 5].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          {validationError && (
            <div className="mt-4 p-2 text-center bg-red-100 text-red-700 rounded-md text-sm">
              {validationError}
            </div>
          )}
          <div className="lg:col-span-2 self-end">
            <button
              type="submit"
              disabled={isLoading || !subject || !!validationError}
              className="w-full h-10 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? t('generatingButton') : t('generateButton')}
            </button>
          </div>
        </div>
      </form>
    </fieldset>
  );
}
