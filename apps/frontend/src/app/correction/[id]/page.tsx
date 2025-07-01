'use client';

import { ChangeEvent, useState } from 'react';
import toast from 'react-hot-toast';

// O 'params' é injetado automaticamente pelo Next.js
export default function CorrectionPage({ params }: { params: { id: string } }) {
  const [studentListFile, setStudentListFile] = useState<File | null>(null);
  const [answerSheetsFiles, setAnswerSheetsFiles] = useState<FileList | null>(
    null,
  );
  const [examValue, setExamValue] = useState(10.0);

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

  const handleCorrection = () => {
    // Lógica futura de OMR virá aqui
    toast.error(
      'Funcionalidade de correção automática ainda não implementada.',
    );
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
        Correção da Prova
      </h1>
      <p className="text-gray-500 mb-8 pb-4 border-b">
        ID da Geração: {params.id}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna de Uploads */}
        <div className="space-y-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">1. Envio de Arquivos</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lista de Alunos (.csv)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Envie um CSV com as colunas 'numero_chamada' e 'nome_aluno'.
            </p>
            <input
              type="file"
              onChange={handleStudentFileChange}
              accept=".csv"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cartões-Resposta Escaneados (imagens)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Selecione todas as imagens dos cartões preenchidos (.jpg, .png).
            </p>
            <input
              type="file"
              multiple // Permite selecionar múltiplos arquivos
              onChange={handleAnswerSheetsChange}
              accept="image/png, image/jpeg"
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
        </div>

        {/* Coluna de Configuração e Ação */}
        <div className="space-y-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold">2. Configuração e Correção</h2>
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
          <button
            onClick={handleCorrection}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow"
          >
            Corrigir Provas Automaticamente
          </button>
        </div>
      </div>
    </div>
  );
}
