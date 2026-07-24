import { useState } from "react";
import LandingPage from "./components/LandingPage";

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


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* 🏛️ TAMPILAN 1: LANDING PAGE */}
      {view === "landing" && (
        <LandingPage user={user} setView={setView} />
      )}
    </div>
  );
}