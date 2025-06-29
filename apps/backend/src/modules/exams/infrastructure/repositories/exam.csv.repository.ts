import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';

// Interface interna que inclui a resposta correta
interface IQuestionWithAnswer {
  id: string;
  subject: string;
  prompt: string;
  options: string[];
  answerKey: string;
}

@Injectable()
export class ExamCsvRepository {
  // Agora o array interno guarda a questão completa, com a resposta
  private readonly questions: IQuestionWithAnswer[] = [];

  constructor() {
    this.loadQuestionsFromCsv();
  }

  private loadQuestionsFromCsv(): void {
    const csvPath = path.join(process.cwd(), 'questions.csv');

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: Record<string, string>) => {
        const question: IQuestionWithAnswer = {
          id: row.id,
          subject: row.subject,
          prompt: row.prompt,
          options: row.options ? row.options.split(';') : [],
          answerKey: row.answerKey, // Agora lemos a resposta correta
        };
        this.questions.push(question);
      })
      .on('end', () => {
        console.log(
          'CSV file successfully processed. Questions loaded:',
          this.questions.length,
        );
      });
  }

  findAll(): IQuestionWithAnswer[] {
    return this.questions;
  }

  getSubjectsWithCounts(): { subject: string; count: number }[] {
    const subjectCounts: Record<string, number> = {};

    // Conta as questões para cada matéria
    for (const question of this.questions) {
      if (!subjectCounts[question.subject]) {
        subjectCounts[question.subject] = 0;
      }
      subjectCounts[question.subject]++;
    }

    // Transforma o objeto em um array no formato que queremos
    return Object.entries(subjectCounts).map(([subject, count]) => ({
      subject,
      count,
    }));
  }
}
