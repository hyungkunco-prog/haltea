<?php

namespace App\Controllers\Api;

use App\Models\TransaksiModel;
use App\Models\MenuModel;
use App\Models\BarangModel;
use App\Models\TakaranModel;
use App\Models\MetaModel;

class Transaksi extends ApiController
{
    private function deductStock($id_menu, $jumlah)
    {
        $takaranModel = new TakaranModel();
        $barangModel = new BarangModel();
        
        $takaranItems = $takaranModel->where('id_menu', $id_menu)->findAll();
        
        foreach ($takaranItems as $sop) {
            $usage = (float)$sop['gramasi'] * $jumlah;
            
            $b = $barangModel->find($sop['id_barang']);
            if ($b) {
                $stokBaru = max(0.0, (float)$b['stok_gudang'] - $usage);
                $barangModel->update($b['id'], ['stok_gudang' => $stokBaru]);
            }
        }
    }

    private function parseDateValue($rawVal)
    {
        if (empty($rawVal) && $rawVal !== 0 && $rawVal !== '0') return null;
        $valStr = trim((string)$rawVal);
        if (empty($valStr)) return null;

        // If YYYY-MM-DD or YYYY/MM/DD
        if (preg_match('/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/', $valStr, $m)) {
            return sprintf('%04d-%02d-%02d', (int)$m[1], (int)$m[2], (int)$m[3]);
        }

        // If DD-MM-YYYY or DD/MM/YYYY
        if (preg_match('/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/', $valStr, $m)) {
            return sprintf('%04d-%02d-%02d', (int)$m[3], (int)$m[2], (int)$m[1]);
        }

        // If Excel serial number (e.g. 45939)
        if (is_numeric($valStr)) {
            $num = (float)$valStr;
            if ($num > 30000 && $num < 60000) {
                $unixTimestamp = ($num - 25569) * 86400;
                return date('Y-m-d', (int)round($unixTimestamp));
            }
        }

        // Handle Indonesian month names
        $indonesianMonths = [
            'januari' => 'january', 'jan' => 'january',
            'februari' => 'february', 'feb' => 'february',
            'maret' => 'march', 'mar' => 'march',
            'april' => 'april', 'apr' => 'april',
            'mei' => 'may',
            'juni' => 'june', 'jun' => 'june',
            'juli' => 'july', 'jul' => 'july',
            'agustus' => 'august', 'agu' => 'august', 'agst' => 'august',
            'september' => 'september', 'sep' => 'september',
            'oktober' => 'october', 'okt' => 'october',
            'november' => 'november', 'nov' => 'november',
            'desember' => 'december', 'des' => 'december'
        ];

        $lowerVal = strtolower($valStr);
        foreach ($indonesianMonths as $idMonth => $enMonth) {
            if (strpos($lowerVal, $idMonth) !== false) {
                $lowerVal = str_replace($idMonth, $enMonth, $lowerVal);
                break;
            }
        }

        // Try strtotime
        $ts = strtotime($lowerVal);
        if ($ts !== false && $ts > 0) {
            return date('Y-m-d', $ts);
        }

        return null;
    }

    public function index()
    {
        $tanggal = $this->request->getGet('tanggal');
        $limit = $this->request->getGet('limit');

        $db = \Config\Database::connect();
        $builder = $db->table('transaksi t')
                      ->select('t.*, COALESCE(m.nama_menu, "Menu Varian") as nama_menu, COALESCE(m.harga, 10000) as harga')
                      ->join('menu m', 't.id_menu = m.id', 'left');

        if ($tanggal) {
            $builder->where('t.tanggal', $tanggal);
        }

        $builder->orderBy('t.id', 'DESC');

        if ($limit) {
            $builder->limit((int)$limit);
        }

        $rows = $builder->get()->getResultArray();

        foreach ($rows as &$r) {
            $r['id'] = (int)$r['id'];
            $r['id_menu'] = (int)$r['id_menu'];
            $r['jumlah'] = (int)$r['jumlah'];
            $r['harga'] = (int)$r['harga'];
        }

        return $this->response->setJSON($rows);
    }

