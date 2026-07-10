import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FlowsModule } from './modules/flows/flows.module';
import { ResponsesModule } from './modules/responses/responses.module';
import { UploadModule } from './modules/upload/upload.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AiModule } from './modules/ai/ai.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    PrismaModule,
    AuthModule,
    FlowsModule,
    ResponsesModule,
    UploadModule,
    AnalyticsModule,
    AiModule,
    PublicModule,
  ],
})
export class AppModule {}
