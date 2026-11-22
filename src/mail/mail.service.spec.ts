import { ForbiddenException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { MailService } from './mail.service';
import { MockMailController } from './mock-mail.controller';

describe('MAIL_MOCK toggle', () => {
  const inboxKey = 'this-is-a-32-character-minimum-key-for-tests';
  const config = {
    values: {} as Record<string, string>,
    get: jest.fn((key: string, fallback?: string) => config.values[key] ?? fallback),
  };
  const emails = {
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 }),
    create: jest.fn().mockResolvedValue({}),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    config.values = {
      MAIL_MOCK: 'true',
      MOCK_INBOX_KEY: inboxKey,
      FRONTEND_URL: 'https://example.com',
    };
  });

  it('stores a reset message in MongoDB instead of invoking SMTP', async () => {
    const mail = new MailService(config as any, emails as any);
    const expiresAt = new Date(Date.now() + 120_000);
    await mail.sendPasswordResetEmail('test@example.com', 'Teste', 'test-token', 'user-1', expiresAt);
    expect(emails.deleteMany).toHaveBeenCalledWith({ userId: 'user-1' });
    expect(emails.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'user-1', expiresAt, tokenHash: expect.any(String),
      html: expect.stringContaining('https://example.com/redefinir-senha?token=test-token'),
    }));
    expect(emails.create.mock.calls[0][0].tokenHash).not.toContain('test-token');
  });

  it('rejects access with missing or invalid inbox key', () => {
    const mail = new MailService(config as any, emails as any);
    const controller = new MockMailController(mail);
    expect(() => controller.list()).toThrow(ForbiddenException);
    expect(() => controller.list('wrong-key')).toThrow(ForbiddenException);
  });

  it('denies access when mock mode is off', () => {
    config.values.MAIL_MOCK = 'false';
    const mail = new MailService(config as any, emails as any);
    const controller = new MockMailController(mail);
    expect(() => controller.list(inboxKey)).toThrow(ServiceUnavailableException);
  });

  it('hides expired messages even before TTL physically deletes them', async () => {
    const lean = jest.fn().mockResolvedValue([]);
    const limit = jest.fn().mockReturnValue({ lean });
    const sort = jest.fn().mockReturnValue({ limit });
    const select = jest.fn().mockReturnValue({ sort });
    emails.find.mockReturnValue({ select });
    const mail = new MailService(config as any, emails as any);
    expect(await mail.listMockEmails()).toEqual([]);
    expect(emails.find).toHaveBeenCalledWith({ expiresAt: { $gt: expect.any(Date) } });
    await expect(mail.getMockEmail('invalid-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes the consumed mock message', async () => {
    const mail = new MailService(config as any, emails as any);
    await mail.removeMockEmailByToken('used-token');
    expect(emails.deleteOne).toHaveBeenCalledWith({ tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/) });
  });

  it('requires an admin key of at least 32 characters in mock mode', () => {
    config.values.MOCK_INBOX_KEY = 'short';
    expect(() => new MailService(config as any, emails as any)).toThrow('MOCK_INBOX_KEY');
  });
});
