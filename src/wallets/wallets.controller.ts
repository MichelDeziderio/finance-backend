import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
@Controller('wallets')
export class WalletsController {
  constructor(private readonly service: WalletsService) {}
  @Post() create(@Body() dto: CreateWalletDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':walletId') findOne(@Param('walletId') id: string) { return this.service.findOne(id); }
  @Patch(':walletId') update(@Param('walletId') id: string, @Body() dto: UpdateWalletDto) { return this.service.update(id, dto); }
  @Delete(':walletId') remove(@Param('walletId') id: string) { return this.service.remove(id); }
}
