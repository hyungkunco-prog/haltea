# 📱 Panduan Install Aplikasi HALTEA di PC (.exe) & HP (Android & iPhone)

Aplikasi **HALTEA** kini sudah siap dan dikonfigurasi untuk diinstal di seluruh perangkat:

---

## 1. 📲 Cara Pasang di HP (Android & iPhone) — Langsung & Gratis (PWA)
Tidak perlu download software berat, aplikasi langsung menjadi **App Fullscreen** di layar utama HP Anda.

### Untuk Android (Google Chrome):
1. Buka link web HALTEA di Google Chrome HP.
2. Klik tombol **Titik Tiga (⋮)** di pojok kanan atas browser.
3. Pilih menu **"Install Aplikasi"** atau **"Tambahkan ke Layar Utama"**.
4. Klik **Install**.
5. Ikon **HALTEA** akan muncul di menu HP Anda dan berjalan seperti aplikasi Android asli (fullscreen tanpa url bar).

### Untuk iPhone / iPad (Safari):
1. Buka link web HALTEA di browser **Safari**.
2. Klik tombol **Share** (ikon kotak tanda panah ke atas di bagian bawah).
3. Gulir ke bawah dan pilih **"Tambahkan ke Layar Utama" (Add to Home Screen)**.
4. Klik **Tambah (Add)** di pojok kanan atas.
5. Ikon **HALTEA** akan otomatis terpasang di homescreen iPhone.

---

## 2. 💻 Cara Pasang di Laptop / PC Windows (.exe) — Electron

Aplikasi bisa dibungkus menjadi file installer `.exe` untuk Windows:

### A. Menjalankan Aplikasi Desktop (Development Mode):
Buka terminal / PowerShell di folder project, lalu jalankan:
```bash
npm run electron:start
```

### B. Membuat File Installer Windows (`.exe`):
Jalankan perintah berikut di terminal:
```bash
npm run electron:dist
```
File installer `.exe` akan otomatis terbentuk di dalam folder:
📁 `haltea/dist/HALTEA POS Setup 1.0.0.exe`

---

## 3. 🤖 Cara Membuat File APK Android (.apk) — Capacitor

Jika ingin membagikan file mentah `.apk` langsung ke kasir:

### Langkah-langkah:
1. Pastikan **Node.js** dan **Android Studio** sudah terinstal di PC.
2. Buat folder proyek Android (cukup sekali):
   ```bash
   npm run cap:add:android
   ```
3. Sinkronkan file web ke Android:
   ```bash
   npm run cap:sync
   ```
4. Buka proyek di Android Studio:
   ```bash
   npm run cap:open:android
   ```
5. Di Android Studio, klik menu **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
6. File `.apk` siap diinstal di semua smartphone Android.
