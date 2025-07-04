import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { GenerateExamUseCase } from '../application/use-cases/generate-exam.use-case';
import { IExam } from '@exam-generator/core/src/exam.interface';
import { ExamCsvRepository } from '../infrastructure/repositories/exam.csv.repository';
import { HistoryService } from 'src/modules/history/history.service';

@Controller('exams')
export class ExamsController {
  constructor(
    private readonly generateExamUseCase: GenerateExamUseCase,
    private readonly examRepository: ExamCsvRepository,
    private readonly historyService: HistoryService,
  ) {}

  @Get('generate')
  async generateExam(
    @Query('csvFileName') csvFileName: string,
    @Query('subject') subject: string,
    @Query('objectiveCount') objectiveCount: string,
    @Query('discursiveCount') discursiveCount: string,
    @Query('versions') versions = '1',
    @Query('common') common = '0',
    @Query('professor') professor: string,
    @Query('curso') curso: string,
    @Query('valor') valor: string,
  ): Promise<IExam[]> {
    if (
      !csvFileName ||
      !subject ||
      objectiveCount === undefined ||
      discursiveCount === undefined
    ) {
      throw new BadRequestException(
        'Parâmetros obrigatórios: csvFileName, subject, objectiveCount, discursiveCount.',
      );
    }

    const exams = await this.generateExamUseCase.execute({
      csvFileName,
      subject,
      objectiveCount: parseInt(objectiveCount, 10),
      discursiveCount: parseInt(discursiveCount, 10),
      numberOfVersions: parseInt(versions, 10),
      commonQuestions: parseInt(common, 10),
      professorName: professor,
      courseName: curso,
      examValue: valor,
    });

    console.log(`Returning ${exams.length} exam version(s).`);

    const details = {
      csvFileName,
      subject,
      objectiveCount: parseInt(objectiveCount, 10),
      discursiveCount: parseInt(discursiveCount, 10),
      numberOfVersions: parseInt(versions, 10),
      commonQuestions: parseInt(common, 10),
      professorName: professor,
      courseName: curso,
      examValue: valor,
    };

    const historyName = `${csvFileName.replace('.csv', '')} - ${new Date().toLocaleString('pt-BR')}`;
    await this.historyService.create(historyName, details, exams);
    return exams;
  }

  @Get('subjects')
  async getAvailableSubjects(@Query('csvFileName') csvFileName: string) {
    if (!csvFileName) {
      throw new BadRequestException(
        'O nome do banco de questões é obrigatório.',
      );
    }
    return this.examRepository.getSubjectsWithCounts(csvFileName);
  }
}
