import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { generateReport } from '../services/api';
import { FileText, Download, Calendar, Building2, Zap, AlertTriangle, Shield, Users, Cloud, Activity } from 'lucide-react';

const staticReports = [
  { id: 1, title: 'Daily City Briefing — July 4, 2026', type: 'Daily', date: '2026-07-04', description: 'AI-generated summary of city status, top 3 risks, actions taken, and tomorrow predictions.' },
  { id: 2, title: 'Ward 4 (Kurla) — Flood Risk Assessment', type: 'Ward', date: '2026-07-04', description: 'Detailed flood risk analysis for Ward 4 including drainage capacity, historical data, and ML predictions.' },
  { id: 3, title: 'Monthly Complaint Analysis — June 2026', type: 'Monthly', date: '2026-06-30', description: 'Trend analysis, department performance, resolution rates, and citizen satisfaction metrics.' },
  { id: 4, title: 'Infrastructure Health Report', type: 'Infrastructure', date: '2026-07-03', description: 'Status of all hospitals, shelters, pump stations, fire stations across all 12 wards.' },
];

const typeBadge = (t) => {
  const map = { Daily: 'badge-info', Ward: 'badge-warning', Monthly: 'badge-success', Infrastructure: 'badge-neutral', 'AI Incident Report': 'badge-danger' };
  return map[t] || 'badge-neutral';
};

