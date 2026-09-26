import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateRentDto, UpdateRentDto } from './dto/rent.dto';
import { RentStatus, TenantStatus, Prisma } from '@prisma/client';

@Injectable()
export class RentsService {
  constructor(private prisma: PrismaService) {}

  // Current month string "YYYY-MM"
  private getCurrentMonthString(date: Date = new Date()): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  // Calculate rent status deterministically
  public calculateStatus(rent: {
    amount: number | Prisma.Decimal;
    paidAmount: number | Prisma.Decimal;
    dueDate: Date;
    currentStatus?: RentStatus;
  }): RentStatus {
    const amountNum = Number(rent.amount);
    const paidNum = Number(rent.paidAmount);

    if (rent.currentStatus === RentStatus.WAIVED) {
      return RentStatus.WAIVED;
    }

    if (paidNum >= amountNum) {
      return RentStatus.PAID;
    }

    if (paidNum > 0 && paidNum < amountNum) {
      return RentStatus.PARTIAL;
    }

    const now = new Date();
    // Reset hours to start of day for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(rent.dueDate.getFullYear(), rent.dueDate.getMonth(), rent.dueDate.getDate());

    if (due < today) {
      return RentStatus.OVERDUE;
    }

    if (due.getTime() === today.getTime()) {
      return RentStatus.PENDING;
    }

    return RentStatus.UPCOMING;
  }

  async generateMonthlyRents(dto?: GenerateRentDto) {
    const now = new Date();
    const targetMonthStr = dto?.rentMonth || this.getCurrentMonthString(now);

    const [yearStr, monthStr] = targetMonthStr.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;

    // Get default due day setting or fallback to 1st of month
    const dueDaySetting = await this.prisma.applicationSetting.findUnique({
      where: { key: 'DEFAULT_DUE_DAY' },
    });
    const dueDay = dto?.dueDay || (dueDaySetting ? parseInt(dueDaySetting.value, 10) : 1);

    // Handle month end cap (e.g. Feb 31 -> Feb 28/29)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const safeDueDay = Math.min(dueDay, daysInMonth);
    const dueDate = new Date(year, monthIndex, safeDueDay, 0, 0, 0, 0);

    // Find all active or notice period tenants
    const activeTenants = await this.prisma.tenant.findMany({
      where: {
        status: { in: [TenantStatus.ACTIVE, TenantStatus.NOTICE_PERIOD] },
      },
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const tenant of activeTenants) {
      // Check joining date - don't generate rent prior to joining month
      const joiningYear = tenant.joiningDate.getFullYear();
      const joiningMonth = tenant.joiningDate.getMonth();
      const rentMonthDate = new Date(year, monthIndex, 1);
      const tenantJoinMonthDate = new Date(joiningYear, joiningMonth, 1);

      if (rentMonthDate < tenantJoinMonthDate) {
        skippedCount++;
        continue;
      }

      // Check if rent record already exists for this tenant + rentMonth
      const existing = await this.prisma.rent.findUnique({
        where: {
          tenantId_rentMonth: {
            tenantId: tenant.id,
            rentMonth: targetMonthStr,
          },
        },
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Compute status based on due date
      const initialStatus = this.calculateStatus({
        amount: tenant.monthlyRent,
        paidAmount: 0,
        dueDate,
      });

      await this.prisma.rent.create({
        data: {
          tenantId: tenant.id,
          rentMonth: targetMonthStr,
          amount: tenant.monthlyRent,
          dueDate,
          paidAmount: 0.00,
          remainingAmount: tenant.monthlyRent,
          status: initialStatus,
          notes: `Generated monthly rent for ${targetMonthStr}`,
        },
      });

      createdCount++;
    }

    await this.prisma.auditLog.create({
      data: {
        action: 'RENT_GENERATED',
        entity: 'Rent',
        details: JSON.stringify({ rentMonth: targetMonthStr, createdCount, skippedCount }),
      },
    });

    return {
      message: `Rent generation complete for ${targetMonthStr}`,
      rentMonth: targetMonthStr,
      createdCount,
      skippedCount,
      totalActiveTenants: activeTenants.length,
    };
  }

  async recalculateStatus(rentId: string) {
    const rent = await this.prisma.rent.findUnique({
      where: { id: rentId },
      include: { payments: true },
    });

    if (!rent) throw new NotFoundException('Rent record not found');

    const totalPaid = rent.payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const rentAmount = Number(rent.amount);
    const remaining = Math.max(0, rentAmount - totalPaid);

    const newStatus = this.calculateStatus({
      amount: rentAmount,
      paidAmount: totalPaid,
      dueDate: rent.dueDate,
      currentStatus: rent.status,
    });

    return await this.prisma.rent.update({
      where: { id: rentId },
      data: {
        paidAmount: totalPaid,
        remainingAmount: remaining,
        status: newStatus,
      },
    });
  }

  async findAll(params: {
    rentMonth?: string;
    status?: RentStatus;
    tenantId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { rentMonth, status, tenantId, search, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.RentWhereInput = {};

    if (rentMonth) where.rentMonth = rentMonth;
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;

    if (search) {
      where.tenant = {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { roomNumber: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [rents, total] = await Promise.all([
      this.prisma.rent.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ rentMonth: 'desc' }, { dueDate: 'asc' }],
        include: {
          tenant: true,
          payments: {
            orderBy: { paymentDate: 'desc' },
          },
        },
      }),
      this.prisma.rent.count({ where }),
    ]);

    // Recalculate status dynamically for accurate overdue detection
    const updatedRents = await Promise.all(
      rents.map(async (r) => {
        const computedStatus = this.calculateStatus({
          amount: r.amount,
          paidAmount: r.paidAmount,
          dueDate: r.dueDate,
          currentStatus: r.status,
        });

        if (computedStatus !== r.status) {
          return await this.prisma.rent.update({
            where: { id: r.id },
            data: { status: computedStatus },
            include: { tenant: true, payments: true },
          });
        }
        return r;
      }),
    );

    return {
      data: updatedRents,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const rent = await this.prisma.rent.findUnique({
      where: { id },
      include: {
        tenant: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: { receipt: true },
        },
        receipts: true,
      },
    });

    if (!rent) throw new NotFoundException(`Rent record with ID "${id}" not found`);
    return rent;
  }

  async update(id: string, dto: UpdateRentDto) {
    const rent = await this.findOne(id);
    const updateData: Prisma.RentUpdateInput = {};

    if (dto.amount !== undefined) updateData.amount = dto.amount;
    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.rent.update({
      where: { id },
      data: updateData,
    });

    return await this.recalculateStatus(updated.id);
  }

  async waive(id: string, reason: string) {
    const rent = await this.findOne(id);

    const updated = await this.prisma.rent.update({
      where: { id },
      data: {
        status: RentStatus.WAIVED,
        notes: rent.notes ? `${rent.notes} | Waived: ${reason}` : `Waived: ${reason}`,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'RENT_WAIVED',
        entity: 'Rent',
        entityId: id,
        details: JSON.stringify({ reason }),
      },
    });

    return updated;
  }
}
