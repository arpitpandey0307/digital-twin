import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { getDashboardOverview } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  AlertTriangle, Droplets, Wind, Thermometer, Users,
  CheckCircle, Clock, TrendingUp, Shield, Activity
} from 'lucide-react';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#ec4899'];

const severityColor = (score) => {
  if (score >= 70) return 'var(--danger)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--success)';
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardOverview();
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // Set mock data for demo
        setData({
          city_risk_score: 42,
          total_complaints: 156,
          active_complaints: 43,
          resolved_complaints: 113,
          active_alerts: 5,
          current_weather: { temperature: 29.5, humidity: 78, rainfall_mm: 12.3, condition: 'Partly Cloudy', wind_speed: 14.2 },
          current_aqi: { aqi: 127, pm25: 48.2, pm10: 72.1, no2: 32.5 },
          flood_risk_by_ward: [
            { ward: 'Ward 4 - Kurla', probability: 0.72, impact: 'high' },
            { ward: 'Ward 12 - Kandivali', probability: 0.65, impact: 'high' },
            { ward: 'Ward 7 - Mulund', probability: 0.48, impact: 'medium' },
            { ward: 'Ward 8 - Chembur', probability: 0.41, impact: 'medium' },
            { ward: 'Ward 5 - Andheri', probability: 0.33, impact: 'medium' },
            { ward: 'Ward 3 - Dadar', probability: 0.25, impact: 'low' },
          ],
          recent_alerts: [
            { id: '1', title: 'Flood Risk Alert — Ward 4', severity: 'critical', target_ward: 'Ward 4 - Kurla', created_at: new Date().toISOString() },
            { id: '2', title: 'AQI Warning — Ward 8', severity: 'warning', target_ward: 'Ward 8 - Chembur', created_at: new Date().toISOString() },
            { id: '3', title: 'Traffic Congestion — Ward 5', severity: 'info', target_ward: 'Ward 5 - Andheri', created_at: new Date().toISOString() },
          ],
          ai_insight: 'Heavy rainfall expected in the next 6 hours combined with existing drainage complaints indicates elevated flood risk in Ward 4 (Kurla) and Ward 12 (Kandivali). Recommend deploying pump stations and alerting residents before 6 PM.',
          complaint_stats: { flooding: 28, garbage: 35, pothole: 22, streetlight: 18, noise: 12, road_damage: 15, parking: 8, other: 18 },
          ward_summary: [],
          recent_recommendations: [
            { id: '1', action: 'Deploy 2 pump stations in Ward 4', priority: 'urgent', department: 'Flood Control' },
            { id: '2', action: 'Clear drainage channels in Ward 12', priority: 'high', department: 'Municipality' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <TopBar title="Command Center" />
        <div className="page-content">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading city intelligence...</p>
          </div>
        </div>
      </>
    );
  }

  const w = data.current_weather || {};
  const aqi = data.current_aqi || {};
  const riskColor = severityColor(data.city_risk_score);

  const complaintChartData = Object.entries(data.complaint_stats || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
  }));

  const floodChartData = (data.flood_risk_by_ward || []).map(f => ({
    ward: f.ward.replace('Ward ', 'W').split(' - ')[0],
    risk: Math.round(f.probability * 100),
  }));

  return (
    <>
      <TopBar title="Command Center" />
      <div className="page-content">
        {/* AI Insight Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            marginBottom: 'var(--space-lg)',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.05))',
            borderColor: 'rgba(99, 102, 241, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>🧠</div>
            <div>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4, color: 'var(--accent-400)' }}>
                AI Intelligence Insight
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {data.ai_insight}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Metrics Row */}
        <div className="metrics-grid">
          <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="metric-icon red"><Shield size={20} /></div>
            <div className="metric-label">City Risk Score</div>
            <div className="metric-value" style={{ color: riskColor }}>{Math.round(data.city_risk_score)}</div>
            <div className="metric-trend neutral">out of 100</div>
          </motion.div>

          <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="metric-icon blue"><Droplets size={20} /></div>
            <div className="metric-label">Rainfall</div>
            <div className="metric-value">{w.rainfall_mm || 0}<span style={{ fontSize: '0.9rem' }}>mm</span></div>
            <div className="metric-trend neutral">{w.condition || 'N/A'}</div>
          </motion.div>

          <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="metric-icon yellow"><Wind size={20} /></div>
            <div className="metric-label">Air Quality</div>
            <div className="metric-value" style={{ color: aqi.aqi > 200 ? 'var(--danger)' : aqi.aqi > 100 ? 'var(--warning)' : 'var(--success)' }}>
              {aqi.aqi || 'N/A'}
            </div>
            <div className="metric-trend neutral">PM2.5: {aqi.pm25 || 'N/A'}</div>
          </motion.div>

          <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div className="metric-icon green"><Thermometer size={20} /></div>
            <div className="metric-label">Temperature</div>
            <div className="metric-value">{w.temperature || 'N/A'}°</div>
            <div className="metric-trend neutral">Humidity: {w.humidity || 'N/A'}%</div>
          </motion.div>

          <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="metric-icon purple"><Users size={20} /></div>
            <div className="metric-label">Active Complaints</div>
            <div className="metric-value">{data.active_complaints}</div>
            <div className="metric-trend neutral">of {data.total_complaints} total</div>
          </motion.div>

          <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <div className="metric-icon cyan"><AlertTriangle size={20} /></div>
            <div className="metric-label">Active Alerts</div>
            <div className="metric-value" style={{ color: data.active_alerts > 3 ? 'var(--danger)' : 'var(--warning)' }}>
              {data.active_alerts}
            </div>
            <div className="metric-trend neutral">
              <CheckCircle size={12} /> {data.resolved_complaints} resolved
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          {/* Flood Risk Chart */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="glass-card-header">
              <span className="glass-card-title">🌊 Flood Risk by Ward</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={floodChartData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis type="category" dataKey="ward" tick={{ fill: '#94a3b8', fontSize: 11 }} width={50} />
                  <Tooltip
                    contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 }}
                    formatter={(v) => [`${v}%`, 'Risk']}
                  />
                  <Bar dataKey="risk" radius={[0, 6, 6, 0]}>
                    {floodChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.risk > 60 ? '#ef4444' : entry.risk > 30 ? '#f59e0b' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Complaint Distribution */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="glass-card-header">
              <span className="glass-card-title">📋 Complaints by Category</span>
            </div>
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie data={complaintChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {complaintChartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, fontSize: '0.8rem' }}>
                {complaintChartData.slice(0, 6).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{item.name}</span>
                    <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Row — Alerts + Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          {/* Recent Alerts */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="glass-card-header">
              <span className="glass-card-title">🚨 Recent Alerts</span>
              <span className="badge badge-danger">{data.active_alerts} active</span>
            </div>
            {(data.recent_alerts || []).map((alert) => (
              <div key={alert.id} className="alert-item">
                <div className={`alert-dot ${alert.severity}`} />
                <div className="alert-content">
                  <div className="alert-title">{alert.title}</div>
                  <div className="alert-meta">{alert.target_ward} • {new Date(alert.created_at).toLocaleTimeString()}</div>
                </div>
                <span className={`badge badge-${alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}`}>
                  {alert.severity}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Recommendations */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <div className="glass-card-header">
              <span className="glass-card-title">⚡ AI Recommendations</span>
            </div>
            {(data.recent_recommendations || []).map((rec, i) => (
              <div key={rec.id || i} className="alert-item">
                <div className={`alert-dot ${rec.priority === 'urgent' ? 'emergency' : 'warning'}`} />
                <div className="alert-content">
                  <div className="alert-title">{rec.action}</div>
                  <div className="alert-meta">{rec.department} • Priority: {rec.priority}</div>
                </div>
                <button className="btn btn-sm btn-primary">Execute</button>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
}
