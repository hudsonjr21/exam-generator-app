import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService, PrismaService],
  exports: [HistoryService], // Exportamos o serviço para que outros módulos possam usá-lo
})
export class HistoryModule {}
