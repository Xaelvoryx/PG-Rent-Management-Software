import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RentStatus, TenantStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private getCurrentMonthString(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  async getSummary(rentMonth?: string) {
    const targetMonth = rentMonth || this.getCurrentMonthString();

    const [property, activeTenantsCount, rents, todayPayments] = await Promise.all([
      this.prisma.property.findFirst(),
      this.prisma.tenant.count({
        where: { status: { in: [TenantStatus.ACTIVE, TenantStatus.NOTICE_PERIOD] } },
      }),
      this.prisma.rent.findMany({
        where: { rentMonth: targetMonth },
        include: { tenant: true, payments: true },
      }),
      this.prisma.payment.findMany({
        where: {
          paymentDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999)),
          },
        },
        include: { tenant: true, receipt: true },
        orderBy: { paymentDate: 'desc' },
      }),
    ]);

    let totalExpected = 0;
    let totalCollected = 0;
    let totalPendingAmount = 0;
    let totalOverdueAmount = 0;

    let paidTenantsCount = 0;
    let partialTenantsCount = 0;
    let pendingTenantsCount = 0;
    let overdueTenantsCount = 0;

    const overdueList: any[] = [];
    const pendingList: any[] = [];

    for (const r of rents) {
      const amount = Number(r.amount);
      const paid = Number(r.paidAmount);
      const remaining = Number(r.remainingAmount);

      totalExpected += amount;
      totalCollected += paid;

      if (r.status === RentStatus.PAID) {
        paidTenantsCount++;
      } else if (r.status === RentStatus.PARTIAL) {
        partialTenantsCount++;
        totalPendingAmount += remaining;
        pendingList.push({
          rentId: r.id,
          tenantId: r.tenantId,
          tenantName: r.tenant.fullName,
          roomNumber: r.tenant.roomNumber,
          phone: r.tenant.phone,
          amount,
          paidAmount: paid,
          remainingAmount: remaining,
          status: r.status,
          dueDate: r.dueDate,
        });
      } else if (r.status === RentStatus.OVERDUE) {
        overdueTenantsCount++;
        totalOverdueAmount += remaining;
        overdueList.push({
          rentId: r.id,
          tenantId: r.tenantId,
          tenantName: r.tenant.fullName,
          roomNumber: r.tenant.roomNumber,
          phone: r.tenant.phone,
          amount,
          paidAmount: paid,
          remainingAmount: remaining,
          status: r.status,
          dueDate: r.dueDate,
        });
      } else if (r.status === RentStatus.PENDING || r.status === RentStatus.UPCOMING) {
        pendingTenantsCount++;
        totalPendingAmount += remaining;
        pendingList.push({
          rentId: r.id,
          tenantId: r.tenantId,
          tenantName: r.tenant.fullName,
          roomNumber: r.tenant.roomNumber,
          phone: r.tenant.phone,
          amount,
          paidAmount: paid,
          remainingAmount: remaining,
          status: r.status,
          dueDate: r.dueDate,
        });
      }
    }

    const collectionPercentage = totalExpected > 0 ? ((totalCollected / totalExpected) * 100).toFixed(1) : '0.0';

    return {
      rentMonth: targetMonth,
      propertyName: property?.name || 'Sunshine PG',
      cards: {
        totalExpected,
        totalCollected,
        totalPendingAmount,
        totalOverdueAmount,
        collectionPercentage: parseFloat(collectionPercentage),
        activeTenantsCount,
        paidTenantsCount,
        partialTenantsCount,
        pendingTenantsCount,
        overdueTenantsCount,
      },
      todayPayments: todayPayments.map((p) => ({
        id: p.id,
        tenantName: p.tenant.fullName,
        roomNumber: p.tenant.roomNumber,
        amount: Number(p.amount),
        method: p.paymentMethod,
        receiptNumber: p.receipt?.receiptNumber,
        time: p.paymentDate,
      })),
      overdueList,
      pendingList,
    };
  }
}
