import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordPaymentDto } from './dto/payment.dto';
import { RentsService } from '../rents/rents.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private rentsService: RentsService,
  ) {}

  // Generate unique receipt number format: PG-YYYY-000001
  private async generateReceiptNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.receipt.count();
    const nextSeq = String(count + 1).padStart(6, '0');
    return `PG-${year}-${nextSeq}`;
  }

  async recordPayment(dto: RecordPaymentDto) {
    if (dto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const rent = await this.prisma.rent.findUnique({
      where: { id: dto.rentId },
    });
    if (!rent) throw new NotFoundException('Rent record not found');

    const remainingNum = Number(rent.remainingAmount);

    if (dto.amount > remainingNum + 0.01) {
      throw new BadRequestException(
        `Payment amount (₹${dto.amount}) cannot exceed the remaining due amount (₹${remainingNum})`,
      );
    }

    const property = await this.prisma.property.findFirst();
    const pgName = property ? property.name : 'Sunshine PG';

    // Execute in a database transaction to preserve financial integrity
    return await this.prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      const payment = await tx.payment.create({
        data: {
          tenantId: dto.tenantId,
          rentId: dto.rentId,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          paymentMethod: dto.paymentMethod,
          referenceNumber: dto.referenceNumber,
          notes: dto.notes,
        },
      });

      // 2. Recalculate Rent balances & status
      const updatedPaidAmount = Number(rent.paidAmount) + dto.amount;
      const updatedRemainingAmount = Math.max(0, Number(rent.amount) - updatedPaidAmount);

      const computedStatus = this.rentsService.calculateStatus({
        amount: rent.amount,
        paidAmount: updatedPaidAmount,
        dueDate: rent.dueDate,
        currentStatus: rent.status,
      });

      await tx.rent.update({
        where: { id: dto.rentId },
        data: {
          paidAmount: updatedPaidAmount,
          remainingAmount: updatedRemainingAmount,
          status: computedStatus,
        },
      });

      // 3. Generate Receipt
      const count = await tx.receipt.count();
      const year = new Date().getFullYear();
      const receiptNumber = `PG-${year}-${String(count + 1).padStart(6, '0')}`;

      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          tenantId: dto.tenantId,
          rentId: dto.rentId,
          paymentId: payment.id,
          amount: dto.amount,
          paymentDate: new Date(dto.paymentDate),
          paymentMethod: dto.paymentMethod,
          remainingAmount: updatedRemainingAmount,
          pgName,
        },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_RECORDED',
          entity: 'Payment',
          entityId: payment.id,
          details: JSON.stringify({
            tenantName: tenant.fullName,
            amount: dto.amount,
            receiptNumber,
            status: computedStatus,
          }),
        },
      });

      return {
        payment,
        receipt,
        rentStatus: computedStatus,
        remainingAmount: updatedRemainingAmount,
      };
    });
  }

  async findAll(params: {
    tenantId?: string;
    rentId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { tenantId, rentId, search, startDate, endDate, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.PaymentWhereInput = {};

    if (tenantId) where.tenantId = tenantId;
    if (rentId) where.rentId = rentId;

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.paymentDate.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { tenant: { fullName: { contains: search, mode: 'insensitive' } } },
        { tenant: { roomNumber: { contains: search, mode: 'insensitive' } } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
        { receipt: { receiptNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { paymentDate: 'desc' },
        include: {
          tenant: true,
          rent: true,
          receipt: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        tenant: true,
        rent: true,
        receipt: true,
      },
    });

    if (!payment) throw new NotFoundException(`Payment with ID "${id}" not found`);
    return payment;
  }
}
