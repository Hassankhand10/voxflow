import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
} from '@nestjs/common';
import { ResponsesService } from './responses.service';
import {
  UpdateResponseDto,
  CreateCommentDto,
} from './responses.dto';
import { CurrentUser } from '../../common/decorators';

@Controller('responses')
export class ResponsesController {
  constructor(private responsesService: ResponsesService) {}

  @Get()
  listResponses(@CurrentUser() user: { workspaceId: string }) {
    return this.responsesService.findAll(user.workspaceId);
  }

  @Get(':responseId')
  getResponse(
    @Param('responseId') responseId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.responsesService.findOne(responseId, user.workspaceId);
  }

  @Patch(':responseId')
  updateResponse(
    @Param('responseId') responseId: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: UpdateResponseDto,
  ) {
    return this.responsesService.update(responseId, user.workspaceId, dto);
  }

  @Post(':responseId/comments')
  createComment(
    @Param('responseId') responseId: string,
    @CurrentUser() user: { id: string; workspaceId: string },
    @Body() dto: CreateCommentDto,
  ) {
    return this.responsesService.addComment(
      responseId,
      user.workspaceId,
      user.id,
      dto,
    );
  }
}
