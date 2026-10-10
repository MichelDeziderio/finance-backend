import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FilterQuery, Model } from "mongoose";
import { randomUUID } from "crypto";
import { Movement, MovementDocument } from "./schemas/movement.schema";
import { CreateMovementDto } from "./dto/create-movement.dto";
import { UpdateMovementDto } from "./dto/update-movement.dto";
import { ListMovementsQueryDto } from "./dto/list-movements-query.dto";
import { CategoriesService } from "../categories/categories.service";
import { WalletsService } from "../wallets/wallets.service";
import { parseDateOnly } from "../common/utils/date.util";
import { PaginatedMovementsResponse } from "../common/interfaces/finance-response.interface";

@Injectable()
export class MovementsService {
  constructor(
    @InjectModel(Movement.name)
    private readonly movementModel: Model<MovementDocument>,
    private readonly categories: CategoriesService,
    private readonly wallets: WalletsService,
  ) {}

  async create(walletId: string, dto: CreateMovementDto) {
    await this.wallets.assertExists(walletId);
    const category = await this.categories.findInWallet(
      walletId,
      dto.categoryId,
    );
    if (category.type !== dto.type)
      throw new BadRequestException(
        "A categoria selecionada não corresponde ao tipo da movimentação",
      );
    const movement = await this.movementModel.create({
      id: randomUUID(),
      walletId,
      ...dto,
      description: dto.description.trim(),
      notes: dto.notes?.trim() || undefined,
      date: parseDateOnly(dto.date),
    });
    return movement.toJSON();
  }

  async list(
    walletId: string,
    query: ListMovementsQueryDto,
  ): Promise<PaginatedMovementsResponse> {
    await this.wallets.assertExists(walletId);

    const filter = this.buildFilter(walletId, query);

    // Ordenar do último criado para o primeiro
    const sort = { createdAt: -1 } as const;

    const skip = (query.page - 1) * query.limit;

    const [docs, total] = await Promise.all([
      this.movementModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(query.limit)
        .lean(),

      this.movementModel.countDocuments(filter),
    ]);

    const data = docs.map(({ _id, date, ...item }) => ({
      ...item,
      date: date.toISOString().slice(0, 10),
    }));

    return {
      data,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(walletId: string, movementId: string) {
    await this.wallets.assertExists(walletId);
    const movement = await this.movementModel.findOne({
      id: movementId,
      walletId,
    });
    if (!movement) throw new NotFoundException("Movimentação não encontrada");
    return movement.toJSON();
  }

  async update(walletId: string, movementId: string, dto: UpdateMovementDto) {
    const current = await this.movementModel.findOne({
      id: movementId,
      walletId,
    });
    if (!current) throw new NotFoundException("Movimentação não encontrada");
    const targetType = dto.type ?? current.type;
    const targetCategoryId = dto.categoryId ?? current.categoryId;
    const category = await this.categories.findInWallet(
      walletId,
      targetCategoryId,
    );
    if (category.type !== targetType)
      throw new BadRequestException(
        "A categoria selecionada não corresponde ao tipo da movimentação",
      );
    const payload: any = { ...dto };
    if (dto.date) payload.date = parseDateOnly(dto.date);
    if (dto.description) payload.description = dto.description.trim();
    if (dto.notes !== undefined) payload.notes = dto.notes.trim() || undefined;
    const updated = await this.movementModel.findOneAndUpdate(
      { id: movementId, walletId },
      payload,
      { new: true },
    );
    return updated!.toJSON();
  }

  async remove(walletId: string, movementId: string) {
    const deleted = await this.movementModel.findOneAndDelete({
      id: movementId,
      walletId,
    });
    if (!deleted) throw new NotFoundException("Movimentação não encontrada");
    return { deleted: true };
  }

  buildFilter(
    walletId: string,
    query: Pick<
      ListMovementsQueryDto,
      "search" | "type" | "categoryId" | "startDate" | "endDate"
    >,
  ): FilterQuery<MovementDocument> {
    const filter: FilterQuery<MovementDocument> = { walletId };
    if (query.search?.trim())
      filter.description = {
        $regex: this.escape(query.search.trim()),
        $options: "i",
      };
    if (query.type) filter.type = query.type;
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.startDate || query.endDate) {
      filter.date = {};
      if (query.startDate)
        filter.date.$gte = parseDateOnly(query.startDate, "startDate");
      if (query.endDate)
        filter.date.$lte = parseDateOnly(query.endDate, "endDate");
      if (
        query.startDate &&
        query.endDate &&
        filter.date.$gte > filter.date.$lte
      )
        throw new BadRequestException(
          "startDate não pode ser maior que endDate",
        );
    }
    return filter;
  }

  private escape(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
