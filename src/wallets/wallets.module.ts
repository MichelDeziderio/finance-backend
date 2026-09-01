import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { Category, CategorySchema } from '../categories/schemas/category.schema';
import { Movement, MovementSchema } from '../movements/schemas/movement.schema';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
@Module({
  imports: [MongooseModule.forFeature([
    { name: Wallet.name, schema: WalletSchema },
    { name: Category.name, schema: CategorySchema },
    { name: Movement.name, schema: MovementSchema },
  ])],
  controllers: [WalletsController], providers: [WalletsService], exports: [WalletsService],
})
export class WalletsModule {}
