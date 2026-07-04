import { Bell, Search, User } from 'lucide-react';

export default function TopBar({ title }) {
  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-actions">
        <button className="btn btn-secondary btn-sm">
          <Search size={16} />
        </button>
        <button className="btn btn-secondary btn-sm" style={{ position: 'relative' }}>
          <Bell size={16} />
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: 'var(--danger)', fontSize: '0.6rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700,
          }}>3</span>
        </button>
        <button className="btn btn-secondary btn-sm">
          <User size={16} />
          <span>Admin</span>
        </button>
      </div>
    </header>
  );
}
