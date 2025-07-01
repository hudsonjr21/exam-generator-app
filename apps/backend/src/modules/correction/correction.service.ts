import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as FormData from 'form-data';
import * as csv from 'csv-parser';
import { Readable } from 'stream';
import { HistoryService } from '../history/history.service';
import { ICorrectionResult } from '@exam-generator/core/src/correction.interface';

interface CorrectionPayload {
  studentListFile: Express.Multer.File;
  answerSheets: Express.Multer.File[];
  historyId: string;
  examValue: number;
}

@Injectable()
export class CorrectionService {
  constructor(
    private readonly httpService: HttpService,
    private readonly historyService: HistoryService,
  ) {}

  private async parseStudentList(
    file: Express.Multer.File,
  ): Promise<Map<string, string>> {
    const students = new Map<string, string>();
    const stream = Readable.from(file.buffer);
    return new Promise((resolve, reject) => {
      stream
        .pipe(csv({ mapHeaders: ({ header }) => header.trim() }))
        .on('data', (row) => {
          // Assume que as colunas se chamam 'call_number' e 'student_name'
          if (row.call_number && row.student_name) {
            students.set(row.call_number, row.student_name);
          }
        })
        .on('end', () => resolve(students))
        .on('error', reject);
    });
  }

  async processCorrection(payload: CorrectionPayload) {
    const { studentListFile, answerSheets, historyId, examValue } = payload;

    // 1. Busca o histórico da prova no banco de dados para pegar os gabaritos
    const historyItem = await this.historyService.findOne(historyId);
    if (!historyItem) {
      throw new NotFoundException('Histórico da prova não encontrado.');
    }
    const examsData = historyItem.exams as any[];

    // 2. Processa a lista de alunos para criar um mapa de "número -> nome"
    const studentMap = await this.parseStudentList(studentListFile);

    // 3. Envia os cartões para o serviço Python OMR
    const formData = new FormData();
    // Adiciona o arquivo da lista de alunos ao form-data para o Python
    formData.append(
      'student_list',
      studentListFile.buffer,
      studentListFile.originalname,
    );

    answerSheets.forEach((file) => {
      formData.append('answer_sheets', file.buffer, file.originalname);
    });

    const pythonApiUrl = 'http://127.0.0.1:5000/process'; // O serviço Python precisa estar rodando
    let omrResults;
    try {
      const response = await firstValueFrom(
        this.httpService.post(pythonApiUrl, formData, {
          headers: formData.getHeaders(),
        }),
      );
      omrResults = response.data.results;
    } catch (error) {
      console.error(
        'Erro ao comunicar com o serviço Python:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Falha ao comunicar com o serviço de OMR em Python.',
      );
    }

    // 4. Calcula as notas
    const finalGrades: ICorrectionResult[] = [];
    const totalQuestions = examsData[0]?.questions.length || 1;
    const pointsPerQuestion = examValue / totalQuestions;

    for (const result of omrResults) {
      // Pula se o processamento da imagem no Python deu erro
      if (result.data.error) {
        console.warn(
          `Erro ao processar ${result.originalFileName}: ${result.data.error}`,
        );
        continue;
      }

      // AGORA USAMOS OS DADOS REAIS VINDOS DO PYTHON
      const studentId = result.data.student_id;
      const examVersion = result.data.exam_version;

      // Validação para garantir que o OMR conseguiu ler os dados essenciais
      if (
        !studentId ||
        !examVersion ||
        studentId === 'N/A' ||
        examVersion === 'N/A'
      ) {
        console.warn(
          `Não foi possível identificar ID ou Versão da Prova para ${result.originalFileName}.`,
        );
        continue;
      }

      // Busca o nome do aluno no mapa que criamos a partir do CSV
      const studentName =
        studentMap.get(studentId) || `Aluno Desconhecido #${studentId}`;

      // Encontra o gabarito correto para a versão da prova lida da imagem
      const correctExam = examsData.find((e) => e.version === examVersion);

      if (!correctExam) {
        console.warn(
          `Gabarito para a prova versão ${examVersion} não encontrado no histórico.`,
        );
        continue; // Pula se não encontrar o gabarito correspondente
      }

      let correctAnswersCount = 0;
      const studentAnswers = result.data.answers;

      // Compara cada resposta do aluno com o gabarito correto
      for (const questionNumber in studentAnswers) {
        const studentAnswer = studentAnswers[questionNumber];
        const correctAnswerItem = correctExam.answerKey.find(
          (ans: any) => ans.questionId == questionNumber,
        );

        if (
          correctAnswerItem &&
          studentAnswer === correctAnswerItem.correctAnswer
        ) {
          correctAnswersCount++;
        }
      }

      finalGrades.push({
        callNumber: studentId,
        studentName,
        examVersion,
        correctAnswers: correctAnswersCount,
        totalQuestions,
        score: correctAnswersCount * pointsPerQuestion,
      });
    }

    // LÓGICA FUTURA: Atualizar o status da prova no histórico para "Corrigido"
    // await this.historyService.updateStatus(historyId, 'Corrigido');

    return finalGrades;
  }
}
