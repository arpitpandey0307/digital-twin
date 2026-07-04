import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { getDashboardOverview } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar
} from 'recharts';
import {
  AlertTriangle, Droplets, Wind, Thermometer, Users,
  CheckCircle, Clock, TrendingUp, Shield, Activity, Zap,
  ChevronRight, BarChart3, Brain, Eye, Heart, Building, Car
} from 'lucide-react';

const COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#ef4444', '#22c55e', '#8b5cf6', '#ec4899'];

const severityColor = (score) => {
  if (score >= 70) return 'var(--danger)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--success)';
};

const healthGradeColor = (grade) => {
  const map = { A: '#22c55e', B: '#84cc16', C: '#f59e0b', D: '#ef4444', F: '#dc2626' };
  return map[grade] || '#64748b';
};

const agentIcon = (name) => {
  if (name.includes('Analyst')) return <BarChart3 size={16} />;
  if (name.includes('Predictor')) return <TrendingUp size={16} />;
  if (name.includes('Vision')) return <Eye size={16} />;
  if (name.includes('Reasoner')) return <Brain size={16} />;
  if (name.includes('Recommender')) return <Zap size={16} />;
  return <Activity size={16} />;
};

const factorIcon = (name) => {
  if (name.includes('Weather')) return '☁️';
  if (name.includes('Air')) return '💨';
  if (name.includes('Traffic')) return '🚗';
  if (name.includes('Health')) return '🏥';
  if (name.includes('Citizen')) return '👥';
  if (name.includes('Infra')) return '🏗️';
  if (name.includes('Emergency')) return '🛡️';
  return '📊';
};

const timelineSeverityColor = (sev) => {
  if (sev === 'critical') return '#ef4444';
  if (sev === 'warning') return '#f59e0b';
  return '#3b82f6';
};

