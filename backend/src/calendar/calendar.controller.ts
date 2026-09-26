import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('month')
  getMonthActivity(@Query('year') year?: string, @Query('month') month?: string) {
    const now = new Date();
    const y = year ? parseInt(year, 10) : now.getFullYear();
    const m = month ? parseInt(month, 10) : now.getMonth() + 1;
    return this.calendarService.getMonthActivity(y, m);
  }

  @Get('range')
  getDateRangeActivity(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    return this.calendarService.getDateRangeActivity(startDate, endDate);
  }
}
