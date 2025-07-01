import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CorrectionController } from './correction.controller';
import { CorrectionService } from './correction.service';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    // Importamos o HttpModule para que o CorrectionService possa usá-lo
    HttpModule.register({
      timeout: 10000, // Timeout de 10 segundos
      maxRedirects: 5,
    }),
    HistoryModule,
  ],
  controllers: [CorrectionController],
  providers: [CorrectionService],
})
export class CorrectionModule {}
