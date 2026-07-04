import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import { sendChatMessage } from '../services/api';

const SUGGESTIONS = [
  "What are the biggest risks tomorrow?",
  "Which ward needs the most attention?",
  "What should we do if rainfall doubles?",
  "Why is pollution increasing?",
  "Show me flood risk analysis",
  "Compare traffic across all wards",
  "What is the current city health score?",
  "Generate emergency action plan for Ward 4",
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: "Hello! I'm your City Intelligence AI. I have access to real-time weather, AQI, traffic, complaint, and prediction data for all 12 wards. Ask me anything about the city's current state, risks, or what actions to take.",
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
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: "I'm currently connecting to the city data system. Please ensure the backend server is running on port 8000. In the meantime, here's a general assessment: Based on typical monsoon patterns, Wards 4, 7, and 12 have historically higher flood risks due to drainage capacity constraints. I recommend monitoring weather forecasts closely and pre-positioning emergency resources.",
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
      <TopBar title="AI Assistant" />
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
                      {msg.role === 'ai' ? 'CityTwin AI' : 'You'}
                    </span>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="message-bubble ai"
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Sparkles size={16} style={{ color: 'var(--accent-400)' }} />
                  <span style={{ color: 'var(--text-muted)' }}>Analyzing city data...</span>
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
                placeholder="Ask about city risks, complaints, weather, predictions..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
              />
              <button
                className="btn btn-accent"
                onClick={() => handleSend()}
                disabled={isTyping || !input.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
