import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { SendWhatsAppMessageDto, UpdateTemplateDto } from './dto/whatsapp.dto';
import { TemplateType } from '@prisma/client';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Get('templates')
  getTemplates() {
    return this.whatsAppService.getTemplates();
  }

  @Patch('templates/:type')
  updateTemplate(@Param('type') type: TemplateType, @Body() dto: UpdateTemplateDto) {
    return this.whatsAppService.updateTemplate(type, dto);
  }

  @Post('send')
  sendMessage(@Body() dto: SendWhatsAppMessageDto) {
    return this.whatsAppService.sendMessage(dto);
  }

  @Get('messages')
  getMessageHistory(
    @Query('tenantId') tenantId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.whatsAppService.getMessageHistory({
      tenantId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }
}
