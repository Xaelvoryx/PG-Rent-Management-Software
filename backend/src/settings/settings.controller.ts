import { Controller, Get, Post, Body, Patch, Res } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Response } from 'express';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('property')
  getPropertyInfo() {
    return this.settingsService.getPropertyInfo();
  }

  @Patch('property')
  updatePropertyInfo(@Body() dto: { name?: string; address?: string; phone?: string; email?: string; logoUrl?: string }) {
    return this.settingsService.updatePropertyInfo(dto);
  }

  @Get('app')
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Post('app')
  setSetting(@Body() dto: { key: string; value: string }) {
    return this.settingsService.setSetting(dto.key, dto.value);
  }

  @Get('backup')
  async exportBackup(@Res() res: Response) {
    const backup = await this.settingsService.exportBackup();
    const fileName = `PGRent_Backup_${new Date().toISOString().split('T')[0]}.json`;

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    res.send(JSON.stringify(backup, null, 2));
  }

  @Post('restore')
  async restoreBackup(@Body() backupJson: any) {
    return this.settingsService.restoreBackup(backupJson);
  }
}
