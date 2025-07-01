'use client';

import React from 'react';
import { IExam } from '@exam-generator/core/src/exam.interface';
import ExamDisplay from './ExamDisplay';
import AnswerKey from './AnswerKey';
import useTranslation from '../hooks/useTranslation';

interface ExamPreviewModalProps {
  exam: IExam | null;
  historyItemDetails: any; // Passamos todos os detalhes para preencher o cabeçalho
  onClose: () => void;
  onPrint: (section: 'exam' | 'answer-key') => void;
}

const ExamPreviewModal: React.FC<ExamPreviewModalProps> = ({
  exam,
  historyItemDetails,
  onClose,
  onPrint,
}) => {
  const { t } = useTranslation();
  if (!exam) return null;

  return (
    <div className="modal-wrapper fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">
            Visualizando Prova - Versão {exam.version}
          </h2>
          {/* --- BOTÕES DE IMPRESSÃO DENTRO DO MODAL --- */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint('exam')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Imprimir Prova
            </button>
            <button
              onClick={() => onPrint('answer-key')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Imprimir Gabarito
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800 text-3xl font-light"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto printable-area">
          {/* O ID dinâmico é essencial para a impressão correta */}
          <div id={`printable-content-${exam.version}`}>
            <ExamDisplay
              exam={exam}
              professor={historyItemDetails.professorName}
              curso={historyItemDetails.courseName}
              subject={historyItemDetails.subject}
              valor={historyItemDetails.examValue}
            />
            <AnswerKey exam={exam} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPreviewModal;
