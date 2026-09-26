import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    let dbStatus = 'UP';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = 'DOWN';
    }

    return {
      status: dbStatus === 'UP' ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      service: 'PG Rent Manager API',
      database: dbStatus,
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
