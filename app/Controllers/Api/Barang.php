<?php

namespace App\Controllers\Api;

use App\Models\BarangModel;
use App\Models\TakaranModel;
use App\Models\TransaksiModel;
use App\Models\RekomendasiBelanjaModel;

class Barang extends ApiController
{
    public function index()
    {
        $barangModel = new BarangModel();
        $transaksiModel = new TransaksiModel();
        $takaranModel = new TakaranModel();

        $barangList = $barangModel->orderBy('kode_barang', 'ASC')->findAll();

        // Calculate 30-day average usage
        $dateStr = date('Y-m-d', strtotime('-30 days'));
        $menuSales = $transaksiModel->select('id_menu, SUM(jumlah) as total_qty')
                                    ->where('tanggal >=', $dateStr)
                                    ->groupBy('id_menu')
                                    ->findAll();

        $salesMap = [];
        foreach ($menuSales as $s) {
            $salesMap[$s['id_menu']] = (float)$s['total_qty'];
        }

        $sopList = $takaranModel->select('id_menu, id_barang, gramasi')->findAll();

        $totalUsageMap = [];
        foreach ($sopList as $sop) {
            $menuSalesQty = $salesMap[$sop['id_menu']] ?? 0.0;
            $usage = $menuSalesQty * (float)$sop['gramasi'];
            if (!isset($totalUsageMap[$sop['id_barang']])) {
                $totalUsageMap[$sop['id_barang']] = 0.0;
            }
            $totalUsageMap[$sop['id_barang']] += $usage;
        }

        $enrichedBarang = [];
        //BAGIAN FAKTOR KONVERSI BAHAN BAKU SPLYER KE SATUAN RESEP BARIS 57
        foreach ($barangList as $b) {
            $totalUsage30Days = $totalUsageMap[$b['id']] ?? 0.0;
            $avgDailyUsage = $totalUsage30Days / 30.0;

            $L = isset($b['lead_time_hari']) ? (int)$b['lead_time_hari'] : 2;
            $rop = $avgDailyUsage * $L;
            $butuhRestock = (float)$b['stok_gudang'] <= $rop;
            $estimasiBeli = 0;
            if ($butuhRestock && $avgDailyUsage > 0) {
                $targetStok = $avgDailyUsage * 7;
                $kekurangan = max(0.0, $targetStok - (float)$b['stok_gudang']);
                $estimasiBeli = (int)ceil($kekurangan / ((float)$b['faktor_konversi'] ?: 1.0));
            }
//
            $enrichedBarang[] = array_merge($b, [
                'id'                => (int)$b['id'],
                'faktor_konversi'   => (float)$b['faktor_konversi'],
                'stok_gudang'       => (float)$b['stok_gudang'],
                'lead_time_hari'    => (int)$b['lead_time_hari'],
                'avg_daily_usage'   => round($avgDailyUsage, 3),
                'rop'               => round($rop, 3),
                'butuh_restock'     => $butuhRestock,
                'estimasi_beli'     => $estimasiBeli
            ]);
        }

        return $this->response->setJSON($enrichedBarang);
    }

