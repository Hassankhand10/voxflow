import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { FlowsModule } from '../flows/flows.module';
import { ResponsesModule } from '../responses/responses.module';

@Module({
  imports: [FlowsModule, ResponsesModule],
  controllers: [PublicController],
})
export class PublicModule {}
