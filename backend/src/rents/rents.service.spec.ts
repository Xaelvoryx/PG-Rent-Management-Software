import { Test, TestingModule } from '@nestjs/testing';
import { RentsService } from './rents.service';
import { PrismaService } from '../prisma/prisma.service';
import { RentStatus } from '@prisma/client';

describe('RentsService Unit Tests', () => {
  let service: RentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RentsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<RentsService>(RentsService);
  });

  describe('calculateStatus', () => {
    it('should return PAID when paidAmount equals or exceeds rent amount', () => {
      const status = service.calculateStatus({
        amount: 8500,
        paidAmount: 8500,
        dueDate: new Date('2026-09-01'),
      });
      expect(status).toBe(RentStatus.PAID);
    });

    it('should return PARTIAL when paidAmount is between 0 and total rent amount', () => {
      const status = service.calculateStatus({
        amount: 8500,
        paidAmount: 3000,
        dueDate: new Date('2026-09-01'),
      });
      expect(status).toBe(RentStatus.PARTIAL);
    });

    it('should return OVERDUE when paidAmount is 0 and due date has passed', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5); // 5 days ago

      const status = service.calculateStatus({
        amount: 8500,
        paidAmount: 0,
        dueDate: pastDate,
      });
      expect(status).toBe(RentStatus.OVERDUE);
    });

    it('should return UPCOMING when due date is in the future and paidAmount is 0', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10); // 10 days in future

      const status = service.calculateStatus({
        amount: 8500,
        paidAmount: 0,
        dueDate: futureDate,
      });
      expect(status).toBe(RentStatus.UPCOMING);
    });

    it('should preserve WAIVED status when explicitly set', () => {
      const status = service.calculateStatus({
        amount: 8500,
        paidAmount: 0,
        dueDate: new Date('2026-01-01'),
        currentStatus: RentStatus.WAIVED,
      });
      expect(status).toBe(RentStatus.WAIVED);
    });
  });
});
