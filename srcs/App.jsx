import { useState } from "react";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import DashboardMain from "./components/DashboardMain";

export default function App() {
  // State navigasi halaman: 'landing' | 'auth' | 'dashboard'
  const [view, setView] = useState("landing");
  
  // State penampung data session user dari SQLite
  const [user, setUser] = useState(null);

  // State global rekam medis anak untuk sinkronisasi antarmuka AI
  const [childContext, setChildContext] = useState({
    nama_anak: "",
    jenis_kelamin: "Laki-laki",
    usia_bulan: "",
    berat_kg: "",
    tinggi_cm: "",
    kategori: "",
    waktu_pemulihan: ""
  });

  // Fungsi penanganan operasi Logout
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:9910/api/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (err) {
      console.error("Gagal kontak server saat logout:", err);
    }
    setUser(null);
    setView("landing");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 🏛️ TAMPILAN 1: LANDING PAGE */}
      {view === "landing" && (
        <LandingPage user={user} setView={setView} />
      )}

      {/* 🏛️ TAMPILAN 2: HALAMAN AUTH LOGIN & REGISTER */}
      {view === "auth" && (
        <AuthPage setUser={setUser} setView={setView} />
      )}

      {/* 🏛️ TAMPILAN 3: DASHBOARD UTAMA */}
      {view === "dashboard" && (
        <DashboardMain 
          user={user}
          childContext={childContext}
          setChildContext={setChildContext}
          onLogout={handleLogout}
          setView={setView}
        />
      )}

    </div>
  );
}