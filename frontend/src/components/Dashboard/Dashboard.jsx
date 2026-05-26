import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { expenseAPI } from '../../services/api';
import { Card, Skeleton, CategoryBadge } from '../UI';
import { format } from 'date-fns';
import './Dashboard.css';

const CATEGORY_COLORS = {
  Food: '#f5a623',
  Utility: '#4f8ef7',
  Subscriptions: '#a855f7',
  Others: '#34c97e',
};

const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, accent, loading }) => (
  <Card className={`stat-card accent-${accent}`}>
    {loading ? (
      <>
        <Skeleton height="14px" width="100px" className="mb-2" />
        <Skeleton height="32px" width="140px" className="mb-2" />
        <Skeleton height="12px" width="80px" />
      </>
    ) : (
      <>
        <div className="stat-header">
          <span className="stat-title">{title}</span>
          <div className={`stat-icon-wrap accent-bg-${accent}`}>
            <Icon size={16} />
          </div>
        </div>
        <div className="stat-value">{value}</div>
        <div className="stat-footer">
          {trend !== undefined && (
            <span className={`stat-trend ${trendValue >= 0 ? 'trend-up' : 'trend-down'}`}>
              {trendValue >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(trendValue)}%
            </span>
          )}
          <span className="stat-subtitle">{subtitle}</span>
        </div>
      </>
    )}
  </Card>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{payload[0].name}</div>
        <div className="tooltip-value">{fmt(payload[0].value)}</div>
        <div className="tooltip-pct">{payload[0].payload.percentage}% of total</div>
      </div>
    );
  }
  return null;
};

const AreaTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-label">{label}</div>
        <div className="tooltip-value">{fmt(payload[0].value)}</div>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await expenseAPI.getDashboard();
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const overview = data?.overview || {};
  const categories = data?.categoryBreakdown || [];
  const recent = data?.recentExpenses || [];
  const trend = data?.monthlyTrend || [];

  return (
    <div className="dashboard">
      {error && <div className="error-banner">{error}</div>}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Expenses"
          value={fmt(overview.totalExpenses)}
          subtitle={`${overview.totalCount || 0} transactions`}
          icon={DollarSign}
          accent="blue"
          loading={loading}
        />
        <StatCard
          title="This Month"
          value={fmt(overview.monthlyExpenses)}
          subtitle={`${overview.monthlyCount || 0} this month`}
          icon={Calendar}
          trend
          trendValue={overview.monthlyChange || 0}
          accent="amber"
          loading={loading}
        />
        <StatCard
          title="This Week"
          value={fmt(overview.weeklyExpenses)}
          subtitle={`${overview.weeklyCount || 0} this week`}
          icon={Clock}
          accent="green"
          loading={loading}
        />
        <StatCard
          title="Last Month"
          value={fmt(overview.lastMonthExpenses)}
          subtitle="Previous period"
          icon={TrendingUp}
          accent="purple"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Monthly Trend */}
        <Card className="chart-card chart-area">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Spending</h3>
            <span className="chart-sub">Last 12 months</span>
          </div>
          {loading ? (
            <Skeleton height="200px" />
          ) : trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month" tick={{ fill: '#555d70', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555d70', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                <Tooltip content={<AreaTooltip />} />
                <Area type="monotone" dataKey="total" stroke="#4f8ef7" strokeWidth={2} fill="url(#areaGrad)" dot={false} activeDot={{ r: 4, fill: '#4f8ef7' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-empty">No data yet</div>
          )}
        </Card>

        {/* Pie Chart */}
        <Card className="chart-card chart-pie">
          <div className="chart-header">
            <h3 className="chart-title">By Category</h3>
            <span className="chart-sub">Breakdown</span>
          </div>
          {loading ? (
            <Skeleton height="200px" />
          ) : categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {categories.map((entry, i) => (
                      <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category] || '#555'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {categories.map((c) => (
                  <div key={c.category} className="legend-item">
                    <span className="legend-dot" style={{ background: CATEGORY_COLORS[c.category] }} />
                    <span className="legend-name">{c.category}</span>
                    <span className="legend-pct">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="chart-empty">No data yet</div>
          )}
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="recent-card">
        <div className="section-header">
          <div>
            <h3 className="chart-title">Recent Transactions</h3>
            <span className="chart-sub">Latest activity</span>
          </div>
          <Link to="/expenses" className="view-all-link">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {loading ? (
          <div className="recent-list">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="recent-row">
                <Skeleton height="16px" width="160px" />
                <Skeleton height="16px" width="80px" />
              </div>
            ))}
          </div>
        ) : recent.length > 0 ? (
          <div className="recent-list">
            {recent.map((exp) => (
              <div key={exp._id} className="recent-row">
                <div className="recent-info">
                  <div className="recent-dot" style={{ background: CATEGORY_COLORS[exp.category] }} />
                  <div>
                    <div className="recent-name">{exp.name}</div>
                    <div className="recent-meta">
                      <CategoryBadge category={exp.category} />
                      <span className="recent-vendor">{exp.vendor}</span>
                    </div>
                  </div>
                </div>
                <div className="recent-right">
                  <div className="recent-amount">{fmt(exp.amount)}</div>
                  <div className="recent-date">{format(new Date(exp.date), 'MMM d')}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="chart-empty" style={{ padding: '32px 0' }}>No transactions yet</div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
