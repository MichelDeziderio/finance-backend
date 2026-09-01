import { BadRequestException } from '@nestjs/common';
import { formatDateOnly, parseDateOnly } from './date.util';

describe('date.util', () => {
  it('parses a valid YYYY-MM-DD string at UTC noon', () => {
    const date = parseDateOnly('2026-08-24');

    expect(date.toISOString()).toBe('2026-08-24T12:00:00.000Z');
  });

  it('formats a date back to YYYY-MM-DD', () => {
    const date = new Date('2026-08-24T12:00:00.000Z');

    expect(formatDateOnly(date)).toBe('2026-08-24');
  });

  it('rejects invalid date-only strings', () => {
    expect(() => parseDateOnly('24-08-2026')).toThrow(BadRequestException);
  });
});
