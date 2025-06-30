import { Injectable, BadRequestException } from '@nestjs/common';
import {
  IExam,
  IAnswerKeyItem,
  IQuestion,
} from '@exam-generator/core/src/exam.interface';
import { shuffleArray } from '../../../../common/utils/shuffle.util';
import {
  ExamCsvRepository,
  IQuestionWithAnswer,
} from '../../infrastructure/repositories/exam.csv.repository';

export interface GenerateExamParams {
  csvFileName: string;
  subject: string;
  objectiveCount: number;
  discursiveCount: number;
  numberOfVersions?: number;
  commonQuestions?: number;
}

@Injectable()
export class GenerateExamUseCase {
  constructor(private readonly examRepository: ExamCsvRepository) {}

  private createExamFromPool(
    pool: IQuestionWithAnswer[],
    version: string,
  ): IExam {
    const examQuestions: IQuestion[] = [];
    const examAnswerKey: IAnswerKeyItem[] = [];

    pool.forEach((fullQuestion) => {
      examAnswerKey.push({
        questionId: fullQuestion.id,
        correctAnswer: fullQuestion.answerKey,
      });
      examQuestions.push({
        id: fullQuestion.id,
        subject: fullQuestion.subject,
        prompt: fullQuestion.prompt,
        options: shuffleArray(fullQuestion.options),
      });
    });

    return {
      version,
      questions: examQuestions,
      answerKey: examAnswerKey,
    };
  }

  async execute(params: GenerateExamParams): Promise<IExam[]> {
    const {
      csvFileName,
      subject,
      objectiveCount,
      discursiveCount,
      numberOfVersions = 1,
      commonQuestions = 0,
    } = params;

    const allQuestions = await this.examRepository.findAll(csvFileName);
    const totalQuestionsPerExam = objectiveCount + discursiveCount;

    // 1. Separa o banco de questões por tipo
    const objectivePool = shuffleArray(
      allQuestions.filter(
        (q) =>
          q.subject.toLowerCase() === subject.toLowerCase() &&
          q.options.length > 0,
      ),
    );
    const discursivePool = shuffleArray(
      allQuestions.filter(
        (q) =>
          q.subject.toLowerCase() === subject.toLowerCase() &&
          q.options.length === 0,
      ),
    );

    // 2. Validação robusta de suficiência de questões
    const requiredObjective =
      (objectiveCount - commonQuestions) * (numberOfVersions - 1) +
      objectiveCount;
    const requiredDiscursive = discursiveCount * numberOfVersions; // Discursivas são sempre únicas por simplicidade

    if (objectivePool.length < requiredObjective) {
      throw new BadRequestException(
        `Questões objetivas insuficientes. Necessárias: ${requiredObjective}, disponíveis: ${objectivePool.length}.`,
      );
    }
    if (discursivePool.length < requiredDiscursive) {
      throw new BadRequestException(
        `Questões discursivas insuficientes. Necessárias: ${requiredDiscursive}, disponíveis: ${discursivePool.length}.`,
      );
    }

    const generatedExams: IExam[] = [];
    let objectivePointer = 0;
    let discursivePointer = 0;

    // 3. Gera a Prova A (Base)
    const baseObjectives = objectivePool.slice(
      objectivePointer,
      objectiveCount,
    );
    objectivePointer += objectiveCount;

    const baseDiscursives = discursivePool.slice(
      discursivePointer,
      discursiveCount,
    );
    discursivePointer += discursiveCount;

    const baseExamPool = shuffleArray([...baseObjectives, ...baseDiscursives]);
    generatedExams.push(this.createExamFromPool(baseExamPool, 'A'));

    // 4. Gera as Provas B, C, D...
    for (let i = 1; i < numberOfVersions; i++) {
      // a. Seleciona questões em comum da prova base (apenas objetivas)
      const commonExamQuestions = shuffleArray(baseObjectives).slice(
        0,
        commonQuestions,
      );

      // b. Seleciona questões novas do restante do banco
      const newObjectivesNeeded = objectiveCount - commonQuestions;
      const newObjectives = objectivePool.slice(
        objectivePointer,
        objectivePointer + newObjectivesNeeded,
      );
      objectivePointer += newObjectivesNeeded;

      const newDiscursives = discursivePool.slice(
        discursivePointer,
        discursivePointer + discursiveCount,
      );
      discursivePointer += discursiveCount;

      const nextExamPool = shuffleArray([
        ...commonExamQuestions,
        ...newObjectives,
        ...newDiscursives,
      ]);
      const examVersionLetter = String.fromCharCode(65 + i); // B, C, D...

      generatedExams.push(
        this.createExamFromPool(nextExamPool, examVersionLetter),
      );
    }

    return generatedExams;
  }
}
