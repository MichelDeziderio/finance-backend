import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Movement, MovementSchema } from './schemas/movement.schema';
import { MovementsController } from './movements.controller';
import { MovementsService } from './movements.service';
import { CategoriesModule } from '../categories/categories.module';
import { WalletsModule } from '../wallets/wallets.module';
@Module({ imports: [MongooseModule.forFeature([{ name: Movement.name, schema: MovementSchema }]), CategoriesModule, WalletsModule], controllers: [MovementsController], providers: [MovementsService], exports: [MovementsService] })
export class MovementsModule {}
