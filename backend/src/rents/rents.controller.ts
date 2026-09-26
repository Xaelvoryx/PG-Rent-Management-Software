import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { RentsService } from './rents.service';
import { GenerateRentDto, UpdateRentDto } from './dto/rent.dto';
import { RentStatus } from '@prisma/client';

@Controller('rents')
export class RentsController {
  constructor(private readonly rentsService: RentsService) {}

  @Get()
  findAll(
    @Query('rentMonth') rentMonth?: string,
    @Query('status') status?: RentStatus,
    @Query('tenantId') tenantId?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.rentsService.findAll({
      rentMonth,
      status,
      tenantId,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  @Post('generate')
  generateMonthlyRents(@Body() dto: GenerateRentDto) {
    return this.rentsService.generateMonthlyRents(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRentDto: UpdateRentDto) {
    return this.rentsService.update(id, updateRentDto);
  }

  @Post(':id/waive')
  waive(@Param('id') id: string, @Body('reason') reason: string) {
    return this.rentsService.waive(id, reason || 'Waived by PG Manager');
  }
}
