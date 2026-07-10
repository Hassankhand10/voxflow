import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { FlowsService } from './flows.service';
import {
  CreateFlowDto,
  UpdateFlowDto,
  UpdateShareSettingsDto,
} from './flows.dto';
import { CurrentUser } from '../../common/decorators';

@Controller('flows')
export class FlowsController {
  constructor(private flowsService: FlowsService) {}

  @Get()
  listFlows(@CurrentUser() user: { workspaceId: string }) {
    return this.flowsService.findAll(user.workspaceId);
  }

  @Post()
  createFlow(
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: CreateFlowDto,
  ) {
    return this.flowsService.create(user.workspaceId, dto);
  }

  @Get(':flowId')
  getFlow(
    @Param('flowId') flowId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.flowsService.findOne(flowId, user.workspaceId);
  }

  @Patch(':flowId')
  updateFlow(
    @Param('flowId') flowId: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: UpdateFlowDto,
  ) {
    return this.flowsService.update(flowId, user.workspaceId, dto);
  }

  @Post(':flowId/publication')
  publishFlow(
    @Param('flowId') flowId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.flowsService.publish(flowId, user.workspaceId);
  }

  @Patch(':flowId/sharing-settings')
  updateSharingSettings(
    @Param('flowId') flowId: string,
    @CurrentUser() user: { workspaceId: string },
    @Body() dto: UpdateShareSettingsDto,
  ) {
    return this.flowsService.updateShareSettings(flowId, user.workspaceId, dto);
  }

  @Delete(':flowId')
  deleteFlow(
    @Param('flowId') flowId: string,
    @CurrentUser() user: { workspaceId: string },
  ) {
    return this.flowsService.remove(flowId, user.workspaceId);
  }
}
