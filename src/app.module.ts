import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletsModule } from './wallets/wallets.module';
import { CategoriesModule } from './categories/categories.module';
import { MovementsModule } from './movements/movements.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://localhost:27017/finance'),
      }),
    }),
    UsersModule,
    MailModule,
    AuthModule,
    WalletsModule,
    CategoriesModule,
    MovementsModule,
    DashboardModule,
  ],
})
export class AppModule {}
