# StuntFree AI+ — Frontend

Frontend React (Vite) untuk **StuntFree AI+**, aplikasi skrining risiko stunting anak yang menampilkan hasil klasifikasi Machine Learning (XGBoost) dan konsultasi interaktif dengan **Gemma AI** — lengkap dengan chatbot gizi, dan pengingat WhatsApp otomatis ke orang tua.

Dibangun untuk **Build with Gemma AI Hackathon 2026**.

> Repo ini adalah bagian **frontend**. Untuk menjalankan aplikasi secara utuh, backend Flask (`stunfree-backend`) harus berjalan bersamaan di `http://127.0.0.1:9910`. Lihat README backend untuk setup di sisi server.

---

## ✨ Fitur Utama

| Halaman | Deskripsi |
|---|---|
| 🏠 Landing Page | Halaman perkenalan produk, metodologi sistem, dan modul ekosistem |
| 🔐 Auth Page | Login & registrasi akun orang tua (toggle satu form) |
| 📊 Dashboard | Input antropometri anak, hasil skrining ML real-time, chatbot konsultasi Gemma AI, dan widget pengingat WhatsApp |

---

## 🧱 Tech Stack

- **React** — library UI
- **Vite** — dev server & build tool
- **Tailwind CSS** — utility-first styling
- **Google Fonts** — Fraunces (display), Plus Jakarta Sans (body), JetBrains Mono (data/label)
- **Fetch API** — komunikasi ke backend Flask (`credentials: "include"` untuk session cookie)
- **IntersectionObserver** (native) — animasi scroll-reveal tanpa library tambahan

Tidak ada state management eksternal (Redux/Zustand) — state global (`user`, `view`, `childContext`) dikelola di level komponen induk (`App.jsx`) dan diturunkan lewat props.

---

## 📁 Struktur Proyek (yang relevan)

```
stuntfree-frontend/
├── src/
│   ├── App.jsx              # Mengelola state global: view aktif, user login, childContext
│   ├── LandingPage.jsx       # Halaman utama / marketing
│   ├── AuthPage.jsx          # Login & registrasi
│   ├── DashboardMain.jsx     # Dashboard skrining, chatbot, pengingat WA
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

> Ketiga halaman (`LandingPage`, `AuthPage`, `DashboardMain`) berbagi satu sistem desain yang sama — palet warna, tipografi, dan komponen animasi (`Reveal`, `.sf-*` utility classes) didefinisikan ulang secara lokal di tiap file lewat `<style>` inline agar setiap file tetap portable/berdiri sendiri.

---

## ⚙️ Instalasi & Setup

### 1. Masuk ke folder proyek
```bash
cd stuntfree-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Pastikan URL backend sudah benar
Tiap halaman yang memanggil API (`AuthPage.jsx`, `DashboardMain.jsx`) punya konstanta URL backend di bagian atas file:

```js
const API_BASE = "http://localhost:9910";
```

Sesuaikan jika backend kamu berjalan di host/port berbeda.

### 4. Jalankan dev server
```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:5173` (port default Vite).

> ⚠️ Port frontend ini **harus cocok** dengan konfigurasi CORS di backend (`origins=["http://localhost:5173"]` di `app.py`). Kalau frontend jalan di port lain, update juga konfigurasi CORS backend.

---

## 🔗 Alur Komunikasi ke Backend

| Aksi di UI | Endpoint Backend | Catatan |
|---|---|---|
| Login / Registrasi | `POST /api/login`, `POST /api/register` | Menggunakan `credentials: "include"` agar session cookie tersimpan |
| Submit form antropometri | `POST /api/predict` | Mengirim `user_id` dari state `user` yang login |
| Kirim pesan chatbot | `POST /api/chat` | Konteks anak (`nama_anak`, `usia_bulan`, `kategori`, dll) selalu ikut dikirim di body agar jawaban Gemma AI relevan |
| Generate teks pengingat manual | `POST /api/generate-reminder` | Hasil teks ditampilkan di textarea, bisa diedit sebelum dikirim manual via `wa.me` |

Pengingat WhatsApp **otomatis** (terjadwal jam 07:00) sepenuhnya berjalan di sisi backend — frontend tidak perlu memicu apa pun untuk fitur ini.

---

## 🎨 Sistem Desain

Ketiga halaman berbagi token desain yang sama:

- **Warna:** palet mint–teal (`--teal-500: #0EA385`, `--emerald-500: #10B981`, `--mint-50: #F7FEFB`, dll)
- **Tipografi:** Fraunces (heading/display), Plus Jakarta Sans (body), JetBrains Mono (label data/statistik)
- **Signature visual:** ilustrasi kurva pertumbuhan (growth-percentile curve) yang "menggambar diri sendiri" saat elemen masuk viewport — muncul di hero Landing Page dan panel Auth Page
- **Animasi:** scroll-reveal berbasis `IntersectionObserver`, hover micro-interaction pada kartu & tombol, menghormati `prefers-reduced-motion`

Kalau ingin mengubah warna brand, cari class `:root { --teal-500: ... }` di bagian `STYLES` masing-masing file — ubah di satu tempat lalu salin ke file lain agar tetap konsisten.

---

## 🛠️ Troubleshooting Umum

| Gejala | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Login berhasil tapi dashboard tidak terbuka | State `user` di `App.jsx` tidak ter-set setelah login | Pastikan `setUser(data.user)` dipanggil sebelum `setView("dashboard")` |
| Chatbot balas "koneksi terputus" | Backend Flask belum berjalan atau port salah | Cek `API_BASE` di `DashboardMain.jsx` sudah sesuai port backend |
| CORS error di console browser | Origin frontend tidak diizinkan backend | Samakan port di `CORS(app, origins=[...])` backend dengan port Vite |
| Session/cookie tidak tersimpan setelah login | `credentials: "include"` hilang di salah satu request | Pastikan semua `fetch()` ke backend menyertakan `credentials: "include"` |
| Font/animasi tidak muncul | Koneksi internet terputus saat memuat Google Fonts | `@import` Google Fonts butuh koneksi internet aktif; cek DevTools > Network |
| Tombol "Kirim via WhatsApp" tidak membuka WA | Nomor telepon kosong/format salah | Cek input nomor di widget pengingat, format akan otomatis dikonversi ke `62xxx` |

---

## 📌 Catatan Pengembangan

- Semua halaman mengasumsikan backend berjalan di `127.0.0.1` atau `localhost` — untuk deployment produksi, ganti `API_BASE`/URL fetch ke domain publik backend.
- Widget pengingat WhatsApp manual menggunakan link `wa.me` (butuh klik pengguna) sebagai pelengkap fitur pengingat otomatis di backend — tidak memerlukan konfigurasi tambahan di sisi frontend.
- Tidak ada `.env` di sisi frontend untuk saat ini karena tidak ada secret yang perlu disembunyikan (API key Gemma & token Fonnte semuanya tersimpan di backend).

---

## 👥 Tim

Dibangun untuk **Build with Gemma AI Hackathon 2026** — Tim StuntFree AI+.
