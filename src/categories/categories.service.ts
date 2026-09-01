import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Movement, MovementDocument } from '../movements/schemas/movement.schema';
import { WalletsService } from '../wallets/wallets.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { CategoryResponse } from '../common/interfaces/finance-response.interface';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Movement.name) private readonly movementModel: Model<MovementDocument>,
    private readonly wallets: WalletsService,
  ) {}

  async list(walletId: string, query: ListCategoriesQueryDto): Promise<CategoryResponse[]> {
    await this.wallets.assertExists(walletId);
    const filter: any = { walletId };
    if (query.type) filter.type = query.type;
    const items = await this.categoryModel.find(filter).sort({ isDefault: -1, name: 1 }).lean();
    return items.map(({ _id, ...item }) => item);
  }

  async create(walletId: string, dto: CreateCategoryDto) {
    await this.wallets.assertExists(walletId);
    const duplicated = await this.categoryModel.findOne({
      walletId, type: dto.type, name: { $regex: `^${this.escape(dto.name.trim())}$`, $options: 'i' },
    });
    if (duplicated) throw new ConflictException('Já existe uma categoria com esse nome para o tipo selecionado');
    const category = await this.categoryModel.create({ id: randomUUID(), walletId, ...dto, name: dto.name.trim(), isDefault: false });
    return category.toJSON();
  }

  async findInWallet(walletId: string, categoryId: string) {
    const category = await this.categoryModel.findOne({ id: categoryId, walletId });
    if (!category) throw new BadRequestException('Categoria não pertence à carteira informada');
    return category;
  }

  async remove(walletId: string, categoryId: string) {
    await this.wallets.assertExists(walletId);
    const category = await this.categoryModel.findOne({ id: categoryId, walletId });
    if (!category) throw new NotFoundException('Categoria não encontrada');
    if (category.isDefault) throw new BadRequestException('Categorias padrão não podem ser excluídas');
    const inUse = await this.movementModel.exists({ walletId, categoryId });
    if (inUse) throw new ConflictException('Categoria em uso. Altere ou remova as movimentações vinculadas antes de excluir.');
    await category.deleteOne();
    return { deleted: true };
  }

  private escape(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
}
