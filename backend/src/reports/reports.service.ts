import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getMonthlyRentReport(rentMonth?: string) {
    const targetMonth = rentMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

    const rents = await this.prisma.rent.findMany({
      where: { rentMonth: targetMonth },
      include: { tenant: true, payments: true },
      orderBy: [{ tenant: { roomNumber: 'asc' } }, { createdAt: 'asc' }],
    });

    const totalExpected = rents.reduce((acc, r) => acc + Number(r.amount), 0);
    const totalCollected = rents.reduce((acc, r) => acc + Number(r.paidAmount), 0);
    const totalPending = rents.reduce((acc, r) => acc + Number(r.remainingAmount), 0);

    return {
      reportType: 'MONTHLY_RENT',
      rentMonth: targetMonth,
      totals: {
        totalTenants: rents.length,
        totalExpected,
        totalCollected,
        totalPending,
      },
      rows: rents.map((r) => ({
        tenantId: r.tenantId,
        tenantName: r.tenant.fullName,
        roomNumber: r.tenant.roomNumber,
        phone: r.tenant.phone,
        rentMonth: r.rentMonth,
        amount: Number(r.amount),
        paidAmount: Number(r.paidAmount),
        remainingAmount: Number(r.remainingAmount),
        status: r.status,
        dueDate: r.dueDate,
      })),
    };
  }

  async getTenantPaymentReport(tenantId?: string) {
    const where: any = {};
    if (tenantId) where.id = tenantId;

    const tenants = await this.prisma.tenant.findMany({
      where,
      include: {
        rents: { orderBy: { rentMonth: 'desc' } },
        payments: { orderBy: { paymentDate: 'desc' }, include: { receipt: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    return {
      reportType: 'TENANT_PAYMENT_HISTORY',
      generatedAt: new Date(),
      data: tenants.map((t) => {
        const totalRentBilled = t.rents.reduce((acc, r) => acc + Number(r.amount), 0);
        const totalPaid = t.payments.reduce((acc, p) => acc + Number(p.amount), 0);
        const currentOutstanding = totalRentBilled - totalPaid;

        return {
          tenantId: t.id,
          fullName: t.fullName,
          roomNumber: t.roomNumber,
          phone: t.phone,
          status: t.status,
          joiningDate: t.joiningDate,
          monthlyRent: Number(t.monthlyRent),
          totalRentBilled,
          totalPaid,
          currentOutstanding,
          rentsCount: t.rents.length,
          paymentsCount: t.payments.length,
          payments: t.payments.map((p) => ({
            paymentId: p.id,
            amount: Number(p.amount),
            paymentDate: p.paymentDate,
            paymentMethod: p.paymentMethod,
            referenceNumber: p.referenceNumber,
            receiptNumber: p.receipt?.receiptNumber,
          })),
        };
      }),
    };
  }

  async getDailyCollectionReport(dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const payments = await this.prisma.payment.findMany({
      where: { paymentDate: { gte: startOfDay, lte: endOfDay } },
      include: { tenant: true, rent: true, receipt: true },
      orderBy: { paymentDate: 'asc' },
    });

    const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount), 0);

    return {
      reportType: 'DAILY_COLLECTION',
      date: startOfDay.toISOString().split('T')[0],
      totalCollected,
      paymentCount: payments.length,
      payments: payments.map((p) => ({
        paymentId: p.id,
        receiptNumber: p.receipt?.receiptNumber,
        tenantName: p.tenant.fullName,
        roomNumber: p.tenant.roomNumber,
        rentMonth: p.rent.rentMonth,
        amount: Number(p.amount),
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        paymentTime: p.paymentDate,
      })),
    };
  }

  async getCustomRangeReport(startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);

    const [payments, rents] = await Promise.all([
      this.prisma.payment.findMany({
        where: { paymentDate: { gte: start, lte: end } },
        include: { tenant: true, rent: true, receipt: true },
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

    return {
      reportType: 'CUSTOM_RANGE',
      startDate: startDateStr,
      endDate: endDateStr,
      summary: {
        totalExpected,
        totalCollected,
        totalPending: Math.max(0, totalExpected - totalCollected),
        totalPayments: payments.length,
      },
      payments,
      rents,
    };
  }

  // Generate CSV data string
  generateCsv(reportData: any, type: string): string {
    if (type === 'MONTHLY_RENT') {
      const headers = ['Tenant Name', 'Room Number', 'Phone', 'Rent Month', 'Amount (₹)', 'Paid Amount (₹)', 'Remaining (₹)', 'Status'];
      const rows = reportData.rows.map((r: any) => [
        `"${r.tenantName}"`,
        `"${r.roomNumber}"`,
        `"${r.phone}"`,
        `"${r.rentMonth}"`,
        r.amount,
        r.paidAmount,
        r.remainingAmount,
        `"${r.status}"`,
      ]);
      return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    }

    if (type === 'DAILY_COLLECTION') {
      const headers = ['Receipt No', 'Tenant Name', 'Room Number', 'Rent Month', 'Amount (₹)', 'Payment Method', 'Reference No', 'Date & Time'];
      const rows = reportData.payments.map((p: any) => [
        `"${p.receiptNumber || ''}"`,
        `"${p.tenantName}"`,
        `"${p.roomNumber}"`,
        `"${p.rentMonth}"`,
        p.amount,
        `"${p.paymentMethod}"`,
        `"${p.referenceNumber || ''}"`,
        `"${new Date(p.paymentTime).toLocaleString('en-IN')}"`,
      ]);
      return [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    }

    // Default Fallback JSON to CSV
    return JSON.stringify(reportData, null, 2);
  }
}
