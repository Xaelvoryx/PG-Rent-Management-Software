import { IsString, IsNotEmpty, IsNumber, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class RecordPaymentDto {
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  rentId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsDateString()
  @IsNotEmpty()
  paymentDate: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
