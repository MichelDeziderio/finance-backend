import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dashboard-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletOwnershipGuard } from '../wallets/wallet-ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, WalletOwnershipGuard)
@Controller('wallets/:walletId/dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  get(@Param('walletId') walletId: string, @Query() query: DashboardQueryDto, @CurrentUser() user: UserDocument) {
    return this.service.get(walletId, query, user.id);
  }
}
