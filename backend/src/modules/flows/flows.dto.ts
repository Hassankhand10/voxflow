import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FlowStatus, QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsInt()
  order!: number;

  @IsOptional()
  @IsInt()
  timeLimit?: number;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsBoolean()
  aiFollowUp?: boolean;

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsBoolean()
  isThankYou?: boolean;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  mediaType?: string;
}

export class CreateFlowDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class UpdateFlowDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(FlowStatus)
  status?: FlowStatus;

  @IsOptional()
  @IsBoolean()
  requireEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRetakes?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions?: CreateQuestionDto[];
}

export class UpdateShareSettingsDto {
  @IsOptional()
  @IsBoolean()
  requireEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRetakes?: boolean;

  @IsOptional()
  @IsBoolean()
  passwordProtected?: boolean;

  @IsOptional()
  @IsString()
  password?: string;
}
