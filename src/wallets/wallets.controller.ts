import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly service: WalletsService) {}
  @Post() create(@CurrentUser() user: UserDocument, @Body() dto: CreateWalletDto) { return this.service.create(user.id, dto); }
  @Get() findAll(@CurrentUser() user: UserDocument) { return this.service.findAll(user.id); }
  @Get(':walletId') findOne(@Param('walletId') id: string, @CurrentUser() user: UserDocument) { return this.service.findOne(id, user.id); }
  @Patch(':walletId') update(@Param('walletId') id: string, @CurrentUser() user: UserDocument, @Body() dto: UpdateWalletDto) { return this.service.update(id, user.id, dto); }
  @Delete(':walletId') remove(@Param('walletId') id: string, @CurrentUser() user: UserDocument) { return this.service.remove(id, user.id); }
}
