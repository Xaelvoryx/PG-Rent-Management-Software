import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getPropertyInfo() {
    let prop = await this.prisma.property.findFirst();
    if (!prop) {
      prop = await this.prisma.property.create({
        data: {
          name: 'Sunshine Luxury PG',
          address: '123 Main Road, Koramangala, Bengaluru 560034',
          phone: '+91 98765 43210',
          email: 'contact@sunshinepg.com',
        },
      });
    }
    return prop;
  }

  async updatePropertyInfo(dto: { name?: string; address?: string; phone?: string; email?: string; logoUrl?: string }) {
    const prop = await this.getPropertyInfo();
    return await this.prisma.property.update({
      where: { id: prop.id },
      data: dto,
    });
  }

  async getAllSettings() {
    const settingsList = await this.prisma.applicationSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settingsList) {
      map[s.key] = s.value;
    }
    return map;
  }

  async setSetting(key: string, value: string) {
    return await this.prisma.applicationSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async exportBackup() {
    const [property, tenants, rents, payments, receipts, whatsAppMessages, templates, settings] = await Promise.all([
      this.prisma.property.findMany(),
      this.prisma.tenant.findMany(),
      this.prisma.rent.findMany(),
      this.prisma.payment.findMany(),
      this.prisma.receipt.findMany(),
      this.prisma.whatsAppMessage.findMany(),
      this.prisma.messageTemplate.findMany(),
      this.prisma.applicationSetting.findMany(),
    ]);

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      appName: 'PG Rent Manager',
      data: {
        property,
        tenants,
        rents,
        payments,
        receipts,
        whatsAppMessages,
        templates,
        settings,
      },
    };
  }

  async restoreBackup(backupJson: any) {
    if (!backupJson || !backupJson.data || !backupJson.appName) {
      throw new BadRequestException('Invalid backup file structure');
    }

    const { property, tenants, rents, payments, receipts, templates, settings } = backupJson.data;

    return await this.prisma.$transaction(async (tx) => {
      // Clear existing records safely
      await tx.receipt.deleteMany();
      await tx.payment.deleteMany();
      await tx.rent.deleteMany();
      await tx.whatsAppMessage.deleteMany();
      await tx.tenant.deleteMany();
      await tx.property.deleteMany();

      if (property && property.length > 0) {
        for (const p of property) {
          await tx.property.create({ data: p });
        }
      }

      if (tenants && tenants.length > 0) {
        for (const t of tenants) {
          await tx.tenant.create({ data: t });
        }
      }

      if (rents && rents.length > 0) {
        for (const r of rents) {
          await tx.rent.create({ data: r });
        }
      }

      if (payments && payments.length > 0) {
        for (const p of payments) {
          await tx.payment.create({ data: p });
        }
      }

      if (receipts && receipts.length > 0) {
        for (const rc of receipts) {
          await tx.receipt.create({ data: rc });
        }
      }

      await tx.auditLog.create({
        data: {
          action: 'DATABASE_RESTORED',
          entity: 'SYSTEM',
          details: JSON.stringify({ restoredAt: new Date(), tenantCount: tenants?.length || 0 }),
        },
      });

      return {
        message: 'Database restored successfully',
        restoredTenants: tenants?.length || 0,
        restoredPayments: payments?.length || 0,
      };
    });
  }
}
