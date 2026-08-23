# HALTEA - Sistem Prediksi Stok Bahan Baku & POS (Node.js Fullstack)

HALTEA adalah sistem informasi manajemen inventaris, kasir (POS), dan peramalan/prediksi kebutuhan stok bahan baku berbasis web untuk usaha minuman Haltea yang ditenagai oleh **Node.js (Express.js)**.

---

## 🚀 Fitur Utama

- **Dashboard & Analitik**: Omzet real-time, stok kritis, dan grafik statistik.
- **Manajemen Kasir (POS)**: Pencatatan pesanan minuman, kalkulasi cepat, dan **pengurangan otomatis stok bahan baku** sesuai takaran/resep menu.
- **Prediksi Stok Bahan Baku (SES & WMAPE)**: Perhitungan proyeksi dan peramalan kebutuhan stok 6 hari operasional pekan berikutnya menggunakan metode *Single Exponential Smoothing (SES)* dengan pencarian parameter $\alpha$ optimal dan evaluasi *WMAPE*.
- **Safety Stock & Reorder Point (ROP)**: Rekomendasi belanja bahan baku berdasarkan *Lead Time* dan *Safety Stock*.
- **Manajemen Resep & Takaran**: Pengaturan gramasi bahan baku per menu.
- **Import / Export Transaksi Excel**: Dukungan upload file `.xlsx` untuk rekapitulasi data penjualan.

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: Node.js, Express.js, MySQL2, JWT Authentication, Multer, XLSX
- **Frontend**: Single Page Application (SPA), HTML5, Tailwind CSS, Chart.js, Vanilla JavaScript
- **Database**: MySQL / MariaDB

---

## 💻 Petunjuk Menjalankan Secara Lokal

1. **Clone Repository**
   ```bash
   git clone https://github.com/hyungkunco-prog/haltea.git
   cd haltea
   ```

2. **Install Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Database (.env)**
   Salin `.env.example` ke `.env` dan sesuaikan koneksi MySQL Anda:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=3307
   DB_USER=root
   DB_PASS=
   DB_NAME=haltea_db
   JWT_SECRET=haltea-super-secret-key-2026
   ```

4. **Import Database**
   Import file `haltea_db.sql` ke database MySQL Anda (misal melalui phpMyAdmin).

5. **Jalankan Aplikasi**
   ```bash
   # Mode Produksi
   npm start

   # Mode Pengembangan (Auto-reload)
   npm run dev
   ```
   Buka browser di: **`http://localhost:3000`**

---

## 🌐 Petunjuk Hosting Online (1-Click Deployment)

Aplikasi ini sudah dilengkapi konfigurasi deployment untuk platform cloud gratis/modern:

### 1. Deploy di Vercel
1. Buka [vercel.com](https://vercel.com/) dan login dengan akun GitHub Anda.
2. Klik **"Add New Project"** dan pilih repositori `haltea`.
3. Masukkan Environment Variables (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, dll.).
4. Klik **Deploy**!

### 2. Deploy di Render.com / Railway.app
1. Buka [render.com](https://render.com/) atau [railway.app](https://railway.app/).
2. Buat **Web Service** baru dari repositori GitHub `haltea`.
3. Build Command: `npm install`
4. Start Command: `node server.js`

---

## 👥 Akun Default
- **Admin**: `admin` / `admin123`
- **Kasir**: `kasir` / `kasir123`