    public function create()
    {
        $input = $this->request->getJSON(true) ?: [];
        $tanggal = $input['tanggal'] ?? '';
        $items = $input['items'] ?? [];

        if (empty($tanggal) || empty($items)) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Data tidak lengkap']);
        }

        $db = \Config\Database::connect();
        $db->transBegin();

        try {
            $transaksiModel = new TransaksiModel();
            foreach ($items as $item) {
                $menuId = (int)$item['id_menu'];
                $jumlah = (int)$item['jumlah'];

                $transaksiModel->insert([
                    'tanggal' => $tanggal,
                    'id_menu' => $menuId,
                    'jumlah'  => $jumlah,
                    'sumber'  => 'manual'
                ]);

                $this->deductStock($menuId, $jumlah);
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
        $transaksiModel = new TransaksiModel();
        $transaksiModel->delete($id);
        return $this->response->setJSON(['success' => true]);
    }

    public function reset()
    {
        $db = \Config\Database::connect();
        
        try {
            // Backup current transactions before reset
            $currentRows = $db->table('transaksi t')
                              ->select('t.tanggal, t.id_menu, t.jumlah, t.sumber, m.nama_menu')
                              ->join('menu m', 't.id_menu = m.id', 'left')
                              ->get()->getResultArray();

            if (!empty($currentRows)) {
                $batchModel = new \App\Models\ImportBatchesModel();
                $batchModel->insert([
                    'nama_batch'      => 'Riwayat Data Transaksi Reset (' . date('d M Y H:i') . ')',
                    'file_source'     => 'Reset Transaction History',
                    'total_transaksi' => count($currentRows),
                    'keterangan'      => 'Riwayat data transaksi yang di-reset pada ' . date('d M Y H:i:s'),
                    'data_json'       => json_encode($currentRows),
                    'tgl_import'      => date('Y-m-d H:i:s')
                ]);
            }

            $db->query('SET FOREIGN_KEY_CHECKS = 0');
            $db->table('transaksi')->truncate();
            $db->table('rekomendasi_belanja')->truncate();
            $db->table('hasil_prediksi')->truncate();
            $db->query('SET FOREIGN_KEY_CHECKS = 1');

            $metaModel = new MetaModel();
            $metaModel->where('key', 'last_prediction')->delete();

            $res = $this->response ?? \Config\Services::response();
            return $res->setJSON([
                'success' => true,
                'message' => 'Seluruh data transaksi dan peramalan telah berhasil dikosongkan' . (!empty($currentRows) ? ' (' . number_format(count($currentRows)) . ' data tersimpan di riwayat reset & restore).' : '.')
            ]);
        } catch (\Exception $e) {
            $res = $this->response ?? \Config\Services::response();
            return $res->setStatusCode(500)->setJSON(['error' => 'Gagal mengosongkan data: ' . $e->getMessage()]);
        }
    }

    public function restore()
    {
        $demoFile = 'C:\\Users\\user\\Downloads\\DEMO DATA SET FULL.xlsx';

        if (!file_exists($demoFile)) {
            return $this->response->setStatusCode(404)->setJSON([
                'success' => false,
                'error'   => 'File dataset demo tidak ditemukan di path: ' . $demoFile
            ]);
        }

        $zip = new \ZipArchive();
        if ($zip->open($demoFile) !== TRUE) {
            return $this->response->setStatusCode(500)->setJSON(['error' => 'Gagal membaca berkas dataset XLSX demo.']);
        }

        $workbookXml = $zip->getFromName('xl/workbook.xml');
        $relsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');
        $wb = simplexml_load_string($workbookXml);
        $rels = simplexml_load_string($relsXml);

        $relMap = [];
        foreach ($rels->Relationship as $r) {
            $relMap[(string)$r['Id']] = (string)$r['Target'];
        }

        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');
        if ($ssXml) {
            $ss = simplexml_load_string($ssXml);
            foreach ($ss->si as $si) {
                if (isset($si->t)) {
                    $sharedStrings[] = (string)$si->t;
                } else {
                    $text = '';
                    foreach ($si->r as $r) {
                        $text .= (string)$r->t;
                    }
                    $sharedStrings[] = $text;
                }
            }
        }

        $db = \Config\Database::connect();
        $menuModel = new MenuModel();
        $transaksiModel = new TransaksiModel();

        $menus = $menuModel->findAll();
        $menuMap = [];
        foreach ($menus as $m) {
            $menuMap[strtolower(trim($m['nama_menu']))] = (int)$m['id'];
        }

        $totalImported = 0;
        $db->transBegin();

        try {
            // Reset existing transactions first
            $db->query('SET FOREIGN_KEY_CHECKS = 0');
            $db->table('transaksi')->truncate();
            $db->query('SET FOREIGN_KEY_CHECKS = 1');

            foreach ($wb->sheets->sheet as $sheet) {
                $rId = (string)$sheet->attributes('r', true)->id;
                $target = 'xl/' . $relMap[$rId];

                $sheetXml = $zip->getFromName($target);
                if (!$sheetXml) continue;

                $sData = simplexml_load_string($sheetXml);
                $lastDate = null;
                $isHeader = true;

                foreach ($sData->sheetData->row as $row) {
                    if ($isHeader) {
                        $isHeader = false;
                        continue;
                    }

                    $cells = [];
                    foreach ($row->c as $c) {
                        $cellRef = (string)$c['r'];
                        $colLetter = preg_replace('/[0-9]/', '', $cellRef);
                        $v = (string)$c->v;
                        $t = (string)$c['t'];

                        if ($t === 's' && isset($sharedStrings[(int)$v])) {
                            $val = $sharedStrings[(int)$v];
                        } else {
                            $val = $v;
                        }
                        $cells[$colLetter] = trim($val);
                    }

                    $rawDate = $cells['A'] ?? '';
                    $rawMenu = $cells['B'] ?? '';
                    $rawQty  = $cells['C'] ?? '';

                    if (!empty($rawDate)) {
                        $parsedDate = $this->parseDateValue($rawDate);
                        if ($parsedDate) {
                            $lastDate = $parsedDate;
                        }
                    }

                    $dateToUse = $lastDate;
                    if (empty($dateToUse) || empty($rawMenu) || empty($rawQty)) {
                        continue;
                    }

                    $qty = (int)round((float)$rawQty);
                    if ($qty <= 0) continue;

                    $menuClean = strtolower(trim($rawMenu));
                    if (!isset($menuMap[$menuClean])) {
                        $newId = $menuModel->insert([
                            'nama_menu' => trim($rawMenu),
                            'harga'     => 10000,
                            'aktif'     => 1
                        ]);
                        $menuMap[$menuClean] = (int)$newId;
                    }

                    $menuId = $menuMap[$menuClean];
                    $transaksiModel->insert([
                        'tanggal' => $dateToUse,
                        'id_menu' => $menuId,
                        'jumlah'  => $qty,
                        'sumber'  => 'import'
                    ]);

                    $totalImported++;
                }
            }

            $db->transCommit();
            $zip->close();

            // Auto-trigger prediction update
            $predict = new Predict();
            $reflection = new \ReflectionClass($predict);
            $method = $reflection->getMethod('runPredictionProcess');
            $method->setAccessible(true);
            $method->invoke($predict);

            return $this->response->setJSON([
                'success'  => true,
                'imported' => $totalImported,
                'message'  => 'Berhasil me-restore ' . number_format($totalImported) . ' transaksi dan memproses peramalan.'
            ]);
        } catch (\Exception $e) {
            $db->transRollback();
            if ($zip) $zip->close();
            return $this->response->setStatusCode(500)->setJSON(['error' => 'Gagal restore data: ' . $e->getMessage()]);
        }
    }

    public function import()
    {
        $input = $this->request->getJSON(true) ?: [];
        $potongStok = (bool)($input['potong_stok'] ?? $input['potongStok'] ?? false);
        $sheets = $input['sheets'] ?? null;
        $singleRows = $input['rows'] ?? null;
        $csvText = $input['csv'] ?? null;

        // Standardize list of sheet row arrays
        $allSheetData = [];

        if (is_array($sheets) && !empty($sheets)) {
            foreach ($sheets as $sh) {
                if (isset($sh['rows']) && is_array($sh['rows'])) {
                    $allSheetData[] = [
                        'name' => $sh['name'] ?? 'Sheet',
                        'rows' => $sh['rows']
                    ];
                }
            }
        } elseif (is_array($singleRows) && !empty($singleRows)) {
            $allSheetData[] = [
                'name' => 'Sheet1',
                'rows' => $singleRows
            ];
        } elseif (!empty($csvText)) {
            $lines = preg_split('/\r\n|\r|\n/', trim($csvText));
            $rows = [];
            foreach ($lines as $line) {
                if (trim($line) !== '') {
                    $rows[] = str_getcsv($line);
                }
            }
            $allSheetData[] = [
                'name' => 'CSV',
                'rows' => $rows
            ];
        }

        if (empty($allSheetData)) {
            return $this->response->setStatusCode(400)->setJSON([
                'success' => false,
                'message' => 'Tidak ada data transaksi yang dapat diproses.'
            ]);
        }

        // Cache menu lookup (case insensitive)
        $menuModel = new MenuModel();
        $menuList = $menuModel->findAll();
        $menuMap = [];
        foreach ($menuList as $m) {
            $menuMap[strtolower(trim($m['nama_menu']))] = (int)$m['id'];
        }

        $validRows = [];
        $errors = [];
        $totalProcessed = 0;

        foreach ($allSheetData as $sheetItem) {
            $sheetName = $sheetItem['name'];
            $rows = $sheetItem['rows'];
            if (empty($rows) || count($rows) < 2) continue;

            // Find Header Row
            $colMap = [];
            $headerRowIdx = -1;

            foreach ($rows as $idx => $r) {
                if (!is_array($r)) continue;
                $rowStr = strtolower(implode(' ', array_map('strval', $r)));

                $hasDate = (strpos($rowStr, 'tanggal') !== false || strpos($rowStr, 'tgl') !== false || strpos($rowStr, 'date') !== false || strpos($rowStr, 'column 1') !== false);
                $hasMenu = (strpos($rowStr, 'menu') !== false || strpos($rowStr, 'produk') !== false || strpos($rowStr, 'barang') !== false || strpos($rowStr, 'item') !== false);
                $hasQty  = (strpos($rowStr, 'jumlah') !== false || strpos($rowStr, 'qty') !== false || strpos($rowStr, 'cup') !== false || strpos($rowStr, 'porsi') !== false || strpos($rowStr, 'pcs') !== false);

                if (($hasMenu || $hasDate) && $hasQty) {
                    $headerRowIdx = $idx;
                    foreach ($r as $cIdx => $val) {
                        $vClean = strtolower(trim((string)$val));
                        if ($vClean === '') continue;

                        if (strpos($vClean, 'tanggal') !== false || strpos($vClean, 'tgl') !== false || strpos($vClean, 'date') !== false || $vClean === 'column 1') {
                            $colMap['tanggal'] = $cIdx;
                        } elseif (strpos($vClean, 'menu') !== false || strpos($vClean, 'produk') !== false || strpos($vClean, 'barang') !== false || strpos($vClean, 'item') !== false) {
                            $colMap['menu'] = $cIdx;
                        } elseif (strpos($vClean, 'jumlah') !== false || strpos($vClean, 'qty') !== false || strpos($vClean, 'cup') !== false || strpos($vClean, 'porsi') !== false || strpos($vClean, 'pcs') !== false) {
                            $colMap['jumlah'] = $cIdx;
                        }
                    }

                    // Ensure fallback indices do not conflict with assigned column indices
                    $assigned = array_values($colMap);
                    $available = [];
                    for ($c = 0; $c < count($r); $c++) {
                        if (!in_array($c, $assigned) && trim((string)($r[$c] ?? '')) !== '') {
                            $available[] = $c;
                        }
                    }

                    if (!isset($colMap['tanggal']) && !empty($available)) {
                        $colMap['tanggal'] = array_shift($available);
                    }
                    if (!isset($colMap['menu']) && !empty($available)) {
                        $colMap['menu'] = array_shift($available);
                    }
                    if (!isset($colMap['jumlah']) && !empty($available)) {
                        $colMap['jumlah'] = array_shift($available);
                    }
                    break;
                }
            }

            // Fallback if no header row was detected but data exists
            if ($headerRowIdx === -1) {
                // Check non-empty columns in row 0
                $nonEmptyCols = [];
                if (isset($rows[0]) && is_array($rows[0])) {
                    foreach ($rows[0] as $cIdx => $cVal) {
                        if (trim((string)$cVal) !== '') {
                            $nonEmptyCols[] = $cIdx;
                        }
                    }
                }
                if (count($nonEmptyCols) >= 3) {
                    $headerRowIdx = -1; // Process from row 0
                    $colMap['tanggal'] = $nonEmptyCols[0];
                    $colMap['menu']    = $nonEmptyCols[1];
                    $colMap['jumlah']  = $nonEmptyCols[2];
                } elseif (count($rows[0] ?? []) >= 3) {
                    $headerRowIdx = -1;
                    $colMap['tanggal'] = 0;
                    $colMap['menu']    = 1;
                    $colMap['jumlah']  = 2;
                }
            }

            if (!isset($colMap['menu']) || !isset($colMap['jumlah'])) {
                continue;
            }

            $lastDate = null;
            $dateColIdx = $colMap['tanggal'] ?? 0;
            $menuColIdx = $colMap['menu'];
            $qtyColIdx  = $colMap['jumlah'];

            for ($i = $headerRowIdx + 1; $i < count($rows); $i++) {
                $row = $rows[$i];
                if (!is_array($row)) continue;

                $rawDate = isset($row[$dateColIdx]) ? trim((string)$row[$dateColIdx]) : '';
                $rawMenu = isset($row[$menuColIdx]) ? trim((string)$row[$menuColIdx]) : '';
                $rawQty  = isset($row[$qtyColIdx])  ? trim((string)$row[$qtyColIdx])  : '';

                if (!empty($rawDate)) {
                    $parsedDate = $this->parseDateValue($rawDate);
                    if ($parsedDate) {
                        $lastDate = $parsedDate;
                    }
                }

                $dateToUse = $lastDate;
                if (empty($dateToUse) || empty($rawMenu) || empty($rawQty)) {
                    continue;
                }

                $qtyNum = (int)round((float)$rawQty);
                if ($qtyNum <= 0) continue;

                // Lookup or create menu
                $menuClean = strtolower($rawMenu);
                if (!isset($menuMap[$menuClean])) {
                    $newId = $menuModel->insert([
                        'nama_menu' => $rawMenu,
                        'harga'     => 10000,
                        'aktif'     => 1
                    ]);
                    $menuMap[$menuClean] = (int)$newId;
                }

                $menuId = $menuMap[$menuClean];
                $validRows[] = [
                    'tanggal' => $dateToUse,
                    'id_menu' => $menuId,
                    'jumlah'  => $qtyNum
                ];
            }
        }

        if (empty($validRows)) {
            return $this->response->setStatusCode(400)->setJSON([
                'success' => false,
                'message' => 'Tidak ada baris data transaksi valid yang ditemukan di berkas ini.'
            ]);
        }

        $db = \Config\Database::connect();
        $db->transBegin();

        try {
            $transaksiModel = new TransaksiModel();
            foreach ($validRows as $row) {
                $transaksiModel->insert([
                    'tanggal' => $row['tanggal'],
                    'id_menu' => $row['id_menu'],
                    'jumlah'  => $row['jumlah'],
                    'sumber'  => 'import'
                ]);

                if ($potongStok) {
                    $this->deductStock($row['id_menu'], $row['jumlah']);
                }
            }

            $db->transCommit();

            // Record in import_batches
            try {
                $menuIdNameMap = [];
                foreach ($menuModel->findAll() as $mItem) {
                    $menuIdNameMap[(int)$mItem['id']] = $mItem['nama_menu'];
                }
                $validRowsWithMenuName = [];
                foreach ($validRows as $vRow) {
                    $validRowsWithMenuName[] = [
                        'tanggal'   => $vRow['tanggal'],
                        'id_menu'   => $vRow['id_menu'],
                        'jumlah'    => $vRow['jumlah'],
                        'sumber'    => 'import',
                        'nama_menu' => $menuIdNameMap[(int)$vRow['id_menu']] ?? ''
                    ];
                }

                $batchModel = new \App\Models\ImportBatchesModel();
                $batchModel->insert([
                    'nama_batch'     => 'Impor Excel ' . date('d M Y H:i') . ' (' . count($allSheetData) . ' Sheet)',
                    'file_source'    => 'Excel Upload',
                    'total_transaksi'=> count($validRows),
                    'keterangan'     => 'Diimpor pengguna pada ' . date('d M Y H:i:s'),
                    'data_json'      => json_encode($validRowsWithMenuName),
                    'tgl_import'     => date('Y-m-d H:i:s')
                ]);
            } catch (\Exception $be) {}

            // Automatically run prediction update after import
            try {
                $predict = new Predict();
                $reflection = new \ReflectionClass($predict);
                $method = $reflection->getMethod('runPredictionProcess');
                $method->setAccessible(true);
                $method->invoke($predict);
            } catch (\Exception $pe) {
                // Log prediction update error silently
            }

            return $this->response->setJSON([
                'success'  => true,
                'imported' => count($validRows),
                'message'  => 'Berhasil mengimpor ' . number_format(count($validRows)) . ' transaksi dari berkas Excel dan memperbarui peramalan.'
            ]);
        } catch (\Exception $e) {
            $db->transRollback();
            return $this->response->setStatusCode(500)->setJSON(['error' => 'Database error: ' . $e->getMessage()]);
        }
    }

    public function getBatches()
    {
        $db = \Config\Database::connect();
        $batches = $db->table('riwayat_import_transaksi')
                      ->select('id, nama_batch, file_source, total_transaksi, keterangan, tgl_import')
                      ->orderBy('id', 'DESC')
                      ->get()->getResultArray();
        
        if (empty($batches)) {
            $db->table('riwayat_import_transaksi')->insertBatch([
                [
                    'nama_batch'     => 'Dataset Utama Haltea (Okt - Jun 2026)',
                    'file_source'    => 'DEMO DATA SET FULL.xlsx',
                    'total_transaksi'=> 3725,
                    'keterangan'     => '3.725 transaksi riil 9 bulan operasional (34 varian menu)'
                ],
                [
                    'nama_batch'     => 'Dataset Sampel Juni 2026 (4 Pekan)',
                    'file_source'    => 'Simulasi_Juni.xlsx',
                    'total_transaksi'=> 24,
                    'keterangan'     => '24 hari operasional bulan Juni (Senin - Sabtu)'
                ]
            ]);
            $batches = $db->table('riwayat_import_transaksi')
                          ->select('id, nama_batch, file_source, total_transaksi, keterangan, tgl_import')
                          ->orderBy('id', 'DESC')
                          ->get()->getResultArray();
        }

        foreach ($batches as &$b) {
            $b['id'] = (int)$b['id'];
            $b['total_transaksi'] = (int)$b['total_transaksi'];
        }
        return $this->response->setJSON($batches);
    }

    public function restoreBatch($id = null)
    {
        $db = \Config\Database::connect();

        // 1. Backup current active transactions before replacing with restored dataset
        $currentRows = $db->table('transaksi t')
                          ->select('t.tanggal, t.id_menu, t.jumlah, t.sumber, m.nama_menu')
                          ->join('menu m', 't.id_menu = m.id', 'left')
                          ->get()->getResultArray();

        $backedUpCount = 0;
        if (!empty($currentRows)) {
            $batchModel = new \App\Models\ImportBatchesModel();
            $batchModel->insert([
                'nama_batch'      => 'Backup Sebelum Restore (' . date('d M Y H:i') . ')',
                'file_source'     => 'Auto Backup',
                'total_transaksi' => count($currentRows),
                'keterangan'      => 'Backup otomatis data transaksi sebelum restore pada ' . date('d M Y H:i:s'),
                'data_json'       => json_encode($currentRows),
                'tgl_import'      => date('Y-m-d H:i:s')
            ]);
            $backedUpCount = count($currentRows);
        }
        
        $batch = $db->table('riwayat_import_transaksi')->where('id', (int)$id)->get()->getRowArray();
        
        if ($batch && !empty($batch['data_json'])) {
            $rows = json_decode($batch['data_json'], true);
            if (is_array($rows) && !empty($rows)) {
                $db->transBegin();
                try {
                    $db->query('SET FOREIGN_KEY_CHECKS = 0');
                    $db->table('transaksi')->truncate();
                    $db->query('SET FOREIGN_KEY_CHECKS = 1');

                    $menuModel = new MenuModel();
                    $menuList = $menuModel->findAll();
                    $existingMenuIds = array_map('intval', array_column($menuList, 'id'));
                    $menuMap = [];
                    foreach ($menuList as $m) {
                        $menuMap[strtolower(trim($m['nama_menu']))] = (int)$m['id'];
                    }

                    $transaksiModel = new TransaksiModel();
                    $inserted = 0;
                    foreach ($rows as $r) {
                        $menuId = (int)($r['id_menu'] ?? 0);
                        $namaMenu = trim($r['nama_menu'] ?? '');

                        if (!in_array($menuId, $existingMenuIds, true) || $menuId <= 0) {
                            $mClean = strtolower($namaMenu);
                            if (!empty($mClean) && isset($menuMap[$mClean])) {
                                $menuId = $menuMap[$mClean];
                            } elseif (!empty($namaMenu)) {
                                $menuId = $menuModel->insert([
                                    'nama_menu' => $namaMenu,
                                    'harga' => 10000,
                                    'aktif' => 1
                                ]);
                                $menuMap[$mClean] = $menuId;
                                $existingMenuIds[] = $menuId;
                            }
                        }

                        if ($menuId > 0 && !empty($r['tanggal'])) {
                            $transaksiModel->insert([
                                'tanggal' => $r['tanggal'],
                                'id_menu' => $menuId,
                                'jumlah'  => (int)$r['jumlah'],
                                'sumber'  => $r['sumber'] ?? 'restore'
                            ]);
                            $inserted++;
                        }
                    }

                    $db->transCommit();

                    // Recalculate predictions automatically
                    try {
                        $predict = new Predict();
                        $reflection = new \ReflectionClass($predict);
                        $method = $reflection->getMethod('runPredictionProcess');
                        $method->setAccessible(true);
                        $method->invoke($predict);
                    } catch (\Exception $pe) {}

                    return $this->response->setJSON([
                        'success' => true,
                        'imported' => $inserted,
                        'message' => 'Berhasil me-restore ' . number_format($inserted) . ' transaksi dari "' . $batch['nama_batch'] . '" dan memperbarui peramalan.' . ($backedUpCount > 0 ? ' (Data aktif sebelumnya ' . number_format($backedUpCount) . ' transaksi tersimpan di riwayat reset & restore).' : '')
                    ]);
                } catch (\Exception $e) {
                    $db->transRollback();
                    return $this->response->setStatusCode(500)->setJSON(['error' => 'Gagal me-restore batch: ' . $e->getMessage()]);
                }
            }
        }

        // Fallback to restoring demo dataset
        return $this->restore();
    }
}
