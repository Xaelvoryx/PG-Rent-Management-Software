import { Controller, Get, Param, Query, Res, NotFoundException } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { Response } from 'express';

@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly receiptsService: ReceiptsService) {}

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.receiptsService.findAll({
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.receiptsService.findOne(id);
  }

  @Get('number/:receiptNumber')
  findByNumber(@Param('receiptNumber') receiptNumber: string) {
    return this.receiptsService.findByNumber(receiptNumber);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.receiptsService.generatePdfBuffer(id);
    const receipt = await this.receiptsService.findOne(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${receipt.receiptNumber}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }
}
