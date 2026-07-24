import React, { useEffect, useRef, useState, useCallback } from "react";

/* ==========================================================================
   DESIGN TOKENS
   Palette  : mint/teal growth-chart family (EFFCF6 → 0EA385 → 12A287)
   Display  : Fraunces (organic serif — warmth of a health/family product)
   Body     : Plus Jakarta Sans
   Data/mono: JetBrains Mono (for percentages, model output, stat readouts)
   Signature: an animated WHO-style growth-percentile curve — drawn once in
              the hero, echoed as a faint watermark in the closing CTA.
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

/* ---- reveal-on-scroll ---- */
.sf-reveal{
  opacity:0;
  transform:translateY(28px);
  transition:opacity 0.8s cubic-bezier(.16,1,.3,1), transform 0.8s cubic-bezier(.16,1,.3,1);
}
.sf-reveal.sf-in{ opacity:1; transform:translateY(0); }
.sf-reveal[data-d="1"]{ transition-delay:0.08s; }
.sf-reveal[data-d="2"]{ transition-delay:0.16s; }
.sf-reveal[data-d="3"]{ transition-delay:0.24s; }
.sf-reveal[data-d="4"]{ transition-delay:0.32s; }

@media (prefers-reduced-motion: reduce){
  .sf-reveal{ transition-duration:0.01s !important; transform:none !important; }
}

/* ---- ambient float ---- */
@keyframes sfFloat{
  0%,100%{ transform:translate(0,0) scale(1); }
  50%{ transform:translate(-10px,-18px) scale(1.04); }
}
.sf-float{ animation:sfFloat 9s ease-in-out infinite; }
.sf-float-slow{ animation:sfFloat 14s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce){
  .sf-float, .sf-float-slow{ animation:none; }
}

/* ---- growth curve draw ---- */
.sf-curve-path{
  stroke-dasharray:900;
  stroke-dashoffset:900;
  transition:stroke-dashoffset 2.1s cubic-bezier(.16,1,.3,1);
}
.sf-in .sf-curve-path{ stroke-dashoffset:0; }

/* ---- moving marker along curve ---- */
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

/* ---- nav scroll state ---- */
.sf-nav{ transition:box-shadow 0.35s ease, background-color 0.35s ease, border-color .35s ease; }
.sf-nav-scrolled{
  background-color:rgba(247,254,251,0.92) !important;
  box-shadow:0 8px 30px -12px rgba(10,46,38,0.18);
  border-color:var(--line) !important;
}

/* ---- card hover lift ---- */
.sf-card{ transition:transform .45s cubic-bezier(.16,1,.3,1), box-shadow .45s ease, border-color .45s ease; }
.sf-card:hover{ transform:translateY(-6px); box-shadow:0 24px 48px -20px rgba(10,46,38,0.18); border-color:var(--teal-500); }

/* ---- underline hover for nav links ---- */
.sf-link{ position:relative; }
.sf-link::after{
  content:"";
  position:absolute; left:0; bottom:-4px;
  width:0; height:2px;
  background:var(--teal-500);
  transition:width .3s ease;
}
.sf-link:hover::after{ width:100%; }

/* ---- primary button shine ---- */
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

/* ---- timeline connector ---- */
.sf-timeline-line{
  background:repeating-linear-gradient(90deg, var(--teal-500) 0 10px, transparent 10px 18px);
}

/* ---- mobile menu ---- */
.sf-mobile-menu{
  max-height:0; overflow:hidden;
  transition:max-height .45s ease;
}
.sf-mobile-menu.sf-open{ max-height:280px; }

/* ---- watermark curve in CTA ---- */
.sf-watermark{ opacity:0.08; }
`;

/* Hook: mark element visible once it enters viewport */
function useReveal() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.18 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

function Reveal({ as: Tag = "div", delay, className = "", children, ...rest }) {
  const [ref, inView] = useReveal();
  return (
    <Tag
      ref={ref}
      data-d={delay}
      className={`sf-reveal ${inView ? "sf-in" : ""} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* Signature growth-curve illustration used in the hero */
