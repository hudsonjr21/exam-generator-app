'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { fetchHistory, deleteHistoryItem } from '../../services/api';
import ExamPreviewModal from '../../components/ExamPreviewModal';
import { IExam } from '@exam-generator/core/src/exam.interface';

// A interface para os itens do histórico
interface HistoryItem {
  id: string;
  name: string;
  createdAt: string;
  status: string;
  details: {
    professor: string;
    curso: string;
    valor: string;
    subject: string;
    objectiveCount: number;
    discursiveCount: number;
    numberOfVersions: number;
  };
  exams: IExam[];
}

// Ícones SVG para os botões
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C3.732 4.943 7.523 3 10 3s6.268 1.943 9.542 7c-3.274 5.057-7.03 7-9.542 7S3.732 15.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data);
    } catch (error) {
      toast.error('Não foi possível carregar o histórico de provas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (item: HistoryItem) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a geração "${item.name}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      handleConfirmDelete(item.id);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    const toastId = toast.loading('Excluindo...');
    try {
      await deleteHistoryItem(id);
      toast.success('Histórico excluído com sucesso!', { id: toastId });
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (error: any) {
      toast.error(`Falha ao excluir: ${error.message}`, { id: toastId });
    }
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8">
        Histórico de Provas Geradas
      </h1>

      {isLoading ? (
        <p>Carregando histórico...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome / Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalhes / Visualizar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    Nenhuma prova foi gerada ainda.
                  </td>
                </tr>
              )}
              {history.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 align-top">
                    <p className="font-semibold text-sm text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.details.subject} ({item.details.objectiveCount} Obj,{' '}
                    {item.details.discursiveCount} Disc)
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.exams.map((examVersion) => (
                        <Link
                          key={examVersion.version}
                          href={`/preview/${item.id}?version=${examVersion.version}`}
                          target="_blank" // Isso faz o link abrir em uma nova aba
                          className="flex items-center gap-1 text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
                        >
                          <EyeIcon /> Ver Prova {examVersion.version}
                        </Link>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Corrigido' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium align-top">
                    <div className="flex items-center gap-2">
                      {item.status === 'Pendente' && (
                        <Link href={`/correction/${item.id}`}>
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-md text-xs">
                            Corrigir
                          </button>
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteClick(item)}
                        disabled={item.status !== 'Pendente'}
                        className="p-1 text-red-600 hover:text-red-900 disabled:text-gray-300 disabled:cursor-not-allowed"
                        title={
                          item.status !== 'Pendente'
                            ? 'Provas corrigidas não podem ser excluídas'
                            : 'Excluir esta geração'
                        }
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
