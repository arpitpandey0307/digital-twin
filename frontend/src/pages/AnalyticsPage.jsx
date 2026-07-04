import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { getDashboardOverview } from '../services/api';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// Mock analytics data
const complaintTrend = [
  { month: 'Jan', flooding: 12, garbage: 20, pothole: 15, streetlight: 8 },
  { month: 'Feb', flooding: 18, garbage: 25, pothole: 12, streetlight: 10 },
  { month: 'Mar', flooding: 22, garbage: 32, pothole: 18, streetlight: 14 },
  { month: 'Apr', flooding: 15, garbage: 28, pothole: 20, streetlight: 11 },
  { month: 'May', flooding: 35, garbage: 30, pothole: 16, streetlight: 9 },
  { month: 'Jun', flooding: 55, garbage: 22, pothole: 10, streetlight: 13 },
];

const aqiTrend = [
  { day: 'Mon', aqi: 95, pm25: 38, pm10: 62 },
  { day: 'Tue', aqi: 112, pm25: 45, pm10: 71 },
  { day: 'Wed', aqi: 138, pm25: 55, pm10: 88 },
  { day: 'Thu', aqi: 127, pm25: 50, pm10: 80 },
  { day: 'Fri', aqi: 145, pm25: 58, pm10: 92 },
  { day: 'Sat', aqi: 108, pm25: 42, pm10: 68 },
  { day: 'Sun', aqi: 88, pm25: 35, pm10: 55 },
];

const deptPerformance = [
  { dept: 'Flood Control', resolved: 45, pending: 12, avg_days: 2.1 },
  { dept: 'Municipality', resolved: 78, pending: 25, avg_days: 4.5 },
  { dept: 'Sanitation', resolved: 62, pending: 18, avg_days: 3.2 },
  { dept: 'Electricity', resolved: 35, pending: 8, avg_days: 1.8 },
  { dept: 'Traffic', resolved: 28, pending: 15, avg_days: 5.1 },
];

const tooltipStyle = { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 };

const sentimentEmoji = (score) => {
  if (score >= 70) return '😊';
  if (score >= 50) return '😐';
  if (score >= 30) return '😟';
  return '😡';
};

const sentimentColor = (score) => {
  if (score >= 70) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  if (score >= 30) return '#ef4444';
  return '#dc2626';
};

export default function AnalyticsPage() {
  const [sentiment, setSentiment] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardOverview();
        setSentiment(res.data.sentiment);
      } catch {
        setSentiment({
          positive: 35, neutral: 30, negative: 25, urgent: 10, total_analyzed: 156,
          ward_sentiment: [
            { ward: 'Ward 4 - Kurla', score: 32, complaints: 28, urgent: 5 },
            { ward: 'Ward 12 - Kandivali', score: 38, complaints: 22, urgent: 3 },
            { ward: 'Ward 7 - Mulund', score: 55, complaints: 15, urgent: 1 },
            { ward: 'Ward 5 - Andheri', score: 62, complaints: 12, urgent: 0 },
            { ward: 'Ward 8 - Chembur', score: 58, complaints: 10, urgent: 1 },
            { ward: 'Ward 3 - Dadar', score: 78, complaints: 6, urgent: 0 },
            { ward: 'Ward 1 - Colaba', score: 82, complaints: 4, urgent: 0 },
            { ward: 'Ward 6 - Malad', score: 65, complaints: 9, urgent: 0 },
          ],
        });
      }
    };
    fetchData();
  }, []);

  const sentimentPieData = sentiment ? [
    { name: 'Positive', value: sentiment.positive, color: '#22c55e' },
    { name: 'Neutral', value: sentiment.neutral, color: '#3b82f6' },
    { name: 'Negative', value: sentiment.negative, color: '#f59e0b' },
    { name: 'Urgent', value: sentiment.urgent, color: '#ef4444' },
  ] : [];

  return (
    <>
      <TopBar title="Analytics" />
      <div className="page-content">
        {/* Citizen Sentiment Section */}
        {sentiment && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
              {/* Sentiment Overview */}
              <div className="glass-card">
                <div className="glass-card-header">
                  <span className="glass-card-title">😊 Citizen Sentiment Analysis</span>
                  <span className="badge badge-info">{sentiment.total_analyzed} analyzed</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                  {sentimentPieData.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', padding: 8, background: `${s.color}08`, borderRadius: 'var(--radius-md)', border: `1px solid ${s.color}15` }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: s.color }}>{s.value}%</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.name}</div>
                    </div>
                  ))}
                </div>
                {/* Sentiment bar */}
                <div style={{ height: 12, borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
                  {sentimentPieData.map((s, i) => (
                    <motion.div key={i}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{ height: '100%', background: s.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Ward Sentiment Heatmap */}
              <div className="glass-card">
                <div className="glass-card-header">
                  <span className="glass-card-title">🗺️ Ward Sentiment Map</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(sentiment.ward_sentiment || []).map((ws, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 10px', borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.02)',
                        border: `1px solid ${sentimentColor(ws.score)}10`,
                      }}>
                      <span style={{ fontSize: '1.1rem' }}>{sentimentEmoji(ws.score)}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{ws.ward}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                          {ws.complaints} complaints{ws.urgent > 0 ? ` • ${ws.urgent} urgent` : ''}
                        </div>
                      </div>
                      {/* Score bar */}
                      <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${ws.score}%`,
                          background: sentimentColor(ws.score),
                          borderRadius: 3, transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: sentimentColor(ws.score), minWidth: 30, textAlign: 'right' }}>
                        {ws.score}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          {/* Complaints Over Time */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="glass-card-header"><span className="glass-card-title">📋 Complaints Over Time</span></div>
            <div className="chart-container tall">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={complaintTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="flooding" stackId="1" stroke="#3b82f6" fill="rgba(59,130,246,0.3)" />
                  <Area type="monotone" dataKey="garbage" stackId="1" stroke="#22c55e" fill="rgba(34,197,94,0.3)" />
                  <Area type="monotone" dataKey="pothole" stackId="1" stroke="#f59e0b" fill="rgba(245,158,11,0.3)" />
                  <Area type="monotone" dataKey="streetlight" stackId="1" stroke="#8b5cf6" fill="rgba(139,92,246,0.3)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AQI Trends */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="glass-card-header"><span className="glass-card-title">💨 AQI Weekly Trend</span></div>
            <div className="chart-container tall">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aqiTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="aqi" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="pm25" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pm10" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          {/* Ward Health Scores */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card-header"><span className="glass-card-title">🏙️ Ward Health Scores</span></div>
            <div className="chart-container tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(sentiment?.ward_sentiment || []).map(w => ({ ward: w.ward.replace('Ward ', 'W').split(' - ')[0], score: w.score }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="ward" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                    {(sentiment?.ward_sentiment || []).map((e, i) => (
                      <Cell key={i} fill={e.score > 70 ? '#22c55e' : e.score > 50 ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Department Performance */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-card-header"><span className="glass-card-title">📊 Department Performance</span></div>
            <table className="data-table">
              <thead>
                <tr><th>Department</th><th>Resolved</th><th>Pending</th><th>Avg Days</th></tr>
              </thead>
              <tbody>
                {deptPerformance.map((d, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{d.dept}</td>
                    <td><span className="badge badge-success">{d.resolved}</span></td>
                    <td><span className="badge badge-warning">{d.pending}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: d.avg_days > 4 ? 'var(--danger)' : 'var(--success)' }}>{d.avg_days}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </>
  );
}
