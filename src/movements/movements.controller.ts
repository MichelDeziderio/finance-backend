import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { ListMovementsQueryDto } from './dto/list-movements-query.dto';
import { PaginatedMovementsResponse } from '../common/interfaces/finance-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletOwnershipGuard } from '../wallets/wallet-ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, WalletOwnershipGuard)
@Controller('wallets/:walletId/movements')
export class MovementsController {
  constructor(private readonly service: MovementsService) {}

  @Get()
  list(@Param('walletId') walletId: string, @Query() query: ListMovementsQueryDto, @CurrentUser() user: UserDocument): Promise<PaginatedMovementsResponse> {
    return this.service.list(walletId, query, user.id);
  }
  @Get(':movementId')
  findOne(@Param('walletId') walletId: string, @Param('movementId') movementId: string, @CurrentUser() user: UserDocument) {
    return this.service.findOne(walletId, movementId, user.id);
  }
  @Post()
  create(@Param('walletId') walletId: string, @Body() dto: CreateMovementDto, @CurrentUser() user: UserDocument) {
    return this.service.create(walletId, dto, user.id);
  }
  @Patch(':movementId')
  update(@Param('walletId') walletId: string, @Param('movementId') movementId: string, @Body() dto: UpdateMovementDto, @CurrentUser() user: UserDocument) {
    return this.service.update(walletId, movementId, dto, user.id);
  }
  @Delete(':movementId')
  remove(@Param('walletId') walletId: string, @Param('movementId') movementId: string, @CurrentUser() user: UserDocument) {
    return this.service.remove(walletId, movementId, user.id);
  }
}
