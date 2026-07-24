import { useState, useRef, useEffect } from "react";

const API_BASE = "http://localhost:9910";

/* ==========================================================================
   Token & style sama persis dengan LandingPage.jsx / AuthPage.jsx.
   ========================================================================== */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,500&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=JetBrains+Mono:wght@400;500;700&display=swap');
`;

const STYLES = `
:root{
  --mint-50:#F7FEFB;
  --mint-100:#E8FBF2;
  --mint-150:#DBF9EC;
  --teal-500:#0EA385;
  --emerald-500:#10B981;
  --mint-400:#52C3A6;
  --teal-600:#12A287;
  --ink-900:#0A2E26;
  --ink-700:#22483F;
  --ink-500:#5C7B72;
  --ink-300:#8FAAA1;
  --line:#CFF1E3;
}

.sf-root{
  background:var(--mint-50);
  color:var(--ink-900);
  font-family:'Plus Jakarta Sans', sans-serif;
  -webkit-font-smoothing:antialiased;
}
.sf-display{ font-family:'Fraunces', serif; }
.sf-mono{ font-family:'JetBrains Mono', monospace; letter-spacing:0.02em; }

.sf-reveal{
  opacity:0;
  transform:translateY(20px);
  transition:opacity 0.6s cubic-bezier(.16,1,.3,1), transform 0.6s cubic-bezier(.16,1,.3,1);
}
.sf-reveal.sf-in{ opacity:1; transform:translateY(0); }
@media (prefers-reduced-motion: reduce){
  .sf-reveal{ transition-duration:0.01s !important; transform:none !important; }
}

.sf-input{
  width:100%;
  padding:0.55rem 0.75rem;
  font-size:0.75rem;
  border:1px solid var(--line);
  border-radius:0.75rem;
  outline:none;
  background:white;
  color:var(--ink-900);
  transition:border-color .25s ease, box-shadow .25s ease;
}
.sf-input::placeholder{ color:var(--ink-300); }
.sf-input:focus{
  border-color:var(--teal-500);
  box-shadow:0 0 0 3px rgba(14,163,133,0.15);
}
.sf-input:disabled{ opacity:0.6; cursor:not-allowed; }

.sf-btn-primary{ position:relative; overflow:hidden; }
.sf-btn-primary::before{
  content:"";
  position:absolute; top:0; left:-60%;
  width:40%; height:100%;
  background:linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
  transform:skewX(-20deg);
  transition:left .7s ease;
}
.sf-btn-primary:hover:not(:disabled)::before{ left:130%; }

.sf-card{ transition:transform .4s cubic-bezier(.16,1,.3,1), box-shadow .4s ease, border-color .4s ease; }
.sf-card:hover{ box-shadow:0 20px 40px -20px rgba(10,46,38,0.16); }

.sf-status-card{ transition:background-color .5s ease, border-color .5s ease, color .5s ease; }

@keyframes sfPulse{
  0%,100%{ opacity:1; box-shadow:0 0 0 0 rgba(16,185,129,0.5); }
  50%{ opacity:.6; box-shadow:0 0 0 6px rgba(16,185,129,0); }
}
.sf-pulse-dot{ animation:sfPulse 2s ease-in-out infinite; }

@keyframes sfBubbleIn{
  from{ opacity:0; transform:translateY(10px) scale(0.98); }
  to{ opacity:1; transform:translateY(0) scale(1); }
}
.sf-bubble{ animation:sfBubbleIn 0.35s cubic-bezier(.16,1,.3,1); }
@media (prefers-reduced-motion: reduce){
  .sf-bubble{ animation:none; }
  .sf-pulse-dot{ animation:none; }
}

@keyframes sfSpin{ to{ transform:rotate(360deg); } }
.sf-spin{ animation:sfSpin 0.9s linear infinite; display:inline-block; }

.sf-link{ position:relative; }
.sf-link::after{
  content:"";
  position:absolute; left:0; bottom:-4px;
  width:0; height:2px;
  background:var(--teal-500);
  transition:width .3s ease;
}
.sf-link:hover::after{ width:100%; }

