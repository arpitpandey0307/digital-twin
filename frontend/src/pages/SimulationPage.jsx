import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { runSimulation, runCrisisMode } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Play, RotateCcw, AlertTriangle, Droplets, Car, Heart, Users, Zap, ChevronDown, Shield, Building, IndianRupee, Construction, Siren } from 'lucide-react';

const CRISIS_PRESETS = [
  { id: 'cyclone_cat5', name: 'Cyclone — Category 5', icon: '🌀', description: 'Catastrophic cyclone, 250+ km/h winds', color: '#ef4444' },
  { id: 'monsoon_extreme', name: 'Monsoon — Worst Case', icon: '🌊', description: '300mm rainfall, widespread flooding', color: '#3b82f6' },
  { id: 'heatwave', name: 'Heatwave + Pollution', icon: '🔥', description: 'Extreme heat (48°C) + severe AQI', color: '#f59e0b' },
  { id: 'earthquake', name: 'Earthquake — 6.5 Richter', icon: '🏚️', description: 'Infrastructure damage & road failures', color: '#8b5cf6' },
  { id: 'pandemic_surge', name: 'Pandemic — Hospital Surge', icon: '🦠', description: 'Healthcare system overwhelmed', color: '#22c55e' },
];

const stageIcons = {
  'cloud-rain': '🌧️', 'droplets': '💧', 'construction': '🚧', 'car': '🚗',
  'siren': '🚑', 'hospital': '🏥', 'indian-rupee': '💰', 'users': '👥',
};

const statusColor = (status) => {
  if (status === 'critical') return '#ef4444';
  if (status === 'warning') return '#f59e0b';
  return '#22c55e';
};

