import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamsModule } from './modules/exams/exams.module';

@Module({
  imports: [ExamsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
