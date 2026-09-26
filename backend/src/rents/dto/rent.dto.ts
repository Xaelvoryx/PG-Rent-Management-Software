import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { RentStatus } from '@prisma/client';

export class GenerateRentDto {
  @IsString()
  @IsOptional()
  rentMonth?: string; // e.g., "2026-10"

  @IsNumber()
  @IsOptional()
  dueDay?: number; // 1 to 31
}

export class UpdateRentDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsEnum(RentStatus)
  @IsOptional()
  status?: RentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
