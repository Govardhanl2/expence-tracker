const Expense = require('../models/Expense');

class ExpenseService {
  async createExpense(data) {
    const expense = new Expense(data);
    return await expense.save();
  }

  async getAllExpenses(filters = {}) {
    const { category, startDate, endDate, page = 1, limit = 50, sort = '-date' } = filters;
    const query = {};

    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [expenses, total] = await Promise.all([
      Expense.find(query).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Expense.countDocuments(query),
    ]);

    return {
      expenses,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getExpenseById(id) {
    return await Expense.findById(id);
  }

  async updateExpense(id, data) {
    return await Expense.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  }

  async deleteExpense(id) {
    return await Expense.findByIdAndDelete(id);
  }

  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
      totalStats,
      monthlyStats,
      lastMonthStats,
      weeklyStats,
      categoryBreakdown,
      recentExpenses,
      monthlyTrend,
    ] = await Promise.all([
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
      ]),
      Expense.find().sort('-date').limit(5).lean(),
      Expense.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
            },
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
    ]);

    const currentMonthTotal = monthlyStats[0]?.total || 0;
    const lastMonthTotal = lastMonthStats[0]?.total || 0;
    const monthlyChange =
      lastMonthTotal > 0
        ? (((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
        : 0;

    return {
      overview: {
        totalExpenses: totalStats[0]?.total || 0,
        totalCount: totalStats[0]?.count || 0,
        monthlyExpenses: currentMonthTotal,
        monthlyCount: monthlyStats[0]?.count || 0,
        weeklyExpenses: weeklyStats[0]?.total || 0,
        weeklyCount: weeklyStats[0]?.count || 0,
        monthlyChange: parseFloat(monthlyChange),
        lastMonthExpenses: lastMonthTotal,
      },
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c._id,
        total: c.total,
        count: c.count,
        percentage:
          totalStats[0]?.total > 0 ? ((c.total / totalStats[0].total) * 100).toFixed(1) : 0,
      })),
      recentExpenses,
      monthlyTrend: monthlyTrend.map((m) => ({
        month: new Date(m._id.year, m._id.month - 1).toLocaleString('default', {
          month: 'short',
          year: '2-digit',
        }),
        total: m.total,
        count: m.count,
      })),
    };
  }
}

module.exports = new ExpenseService();
