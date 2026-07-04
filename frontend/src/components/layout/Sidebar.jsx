import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, MessageSquare, FlaskConical,
  FileText, BarChart3, Bell, Settings, ClipboardList,
  FileBarChart, Zap
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/map', label: 'City Map', icon: Map },
  { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
  { path: '/simulation', label: 'Simulator', icon: FlaskConical },
  { path: '/complaints', label: 'Complaints', icon: ClipboardList },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/reports', label: 'Reports', icon: FileBarChart },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏙️</div>
        <h2>CityTwin AI</h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon className="nav-icon" size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" style={{ cursor: 'default' }}>
          <Zap size={18} style={{ color: 'var(--accent-400)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Powered by Gemini AI
          </span>
        </div>
      </div>
    </aside>
  );
}
