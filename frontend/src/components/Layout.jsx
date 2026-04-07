import { useLocation, Link } from "react-router-dom";

const navItems = [
  { path: "/", icon: "🎵", label: "Audio Upload" },
  { path: "/video-audio", icon: "🎬", label: "Video Upload" },
  { path: "/live", icon: "🔴", label: "Live Meeting" },
];

export default function Layout({ children }) {
  const { pathname } = useLocation();

  return (
    <div style={{
      minHeight: "100vh",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      background: "linear-gradient(135deg, #0a0a1a 0%, #0d1b2e 40%, #0a1628 70%, #130a2e 100%)",
      position: "relative", overflow: "hidden"
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "30%", right: "-15%", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "30%", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />
      </div>

      {/* Top Navbar */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center",
        padding: "0 40px", height: "68px", gap: "36px"
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", boxShadow: "0 4px 16px rgba(99,102,241,0.5)",
            border: "1px solid rgba(255,255,255,0.15)"
          }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "17px", color: "#ffffff", letterSpacing: "-0.3px", lineHeight: 1 }}>Action Log</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 500, marginTop: "2px" }}>AI Meeting Assistant</div>
          </div>
        </Link>

        {/* Divider */}
        <div style={{ width: "1px", height: "28px", background: "rgba(255,255,255,0.08)" }} />

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "8px 18px", borderRadius: "12px",
                textDecoration: "none", transition: "all 0.2s",
                background: active ? "rgba(99,102,241,0.2)" : "transparent",
                border: active ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent",
                backdropFilter: active ? "blur(12px)" : "none",
                color: active ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                fontSize: "13px", fontWeight: active ? 700 : 500,
                boxShadow: active ? "0 4px 16px rgba(99,102,241,0.2)" : "none"
              }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {active && <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#818cf8", boxShadow: "0 0 8px #818cf8", marginLeft: "2px" }} />}
              </Link>
            );
          })}
        </div>

        {/* Status badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: "7px",
          background: "rgba(99,102,241,0.1)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "999px", padding: "6px 16px", flexShrink: 0,
          backdropFilter: "blur(12px)"
        }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#818cf8", boxShadow: "0 0 8px #818cf8", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "#a5b4fc", fontWeight: 600 }}>Online</span>
        </div>
      </nav>

      {/* Page content */}
      <main style={{ position: "relative", zIndex: 1, padding: "48px", maxWidth: "1200px", margin: "0 auto" }}>
        {children}
      </main>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(16px); } to { opacity:1; transform: translateY(0); } }
        @keyframes wave { 0%,100% { transform: scaleY(1); opacity:0.5; } 50% { transform: scaleY(2.5); opacity:1; } }
        a:hover { opacity: 0.85; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
      `}</style>
    </div>
  );
}
