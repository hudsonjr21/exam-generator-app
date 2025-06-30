import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';

const QUESTION_BANKS_DIR = path.join(process.cwd(), 'data', 'question_banks');

@Controller('csv')
export class CsvController {
  constructor() {
    // Garante que o diretório de bancos de questões exista
    if (!fs.existsSync(QUESTION_BANKS_DIR)) {
      fs.mkdirSync(QUESTION_BANKS_DIR, { recursive: true });
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' é o nome do campo no form-data
  uploadCsv(
    @UploadedFile() file: Express.Multer.File,
    @Body('fileName') fileName: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado.');
    }
    if (!fileName) {
      throw new BadRequestException('O nome do arquivo é obrigatório.');
    }
    if (path.extname(file.originalname).toLowerCase() !== '.csv') {
      throw new BadRequestException(
        'Arquivo inválido. Apenas .csv é permitido.',
      );
    }

    // Limpa o nome do arquivo para evitar problemas de caminho
    const safeFileName = path.basename(fileName, '.csv') + '.csv';
    const filePath = path.join(QUESTION_BANKS_DIR, safeFileName);

    // Salva o arquivo no disco, sobrescrevendo se já existir
    fs.writeFileSync(filePath, file.buffer);

    return {
      message: 'Banco de questões salvo com sucesso!',
      fileName: safeFileName,
    };
  }

  @Get('list')
  listCsvs() {
    const files = fs.readdirSync(QUESTION_BANKS_DIR);
    // Filtra para retornar apenas os arquivos .csv
    return files.filter((file) => path.extname(file).toLowerCase() === '.csv');
  }
}
