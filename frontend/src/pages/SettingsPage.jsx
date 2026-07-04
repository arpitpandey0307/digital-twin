import { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { User, Bell, Database, Palette, Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    name: 'City Administrator',
    email: 'admin@citytwin.ai',
    role: 'admin',
    ward: 'All',
    notifications: { flood: true, aqi: true, traffic: true, complaints: true, emergency: true },
    dataRefresh: 15,
    theme: 'dark',
  });

  return (
    <>
      <TopBar title="Settings" />
      <div className="page-content">
        <div style={{ maxWidth: 700 }}>
          {/* Profile */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="glass-card-header">
              <span className="glass-card-title"><User size={16} /> Profile</span>
            </div>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={settings.name} onChange={(e) => setSettings(s => ({ ...s, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={settings.email} onChange={(e) => setSettings(s => ({ ...s, email: e.target.value }))} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-select" value={settings.role} onChange={(e) => setSettings(s => ({ ...s, role: e.target.value }))}>
                  <option value="admin">Administrator</option>
                  <option value="official">City Official</option>
                  <option value="citizen">Citizen</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ward Assignment</label>
                <select className="form-select" value={settings.ward} onChange={(e) => setSettings(s => ({ ...s, ward: e.target.value }))}>
                  <option value="All">All Wards</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={`Ward ${i + 1}`}>Ward {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="glass-card-header">
              <span className="glass-card-title"><Bell size={16} /> Notification Preferences</span>
            </div>
            {Object.entries(settings.notifications).map(([key, value]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--glass-border)' }}>
                <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{key} Alerts</span>
                <input type="checkbox" checked={value} onChange={(e) => setSettings(s => ({
                  ...s, notifications: { ...s.notifications, [key]: e.target.checked }
                }))} />
              </label>
            ))}
          </motion.div>

          {/* Data */}
          <motion.div className="glass-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 'var(--space-lg)' }}>
            <div className="glass-card-header">
              <span className="glass-card-title"><Database size={16} /> Data Settings</span>
            </div>
            <div className="form-group">
              <label className="form-label">Data Refresh Interval (minutes)</label>
              <input className="form-input" type="number" value={settings.dataRefresh}
                onChange={(e) => setSettings(s => ({ ...s, dataRefresh: +e.target.value }))} />
            </div>
          </motion.div>

          <button className="btn btn-accent btn-lg"><Save size={16} /> Save Settings</button>
        </div>
      </div>
    </>
  );
}
