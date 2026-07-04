import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { getAlerts, acknowledgeAlert, resolveAlert } from '../services/api';
import { Bell, CheckCircle, Eye, AlertTriangle, Shield } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await getAlerts();
      setAlerts(res.data);
    } catch {
      setAlerts([
        { id: '1', title: 'Flood Risk Alert — Ward 4 (Kurla)', message: 'Flood probability 72%. Heavy rainfall combined with low drainage capacity. 12,000 residents at risk.', severity: 'critical', target_ward: 'Ward 4 - Kurla', status: 'active', created_at: new Date().toISOString() },
        { id: '2', title: 'Flood Risk Alert — Ward 12 (Kandivali)', message: 'Flood probability 65%. Pump Station Delta under maintenance. Deploy backup pumps.', severity: 'critical', target_ward: 'Ward 12 - Kandivali', status: 'active', created_at: new Date().toISOString() },
        { id: '3', title: 'AQI Warning — Ward 8 (Chembur)', message: 'AQI predicted to reach 210. Issue health advisory for sensitive groups.', severity: 'warning', target_ward: 'Ward 8 - Chembur', status: 'acknowledged', created_at: new Date().toISOString() },
        { id: '4', title: 'Traffic Congestion — Ward 5 (Andheri)', message: 'Heavy congestion expected on Western Express Highway during evening rush.', severity: 'info', target_ward: 'Ward 5 - Andheri', status: 'active', created_at: new Date().toISOString() },
        { id: '5', title: 'Water Supply Disruption — Ward 3 (Dadar)', message: 'Maintenance work affecting water supply. Expected resolution: 6 hours.', severity: 'warning', target_ward: 'Ward 3 - Dadar', status: 'resolved', created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    try { await acknowledgeAlert(id); } catch {}
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
  };

  const handleResolve = async (id) => {
    try { await resolveAlert(id); } catch {}
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  };

  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);
  const activeCount = alerts.filter(a => a.status === 'active').length;

  return (
    <>
      <TopBar title="Alert Center" />
      <div className="page-content">
        {/* Stats */}
        <div className="metrics-grid" style={{ marginBottom: 'var(--space-lg)' }}>
          <div className="metric-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon cyan"><Bell size={20} /></div>
            <div className="metric-label">Total Alerts</div>
            <div className="metric-value">{alerts.length}</div>
          </div>
          <div className="metric-card" onClick={() => setFilter('active')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon red"><AlertTriangle size={20} /></div>
            <div className="metric-label">Active</div>
            <div className="metric-value" style={{ color: 'var(--danger)' }}>{activeCount}</div>
          </div>
          <div className="metric-card" onClick={() => setFilter('acknowledged')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon yellow"><Eye size={20} /></div>
            <div className="metric-label">Acknowledged</div>
            <div className="metric-value">{alerts.filter(a => a.status === 'acknowledged').length}</div>
          </div>
          <div className="metric-card" onClick={() => setFilter('resolved')} style={{ cursor: 'pointer' }}>
            <div className="metric-icon green"><CheckCircle size={20} /></div>
            <div className="metric-label">Resolved</div>
            <div className="metric-value">{alerts.filter(a => a.status === 'resolved').length}</div>
          </div>
        </div>

        {/* Alert List */}
        <div className="glass-card">
          <div className="glass-card-header">
            <span className="glass-card-title">
              {filter === 'all' ? 'All Alerts' : `${filter} Alerts`}
            </span>
          </div>
          {filtered.map((alert, i) => (
            <motion.div key={alert.id} className="alert-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: alert.status === 'active' && alert.severity === 'critical' ? 'rgba(239, 68, 68, 0.05)' : undefined }}>
              <div className={`alert-dot ${alert.severity}`} />
              <div className="alert-content" style={{ flex: 1 }}>
                <div className="alert-title">{alert.title}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  {alert.target_ward} • {new Date(alert.created_at).toLocaleString()} • <span className={`badge badge-${alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'info'}`}>{alert.severity}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {alert.status === 'active' && (
                  <button className="btn btn-sm btn-secondary" onClick={() => handleAcknowledge(alert.id)}>
                    <Eye size={14} /> Acknowledge
                  </button>
                )}
                {alert.status !== 'resolved' && (
                  <button className="btn btn-sm btn-primary" onClick={() => handleResolve(alert.id)}>
                    <CheckCircle size={14} /> Resolve
                  </button>
                )}
                {alert.status === 'resolved' && (
                  <span className="badge badge-success">✓ Resolved</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
