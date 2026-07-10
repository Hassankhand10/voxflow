import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  StartResponseDto,
  SubmitResponseDto,
  UpdateResponseDto,
  CreateCommentDto,
} from './responses.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ResponsesService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async findAll(workspaceId: string) {
    return this.prisma.response.findMany({
      where: { flow: { workspaceId } },
      include: {
        flow: { select: { id: true, name: true } },
        answers: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, workspaceId: string) {
    const response = await this.prisma.response.findFirst({
      where: { id, flow: { workspaceId } },
      include: {
        flow: { select: { id: true, name: true } },
        answers: { include: { question: true } },
        comments: {
          include: { user: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!response) throw new NotFoundException('Response not found');
    return response;
  }

  async start(slug: string, dto: StartResponseDto) {
    const flow = await this.prisma.flow.findUnique({ where: { slug } });
    if (!flow || flow.status !== 'PUBLISHED') {
      throw new NotFoundException('Flow not found');
    }

    return this.prisma.response.create({
      data: {
        flowId: flow.id,
        respondentName: dto.respondentName,
        respondentEmail: dto.respondentEmail,
        status: 'IN_PROGRESS',
      },
    });
  }

  async submit(responseId: string, dto: SubmitResponseDto) {
    const response = await this.prisma.response.findUnique({
      where: { id: responseId },
      include: { flow: { include: { workspace: { include: { members: true } } } } },
    });
    if (!response) throw new NotFoundException('Response not found');

    await this.prisma.answer.createMany({
      data: dto.answers.map((a) => ({
        responseId,
        questionId: a.questionId,
        textValue: a.textValue,
        fileUrl: a.fileUrl,
        fileType: a.fileType,
        duration: a.duration,
        aiFollowUpText: a.aiFollowUpText,
        aiFollowUpAnswer: a.aiFollowUpAnswer,
      })),
    });

    const updated = await this.prisma.response.update({
      where: { id: responseId },
      data: {
        status: 'PROCESSING',
        duration: dto.duration ?? 0,
        submittedAt: new Date(),
      },
    });

    await this.aiService.queueProcessing(responseId);

    const ownerId = response.flow.workspace.members.find(
      (m) => m.role === 'OWNER',
    )?.userId;

    if (ownerId) {
      await this.prisma.notification.create({
        data: {
          type: 'NEW_RESPONSE',
          title: 'New Response',
          message: `${response.respondentName} submitted a response to ${response.flow.name}`,
          userId: ownerId,
        },
      });
    }

    return updated;
  }

  async update(id: string, workspaceId: string, dto: UpdateResponseDto) {
    await this.findOne(id, workspaceId);
    return this.prisma.response.update({ where: { id }, data: dto });
  }

  async addComment(
    id: string,
    workspaceId: string,
    userId: string,
    dto: CreateCommentDto,
  ) {
    await this.findOne(id, workspaceId);
    return this.prisma.comment.create({
      data: { responseId: id, userId, content: dto.content },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }
}
