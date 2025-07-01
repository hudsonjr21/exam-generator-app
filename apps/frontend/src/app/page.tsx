'use client';

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import { IExam } from '@exam-generator/core/src/exam.interface';
import useTranslation, { TranslationFunction } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

import {
  generateExam,
  listCsvs,
  fetchSubjects,
  uploadCsv,
  SubjectData,
} from '../services/api';

import ExamForm from '../components/ExamForm';
import ExamDisplay from '../components/ExamDisplay';
import AnswerKey from '../components/AnswerKey';

export default function Home() {
  const [csvList, setCsvList] = useState<string[]>([]);
  const [selectedCsv, setSelectedCsv] = useState<string>('');
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [professor, setProfessor] = useState('Hudson Ferreira');
  const [curso, setCurso] = useState('Técnico em Informática - Integrado');
  const [valor, setValor] = useState('10,0');
  const [availableSubjects, setAvailableSubjects] = useState<SubjectData[]>([]);
  const [selectedSubjectData, setSelectedSubjectData] =
    useState<SubjectData | null>(null);
  const [subject, setSubject] = useState('');
  const [objectiveCount, setObjectiveCount] = useState(0);
  const [discursiveCount, setDiscursiveCount] = useState(0);
  const [numberOfVersions, setNumberOfVersions] = useState(1);
  const [commonQuestions, setCommonQuestions] = useState(0);
  const [exams, setExams] = useState<IExam[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    const loadCsvs = async () => {
      try {
        const files = await listCsvs();
        setCsvList(files);
        if (files.length > 0) {
          handleCsvSelection(files[0]);
        }
      } catch (error) {
        toast.error('Falha ao carregar bancos de questões.');
      }
    };
    loadCsvs();
  }, []);

  const handleCsvSelection = async (csvName: string) => {
    setSelectedCsv(csvName);
    setExams(null);
    if (!csvName) {
      setAvailableSubjects([]);
      setSubject('');
      return;
    }
    try {
      const subjects = await fetchSubjects(csvName);
      setAvailableSubjects(subjects);
      if (subjects.length > 0) {
        handleSubjectChange(subjects[0].subject, subjects);
      } else {
        setSubject('');
        setSelectedSubjectData(null);
      }
    } catch (error) {
      toast.error(`Falha ao carregar matérias de ${csvName}.`);
    }
  };

  const handleSubjectChange = (
    newSubject: string,
    subjectsList: SubjectData[] = availableSubjects,
  ) => {
    setSubject(newSubject);
    const subjectData =
      subjectsList.find((s) => s.subject === newSubject) || null;
    setSelectedSubjectData(subjectData);
    setObjectiveCount(0);
    setDiscursiveCount(0);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileToUpload(file);
      setNewFileName(file.name.replace(/\.csv$/, '').replace(/_/g, ' '));
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload || !newFileName) {
      toast.error('Por favor, selecione um arquivo e dê um nome a ele.');
      return;
    }
    const toastId = toast.loading(`Salvando "${newFileName}"...`);
    try {
      const savedFile = await uploadCsv(fileToUpload, newFileName);
      toast.success('Banco de questões salvo!', { id: toastId });
      setFileToUpload(null);
      setNewFileName('');
      const files = await listCsvs();
      setCsvList(files);
      handleCsvSelection(savedFile.fileName);
    } catch (error) {
      toast.error('Falha no upload.', { id: toastId });
    }
  };

  const handlePrint = (section: 'exam' | 'answer-key') => {
    document.body.classList.add('printing-active', `printing-${section}`);
    window.print();
    document.body.classList.remove('printing-active', `printing-${section}`);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (validationError) {
      toast.error(
        'Não é possível gerar a prova. Verifique os erros no formulário.',
      );
      return;
    }

    if (!selectedCsv || !subject) {
      toast.error('Por favor, selecione um banco de questões e uma matéria.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setExams(null);

    const toastId = toast.loading('Gerando provas, por favor aguarde...');

    try {
      const data = await generateExam({
        csvFileName: selectedCsv,
        subject,
        objectiveCount,
        discursiveCount,
        versions: numberOfVersions,
        common: commonQuestions,
        professorName: professor,
        courseName: curso,
        examValue: valor,
      });
      setExams(data);
      setCurrentPage(0);

      const totalQuestions = objectiveCount + discursiveCount;
      let successMessage = `Sucesso! ${data.length} versão(ões) da prova foram geradas com ${totalQuestions} questões.`;
      toast.success(successMessage, { id: toastId, duration: 4000 });
    } catch (err: any) {
      setError(err.message);
      setValidationError(err.message);
      toast.error(`Erro: ${err.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    // Função que valida se a combinação atual de seleções é possível
    const validateCombination = () => {
      if (!selectedSubjectData) return;

      const {
        objectiveCount: availableObjectives,
        discursiveCount: availableDiscursives,
      } = selectedSubjectData;

      // Garante que o cálculo não dê negativo se o usuário selecionar mais questões comuns que objetivas
      const uniqueObjectivesPerExam = Math.max(
        0,
        objectiveCount - commonQuestions,
      );

      // A fórmula correta: (K-M)*(N-1)+K
      const requiredUniqueObjectives =
        uniqueObjectivesPerExam * (numberOfVersions - 1) + objectiveCount;

      // Para discursivas, a lógica está correta pois não há questões em comum
      const requiredUniqueDiscursives = discursiveCount * numberOfVersions;

      if (
        objectiveCount > 0 &&
        availableObjectives < requiredUniqueObjectives
      ) {
        setValidationError(
          `Objetivas insuficientes. Necessárias: ${requiredUniqueObjectives} (para ${numberOfVersions} versões), disponíveis: ${availableObjectives}.`,
        );
      } else if (
        discursiveCount > 0 &&
        availableDiscursives < requiredUniqueDiscursives
      ) {
        setValidationError(
          `Discursivas insuficientes. Necessárias: ${requiredUniqueDiscursives} (para ${numberOfVersions} versões), disponíveis: ${availableDiscursives}.`,
        );
      } else {
        setValidationError(''); // Se for válido, limpa o erro
      }
    };

    validateCombination();
    // Este useEffect roda toda vez que um dos seletores da prova muda
  }, [
    objectiveCount,
    discursiveCount,
    numberOfVersions,
    commonQuestions,
    selectedSubjectData,
  ]);

  return (
    <div className="container mx-auto">
      <div className="no-print">
        <h1 className="text-4xl font-extrabold text-gray-900">
          {t('pageTitle')}
        </h1>
        <p className="text-gray-600 mt-2 mb-8 pb-4 border-b">
          Gere provas personalizadas a partir do seu arquivo CSV.
        </p>

        <div className="p-6 bg-white rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Gerenciar Bancos de Questões
          </h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label
                htmlFor="csv-select"
                className="block text-sm font-medium text-gray-700"
              >
                Selecione o Banco de Questões
              </label>
              <select
                id="csv-select"
                value={selectedCsv}
                onChange={(e) => handleCsvSelection(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="">Selecione...</option>
                {csvList.map((name) => (
                  <option key={name} value={name}>
                    {name.replace('.csv', '')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="csv-upload"
                className="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg h-10 flex items-center"
              >
                Importar Novo...
              </label>
              <input
                id="csv-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept=".csv"
              />
            </div>
          </div>
          {fileToUpload && (
            <div className="mt-4 pt-4 border-t flex items-end gap-4">
              <div className="flex-1">
                <label
                  htmlFor="new-file-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Salvar como:
                </label>
                <input
                  type="text"
                  id="new-file-name"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              <button
                onClick={handleUpload}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg h-10"
              >
                Salvar
              </button>
            </div>
          )}
        </div>

        <ExamForm
          disabled={!selectedCsv}
          professor={professor}
          setProfessor={setProfessor}
          curso={curso}
          setCurso={setCurso}
          valor={valor}
          setValor={setValor}
          availableSubjects={availableSubjects}
          selectedSubjectData={selectedSubjectData}
          subject={subject}
          handleSubjectChange={handleSubjectChange}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          t={t}
          objectiveCount={objectiveCount}
          setObjectiveCount={setObjectiveCount}
          discursiveCount={discursiveCount}
          setDiscursiveCount={setDiscursiveCount}
          numberOfVersions={numberOfVersions}
          setNumberOfVersions={setNumberOfVersions}
          commonQuestions={commonQuestions}
          setCommonQuestions={setCommonQuestions}
          validationError={validationError}
        />
      </div>

      {error && !validationError && (
        <p className="text-red-500 font-semibold mb-4 no-print">{error}</p>
      )}

      <div className="printable-area">
        {exams && exams[currentPage] && (
          <div key={exams[currentPage].version}>
            <div className="flex justify-between items-center no-print mb-4 p-4 bg-white rounded-lg shadow">
              <h2 className="text-2xl font-bold">
                Exibindo Prova Versão {exams[currentPage].version}
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 0}
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow disabled:bg-gray-300"
                >
                  Anterior
                </button>
                <span className="font-semibold text-black">
                  {currentPage + 1} de {exams.length}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage >= exams.length - 1}
                  className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow disabled:bg-gray-300"
                >
                  Próxima
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrint('exam')}
                  className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow"
                >
                  Imprimir Prova {exams[currentPage].version}
                </button>
                <button
                  onClick={() => handlePrint('answer-key')}
                  className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow"
                >
                  Imprimir Gabarito {exams[currentPage].version}
                </button>
              </div>
            </div>
            <div id={`printable-content-${exams[currentPage].version}`}>
              <ExamDisplay
                exam={exams[currentPage]}
                professor={professor}
                curso={curso}
                subject={subject}
                valor={valor}
              />
              <AnswerKey exam={exams[currentPage]} t={t} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
