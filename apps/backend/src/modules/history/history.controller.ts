import { Controller, Delete, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  findAll() {
    return this.historyService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.historyService.remove(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findOne(id);
  }
}
