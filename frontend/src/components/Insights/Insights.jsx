import React, { useState } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle, Info, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { expenseAPI } from '../../services/api';
import { Card, Button, Spinner } from '../UI';
import './Insights.css';

const ICON_MAP = {
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  tip: Lightbulb,
};

const COLOR_MAP = {
  warning: 'amber',
  info: 'blue',
  success: 'green',
  tip: 'purple',
};

const IMPACT_MAP = {
  high: { label: 'High Impact', color: 'red' },
  medium: { label: 'Medium Impact', color: 'amber' },
  low: { label: 'Low Impact', color: 'green' },
};

const InsightCard = ({ insight }) => {
  const Icon = ICON_MAP[insight.type] || Info;
  const color = COLOR_MAP[insight.type] || 'blue';
  const impact = IMPACT_MAP[insight.impact] || IMPACT_MAP.medium;

  return (
    <div className={`insight-card insight-${color}`}>
      <div className="insight-top">
        <div className={`insight-icon-wrap icon-${color}`}>
          <Icon size={16} />
        </div>
        <div className="insight-meta">
          <span className={`insight-impact impact-${impact.color}`}>{impact.label}</span>
          {insight.category && (
            <span className="insight-cat">{insight.category}</span>
          )}
        </div>
      </div>
      <h4 className="insight-title">{insight.title}</h4>
      <p className="insight-desc">{insight.description}</p>
    </div>
  );
};

const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    try {
      const res = await expenseAPI.getInsights();
      setData(res.data);
      setGenerated(true);
      toast.success('Insights generated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="insights-page">
      {!generated ? (
        <Card className="generate-card">
          <div className="generate-inner">
            <div className="generate-icon">
              <Lightbulb size={36} />
            </div>
            <h2 className="generate-title">AI-Powered Financial Insights</h2>
            <p className="generate-desc">
              Get intelligent analysis of your spending patterns, detect overspending trends,
              and receive personalized budget recommendations powered by Gemini AI.
            </p>
            <div className="generate-features">
              {[
                'Spending pattern detection',
                'Budget optimization tips',
                'Category analysis',
                'Subscription review',
              ].map((f) => (
                <div key={f} className="gen-feature">
                  <CheckCircle size={14} />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={generateInsights}
              loading={loading}
              icon={loading ? null : <Lightbulb size={16} />}
            >
              {loading ? 'Analyzing your expenses...' : 'Generate Insights'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="insights-content">
          {/* Header */}
          <div className="insights-header">
            <div>
              <h2 className="insights-main-title">Spending Analysis</h2>
              <p className="insights-analyzed">{data?.totalAnalyzed || 0} transactions analyzed</p>
            </div>
            <Button
              variant="secondary"
              icon={<RefreshCw size={14} />}
              onClick={generateInsights}
              loading={loading}
            >
              Refresh
            </Button>
          </div>

          {/* Summary */}
          {data?.summary && (
            <Card className="summary-card">
              <div className="summary-icon"><TrendingUp size={18} /></div>
              <p className="summary-text">{data.summary}</p>
            </Card>
          )}

          {/* Top stat */}
          {data?.topCategory && (
            <div className="top-stat-row">
              <Card className="top-stat">
                <div className="top-stat-label">Highest Spending Category</div>
                <div className="top-stat-value">{data.topCategory}</div>
                <div className="top-stat-amount">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.topCategoryAmount || 0)}
                </div>
              </Card>
            </div>
          )}

          {/* Insights grid */}
          {data?.insights?.length > 0 && (
            <div>
              <h3 className="section-heading">Key Findings</h3>
              <div className="insights-grid">
                {data.insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} />
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {data?.recommendations?.length > 0 && (
            <Card className="recommendations-card">
              <h3 className="rec-title">Action Items</h3>
              <div className="rec-list">
                {data.recommendations.map((rec, i) => (
                  <div key={i} className="rec-item">
                    <div className="rec-num">{String(i + 1).padStart(2, '0')}</div>
                    <p className="rec-text">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Insights;
