import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { Movement, MovementDocument } from '../movements/schemas/movement.schema';
import { DEFAULT_CATEGORIES } from '../categories/default-categories';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<WalletDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(Movement.name) private readonly movementModel: Model<MovementDocument>,
  ) {}

  async create(userId: string, dto: CreateWalletDto) {
    const wallet = await this.walletModel.create({ id: randomUUID(), ...dto, userId });
    await this.categoryModel.insertMany(DEFAULT_CATEGORIES.map(category => ({
      id: randomUUID(), walletId: wallet.id, ...category, isDefault: true,
    })));
    return wallet.toJSON();
  }

  async findAll(userId: string) {
    return this.walletModel.find({ userId }).sort({ createdAt: -1 }).lean({ virtuals: false });
  }

  async findOne(id: string, userId: string) {
    const wallet = await this.walletModel.findOne({ id, userId }).lean();
    if (!wallet) throw new NotFoundException('Carteira não encontrada');
    delete (wallet as any)._id;
    return wallet;
  }

  async assertExists(id: string, userId: string) {
    const exists = await this.walletModel.exists({ id, userId });
    if (!exists) throw new NotFoundException('Carteira não encontrada');
  }

  async update(id: string, userId: string, dto: UpdateWalletDto) {
    const wallet = await this.walletModel.findOneAndUpdate({ id, userId }, dto, { new: true, runValidators: true });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');
    return wallet.toJSON();
  }

  async remove(id: string, userId: string) {
    const wallet = await this.walletModel.findOneAndDelete({ id, userId });
    if (!wallet) throw new NotFoundException('Carteira não encontrada');
    await Promise.all([
      this.categoryModel.deleteMany({ walletId: id }),
      this.movementModel.deleteMany({ walletId: id }),
    ]);
    return { deleted: true };
  }
}
