import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { Public } from '../../common/decorators';
import { IsString, MinLength } from 'class-validator';

class GenerateFollowUpQuestionDto {
  @IsString()
  @MinLength(1)
  answerText!: string;

  @IsString()
  @MinLength(1)
  questionTitle!: string;
}

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Public()
  @Post('follow-up-questions')
  async generateFollowUpQuestion(@Body() dto: GenerateFollowUpQuestionDto) {
    const question = await this.aiService.generateFollowUp(
      dto.answerText,
      dto.questionTitle,
    );
    return { question };
  }
}
