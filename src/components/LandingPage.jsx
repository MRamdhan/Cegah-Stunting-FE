import React, { useEffect, useRef, useState, useCallback } from "react";

/* ==========================================================================
   DESIGN TOKENS — v2
   Palette  : clinical paper + indigo/coral (FAF9F5 → 4F46E5 → FF6B4A)
   Display  : Space Grotesk (geometric, confident — a data/report voice)
   Body     : Inter
   Data/mono: IBM Plex Mono (stat readouts, labels, report numbering)
   Layout   : report-style — hairline rules, numbered sections, a vitals
              bento grid as the signature instead of a single floating card.
   ========================================================================== */

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

const STYLES = `
:root{
  --paper:#FAF9F5;
  --paper-alt:#F1EEE4;
  --paper-deep:#E9E4D6;
  --accent:#4F46E5;
  --accent-dark:#3730A3;
  --coral:#FF6B4A;
  --ink-900:#14121F;
  --ink-700:#3D3A52;
  --ink-500:#6B6780;
  --ink-300:#9C97AD;
  --line:#E1DCCB;
}

.sf-root{
  background:var(--paper);
  color:var(--ink-900);
  font-family:'Inter', sans-serif;
  -webkit-font-smoothing:antialiased;
}
.sf-display{ font-family:'Space Grotesk', sans-serif; }
.sf-mono{ font-family:'IBM Plex Mono', monospace; letter-spacing:0.02em; }

.sf-reveal{
  opacity:0;
  transform:translateY(20px);
  transition:opacity 0.7s cubic-bezier(.16,1,.3,1), transform 0.7s cubic-bezier(.16,1,.3,1);
}
.sf-reveal.sf-in{ opacity:1; transform:translateY(0); }
.sf-reveal[data-d="1"]{ transition-delay:0.08s; }
.sf-reveal[data-d="2"]{ transition-delay:0.16s; }
.sf-reveal[data-d="3"]{ transition-delay:0.24s; }
.sf-reveal[data-d="4"]{ transition-delay:0.32s; }

@media (prefers-reduced-motion: reduce){
  .sf-reveal{ transition-duration:0.01s !important; transform:none !important; }
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

.sf-nav{ transition:background-color 0.3s ease, border-color .3s ease; }

.sf-card{ transition:transform .35s cubic-bezier(.16,1,.3,1), border-color .35s ease; }
.sf-card:hover{ transform:translateY(-3px); border-color:var(--accent); }

.sf-link{ position:relative; }
.sf-link::after{
  content:"";
  position:absolute; left:0; bottom:-4px;
  width:0; height:1px;
  background:var(--ink-900);
  transition:width .3s ease;
}
.sf-link:hover::after{ width:100%; }

.sf-btn-primary{ position:relative; overflow:hidden; }
.sf-btn-primary::before{
  content:"";
  position:absolute; top:0; left:-60%;
  width:40%; height:100%;
  background:linear-gradient(120deg, transparent, rgba(255,255,255,0.28), transparent);
  transform:skewX(-20deg);
  transition:left .7s ease;
}
.sf-btn-primary:hover::before{ left:130%; }

.sf-mobile-menu{
  max-height:0; overflow:hidden;
  transition:max-height .4s ease;
}
.sf-mobile-menu.sf-open{ max-height:280px; }

.sf-grid-dark{
  background-image:
    linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
  background-size: 42px 42px;
}
`;

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
      <path d="M8,190 C120,175 200,120 410,150" stroke="#E1DCCB" strokeWidth="2" />
      <path d="M8,170 C120,150 210,95 410,80" stroke="#E1DCCB" strokeWidth="2" />
      <path
        className="sf-curve-path"
        d="M8,150 C 100,140 150,60 230,72 C 310,84 330,150 410,110"
        stroke="url(#sfGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="sfGrad" x1="0" y1="0" x2="420" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#FF6B4A" />
        </linearGradient>
      </defs>
      <circle className="sf-curve-dot" r="6" fill="#3730A3" />
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
    { href: "#kenali", label: "Apa itu Stunting" },
    { href: "#pencegahan", label: "Cara Mencegah" },
    { href: "#dampak", label: "Ikut Sosialisasi" },
  ];

  const vitals = [
    { label: "Prevalensi Stunting Nasional", value: "19,8%", note: "SSGI 2024, Kemenkes RI" },
    { label: "Balita Terdampak", value: "1 dari 5", note: "anak balita di Indonesia" },
    { label: "Target Penurunan", value: "14,2%", note: "RPJMN, ditargetkan 2029" },
  ];

  return (
    <div className="sf-root min-h-screen antialiased selection:bg-[#4F46E5] selection:text-white">
      <style>{FONT_IMPORT}</style>
      <style>{STYLES}</style>

      {/* ============ HEADER / NAVBAR ============ */}
      <header
        className={`sf-nav fixed top-0 left-0 w-full z-50 border-b ${
          scrolled ? "bg-[color:var(--paper)]/95 border-[color:var(--line)]" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-base font-bold tracking-tight block leading-none sf-display" style={{ color: "var(--ink-900)" }}>
                Stunting
              </span>
              <span className="text-[9px] font-semibold tracking-widest uppercase sf-mono" style={{ color: "var(--ink-300)" }}>
                Sosialisasi & Edukasi Cegah Stunting
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-semibold" style={{ color: "var(--ink-700)" }}>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="sf-link">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                window.location.href = "https://cegah-stunting.streamlit.app/";
              }}
              className="hidden sm:flex sf-btn-primary text-sm font-bold px-5 py-2.5 border transition items-center gap-2 group"
              style={{ borderColor: "var(--ink-900)", color: "var(--ink-900)" }}
            >
              {"Masuk Aplikasi"}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center border"
              style={{ borderColor: "var(--line)" }}
              aria-label="Buka menu"
            >
              <div className="space-y-1.5">
                <span
                  className="block w-5 h-0.5 transition-transform"
                  style={{ background: "var(--ink-900)", transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }}
                />
                <span
                  className="block w-5 h-0.5 transition-opacity"
                  style={{ background: "var(--ink-900)", opacity: menuOpen ? 0 : 1 }}
                />
                <span
                  className="block w-5 h-0.5 transition-transform"
                  style={{ background: "var(--ink-900)", transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }}
                />
              </div>
            </button>
          </div>
        </div>

        <div className={`md:hidden sf-mobile-menu ${menuOpen ? "sf-open" : ""} bg-[color:var(--paper)] border-t`} style={{ borderColor: "var(--line)" }}>
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
              className="text-white text-sm font-bold px-5 py-3"
              style={{ background: "var(--accent)" }}
            >
              {user ? "Buka Dashboard" : "Masuk Aplikasi"} →
            </button>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-32 pb-16 lg:pt-40 lg:pb-24 px-4 sm:px-6 lg:px-8 border-b" style={{ borderColor: "var(--line)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8 space-y-6">
              <Reveal
                className="inline-flex items-center gap-2 text-[11px] font-bold sf-mono uppercase tracking-widest"
                style={{ color: "var(--accent)" }}
              >
                — Sosialisasi Cegah Stunting 2026
              </Reveal>

              <Reveal delay="1" as="h1" className="sf-display text-4xl sm:text-5xl lg:text-[3.6rem] font-semibold tracking-tight leading-[1.05]" style={{ color: "var(--ink-900)" }}>
                Stunting bisa dicegah, jika dikenali sejak dini.
              </Reveal>

              <Reveal delay="2" as="p" className="text-base sm:text-lg max-w-2xl leading-relaxed" style={{ color: "var(--ink-500)" }}>
                Stunting adalah gagal tumbuh pada anak akibat kekurangan gizi kronis, terutama pada <strong style={{ color: "var(--ink-700)" }}>1.000 Hari Pertama Kehidupan</strong>. Dampaknya bukan cuma tinggi badan — tapi juga kecerdasan dan masa depan anak. Yuk, kenali tanda dan cara mencegahnya bersama.
              </Reveal>

              <Reveal delay="3" className="flex flex-wrap gap-4 pt-2">
                <button
                    onClick={() => {
                      window.location.href = "https://cegah-stunting.streamlit.app/";
                    }}
                    className="sf-btn-primary px-8 py-3 text-white font-bold text-xs transition"
                    style={{ background: "var(--accent)" }}
                  >
                    Cek Status Gizi Anak →
                  </button>

                <a
                  href="#"
                  className="border font-bold px-8 py-4 transition text-sm sm:text-base flex items-center justify-center"
                  style={{ borderColor: "var(--ink-900)", color: "var(--ink-900)" }}
                >
                  Pelajari Stunting
                </a>
              </Reveal>
            </div>

            <div className="lg:col-span-4 flex lg:justify-end">
              <Reveal delay="2" className="sf-mono text-[11px] uppercase tracking-widest text-right" style={{ color: "var(--ink-300)" }}>
                Materi sosialisasi — sumber data Kemenkes RI & WHO
              </Reveal>
            </div>
          </div>

          {/* Signature visual: data stunting nasional, bento grid */}
          <Reveal delay="4" className="mt-14 grid grid-cols-1 sm:grid-cols-3 border-t border-l" style={{ borderColor: "var(--line)" }}>
            {vitals.map((v) => (
              <div key={v.label} className="border-r border-b p-6" style={{ borderColor: "var(--line)" }}>
                <span className="text-[10px] font-bold uppercase tracking-widest sf-mono block mb-3" style={{ color: "var(--ink-300)" }}>
                  {v.label}
                </span>
                <span className="sf-display text-3xl font-semibold block" style={{ color: v === vitals[0] ? "var(--accent)" : "var(--ink-900)" }}>
                  {v.value}
                </span>
                <span className="text-[11px] block mt-1" style={{ color: "var(--ink-500)" }}>{v.note}</span>
              </div>
            ))}
            <div className="border-r border-b p-6 flex flex-col justify-between" style={{ borderColor: "var(--line)" }}>
              <span className="text-[10px] font-bold uppercase tracking-widest sf-mono block mb-2" style={{ color: "var(--ink-300)" }}>
                Kurva Pertumbuhan Anak
              </span>
              <GrowthCurveArt className="w-full h-auto" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ APA ITU STUNTING ============ */}
      <section id="kenali" className="py-20" style={{ background: "var(--paper-alt)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest sf-mono" style={{ color: "var(--accent)" }}>
              Apa Itu Stunting?
            </h2>
            <p className="sf-display text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
              Gagal tumbuh akibat gizi kronis, bukan sekadar "pendek"
            </p>
            <p className="text-sm max-w-2xl leading-relaxed pt-2" style={{ color: "var(--ink-500)" }}>
              Stunting adalah kondisi gagal tumbuh pada anak balita akibat kekurangan gizi kronis dan infeksi berulang, terutama dalam 1.000 Hari Pertama Kehidupan (sejak dalam kandungan hingga usia 2 tahun). Anak dikategorikan stunting bila tinggi badannya menurut usia berada jauh di bawah standar pertumbuhan WHO.
            </p>
          </Reveal>

          <div className="border-t" style={{ borderColor: "var(--line)" }}>
            {[
              { n: "01", title: "Asupan Gizi Tidak Cukup", desc: "Ibu hamil dan anak tidak mendapat protein, zat besi, dan mikronutrien yang cukup sejak masa kehamilan hingga masa MPASI." },
              { n: "02", title: "Infeksi Berulang", desc: "Diare, ISPA, dan infeksi cacing yang sering terjadi menghambat penyerapan gizi dan menguras energi tubuh anak." },
              { n: "03", title: "Sanitasi & Air Bersih Buruk", desc: "Lingkungan tanpa akses air bersih dan jamban sehat meningkatkan risiko infeksi yang memicu gagal tumbuh." },
              { n: "04", title: "Pola Asuh & Pengetahuan Gizi", desc: "Kurangnya edukasi ASI eksklusif, MPASI bergizi, dan pemantauan tumbuh kembang membuat tanda stunting terlambat dikenali." },
            ].map((step, i) => (
              <Reveal key={step.n} delay={String(i + 1)} className="sf-card grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-8 py-7 border-b items-start" style={{ borderColor: "var(--line)" }}>
                <span className="sm:col-span-1 sf-mono text-sm font-semibold" style={{ color: "var(--accent)" }}>{step.n}</span>
                <h3 className="sm:col-span-3 font-bold sf-display text-lg" style={{ color: "var(--ink-900)" }}>{step.title}</h3>
                <p className="sm:col-span-8 text-sm leading-relaxed" style={{ color: "var(--ink-500)" }}>{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ DAMPAK JANGKA PANJANG ============ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 sf-mono" style={{ color: "var(--coral)" }}>
            Kenapa Harus Diwaspadai
          </h2>
          <p className="sf-display text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
            Dampak stunting berlanjut hingga dewasa
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px" style={{ background: "var(--line)" }}>
          {[
            { icon: "🧠", title: "Kecerdasan Terhambat", desc: "Perkembangan otak yang tidak optimal menurunkan kemampuan belajar dan prestasi akademik anak." },
            { icon: "🩺", title: "Rentan Penyakit Kronis", desc: "Risiko diabetes, obesitas, dan penyakit jantung meningkat saat anak stunting tumbuh dewasa." },
            { icon: "📉", title: "Produktivitas Menurun", desc: "Studi Bank Dunia menunjukkan stunting dapat menurunkan produktivitas ekonomi hingga 11% PDB suatu negara." },
          ].map((f, i) => (
            <Reveal key={f.title} delay={String(i + 1)} className="sf-card p-7" style={{ background: "var(--paper)" }}>
              <div
                className="w-10 h-10 flex items-center justify-center font-bold text-base mb-4"
                style={{ background: "rgba(255,107,74,0.1)", color: "var(--coral)" }}
              >
                {f.icon}
              </div>
              <h4 className="font-bold mb-2 text-sm sf-display" style={{ color: "var(--ink-900)" }}>{f.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-500)" }}>{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CARA PENCEGAHAN ============ */}
      <section id="pencegahan" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ background: "var(--paper-alt)" }}>
        <Reveal className="max-w-2xl mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-2 sf-mono" style={{ color: "var(--coral)" }}>
            Langkah Nyata
          </h2>
          <p className="sf-display text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: "var(--ink-900)" }}>
            Empat pilar utama pencegahan stunting
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-px" style={{ background: "var(--line)" }}>
          {[
            { icon: "🤱", title: "ASI Eksklusif 6 Bulan", desc: "Berikan ASI saja tanpa makanan/minuman tambahan sejak lahir hingga usia 6 bulan untuk fondasi gizi terbaik.", tone: "var(--accent)", span: "lg:col-span-4" },
            { icon: "🥣", title: "MPASI Bergizi Seimbang", desc: "Lanjutkan dengan makanan pendamping ASI yang cukup protein hewani, sayur, dan buah mulai usia 6 bulan.", tone: "#0EA5E9", span: "lg:col-span-2" },
            { icon: "📏", title: "Rutin ke Posyandu", desc: "Pantau berat dan tinggi badan anak tiap bulan agar tanda gagal tumbuh terdeteksi sejak dini.", tone: "#F5A524", span: "lg:col-span-2" },
            { icon: "🚰", title: "Sanitasi & Air Bersih", desc: "Pastikan keluarga memiliki akses jamban sehat dan air bersih untuk mencegah infeksi berulang pada anak.", tone: "var(--coral)", span: "lg:col-span-4" },
          ].map((f, i) => (
            <Reveal key={f.title} delay={String(i + 1)} className={`sf-card p-7 ${f.span}`} style={{ background: "var(--paper)" }}>
              <div
                className="w-10 h-10 flex items-center justify-center font-bold text-base mb-4"
                style={{ background: `${f.tone}1A`, color: f.tone }}
              >
                {f.icon}
              </div>
              <h4 className="font-bold mb-2 text-sm sf-display" style={{ color: "var(--ink-900)" }}>{f.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "var(--ink-500)" }}>{f.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA PENUTUP ============ */}
      <section
        id="dampak"
        className="sf-grid-dark relative py-24 px-4 text-center overflow-hidden"
        style={{ background: "var(--ink-900)" }}
      >
        <Reveal className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-[11px] font-bold sf-mono uppercase tracking-widest" style={{ color: "var(--coral)" }}>
            — Ayo Bergerak Bersama
          </span>
          <p className="sf-display text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Cegah stunting, mulai dari keluarga Anda.
          </p>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "#C9C4DC" }}>
            Gunakan kalkulator status gizi gratis kami untuk mengecek pertumbuhan si kecil, dan dapatkan penjelasan yang mudah dipahami sebagai bagian dari sosialisasi cegah stunting.
          </p>

          <button
            onClick={() => {
              window.location.href = "https://cegah-stunting.streamlit.app/";
            }}
            className="sf-btn-primary px-8 py-3 text-white font-bold text-xs transition"
            style={{ background: "var(--accent)" }}
          >
            Cek Status Gizi Anak →
          </button>
        </Reveal>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-8 border-t text-center text-xs font-medium sf-mono" style={{ background: "var(--paper)", borderColor: "var(--line)", color: "var(--ink-300)" }}>
        © 2026 Tim Gunung Malang • Materi Sosialisasi Cegah Stunting. Sumber data: Kemenkes RI (SSGI 2024).
      </footer>
    </div>
  );
}
