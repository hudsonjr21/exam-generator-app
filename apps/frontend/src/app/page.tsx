'use client';

import { useState, FormEvent, useEffect } from 'react';
import Image from 'next/image';
import { generateExam } from '../services/api';
import { IExam } from '@exam-generator/core/src/exam.interface';
import useTranslation from '../hooks/useTranslation';

// Interface para os dados dos subjects que virão da nova API
interface SubjectData {
  subject: string;
  count: number;
}

export default function Home() {
  // --- Estados da Aplicação ---
  
  // Estados para o cabeçalho editável
  const [professor, setProfessor] = useState('Hudson Ferreira');
  const [curso, setCurso] = useState('Técnico em Informática - Integrado');
  const [valor, setValor] = useState('10,0');

  // Estados para a busca dinâmica de matérias
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([]);
  const [selectedSubjectData, setSelectedSubjectData] = useState<SubjectData | null>(null);

  // Estados para o controle do formulário
  const [subject, setSubject] = useState('');
  const [count, setCount] = useState(1);
  
  // Estados para controle de UI e dados
  const [exam, setExam] = useState<IExam | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  // --- Lógica de Efeitos e Handlers ---

  // Busca as matérias disponíveis quando a página carrega
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
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  // Atualiza os dados quando o usuário muda a matéria no dropdown
  const handleSubjectChange = (newSubject: string, subjectsList: SubjectData[] = availableSubjects) => {
    setSubject(newSubject);
    const subjectData = subjectsList.find(s => s.subject === newSubject) || null;
    setSelectedSubjectData(subjectData);
    setCount(1); // Reseta a contagem para 1
  };
  
  // Lógica de impressão
  const handlePrint = (section: 'exam' | 'answer-key') => {
    document.body.classList.add('printing-active', `printing-${section}`);
    window.print();
    document.body.classList.remove('printing-active', `printing-${section}`);
  };

  // Lógica de submissão do formulário
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!subject) {
      setError("Por favor, selecione uma matéria.");
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

  // Lógica do gabarito
  const getCorrectLetter = (questionId: string): string => {
    const question = exam?.questions.find(q => q.id === questionId);
    const answer = exam?.answerKey.find(a => a.questionId === questionId);
    if (!question || !answer || !answer.correctAnswer) return '?';
    if (!question.options || question.options.length === 0) return '?';
    const correctIndex = question.options.indexOf(answer.correctAnswer);
    if (correctIndex === -1) return '?';
    return String.fromCharCode(65 + correctIndex);
  };

  return (
    <main className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="no-print">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900">{t('pageTitle')}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => handlePrint('exam')} disabled={!exam} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow disabled:bg-gray-300 disabled:cursor-not-allowed">
              Imprimir Prova
            </button>
            <button onClick={() => handlePrint('answer-key')} disabled={!exam} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg shadow disabled:bg-gray-300 disabled:cursor-not-allowed">
              Imprimir Gabarito
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2 mb-8 pb-4 border-b">
          Gere provas personalizadas a partir do seu arquivo CSV.
        </p>
        
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-b pb-6 mb-6">
            <h2 className="col-span-full text-lg font-semibold text-gray-800">Dados do Cabeçalho</h2>
            <div>
              <label htmlFor="professor" className="block text-sm font-medium text-gray-700">Professor(a)</label>
              <input type="text" id="professor" value={professor} onChange={(e) => setProfessor(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="curso" className="block text-sm font-medium text-gray-700">Curso</label>
              <input type="text" id="curso" value={curso} onChange={(e) => setCurso(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="valor" className="block text-sm font-medium text-gray-700">Valor da Prova</label>
              <input type="text" id="valor" value={valor} onChange={(e) => setValor(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <h2 className="col-span-full text-lg font-semibold text-gray-800">Seleção de Questões</h2>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">{t('subjectLabel')}</label>
              <select id="subject" value={subject} onChange={(e) => handleSubjectChange(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required>
                <option value="" disabled>Selecione uma matéria...</option>
                {availableSubjects.map(s => (<option key={s.subject} value={s.subject}>{s.subject} ({s.count} questões)</option>))}
              </select>
            </div>
            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700">{t('questionsLabel')}</label>
              <select id="count" value={count} onChange={(e) => setCount(parseInt(e.target.value, 10))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required disabled={!selectedSubjectData}>
                {selectedSubjectData && Array.from({ length: selectedSubjectData.count }, (_, i) => i + 1).map(num => (<option key={num} value={num}>{num}</option>))}
              </select>
            </div>
            <div className="md:self-end">
              <button type="submit" disabled={isLoading || !subject} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400">
                {isLoading ? t('generatingButton') : t('generateButton')}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {error && <p className="text-red-500 font-semibold mb-4 no-print">{error}</p>}
      
      <div className="printable-area">
        {exam && (
          <div>
            <section className="exam-section p-8 bg-white rounded-lg shadow">
              <header className="space-y-4">
                <div className="flex items-start justify-between border-b-2 border-black pb-4">
                  <div className="flex-shrink-0 mr-6">
                    <Image src="/logo-if-hori.jpg" alt="Logo IF Sul de Minas" width={70} height={67} priority />
                  </div>
                  {/* Container principal para as informações */}
                  <div className="flex-grow text-sm space-y-2">
                    {/* Linha 1: Professor/Curso/Disciplina e Valor/Nota/Data */}
                    <div className="flex justify-between">
                      <div>
                        <p><strong>PROFESSOR:</strong> {professor}</p>
                        <p><strong>CURSO:</strong> {curso}</p>
                        <p><strong>DISCIPLINA:</strong> {subject}</p>
                      </div>
                      <div className="grid grid-cols-[auto_1fr] gap-x-2">
                        <strong>VALOR:</strong> <span className="text-left">{valor}</span>
                        <strong>NOTA:</strong> <span className="text-left">_______________</span>
                        <strong>DATA:</strong> <span className="text-left">____/____/______</span>
                      </div>
                    </div>
                    {/* Linha 2: Aluno e Turma */}
                    <div className="flex justify-between">
                      <p><strong>ALUNO(A):</strong> ______________________________________</p>
                      <p><strong>TURMA:</strong> INFO ___________</p>
                    </div>
                  </div>
                </div>
              </header>
              
              <div className="questions-container mt-4">
                {exam.questions.map((q, index) => (
                  <div key={q.id} className="question-item">
                    <p className="font-semibold text-base print:text-sm text-gray-800 print-leading-tight" dangerouslySetInnerHTML={{ __html: `${index + 1}) ${q.prompt.replace(/\n/g, '<br />')}` }} />
                    <div className="mt-1">
                      {Array.isArray(q.options) && q.options.length > 0 && q.options.map((opt, optionIndex) => (
                        <div key={opt} className="flex items-baseline">
                          <span className="font-semibold mr-2 text-base print:text-sm">{String.fromCharCode(65 + optionIndex)})</span>
                          <span className="text-gray-700 leading-tight print-leading-tight print:text-sm">{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <aside className="answer-key-section mt-8">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-2xl font-bold border-b pb-2 mb-4">{t('answerKeyHeader')}</h2>
                <ol className="list-decimal list-inside space-y-2 font-mono text-lg">
                  {exam.answerKey.map((answer, index) => {
                    const letter = getCorrectLetter(answer.questionId);
                    return (
                      <li key={answer.questionId}>
                        {t('questionLabel')} {index + 1}:{' '}
                        {letter !== '?' ? ( <span className="font-bold">{letter}</span>) : (<span className="font-normal text-sm italic ml-2">{answer.correctAnswer}</span>)}
                      </li>
                    );
                  })}
                </ol>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}