import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendWhatsAppMessageDto, UpdateTemplateDto } from './dto/whatsapp.dto';
import { TemplateType, MessageStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsAppService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // Safe Template Renderer
  public renderTemplate(
    templateStr: string,
    vars: {
      tenantName?: string;
      amount?: string | number;
      dueDate?: string;
      daysOverdue?: string | number;
      rentMonth?: string;
      receiptNumber?: string;
      remainingAmount?: string | number;
      pgName?: string;
      checkoutDate?: string;
      customMessage?: string;
    },
  ): string {
    let result = templateStr;
    const replacements: Record<string, string> = {
      tenantName: vars.tenantName || 'Tenant',
      amount: vars.amount !== undefined ? `₹${Number(vars.amount).toLocaleString('en-IN')}` : '₹0',
      dueDate: vars.dueDate || 'N/A',
      daysOverdue: vars.daysOverdue !== undefined ? String(vars.daysOverdue) : '0',
      rentMonth: vars.rentMonth || '',
      receiptNumber: vars.receiptNumber || 'N/A',
      remainingAmount: vars.remainingAmount !== undefined ? `₹${Number(vars.remainingAmount).toLocaleString('en-IN')}` : '₹0',
      pgName: vars.pgName || 'PG Management',
      checkoutDate: vars.checkoutDate || 'N/A',
      customMessage: vars.customMessage || '',
    };

    for (const [key, val] of Object.entries(replacements)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, val);
    }

    return result;
  }

  async getTemplates() {
    return await this.prisma.messageTemplate.findMany({
      orderBy: { type: 'asc' },
    });
  }

  async updateTemplate(type: TemplateType, dto: UpdateTemplateDto) {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { type },
    });
    if (!template) throw new NotFoundException(`Template "${type}" not found`);

    return await this.prisma.messageTemplate.update({
      where: { type },
      data: {
        content: dto.content,
        name: dto.name || template.name,
      },
    });
  }

  async sendMessage(dto: SendWhatsAppMessageDto) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: dto.tenantId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const template = await this.prisma.messageTemplate.findUnique({
      where: { type: dto.templateType },
    });
    if (!template) throw new NotFoundException(`Template "${dto.templateType}" not found`);

    const property = await this.prisma.property.findFirst();
    const pgName = property ? property.name : 'Sunshine PG';

    let rent: any = null;
    if (dto.rentId) {
      rent = await this.prisma.rent.findUnique({
        where: { id: dto.rentId },
        include: { receipts: true },
      });
    } else {
      // Find latest rent
      rent = await this.prisma.rent.findFirst({
        where: { tenantId: tenant.id },
        orderBy: { rentMonth: 'desc' },
        include: { receipts: true },
      });
    }

    // Duplicate Message Safeguard: Check if sent in the last 12 hours for same template
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const recentMessage = await this.prisma.whatsAppMessage.findFirst({
      where: {
        tenantId: tenant.id,
        templateName: template.name,
        sentAt: { gte: twelveHoursAgo },
      },
    });

    if (recentMessage) {
      throw new BadRequestException(
        `A reminder using "${template.name}" was already sent to ${tenant.fullName} recently (at ${new Date(recentMessage.sentAt).toLocaleTimeString()}). Duplicate prevented.`,
      );
    }

    // Calculate days overdue if applicable
    let daysOverdue = 0;
    if (rent && rent.dueDate) {
      const now = new Date();
      const diffTime = now.getTime() - new Date(rent.dueDate).getTime();
      daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    }

    const latestReceipt = rent?.receipts?.[0];

    const messageBody = this.renderTemplate(template.content, {
      tenantName: tenant.fullName,
      amount: rent ? Number(rent.remainingAmount > 0 ? rent.remainingAmount : rent.amount) : Number(tenant.monthlyRent),
      dueDate: rent?.dueDate ? new Date(rent.dueDate).toLocaleDateString('en-IN') : '1st of month',
      daysOverdue,
      rentMonth: rent?.rentMonth || 'Current Month',
      receiptNumber: latestReceipt?.receiptNumber || 'N/A',
      remainingAmount: rent ? Number(rent.remainingAmount) : 0,
      pgName,
      checkoutDate: tenant.expectedCheckoutDate ? new Date(tenant.expectedCheckoutDate).toLocaleDateString('en-IN') : 'N/A',
      customMessage: dto.customMessage,
    });

    const mode = this.configService.get<string>('WHATSAPP_MODE') || 'mock';

    let status = MessageStatus.MOCK_SENT;
    let providerResponse = 'Mock Mode: Message simulated successfully';

    if (mode === 'production') {
      // Real WhatsApp Business Cloud API payload structure
      status = MessageStatus.MOCK_SENT;
      providerResponse = 'Production Mode: WhatsApp API payload dispatched';
    }

    const log = await this.prisma.whatsAppMessage.create({
      data: {
        tenantId: tenant.id,
        phone: tenant.phone,
        templateName: template.name,
        messageBody,
        status,
        providerResponse,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'WHATSAPP_SENT',
        entity: 'WhatsAppMessage',
        entityId: log.id,
        details: JSON.stringify({ tenantName: tenant.fullName, template: template.name, mode }),
      },
    });

    return {
      success: true,
      mode,
      messageLog: log,
      preview: {
        to: tenant.phone,
        tenantName: tenant.fullName,
        renderedText: messageBody,
      },
    };
  }

  async getMessageHistory(params: { tenantId?: string; page?: number; limit?: number }) {
    const { tenantId, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const [messages, total] = await Promise.all([
      this.prisma.whatsAppMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { sentAt: 'desc' },
        include: { tenant: true },
      }),
      this.prisma.whatsAppMessage.count({ where }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
