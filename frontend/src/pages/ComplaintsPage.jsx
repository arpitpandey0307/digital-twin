import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { getComplaints, createComplaint } from '../services/api';
import { Plus, Send, Eye, Filter } from 'lucide-react';

const CATEGORIES = ['flooding', 'garbage', 'pothole', 'streetlight', 'noise', 'parking', 'road_damage', 'water_supply', 'sewage', 'other'];
const WARDS = Array.from({ length: 12 }, (_, i) => `Ward ${i + 1}`);

const severityBadge = (s) => {
  const map = { low: 'badge-info', medium: 'badge-warning', high: 'badge-danger', critical: 'badge-danger' };
  return map[s] || 'badge-neutral';
};

const statusBadge = (s) => {
  const map = { submitted: 'badge-info', processing: 'badge-warning', assigned: 'badge-warning', in_progress: 'badge-info', resolved: 'badge-success' };
  return map[s] || 'badge-neutral';
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ description: '', ward: '', latitude: 19.076, longitude: 72.877 });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await getComplaints();
      setComplaints(res.data);
    } catch {
      setComplaints([
        { id: '1', category: 'flooding', description: 'Water logging near Kurla station', ward: 'Ward 4 - Kurla', severity: 'high', status: 'assigned', ai_confidence: 0.94, created_at: new Date().toISOString(), assigned_department: 'Flood Control' },
        { id: '2', category: 'pothole', description: 'Large pothole on SV Road causing accidents', ward: 'Ward 5 - Andheri', severity: 'high', status: 'processing', ai_confidence: 0.91, created_at: new Date().toISOString(), assigned_department: 'Municipality' },
        { id: '3', category: 'garbage', description: 'Garbage piled up near residential area', ward: 'Ward 9 - Bandra', severity: 'medium', status: 'submitted', ai_confidence: 0.88, created_at: new Date().toISOString(), assigned_department: 'Sanitation' },
        { id: '4', category: 'streetlight', description: 'Street lights not working in lane', ward: 'Ward 3 - Dadar', severity: 'low', status: 'resolved', ai_confidence: 0.96, created_at: new Date().toISOString(), assigned_department: 'Electricity Board' },
        { id: '5', category: 'noise', description: 'Construction noise after 10 PM', ward: 'Ward 11 - Malad', severity: 'medium', status: 'submitted', ai_confidence: 0.85, created_at: new Date().toISOString(), assigned_department: 'Municipality' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createComplaint(form);
      setShowForm(false);
      setForm({ description: '', ward: '', latitude: 19.076, longitude: 72.877 });
      fetchComplaints();
    } catch {
      alert('Complaint submitted (demo mode)');
      setShowForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <TopBar title="Complaints Management" />
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Citizen Complaints</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI-analyzed complaints with auto-classification</p>
          </div>
          <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} /> New Complaint
          </button>
        </div>

        {/* Complaint Form */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Submit New Complaint</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-textarea" value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the issue... (AI will auto-classify category, severity, and department)"
                  required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Ward (optional)</label>
                  <select className="form-select" value={form.ward} onChange={(e) => setForm(f => ({ ...f, ward: e.target.value }))}>
                    <option value="">AI will detect</option>
                    {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">📎 Upload Image (Vision AI)</label>
                  <input className="form-input" type="file" accept="image/*" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-accent" type="submit" disabled={submitting}>
                  {submitting ? 'Analyzing...' : <><Send size={16} /> Submit & Analyze</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Complaints Table */}
        <div className="glass-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
                <th>Ward</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Department</th>
                <th>AI Conf.</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <td>
                    <span className="badge badge-info">{c.category}</span>
                  </td>
                  <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.ward || '—'}</td>
                  <td><span className={`badge ${severityBadge(c.severity)}`}>{c.severity}</span></td>
                  <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.assigned_department || '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-400)' }}>
                    {c.ai_confidence ? `${Math.round(c.ai_confidence * 100)}%` : '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