export default function SimulationPage() {
  const [params, setParams] = useState({
    rainfall_mm: 50, temperature: 30, aqi_level: 100,
    road_closure: '', population_change_pct: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [crisisLoading, setCrisisLoading] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await runSimulation(params);
      setResult(res.data);
    } catch (err) {
      // Generate mock cascading chain
      const risk = Math.min(params.rainfall_mm / 2, 100);
      const flood = Math.min(1, params.rainfall_mm / 200);
      const roads = Math.min(10, Math.floor(flood * 12));
      const congestion = Math.min(100, Math.floor(roads * 6.5 + flood * 20));
      const ambDelay = Math.round(congestion * 0.24 + flood * 12);
      const hospRisk = Math.min(8, Math.floor(flood * 5));
      const econLoss = Math.round(flood * 45 + congestion * 0.8 + hospRisk * 5);
      const satisfaction = Math.max(10, 85 - Math.floor(flood * 25 + congestion * 0.15));

      setResult({
        scenario_name: `Simulation — Rainfall ${params.rainfall_mm}mm`,
        risk_score: risk,
        affected_population: Math.round(risk * 200),
        cascade_chain: [
          { stage: 1, name: 'Weather Event', icon: 'cloud-rain', severity: flood, severity_label: flood > 0.7 ? 'Extreme' : flood > 0.4 ? 'Heavy' : 'Moderate',
            description: `${params.rainfall_mm}mm rainfall with ${params.temperature}°C`,
            metrics: [{ label: 'Rainfall', value: `${params.rainfall_mm}mm`, status: params.rainfall_mm > 150 ? 'critical' : params.rainfall_mm > 50 ? 'warning' : 'ok' },
                      { label: 'Temperature', value: `${params.temperature}°C`, status: params.temperature > 42 ? 'critical' : 'ok' },
                      { label: 'AQI', value: `${params.aqi_level}`, status: params.aqi_level > 300 ? 'critical' : params.aqi_level > 150 ? 'warning' : 'ok' }] },
          { stage: 2, name: 'Flooding', icon: 'droplets', severity: flood, severity_label: flood > 0.7 ? 'Critical' : flood > 0.4 ? 'High' : 'Moderate',
            description: `${Math.floor(flood * 8)} wards at risk, water level ${Math.round(params.rainfall_mm * 0.35)}cm`,
            metrics: [{ label: 'Flood Prob', value: `${Math.round(flood * 100)}%`, status: flood > 0.7 ? 'critical' : flood > 0.4 ? 'warning' : 'ok' },
                      { label: 'Water Level', value: `${Math.round(params.rainfall_mm * 0.35)}cm`, status: params.rainfall_mm > 100 ? 'critical' : 'ok' }] },
          { stage: 3, name: 'Road Closures', icon: 'construction', severity: roads / 10, severity_label: `${roads} roads`,
            description: `${roads} roads impassable${params.road_closure ? `, including ${params.road_closure}` : ''}`,
            metrics: [{ label: 'Roads Closed', value: `${roads}`, status: roads > 6 ? 'critical' : roads > 3 ? 'warning' : 'ok' }] },
          { stage: 4, name: 'Traffic Congestion', icon: 'car', severity: congestion / 100, severity_label: congestion > 70 ? 'Gridlock' : congestion > 40 ? 'Heavy' : 'Moderate',
            description: `+${congestion}% congestion, avg delay ${Math.round(congestion * 0.4)} min`,
            metrics: [{ label: 'Congestion', value: `+${congestion}%`, status: congestion > 60 ? 'critical' : congestion > 30 ? 'warning' : 'ok' },
                      { label: 'Avg Delay', value: `${Math.round(congestion * 0.4)} min`, status: congestion > 60 ? 'critical' : 'ok' }] },
          { stage: 5, name: 'Ambulance Delays', icon: 'siren', severity: Math.min(1, ambDelay / 25), severity_label: ambDelay > 15 ? 'Critical' : `+${ambDelay} min`,
            description: `+${ambDelay} min avg ambulance response time`,
            metrics: [{ label: 'Extra Delay', value: `+${ambDelay} min`, status: ambDelay > 15 ? 'critical' : ambDelay > 8 ? 'warning' : 'ok' },
                      { label: 'Lives at Risk', value: `${ambDelay * 3}`, status: ambDelay > 15 ? 'critical' : 'ok' }] },
          { stage: 6, name: 'Hospital Overload', icon: 'hospital', severity: hospRisk / 8, severity_label: hospRisk > 4 ? 'Critical' : 'Stressed',
            description: `${hospRisk}/8 hospitals facing access issues`,
            metrics: [{ label: 'Hospitals at Risk', value: `${hospRisk}/8`, status: hospRisk > 4 ? 'critical' : hospRisk > 2 ? 'warning' : 'ok' }] },
          { stage: 7, name: 'Economic Loss', icon: 'indian-rupee', severity: Math.min(1, econLoss / 80), severity_label: `₹${econLoss} Cr`,
            description: `Estimated ₹${econLoss} Cr loss, ${Math.round(risk * 200).toLocaleString()} affected`,
            metrics: [{ label: 'Loss', value: `₹${econLoss} Cr`, status: econLoss > 50 ? 'critical' : econLoss > 20 ? 'warning' : 'ok' }] },
          { stage: 8, name: 'Citizen Satisfaction', icon: 'users', severity: 1 - satisfaction / 100, severity_label: `${satisfaction}/100`,
            description: `Projected satisfaction: ${satisfaction}/100`,
            metrics: [{ label: 'Score', value: `${satisfaction}/100`, status: satisfaction < 40 ? 'critical' : satisfaction < 60 ? 'warning' : 'ok' }] },
        ],
        ward_level_risks: [
          { ward: 'Ward 4 - Kurla', flood_probability: Math.min(risk / 80, 1), affected_population: 12000 },
          { ward: 'Ward 12 - Kandivali', flood_probability: Math.min(risk / 90, 1), affected_population: 9500 },
          { ward: 'Ward 7 - Mulund', flood_probability: Math.min(risk / 120, 1), affected_population: 6200 },
          { ward: 'Ward 8 - Chembur', flood_probability: Math.min(risk / 130, 1), affected_population: 5800 },
          { ward: 'Ward 5 - Andheri', flood_probability: Math.min(risk / 150, 1), affected_population: 4100 },
          { ward: 'Ward 3 - Dadar', flood_probability: Math.min(risk / 180, 1), affected_population: 2500 },
        ],
        recommended_actions: [
          'Deploy emergency pumps to high-risk wards',
          'Open shelters in Ward 4 and Ward 12',
          'Alert all residents via emergency SMS',
          'Redirect traffic from low-lying areas',
          'Pre-position medical teams near hospitals',
        ],
        critical_warning: risk > 60 ? 'SEVERE: Multiple wards at critical flood risk. Immediate action required.' : null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCrisis = async (crisisId) => {
    setCrisisLoading(crisisId);
    try {
      const res = await runCrisisMode(crisisId);
      setResult(res.data);
    } catch (err) {
      const preset = CRISIS_PRESETS.find(p => p.id === crisisId);
      // Simulate with extreme params
      const extremeParams = { rainfall_mm: 300, temperature: 25, aqi_level: 100, road_closure: '', population_change_pct: 0 };
      setParams(extremeParams);
      handleRun();
    } finally {
      setCrisisLoading(null);
    }
  };

  const handleReset = () => {
    setParams({ rainfall_mm: 50, temperature: 30, aqi_level: 100, road_closure: '', population_change_pct: 0 });
    setResult(null);
  };

  const riskColor = (score) => score >= 70 ? 'var(--danger)' : score >= 40 ? 'var(--warning)' : 'var(--success)';

  const wardChartData = result?.ward_level_risks?.map(w => ({
    ward: w.ward.replace('Ward ', 'W').split(' - ')[0],
    risk: Math.round((w.flood_probability || 0) * 100),
    population: w.affected_population,
  })) || [];

  const cascadeChain = result?.cascade_chain || [];

  return (
    <>
      <TopBar title="Digital Twin Simulator" />
      <div className="page-content">
        <div className="sim-layout">
          {/* Controls */}
          <div className="sim-controls">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--accent-400)' }}>
              🔮 Scenario Parameters
            </h3>

            <div className="sim-slider-group">
              <div className="sim-slider-label">
                <span><Droplets size={14} /> Rainfall</span>
                <span className="sim-slider-value">{params.rainfall_mm} mm</span>
              </div>
              <input type="range" min="0" max="500" value={params.rainfall_mm}
                onChange={(e) => setParams(p => ({ ...p, rainfall_mm: +e.target.value }))} />
            </div>

            <div className="sim-slider-group">
              <div className="sim-slider-label">
                <span>🌡️ Temperature</span>
                <span className="sim-slider-value">{params.temperature}°C</span>
              </div>
              <input type="range" min="-10" max="50" value={params.temperature}
                onChange={(e) => setParams(p => ({ ...p, temperature: +e.target.value }))} />
            </div>

            <div className="sim-slider-group">
              <div className="sim-slider-label">
                <span>💨 AQI Level</span>
                <span className="sim-slider-value">{params.aqi_level}</span>
              </div>
              <input type="range" min="0" max="500" value={params.aqi_level}
                onChange={(e) => setParams(p => ({ ...p, aqi_level: +e.target.value }))} />
            </div>

            <div className="sim-slider-group">
              <div className="sim-slider-label">
                <span><Users size={14} /> Population Change</span>
                <span className="sim-slider-value">{params.population_change_pct > 0 ? '+' : ''}{params.population_change_pct}%</span>
              </div>
              <input type="range" min="-50" max="50" value={params.population_change_pct}
                onChange={(e) => setParams(p => ({ ...p, population_change_pct: +e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">🚧 Road Closure</label>
              <select className="form-select" value={params.road_closure}
                onChange={(e) => setParams(p => ({ ...p, road_closure: e.target.value }))}>
                <option value="">None</option>
                <option value="Western Express Highway">Western Express Highway</option>
                <option value="Eastern Express Highway">Eastern Express Highway</option>
                <option value="LBS Marg">LBS Marg</option>
                <option value="SV Road">SV Road</option>
                <option value="Bandra Worli Sea Link">Bandra Worli Sea Link</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-md)' }}>
              <button className="btn btn-accent" onClick={handleRun} disabled={loading} style={{ flex: 1 }}>
                {loading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Play size={16} />}
                {loading ? 'Simulating...' : 'Run Simulation'}
              </button>
              <button className="btn btn-secondary" onClick={handleReset}><RotateCcw size={16} /></button>
            </div>

            {/* Crisis Mode */}
            <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--glass-border)' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <Zap size={12} /> Live Crisis Mode
              </h4>
              {CRISIS_PRESETS.map((crisis) => (
                <button key={crisis.id} className="btn btn-secondary btn-sm crisis-btn"
                  onClick={() => handleCrisis(crisis.id)}
                  disabled={crisisLoading === crisis.id}
                  style={{ width: '100%', marginBottom: 6, justifyContent: 'flex-start', borderColor: `${crisis.color}30` }}>
                  {crisisLoading === crisis.id ? (
                    <div className="loading-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                  ) : (
                    <span>{crisis.icon}</span>
                  )}
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.78rem' }}>{crisis.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{crisis.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="sim-results">
            {!result ? (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-state-icon">🔮</div>
                <div className="empty-state-title">Digital Twin Simulator</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 400, textAlign: 'center' }}>
                  Adjust parameters or trigger a Crisis Mode to see the 8-stage cascading chain — how one event ripples through the entire city.
                </p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Critical Warning */}
                {result.critical_warning && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ marginBottom: 'var(--space-md)', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--danger)' }}>
                      <AlertTriangle size={20} />
                      <strong>{result.critical_warning}</strong>
                    </div>
                  </motion.div>
                )}

                {/* Overall Risk */}
                <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
                  <div className="metric-card" style={{ flex: 1, textAlign: 'center' }}>
                    <div className="metric-label">Overall Risk</div>
                    <div className="metric-value" style={{ color: riskColor(result.risk_score), fontSize: '2.2rem' }}>
                      {Math.round(result.risk_score)}
                    </div>
                    <div className="metric-trend neutral">out of 100</div>
                  </div>
                  <div className="metric-card" style={{ flex: 1, textAlign: 'center' }}>
                    <div className="metric-label">People Affected</div>
                    <div className="metric-value" style={{ fontSize: '2.2rem' }}>
                      {(result.affected_population || 0).toLocaleString()}
                    </div>
                    <div className="metric-trend neutral">across all wards</div>
                  </div>
                </div>

                {/* 8-Stage Cascading Chain */}
                {cascadeChain.length > 0 && (
                  <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
                    <div className="glass-card-header">
                      <span className="glass-card-title">⛓️ 8-Stage Cascading Chain</span>
                      <span className="badge badge-danger">Digital Twin</span>
                    </div>
                    <div className="cascade-chain">
                      {cascadeChain.map((stage, i) => {
                        const sevPct = Math.round(stage.severity * 100);
                        const sevColor = sevPct > 60 ? '#ef4444' : sevPct > 30 ? '#f59e0b' : '#22c55e';
                        return (
                          <motion.div key={stage.stage}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="cascade-stage">
                            {/* Connector */}
                            {i > 0 && (
                              <div className="cascade-connector">
                                <ChevronDown size={16} style={{ color: 'var(--text-dim)' }} />
                              </div>
                            )}
                            <div className="cascade-card" style={{ borderLeftColor: sevColor }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <span style={{ fontSize: '1.3rem' }}>{stageIcons[stage.icon] || '📊'}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{stage.name}</div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stage.description}</div>
                                </div>
                                <div style={{
                                  padding: '2px 10px', borderRadius: 'var(--radius-full)',
                                  background: `${sevColor}15`, color: sevColor,
                                  fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                                }}>
                                  {stage.severity_label}
                                </div>
                              </div>
                              {/* Severity bar */}
                              <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${sevPct}%` }}
                                  transition={{ duration: 0.6, delay: i * 0.1 }}
                                  style={{ height: '100%', background: sevColor, borderRadius: 2 }}
                                />
                              </div>
                              {/* Metrics */}
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {(stage.metrics || []).map((m, j) => (
                                  <div key={j} style={{
                                    padding: '3px 8px', borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${statusColor(m.status)}20`,
                                    fontSize: '0.7rem',
                                  }}>
                                    <span style={{ color: 'var(--text-muted)' }}>{m.label}: </span>
                                    <span style={{ color: statusColor(m.status), fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{m.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ward Risk Chart */}
                <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div className="glass-card-header">
                    <span className="glass-card-title">🌊 Ward-Level Impact</span>
                  </div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={wardChartData}>
                        <XAxis dataKey="ward" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ background: '#1e1b4b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                          formatter={(v, name) => [name === 'risk' ? `${v}%` : v.toLocaleString(), name === 'risk' ? 'Flood Risk' : 'Affected Pop.']}
                        />
                        <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
                          {wardChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.risk > 60 ? '#ef4444' : entry.risk > 30 ? '#f59e0b' : '#22c55e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="glass-card">
                  <div className="glass-card-header">
                    <span className="glass-card-title">⚡ AI Recommended Actions</span>
                  </div>
                  {(result.recommended_actions || []).map((action, i) => (
                    <div key={i} className="alert-item">
                      <div className="alert-dot warning" />
                      <div className="alert-content">
                        <div className="alert-title">{typeof action === 'string' ? action : action.action || action}</div>
                      </div>
                      <button className="btn btn-sm btn-primary">Execute</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
