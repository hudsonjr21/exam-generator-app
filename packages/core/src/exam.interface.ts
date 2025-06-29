import { IQuestion } from './question.interface';

// Representa a resposta correta para uma única questão
export interface IAnswerKeyItem {
  questionId: string;
  correctAnswer: string;
}

// Representa a prova completa: as questões para o aluno e o gabarito para o professor
export interface IExam {
  questions: IQuestion[];
  answerKey: IAnswerKeyItem[];
}
