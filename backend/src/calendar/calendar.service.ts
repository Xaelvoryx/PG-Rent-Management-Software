import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getMonthActivity(year: number, month: number) {
    if (month < 1 || month > 12) {
      throw new BadRequestException('Month must be between 1 and 12');
    }

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Fetch payments in this month
    const payments = await this.prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tenant: true,
        receipt: true,
        rent: true,
      },
      orderBy: { paymentDate: 'asc' },
    });

    // Fetch rents due in this month
    const rentsDue = await this.prisma.rent.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        tenant: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    // Aggregate by date (YYYY-MM-DD string key)
    const dailyData: Record<
      string,
      {
        date: string;
        payments: any[];
        rentsDue: any[];
        totalCollected: number;
        totalDue: number;
      }
    > = {};

    const daysInMonth = endDate.getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = String(day).padStart(2, '0');
      const mStr = String(month).padStart(2, '0');
      const key = `${year}-${mStr}-${dayStr}`;

      dailyData[key] = {
        date: key,
        payments: [],
        rentsDue: [],
        totalCollected: 0,
        totalDue: 0,
      };
    }

    for (const p of payments) {
      const pDate = new Date(p.paymentDate);
      const key = `${pDate.getFullYear()}-${String(pDate.getMonth() + 1).padStart(2, '0')}-${String(pDate.getDate()).padStart(2, '0')}`;
      if (dailyData[key]) {
        dailyData[key].payments.push({
          id: p.id,
          tenantName: p.tenant.fullName,
          roomNumber: p.tenant.roomNumber,
          amount: Number(p.amount),
          paymentMethod: p.paymentMethod,
          receiptNumber: p.receipt?.receiptNumber,
          paymentDate: p.paymentDate,
        });
        dailyData[key].totalCollected += Number(p.amount);
      }
    }

    for (const r of rentsDue) {
      const dDate = new Date(r.dueDate);
      const key = `${dDate.getFullYear()}-${String(dDate.getMonth() + 1).padStart(2, '0')}-${String(dDate.getDate()).padStart(2, '0')}`;
      if (dailyData[key]) {
        dailyData[key].rentsDue.push({
          id: r.id,
          tenantName: r.tenant.fullName,
          roomNumber: r.tenant.roomNumber,
          amount: Number(r.amount),
          status: r.status,
          remainingAmount: Number(r.remainingAmount),
        });
        dailyData[key].totalDue += Number(r.amount);
      }
    }

    const totalCollectedMonth = Object.values(dailyData).reduce((sum, d) => sum + d.totalCollected, 0);
    const totalDueMonth = Object.values(dailyData).reduce((sum, d) => sum + d.totalDue, 0);

    return {
      year,
      month,
      summary: {
        totalCollected: totalCollectedMonth,
        totalDue: totalDueMonth,
        totalPaymentsCount: payments.length,
        totalDueCount: rentsDue.length,
      },
      dailyData,
    };
  }

  async getDateRangeActivity(startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format provided');
    }

    const [payments, rents] = await Promise.all([
      this.prisma.payment.findMany({
        where: { paymentDate: { gte: start, lte: end } },
        include: { tenant: true, receipt: true, rent: true },
        orderBy: { paymentDate: 'desc' },
      }),
      this.prisma.rent.findMany({
        where: { dueDate: { gte: start, lte: end } },
        include: { tenant: true },
        orderBy: { dueDate: 'asc' },
      }),
    ]);

    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpected = rents.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalPending = rents
      .filter((r) => r.status === 'PENDING' || r.status === 'PARTIAL')
      .reduce((sum, r) => sum + Number(r.remainingAmount), 0);
    const totalOverdue = rents
      .filter((r) => r.status === 'OVERDUE')
      .reduce((sum, r) => sum + Number(r.remainingAmount), 0);

    return {
      range: { startDate: startDateStr, endDate: endDateStr },
      totals: {
        totalExpected,
        totalCollected,
        totalPending,
        totalOverdue,
        paymentCount: payments.length,
        tenantsPaidCount: new Set(payments.map((p) => p.tenantId)).size,
      },
      payments,
      rents,
    };
  }
}
