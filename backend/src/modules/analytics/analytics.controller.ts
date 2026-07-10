import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CurrentUser } from '../../common/decorators';

@Controller('analytics')
export class AnalyticsController {
  constructor(private prisma: PrismaService) {}

  @Get('overview')
  async getOverview(@CurrentUser() user: { workspaceId: string }) {
    const workspaceId = user.workspaceId;

    const [
      flowCount,
      publishedFlows,
      responses,
      completedResponses,
      inProgressResponses,
      processingResponses,
      recentResponses,
      flows,
      monthlyData,
    ] = await Promise.all([
      this.prisma.flow.count({ where: { workspaceId } }),
      this.prisma.flow.count({
        where: { workspaceId, status: 'PUBLISHED' },
      }),
      this.prisma.response.count({
        where: { flow: { workspaceId } },
      }),
      this.prisma.response.count({
        where: { flow: { workspaceId }, status: 'COMPLETED' },
      }),
      this.prisma.response.count({
        where: { flow: { workspaceId }, status: 'IN_PROGRESS' },
      }),
      this.prisma.response.count({
        where: { flow: { workspaceId }, status: 'PROCESSING' },
      }),
      this.prisma.response.findMany({
        where: { flow: { workspaceId } },
        include: { flow: { select: { name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
      this.prisma.flow.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          updatedAt: true,
          _count: { select: { responses: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
      this.getMonthlyResponses(workspaceId),
    ]);

    const durations = await this.prisma.response.findMany({
      where: { flow: { workspaceId } },
      select: { duration: true },
    });
    const avgDuration =
      durations.length > 0
        ? Math.round(
            durations.reduce((sum, r) => sum + r.duration, 0) / durations.length,
          )
        : 0;

    const completionRate =
      responses > 0 ? Math.round((completedResponses / responses) * 100) : 0;

    const thisMonth = monthlyData[monthlyData.length - 1] ?? 0;
    const lastMonth = monthlyData[monthlyData.length - 2] ?? 0;
    const monthTrend =
      lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : thisMonth > 0
          ? 100
          : 0;

    const topFlows = [...flows]
      .sort((a, b) => b._count.responses - a._count.responses)
      .slice(0, 4)
      .map((flow) => ({
        id: flow.id,
        name: flow.name,
        slug: flow.slug,
        status: flow.status,
        responseCount: flow._count.responses,
      }));

    return {
      stats: {
        totalFlows: flowCount,
        publishedFlows,
        totalResponses: responses,
        completedResponses,
        inProgressResponses,
        processingResponses,
        completionRate,
        averageTimeSeconds: avgDuration,
        thisMonthResponses: thisMonth,
        monthTrend,
      },
      recentResponses: recentResponses.map((r) => ({
        id: r.id,
        respondentName: r.respondentName,
        respondentEmail: r.respondentEmail,
        status: r.status,
        duration: r.duration,
        aiScore: r.aiScore,
        createdAt: r.createdAt,
        flow: r.flow,
      })),
      recentFlows: flows.map((flow) => ({
        id: flow.id,
        name: flow.name,
        slug: flow.slug,
        status: flow.status,
        responseCount: flow._count.responses,
        updatedAt: flow.updatedAt,
      })),
      topFlows,
      monthlyData,
      monthLabels: this.getMonthLabels(),
    };
  }

  @Get('metrics')
  async getMetrics(@CurrentUser() user: { workspaceId: string }) {
    const workspaceId = user.workspaceId;

    const [responses, flows] = await Promise.all([
      this.prisma.response.findMany({
        where: { flow: { workspaceId } },
        select: {
          status: true,
          duration: true,
          createdAt: true,
          flowId: true,
        },
      }),
      this.prisma.flow.findMany({
        where: { workspaceId },
        select: {
          id: true,
          name: true,
          status: true,
          _count: { select: { responses: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const total = responses.length;
    const completed = responses.filter((r) => r.status === 'COMPLETED').length;
    const inProgress = responses.filter((r) => r.status === 'IN_PROGRESS').length;
    const processing = responses.filter((r) => r.status === 'PROCESSING').length;
    const avgDuration =
      total > 0
        ? Math.round(
            responses.reduce((sum, r) => sum + r.duration, 0) / total,
          )
        : 0;

    const monthlyData = await this.getMonthlyResponses(workspaceId);
    const monthLabels = this.getMonthLabels();

    return {
      totalResponses: total,
      completedResponses: completed,
      inProgressResponses: inProgress,
      processingResponses: processing,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      averageTimeSeconds: avgDuration,
      monthlyData,
      monthLabels,
      flows: flows.map((flow) => ({
        id: flow.id,
        name: flow.name,
        status: flow.status,
        responseCount: flow._count.responses,
      })),
    };
  }

  private getMonthLabels() {
    const now = new Date();
    const labels: string[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleString('en', { month: 'short' }));
    }
    return labels;
  }

  private async getMonthlyResponses(workspaceId: string) {
    const now = new Date();
    const months: number[] = [];

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await this.prisma.response.count({
        where: {
          flow: { workspaceId },
          createdAt: { gte: start, lt: end },
        },
      });
      months.push(count);
    }

    return months;
  }
}
