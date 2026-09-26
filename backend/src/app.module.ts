import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { RentsModule } from './rents/rents.module';
import { PaymentsModule } from './payments/payments.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { CalendarModule } from './calendar/calendar.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { SettingsModule } from './settings/settings.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TenantsModule,
    RentsModule,
    PaymentsModule,
    ReceiptsModule,
    CalendarModule,
    WhatsAppModule,
    DashboardModule,
    ReportsModule,
    SettingsModule,
    AuditModule,
    HealthModule,
  ],
})
export class AppModule {}