    public function create()
    {
        $this->requireAdmin();
        $input = $this->request->getJSON(true) ?: [];
        
        $kode = trim($input['kode_barang'] ?? '');
        $nama = trim($input['nama_barang'] ?? '');
        $satBeli = trim($input['satuan_beli'] ?? 'Pack');
        $satResep = trim($input['satuan_resep'] ?? 'gram');
        $faktor = isset($input['faktor_konversi']) ? (float)$input['faktor_konversi'] : 1.0;
        $stok = isset($input['stok_gudang']) ? (float)$input['stok_gudang'] : 0.0;
        $lead = isset($input['lead_time_hari']) ? (int)$input['lead_time_hari'] : 2;

        if (empty($kode) || empty($nama)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Kode dan Nama Bahan Baku wajib diisi.']);
        }

        try {
            $db = \Config\Database::connect();
            
            // Check duplicate kode_barang
            $existing = $db->table('barang')->where('kode_barang', $kode)->get()->getRow();
            if ($existing) {
                return $this->response->setStatusCode(400)->setJSON(['error' => "Kode Barang '{$kode}' sudah digunakan. Silakan gunakan kode lain."]);
            }

            $inserted = $db->table('barang')->insert([
                'kode_barang'       => $kode,
                'nama_barang'       => $nama,
                'satuan'            => $satBeli,
                'satuan_beli'       => $satBeli,
                'satuan_resep'      => $satResep,
                'faktor_konversi'   => $faktor,
                'stok_gudang'       => $stok,
                'lead_time_hari'    => $lead
            ]);

            if (!$inserted) {
                return $this->response->setStatusCode(400)->setJSON(['error' => 'Gagal menyimpan data bahan baku ke database.']);
            }

            $id = $db->insertID();
            return $this->response->setJSON(['success' => true, 'id' => (int)$id]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $e->getMessage()]);
        }
    }

    public function update($id)
    {
        $this->requireAdmin();
        $input = $this->request->getJSON(true) ?: [];

        $kode = trim($input['kode_barang'] ?? '');
        $nama = trim($input['nama_barang'] ?? '');
        $satBeli = trim($input['satuan_beli'] ?? 'Pack');
        $satResep = trim($input['satuan_resep'] ?? 'gram');
        $faktor = isset($input['faktor_konversi']) ? (float)$input['faktor_konversi'] : 1.0;
        $stok = isset($input['stok_gudang']) ? (float)$input['stok_gudang'] : 0.0;
        $lead = isset($input['lead_time_hari']) ? (int)$input['lead_time_hari'] : 2;

        if (empty($kode) || empty($nama)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Kode dan Nama Bahan Baku wajib diisi.']);
        }

        try {
            $db = \Config\Database::connect();
            $currentBarang = $db->table('barang')->where('id', $id)->get()->getRowArray();
            if (!$currentBarang) {
                return $this->response->setStatusCode(404)->setJSON(['error' => 'Bahan baku tidak ditemukan.']);
            }

            // Check duplicate kode_barang on other item
            $existing = $db->table('barang')->where('kode_barang', $kode)->where('id !=', $id)->get()->getRow();
            if ($existing) {
                return $this->response->setStatusCode(400)->setJSON(['error' => "Kode Barang '{$kode}' sudah digunakan oleh bahan baku lain."]);
            }

            $satResepFinal = (isset($input['satuan_resep']) && !empty(trim($input['satuan_resep']))) 
                ? trim($input['satuan_resep']) 
                : ($currentBarang['satuan_resep'] ?? 'gram');

            $db->table('barang')->where('id', $id)->update([
                'kode_barang'       => $kode,
                'nama_barang'       => $nama,
                'satuan'            => $satBeli,
                'satuan_beli'       => $satBeli,
                'satuan_resep'      => $satResepFinal,
                'faktor_konversi'   => $faktor,
                'stok_gudang'       => $stok,
                'lead_time_hari'    => $lead
            ]);

            return $this->response->setJSON(['success' => true]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        $this->requireAdmin();

        $takaranModel = new TakaranModel();
        $takaranModel->where('id_barang', $id)->delete();

        $rekomendasiModel = new RekomendasiBelanjaModel();
        $rekomendasiModel->where('id_barang', $id)->delete();

        $barangModel = new BarangModel();
        $barangModel->delete($id);

        return $this->response->setJSON(['success' => true]);
    }

    public function tambahStok($id)
    {
        $this->requireAdmin();
        $input = $this->request->getJSON(true) ?: [];
        $tambah = (float)($input['tambah'] ?? 0);

        $barangModel = new BarangModel();
        $b = $barangModel->find($id);
        if (!$b) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Barang not found']);
        }

        $factor = (float)($b['faktor_konversi'] ?? 1.0);
        $qtyResep = $tambah * $factor;

        $stokBaru = (float)($b['stok_gudang'] ?? 0) + $qtyResep;
        $barangModel->update($id, ['stok_gudang' => $stokBaru]);

        return $this->response->setJSON([
            'success' => true,
            'stok_baru' => $stokBaru
        ]);
    }
}
