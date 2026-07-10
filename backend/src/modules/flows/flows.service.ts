import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFlowDto,
  UpdateFlowDto,
  UpdateShareSettingsDto,
} from './flows.dto';

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10);

@Injectable()
export class FlowsService {
  constructor(private prisma: PrismaService) {}

  async findAll(workspaceId: string) {
    const flows = await this.prisma.flow.findMany({
      where: { workspaceId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        _count: { select: { responses: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return flows.map((flow) => this.withStats(flow));
  }

  async findOne(id: string, workspaceId: string) {
    const flow = await this.prisma.flow.findFirst({
      where: { id, workspaceId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!flow) throw new NotFoundException('Flow not found');
    return flow;
  }

  async findBySlug(slug: string) {
    const flow = await this.prisma.flow.findUnique({
      where: { slug },
      include: {
        questions: {
          where: { isThankYou: false },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!flow || flow.status !== 'PUBLISHED') {
      throw new NotFoundException('Flow not found');
    }
    return {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      slug: flow.slug,
      requireEmail: flow.requireEmail,
      allowRetakes: flow.allowRetakes,
      questions: flow.questions,
    };
  }

  async create(workspaceId: string, dto: CreateFlowDto) {
    const slug = this.generateSlug(dto.name);
    const defaultQuestions = dto.questions ?? [
      {
        title: 'Tell us about yourself.',
        type: 'VIDEO' as const,
        order: 0,
        timeLimit: 120,
        required: true,
        aiFollowUp: true,
        placeholder: 'Record a short introduction...',
      },
      {
        title: 'What excites you about this opportunity?',
        type: 'VIDEO' as const,
        order: 1,
        timeLimit: 90,
        required: true,
        aiFollowUp: false,
      },
      {
        title: 'Anything else you would like to share?',
        type: 'TEXT' as const,
        order: 2,
        required: false,
        aiFollowUp: false,
        placeholder: 'Optional notes...',
      },
      {
        title: 'Thank you!',
        type: 'TEXT' as const,
        order: 3,
        required: false,
        aiFollowUp: false,
        isThankYou: true,
      },
    ];

    return this.prisma.flow.create({
      data: {
        name: dto.name,
        description: dto.description,
        slug,
        workspaceId,
        questions: { create: defaultQuestions },
      },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async update(id: string, workspaceId: string, dto: UpdateFlowDto) {
    await this.findOne(id, workspaceId);

    if (dto.questions) {
      await this.prisma.question.deleteMany({ where: { flowId: id } });
      await this.prisma.question.createMany({
        data: dto.questions.map((q) => ({ ...q, flowId: id })),
      });
    }

    const { questions: _, ...flowData } = dto;

    return this.prisma.flow.update({
      where: { id },
      data: flowData,
      include: { questions: { orderBy: { order: 'asc' } } },
    });
  }

  async publish(id: string, workspaceId: string) {
    return this.update(id, workspaceId, { status: 'PUBLISHED' });
  }

  async updateShareSettings(
    id: string,
    workspaceId: string,
    dto: UpdateShareSettingsDto,
  ) {
    await this.findOne(id, workspaceId);
    return this.prisma.flow.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, workspaceId: string) {
    await this.findOne(id, workspaceId);
    await this.prisma.flow.delete({ where: { id } });
    return { success: true };
  }

  private generateSlug(name: string) {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);
    return `${base}-${nanoid()}`;
  }

  private withStats(
    flow: {
      id: string;
      name: string;
      status: string;
      slug: string;
      updatedAt: Date;
      _count: { responses: number };
      questions: unknown[];
    },
  ) {
    return {
      ...flow,
      responseCount: flow._count.responses,
      questionCount: flow.questions.length,
    };
  }
}
