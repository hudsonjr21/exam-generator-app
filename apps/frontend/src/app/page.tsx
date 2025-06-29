'use client';

import { useState, FormEvent, useEffect } from 'react';
import { generateExam } from '../services/api';
import { IExam } from '@exam-generator/core/src/exam.interface';
import useTranslation from '../hooks/useTranslation';
import ExamForm from '../components/ExamForm';
import ExamDisplay from '../components/ExamDisplay';
import AnswerKey from '../components/AnswerKey';

interface SubjectData {
  subject: string;
  count: number;
}

export default function Home() {
  const [professor, setProfessor] = useState('Hudson Ferreira');
  const [curso, setCurso] = useState('Técnico em Informática - Integrado');
  const [valor, setValor] = useState('10,0');
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([]);
  const [selectedSubjectData, setSelectedSubjectData] =
    useState<SubjectData | null>(null);
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState(1);
  const [exam, setExam] = useState<IExam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch('http://localhost:3000/exams/subjects');
        if (!response.ok) throw new Error('Server responded with an error');
        const data: SubjectData[] = await response.json();
        setAvailableSubjects(data);
        if (data.length > 0) {
          handleSubjectChange(data[0].subject, data);
        }
      } catch (e) {
        setError('Failed to load available subjects from the server.');
        console.error(e);
      }
    };
    fetchSubjects();
  }, []);

  const handleSubjectChange = (
    newSubject: string,
    subjectsList: SubjectData[] = availableSubjects,
  ) => {
    setSubject(newSubject);
    const subjectData =
      subjectsList.find((s) => s.subject === newSubject) || null;
    setSelectedSubjectData(subjectData);
    setCount(1);
  };

  const handlePrint = (section: 'exam' | 'answer-key' | 'answer-sheet') => {
    document.body.classList.add('printing-active', `printing-${section}`);
    window.print();
    document.body.classList.remove('printing-active', `printing-${section}`);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!subject) {
      setError('Por favor, selecione uma matéria.');
      return;
    }
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

  return (
    <div className="container mx-auto">
      <div className="no-print">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {t('pageTitle')}
        </h1>
        <p className="text-gray-600 mt-2 mb-8 pb-4 border-b">
          Gere provas personalizadas a partir do seu arquivo CSV.
        </p>
        <ExamForm
          professor={professor}
          setProfessor={setProfessor}
          curso={curso}
          setCurso={setCurso}
          valor={valor}
          setValor={setValor}
          availableSubjects={availableSubjects}
          selectedSubjectData={selectedSubjectData}
          subject={subject}
          count={count}
          handleSubjectChange={handleSubjectChange}
          setCount={setCount}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          t={t}
        />
      </div>

      {error && (
        <p className="text-red-500 font-semibold mb-4 no-print">{error}</p>
      )}

      <div className="printable-area">
        {exam && (
          <div>
            <div className="flex justify-end items-center gap-4 no-print mb-4">
              <button
                onClick={() => handlePrint('exam')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow"
              >
                Imprimir Prova
              </button>
              <button
                onClick={() => handlePrint('answer-key')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow"
              >
                Imprimir Gabarito
              </button>
            </div>

            <ExamDisplay
              exam={exam}
              professor={professor}
              curso={curso}
              subject={subject}
              valor={valor}
            />
            <AnswerKey exam={exam} t={t} />
          </div>
        )}
      </div>
    </div>
  );
}
