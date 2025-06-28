import { Controller, Get } from '@nestjs/common';
// Importando nossa interface do pacote compartilhado!
import { IQuestion } from '@exam-generator/core/src/question.interface';

@Controller('exams') // Todas as rotas aqui começarão com /exams
export class ExamsController {
  @Get('generate') // Rota final: GET /exams/generate
  generateExam(): { questions: IQuestion[] } {
    // DADOS MOCKADOS (por enquanto)
    const mockQuestions: IQuestion[] = [
      {
        id: '1',
        subject: 'Math',
        prompt: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
      },
      {
        id: '2',
        subject: 'History',
        prompt: 'Who was the first president of the United States?',
        options: ['Abraham Lincoln', 'Thomas Jefferson', 'George Washington'],
      },
    ];

    console.log('API endpoint /exams/generate was hit!');
    return { questions: mockQuestions };
  }
}
