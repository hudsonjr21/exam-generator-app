import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamsModule } from './modules/exams/exams.module';
import { CsvModule } from './modules/csv/csv.module';

@Module({
  imports: [ExamsModule, CsvModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
