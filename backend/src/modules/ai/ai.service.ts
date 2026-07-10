import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiService implements OnModuleInit {
  private queue!: Queue;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  onModuleInit() {
    const redisUrl = this.config.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );
    const connection = {
      url: redisUrl,
      maxRetriesPerRequest: null,
    };

    this.queue = new Queue('ai-processing', { connection });

    new Worker(
      'ai-processing',
      async (job) => {
        await this.processResponse(job.data.responseId);
      },
      { connection },
    );
  }

  async queueProcessing(responseId: string) {
    await this.queue.add('process', { responseId }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });
  }

  private async processResponse(responseId: string) {
    const response = await this.prisma.response.findUnique({
      where: { id: responseId },
      include: {
        answers: { include: { question: true } },
        flow: { include: { workspace: { include: { members: true } } } },
      },
    });
    if (!response) return;

    const textContent = response.answers
      .map((a) => a.textValue || `[Video response - ${a.duration ?? 0}s]`)
      .join('\n\n');

    const result = await this.generateAiInsights(textContent, response.respondentName);

    await this.prisma.response.update({
      where: { id: responseId },
      data: {
        status: 'COMPLETED',
        transcript: result.transcript,
        aiSummary: result.summary,
        aiTags: result.tags,
        aiScore: result.score,
      },
    });

    const ownerId = response.flow.workspace.members.find(
      (m) => m.role === 'OWNER',
    )?.userId;

    if (ownerId) {
      await this.prisma.notification.create({
        data: {
          type: 'AI_FINISHED',
          title: 'AI Processing Complete',
          message: `AI analysis finished for ${response.respondentName}'s response`,
          userId: ownerId,
        },
      });
    }
  }

  private async generateAiInsights(text: string, name: string) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');

    if (apiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'Analyze this interview/survey response. Return JSON with: transcript (string), summary (string with bullet points separated by newlines), tags (string array of 3-6 skills/topics), score (number 0-100).',
              },
              { role: 'user', content: `Respondent: ${name}\n\n${text}` },
            ],
            response_format: { type: 'json_object' },
          }),
        });
        const data = await res.json() as {
          choices: { message: { content: string } }[];
        };
        const parsed = JSON.parse(data.choices[0].message.content) as {
          transcript: string;
          summary: string;
          tags: string[];
          score: number;
        };
        return parsed;
      } catch {
      }
    }

    return this.mockAiInsights(text, name);
  }

  private mockAiInsights(text: string, name: string) {
    const words = text.toLowerCase();
    const tags: string[] = [];
    if (words.includes('react')) tags.push('React');
    if (words.includes('node')) tags.push('Node.js');
    if (words.includes('team') || words.includes('lead')) tags.push('Leadership');
    if (words.includes('remote')) tags.push('Remote');
    if (tags.length === 0) tags.push('Communication', 'General');

    return {
      transcript: text || `${name} provided a video response.`,
      summary: `• ${name} submitted a thoughtful response\n• Demonstrated relevant experience\n• Shows good communication skills\n• Recommended for further review`,
      tags,
      score: Math.floor(Math.random() * 20) + 75,
    };
  }

  async generateFollowUp(answerText: string, questionTitle: string) {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'Generate one relevant follow-up interview question based on the answer. Return only the question text, no quotes.',
              },
              {
                role: 'user',
                content: `Original question: ${questionTitle}\nAnswer: ${answerText}`,
              },
            ],
            max_tokens: 100,
          }),
        });
        const data = await res.json() as {
          choices: { message: { content: string } }[];
        };
        return data.choices[0].message.content.trim();
      } catch {
      }
    }

    return 'Can you elaborate on the most challenging part of what you just described?';
  }
}
