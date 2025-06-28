import { IExam } from '@exam-generator/core/src/exam.interface';

const API_URL = 'http://localhost:3000';

// A função agora retorna uma Promise do tipo IExam
export async function generateExam(subject: string, count: number): Promise<IExam> {
  const params = new URLSearchParams({ subject, count: count.toString() });
  const response = await fetch(`${API_URL}/exams/generate?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || 'Failed to fetch exam from API');
  }
  return response.json();
}