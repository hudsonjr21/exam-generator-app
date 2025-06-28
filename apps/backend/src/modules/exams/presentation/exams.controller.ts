import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GenerateExamUseCase } from '../application/use-cases/generate-exam.use-case';
import { IExam } from '@exam-generator/core/src/exam.interface';
@Controller('exams')
export class ExamsController {
  constructor(private readonly generateExamUseCase: GenerateExamUseCase) {}

  @Get('generate')
  generateExam(
    @Query('subject') subject: string,
    @Query('count') count: string,
  ): IExam {
    if (!subject || !count) {
      throw new BadRequestException(
        'Subject and count query parameters are required.',
      );
    }

    const numberOfQuestions = parseInt(count, 10);
    if (isNaN(numberOfQuestions) || numberOfQuestions <= 0) {
      throw new BadRequestException('Count must be a positive number.');
    }

    const exam = this.generateExamUseCase.execute({
      subject,
      numberOfQuestions,
    });

    console.log(
      `Returning exam with ${exam.questions.length} questions and answer key.`,
    );
    return exam;
  }
}
