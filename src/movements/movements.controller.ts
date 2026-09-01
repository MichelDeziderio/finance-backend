import { Body, Controller, Param, Post } from '@nestjs/common';
import { MovementsService } from './movements.service';
import { CreateMovementDto } from './dto/create-movement.dto';
@Controller('wallets/:walletId/movements')
export class MovementsController {
  constructor(private readonly service: MovementsService) {}
  @Post() create(@Param('walletId') walletId: string, @Body() dto: CreateMovementDto) { return this.service.create(walletId, dto); }
}
