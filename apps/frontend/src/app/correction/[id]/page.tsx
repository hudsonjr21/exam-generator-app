'use client';

import React, { ChangeEvent, FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { startCorrectionProcess } from '../../../services/api';

// Tipos para os resultados da correção
interface CorrectionResult {
  callNumber: string;
  studentName: string;
  examVersion: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
}

// O 'params' é injetado automaticamente pelo Next.js
export default function CorrectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  // Estados para controlar os arquivos e configurações
  const [studentListFile, setStudentListFile] = useState<File | null>(null);
  const [answerSheetsFiles, setAnswerSheetsFiles] = useState<FileList | null>(
    null,
  );
  const [examValue, setExamValue] = useState(10.0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado para guardar os resultados após a correção
  const [results, setResults] = useState<CorrectionResult[]>([]);

  const handleStudentFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStudentListFile(e.target.files[0]);
    }
  };

  const handleAnswerSheetsChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAnswerSheetsFiles(e.target.files);
    }
  };

  const handleCorrection = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !studentListFile ||
      !answerSheetsFiles ||
      answerSheetsFiles.length === 0
    ) {
      toast.error('Por favor, envie a lista de alunos e os cartões-resposta.');
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading('Enviando arquivos para o servidor...');

    try {
      // Chama a nova função da API
      const result = await startCorrectionProcess({
        historyId: id,
        examValue,
        studentListFile,
        answerSheetsFiles,
      });

      toast.success(
        `Correção concluída! ${result.length} aluno(s) corrigido(s).`,
        { id: toastId },
      );

      setResults(result);
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`, { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Correção de Prova
          </h1>
          <p className="text-gray-500 mt-1">ID da Geração: {id}</p>
        </div>
        <Link href="/history">
          <button className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow">
            &larr; Voltar para o Histórico
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna de Uploads e Configuração */}
        <div className="lg:col-span-1 space-y-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold border-b pb-2">
            1. Envio de Arquivos
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lista de Alunos (.csv)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Envie um CSV com as colunas: `call_number`, `registration_id`,
              `student_name`.
            </p>
            <input
              type="file"
              onChange={handleStudentFileChange}
              accept=".csv"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {studentListFile && (
              <p className="text-xs text-green-600 mt-1">
                Arquivo selecionado: {studentListFile.name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cartões-Resposta Escaneados
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Selecione todas as imagens dos cartões preenchidos (.jpg, .png).
            </p>
            <input
              type="file"
              multiple
              onChange={handleAnswerSheetsChange}
              accept="image/png, image/jpeg"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            {answerSheetsFiles && (
              <p className="text-xs text-green-600 mt-1">
                {answerSheetsFiles.length} arquivo(s) selecionado(s).
              </p>
            )}
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold border-b pb-2">
              2. Configuração
            </h2>
            <div>
              <label
                htmlFor="examValue"
                className="block text-sm font-medium text-gray-700"
              >
                Valor Total da Prova
              </label>
              <input
                type="number"
                id="examValue"
                value={examValue}
                onChange={(e) => setExamValue(parseFloat(e.target.value) || 0)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>

          <button
            onClick={handleCorrection}
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow disabled:bg-green-400"
          >
            {isProcessing ? 'Corrigindo...' : 'Corrigir Provas Automaticamente'}
          </button>
        </div>

        {/* Coluna de Resultados */}
        <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">
            3. Resultados
          </h2>
          <div className="overflow-x-auto text-black">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nº
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nome do Aluno
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Prova
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Acertos
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Nota Final
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      Aguardando correção...
                    </td>
                  </tr>
                )}
                {results.map((res) => (
                  <tr key={res.callNumber}>
                    <td className="px-4 py-2 font-mono">{res.callNumber}</td>
                    <td className="px-4 py-2">{res.studentName}</td>
                    <td className="px-4 py-2 text-center">{res.examVersion}</td>
                    <td className="px-4 py-2 text-center">
                      {res.correctAnswers}/{res.totalQuestions}
                    </td>
                    <td className="px-4 py-2 font-bold text-blue-600">
                      {res.score.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
