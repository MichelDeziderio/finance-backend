import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import { Movement, MovementDocument } from './schemas/movement.schema';
import { CreateMovementDto } from './dto/create-movement.dto';
import { CategoriesService } from '../categories/categories.service';
import { WalletsService } from '../wallets/wallets.service';
import { parseDateOnly } from '../common/utils/date.util';

@Injectable()
export class MovementsService {
  constructor(
    @InjectModel(Movement.name) private readonly movementModel: Model<MovementDocument>,
    private readonly categories: CategoriesService,
    private readonly wallets: WalletsService,
  ) {}

  async create(walletId: string, dto: CreateMovementDto) {
    await this.wallets.assertExists(walletId);
    const category = await this.categories.findInWallet(walletId, dto.categoryId);
    if (category.type !== dto.type) throw new BadRequestException('A categoria selecionada não corresponde ao tipo da movimentação');
    const movement = await this.movementModel.create({
      id: randomUUID(), walletId, ...dto, description: dto.description.trim(), notes: dto.notes?.trim() || undefined,
      date: parseDateOnly(dto.date),
    });
    return movement.toJSON();
  }

}
