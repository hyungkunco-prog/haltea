# HALTEA - Sistem Prediksi Stok Bahan Baku & Manajemen Kasir

HALTEA adalah sistem informasi manajemen inventaris, kasir (POS), dan peramalan/prediksi kebutuhan stok bahan baku berbasis web untuk usaha minuman Haltea.

---

## 🚀 Fitur Utama

- **Dashboard & Analitik**: Menampilkan ringkasan omzet, status stok kritis, dan grafik transaksi.
- **Manajemen Kasir (POS)**: Pencatatan pesanan minuman, kalkulasi otomatis, dan pengurangan stok bahan baku secara dinamis sesuai resep/komposisi.
- **Prediksi Stok Bahan Baku**: Perhitungan proyeksi dan peramalan kebutuhan stok untuk periode berikutnya guna mencegah kehabisan (*stockout*) atau kelebihan stok (*overstock*).
- **Manajemen Menu & Resep**: Pengaturan daftar produk/minuman beserta takaran komposisi bahan baku masing-masing.
- **Manajemen Bahan Baku**: Pencatatan stok masuk, stok keluar, satuan, dan batas minimum stok (*safety stock*).
- **Laporan Transaksi**: Rekapitulasi penjualan harian, bulanan, dan histori pemakaian bahan.

---

## 🛠️ Teknologi yang Digunakan

- **Backend**: [CodeIgniter 4](https://codeigniter.com/) (PHP 8.x)
- **Database**: MySQL / MariaDB
- **Frontend**: HTML5, CSS3, Modern JavaScript (Vanilla JS), Chart.js
- **Server Lokal**: Apache (XAMPP)

---

## ⚙️ Petunjuk Instalasi & Menjalankan Lokal

1. **Clone Repository**
   ```bash
   git clone https://github.com/hyungkunco-prog/haltea.git
   ```
   Pindahkan folder proyek ke direktori web server lokal (misal: `C:/xampp/htdocs/haltea`).

2. **Setup Database**
   - Buka **phpMyAdmin** (`http://localhost/phpmyadmin/`).
   - Buat database baru bernama `haltea_db`.
   - Import skema SQL database HALTEA.

3. **Konfigurasi Database**
   - Buka file [app/Config/Database.php](app/Config/Database.php).
   - Sesuaikan pengaturan `username`, `password`, dan `database`:
     ```php
     'hostname' => 'localhost',
     'username' => 'root',
     'password' => '',
     'database' => 'haltea_db',
     'port'     => 3306, // sesuaikan port MySQL Anda
     ```

4. **Jalankan Aplikasi**
   - Pastikan Apache dan MySQL di XAMPP sudah aktif.
   - Buka browser dan akses:
     ```
     http://localhost/haltea/
     ```

---

## 📄 Lisensi
Proyek ini dikembangkan untuk kebutuhan operasional **HALTEA**.
