import type { IQuestion } from './question.interface';
export type { IQuestion };

// Representa a resposta correta para uma única questão
export interface IAnswerKeyItem {
  questionId: string;
  correctAnswer: string;
}

// Representa a prova completa: as questões para o aluno e o gabarito para o professor
export interface IExam {
  version: string; // Ex: 'A', 'B', 'C'
  questions: IQuestion[];
  answerKey: IAnswerKeyItem[];
  professorName?: string;
  courseName?: string;
  examValue?: string;
}
