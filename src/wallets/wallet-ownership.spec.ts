import { NotFoundException } from '@nestjs/common';
import { WalletOwnershipGuard } from './wallet-ownership.guard';
import { WalletsService } from './wallets.service';

describe('Financial data ownership', () => {
  const ownerId = 'user-a';
  const otherId = 'user-b';
  const walletId = 'wallet-a';

  const walletModel = {
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    exists: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  };
  const categoryModel = { insertMany: jest.fn(), deleteMany: jest.fn() };
  const movementModel = { deleteMany: jest.fn() };
  const service = new WalletsService(walletModel as any, categoryModel as any, movementModel as any);

  beforeEach(() => jest.clearAllMocks());

  it('lists only the authenticated user wallets', async () => {
    const lean = jest.fn().mockResolvedValue([{ id: walletId, userId: ownerId }]);
    const sort = jest.fn().mockReturnValue({ lean });
    walletModel.find.mockReturnValue({ sort });
    await expect(service.findAll(ownerId)).resolves.toEqual([{ id: walletId, userId: ownerId }]);
    expect(walletModel.find).toHaveBeenCalledWith({ userId: ownerId });
  });

  it('binds new wallet ownership to the user from the token', async () => {
    walletModel.create.mockResolvedValue({ id: walletId, toJSON: () => ({ id: walletId, userId: ownerId }) });
    categoryModel.insertMany.mockResolvedValue([]);
    await service.create(ownerId, { name: 'Principal', color: '#123456', type: 'checking' } as any);
    expect(walletModel.create).toHaveBeenCalledWith(expect.objectContaining({ userId: ownerId }));
  });

  it('denies access when the wallet does not belong to the user', async () => {
    walletModel.exists.mockResolvedValue(null);
    await expect(service.assertExists(walletId, otherId)).rejects.toBeInstanceOf(NotFoundException);
    expect(walletModel.exists).toHaveBeenCalledWith({ id: walletId, userId: otherId });
  });

  it('never updates another user wallet', async () => {
    walletModel.findOneAndUpdate.mockResolvedValue(null);
    await expect(service.update(walletId, otherId, { name: 'Invasão' } as any)).rejects.toBeInstanceOf(NotFoundException);
    expect(walletModel.findOneAndUpdate).toHaveBeenCalledWith(
      { id: walletId, userId: otherId },
      expect.anything(),
      expect.anything(),
    );
  });

  it('never deletes movement/category data when wallet ownership fails', async () => {
    walletModel.findOneAndDelete.mockResolvedValue(null);
    await expect(service.remove(walletId, otherId)).rejects.toBeInstanceOf(NotFoundException);
    expect(categoryModel.deleteMany).not.toHaveBeenCalled();
    expect(movementModel.deleteMany).not.toHaveBeenCalled();
  });

  it('blocks nested routes when the authenticated user does not own the wallet', async () => {
    walletModel.exists.mockResolvedValue(null);
    const guard = new WalletOwnershipGuard(service);
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { id: otherId }, params: { walletId } }),
      }),
    };
    await expect(guard.canActivate(ctx as any)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('denies missing authentication on nested routes', async () => {
    const guard = new WalletOwnershipGuard(service);
    const ctx = { switchToHttp: () => ({ getRequest: () => ({ params: { walletId } }) }) };
    await expect(guard.canActivate(ctx as any)).rejects.toBeInstanceOf(NotFoundException);
  });
});
