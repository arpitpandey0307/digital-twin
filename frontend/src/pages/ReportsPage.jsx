import { motion } from 'framer-motion';
import TopBar from '../components/layout/TopBar';
import { FileText, Download, Calendar, Building2 } from 'lucide-react';

const reports = [
  { id: 1, title: 'Daily City Briefing — July 4, 2026', type: 'Daily', date: '2026-07-04', status: 'Ready', description: 'AI-generated summary of city status, top 3 risks, actions taken, and tomorrow predictions.' },
  { id: 2, title: 'Ward 4 (Kurla) — Flood Risk Assessment', type: 'Ward', date: '2026-07-04', status: 'Ready', description: 'Detailed flood risk analysis for Ward 4 including drainage capacity, historical data, and ML predictions.' },
  { id: 3, title: 'Monthly Complaint Analysis — June 2026', type: 'Monthly', date: '2026-06-30', status: 'Ready', description: 'Trend analysis, department performance, resolution rates, and citizen satisfaction metrics.' },
  { id: 4, title: 'Infrastructure Health Report', type: 'Infrastructure', date: '2026-07-03', status: 'Ready', description: 'Status of all hospitals, shelters, pump stations, fire stations across all 12 wards.' },
  { id: 5, title: 'Simulation Results — Monsoon Worst Case', type: 'Simulation', date: '2026-07-04', status: 'Ready', description: 'What-if analysis for 300mm rainfall scenario with cascading impact assessment.' },
];

const typeBadge = (t) => {
  const map = { Daily: 'badge-info', Ward: 'badge-warning', Monthly: 'badge-success', Infrastructure: 'badge-neutral', Simulation: 'badge-danger' };
  return map[t] || 'badge-neutral';
};

export default function ReportsPage() {
  return (
    <>
      <TopBar title="Reports" />
      <div className="page-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Auto-Generated Reports</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI creates reports automatically — no manual work needed</p>
          </div>
          <button className="btn btn-accent"><FileText size={16} /> Generate New Report</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {reports.map((report, i) => (
            <motion.div key={report.id} className="glass-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <FileText size={22} color="white" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>{report.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{report.description}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span><Calendar size={12} /> {report.date}</span>
                  <span className={`badge ${typeBadge(report.type)}`}>{report.type}</span>
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
