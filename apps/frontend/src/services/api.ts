import { IQuestion } from '@exam-generator/core/src/question.interface';

const API_URL = 'http://localhost:3000';

export interface GeneratedExam {
  questions: IQuestion[];
}

export async function generateMockExam(): Promise<GeneratedExam> {
  const response = await fetch(`${API_URL}/exams/generate`);
  if (!response.ok) {
    throw new Error('Failed to fetch exam from API');
  }
  return response.json();
}