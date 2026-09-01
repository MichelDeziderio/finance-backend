import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
import { UpdateMovementDto } from './dto/update-movement.dto';
import { ListMovementsQueryDto } from './dto/list-movements-query.dto';
import { PaginatedMovementsResponse } from '../common/interfaces/finance-response.interface';
@Controller('wallets/:walletId/movements')
export class MovementsController {
  constructor(private readonly service: MovementsService) {}
  @Get() list(@Param('walletId') walletId: string, @Query() query: ListMovementsQueryDto): Promise<PaginatedMovementsResponse> { return this.service.list(walletId, query); }
  @Get(':movementId') findOne(@Param('walletId') walletId: string, @Param('movementId') movementId: string) { return this.service.findOne(walletId, movementId); }
  @Post() create(@Param('walletId') walletId: string, @Body() dto: CreateMovementDto) { return this.service.create(walletId, dto); }
  @Patch(':movementId') update(@Param('walletId') walletId: string, @Param('movementId') movementId: string, @Body() dto: UpdateMovementDto) { return this.service.update(walletId, movementId, dto); }
  @Delete(':movementId') remove(@Param('walletId') walletId: string, @Param('movementId') movementId: string) { return this.service.remove(walletId, movementId); }
}
