import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { UserDocument } from '../users/schemas/user.schema';

/**
 * Executado depois do JwtAuthGuard.
 * Carteiras inexistentes e de outros usuários retornam a mesma resposta (404).
 */
@Injectable()
export class WalletOwnershipGuard implements CanActivate {
  constructor(private readonly wallets: WalletsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: UserDocument;
      params: { walletId?: string };
    }>();
    const userId = request.user?.id;
    const walletId = request.params?.walletId;
    if (!userId || !walletId) {
      throw new NotFoundException('Carteira não encontrada');
    }
    await this.wallets.assertExists(walletId, userId);
    return true;
  }
}
