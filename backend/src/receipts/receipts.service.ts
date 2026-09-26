import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class ReceiptsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { receiptNumber: { contains: search, mode: 'insensitive' } },
        { tenant: { fullName: { contains: search, mode: 'insensitive' } } },
        { tenant: { roomNumber: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [receipts, total] = await Promise.all([
      this.prisma.receipt.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: true,
          rent: true,
          payment: true,
        },
      }),
      this.prisma.receipt.count({ where }),
    ]);

    return {
      data: receipts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id },
      include: {
        tenant: true,
        rent: true,
        payment: true,
      },
    });

    if (!receipt) throw new NotFoundException(`Receipt with ID "${id}" not found`);
    return receipt;
  }

  async findByNumber(receiptNumber: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { receiptNumber },
      include: {
        tenant: true,
        rent: true,
        payment: true,
      },
    });

    if (!receipt) throw new NotFoundException(`Receipt "${receiptNumber}" not found`);
    return receipt;
  }

  async generatePdfBuffer(id: string): Promise<Buffer> {
    const receipt = await this.findOne(id);
    const property = await this.prisma.property.findFirst();

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      doc.on('error', (err) => reject(err));

      // Header Banner
      doc
        .rect(40, 40, 515, 80)
        .fill('#1e293b'); // Dark Slate

      doc
        .fillColor('#ffffff')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(receipt.pgName || property?.name || 'PG Rent Manager', 60, 55);

      doc
        .fontSize(10)
        .font('Helvetica')
        .text(property?.address || 'PG Accommodation Services', 60, 85)
        .text(`Phone: ${property?.phone || 'N/A'} | Email: ${property?.email || 'N/A'}`, 60, 98);

      // Title & Receipt # Badge
      doc
        .fillColor('#0f172a')
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('RENT PAYMENT RECEIPT', 40, 140);

      doc
        .fontSize(11)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`Receipt No: ${receipt.receiptNumber}`, 380, 142, { align: 'right' })
        .text(`Date: ${new Date(receipt.paymentDate).toLocaleDateString('en-IN')}`, 380, 158, { align: 'right' });

      // Line Separator
      doc
        .moveTo(40, 180)
        .lineTo(555, 180)
        .strokeColor('#e2e8f0')
        .stroke();

      // Tenant & Room Box
      doc
        .rect(40, 195, 515, 90)
        .fill('#f8fafc')
        .strokeColor('#cbd5e1')
        .stroke();

      doc
        .fillColor('#334155')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('TENANT INFORMATION', 55, 208);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#1e293b')
        .text(`Tenant Name: ${receipt.tenant.fullName}`, 55, 226)
        .text(`Room Number: Room ${receipt.tenant.roomNumber} (Bed ${receipt.tenant.bedNumber || 'A'})`, 55, 242)
        .text(`Phone Number: ${receipt.tenant.phone}`, 55, 258)
        .text(`Rent Period: ${receipt.rent.rentMonth}`, 330, 226)
        .text(`Monthly Rent: ₹${Number(receipt.rent.amount).toLocaleString('en-IN')}`, 330, 242);

      // Financial Details Table Header
      doc
        .rect(40, 305, 515, 25)
        .fill('#0f172a');

      doc
        .fillColor('#ffffff')
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Description', 55, 312)
        .text('Payment Method', 250, 312)
        .text('Reference No.', 360, 312)
        .text('Amount (₹)', 470, 312, { align: 'right' });

      // Financial Details Row
      doc
        .rect(40, 330, 515, 35)
        .fill('#ffffff')
        .strokeColor('#e2e8f0')
        .stroke();

      doc
        .fillColor('#1e293b')
        .fontSize(10)
        .font('Helvetica')
        .text(`Rent Payment for ${receipt.rent.rentMonth}`, 55, 342)
        .text(receipt.paymentMethod, 250, 342)
        .text(receipt.payment.referenceNumber || 'N/A', 360, 342)
        .font('Helvetica-Bold')
        .text(`₹${Number(receipt.amount).toLocaleString('en-IN')}`, 470, 342, { align: 'right' });

      // Balance & Summary Box
      doc
        .rect(300, 385, 255, 75)
        .fill('#f1f5f9');

      doc
        .fillColor('#334155')
        .fontSize(10)
        .font('Helvetica')
        .text('Total Rent Amount:', 315, 395)
        .text(`₹${Number(receipt.rent.amount).toLocaleString('en-IN')}`, 470, 395, { align: 'right' })
        .text('Amount Paid:', 315, 412)
        .text(`₹${Number(receipt.amount).toLocaleString('en-IN')}`, 470, 412, { align: 'right' })
        .font('Helvetica-Bold')
        .fillColor(Number(receipt.remainingAmount) > 0 ? '#b91c1c' : '#15803d')
        .text('Remaining Balance:', 315, 432)
        .text(`₹${Number(receipt.remainingAmount).toLocaleString('en-IN')}`, 470, 432, { align: 'right' });

      // Footer Notes & Signature
      doc
        .fillColor('#64748b')
        .fontSize(9)
        .font('Helvetica')
        .text('Notes / Status:', 40, 480)
        .text(Number(receipt.remainingAmount) > 0 ? 'PARTIAL PAYMENT RECEIVED' : 'RENT FULLY PAID', 40, 495);

      doc
        .moveTo(380, 530)
        .lineTo(530, 530)
        .strokeColor('#94a3b8')
        .stroke();

      doc
        .fontSize(9)
        .fillColor('#475569')
        .text('Authorized Signature', 380, 538, { align: 'center', width: 150 });

      doc
        .fontSize(8)
        .fillColor('#94a3b8')
        .text('Computer Generated Receipt — PG Rent Manager', 40, 580, { align: 'center' });

      doc.end();
    });
  }
}
