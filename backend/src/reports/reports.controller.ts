import { Controller, Get, Query, Res } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { Response } from 'express';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  async getMonthlyRentReport(@Query('rentMonth') rentMonth?: string) {
    return this.reportsService.getMonthlyRentReport(rentMonth);
  }

  @Get('monthly/csv')
  async exportMonthlyRentCsv(@Query('rentMonth') rentMonth: string, @Res() res: Response) {
    const report = await this.reportsService.getMonthlyRentReport(rentMonth);
    const csv = this.reportsService.generateCsv(report, 'MONTHLY_RENT');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="Monthly_Rent_Report_${rentMonth || 'current'}.csv"`,
    });
    res.send(csv);
  }

  @Get('tenant')
  async getTenantPaymentReport(@Query('tenantId') tenantId?: string) {
    return this.reportsService.getTenantPaymentReport(tenantId);
  }

  @Get('daily')
  async getDailyCollectionReport(@Query('date') date?: string) {
    return this.reportsService.getDailyCollectionReport(date);
  }

  @Get('daily/csv')
  async exportDailyCollectionCsv(@Query('date') date: string, @Res() res: Response) {
    const report = await this.reportsService.getDailyCollectionReport(date);
    const csv = this.reportsService.generateCsv(report, 'DAILY_COLLECTION');

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="Daily_Collection_Report_${date || 'today'}.csv"`,
    });
    res.send(csv);
  }

  @Get('range')
  async getCustomRangeReport(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.reportsService.getCustomRangeReport(startDate, endDate);
  }
}
