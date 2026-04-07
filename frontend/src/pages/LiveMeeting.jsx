import { useState, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import Chatbot from "../components/Chatbot";
import { jsPDF } from "jspdf";

const CHUNK_INTERVAL = 5000;
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

  useEffect(() => {
    const stepDuration = 4000;
    const tickMs = 60;
    const totalTicks = (steps.length * stepDuration) / tickMs;
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setProgress(Math.min((tick / totalTicks) * 100, 97));
      setActiveStep(Math.min(Math.floor(tick / (totalTicks / steps.length)), steps.length - 1));
    }, tickMs);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "linear-gradient(135deg, #07071a 0%, #0d0d2b 50%, #0a0520 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
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
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: isDone ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : isActive ? `${step.color}22` : "rgba(255,255,255,0.04)", border: `1px solid ${isActive ? step.color + "66" : isDone ? "transparent" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", transition: "all 0.4s ease" }}>{isDone ? "✓" : step.icon}</div>
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

export default function LiveMeeting() {
  const [status, setStatus] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [screenSharing, setScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");

  const videoRef = useRef(null);
  const transcriptRef = useRef(null);
  const streamRef = useRef(null);
  const fullRecorderRef = useRef(null);
  const fullChunksRef = useRef([]);
  const timerRef = useRef(null);
  const chunkIntervalRef = useRef(null);
  const liveTranscriptRef = useRef("");

  useEffect(() => { startCamera(); return () => cleanup(); }, []);
  useEffect(() => {
    liveTranscriptRef.current = liveTranscript;
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [liveTranscript]);

  const startCamera = async () => {
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { noiseSuppression: true, echoCancellation: true, autoGainControl: true, sampleRate: 16000 }
      });
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();
      audioContext.createMediaStreamSource(micStream).connect(dest);
      const mixed = new MediaStream([...micStream.getVideoTracks(), ...dest.stream.getAudioTracks()]);
      mixed._micStream = micStream; mixed._screenStream = null; mixed._audioContext = audioContext; mixed._dest = dest;
      streamRef.current = mixed;
      if (videoRef.current) videoRef.current.srcObject = micStream;
    } catch { setError("Camera/microphone access denied."); }
  };

  const toggleScreenShare = async () => {
    if (screenSharing) {
      streamRef.current?._screenStream?.getTracks().forEach(t => t.stop());
      streamRef.current._screenStream = null;
      setScreenSharing(false);
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      if (screenStream.getAudioTracks().length > 0)
        streamRef.current._audioContext.createMediaStreamSource(screenStream).connect(streamRef.current._dest);
      streamRef.current._screenStream = screenStream;
      screenStream.getVideoTracks()[0].onended = () => { setScreenSharing(false); streamRef.current._screenStream = null; };
      setScreenSharing(true);
    } catch {}
  };

  const cleanup = () => {
    streamRef.current?._micStream?.getTracks().forEach(t => t.stop());
    streamRef.current?._screenStream?.getTracks().forEach(t => t.stop());
    streamRef.current?._audioContext?.close();
    clearInterval(timerRef.current); clearInterval(chunkIntervalRef.current);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    fullChunksRef.current = [];
    const fullMR = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    fullMR.ondataavailable = (e) => { if (e.data.size > 0) fullChunksRef.current.push(e.data); };
    fullMR.start(1000);
    fullRecorderRef.current = fullMR;
    setStatus("recording"); setSeconds(0); setLiveTranscript(""); liveTranscriptRef.current = "";
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    chunkIntervalRef.current = setInterval(() => sendAudioChunk(), CHUNK_INTERVAL);
  };

  const sendAudioChunk = () => {
    if (!streamRef.current) return;
    const audioStream = new MediaStream(streamRef.current.getAudioTracks());
    const chunkMR = new MediaRecorder(audioStream, { mimeType: "audio/webm" });
    const chunkData = [];
    chunkMR.ondataavailable = (e) => { if (e.data.size > 0) chunkData.push(e.data); };
    chunkMR.onstop = async () => {
      const blob = new Blob(chunkData, { type: "audio/webm" });
      if (blob.size < 500) return;
      const formData = new FormData();
      formData.append("audio", blob, "chunk.webm");
      try {
        const res = await fetch("http://127.0.0.1:5000/transcribe-chunk", { method: "POST", body: formData });
        const data = await res.json();
        if (data.text?.trim()) setLiveTranscript(prev => prev ? prev + "\n" + data.text.trim() : data.text.trim());
      } catch {}
    };
    chunkMR.start();
    setTimeout(() => { if (chunkMR.state === "recording") chunkMR.stop(); }, CHUNK_INTERVAL - 300);
  };

  const stopRecording = () => {
    clearInterval(timerRef.current); clearInterval(chunkIntervalRef.current);
    setStatus("processing");
    fullRecorderRef.current.stop();
    fullRecorderRef.current.onstop = () => processVideo();
  };

  const processVideo = async () => {
    const blob = new Blob(fullChunksRef.current, { type: "video/webm" });
    const formData = new FormData();
    formData.append("video", blob, "meeting.webm");
    try {
      const res = await fetch("http://127.0.0.1:5000/process-video", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (liveTranscriptRef.current && (!data.transcript || data.transcript.length < liveTranscriptRef.current.length))
        data.transcript = liveTranscriptRef.current;
      setResult(data); setStatus("done"); setActiveTab("transcript");
    } catch { setError("Error processing meeting."); setStatus("idle"); }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
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
    doc.save("action-log-meeting.pdf");
  };

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Layout>
      <Chatbot transcript={liveTranscript || result?.transcript || ""} />
      {status === "processing" && <ProcessingOverlay steps={[
        { label: "Extracting audio", icon: "🎬", color: "#6366f1" },
        { label: "Transcribing speech", icon: "🎧", color: "#8b5cf6" },
        { label: "Generating highlights", icon: "✅", color: "#a78bfa" }
      ]} />}

      {(status === "idle" || status === "recording") && (
        <div>
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: "999px", padding: "6px 16px", marginBottom: "16px" }}>
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", boxShadow: "0 0 6px #818cf8" }} />
              <span style={{ fontSize: "11px", color: "#a5b4fc", fontWeight: 700, letterSpacing: "1px" }}>LIVE RECORDING</span>
            </div>
            <h1 style={{ fontSize: "32px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.8px", marginBottom: "8px" }}>
              <span style={{ background: "linear-gradient(135deg, #818cf8, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Live Meeting</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "14px" }}>Record your meeting with live transcription of all participants.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
            {/* Webcam */}
            <div style={{ ...glass, overflow: "hidden" }}>
              <div style={{ position: "relative", background: "#050510", aspectRatio: "4/3" }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                {status === "recording" && (
                  <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", alignItems: "center", gap: "7px", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(12px)", borderRadius: "999px", padding: "5px 14px", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 8px #ef4444", animation: "pulse 1s infinite" }} />
                    <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>REC {fmt(seconds)}</span>
                  </div>
                )}
                {error && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(10,10,26,0.85)" }}><p style={{ color: "#f87171", fontSize: "13px", textAlign: "center", padding: "20px" }}>{error}</p></div>}
              </div>
              <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", marginBottom: "2px" }}>{status === "recording" ? "Recording..." : "Ready"}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{status === "recording" ? `${fmt(seconds)} elapsed` : "Click Start to begin"}</p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={toggleScreenShare} style={{ background: screenSharing ? "linear-gradient(135deg, #f59e0b, #d97706)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "9px 14px", fontSize: "12px", fontWeight: 700, color: screenSharing ? "#fff" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                    {screenSharing ? "🖥️ Sharing" : "🖥️ Share"}
                  </button>
                  {status === "idle" ? (
                    <button onClick={startRecording} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "10px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>▶ Start</button>
                  ) : (
                    <button onClick={stopRecording} style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", border: "none", borderRadius: "10px", padding: "9px 20px", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(239,68,68,0.4)" }}>⏹ Stop</button>
                  )}
                </div>
              </div>
            </div>

            {/* Live transcript */}
            <div style={{ ...glass, padding: "20px", display: "flex", flexDirection: "column", minHeight: "320px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase" }}>Live Transcript</p>
                {status === "recording" && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", boxShadow: "0 0 6px #818cf8", animation: "pulse 1.2s infinite" }} />
                    <span style={{ fontSize: "11px", color: "#a5b4fc", fontWeight: 600 }}>Updates every 5s</span>
                  </div>
                )}
              </div>
              <div ref={transcriptRef} style={{ flex: 1, overflowY: "auto", fontSize: "13px", lineHeight: 1.8, color: "rgba(255,255,255,0.7)", maxHeight: "260px" }}>
                {liveTranscript
                  ? <p style={{ whiteSpace: "pre-wrap" }}>{liveTranscript}</p>
                  : <p style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic", fontSize: "13px" }}>{status === "recording" ? "Listening... first update in ~5 seconds." : "Start recording to see live transcript."}</p>}
              </div>
              {status === "recording" && (
                <div style={{ marginTop: "14px", display: "flex", gap: "6px" }}>
                  {[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: "3px", borderRadius: "999px", background: "linear-gradient(90deg, #6366f1, #8b5cf6)", animation: "wave 1s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {status === "done" && result && (
        <div style={{ maxWidth: "720px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
            <div>
              <h1 style={{ fontSize: "26px", fontWeight: 800, color: "#ffffff", marginBottom: "4px" }}>Meeting Highlights ✨</h1>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px" }}>Your meeting has been processed successfully.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={handleDownloadPDF} style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "12px", padding: "10px 20px", fontSize: "13px", fontWeight: 700, color: "#fff", cursor: "pointer", boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>⬇ PDF</button>
              <button onClick={() => { setStatus("idle"); setResult(null); setSeconds(0); setLiveTranscript(""); startCamera(); }} style={{ ...glass, borderRadius: "12px", padding: "10px 20px", fontSize: "13px", fontWeight: 600, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>↩ New</button>
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
            {activeTab === "actions" && (
              result.action_items?.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {result.action_items.map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "14px", padding: "14px 18px" }}>
                      <span style={{ minWidth: "28px", height: "28px", borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "11px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(99,102,241,0.4)" }}>{i + 1}</span>
                      <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.7 }}>{item}</span>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "14px" }}>No action items detected.</p>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
