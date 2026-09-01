import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { CategoryResponse } from '../common/interfaces/finance-response.interface';
@Controller('wallets/:walletId/categories')
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}
  @Get() list(@Param('walletId') walletId: string, @Query() query: ListCategoriesQueryDto): Promise<CategoryResponse[]> { return this.service.list(walletId, query); }
  @Post() create(@Param('walletId') walletId: string, @Body() dto: CreateCategoryDto) { return this.service.create(walletId, dto); }
  @Delete(':categoryId') remove(@Param('walletId') walletId: string, @Param('categoryId') categoryId: string) { return this.service.remove(walletId, categoryId); }
}