.sf-scrollbar::-webkit-scrollbar{ width:6px; }
.sf-scrollbar::-webkit-scrollbar-thumb{ background:var(--line); border-radius:999px; }
.sf-scrollbar::-webkit-scrollbar-track{ background:transparent; }
`;

function useReveal() {
  const [ref, setRef] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(ref);
    return () => obs.disconnect();
  }, [ref]);

  return [setRef, inView];
}

function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const [setRef, inView] = useReveal();
  return (
    <Tag ref={setRef} className={`sf-reveal ${inView ? "sf-in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

const STATUS_TONE = {
  Normal: { bg: "rgba(16,185,129,0.08)", border: "var(--line)", text: "var(--teal-600)", badgeBg: "var(--emerald-500)", label: "✅ Optimal" },
  "Risiko Stunting": { bg: "rgba(245,165,36,0.08)", border: "#FCE3B0", text: "#92600A", badgeBg: "#F5A524", label: "⚠️ Waspada" },
  Stunting: { bg: "rgba(220,38,38,0.06)", border: "#FBD1D1", text: "#B91C1C", badgeBg: "#DC2626", label: "🚨 Intervensi" },
  default: { bg: "var(--mint-50)", border: "var(--line)", text: "var(--ink-300)", badgeBg: null, label: null },
};

export default function DashboardMain({ user, childContext, setChildContext, onLogout, setView }) {
  const [formData, setFormData] = useState({
    nama_anak: childContext?.nama_anak || "",
    jenis_kelamin: childContext?.jenis_kelamin || "Laki-laki",
    usia_bulan: childContext?.usia_bulan || "",
    berat_kg: childContext?.berat_kg || "",
    tinggi_cm: childContext?.tinggi_cm || "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "gemma",
      text: "Halo Ayah/Bunda! Saya Gemma AI+. Setelah mengisi data antropometri anak di sebelah kiri, Ayah/Bunda bisa menanyakan rekomendasi gizi harian khusus yang sesuai dengan kondisi si kecil di sini.",
    },
  ]);

  const chatEndRef = useRef(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  const handlePredictSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          nama_anak: formData.nama_anak,
          jenis_kelamin: formData.jenis_kelamin,
          usia_bulan: parseInt(formData.usia_bulan),
          berat_kg: parseFloat(formData.berat_kg),
          tinggi_cm: parseFloat(formData.tinggi_cm),
        }),
      });
      const hasilML = await response.json();
      if (!response.ok) throw new Error(hasilML.error || "Respon server bermasalah.");

      setChildContext({
        ...formData,
        kategori: hasilML.kategori,
        waktu_pemulihan: hasilML.waktu_pemulihan,
      });

      setChatHistory((prev) => [
        ...prev,
        {
          sender: "gemma",
          text: `📢 Hasil analisis keluar! Status gizi ${formData.nama_anak} terdeteksi: **${hasilML.kategori}**. Silakan ketik perintah seperti *"Beri rekomendasi menu makanan harian"* atau *"Apa yang harus saya lakukan harian?"* untuk panduan gizi terstruktur dari saya.`,
        },
      ]);
    } catch (error) {
      alert(error.message || "Gagal terhubung ke server Flask!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput;
    setChatInput("");
    setChatLoading(true);

    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          kategori: childContext?.kategori || "Belum Mengisi Form",
          nama_anak: childContext?.nama_anak || formData.nama_anak,
          usia_bulan: childContext?.usia_bulan || formData.usia_bulan,
          berat_kg: childContext?.berat_kg || formData.berat_kg,
          tinggi_cm: childContext?.tinggi_cm || formData.tinggi_cm,
          waktu_pemulihan: childContext?.waktu_pemulihan || "",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memanggil Gemma AI");

      const balasan = data.reply || data.balasan || "Maaf, tidak ada balasan dari AI.";
      setChatHistory((prev) => [...prev, { sender: "gemma", text: balasan }]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { sender: "gemma", text: `❌ Maaf, koneksi terputus. Eror: ${error.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const tone = STATUS_TONE[childContext?.kategori] || STATUS_TONE.default;

  return (
    <div className="sf-root min-h-screen flex flex-col">
      <style>{FONT_IMPORT}</style>
      <style>{STYLES}</style>

      {/* ============ HEADER DASHBOARD (selaras Landing & Auth) ============ */}
      <header className="bg-white border-b p-4 sticky top-0 z-50" style={{ borderColor: "var(--line)", boxShadow: "0 4px 20px -12px rgba(10,46,38,0.12)" }}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView("landing")}>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md sf-display"
              style={{ background: "linear-gradient(135deg,#0EA385,#12A287)" }}
            >
              S+
            </div>
            <span className="text-lg font-extrabold tracking-tight sf-display" style={{ color: "var(--ink-900)" }}>
              StuntFree <span style={{ color: "var(--teal-500)" }}>AI+</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className="text-xs px-2 py-1 border rounded-md sf-mono hidden sm:inline-block"
              style={{ background: "var(--mint-100)", color: "var(--teal-600)", borderColor: "var(--line)" }}
            >
              Gemma Hackathon 2026
            </span>
            <div className="flex items-center gap-2 border-l pl-3" style={{ borderColor: "var(--line)" }}>
              <span className="text-xs font-medium hidden sm:inline" style={{ color: "var(--ink-500)" }}>
                👋 {user?.nama_orang_tua || "Orang Tua"}
              </span>
              <button
                onClick={onLogout}
                className="text-xs font-semibold px-2 py-1 rounded-md transition sf-link"
                style={{ color: "#DC2626" }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============ KONTEN GRID ============ */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* KOLOM KIRI: FORM ANTROPOMETRI */}
        <section className="lg:col-span-5 space-y-6">
          <Reveal className="sf-card bg-white border p-6 rounded-2xl" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2.5 mb-5">
              <span className="p-2 rounded-xl text-lg" style={{ background: "var(--mint-100)", color: "var(--teal-500)" }}>
                📝
              </span>
              <div>
                <h2 className="font-bold text-sm sf-display" style={{ color: "var(--ink-900)" }}>
                  Input Antropometri Anak
                </h2>
                <p className="text-[11px] font-medium" style={{ color: "var(--ink-300)" }}>
                  Masukkan data fisik valid sesuai KMS Posyandu
                </p>
              </div>
            </div>

            <form onSubmit={handlePredictSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                  Nama Lengkap Anak
                </label>
                <input
                  type="text"
                  required
                  className="sf-input"
                  placeholder="Contoh: Siti Aminah"
                  value={formData.nama_anak}
                  onChange={(e) => setFormData({ ...formData, nama_anak: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                  Jenis Kelamin
                </label>
                <select
                  className="sf-input"
                  value={formData.jenis_kelamin}
                  onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value })}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                    Usia (Bln)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="60"
                    className="sf-input"
                    value={formData.usia_bulan}
                    onChange={(e) => setFormData({ ...formData, usia_bulan: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                    Berat (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="sf-input"
                    value={formData.berat_kg}
                    onChange={(e) => setFormData({ ...formData, berat_kg: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                    Tinggi (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="sf-input"
                    value={formData.tinggi_cm}
                    onChange={(e) => setFormData({ ...formData, tinggi_cm: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="sf-btn-primary w-full text-white font-bold text-xs py-3 rounded-xl transition disabled:opacity-50"
                style={{ background: "var(--teal-500)", boxShadow: "0 16px 32px -14px rgba(14,163,133,0.5)" }}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="sf-spin">⏳</span> Memproses Data ML...
                  </span>
                ) : (
                  "🤖 Hitung & Analisis AI+"
                )}
              </button>
            </form>
          </Reveal>

          <button
            onClick={() => setView("landing")}
            className="w-full bg-white text-xs font-semibold py-2.5 rounded-xl border transition sf-link"
            style={{ color: "var(--ink-500)", borderColor: "var(--line)" }}
          >
            ← Kembali ke Landing Page
          </button>
        </section>

        {/* KOLOM KANAN: STATUS DIAGNOSTIK & KONSULTASI INTERAKTIF GEMMA */}
        <section className="lg:col-span-7 flex flex-col space-y-4 h-full">
          {/* Box Status Evaluasi Diagnostik XGBoost */}
          <Reveal className="sf-card bg-white border p-5 rounded-2xl space-y-3" style={{ borderColor: "var(--line)" }}>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg text-sm" style={{ background: "var(--mint-100)", color: "var(--teal-500)" }}>
                🎯
              </span>
              <h2 className="font-bold text-xs sm:text-sm sf-display" style={{ color: "var(--ink-900)" }}>
                Hasil Evaluasi Diagnostik ML
              </h2>
            </div>

            <div
              className="sf-status-card p-4 rounded-xl border flex items-center justify-between gap-2"
              style={{ background: tone.bg, borderColor: tone.border, color: tone.text }}
            >
              <div>
                <span className="text-[9px] font-bold tracking-wider uppercase opacity-70 block sf-mono">Status Gizi:</span>
                <h3 className="text-base font-black mt-0.5 sf-display">
                  {childContext?.kategori || "Menunggu data input..."}
                </h3>
                {childContext?.waktu_pemulihan && (
                  <p className="text-[10px] font-medium mt-0.5 opacity-80">{childContext.waktu_pemulihan}</p>
                )}
              </div>
              {tone.label && (
                <span
                  className="px-3 py-1 font-bold text-[10px] rounded-lg text-white shadow-2xs"
                  style={{ background: tone.badgeBg }}
                >
                  {tone.label}
                </span>
              )}
            </div>
          </Reveal>

          {/* 💬 WIDGET CHATBOX GEMMA AI */}
          <Reveal className="sf-card bg-white border flex-1 flex flex-col rounded-2xl overflow-hidden min-h-[400px]" style={{ borderColor: "var(--line)" }}>
            <div
              className="text-white px-4 py-3 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, var(--ink-900), #0A3B31)" }}
            >
              <div className="flex items-center gap-2">
                <span className="sf-pulse-dot w-2 h-2 rounded-full" style={{ background: "var(--emerald-500)" }}></span>
                <h3 className="text-xs font-bold tracking-wide sf-display">🤖 Asisten Gizi Gemma AI+</h3>
              </div>
              <span className="text-[10px] sf-mono" style={{ color: "var(--mint-400)" }}>
                Live Context Injected
              </span>
            </div>

            <div className="sf-scrollbar flex-1 p-4 overflow-y-auto space-y-3 max-h-[340px] text-xs">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`sf-bubble flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-line shadow-2xs"
                    style={
                      chat.sender === "user"
                        ? { background: "var(--teal-500)", color: "white", borderBottomRightRadius: 4 }
                        : { background: "var(--mint-50)", color: "var(--ink-900)", border: "1px solid var(--line)", borderBottomLeftRadius: 4 }
                    }
                  >
                    {chat.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl p-3 shadow-2xs italic flex items-center gap-2"
                    style={{ background: "var(--mint-50)", border: "1px solid var(--line)", color: "var(--ink-300)", borderBottomLeftRadius: 4 }}
                  >
                    <span className="sf-spin">⏳</span> Gemma sedang menyusun jawaban...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChat} className="p-3 border-t flex gap-2" style={{ background: "var(--mint-50)", borderColor: "var(--line)" }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={childContext?.kategori ? "Ketik 'rekomendasi makanan' di sini..." : "Silakan isi form hitung AI+ dahulu..."}
                disabled={chatLoading}
                className="sf-input flex-1"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="sf-btn-primary text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-2xs disabled:opacity-50"
                style={{ background: chatLoading || !chatInput.trim() ? "var(--ink-300)" : "var(--teal-500)" }}
              >
                Kirim
              </button>
            </form>
          </Reveal>
        </section>
      </main>
    </div>
  );
}