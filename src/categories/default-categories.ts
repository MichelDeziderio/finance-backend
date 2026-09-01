import { MovementType } from '../common/enums/finance.enums';

export const DEFAULT_CATEGORIES = [
  { defaultKey: 'salary', name: 'Salário', type: MovementType.INCOME, color: '#22C55E' },
  { defaultKey: 'freelance', name: 'Freelance', type: MovementType.INCOME, color: '#14B8A6' },
  { defaultKey: 'food', name: 'Alimentação', type: MovementType.EXPENSE, color: '#F97316' },
  { defaultKey: 'transport', name: 'Transporte', type: MovementType.EXPENSE, color: '#3B82F6' },
  { defaultKey: 'home', name: 'Moradia', type: MovementType.EXPENSE, color: '#8B5CF6' },
  { defaultKey: 'health', name: 'Saúde', type: MovementType.EXPENSE, color: '#EC4899' },
  { defaultKey: 'leisure', name: 'Lazer', type: MovementType.EXPENSE, color: '#EAB308' },
  { defaultKey: 'other', name: 'Outros', type: MovementType.EXPENSE, color: '#64748B' },
] as const;
