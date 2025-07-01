import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Body,
  BadRequestException,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CorrectionService } from './correction.service';

@Controller('correction')
export class CorrectionController {
  constructor(private readonly correctionService: CorrectionService) {}

  @Post('start')
  // CORREÇÃO: Usamos FileFieldsInterceptor para aceitar campos com nomes diferentes
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'student_list', maxCount: 1 },
      { name: 'answer_sheets' },
    ]),
  )
  startCorrection(
    // CORREÇÃO: A forma de receber os arquivos agora é um objeto
    @UploadedFiles()
    files: {
      student_list?: Express.Multer.File[];
      answer_sheets?: Express.Multer.File[];
    },
    @Body('historyId') historyId: string,
    @Body('examValue') examValue: string,
  ) {
    // CORREÇÃO: Extraímos os arquivos do objeto 'files'
    const studentListFile = files.student_list?.[0];
    const answerSheets = files.answer_sheets || [];

    if (!studentListFile || answerSheets.length === 0) {
      throw new BadRequestException(
        'É necessário enviar a lista de alunos e os cartões-resposta.',
      );
    }

    // Chama o serviço que vai comunicar com Python
    return this.correctionService.processCorrection({
      studentListFile,
      answerSheets,
      historyId,
      examValue: parseFloat(examValue),
    });
  }
}
