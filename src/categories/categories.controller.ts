import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { CategoryResponse } from '../common/interfaces/finance-response.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletOwnershipGuard } from '../wallets/wallet-ownership.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';

@UseGuards(JwtAuthGuard, WalletOwnershipGuard)
@Controller('wallets/:walletId/categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  list(@Param('walletId') walletId: string, @Query() query: ListCategoriesQueryDto, @CurrentUser() user: UserDocument): Promise<CategoryResponse[]> {
    return this.service.list(walletId, query, user.id);
  }

  @Post()
  create(@Param('walletId') walletId: string, @Body() dto: CreateCategoryDto, @CurrentUser() user: UserDocument) {
    return this.service.create(walletId, dto, user.id);
  }

  @Delete(':categoryId')
  remove(@Param('walletId') walletId: string, @Param('categoryId') categoryId: string, @CurrentUser() user: UserDocument) {
    return this.service.remove(walletId, categoryId, user.id);
  }
}