function GrowthCurveArt({ className = "" }) {
  const [ref, inView] = useReveal();
  return (
    <svg
      ref={ref}
      viewBox="0 0 420 220"
      className={`${inView ? "sf-in" : ""} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* percentile band (context lines) */}
      <path d="M8,190 C120,175 200,120 410,150" stroke="#CFF1E3" strokeWidth="2" />
      <path d="M8,170 C120,150 210,95 410,80" stroke="#CFF1E3" strokeWidth="2" />
      {/* main growth curve — the signature element */}
      <path
        className="sf-curve-path"
        d="M8,150 C 100,140 150,60 230,72 C 310,84 330,150 410,110"
        stroke="url(#sfGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="sfGrad" x1="0" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA385" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>
      {/* traveling marker dot */}
      <circle className="sf-curve-dot" r="6" fill="#12A287" />
    </svg>
  );
}

export default function LandingPage({ user, setView }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigation = useCallback(() => {
    setView(user ? "dashboard" : "auth");
  }, [user, setView]);

  const navLinks = [
    { href: "#fitur", label: "Fitur Utama" },
    { href: "#alur", label: "Metodologi" },
    { href: "#dampak", label: "Dampak Sosial" },
  ];

  return (
    <div className="sf-root min-h-screen antialiased selection:bg-teal-500 selection:text-white">
      <style>{FONT_IMPORT}</style>
      <style>{STYLES}</style>

      {/* ============ HEADER / NAVBAR ============ */}
      <header
        className={`sf-nav fixed top-0 left-0 w-full z-50 border-b ${
          scrolled ? "sf-nav-scrolled" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
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

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold" style={{ color: "var(--ink-700)" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="sf-link">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={handleNavigation}
              className="hidden sm:flex sf-btn-primary text-white text-sm font-bold px-5 py-2.5 rounded-xl transition items-center gap-2 group"
              style={{ background: "var(--ink-900)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--teal-500)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ink-900)")}
            >
              {user ? "Buka Dashboard" : "Masuk Aplikasi"}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            {/* mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border"
              style={{ borderColor: "var(--line)" }}
              aria-label="Buka menu"
            >
              <div className="space-y-1.5">
                <span
                  className="block w-5 h-0.5 rounded-full transition-transform"
                  style={{ background: "var(--ink-900)", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }}
                />
                <span
                  className="block w-5 h-0.5 rounded-full transition-opacity"
                  style={{ background: "var(--ink-900)", opacity: menuOpen ? 0 : 1 }}
                />
                <span
                  className="block w-5 h-0.5 rounded-full transition-transform"
                  style={{ background: "var(--ink-900)", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }}
                />
              </div>
            </button>
          </div>
        </div>

        {/* mobile dropdown */}
        <div className={`md:hidden sf-mobile-menu ${menuOpen ? "sf-open" : ""} bg-white border-t`} style={{ borderColor: "var(--line)" }}>
          <div className="px-4 py-4 flex flex-col gap-4 text-sm font-semibold" style={{ color: "var(--ink-700)" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleNavigation();
              }}
              className="text-white text-sm font-bold px-5 py-3 rounded-xl"
              style={{ background: "var(--teal-500)" }}
            >
              {user ? "Buka Dashboard" : "Masuk Aplikasi"} →
            </button>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* ambient background shapes */}
        <div
          className="sf-float absolute -top-10 -left-10 w-72 h-72 rounded-full blur-3xl -z-10"
          style={{ background: "radial-gradient(circle, rgba(14,163,133,0.18), transparent 70%)" }}
        />
        <div
          className="sf-float-slow absolute top-40 right-0 w-96 h-96 rounded-full blur-3xl -z-10"
          style={{ background: "radial-gradient(circle, rgba(82,195,166,0.20), transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            <Reveal
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{ background: "var(--mint-100)", borderColor: "var(--line)", color: "var(--teal-600)" }}
            >
              ✨ Build with Gemma AI Hackathon 2026
            </Reveal>

            <Reveal delay="1" as="h1" className="sf-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.08]" style={{ color: "var(--ink-900)" }}>
              Deteksi Risiko Stunting <br className="hidden sm:inline" />
              <span
                className="italic"
                style={{
                  background: "linear-gradient(90deg,#0EA385,#12A287,#10B981)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                dengan Lapisan Penalaran AI
              </span>
            </Reveal>

            <Reveal delay="2" as="p" className="text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed" style={{ color: "var(--ink-500)" }}>
              Menggabungkan presisi diagnosis prediktif model <strong style={{ color: "var(--ink-700)" }}>XGBoost (WHO &amp; Kemenkes RI)</strong> dengan kecerdasan generatif <strong style={{ color: "var(--ink-700)" }}>Gemma AI</strong> untuk melahirkan penjelasan hangat serta aksi intervensi nyata.
            </Reveal>

            <Reveal delay="3" className="flex flex-wrap justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={handleNavigation}
                className="sf-btn-primary text-white font-bold px-8 py-4 rounded-2xl transition text-sm sm:text-base"
                style={{ background: "var(--teal-500)", boxShadow: "0 16px 32px -12px rgba(14,163,133,0.45)" }}
              >
                {user ? "Pergi ke Dashboard" : "Mulai Skrining Sekarang"}
              </button>
              <a
                href="#fitur"
                className="border font-bold px-8 py-4 rounded-2xl transition text-sm sm:text-base flex items-center justify-center"
                style={{ borderColor: "var(--line)", color: "var(--ink-700)", background: "white" }}
              >
                Pelajari Fitur
              </a>
            </Reveal>
          </div>

          {/* Signature visual: growth-curve diagnostic card */}
          <div className="lg:col-span-5 relative flex justify-center">
            <Reveal
              delay="2"
              className="p-6 rounded-3xl shadow-xl border max-w-sm w-full space-y-4"
              style={{ background: "white", borderColor: "var(--line)" }}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-widest sf-mono" style={{ color: "var(--ink-300)" }}>
                  Diagnosis Sistem
                </span>
                <span className="px-3 py-1 text-white font-extrabold rounded-full text-[10px]" style={{ background: "#F5A524" }}>
                  Risiko Stunting
                </span>
              </div>

              <GrowthCurveArt className="w-full h-auto" />

              <div className="flex items-center justify-between text-[10px] sf-mono" style={{ color: "var(--ink-300)" }}>
                <span>0 bln</span>
                <span>12 bln</span>
                <span>24 bln</span>
                <span>36 bln</span>
              </div>

              <div
                className="p-3 rounded-2xl text-[11px] leading-relaxed"
                style={{ background: "var(--mint-100)", border: "1px solid var(--line)", color: "var(--ink-700)" }}
              >
                <span className="font-bold block mb-1" style={{ color: "var(--ink-900)" }}>🤖 Penalaran Asisten Gemma:</span>
                {"\"Tinggi badan si kecil berada di ambang batas bawah. Disarankan menambahkan porsi protein hewani (1 butir telur harian) selama 4 bulan ke depan...\""}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ METODOLOGI ============ */}
      <section id="alur" className="py-20 border-y" style={{ background: "white", borderColor: "var(--line)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest sf-mono" style={{ color: "var(--teal-500)" }}>
              Kerangka Kerja Sistem
            </h2>
            <p className="sf-display text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
              Paradigma Baru: Input → Penalaran → Output → Aksi
            </p>
            <p className="text-sm" style={{ color: "var(--ink-300)" }}>
              Bagaimana StuntFree AI+ mengeksekusi data menjadi tindakan nyata di lapangan.
            </p>
          </Reveal>

          <div className="relative">
            <div className="hidden md:block absolute top-4 left-[12.5%] right-[12.5%] h-[2px] sf-timeline-line" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {[
                { n: "1", title: "Input Data", desc: "Kader posyandu memasukkan data usia, berat, dan tinggi badan anak secara instan.", tone: "neutral" },
                { n: "2", title: "Penalaran (Reasoning)", desc: "Model XGBoost memprediksi risiko, dilanjutkan model Gemma AI yang merasionalkan alasan medisnya.", tone: "teal" },
                { n: "3", title: "Output Konseptual", desc: "Menampilkan metrik waktu pemulihan anak serta narasi kesehatan komprehensif bahasa awam.", tone: "neutral" },
                { n: "4", title: "Aksi Nyata (Intervensi)", desc: "Otomatisasi perancangan menu makan murah berbasis pangan lokal dan trigger pesan WhatsApp ke orang tua.", tone: "emerald" },
              ].map((step, i) => (
                <Reveal key={step.n} delay={String(i + 1)}>
                  <div
                    className="sf-card p-6 rounded-2xl border relative h-full"
                    style={{
                      background: step.tone === "teal" ? "rgba(14,163,133,0.06)" : step.tone === "emerald" ? "rgba(16,185,129,0.06)" : "var(--mint-50)",
                      borderColor: "var(--line)",
                    }}
                  >
                    <span
                      className="absolute -top-4 left-6 w-8 h-8 text-white rounded-xl font-black flex items-center justify-center text-sm sf-mono"
                      style={{ background: step.tone === "teal" ? "var(--teal-500)" : step.tone === "emerald" ? "var(--emerald-500)" : "var(--ink-900)" }}
                    >
                      {step.n}
                    </span>
                    <h3 className="font-bold mt-2 mb-1" style={{ color: "var(--ink-900)" }}>{step.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--ink-500)" }}>{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ FITUR UTAMA ============ */}
      <section id="fitur" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 sf-mono" style={{ color: "var(--emerald-500)" }}>
            Modul Ekosistem
          </h2>
          <p className="sf-display text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
            Empat Pilar Solusi Pencegahan Stunting
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "📊", title: "Skrining & Explainer AI", desc: "Klasifikasi status gizi anak akurat yang diperjelas dengan kecerdasan generatif bahasa natural.", tone: "var(--teal-500)" },
            { icon: "💬", title: "Asisten Konsultasi Live", desc: "Chatbot gizi responsif yang siap melayani pertanyaan seputar pola asuh anak kapan saja.", tone: "#6366F1" },
            { icon: "📸", title: "Analisis Foto Makanan", desc: "Unggah foto MPASI untuk mendeteksi kelayakan kandungan kalori dan variasi nutrisi makro.", tone: "#F5A524" },
            { icon: "🥦", title: "Menu Pangan Lokal & WA", desc: "Pembuatan rencana belanja hemat dan otomasi blast pesan pengingat jadwal posyandu.", tone: "var(--emerald-500)" },
          ].map((f, i) => (
            <Reveal key={f.title} delay={String(i + 1)}>
              <div className="sf-card p-6 rounded-2xl border h-full" style={{ background: "white", borderColor: "var(--line)" }}>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg mb-4 transition-colors"
                  style={{ background: `${f.tone}1A`, color: f.tone }}
                >
                  {f.icon}
                </div>
                <h4 className="font-bold mb-2 text-sm" style={{ color: "var(--ink-900)" }}>{f.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: "var(--ink-300)" }}>{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA PENUTUP ============ */}
      <section
        id="dampak"
        className="relative py-20 px-4 text-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, var(--ink-900), #0A3B31)" }}
      >
        {/* watermark of the signature curve */}
        <svg
          className="sf-watermark absolute inset-x-0 bottom-0 w-full h-40"
          viewBox="0 0 420 220"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M8,150 C 100,140 150,60 230,72 C 310,84 330,150 410,110"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        <Reveal className="max-w-4xl mx-auto space-y-6 relative z-10">
          <p className="sf-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Siap Melakukan Demonstrasi Aplikasi?
          </p>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--mint-150)" }}>
            Masuk ke dasbor utama untuk mensimulasikan data secara langsung di hadapan para dewan juri hackathon.
          </p>

          {user ? (
            <button
              onClick={() => setView("dashboard")}
              className="sf-btn-primary px-6 py-3 text-white font-bold text-xs rounded-xl shadow-md transition"
              style={{ background: "var(--emerald-500)" }}
            >
              Masuk ke Dashboard ({user.nama_orang_tua}) →
            </button>
          ) : (
            <button
              onClick={() => setView("auth")}
              className="sf-btn-primary px-8 py-3 text-white font-bold text-xs rounded-xl shadow-md transition"
              style={{ background: "var(--teal-500)" }}
            >
              🔐 Masuk / Login Aplikasi
            </button>
          )}
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-8 border-t text-center text-xs font-medium" style={{ background: "white", borderColor: "var(--line)", color: "var(--ink-300)" }}>
        © 2026 Tim StuntFree AI+ • Build with Gemma AI Hackathon Jakarta. All Rights Reserved.
      </footer>
    </div>
  );
}