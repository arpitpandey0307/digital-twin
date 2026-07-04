import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Zap, DollarSign, Shield, Droplets, Users as UsersIcon, Home, Siren } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { sendChatMessage } from '../services/api';

const SUGGESTIONS = [
  "What should I do to prepare for tomorrow?",
  "Which ward needs the most attention?",
  "Deploy resources — where are the biggest risks?",
  "Generate emergency action plan for a flood scenario",
  "What is the optimal resource allocation right now?",
  "Show me the cost-benefit of deploying pumps",
  "Why is flood risk high in Ward 4?",
  "Compare all wards and prioritize response",
];

const resourceIcon = (type) => {
  if (type === 'pump_station') return <Droplets size={14} />;
  if (type === 'ambulance') return <Siren size={14} />;
  if (type === 'shelter') return <Home size={14} />;
  if (type === 'volunteer') return <UsersIcon size={14} />;
  return <Zap size={14} />;
};

const priorityColor = (p) => {
  if (p === 'urgent' || p === 'immediate') return 'var(--danger)';
  if (p === 'high') return 'var(--warning)';
  return 'var(--info)';
};

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "I'm your AI Chief Officer — not just a chatbot. I have access to real-time weather, AQI, traffic, complaint, and prediction data for all 12 wards. Ask me actionable questions like \"What should I deploy tomorrow?\" or \"Generate an emergency plan\" and I'll provide structured action plans with resource allocation and cost analysis.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text = input) => {
    if (!text.trim()) return;

    const userMsg = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await sendChatMessage(text.trim());
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: res.data.answer,
          context: res.data.context_used,
          suggestions: res.data.suggestions,
          action_plan: res.data.action_plan,
        },
      ]);
    } catch (err) {
      // Mock AI Chief Officer response
      const isActionQuery = ['should', 'deploy', 'plan', 'action', 'recommend', 'tomorrow', 'allocate', 'optimize'].some(kw => text.toLowerCase().includes(kw));

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: isActionQuery
            ? "Based on current data analysis, here's my recommended action plan. Ward 4 (Kurla) and Ward 12 (Kandivali) are highest priority due to elevated flood risk (82% and 71% respectively). I recommend immediate pump deployment and shelter activation. The projected ROI for these actions is 6.4x — every ₹1 spent prevents ₹6.40 in damage."
            : "Based on the current city data, Ward 4 (Kurla) has the highest flood risk at 82% due to heavy rainfall (45mm), low drainage capacity (38%), and 12 active flooding complaints. The AQI is at 127 (moderate). I recommend focusing resources on Ward 4 and Ward 12 (Kandivali, 71% flood risk). Would you like me to generate a detailed action plan?",
          action_plan: isActionQuery ? {
            action_items: [
              { action: 'Deploy 2 pump stations to Ward 4 — Kurla', department: 'Flood Control', urgency: 'immediate', confidence: 0.91, estimated_cost: 170000, estimated_savings: 1820000 },
              { action: 'Activate Shelter Alpha in Ward 4', department: 'Disaster Management', urgency: 'immediate', confidence: 0.87, estimated_cost: 85000, estimated_savings: 950000 },
              { action: 'Deploy traffic police to Ward 12 junctions', department: 'Traffic Police', urgency: 'next_2_hours', confidence: 0.82, estimated_cost: 35000, estimated_savings: 220000 },
              { action: 'Issue health advisory for Ward 8', department: 'Health Dept', urgency: 'next_2_hours', confidence: 0.75, estimated_cost: 8000, estimated_savings: 350000 },
            ],
            resource_allocations: [
              { resource: 'Pump Station Alpha', type: 'pump_station', assigned_to: 'Ward 4 - Kurla', reason: 'Flood risk 82%', priority: 'urgent', status: 'recommended' },
              { resource: 'Pump Station Beta', type: 'pump_station', assigned_to: 'Ward 12 - Kandivali', reason: 'Flood risk 71%', priority: 'urgent', status: 'recommended' },
              { resource: 'Ambulance Unit 3', type: 'ambulance', assigned_to: 'Ward 4 - Kurla', reason: 'Pre-position for emergency', priority: 'high', status: 'recommended' },
              { resource: 'Shelter Alpha', type: 'shelter', assigned_to: 'Ward 4 - Kurla', reason: 'Capacity: 500 — activate for evacuation', priority: 'urgent', status: 'recommended' },
              { resource: 'Volunteer Team A', type: 'volunteer', assigned_to: 'Ward 4 - Kurla', reason: 'Door-to-door alerts', priority: 'medium', status: 'recommended' },
              { resource: 'Volunteer Team B', type: 'volunteer', assigned_to: 'Ward 12 - Kandivali', reason: 'Door-to-door alerts', priority: 'medium', status: 'recommended' },
            ],
            total_cost: 298000,
            total_savings: 3340000,
            roi: 11.2,
            overall_confidence: 0.84,
          } : null,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <TopBar title="AI Chief Officer" />
      <div className="page-content">
        <div className="chat-container">
          <div className="chat-panel">
            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`message-bubble ${msg.role}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {msg.role === 'ai' ? (
                      <Bot size={16} style={{ color: 'var(--accent-400)' }} />
                    ) : (
                      <User size={16} />
                    )}
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 }}>
                      {msg.role === 'ai' ? 'AI Chief Officer' : 'You'}
                    </span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                  {/* Action Plan */}
                  {msg.action_plan && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      style={{ marginTop: 16 }}
                    >
                      {/* ROI Summary */}
                      <div style={{
                        display: 'flex', gap: 8, marginBottom: 12,
                        padding: 10, background: 'rgba(34,197,94,0.06)',
                        borderRadius: 'var(--radius-md)', border: '1px solid rgba(34,197,94,0.12)',
                      }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Cost</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
                            ₹{(msg.action_plan.total_cost / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Damage Prevented</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--success)' }}>
                            ₹{(msg.action_plan.total_savings / 100000).toFixed(1)}L
                          </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ROI</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-400)' }}>
                            {msg.action_plan.roi}x
                          </div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</div>
                          <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-400)' }}>
                            {Math.round((msg.action_plan.overall_confidence || 0.84) * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Action Items */}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                        📋 Action Plan
                      </div>
                      {(msg.action_plan.action_items || []).map((item, j) => (
                        <div key={j} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 10px', marginBottom: 4,
                          background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${priorityColor(item.urgency)}15`,
                        }}>
                          <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: priorityColor(item.urgency),
                            boxShadow: `0 0 6px ${priorityColor(item.urgency)}`,
                            flexShrink: 0,
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 500 }}>{item.action}</div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', display: 'flex', gap: 8 }}>
                              <span>{item.department}</span>
                              <span>•</span>
                              <span style={{ color: priorityColor(item.urgency) }}>{item.urgency === 'immediate' ? '⚡ Immediate' : '⏳ Next 2h'}</span>
                              <span>•</span>
                              <span>{Math.round(item.confidence * 100)}% conf</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--warning)' }}>
                              ₹{(item.estimated_cost / 1000).toFixed(0)}K
                            </div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--success)' }}>
                              saves ₹{(item.estimated_savings / 100000).toFixed(1)}L
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Resource Allocation */}
                      {msg.action_plan.resource_allocations && msg.action_plan.resource_allocations.length > 0 && (
                        <>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 12, marginBottom: 6 }}>
                            🎯 Resource Allocation
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                            {msg.action_plan.resource_allocations.map((res, j) => (
                              <div key={j} style={{
                                padding: '6px 8px', borderRadius: 'var(--radius-sm)',
                                background: 'rgba(255,255,255,0.02)',
                                border: `1px solid ${priorityColor(res.priority)}15`,
                                fontSize: '0.72rem',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                                  {resourceIcon(res.type)}
                                  <span style={{ fontWeight: 600, fontSize: '0.7rem' }}>{res.resource}</span>
                                </div>
                                <div style={{ color: 'var(--accent-400)', fontSize: '0.65rem' }}>→ {res.assigned_to}</div>
                                <div style={{ color: 'var(--text-dim)', fontSize: '0.6rem' }}>{res.reason}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  {msg.context && msg.context.length > 0 && (
                    <div style={{
                      marginTop: 12, paddingTop: 8,
                      borderTop: '1px solid var(--glass-border)',
                      fontSize: '0.75rem', color: 'var(--text-muted)',
                    }}>
                      📊 Sources: {msg.context.join(', ')}
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="message-bubble ai"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} style={{ color: 'var(--accent-400)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Analyzing city data & generating action plan...</span>
                  <div className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="chat-suggestions">
              {SUGGESTIONS.slice(0, 4).map((s, i) => (
                <button key={i} className="suggestion-chip" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="chat-input-bar">
              <input
                className="chat-input"
                placeholder='Ask the AI Chief Officer — "What should I deploy tomorrow?"'
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />
              <button className="btn btn-accent" onClick={() => handleSend()} disabled={isTyping || !input.trim()}>
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
