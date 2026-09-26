import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsEnum, IsEmail } from 'class-validator';
import { TenantStatus } from '@prisma/client';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @IsString()
  @IsOptional()
  bedNumber?: string;

  @IsNumber()
  @IsNotEmpty()
  monthlyRent: number;

  @IsNumber()
  @IsNotEmpty()
  depositAmount: number;

  @IsDateString()
  @IsNotEmpty()
  joiningDate: string;

  @IsDateString()
  @IsOptional()
  expectedCheckoutDate?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  alternatePhone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  emergencyContactName?: string;

  @IsString()
  @IsOptional()
  emergencyContactPhone?: string;

  @IsString()
  @IsOptional()
  roomNumber?: string;

  @IsString()
  @IsOptional()
  bedNumber?: string;

  @IsNumber()
  @IsOptional()
  monthlyRent?: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsDateString()
  @IsOptional()
  joiningDate?: string;

  @IsDateString()
  @IsOptional()
  expectedCheckoutDate?: string;

  @IsDateString()
  @IsOptional()
  actualCheckoutDate?: string;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
