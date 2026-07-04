import { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { runSimulation, getSimulationPresets } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Play, RotateCcw, AlertTriangle, Droplets, Car, Heart, Users, Zap } from 'lucide-react';

export default function SimulationPage() {
  const [params, setParams] = useState({
    rainfall_mm: 50,
    temperature: 30,
    aqi_level: 100,
    road_closure: '',
    population_change_pct: 0,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    try {
      const res = await runSimulation(params);
      setResult(res.data);
    } catch (err) {
      // Mock result for demo
      const risk = Math.min(params.rainfall_mm / 2, 100);
      setResult({
        scenario_name: `Simulation — Rainfall ${params.rainfall_mm}mm`,
        risk_score: risk,
        affected_population: Math.round(risk * 200),
        flood_risk: { overall_probability: risk / 100, high_risk_wards: ['Ward 4 - Kurla', 'Ward 12 - Kandivali'], water_level_estimate_cm: params.rainfall_mm * 0.3 },
        traffic_impact: { congestion_increase_pct: risk * 0.5, avg_delay_minutes: risk * 0.2, reroute_needed: risk > 50 },
        health_impact: { hospitals_at_risk: Math.floor(risk / 25), ambulance_delay_minutes: risk * 0.15, population_needing_shelter: Math.round(risk * 50) },
        recommended_actions: [
          'Deploy emergency pumps to high-risk wards',
          'Open shelters in Ward 4 and Ward 12',
          'Alert all residents via emergency SMS',
          'Redirect traffic from low-lying areas',
          'Pre-position medical teams near hospitals',
        ],
        ward_level_risks: [
          { ward: 'Ward 4 - Kurla', flood_probability: Math.min(risk / 80, 1), affected_population: 12000 },
          { ward: 'Ward 12 - Kandivali', flood_probability: Math.min(risk / 90, 1), affected_population: 9500 },
          { ward: 'Ward 7 - Mulund', flood_probability: Math.min(risk / 120, 1), affected_population: 6200 },
          { ward: 'Ward 8 - Chembur', flood_probability: Math.min(risk / 130, 1), affected_population: 5800 },
          { ward: 'Ward 5 - Andheri', flood_probability: Math.min(risk / 150, 1), affected_population: 4100 },
          { ward: 'Ward 3 - Dadar', flood_probability: Math.min(risk / 180, 1), affected_population: 2500 },
        ],
        critical_warning: risk > 60 ? 'SEVERE: Multiple wards at critical flood risk. Immediate action required.' : null,
      });
    } finally {
      setLoading(false);
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

  return (
    <>
      <TopBar title="What-If Simulator" />
      <div className="page-content">
        <div className="sim-layout">
          {/* Controls */}
          <div className="sim-controls">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-lg)', color: 'var(--accent-400)' }}>
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

            <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-lg)' }}>
              <button className="btn btn-accent" onClick={handleRun} disabled={loading} style={{ flex: 1 }}>
                {loading ? <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : <Play size={16} />}
                {loading ? 'Simulating...' : 'Run Simulation'}
              </button>
              <button className="btn btn-secondary" onClick={handleReset}><RotateCcw size={16} /></button>
            </div>

            {/* Presets */}
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }}>Quick Presets</h4>
              {[
                { name: '🌊 Monsoon Extreme', p: { rainfall_mm: 300, temperature: 25, aqi_level: 80 } },
                { name: '🔥 Heatwave', p: { rainfall_mm: 0, temperature: 45, aqi_level: 400 } },
                { name: '🎉 Festival Surge', p: { rainfall_mm: 10, population_change_pct: 30 } },
              ].map((preset, i) => (
                <button key={i} className="btn btn-secondary btn-sm" onClick={() => setParams(p => ({ ...p, ...preset.p }))}
                  style={{ width: '100%', marginBottom: 6, justifyContent: 'flex-start' }}>
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="sim-results">
            {!result ? (
              <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="empty-state-icon">🔮</div>
                <div className="empty-state-title">Adjust Parameters & Run Simulation</div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Change the sliders on the left and click "Run Simulation" to see cascading effects across the city.
                </p>
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Critical Warning */}
                {result.critical_warning && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ marginBottom: 'var(--space-md)', background: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--danger)' }}>
                      <AlertTriangle size={20} />
                      <strong>{result.critical_warning}</strong>
                    </div>
                  </motion.div>
                )}

                {/* Impact Metrics */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon red"><AlertTriangle size={20} /></div>
                    <div className="metric-label">Risk Score</div>
                    <div className="metric-value" style={{ color: riskColor(result.risk_score) }}>
                      {Math.round(result.risk_score)}
                    </div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon blue"><Users size={20} /></div>
                    <div className="metric-label">People Affected</div>
                    <div className="metric-value">{(result.affected_population || 0).toLocaleString()}</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon yellow"><Car size={20} /></div>
                    <div className="metric-label">Traffic Delay</div>
                    <div className="metric-value">{Math.round(result.traffic_impact?.avg_delay_minutes || 0)}<span style={{ fontSize: '0.9rem' }}>min</span></div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-icon purple"><Heart size={20} /></div>
                    <div className="metric-label">Need Shelter</div>
                    <div className="metric-value">{(result.health_impact?.population_needing_shelter || 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Ward Risk Chart */}
                <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div className="glass-card-header">
                    <span className="glass-card-title">🌊 Ward-Level Flood Impact</span>
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
                        <div className="alert-title">{action}</div>
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
