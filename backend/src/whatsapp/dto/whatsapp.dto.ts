import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { TemplateType } from '@prisma/client';

export class SendWhatsAppMessageDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsEnum(TemplateType)
  @IsNotEmpty()
  templateType: TemplateType;

  @IsString()
  @IsOptional()
  rentId?: string;

  @IsString()
  @IsOptional()
  customMessage?: string;
}

export class UpdateTemplateDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  name?: string;
}