const sectionIcon = (key) => {
  const map = {
    executive_summary: <Shield size={16} />,
    predictions: <Activity size={16} />,
    risks: <AlertTriangle size={16} />,
    recommendations: <Zap size={16} />,
    resource_allocation: <Users size={16} />,
    impact_analysis: <Users size={16} />,
    weather: <Cloud size={16} />,
  };
  return map[key] || <FileText size={16} />;
};

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateReport();
      setReport(res.data);
    } catch (err) {
      // Mock report
      setReport({
        id: 'RPT-20260704-1430',
        title: 'City Intelligence Report — July 04, 2026',
        generated_at: new Date().toISOString(),
        type: 'AI Incident Report',
        sections: {
          executive_summary: {
            title: 'Executive Summary',
            content: 'As of 2:30 PM, 4 high-risk predictions are active across 8 wards. Current rainfall is 45mm with AQI at 127. Top complaint category: garbage (35 reports). Estimated 18,200 residents may be affected by current flood risks.',
            severity: 'warning',
          },
          predictions: {
            title: 'Active Predictions',
            items: [
              { ward: 'Ward 4 - Kurla', type: 'flood', probability: 82, impact: 'critical', description: 'Flood risk due to heavy rainfall and low drainage capacity' },
              { ward: 'Ward 12 - Kandivali', type: 'flood', probability: 71, impact: 'high', description: 'Moderate-high flood risk with rising water levels' },
              { ward: 'Ward 7 - Mulund', type: 'traffic', probability: 65, impact: 'high', description: 'Traffic congestion expected during rush hour with rainfall' },
              { ward: 'Ward 8 - Chembur', type: 'aqi', probability: 58, impact: 'medium', description: 'AQI expected to reach unhealthy levels' },
            ],
          },
          risks: {
            title: 'Risk Assessment',
            top_risks: [
              { ward: 'Ward 4 - Kurla', type: 'flood', probability: 0.82, impact: 'critical' },
              { ward: 'Ward 12 - Kandivali', type: 'flood', probability: 0.71, impact: 'high' },
              { ward: 'Ward 7 - Mulund', type: 'traffic', probability: 0.65, impact: 'high' },
            ],
            total_high_risk_wards: 2,
          },
          recommendations: {
            title: 'AI Recommendations',
            items: [
              'Deploy emergency pumps to Ward 4 - Kurla immediately',
              'Issue flood advisory for Ward 12 - Kandivali',
              'Pre-position medical teams near hospitals in affected wards',
              'Activate citizen alert system for 4 high-risk areas',
              'Clear drainage channels in top 3 risk wards',
            ],
          },
          resource_allocation: {
            title: 'Resource Allocation',
            allocations: [
              { ward: 'Ward 4 - Kurla', resource: 'Pump Stations', units: 2, priority: 'urgent' },
              { ward: 'Ward 12 - Kandivali', resource: 'Pump Stations', units: 1, priority: 'high' },
              { ward: 'Ward 7 - Mulund', resource: 'Traffic Police', units: 3, priority: 'high' },
            ],
            total_cost_estimate: 285000,
          },
          impact_analysis: {
            title: 'Impact Analysis',
            total_population: 2400000,
            affected_population: 42500,
            wards_at_risk: 3,
            active_alerts: 5,
            active_complaints: 43,
          },
          weather: {
            title: 'Current Conditions',
            temperature: 29.5,
            humidity: 78,
            rainfall_mm: 45,
            aqi: 127,
            condition: 'Heavy Rain',
          },
        },
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <TopBar title="Reports" />
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>AI-Generated Reports</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>One click → polished intelligence report with predictions, risks, and resource allocation</p>
          </div>
          <button className="btn btn-accent" onClick={handleGenerate} disabled={generating}>
            {generating ? (
              <>
                <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Generating...
              </>
            ) : (
              <><Zap size={16} /> Generate Incident Report</>
            )}
          </button>
        </div>

        {/* Generated Report */}
        <AnimatePresence>
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card"
              style={{ marginBottom: 'var(--space-xl)', borderColor: 'rgba(99,102,241,0.2)' }}
            >
              {/* Report Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)', paddingBottom: 'var(--space-md)', borderBottom: '1px solid var(--glass-border)' }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4 }}>{report.title}</h2>
                  <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>📄 {report.id}</span>
                    <span>🕐 {new Date(report.generated_at).toLocaleString()}</span>
                    <span className={`badge ${typeBadge(report.type)}`}>{report.type}</span>
                  </div>
                </div>
                <button className="btn btn-sm btn-secondary"><Download size={14} /> Export PDF</button>
              </div>

              {/* Executive Summary */}
              {report.sections.executive_summary && (
                <div style={{
                  padding: 'var(--space-md)', marginBottom: 'var(--space-md)',
                  background: report.sections.executive_summary.severity === 'critical' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${report.sections.executive_summary.severity === 'critical' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Shield size={16} style={{ color: 'var(--accent-400)' }} />
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{report.sections.executive_summary.title}</h3>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {report.sections.executive_summary.content}
                  </p>
                </div>
              )}

              {/* Predictions + Risks side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                {/* Predictions */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <Activity size={14} /> Active Predictions
                  </div>
                  {(report.sections.predictions?.items || []).map((p, i) => (
                    <div key={i} style={{
                      padding: '6px 10px', marginBottom: 4,
                      background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${p.probability > 70 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)'}`,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.85rem',
                        color: p.probability > 70 ? 'var(--danger)' : 'var(--warning)',
                        minWidth: 35,
                      }}>{p.probability}%</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 500 }}>{p.ward}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{p.type} • {p.impact}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <Zap size={14} /> AI Recommendations
                  </div>
                  {(report.sections.recommendations?.items || []).map((rec, i) => (
                    <div key={i} style={{
                      padding: '6px 10px', marginBottom: 4,
                      background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                      fontSize: '0.78rem',
                    }}>
                      <span style={{ color: 'var(--accent-400)', fontWeight: 600, flexShrink: 0 }}>{i + 1}.</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impact + Resources */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                {/* Impact Analysis */}
                <div style={{ padding: 'var(--space-md)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <Users size={14} /> Impact Analysis
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Total Population', value: (report.sections.impact_analysis?.total_population || 0).toLocaleString() },
                      { label: 'Affected', value: (report.sections.impact_analysis?.affected_population || 0).toLocaleString(), color: 'var(--danger)' },
                      { label: 'Wards at Risk', value: report.sections.impact_analysis?.wards_at_risk || 0, color: 'var(--warning)' },
                      { label: 'Active Alerts', value: report.sections.impact_analysis?.active_alerts || 0, color: 'var(--danger)' },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: item.color || 'var(--text-primary)' }}>
                          {item.value}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resource Allocation */}
                <div style={{ padding: 'var(--space-md)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <Building2 size={14} /> Resource Allocation
                  </div>
                  {(report.sections.resource_allocation?.allocations || []).map((alloc, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '0.78rem' }}>
                      <span style={{
                        padding: '2px 6px', borderRadius: 'var(--radius-sm)',
                        background: alloc.priority === 'urgent' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: alloc.priority === 'urgent' ? 'var(--danger)' : 'var(--warning)',
                        fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                      }}>{alloc.priority}</span>
                      <span style={{ fontWeight: 500 }}>{alloc.units}x {alloc.resource}</span>
                      <span style={{ color: 'var(--accent-400)', marginLeft: 'auto' }}>→ {alloc.ward}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Total Cost: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--warning)', fontWeight: 600 }}>
                      ₹{((report.sections.resource_allocation?.total_cost_estimate || 0) / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather */}
              {report.sections.weather && (
                <div style={{
                  display: 'flex', gap: 'var(--space-md)',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)',
                  fontSize: '0.78rem',
                }}>
                  <span>☁️ {report.sections.weather.condition}</span>
                  <span>🌡️ {report.sections.weather.temperature}°C</span>
                  <span>💧 {report.sections.weather.rainfall_mm}mm</span>
                  <span>💨 AQI {report.sections.weather.aqi}</span>
                  <span>💦 {report.sections.weather.humidity}% humidity</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static Reports List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {staticReports.map((rpt, i) => (
            <motion.div key={rpt.id} className="glass-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText size={22} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>{rpt.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{rpt.description}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span><Calendar size={12} /> {rpt.date}</span>
                  <span className={`badge ${typeBadge(rpt.type)}`}>{rpt.type}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-secondary"><Download size={14} /> PDF</button>
                <button className="btn btn-sm btn-primary">View</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
