import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { getExerciseTrend } from '../../db/analyticsService.js';
import './TrendChart.css';

/**
 * Trend Chart — Phase 3.5
 *
 * 30-day exercise trend line with 7-day moving average.
 * Shows trend direction: improving / stable / declining.
 */
export default function TrendChart({ exerciseId, exerciseName }) {
  const [trendData, setTrendData] = useState(null);

  useEffect(() => {
    if (!exerciseId) return;
    getExerciseTrend(exerciseId, 30).then(setTrendData);
  }, [exerciseId]);

  if (!trendData || trendData.data.length < 2) {
    return (
      <div className="trend-chart">
        <div className="trend-chart__empty">
          <p className="trend-chart__empty-text">
            Need 2+ sessions to show trends
          </p>
        </div>
      </div>
    );
  }

  const { data, trend } = trendData;

  const TrendIcon = trend === 'improving' ? TrendingUp
    : trend === 'declining' ? TrendingDown
    : Minus;

  const trendLabel = trend === 'improving' ? '↑ Improving'
    : trend === 'declining' ? '↓ Declining'
    : '→ Stable';

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.[0]) return null;
    const point = payload[0].payload;
    return (
      <div style={{
        background: '#181818',
        border: '1px solid #2a2a2a',
        borderRadius: '6px',
        padding: '6px 10px',
        fontSize: '11px',
        fontFamily: "'Satoshi', sans-serif",
      }}>
        <div style={{ color: '#F5F5F5', fontWeight: 600 }}>
          {point.value}
        </div>
        <div style={{ color: '#555', fontSize: '9px' }}>
          {point.date}
        </div>
      </div>
    );
  };

  return (
    <div className="trend-chart">
      <div className="trend-chart__header">
        <span className="trend-chart__label">30-DAY TREND</span>
        <span className={`trend-chart__trend trend-chart__trend--${trend}`}>
          <TrendIcon size={12} />
          {trendLabel}
        </span>
      </div>

      <div className="trend-chart__chart">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={data}>
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
            <Tooltip content={<CustomTooltip />} />
            {/* Raw data points */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#555555"
              strokeWidth={1}
              dot={{ r: 3, fill: '#555555', strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#E63946', strokeWidth: 0 }}
            />
            {/* Moving average */}
            <Line
              type="monotone"
              dataKey="movingAvg"
              stroke="#E63946"
              strokeWidth={2}
              dot={false}
              strokeDasharray="0"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
