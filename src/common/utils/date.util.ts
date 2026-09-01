import { BadRequestException } from '@nestjs/common';

export function parseDateOnly(value: string, field = 'date'): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException(`${field} deve estar no formato YYYY-MM-DD`);
  }
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException(`${field} inválida`);
  }
  return date;
}

export function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}
