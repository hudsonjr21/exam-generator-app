'use client';

import { useState, FormEvent } from 'react';
import AnswerSheet from '../../components/AnswerSheet';

export default function AnswerSheetGeneratorPage() {
  const [questionCount, setQuestionCount] = useState(10);
  const [idDigits, setIdDigits] = useState(2);
  const [versionCount, setVersionCount] = useState(4);
  const [sheet, setSheet] = useState<{
    qCount: number;
    idCount: number;
    vCount: number;
  } | null>(null);
  const [formError, setFormError] = useState<string>('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (questionCount > 40) {
      setFormError('O número máximo de questões para o cartão é 40.');
      setSheet(null);
      return;
    }

    setSheet({
      qCount: questionCount,
      idCount: idDigits,
      vCount: versionCount,
    });
  };

  const handlePrint = () => {
    document.body.classList.add('printing-answer-sheet');
    window.print();
    document.body.classList.remove('printing-answer-sheet');
  };

  return (
    <div className="container mx-auto">
      <div className="no-print">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Gerador de Cartão-Resposta
        </h1>
        <p className="text-gray-600 mt-2 mb-8 pb-4 border-b">
          Crie e imprima cartões de resposta padronizados (2 por folha A4).
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-4 mb-8 p-6 bg-white rounded-lg shadow"
        >
          <div>
            <label
              htmlFor="questionCount"
              className="block text-sm font-medium text-gray-700"
            >
              Nº de Questões (máx: 40)
            </label>
            <input
              type="number"
              id="questionCount"
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(parseInt(e.target.value, 10) || 1)
              }
              className="mt-1 w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              min="1"
              max="40"
            />
          </div>
          <div>
            <label
              htmlFor="idDigits"
              className="block text-sm font-medium text-gray-700"
            >
              Dígitos para Chamada
            </label>
            <input
              type="number"
              id="idDigits"
              value={idDigits}
              onChange={(e) => setIdDigits(parseInt(e.target.value, 10) || 1)}
              className="mt-1 w-36 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              min="1"
              max="3"
            />
          </div>
          <div>
            <label
              htmlFor="versionCount"
              className="block text-sm font-medium text-gray-700"
            >
              Tipos de Prova (A,B,...)
            </label>
            <input
              type="number"
              id="versionCount"
              value={versionCount}
              onChange={(e) =>
                setVersionCount(parseInt(e.target.value, 10) || 1)
              }
              className="mt-1 w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              min="1"
              max="5"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow h-10"
          >
            Gerar Cartão
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!sheet}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg shadow h-10 disabled:bg-gray-300"
          >
            Imprimir
          </button>
        </form>
        {formError && (
          <p className="text-red-500 font-semibold text-center mb-4">
            {formError}
          </p>
        )}
      </div>

      {sheet && (
        <div className="printable-area a4-page-container">
          <AnswerSheet
            questionCount={sheet.qCount}
            idDigits={sheet.idCount}
            versionCount={sheet.vCount}
          />
          <AnswerSheet
            questionCount={sheet.qCount}
            idDigits={sheet.idCount}
            versionCount={sheet.vCount}
          />
        </div>
      )}
    </div>
  );
}
