import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubmitAnswerDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  @IsString()
  textValue?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileType?: string;

  @IsOptional()
  @IsInt()
  duration?: number;

  @IsOptional()
  @IsString()
  aiFollowUpText?: string;

  @IsOptional()
  @IsString()
  aiFollowUpAnswer?: string;
}

export class StartResponseDto {
  @IsString()
  @MinLength(1)
  respondentName!: string;

  @IsEmail()
  respondentEmail!: string;
}

export class SubmitResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  answers!: SubmitAnswerDto[];

  @IsOptional()
  @IsInt()
  duration?: number;
}

export class UpdateResponseDto {
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  content!: string;
}
