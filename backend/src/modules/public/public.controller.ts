import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { FlowsService } from '../flows/flows.service';
import { ResponsesService } from '../responses/responses.service';
import { StartResponseDto, SubmitResponseDto } from '../responses/responses.dto';
import { Public } from '../../common/decorators';

@Controller('public')
export class PublicController {
  constructor(
    private flowsService: FlowsService,
    private responsesService: ResponsesService,
  ) {}

  @Public()
  @Get('flows/:slug')
  getPublishedFlow(@Param('slug') slug: string) {
    return this.flowsService.findBySlug(slug);
  }

  @Public()
  @Post('flows/:slug/response-sessions')
  createResponseSession(
    @Param('slug') slug: string,
    @Body() dto: StartResponseDto,
  ) {
    return this.responsesService.start(slug, dto);
  }

  @Public()
  @Post('response-sessions/:sessionId/completion')
  completeResponseSession(
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitResponseDto,
  ) {
    return this.responsesService.submit(sessionId, dto);
  }
}
