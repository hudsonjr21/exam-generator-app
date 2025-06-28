import { Module } from '@nestjs/common';
import { ExamsController } from './presentation/exams.controller';

@Module({
  controllers: [ExamsController],
  providers: [],
})
export class ExamsModule {}