// Mock data used when backend is unavailable
const MOCK_DATA = {
  city_health: {
    score: 72, grade: 'C',
    factors: [
      { name: 'Weather Safety', score: 11, max: 15, icon: 'cloud' },
      { name: 'Air Quality', score: 10, max: 15, icon: 'wind' },
      { name: 'Traffic Flow', score: 9, max: 15, icon: 'car' },
      { name: 'Healthcare Access', score: 12, max: 15, icon: 'heart' },
      { name: 'Citizen Satisfaction', score: 10, max: 15, icon: 'users' },
      { name: 'Infrastructure', score: 12, max: 15, icon: 'building' },
      { name: 'Emergency Readiness', score: 8, max: 10, icon: 'shield' },
    ],
    trend: 'down', change: -2.3,
  },
  city_risk_score: 28,
  total_complaints: 156,
  active_complaints: 43,
  resolved_complaints: 113,
  active_alerts: 5,
  current_weather: { temperature: 29.5, humidity: 78, rainfall_mm: 45, condition: 'Heavy Rain', wind_speed: 14.2 },
  current_aqi: { aqi: 127, pm25: 48.2, pm10: 72.1, no2: 32.5 },
  flood_risk_by_ward: [
    { ward: 'Ward 4 - Kurla', probability: 0.82, impact: 'critical', confidence: 0.91, affected_population: 18200,
      factor_breakdown: [
        { factor: 'Rainfall', contribution: 42, value: '45mm', weight: 0.40 },
        { factor: 'Drainage Issues', contribution: 28, value: '38% capacity', weight: 0.25 },
        { factor: 'Citizen Complaints', contribution: 15, value: '12 reports', weight: 0.18 },
        { factor: 'River/Water Level', contribution: 10, value: '14cm est.', weight: 0.10 },
        { factor: 'Population Density', contribution: 5, value: '180,000', weight: 0.07 },
      ],
      reasoning_chain: 'Flood probability for Ward 4 - Kurla is 82% because: 45mm rainfall (drainage at 38% capacity), 12 active flooding complaints, estimated water level at 14cm, serving 180,000 residents. Confidence: 91%.' },
    { ward: 'Ward 12 - Kandivali', probability: 0.71, impact: 'high', confidence: 0.87, affected_population: 14500, factor_breakdown: [], reasoning_chain: '' },
    { ward: 'Ward 7 - Mulund', probability: 0.48, impact: 'medium', confidence: 0.82, affected_population: 8900, factor_breakdown: [], reasoning_chain: '' },
    { ward: 'Ward 8 - Chembur', probability: 0.41, impact: 'medium', confidence: 0.79, affected_population: 7200, factor_breakdown: [], reasoning_chain: '' },
    { ward: 'Ward 5 - Andheri', probability: 0.33, impact: 'medium', confidence: 0.75, affected_population: 5100, factor_breakdown: [], reasoning_chain: '' },
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
  decision_timeline: [
    { time: '2:00 PM', hours_from_now: 0, event: 'Current Conditions', severity: 'info', description: 'Rainfall: 45mm, AQI: 127, 12 wards active.', confidence: 0.99 },
    { time: '3:00 PM', hours_from_now: 1, event: 'Drainage Systems Under Stress', severity: 'warning', description: 'At 45mm, drainage in Ward 4 reaches 38% capacity.', confidence: 0.92 },
    { time: '4:00 PM', hours_from_now: 2, event: 'Localized Flooding Expected', severity: 'critical', description: 'Low-lying areas in Ward 4 may flood. Est. 18,200 residents impacted.', confidence: 0.85 },
    { time: '5:00 PM', hours_from_now: 3, event: 'Road Closures Likely', severity: 'warning', description: '2-4 roads in Ward 4 may become impassable.', confidence: 0.78 },
    { time: '6:00 PM', hours_from_now: 4, event: 'Traffic Congestion Spike', severity: 'warning', description: 'Diverted traffic increases congestion by 40-65%.', confidence: 0.74 },
    { time: '8:00 PM', hours_from_now: 6, event: 'Emergency Response Delays', severity: 'critical', description: 'Ambulance response +8-15 min. 4 hospitals access issues.', confidence: 0.68 },
  ],
  sentiment: {
    positive: 35, neutral: 30, negative: 25, urgent: 10, total_analyzed: 156,
    ward_sentiment: [
      { ward: 'Ward 4 - Kurla', score: 32, complaints: 28, urgent: 5 },
      { ward: 'Ward 12 - Kandivali', score: 38, complaints: 22, urgent: 3 },
      { ward: 'Ward 7 - Mulund', score: 55, complaints: 15, urgent: 1 },
      { ward: 'Ward 5 - Andheri', score: 62, complaints: 12, urgent: 0 },
      { ward: 'Ward 3 - Dadar', score: 78, complaints: 6, urgent: 0 },
    ],
  },
  agent_status: [
    { id: 1, name: 'Data Analyst', status: 'active', last_run: '2 min ago', processed: 142, description: 'Finds patterns, trends & anomalies' },
    { id: 2, name: 'Predictor', status: 'active', last_run: '2 min ago', processed: 48, description: 'ML-powered risk predictions' },
    { id: 3, name: 'Vision Analyzer', status: 'idle', last_run: '15 min ago', processed: 12, description: 'Computer vision for complaints' },
    { id: 4, name: 'Reasoner (RAG)', status: 'active', last_run: '1 min ago', processed: 35, description: 'Gemini-powered reasoning & Q&A' },
    { id: 5, name: 'Recommender', status: 'active', last_run: '2 min ago', processed: 28, description: 'Actionable recommendations + cost analysis' },
  ],
  budget_impact: { total_action_cost: 285000, total_prevented_damage: 1820000, roi_ratio: 6.4 },
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDashboardOverview();
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setData(MOCK_DATA);
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
  const health = data.city_health || { score: 72, grade: 'C', factors: [], trend: 'stable', change: 0 };
  const timeline = data.decision_timeline || [];
  const sentiment = data.sentiment || {};
  const agents = data.agent_status || [];
  const budget = data.budget_impact || {};
  const selected = selectedWard !== null ? (data.flood_risk_by_ward || [])[selectedWard] : null;

  const complaintChartData = Object.entries(data.complaint_stats || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
    value,
  }));

  const floodChartData = (data.flood_risk_by_ward || []).map(f => ({
    ward: f.ward.replace('Ward ', 'W').split(' - ')[0],
    risk: Math.round(f.probability * 100),
  }));

  const healthGaugeData = [{ name: 'Score', value: health.score, fill: healthGradeColor(health.grade) }];

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
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4, color: 'var(--accent-400)' }}>
                AI Intelligence Insight
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {data.ai_insight}
              </p>
            </div>
            {/* Budget Impact Mini */}
            <div style={{
              textAlign: 'right', flexShrink: 0, padding: '4px 12px',
              background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(34,197,94,0.15)',
            }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI ROI</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                {budget.roi_ratio || 6.4}x
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                ₹{((budget.total_prevented_damage || 1820000) / 100000).toFixed(1)}L saved
              </div>
            </div>
          </div>
        </motion.div>

        {/* Row 1: City Health + Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          {/* City Health Score */}
          <motion.div className="glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 8 }}>City Health</div>
            <div style={{ width: 140, height: 140, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={225} endAngle={-45} data={healthGaugeData}>
                  <RadialBar background={{ fill: 'rgba(255,255,255,0.04)' }} dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: healthGradeColor(health.grade) }}>
                  {health.score}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>
            <div style={{
              marginTop: 8, padding: '3px 12px', borderRadius: 'var(--radius-full)',
              background: `${healthGradeColor(health.grade)}15`,
              color: healthGradeColor(health.grade), fontWeight: 700, fontSize: '0.8rem',
            }}>
              Grade {health.grade} {health.trend === 'up' ? '↑' : health.trend === 'down' ? '↓' : '→'} {health.change > 0 ? '+' : ''}{health.change}
            </div>
            {/* Mini factor bars */}
            <div style={{ width: '100%', marginTop: 12 }}>
              {(health.factors || []).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, fontSize: '0.7rem' }}>
                  <span style={{ width: 14, textAlign: 'center' }}>{factorIcon(f.name)}</span>
                  <span style={{ flex: 1, color: 'var(--text-muted)' }}>{f.name}</span>
                  <div style={{ width: 50, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(f.score / f.max) * 100}%`, background: f.score / f.max > 0.7 ? 'var(--success)' : f.score / f.max > 0.4 ? 'var(--warning)' : 'var(--danger)', borderRadius: 2, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ width: 20, textAlign: 'right', fontFamily: 'var(--font-mono)', color: f.score / f.max > 0.7 ? 'var(--success)' : f.score / f.max > 0.4 ? 'var(--warning)' : 'var(--danger)' }}>{f.score}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Metrics Grid */}
          <div className="metrics-grid">
            <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <div className="metric-icon blue"><Droplets size={20} /></div>
              <div className="metric-label">Rainfall</div>
              <div className="metric-value">{w.rainfall_mm || 0}<span style={{ fontSize: '0.9rem' }}>mm</span></div>
              <div className="metric-trend neutral">{w.condition || 'N/A'}</div>
            </motion.div>

            <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <div className="metric-icon yellow"><Wind size={20} /></div>
              <div className="metric-label">Air Quality</div>
              <div className="metric-value" style={{ color: aqi.aqi > 200 ? 'var(--danger)' : aqi.aqi > 100 ? 'var(--warning)' : 'var(--success)' }}>
                {aqi.aqi || 'N/A'}
              </div>
              <div className="metric-trend neutral">PM2.5: {aqi.pm25 || 'N/A'}</div>
            </motion.div>

            <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="metric-icon green"><Thermometer size={20} /></div>
              <div className="metric-label">Temperature</div>
              <div className="metric-value">{w.temperature || 'N/A'}°</div>
              <div className="metric-trend neutral">Humidity: {w.humidity || 'N/A'}%</div>
            </motion.div>

            <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <div className="metric-icon purple"><Users size={20} /></div>
              <div className="metric-label">Active Complaints</div>
              <div className="metric-value">{data.active_complaints}</div>
              <div className="metric-trend neutral">of {data.total_complaints} total</div>
            </motion.div>

            <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <div className="metric-icon cyan"><AlertTriangle size={20} /></div>
              <div className="metric-label">Active Alerts</div>
              <div className="metric-value" style={{ color: data.active_alerts > 3 ? 'var(--danger)' : 'var(--warning)' }}>
                {data.active_alerts}
              </div>
              <div className="metric-trend neutral"><CheckCircle size={12} /> {data.resolved_complaints} resolved</div>
            </motion.div>

            <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <div className="metric-icon red"><Shield size={20} /></div>
              <div className="metric-label">Risk Score</div>
              <div className="metric-value" style={{ color: severityColor(data.city_risk_score || 0) }}>
                {Math.round(data.city_risk_score || 0)}
              </div>
              <div className="metric-trend neutral">out of 100</div>
            </motion.div>
          </div>
        </div>

        {/* Row 2: Decision Timeline */}
        {timeline.length > 0 && (
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="glass-card-header">
              <span className="glass-card-title">⏱️ 24-Hour Decision Timeline</span>
              <span className="badge badge-info">Proactive AI</span>
            </div>
            <div className="timeline-container">
              {timeline.map((event, i) => (
                <div key={i} className="timeline-item" style={{ '--timeline-color': timelineSeverityColor(event.severity) }}>
                  <div className="timeline-dot" style={{ background: timelineSeverityColor(event.severity), boxShadow: `0 0 8px ${timelineSeverityColor(event.severity)}` }} />
                  <div className="timeline-line" />
                  <div className="timeline-content">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: timelineSeverityColor(event.severity), fontWeight: 600 }}>
                        {event.time}
                      </span>
                      {event.hours_from_now > 0 && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.04)', padding: '1px 6px', borderRadius: 4 }}>
                          +{event.hours_from_now}h
                        </span>
                      )}
                      {event.confidence && (
                        <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {Math.round(event.confidence * 100)}% conf
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{event.event}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Row 3: Flood Risk + Explainability Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          {/* Flood Risk Chart */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <div className="glass-card-header">
              <span className="glass-card-title">🌊 Flood Risk by Ward</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click bar for details</span>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={floodChartData} layout="vertical" onClick={(e) => {
                  if (e && e.activeTooltipIndex !== undefined) setSelectedWard(e.activeTooltipIndex);
                }}>
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis type="category" dataKey="ward" tick={{ fill: '#94a3b8', fontSize: 11 }} width={50} />
                  <Tooltip
                    contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 13 }}
                    formatter={(v) => [`${v}%`, 'Risk']}
                  />
                  <Bar dataKey="risk" radius={[0, 6, 6, 0]} cursor="pointer">
                    {floodChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.risk > 60 ? '#ef4444' : entry.risk > 30 ? '#f59e0b' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* AI Explainability Panel */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
            <div className="glass-card-header">
              <span className="glass-card-title">🔍 AI Explainability</span>
              {selected && <span className="badge badge-warning">{selected.ward}</span>}
            </div>
            {selected && selected.factor_breakdown && selected.factor_breakdown.length > 0 ? (
              <div>
                {/* Confidence + probability */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 'var(--space-md)' }}>
                  <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.12)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prediction</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--danger)' }}>
                      {Math.round(selected.probability * 100)}%
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.12)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                      {Math.round((selected.confidence || 0.75) * 100)}%
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', padding: 8, background: 'rgba(99,102,241,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.12)' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Affected</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-400)' }}>
                      {(selected.affected_population || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
                {/* Factor Breakdown Bars */}
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Why this number?</div>
                {selected.factor_breakdown.map((f, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: 3 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{f.factor}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-400)' }}>{f.contribution}% • {f.value}</span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.contribution}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }}
                      />
                    </div>
                  </div>
                ))}
                {/* Reasoning */}
                {selected.reasoning_chain && (
                  <div style={{ marginTop: 12, padding: 10, background: 'rgba(99,102,241,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.1)', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--accent-400)' }}>🧠 Reasoning:</strong> {selected.reasoning_chain}
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🔍</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Click a ward in the chart to see AI reasoning</div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>See exactly why the AI predicted this risk level</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Row 4: Agent Pipeline + Complaints */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
          {/* Multi-Agent Pipeline */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="glass-card-header">
              <span className="glass-card-title">🤖 AI Agent Pipeline</span>
              <span className="badge badge-success">{agents.filter(a => a.status === 'active').length}/{agents.length} active</span>
            </div>
            <div className="agent-pipeline">
              {agents.map((agent, i) => (
                <div key={agent.id} className="agent-node">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)',
                      background: agent.status === 'active' ? 'linear-gradient(135deg, var(--primary-500), var(--accent-500))' : 'var(--surface-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: agent.status === 'active' ? '0 0 12px rgba(99,102,241,0.3)' : 'none',
                    }}>
                      {agentIcon(agent.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{agent.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{agent.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                        color: agent.status === 'active' ? 'var(--success)' : 'var(--text-dim)',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <div style={{
                          width: 6, height: 6, borderRadius: '50%',
                          background: agent.status === 'active' ? 'var(--success)' : 'var(--text-dim)',
                          boxShadow: agent.status === 'active' ? '0 0 6px var(--success)' : 'none',
                          animation: agent.status === 'active' ? 'pulse 2s infinite' : 'none',
                        }} />
                        {agent.status}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {agent.processed} processed
                      </div>
                    </div>
                  </div>
                  {i < agents.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <ChevronRight size={14} style={{ color: 'var(--text-dim)', transform: 'rotate(90deg)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Complaint Distribution */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
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

        {/* Row 5: Alerts + Recommendations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
          {/* Recent Alerts */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
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
          <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
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
