import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { TenantStatus, Prisma } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: {
    search?: string;
    status?: TenantStatus;
    roomNumber?: string;
    page?: number;
    limit?: number;
  }) {
    const { search, status, roomNumber, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = {};

    if (status) {
      where.status = status;
    } else {
      // By default don't show ARCHIVED tenants unless specifically filtered
      where.status = { not: TenantStatus.ARCHIVED };
    }

    if (roomNumber) {
      where.roomNumber = roomNumber;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { roomNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          rents: {
            take: 1,
            orderBy: { rentMonth: 'desc' },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        rents: {
          orderBy: { rentMonth: 'desc' },
          include: { payments: true },
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          include: { receipt: true },
        },
        receipts: {
          orderBy: { createdAt: 'desc' },
        },
        whatsAppMessages: {
          orderBy: { sentAt: 'desc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    return tenant;
  }

  async create(dto: CreateTenantDto) {
    if (dto.monthlyRent <= 0) {
      throw new BadRequestException('Monthly rent must be greater than zero');
    }
    if (dto.depositAmount < 0) {
      throw new BadRequestException('Deposit amount cannot be negative');
    }

    const tenant = await this.prisma.tenant.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        alternatePhone: dto.alternatePhone,
        email: dto.email,
        emergencyContactName: dto.emergencyContactName,
        emergencyContactPhone: dto.emergencyContactPhone,
        roomNumber: dto.roomNumber,
        bedNumber: dto.bedNumber,
        monthlyRent: dto.monthlyRent,
        depositAmount: dto.depositAmount,
        joiningDate: new Date(dto.joiningDate),
        expectedCheckoutDate: dto.expectedCheckoutDate ? new Date(dto.expectedCheckoutDate) : null,
        status: dto.status || TenantStatus.ACTIVE,
        notes: dto.notes,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        action: 'TENANT_CREATED',
        entity: 'Tenant',
        entityId: tenant.id,
        details: JSON.stringify({ fullName: tenant.fullName, roomNumber: tenant.roomNumber }),
      },
    });

    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findOne(id);

    const updateData: Prisma.TenantUpdateInput = {};

    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.alternatePhone !== undefined) updateData.alternatePhone = dto.alternatePhone;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.emergencyContactName !== undefined) updateData.emergencyContactName = dto.emergencyContactName;
    if (dto.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = dto.emergencyContactPhone;
    if (dto.roomNumber !== undefined) updateData.roomNumber = dto.roomNumber;
    if (dto.bedNumber !== undefined) updateData.bedNumber = dto.bedNumber;
    if (dto.monthlyRent !== undefined) updateData.monthlyRent = dto.monthlyRent;
    if (dto.depositAmount !== undefined) updateData.depositAmount = dto.depositAmount;
    if (dto.joiningDate !== undefined) updateData.joiningDate = new Date(dto.joiningDate);
    if (dto.expectedCheckoutDate !== undefined) {
      updateData.expectedCheckoutDate = dto.expectedCheckoutDate ? new Date(dto.expectedCheckoutDate) : null;
    }
    if (dto.actualCheckoutDate !== undefined) {
      updateData.actualCheckoutDate = dto.actualCheckoutDate ? new Date(dto.actualCheckoutDate) : null;
    }
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    const updated = await this.prisma.tenant.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'TENANT_UPDATED',
        entity: 'Tenant',
        entityId: updated.id,
        details: JSON.stringify(dto),
      },
    });

    return updated;
  }

  async archive(id: string) {
    const tenant = await this.findOne(id);

    // Soft delete / archive
    const archived = await this.prisma.tenant.update({
      where: { id },
      data: { status: TenantStatus.ARCHIVED },
    });

    await this.prisma.auditLog.create({
      data: {
        action: 'TENANT_ARCHIVED',
        entity: 'Tenant',
        entityId: id,
        details: JSON.stringify({ fullName: tenant.fullName }),
      },
    });

    return archived;
  }

  async getHistory(id: string) {
    const tenant = await this.findOne(id);
    return {
      tenant: {
        id: tenant.id,
        fullName: tenant.fullName,
        roomNumber: tenant.roomNumber,
        joiningDate: tenant.joiningDate,
        status: tenant.status,
      },
      rents: tenant.rents,
      payments: tenant.payments,
      receipts: tenant.receipts,
    };
  }
}
