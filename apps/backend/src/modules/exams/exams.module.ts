import { Module } from '@nestjs/common';
import { ExamsController } from './presentation/exams.controller';
import { ExamCsvRepository } from './infrastructure/repositories/exam.csv.repository';
import { GenerateExamUseCase } from './application/use-cases/generate-exam.use-case';

@Module({
  controllers: [ExamsController],
  providers: [ExamCsvRepository, GenerateExamUseCase],
})
export class ExamsModule {}
