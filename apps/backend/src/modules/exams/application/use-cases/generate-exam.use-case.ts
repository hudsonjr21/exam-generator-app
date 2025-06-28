import { Injectable, NotFoundException } from '@nestjs/common';
import { ExamCsvRepository } from '../../infrastructure/repositories/exam.csv.repository';
import { shuffleArray } from '../../../../common/utils/shuffle.util';
import { IExam, IAnswerKeyItem } from '@exam-generator/core/src/exam.interface';
import { IQuestion } from '@exam-generator/core/src/question.interface';

// Definindo os parâmetros que nosso caso de uso pode receber
export interface GenerateExamParams {
  subject: string;
  numberOfQuestions: number;
}

@Injectable()
export class GenerateExamUseCase {
  constructor(private readonly examRepository: ExamCsvRepository) {}

  execute(params: GenerateExamParams): IExam {
    const { subject, numberOfQuestions } = params;

    const questionsBySubject = this.examRepository
      .findAll()
      .filter((q) => q.subject.toLowerCase() === subject.toLowerCase());

    if (questionsBySubject.length === 0) {
      throw new NotFoundException(`No questions found for subject: ${subject}`);
    }

    const shuffledQuestions = shuffleArray(questionsBySubject);
    const selectedQuestions = shuffledQuestions.slice(0, numberOfQuestions);

    const finalQuestions: IQuestion[] = [];
    const finalAnswerKey: IAnswerKeyItem[] = [];

    selectedQuestions.forEach((fullQuestion) => {
      // Adiciona a resposta correta ao gabarito
      finalAnswerKey.push({
        questionId: fullQuestion.id,
        correctAnswer: fullQuestion.answerKey,
      });

      // Cria a questão para o aluno, embaralhando as opções e sem a resposta
      finalQuestions.push({
        id: fullQuestion.id,
        subject: fullQuestion.subject,
        prompt: fullQuestion.prompt,
        options: shuffleArray(fullQuestion.options),
      });
    });

    // Retorna o objeto completo de Prova
    return {
      questions: finalQuestions,
      answerKey: finalAnswerKey,
    };
  }
}
