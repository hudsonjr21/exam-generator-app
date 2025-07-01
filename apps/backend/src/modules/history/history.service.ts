import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { IExam } from '@exam-generator/core/src/exam.interface';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  // Função para criar um novo registo no histórico
  async create(name: string, details: any, exams: IExam[]) {
    return this.prisma.examHistory.create({
      data: {
        name,
        details: details as any,
        exams: exams as any, // O Prisma lida com JSON automaticamente
      },
    });
  }

  // Função para buscar todos os registos do histórico
  async findAll() {
    return this.prisma.examHistory.findMany({
      orderBy: {
        createdAt: 'desc', // Mostra os mais recentes primeiro
      },
    });
  }

  async remove(id: string) {
    const historyItem = await this.prisma.examHistory.findUnique({
      where: { id },
    });

    if (!historyItem) {
      throw new NotFoundException(`Histórico com ID "${id}" não encontrado.`);
    }

    // Regra de negócio: não permitir exclusão de provas já corrigidas
    if (historyItem.status === 'Corrigido') {
      throw new BadRequestException(
        'Não é possível excluir uma prova que já foi corrigida.',
      );
    }

    return this.prisma.examHistory.delete({
      where: { id },
    });
  }

  async findOne(id: string) {
    const historyItem = await this.prisma.examHistory.findUnique({
      where: { id },
    });
    if (!historyItem) {
      throw new NotFoundException(`Histórico com ID "${id}" não encontrado.`);
    }
    return historyItem;
  }
}
