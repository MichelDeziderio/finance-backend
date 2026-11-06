import { Controller, Get, Param, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dashboard-query.dto';
@Controller('wallets/:walletId/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get() get(@Param('walletId') walletId: string, @Query() query: DashboardQueryDto) { return this.service.get(walletId, query); }
}
