import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

const wardComparison = [
  { ward: 'W1', score: 78, complaints: 12 },
  { ward: 'W2', score: 65, complaints: 24 },
  { ward: 'W3', score: 72, complaints: 18 },
  { ward: 'W4', score: 42, complaints: 38 },
  { ward: 'W5', score: 55, complaints: 32 },
  { ward: 'W6', score: 81, complaints: 8 },
  { ward: 'W7', score: 48, complaints: 28 },
  { ward: 'W8', score: 58, complaints: 22 },
  { ward: 'W9', score: 70, complaints: 15 },
  { ward: 'W10', score: 62, complaints: 20 },
  { ward: 'W11', score: 59, complaints: 25 },
  { ward: 'W12', score: 44, complaints: 35 },
];

const deptPerformance = [
  { dept: 'Flood Control', resolved: 45, pending: 12, avg_days: 2.1 },
  { dept: 'Municipality', resolved: 78, pending: 25, avg_days: 4.5 },
  { dept: 'Sanitation', resolved: 62, pending: 18, avg_days: 3.2 },
  { dept: 'Electricity', resolved: 35, pending: 8, avg_days: 1.8 },
  { dept: 'Traffic', resolved: 28, pending: 15, avg_days: 5.1 },
];

const tooltipStyle = { background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 };

export default function AnalyticsPage() {
  return (
    <>
      <TopBar title="Analytics" />
      <div className="page-content">
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
          {/* Ward Comparison */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="glass-card-header"><span className="glass-card-title">🏙️ Ward Health Scores</span></div>
            <div className="chart-container tall">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="ward" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} fill="#6366f1">
                    {wardComparison.map((e, i) => (
                      <motion.rect key={i} fill={e.score > 70 ? '#22c55e' : e.score > 50 ? '#f59e0b' : '#ef4444'} />
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
