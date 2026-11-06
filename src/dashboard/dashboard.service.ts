import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movement, MovementDocument } from '../movements/schemas/movement.schema';
import { Category, CategoryDocument } from '../categories/schemas/category.schema';
import { DashboardQueryDto } from './dashboard-query.dto';
import { WalletsService } from '../wallets/wallets.service';
import { parseDateOnly } from '../common/utils/date.util';
import { MovementType } from '../common/enums/finance.enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Movement.name) private readonly movementModel: Model<MovementDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    private readonly wallets: WalletsService,
  ) {}

  async get(walletId: string, query: DashboardQueryDto) {
    await this.wallets.assertExists(walletId);
    const now = new Date();
    const start = query.startDate ? parseDateOnly(query.startDate, 'startDate') : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 12));
    const end = query.endDate ? parseDateOnly(query.endDate, 'endDate') : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 12));
    const base: any = { walletId, date: { $gte: start, $lte: end } };
    if (query.categoryId) base.categoryId = query.categoryId;
    const movements = await this.movementModel.find(base).sort({ date: 1 }).lean();
    const categories = await this.categoryModel.find({ walletId }).lean();

    const incomes = movements.filter(m => m.type === MovementType.INCOME);
    const expenses = movements.filter(m => m.type === MovementType.EXPENSE);
    const totalIncome = this.sum(incomes);
    const totalExpense = this.sum(expenses);
    const balance = totalIncome - totalExpense;
    const biggestIncome = incomes.length ? incomes.reduce((a,b) => a.amount > b.amount ? a : b) : null;
    const biggestExpense = expenses.length ? expenses.reduce((a,b) => a.amount > b.amount ? a : b) : null;
    const averageExpense = expenses.length ? totalExpense / expenses.length : 0;

    const categoryExpenses = categories.filter(c => c.type === MovementType.EXPENSE).map(c => {
      const amount = expenses.filter(m => m.categoryId === c.id).reduce((t,m) => t + m.amount, 0);
      return { id: c.id, name: c.name, color: c.color, amount, percentage: totalExpense ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0 };
    }).filter(c => c.amount > 0);

    const byDateMap = new Map<string, { income: number; expense: number }>();
    movements.forEach(m => {
      const key = m.date.toISOString().slice(0, 10);
      const item = byDateMap.get(key) ?? { income: 0, expense: 0 };
      if (m.type === MovementType.INCOME) item.income += m.amount; else item.expense += m.amount;
      byDateMap.set(key, item);
    });
    const byDate = [...byDateMap.entries()].map(([date, totals]) => ({ date, ...totals }));

    const periodMs = end.getTime() - start.getTime();
    const previousEnd = new Date(start.getTime() - 24 * 60 * 60 * 1000);
    const previousStart = new Date(previousEnd.getTime() - periodMs);
    const previousFilter: any = { walletId, date: { $gte: previousStart, $lte: previousEnd } };
    if (query.categoryId) previousFilter.categoryId = query.categoryId;
    const previous = await this.movementModel.find(previousFilter).lean();
    const previousBalance = previous.reduce((t,m) => t + (m.type === MovementType.INCOME ? m.amount : -m.amount), 0);
    const difference = balance - previousBalance;
    const percentage = previousBalance ? Number((Math.abs(difference / previousBalance) * 100).toFixed(1)) : 0;

    const recentMovements = [...movements].sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 10).map(m => ({
      id: m.id, type: m.type, description: m.description, categoryId: m.categoryId, amount: m.amount,
      date: m.date.toISOString().slice(0,10), paymentMethod: m.paymentMethod, notes: m.notes,
    }));

    return {
      period: { startDate: start.toISOString().slice(0,10), endDate: end.toISOString().slice(0,10) },
      summary: { totalIncome, totalExpense, balance, totalMovements: movements.length, averageExpense },
      highlights: { biggestIncome: this.serialize(biggestIncome), biggestExpense: this.serialize(biggestExpense) },
      comparison: { previousBalance, difference, percentage, hasPreviousPeriodData: previous.length > 0, improved: balance > previousBalance },
      categoryExpenses,
      incomeExpenseByDate: byDate,
      recentMovements,
    };
  }

  private sum(items: any[]) { return items.reduce((t, item) => t + item.amount, 0); }
  private serialize(item: any) { return item ? { id: item.id, description: item.description, amount: item.amount, date: item.date.toISOString().slice(0,10), categoryId: item.categoryId, type: item.type } : null; }
}
