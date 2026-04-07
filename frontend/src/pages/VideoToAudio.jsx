import { useState } from "react";
import Layout from "../components/Layout";
import Chatbot from "../components/Chatbot";
import { jsPDF } from "jspdf";

const tabs = [
  { id: "transcript", label: "Transcript", icon: "📝" },
  { id: "summary", label: "Summary", icon: "📋" },
  { id: "actions", label: "Action Items", icon: "✅" },
];

const glass = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "20px",
};

function ProcessingOverlay({ steps }) {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useState(() => {
    const stepDuration = 4000;
    const tickMs = 60;
    const totalTicks = (steps.length * stepDuration) / tickMs;
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      const pct = Math.min((tick / totalTicks) * 100, 97);
      setProgress(pct);
      const step = Math.min(Math.floor(tick / (totalTicks / steps.length)), steps.length - 1);
      setActiveStep(step);
    }, tickMs);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "linear-gradient(135deg, #07071a 0%, #0d0d2b 50%, #0a0520 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ position: "absolute", top: "15%", left: "20%", width: "340px", height: "340px", borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "20%", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", marginBottom: "48px" }}>
        <div style={{ position: "absolute", inset: "-16px", borderRadius: "50%", background: "rgba(99,102,241,0.08)", animation: "breathe 2.5s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", background: "rgba(99,102,241,0.12)", animation: "breathe 2.5s ease-in-out infinite", animationDelay: "0.3s" }} />
        <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", position: "relative", boxShadow: "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)", border: "1px solid rgba(255,255,255,0.15)" }}>⚡</div>
      </div>

      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.5px", marginBottom: "8px" }}>Processing your meeting</h2>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>Action Log AI is working its magic...</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "320px", marginBottom: "36px" }}>
        {steps.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderRadius: "16px", background: isActive ? "rgba(99,102,241,0.15)" : isDone ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)", border: isActive ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", boxShadow: isActive ? "0 4px 24px rgba(99,102,241,0.2)" : "none", transition: "all 0.4s ease" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: isDone ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : isActive ? `${step.color}22` : "rgba(255,255,255,0.04)", border: `1px solid ${isActive ? step.color + "66" : isDone ? "transparent" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", boxShadow: isDone ? "0 4px 12px rgba(99,102,241,0.35)" : "none", transition: "all 0.4s ease" }}>{isDone ? "✓" : step.icon}</div>
              <span style={{ fontSize: "13px", fontWeight: isActive ? 700 : 500, color: isActive ? "#ffffff" : isDone ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)", flex: 1, transition: "all 0.3s" }}>{step.label}</span>
              {isActive && <div style={{ display: "flex", gap: "3px" }}>{[0,1,2].map(d => <div key={d} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#818cf8", animation: "pulse 1s infinite", animationDelay: `${d * 0.2}s` }} />)}</div>}
              {isDone && <span style={{ fontSize: "11px", color: "#818cf8", fontWeight: 700 }}>Done</span>}
            </div>
          );
        })}
      </div>

      <div style={{ width: "320px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>Progress</span>
          <span style={{ fontSize: "11px", color: "#a5b4fc", fontWeight: 700 }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: "4px", borderRadius: "999px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: "999px", width: `${progress}%`, background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)", boxShadow: "0 0 12px rgba(99,102,241,0.6)", transition: "width 0.06s linear" }} />
        </div>
      </div>
    </div>
  );
}

export default function VideoToAudio() {
  const [video, setVideo] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("transcript");

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) { setVideo(f); setResult(null); setStatus("idle"); }
  };

  const handleSubmit = async () => {
    if (!video) return;
    const formData = new FormData();
    formData.append("video", video);
    try {
      setStatus("processing"); setResult(null);
      const res = await fetch("http://127.0.0.1:5000/process-video", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data); setStatus("done"); setActiveTab("transcript");
    } catch { alert("Error processing video. Please try again."); setStatus("idle"); }
  };

  const handleReset = () => { setVideo(null); setResult(null); setStatus("idle"); };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 16; const maxWidth = pageWidth - margin * 2; let y = 20;
    const addSection = (title, body) => {
      doc.setFontSize(13); doc.setFont("helvetica", "bold"); doc.setTextColor(99, 102, 241);
      doc.text(title, margin, y); y += 8;
      doc.setDrawColor(99, 102, 241); doc.line(margin, y, pageWidth - margin, y); y += 8;
      doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(50, 50, 50);
      doc.splitTextToSize(body, maxWidth).forEach(line => { if (y > 275) { doc.addPage(); y = 20; } doc.text(line, margin, y); y += 6; }); y += 10;
    };
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
    doc.text("Action Log — Meeting Highlights", margin, y); y += 6;
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${new Date().toLocaleString()}`, margin, y); y += 14;
    addSection("TRANSCRIPT", result.transcript || "");
    addSection("SUMMARY", result.summary || "");
    addSection("ACTION ITEMS", result.action_items?.map((item, i) => `${i + 1}. ${item}`).join("\n") || "No action items.");
    doc.save(`${video?.name?.replace(/\.[^.]+$/, "") || "meeting"}-highlights.pdf`);
  };

  return (
    <Layout>
      <Chatbot transcript={result?.transcript || ""} />
      {status === "processing" && <ProcessingOverlay steps={[
        { label: "Extracting audio", icon: "🎵", color: "#6366f1" },
        { label: "Transcribing speech", icon: "🎧", color: "#8b5cf6" },
        { label: "Generating highlights", icon: "✅", color: "#a78bfa" }
      ]} />}

      {status !== "done" && (
        <div style={{ maxWidth: "580px" }}>
          <div style={{ marginBottom: "36px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "999px", padding: "6px 16px", marginBottom: "20px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", boxShadow: "0 0 6px #818cf8" }} />
              <span style={{ fontSize: "11px", color: "#a5b4fc", fontWeight: 700, letterSpacing: "1px" }}>VIDEO PROCESSING</span>
            </div>
            <h1 style={{ fontSize: "36px", fontWeight: 800, color: "#ffffff", letterSpacing: "-1px", marginBottom: "10px", lineHeight: 1.15 }}>
              Upload your meeting<br />
              <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>video recording</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "15px", lineHeight: 1.6 }}>Audio is extracted and processed automatically.</p>
          </div>

          <div style={{ ...glass, padding: "36px" }}>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", marginBottom: "24px",
                border: `2px dashed ${dragOver ? "rgba(99,102,241,0.7)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: "16px", padding: "52px 24px",
                background: dragOver ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.02)",
                transition: "all 0.2s"
              }}>
              <input type="file" accept="video/*" style={{ display: "none" }} onChange={(e) => { setVideo(e.target.files[0]); setResult(null); }} />
              <div style={{ width: "72px", height: "72px", borderRadius: "20px", marginBottom: "20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", boxShadow: "0 8px 32px rgba(99,102,241,0.4)", border: "1px solid rgba(255,255,255,0.15)" }}>🎬</div>
              {video ? (
                <><p style={{ color: "#a5b4fc", fontWeight: 700, fontSize: "15px", marginBottom: "4px" }}>{video.name}</p><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px" }}>{(video.size / 1024 / 1024).toFixed(2)} MB · Ready</p></>
              ) : (
                <><p style={{ color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: "15px", marginBottom: "6px" }}>Drop your video file here</p><p style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>MP4, MKV, MOV, AVI, WEBM · or click to browse</p></>
              )}
            </label>
            <button onClick={handleSubmit} disabled={!video} style={{
              width: "100%", padding: "15px", borderRadius: "14px", border: "none",
              fontSize: "15px", fontWeight: 700, cursor: video ? "pointer" : "not-allowed",
              background: video ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.05)",
              color: video ? "#fff" : "rgba(255,255,255,0.2)",
              boxShadow: video ? "0 8px 32px rgba(99,102,241,0.4)" : "none",
              transition: "all 0.2s"
            }}>
              ⚡ Process Video
            </button>
          </div>
        </div>
      )}

      {status === "done" && result && (
        <div style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>Video Highlights ✨</h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>{video?.name}</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleDownloadPDF} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "12px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>⬇ PDF</button>
              <button onClick={handleReset} style={{ ...glass, borderRadius: "12px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>↩ New Video</button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "28px" }}>
            {[{ label: "Words", value: result.transcript?.split(" ").length || 0, icon: "📝" }, { label: "Summary", value: "Done", icon: "📋" }, { label: "Actions", value: result.action_items?.length || 0, icon: "✅" }].map((stat, i) => (
              <div key={i} style={{ ...glass, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{stat.icon}</div>
                <div style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff" }}>{stat.value}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", fontWeight: 600, marginTop: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "5px", marginBottom: "16px" }}>
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                gap: "7px", padding: "11px", borderRadius: "12px", border: "none",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s",
                background: activeTab === tab.id ? "rgba(99,102,241,0.25)" : "transparent",
                color: activeTab === tab.id ? "#a5b4fc" : "rgba(255,255,255,0.35)",
                boxShadow: activeTab === tab.id ? "0 2px 12px rgba(99,102,241,0.2)" : "none",
              }}>
                {tab.icon} {tab.label}
                {tab.id === "actions" && result.action_items?.length > 0 && <span style={{ background: activeTab === tab.id ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)", color: activeTab === tab.id ? "#a5b4fc" : "rgba(255,255,255,0.4)", borderRadius: "999px", padding: "1px 8px", fontSize: "11px", fontWeight: 700 }}>{result.action_items.length}</span>}
              </button>
            ))}
          </div>

          <div style={{ ...glass, padding: "28px", minHeight: "260px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "18px" }}>{tabs.find(t => t.id === activeTab)?.label}</p>
            {activeTab === "transcript" && <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.9, fontSize: "14px", whiteSpace: "pre-wrap" }}>{result.transcript}</p>}
            {activeTab === "summary" && <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.9, fontSize: "14px" }}>{result.summary}</p>}
            {activeTab === "actions" && (result.action_items?.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {result.action_items.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "14px", padding: "14px 18px" }}>
                    <span style={{ minWidth: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "11px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>{i + 1}</span>
                    <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.7 }}>{item}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>No action items detected.</p>)}
          </div>
        </div>
      )}
    </Layout>
  );
}
