import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Movement, MovementSchema } from '../movements/schemas/movement.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { WalletsModule } from '../wallets/wallets.module';
@Module({ imports: [MongooseModule.forFeature([{ name: Movement.name, schema: MovementSchema }, { name: Category.name, schema: CategorySchema }]), WalletsModule], controllers: [DashboardController], providers: [DashboardService] })
export class DashboardModule {}
