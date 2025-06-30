import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

const QUESTION_BANKS_DIR = path.join(process.cwd(), 'data', 'question_banks');
// Interface interna que inclui a resposta correta
export interface IQuestionWithAnswer {
  id: string;
  subject: string;
  prompt: string;
  options: string[];
  answerKey: string;
}

@Injectable()
export class ExamCsvRepository {
  // O construtor agora é vazio
  constructor() {}

  // A função agora recebe o nome do arquivo e retorna uma Promise
  private loadQuestionsFromCsv(
    fileName: string,
  ): Promise<IQuestionWithAnswer[]> {
    return new Promise((resolve, reject) => {
      const questions: IQuestionWithAnswer[] = [];
      const csvPath = path.join(QUESTION_BANKS_DIR, fileName);

      if (!fs.existsSync(csvPath)) {
        return reject(
          new NotFoundException(
            `Banco de questões '${fileName}' não encontrado.`,
          ),
        );
      }

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          const question: IQuestionWithAnswer = {
            id: row.id,
            subject: row.subject,
            prompt: row.prompt,
            options: row.options ? row.options.split(';') : [],
            answerKey: row.answerKey,
          };
          questions.push(question);
        })
        .on('end', () => {
          console.log(
            `CSV file '${fileName}' successfully processed. Questions loaded:`,
            questions.length,
          );
          resolve(questions);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  // O método findAll agora é assíncrono e chama o load
  async findAll(fileName: string): Promise<IQuestionWithAnswer[]> {
    return this.loadQuestionsFromCsv(fileName);
  }

  // O método getSubjectsWithCounts também precisa ser atualizado
  async getSubjectsWithCounts(fileName: string): Promise<any[]> {
    const questions = await this.loadQuestionsFromCsv(fileName);

    // Usa um reduce para agrupar e contar os tipos de questão por matéria
    const subjectData = questions.reduce(
      (acc, question) => {
        if (!acc[question.subject]) {
          acc[question.subject] = { objectiveCount: 0, discursiveCount: 0 };
        }

        // Se a questão tem opções, é objetiva. Se não, é discursiva.
        if (question.options.length > 0) {
          acc[question.subject].objectiveCount++;
        } else {
          acc[question.subject].discursiveCount++;
        }

        return acc;
      },
      {} as Record<string, { objectiveCount: number; discursiveCount: number }>,
    );

    // Transforma o objeto em um array no formato que o frontend espera
    return Object.entries(subjectData).map(([subject, counts]) => ({
      subject,
      ...counts,
    }));
  }
}
