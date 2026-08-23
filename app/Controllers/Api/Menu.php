<?php

namespace App\Controllers\Api;

use App\Models\MenuModel;
use App\Models\TakaranModel;
use App\Models\TransaksiModel;

class Menu extends ApiController
{
    public function index()
    {
        $db = \Config\Database::connect();
        $menuList = $db->table('menu')->orderBy('nama_menu', 'ASC')->get()->getResultArray();
        
        foreach ($menuList as &$m) {
            $m['id'] = (int)$m['id'];
            $m['harga'] = (int)$m['harga'];
            $m['aktif'] = (int)$m['aktif'];
        }
        
        return $this->response->setJSON($menuList);
    }

    public function create()
    {
        $this->requireAdmin();
        $input = $this->request->getJSON(true) ?: [];

        $nama = trim($input['nama_menu'] ?? '');
        $ket = trim($input['keterangan'] ?? '');
        $gambar = $input['gambar'] ?? null;
        $harga = isset($input['harga']) ? (int)$input['harga'] : 0;

        if (empty($nama)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Nama Menu wajib diisi.']);
        }

        try {
            $db = \Config\Database::connect();

            // Check duplicate nama_menu
            $dup = $db->table('menu')->where('nama_menu', $nama)->get()->getRowArray();
            if ($dup) {
                return $this->response->setStatusCode(400)->setJSON(['error' => "Nama Menu '{$nama}' sudah digunakan. Silakan gunakan nama lain."]);
            }

            $db->table('menu')->insert([
                'nama_menu'  => $nama,
                'keterangan' => $ket,
                'gambar'     => $gambar,
                'harga'      => $harga,
                'aktif'      => 1
            ]);

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

        try {
            $db = \Config\Database::connect();
            $existing = $db->table('menu')->where('id', $id)->get()->getRowArray();
            if (!$existing) {
                return $this->response->setStatusCode(404)->setJSON(['error' => 'Menu tidak ditemukan']);
            }

            $nama = isset($input['nama_menu']) && trim($input['nama_menu']) !== '' ? trim($input['nama_menu']) : $existing['nama_menu'];
            $ket = array_key_exists('keterangan', $input) ? trim($input['keterangan']) : $existing['keterangan'];
            $aktif = isset($input['aktif']) ? (int)$input['aktif'] : (int)$existing['aktif'];
            $harga = isset($input['harga']) ? (int)$input['harga'] : (int)$existing['harga'];

            // Check duplicate nama_menu on other menu item
            $dup = $db->table('menu')->where('nama_menu', $nama)->where('id !=', $id)->get()->getRowArray();
            if ($dup) {
                return $this->response->setStatusCode(400)->setJSON(['error' => "Nama Menu '{$nama}' sudah digunakan oleh menu lain."]);
            }

            $updateData = [
                'nama_menu'  => $nama,
                'keterangan' => $ket,
                'aktif'      => $aktif,
                'harga'      => $harga
            ];

            if (array_key_exists('gambar', $input)) {
                $updateData['gambar'] = $input['gambar'];
            }

            $db->table('menu')->where('id', $id)->update($updateData);

            return $this->response->setJSON(['success' => true]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        $this->requireAdmin();

        $takaranModel = new TakaranModel();
        $takaranModel->where('id_menu', $id)->delete();

        $transaksiModel = new TransaksiModel();
        $transaksiModel->where('id_menu', $id)->delete();

        $menuModel = new MenuModel();
        $menuModel->delete($id);

        return $this->response->setJSON(['success' => true]);
    }
}
