import { useState, useRef, useEffect } from "react";

const glass = {
  background: "rgba(15,15,35,0.85)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default function Chatbot({ transcript }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: transcript ? "Hi! I've read the transcript. Ask me anything about the meeting." : "Hi! I'm your meeting assistant. Process a meeting first and I'll answer questions about it." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Reset greeting when transcript changes
  useEffect(() => {
    setMessages([{ role: "ai", text: transcript ? "Hi! I've read the transcript. Ask me anything about the meeting." : "Hi! I'm your meeting assistant. Process a meeting first and I'll answer questions about it." }]);
  }, [transcript]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, transcript: transcript || "" })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.reply || "Sorry, I couldn't get a response." }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "Connection error. Make sure the backend is running." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "fixed", bottom: "28px", right: "28px", zIndex: 200,
          width: "56px", height: "56px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)",
          background: open ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
          boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
          cursor: "pointer", fontSize: "22px",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
        title="Chat with AI"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: "96px", right: "28px", zIndex: 200,
          width: "360px", height: "480px", borderRadius: "20px",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.2)",
          ...glass,
          animation: "slideUp 0.2s ease"
        }}>
          {/* Header */}
          <div style={{
            padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex", alignItems: "center", gap: "12px",
            background: "rgba(99,102,241,0.1)"
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "18px", boxShadow: "0 4px 12px rgba(99,102,241,0.4)"
            }}>⚡</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px", color: "#ffffff" }}>Meeting Assistant</div>
              <div style={{ fontSize: "11px", color: transcript ? "#a5b4fc" : "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: transcript ? "#818cf8" : "rgba(255,255,255,0.2)", boxShadow: transcript ? "0 0 6px #818cf8" : "none" }} />
                {transcript ? "Transcript loaded" : "No transcript yet"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  fontSize: "13px", lineHeight: 1.6,
                  background: msg.role === "user" ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.06)",
                  border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
                  color: msg.role === "user" ? "#ffffff" : "rgba(255,255,255,0.8)",
                  boxShadow: msg.role === "user" ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ padding: "10px 16px", borderRadius: "16px 16px 16px 4px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: "5px", alignItems: "center" }}>
                  {[0, 1, 2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", animation: "pulse 1.2s infinite", animationDelay: `${i * 0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "8px" }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask about the meeting..."
              style={{
                flex: 1, padding: "10px 14px", borderRadius: "12px",
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#ffffff", fontSize: "13px", outline: "none",
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: "40px", height: "40px", borderRadius: "12px", border: "none",
                background: input.trim() && !loading ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.06)",
                color: input.trim() && !loading ? "#fff" : "rgba(255,255,255,0.2)",
                cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: input.trim() && !loading ? "0 4px 12px rgba(99,102,241,0.4)" : "none",
                transition: "all 0.2s", flexShrink: 0
              }}
            >➤</button>
          </div>
        </div>
      )}
    </>
  );
}
