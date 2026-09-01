import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './schemas/category.schema';
import { Movement, MovementSchema } from '../movements/schemas/movement.schema';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { WalletsModule } from '../wallets/wallets.module';
@Module({ imports: [MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema }, { name: Movement.name, schema: MovementSchema },
]), WalletsModule], controllers: [CategoriesController], providers: [CategoriesService], exports: [CategoriesService] })
export class CategoriesModule {}
