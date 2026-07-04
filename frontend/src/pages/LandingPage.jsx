import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Shield, FlaskConical, MessageSquare, BarChart3, Zap } from 'lucide-react';

const features = [
  { icon: '🧠', title: 'Decision Intelligence', desc: 'AI analyzes hundreds of data points to surface risks and recommend actions before disaster strikes.' },
  { icon: '💬', title: 'AI Assistant', desc: 'Ask questions in plain English. Get answers backed by real city data — weather, complaints, traffic.' },
  { icon: '🔮', title: 'What-If Simulator', desc: 'Change one variable — see cascading effects. Simulate floods, road closures, population surges.' },
  { icon: '🚨', title: 'Smart Alerts', desc: 'Automated alerts when AI detects high-risk patterns. No manual monitoring needed.' },
  { icon: '📊', title: 'Unified Dashboard', desc: 'One screen for everything — flood risk, AQI, traffic, complaints, predictions, all live.' },
  { icon: '⚡', title: 'Auto-Actions', desc: 'AI generates maintenance tickets, notifies departments, creates reports — zero manual work.' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <div className="landing-hero">
        {/* Floating particles background */}
        <div style={{
          position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
        }}>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                borderRadius: '50%',
                background: i % 2 === 0 ? 'var(--primary-400)' : 'var(--accent-400)',
                opacity: 0.2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
            fontSize: '0.8rem', color: 'var(--primary-300)', marginBottom: 24,
          }}>
            <Zap size={14} /> AI-Powered Decision Intelligence
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your City's
          <br />
          Intelligence Layer
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          One AI assistant instead of dozens of dashboards. Predict risks, simulate decisions,
          and act before disasters happen — powered by real-time city data and Gemini AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{ display: 'flex', gap: 16 }}
        >
          <button className="btn btn-accent btn-lg" onClick={() => navigate('/dashboard')}>
            Enter Command Center →
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/chat')}>
            <MessageSquare size={18} /> Talk to AI
          </button>
        </motion.div>

        {/* Architecture flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          style={{
            marginTop: 80, display: 'flex', alignItems: 'center', gap: 12,
            flexWrap: 'wrap', justifyContent: 'center',
            fontSize: '0.8rem', color: 'var(--text-muted)',
          }}
        >
          {['Data Sources', '→', 'Processing', '→', 'Knowledge Base', '→', 'AI Agents', '→', 'Decision Engine', '→', 'You'].map((t, i) => (
            <span key={i} style={{
              padding: t === '→' ? 0 : '4px 12px',
              background: t === '→' ? 'transparent' : 'var(--surface-card)',
              borderRadius: 'var(--radius-md)',
              border: t === '→' ? 'none' : '1px solid var(--glass-border)',
              color: t === 'You' ? 'var(--accent-400)' : undefined,
              fontWeight: t === 'You' ? 600 : undefined,
            }}>{t}</span>
          ))}
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        className="landing-features"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {features.map((feat, i) => (
          <motion.div key={i} className="feature-card" variants={item}>
            <div className="feature-icon">{feat.icon}</div>
            <h3 className="feature-title">{feat.title}</h3>
            <p className="feature-desc">{feat.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
