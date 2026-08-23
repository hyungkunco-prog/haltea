<?php

namespace App\Controllers\Api;

use App\Models\TakaranModel;
use App\Models\MenuModel;
use App\Models\BarangModel;

class Takaran extends ApiController
{
    public function index()
    {
        $db = \Config\Database::connect();
        $rows = $db->table('takaran s')
                   ->select('s.*, m.nama_menu, b.nama_barang, b.satuan, b.satuan_resep')
                   ->join('menu m', 's.id_menu = m.id')
                   ->join('barang b', 's.id_barang = b.id')
                   ->orderBy('m.nama_menu', 'ASC')
                   ->orderBy('b.nama_barang', 'ASC')
                   ->get()
                   ->getResultArray();

        // Typecast properly
        foreach ($rows as &$r) {
            $r['id'] = (int)$r['id'];
            $r['id_menu'] = (int)$r['id_menu'];
            $r['id_barang'] = (int)$r['id_barang'];
            $r['gramasi'] = (float)$r['gramasi'];
        }

        return $this->response->setJSON($rows);
    }

    public function menu($id_menu)
    {
        $db = \Config\Database::connect();
        $rows = $db->table('takaran s')
                   ->select('s.*, b.nama_barang, b.satuan, b.satuan_resep, b.kode_barang')
                   ->join('barang b', 's.id_barang = b.id')
                   ->where('s.id_menu', $id_menu)
                   ->orderBy('b.nama_barang', 'ASC')
                   ->get()
                   ->getResultArray();

        foreach ($rows as &$r) {
            $r['id'] = (int)$r['id'];
            $r['id_menu'] = (int)$r['id_menu'];
            $r['id_barang'] = (int)$r['id_barang'];
            $r['gramasi'] = (float)$r['gramasi'];
        }

        $menuModel = new MenuModel();
        $menu = $menuModel->find($id_menu);
        $harga = (int)($menu['harga'] ?? 0);

        return $this->response->setJSON([
            'items' => $rows,
            'harga' => $harga
        ]);
    }

    public function create()
    {
        $this->requireAdmin();
        $input = $this->request->getJSON(true) ?: [];
        $id_menu = (int)($input['id_menu'] ?? 0);
        $items = $input['items'] ?? [];
        $harga = isset($input['harga']) ? (int)$input['harga'] : null;

        $db = \Config\Database::connect();
        $db->transBegin();

        try {
            if ($harga !== null) {
                $menuModel = new MenuModel();
                $menuModel->update($id_menu, ['harga' => $harga]);
            }

            $db->table('takaran')->where('id_menu', $id_menu)->delete();

            foreach ($items as $item) {
                $id_barang = (int)$item['id_barang'];
                $gramasi = (float)$item['gramasi'];

                if ($gramasi > 0) {
                    $db->table('takaran')->insert([
                        'id_menu'   => $id_menu,
                        'id_barang' => $id_barang,
                        'gramasi'   => $gramasi
                    ]);
                }
            }

            $db->transCommit();
            return $this->response->setJSON(['success' => true]);
        } catch (\Exception $e) {
            $db->transRollback();
            return $this->response->setStatusCode(400)->setJSON(['error' => $e->getMessage()]);
        }
    }

    public function delete($id)
    {
        $this->requireAdmin();
        try {
            $db = \Config\Database::connect();
            $db->table('takaran')->where('id', $id)->delete();
            return $this->response->setJSON(['success' => true]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(400)->setJSON(['error' => $e->getMessage()]);
        }
    }
}
