import { useState, useEffect, useCallback } from "react";

/* ==========================================================================
   Token & style sama persis dengan LandingPage.jsx agar konsisten satu brand.
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
  transform:translateY(24px);
  transition:opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
}
.sf-reveal.sf-in{ opacity:1; transform:translateY(0); }
@media (prefers-reduced-motion: reduce){
  .sf-reveal{ transition-duration:0.01s !important; transform:none !important; }
}

@keyframes sfFloat{
  0%,100%{ transform:translate(0,0) scale(1); }
  50%{ transform:translate(-10px,-18px) scale(1.04); }
}
.sf-float{ animation:sfFloat 9s ease-in-out infinite; }
.sf-float-slow{ animation:sfFloat 14s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce){
  .sf-float, .sf-float-slow{ animation:none; }
}

.sf-curve-path{
  stroke-dasharray:900;
  stroke-dashoffset:900;
  transition:stroke-dashoffset 2.1s cubic-bezier(.16,1,.3,1);
}
.sf-in .sf-curve-path{ stroke-dashoffset:0; }

@keyframes sfDotTravel{
  0%{ offset-distance:0%; opacity:0; }
  8%{ opacity:1; }
  92%{ opacity:1; }
  100%{ offset-distance:100%; opacity:0; }
}
.sf-curve-dot{
  offset-path: path("M8,150 C 100,140 150,60 230,72 C 310,84 330,150 410,110");
  animation:sfDotTravel 3.6s cubic-bezier(.4,0,.2,1) infinite;
  animation-delay:2s;
}
@media (prefers-reduced-motion: reduce){
  .sf-curve-dot{ animation:none; opacity:0; }
}

.sf-nav{ transition:box-shadow 0.35s ease, background-color 0.35s ease, border-color .35s ease; }
.sf-nav-scrolled{
  background-color:rgba(247,254,251,0.92) !important;
  box-shadow:0 8px 30px -12px rgba(10,46,38,0.18);
  border-color:var(--line) !important;
}

.sf-input{
  width:100%;
  padding:0.65rem 0.85rem;
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

.sf-btn-primary{ position:relative; overflow:hidden; }
.sf-btn-primary::before{
  content:"";
  position:absolute; top:0; left:-60%;
  width:40%; height:100%;
  background:linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent);
  transform:skewX(-20deg);
  transition:left .7s ease;
}
.sf-btn-primary:hover::before{ left:130%; }

.sf-link{ position:relative; }
.sf-link::after{
  content:"";
  position:absolute; left:0; bottom:-4px;
  width:0; height:2px;
  background:var(--teal-500);
  transition:width .3s ease;
}
.sf-link:hover::after{ width:100%; }

@keyframes sfShake{
  0%,100%{ transform:translateX(0); }
  20%{ transform:translateX(-4px); }
  40%{ transform:translateX(4px); }
  60%{ transform:translateX(-3px); }
  80%{ transform:translateX(3px); }
}
.sf-shake{ animation:sfShake 0.4s ease; }
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

function GrowthCurveArt({ className = "" }) {
  const [setRef, inView] = useReveal();
  return (
    <svg
      ref={setRef}
      viewBox="0 0 420 220"
      className={`${inView ? "sf-in" : ""} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M8,190 C120,175 200,120 410,150" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      <path d="M8,170 C120,150 210,95 410,80" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      <path
        className="sf-curve-path"
        d="M8,150 C 100,140 150,60 230,72 C 310,84 330,150 410,110"
        stroke="url(#authGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="authGrad" x1="0" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#52C3A6" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      <circle className="sf-curve-dot" r="6" fill="#DBF9EC" />
    </svg>
  );
}

export default function AuthPage({ setUser, setView }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    nama_orang_tua: "",
    email: "",
    password: "",
    nomor_telepon: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cardRef, cardIn] = useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 420);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    const endpoint = isLoginMode ? "/api/login" : "/api/register";

    try {
      const response = await fetch(`http://127.0.0.1:9910${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan pada server.");
      }

      if (isLoginMode) {
        setUser(data.user);
        setView("dashboard");
      } else {
        setSuccessMsg("Registrasi sukses! Silakan login menggunakan akun baru.");
        setIsLoginMode(true);
        setFormData({ nama_orang_tua: "", email: "", password: "", nomor_telepon: "" });
      }
    } catch (err) {
      setErrorMsg(err.message);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="sf-root min-h-screen font-sans selection:bg-teal-500 selection:text-white">
      <style>{FONT_IMPORT}</style>
      <style>{STYLES}</style>

      {/* ============ NAVBAR (selaras dengan LandingPage) ============ */}
      <header
        className={`sf-nav fixed top-0 left-0 w-full z-50 border-b ${
          scrolled ? "sf-nav-scrolled" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setView("landing")}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md sf-display"
              style={{ background: "linear-gradient(135deg,#0EA385,#12A287)", boxShadow: "0 8px 20px -6px rgba(14,163,133,0.45)" }}
            >
              S+
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight block leading-none sf-display" style={{ color: "var(--ink-900)" }}>
                StuntFree <span style={{ color: "var(--teal-500)" }}>AI+</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase sf-mono" style={{ color: "var(--ink-300)" }}>
                Gemma Ecosystem
              </span>
            </div>
          </div>

          <button
            onClick={() => setView("landing")}
            className="sf-link text-sm font-semibold flex items-center gap-1.5"
            style={{ color: "var(--ink-700)" }}
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </header>

      {/* ============ KONTEN AUTH ============ */}
      <main className="min-h-screen flex items-center justify-center px-4 pt-28 pb-12 relative overflow-hidden">
        {/* ambient blobs, konsisten dengan hero LandingPage */}
        <div
          className="sf-float absolute -top-10 -left-10 w-72 h-72 rounded-full blur-3xl -z-10"
          style={{ background: "radial-gradient(circle, rgba(14,163,133,0.16), transparent 70%)" }}
        />
        <div
          className="sf-float-slow absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10"
          style={{ background: "radial-gradient(circle, rgba(82,195,166,0.18), transparent 70%)" }}
        />

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Panel kiri: visual growth-curve, hanya tampil di layar besar */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center rounded-3xl p-10 h-full relative overflow-hidden" style={{ background: "linear-gradient(135deg, var(--ink-900), #0A3B31)" }}>
            <span className="text-xs font-bold uppercase tracking-widest sf-mono mb-4" style={{ color: "var(--mint-400)" }}>
              Gemma Ecosystem
            </span>
            <h2 className="sf-display text-2xl font-semibold text-white leading-snug mb-4">
              Satu akun, akses penuh ke seluruh lini deteksi &amp; intervensi gizi anak.
            </h2>
            <GrowthCurveArt className="w-full h-auto mt-4" />
            <p className="text-xs leading-relaxed mt-6" style={{ color: "var(--mint-150)" }}>
              Riwayat skrining, rekomendasi Gemma AI, dan rencana menu tersimpan aman di bawah satu profil orang tua.
            </p>
          </div>

          {/* Panel kanan: form */}
          <div
            ref={cardRef}
            className={`sf-reveal ${cardIn ? "sf-in" : ""} lg:col-span-7 ${shake ? "sf-shake" : ""}`}
          >
            <div className="bg-white border p-8 rounded-3xl shadow-xl w-full max-w-md mx-auto space-y-6" style={{ borderColor: "var(--line)" }}>
              <div className="text-center">
                <h1
                  className="sf-display text-2xl font-semibold cursor-pointer"
                  style={{ color: "var(--ink-900)" }}
                  onClick={() => setView("landing")}
                >
                  StuntFree <span style={{ color: "var(--teal-500)" }}>AI+</span>
                </h1>
                <p className="text-xs mt-1 font-medium" style={{ color: "var(--ink-300)" }}>
                  {isLoginMode ? "Masuk untuk akses kalkulator & riwayat AI" : "Daftar akun orang tua baru"}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 text-xs font-semibold rounded-xl border" style={{ background: "#FEF2F2", color: "#DC2626", borderColor: "#FECACA" }}>
                  ⚠️ {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 text-xs font-semibold rounded-xl border" style={{ background: "var(--mint-100)", color: "var(--teal-600)", borderColor: "var(--line)" }}>
                  ✅ {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                  <>
                    <div>
                      <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                        Nama Lengkap Orang Tua
                      </label>
                      <input
                        type="text"
                        required
                        className="sf-input"
                        placeholder="Contoh: Budi Santoso"
                        value={formData.nama_orang_tua}
                        onChange={(e) => setFormData({ ...formData, nama_orang_tua: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                        Nomor WhatsApp / Telepon
                      </label>
                      <input
                        type="tel"
                        required
                        className="sf-input"
                        placeholder="Contoh: 081234567890"
                        value={formData.nomor_telepon}
                        onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    required
                    className="sf-input"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: "var(--ink-700)" }}>
                    Kata Sandi (Password)
                  </label>
                  <input
                    type="password"
                    required
                    className="sf-input"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="sf-btn-primary w-full text-white font-bold text-xs py-3 rounded-xl transition disabled:opacity-50"
                  style={{ background: "var(--teal-500)", boxShadow: "0 16px 32px -14px rgba(14,163,133,0.5)" }}
                >
                  {isLoading ? "Memproses..." : isLoginMode ? "Masuk ke Sistem AI+" : "Daftar Akun Baru"}
                </button>
              </form>

              <div className="text-center text-xs pt-2 border-t" style={{ color: "var(--ink-500)", borderColor: "var(--line)" }}>
                {isLoginMode ? (
                  <>
                    Belum punya akun?{" "}
                    <button
                      onClick={() => {
                        setIsLoginMode(false);
                        setErrorMsg("");
                      }}
                      className="font-bold hover:underline"
                      style={{ color: "var(--teal-500)" }}
                    >
                      Daftar Sekarang
                    </button>
                  </>
                ) : (
                  <>
                    Sudah punya akun?{" "}
                    <button
                      onClick={() => {
                        setIsLoginMode(true);
                        setErrorMsg("");
                      }}
                      className="font-bold hover:underline"
                      style={{ color: "var(--teal-500)" }}
                    >
                      Silakan Login
                    </button>
                  </>
                )}
                <div className="mt-3">
                  <button
                    onClick={() => setView("landing")}
                    className="font-medium hover:underline"
                    style={{ color: "var(--ink-300)" }}
                  >
                    ← Kembali ke Beranda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}