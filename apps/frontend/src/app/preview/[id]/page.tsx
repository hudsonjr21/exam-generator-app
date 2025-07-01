'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { IExam } from '@exam-generator/core/src/exam.interface';
import { fetchHistoryItem } from '../../../services/api';
import ExamDisplay from '../../../components/ExamDisplay';
import AnswerKey from '../../../components/AnswerKey';
import useTranslation from '../../../hooks/useTranslation';

// Interface para os dados completos do histórico
interface HistoryItemDetails {
  professorName: string;
  courseName: string;
  examValue: string;
  subject: string;
}

export default function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // CORREÇÃO: Desestruturamos o 'id' dos parâmetros aqui, uma única vez.
  const { id } = React.use(params);
  const searchParams = useSearchParams();
  const version = searchParams.get('version');

  const [exam, setExam] = useState<IExam | null>(null);
  const [details, setDetails] = useState<HistoryItemDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    // Usamos a variável 'id' em vez de 'params.id' em todo o efeito.
    if (id && version) {
      const loadExam = async () => {
        try {
          const historyItem = await fetchHistoryItem(id);
          const examToView = historyItem.exams.find(
            (e: IExam) => e.version === version,
          );

          if (examToView) {
            setExam(examToView);
            setDetails(historyItem.details);
          } else {
            setError(`Versão ${version} não encontrada.`);
          }
        } catch (e) {
          setError('Falha ao carregar a prova.');
        }
      };
      loadExam();
    }
    // A dependência do useEffect agora é a variável 'id'.
  }, [id, version]);

  const handlePrint = (section: 'exam' | 'answer-key') => {
    document.body.classList.add('printing-active', `printing-${section}`);
    window.print();
    document.body.classList.remove('printing-active', `printing-${section}`);
  };

  if (error)
    return (
      <div className="text-center text-red-500 font-bold p-10">{error}</div>
    );
  if (!exam || !details)
    return <div className="text-center p-10">Carregando prova...</div>;

  return (
    <div>
      {/* Botões de controle que só aparecem na tela */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-50">
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

      {/* Área que será impressa */}
      <div className="printable-area">
        <ExamDisplay
          exam={exam}
          professor={details.professorName}
          curso={details.courseName}
          subject={details.subject}
          valor={details.examValue}
        />
        <AnswerKey exam={exam} t={t} />
      </div>
    </div>
  );
}
