import { IExam } from '@exam-generator/core/src/exam.interface';
import { ICorrectionResult } from '@exam-generator/core/src/correction.interface';

const API_URL = 'http://localhost:3000';

export interface SubjectData {
  subject: string;
  objectiveCount: number;
  discursiveCount: number;
}

// ATUALIZADA: Função agora aceita os novos parâmetros
export async function generateExam(params: {
  csvFileName: string;
  subject: string;
  objectiveCount: number;
  discursiveCount: number;
  versions: number;
  common: number;
  professorName: string;
  courseName: string;
  examValue: string;
}): Promise<IExam[]> {
  const queryParams = new URLSearchParams({
    csvFileName: params.csvFileName,
    subject: params.subject,
    objectiveCount: params.objectiveCount.toString(),
    discursiveCount: params.discursiveCount.toString(),
    versions: params.versions.toString(),
    common: params.common.toString(),
    professor: params.professorName,
    curso: params.courseName,
    valor: params.examValue,
  });

  const response = await fetch(
    `${API_URL}/exams/generate?${queryParams.toString()}`,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to fetch exam from API');
  }

  return response.json();
}

// CORREÇÃO: Função movida para fora, onde deveria estar
export async function fetchSubjects(
  csvFileName: string,
): Promise<SubjectData[]> {
  const queryParams = new URLSearchParams({ csvFileName });
  const response = await fetch(
    `${API_URL}/exams/subjects?${queryParams.toString()}`,
  );
  if (!response.ok) {
    throw new Error('Server responded with an error');
  }
  return response.json();
}

// Funções para upload e listagem que planejamos
export async function listCsvs(): Promise<string[]> {
  const response = await fetch(`${API_URL}/csv/list`);
  if (!response.ok) throw new Error('Failed to fetch CSV list');
  return response.json();
}

export async function uploadCsv(file: File, fileName: string): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);

  const response = await fetch(`${API_URL}/csv/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload CSV');
  return response.json();
}

export async function fetchHistory(): Promise<any[]> {
  const response = await fetch(`${API_URL}/history`);
  if (!response.ok) {
    throw new Error('Falha ao buscar histórico de provas');
  }
  return response.json();
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/history/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Falha ao excluir item do histórico.' }));
    throw new Error(errorData.message);
  }
}

export async function fetchHistoryItem(id: string): Promise<any> {
  const response = await fetch(`${API_URL}/history/${id}`);
  if (!response.ok) {
    throw new Error('Falha ao buscar detalhes da prova');
  }
  return response.json();
}

interface StartCorrectionPayload {
  historyId: string;
  examValue: number;
  studentListFile: File;
  answerSheetsFiles: FileList;
}

export async function startCorrectionProcess(
  payload: StartCorrectionPayload,
): Promise<ICorrectionResult[]> {
  const { historyId, examValue, studentListFile, answerSheetsFiles } = payload;

  const formData = new FormData();

  // Adiciona os dados de texto
  formData.append('historyId', historyId);
  formData.append('examValue', examValue.toString());

  // Adiciona o arquivo da lista de alunos com um nome de campo específico
  formData.append('student_list', studentListFile, studentListFile.name);

  // Adiciona cada um dos cartões-resposta com outro nome de campo
  for (let i = 0; i < answerSheetsFiles.length; i++) {
    formData.append(
      'answer_sheets',
      answerSheetsFiles[i],
      answerSheetsFiles[i].name,
    );
  }

  const response = await fetch(`${API_URL}/correction/start`, {
    method: 'POST',
    body: formData,
    // Não adicione o header 'Content-Type', o navegador faz isso automaticamente para FormData
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Falha ao iniciar a correção.' }));
    throw new Error(errorData.message);
  }

  return response.json();
}
