<?php

namespace App\Controllers\Api;

use App\Models\MenuModel;
use App\Models\BarangModel;
use App\Models\TakaranModel;
use App\Models\TransaksiModel;
use App\Models\HasilPrediksiModel;
use App\Models\RekomendasiBelanjaModel;
use App\Models\MetaModel;

class Predict extends ApiController
{
    private function getWeeklyAggregation($menuId)
    {
        $db = \Config\Database::connect();

        $allRows = $db->table('transaksi')
                      ->select('tanggal')
                      ->groupBy('tanggal')
                      ->orderBy('tanggal', 'ASC')
                      ->get()->getResultArray();

        $opDays = [];
        foreach ($allRows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue;
            $opDays[date('Y-m-d', $ts)] = true;
        }
        $uniqueDays = array_keys($opDays);
        sort($uniqueDays);

        $dayToBlock = [];
        foreach ($uniqueDays as $idx => $dayStr) {
            $blockIdx = (int)floor($idx / 6);
            if ($blockIdx < 4) {
                $dayToBlock[$dayStr] = $blockIdx;
            }
        }

        $rows = $db->table('transaksi')
                   ->select('tanggal, SUM(jumlah) as total')
                   ->where('id_menu', $menuId)
                   ->groupBy('tanggal')
                   ->orderBy('tanggal', 'ASC')
                   ->get()->getResultArray();

        $series = [0.0, 0.0, 0.0, 0.0];
        foreach ($rows as $row) {
            $ts = strtotime($row['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue;

            $dStr = date('Y-m-d', $ts);
            if (!isset($dayToBlock[$dStr])) continue;

            $bIdx = $dayToBlock[$dStr];
            $series[$bIdx] += (float)$row['total'];
        }

        return $series;
    }

    private function getBarangWeeklyAggregation($idBarang)
    {
        $db = \Config\Database::connect();

        $allRows = $db->table('transaksi')
                      ->select('tanggal')
                      ->groupBy('tanggal')
                      ->orderBy('tanggal', 'ASC')
                      ->get()->getResultArray();

        $opDays = [];
        foreach ($allRows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue;
            $opDays[date('Y-m-d', $ts)] = true;
        }
        $uniqueDays = array_keys($opDays);
        sort($uniqueDays);

        $dayToBlock = [];
        foreach ($uniqueDays as $idx => $dayStr) {
            $blockIdx = (int)floor($idx / 6);
            if ($blockIdx < 4) {
                $dayToBlock[$dayStr] = $blockIdx;
            }
        }

        $rows = $db->table('transaksi t')
                   ->select('t.tanggal, (t.jumlah * s.gramasi) as usage_amount')
                   ->join('takaran s', 't.id_menu = s.id_menu')
                   ->where('s.id_barang', $idBarang)
                   ->orderBy('t.tanggal', 'ASC')
                   ->get()->getResultArray();

        $series = [0.0, 0.0, 0.0, 0.0];
        foreach ($rows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue;

            $dStr = date('Y-m-d', $ts);
            if (!isset($dayToBlock[$dStr])) continue;

            $bIdx = $dayToBlock[$dStr];
            $series[$bIdx] += (float)$r['usage_amount'];
        }

        return $series;
    }

    private function movingAvgSmooth($series)
    {
        if (empty($series)) {
            return [];
        }
        $smoothed = [(float)$series[0]];
        for ($k = 1; $k < count($series); $k++) {
            $smoothed[] = (float)(($series[$k - 1] + $series[$k]) / 2.0);
        }
        return $smoothed;
    }

    private function runSES($rawSeries, $smoothedSeries, $alpha = 0.50)
    {
        $len = count($rawSeries);
        if ($len < 2) {
            return [
                'prediction'     => 0,
                'prediction_raw' => 0.0,
                'alpha'          => $alpha,
                'wmape'          => 100.0,
                'akurasi'        => 0.0,
                'valid'          => false
            ];
        }

        $S = [(float)$smoothedSeries[0]];
        for ($k = 1; $k < $len; $k++) {
            $prevX = (float)$smoothedSeries[$k - 1];
            $prevS = $S[$k - 1];
            $S[] = $alpha * $prevX + (1.0 - $alpha) * $prevS;
        }

        $lastX = (float)$smoothedSeries[$len - 1];
        $lastS = $S[$len - 1];
        $nextPred = $alpha * $lastX + (1.0 - $alpha) * $lastS;

        $sumErr = 0.0;
        $sumAct = 0.0;

        for ($k = 0; $k < $len; $k++) {
            $actual = (float)$rawSeries[$k];
            $pred   = $S[$k];

            $sumErr += abs($actual - $pred);
            $sumAct += $actual;
        }

        $wmape = $sumAct > 0 ? ($sumErr / $sumAct) * 100.0 : 0.0;
        $akurasi = max(0.0, 100.0 - $wmape);

        return [
            'prediction'     => (int)ceil($nextPred),
            'prediction_raw' => round($nextPred, 2),
            'alpha'          => $alpha,
            'wmape'          => round($wmape, 2),
            'akurasi'        => round($akurasi, 2),
            'valid'          => $wmape <= 15.0
        ];
    }

    private function runPredictionProcess($alpha = 0.50)
    {
        $alpha = (float)$alpha;
        if ($alpha <= 0.0 || $alpha > 1.0) {
            $alpha = 0.50;
        }

        $db = \Config\Database::connect();

        // Clear old results
        $db->query('SET FOREIGN_KEY_CHECKS = 0');
        $db->table('rekomendasi_belanja')->truncate();
        $db->table('hasil_prediksi')->truncate();
        $db->query('SET FOREIGN_KEY_CHECKS = 1');

        $barangModel = new BarangModel();
        $barangList  = $barangModel->findAll();

        $menuModel   = new MenuModel();
        $menuList    = $menuModel->where('aktif', 1)->findAll();

        $hasilPrediksiModel      = new HasilPrediksiModel();
        $rekomendasiBelanjaModel = new RekomendasiBelanjaModel();

        $db->transBegin();

        try {
            // Save alpha setting to meta
            $metaModel = new MetaModel();
            $metaModel->save(['key' => 'alpha_setting', 'value' => (string)$alpha]);

            // 1. Menu Level SES predictions
            $predResults = [];
            foreach ($menuList as $menu) {
                $rawSeries = $this->getWeeklyAggregation($menu['id']);
                if (count($rawSeries) < 2) {
                    $pid = $hasilPrediksiModel->insert([
                        'id_menu'         => $menu['id'],
                        'nama_menu'       => $menu['nama_menu'],
                        'prediksi_cup'    => 0,
                        'alpha_terpilih'  => $alpha,
                        'wmape'           => 100.0,
                        'is_valid'        => 0
                    ]);

                    $predResults[] = [
                        'id'              => $pid,
                        'id_menu'         => $menu['id'],
                        'nama_menu'       => $menu['nama_menu'],
                        'prediksi_cup'    => 0,
                        'alpha'           => $alpha,
                        'wmape'           => 100.0,
                        'akurasi'         => 0.0,
                        'valid'           => false
                    ];
                    continue;
                }

                $smoothed = $this->movingAvgSmooth($rawSeries);
                $ses = $this->runSES($rawSeries, $smoothed, $alpha);

                $pid = $hasilPrediksiModel->insert([
                    'id_menu'         => $menu['id'],
                    'nama_menu'       => $menu['nama_menu'],
                    'prediksi_cup'    => $ses['prediction'],
                    'alpha_terpilih'  => $ses['alpha'],
                    'wmape'           => $ses['wmape'],
                    'is_valid'        => $ses['valid'] ? 1 : 0
                ]);

                $predResults[] = [
                    'id'              => $pid,
                    'id_menu'         => $menu['id'],
                    'nama_menu'       => $menu['nama_menu'],
                    'prediksi_cup'    => $ses['prediction'],
                    'prediksi_cup_raw'=> $ses['prediction_raw'],
                    'alpha'           => $ses['alpha'],
                    'wmape'           => $ses['wmape'],
                    'akurasi'         => $ses['akurasi'],
                    'valid'           => $ses['valid']
                ];
            }

            // 2. Direct Raw Material Centered Prediction
            foreach ($barangList as $b) {
                $bId = (int)$b['id'];
                $factor = (float)$b['faktor_konversi'] ?: 1.0;
                $stokGudang = (float)$b['stok_gudang'];

                $rawSeries = $this->getBarangWeeklyAggregation($bId);
                $len = count($rawSeries);

                if ($len < 2) {
                    $rekomendasiBelanjaModel->insert([
                        'id_prediksi'        => null,
                        'id_barang'          => $bId,
                        'prediksi_kebutuhan' => 0.0,
                        'stok_gudang'        => $stokGudang,
                        'kebutuhan_belanja'  => 0.0,
                        'tgl_prediksi'       => date('Y-m-d H:i:s')
                    ]);
                    continue;
                }

                $smoothed = $this->movingAvgSmooth($rawSeries);

                // SES calculation on raw material smoothed series using $alpha
                $S = [(float)$smoothed[0]];
                for ($k = 1; $k < $len; $k++) {
                    $prevX = (float)$smoothed[$k - 1];
                    $prevS = $S[$k - 1];
                    $S[] = $alpha * $prevX + (1.0 - $alpha) * $prevS;
                }

                $lastX = (float)$smoothed[$len - 1];
                $lastS = $S[$len - 1];
                $nextPred = $alpha * $lastX + (1.0 - $alpha) * $lastS;

                // Calculate WMAPE
                $sumErr = 0.0;
                $sumAct = 0.0;

                for ($k = 0; $k < $len; $k++) {
                    $actual = (float)$rawSeries[$k];
                    $pred   = $S[$k];

                    $sumErr += abs($actual - $pred);
                    $sumAct += $actual;
                }

                $wmape = $sumAct > 0 ? ($sumErr / $sumAct) * 100.0 : 0.0;

                $netNeed = max(0.0, $nextPred - $stokGudang);
                $belanja = $nextPred > 0 ? (int)ceil($nextPred / $factor) : 0;

                $rekomendasiBelanjaModel->insert([
                    'id_prediksi'        => null,
                    'id_barang'          => $bId,
                    'prediksi_kebutuhan' => $nextPred,
                    'stok_gudang'        => $stokGudang,
                    'kebutuhan_belanja'  => $belanja * $factor,
                    'tgl_prediksi'       => date('Y-m-d H:i:s')
                ]);
            }

            // Update meta 'last_prediction'
            $nowStr = date('Y-m-d H:i:s');
            $metaModel->save(['key' => 'last_prediction', 'value' => $nowStr]);

            $db->transCommit();
            return $predResults;
        } catch (\Exception $e) {
            $db->transRollback();
            throw $e;
        }
    }

    public function getAlpha()
    {
        $metaModel = new MetaModel();
        $row = $metaModel->find('alpha_setting');
        $alpha = $row ? (float)$row['value'] : 0.50;
        return $this->response->setJSON(['alpha' => $alpha]);
    }

    public function index()
    {
        try {
            $input = $this->request->getJSON(true) ?: [];
            $alphaRaw = $input['alpha'] ?? $this->request->getGet('alpha') ?? $this->request->getPost('alpha') ?? null;
            if ($alphaRaw === null) {
                $metaModel = new MetaModel();
                $savedAlpha = $metaModel->find('alpha_setting');
                $alpha = $savedAlpha ? (float)$savedAlpha['value'] : 0.50;
            } else {
                $alpha = (float)$alphaRaw;
            }

            if ($alpha <= 0.0 || $alpha > 1.0) {
                $alpha = 0.50;
            }

            $results = $this->runPredictionProcess($alpha);
            return $this->response->setJSON([
                'success' => true,
                'alpha'   => $alpha,
                'message' => 'Prediksi bahan baku 6 hari operasional pekan depan berhasil diperbarui (Alpha = ' . $alpha . ').',
                'results' => $results
            ]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(500)->setJSON(['error' => $e->getMessage()]);
        }
    }

    public function auto()
    {
        try {
            $metaModel = new MetaModel();
            $lastSundayRunRow = $metaModel->find('last_sunday_prediction');
            $lastSundayRun = $lastSundayRunRow['value'] ?? '';

            $currentWeekKey = date('o-W');
            $isSunday = ((int)date('N') === 7);

            if ($isSunday && $lastSundayRun !== $currentWeekKey) {
                $this->runPredictionProcess();
                $metaModel->save(['key' => 'last_sunday_prediction', 'value' => $currentWeekKey]);
                return $this->response->setJSON([
                    'triggered' => true,
                    'type'      => 'auto_sunday',
                    'message'   => 'Prediksi otomatis hari Minggu 00.00 WIB telah berhasil dijalankan.'
                ]);
            }

            return $this->response->setJSON([
                'triggered' => false,
                'isSunday'  => $isSunday,
                'lastRun'   => $lastSundayRun
            ]);
        } catch (\Exception $e) {
            return $this->response->setStatusCode(500)->setJSON(['error' => $e->getMessage()]);
        }
    }

    public function hasil()
    {
        $hasilPrediksiModel = new HasilPrediksiModel();
        $prediksi = $hasilPrediksiModel->orderBy('nama_menu', 'ASC')->findAll();
        
        foreach ($prediksi as &$p) {
            $p['id']              = (int)$p['id'];
            $p['id_menu']         = (int)$p['id_menu'];
            $p['prediksi_cup']    = (int)$p['prediksi_cup'];
            $p['alpha_terpilih']  = (float)$p['alpha_terpilih'];
            $p['wmape']           = (float)$p['wmape'];
            $p['akurasi']         = (float)max(0, 100 - $p['wmape']);
            $p['is_valid']        = (int)$p['is_valid'];
        }

        return $this->response->setJSON($prediksi);
    }

    public function rekomendasi()
    {
        $db = \Config\Database::connect();
        $metaModel = new MetaModel();

        $alphaRaw = $this->request->getGet('alpha');
        if ($alphaRaw === null) {
            $savedAlpha = $metaModel->find('alpha_setting');
            $alpha = $savedAlpha ? (float)$savedAlpha['value'] : 0.50;
        } else {
            $alpha = (float)$alphaRaw;
        }
        if ($alpha <= 0.0 || $alpha > 1.0) {
            $alpha = 0.50;
        }

        $rows = $db->table('rekomendasi_belanja rb')
                   ->select('
                      b.id as id_barang,
                      b.kode_barang,
                      b.nama_barang,
                      b.satuan,
                      b.satuan_beli,
                      b.satuan_resep,
                      b.faktor_konversi,
                      b.stok_gudang,
                      rb.prediksi_kebutuhan as total_prediksi_kebutuhan,
                      rb.kebutuhan_belanja as unit_beli,
                      rb.tgl_prediksi
                   ')
                   ->join('barang b', 'rb.id_barang = b.id')
                   ->orderBy('b.nama_barang', 'ASC')
                   ->get()
                   ->getResultArray();

        if (empty($rows)) {
            try {
                $this->runPredictionProcess($alpha);
                $rows = $db->table('rekomendasi_belanja rb')
                           ->select('
                              b.id as id_barang,
                              b.kode_barang,
                              b.nama_barang,
                              b.satuan,
                              b.satuan_beli,
                              b.satuan_resep,
                              b.faktor_konversi,
                              b.stok_gudang,
                              rb.prediksi_kebutuhan as total_prediksi_kebutuhan,
                              rb.kebutuhan_belanja as unit_beli,
                              rb.tgl_prediksi
                           ')
                           ->join('barang b', 'rb.id_barang = b.id')
                           ->orderBy('b.nama_barang', 'ASC')
                           ->get()
                           ->getResultArray();
            } catch (\Exception $pe) {}
        }

        $result = [];
        foreach ($rows as $r) {
            $bId = (int)$r['id_barang'];
            $factor = (float)$r['faktor_konversi'] ?: 1.0;
            $stokGudang = (float)$r['stok_gudang'];
            $totalPred = (float)$r['total_prediksi_kebutuhan'];

            $rawSeries = $this->getBarangWeeklyAggregation($bId);
            $smoothedSeries = $this->movingAvgSmooth($rawSeries);

            $sumErr = 0.0;
            $sumAct = 0.0;
            $len = count($rawSeries);
            if ($len >= 2) {
                $S = [(float)$smoothedSeries[0]];
                for ($k = 1; $k < $len; $k++) {
                    $prevX = (float)$smoothedSeries[$k - 1];
                    $prevS = $S[$k - 1];
                    $S[] = $alpha * $prevX + (1.0 - $alpha) * $prevS;
                }
                for ($k = 0; $k < $len; $k++) {
                    $actual = (float)$rawSeries[$k];
                    $pred   = $S[$k];
                    $sumErr += abs($actual - $pred);
                    $sumAct += $actual;
                }
            }
            $wmapeVal = $sumAct > 0 ? ($sumErr / $sumAct) * 100.0 : 0.0;
            $akurasiVal = max(0.0, 100.0 - $wmapeVal);
            $netNeed = max(0.0, $totalPred - $stokGudang);

            $result[] = array_merge($r, [
                'id_barang'                => $bId,
                'faktor_konversi'          => $factor,
                'stok_gudang'              => $stokGudang,
                'raw_series'               => $rawSeries,
                'smoothed_series'          => $smoothedSeries,
                'total_prediksi_kebutuhan' => round($totalPred, 2),
                'total_kebutuhan_bersih'   => round($netNeed, 2),
                'unit_beli'                => $r['unit_beli'],
                'wmape'                    => round($wmapeVal, 2),
                'akurasi'                  => round($akurasiVal, 2),
            ]);
        }

        return $this->response->setJSON($result);
    }

    public function sampleTransaksi()
    {
        $db = \Config\Database::connect();
        // Get all transactions grouped by tanggal & menu for operational days (exclude Sunday)
        $rows = $db->table('transaksi t')
                   ->select('t.tanggal, m.nama_menu, SUM(t.jumlah) as total_jumlah')
                   ->join('menu m', 't.id_menu = m.id')
                   ->groupBy('t.tanggal, t.id_menu')
                   ->orderBy('t.tanggal', 'DESC')
                   ->get()
                   ->getResultArray();

        // Filter last 24 operational days (Senin - Sabtu)
        $validDaysMap = [];
        foreach ($rows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            $dayOfWeek = (int)date('N', $ts);
            if ($dayOfWeek === 7) continue; // Exclude Sunday

            $dateKey = date('Y-m-d', $ts);
            if (!isset($validDaysMap[$dateKey])) {
                if (count($validDaysMap) >= 24) {
                    continue; // limit to 24 operational days max
                }
                $validDaysMap[$dateKey] = [
                    'tanggal' => $dateKey,
                    'hari'    => date('l', $ts),
                    'items'   => [],
                    'total_cup' => 0
                ];
            }
            $validDaysMap[$dateKey]['items'][] = [
                'nama_menu' => $r['nama_menu'],
                'jumlah'    => (int)$r['total_jumlah']
            ];
            $validDaysMap[$dateKey]['total_cup'] += (int)$r['total_jumlah'];
        }

        // Translate day name to Indonesian
        $hariIndo = [
            'Monday' => 'Senin', 'Tuesday' => 'Selasa', 'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis', 'Friday' => 'Jumat', 'Saturday' => 'Sabtu'
        ];

        $data = array_values($validDaysMap);
        foreach ($data as &$d) {
            $d['hari_indo'] = $hariIndo[$d['hari']] ?? $d['hari'];
        }

        return $this->response->setJSON([
            'total_hari' => count($data),
            'data'       => $data
        ]);
    }

    public function rekapPerPekan()
    {
        $db = \Config\Database::connect();
        
        $rows = $db->table('transaksi t')
                   ->select('t.tanggal, t.id_menu, m.nama_menu, SUM(t.jumlah) as total_jumlah')
                   ->join('menu m', 't.id_menu = m.id')
                   ->groupBy('t.tanggal, t.id_menu')
                   ->orderBy('t.tanggal', 'ASC')
                   ->get()
                   ->getResultArray();

        // 1. Get all unique operational days (excluding Sunday)
        $opDaysMap = [];
        foreach ($rows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue; // Exclude Sunday
            $opDaysMap[date('Y-m-d', $ts)] = true;
        }

        $uniqueDays = array_keys($opDaysMap);
        sort($uniqueDays);

        // 2. Map operational days to 4 operational weeks (6 days per block)
        $dayToBlockIndex = [];
        foreach ($uniqueDays as $idx => $dayStr) {
            $blockIdx = (int)floor($idx / 6); // 0 = Pekan 1, 1 = Pekan 2, 2 = Pekan 3, 3 = Pekan 4
            if ($blockIdx < 4) {
                $dayToBlockIndex[$dayStr] = $blockIdx;
            }
        }

        // 3. Aggregate total sales per menu per operational week
        $menuDataMap = [];
        foreach ($rows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue;

            $dateStr = date('Y-m-d', $ts);
            if (!isset($dayToBlockIndex[$dateStr])) continue;

            $blockIdx = $dayToBlockIndex[$dateStr];
            $menuName = $r['nama_menu'];

            if (!isset($menuDataMap[$menuName])) {
                $menuDataMap[$menuName] = [0, 0, 0, 0];
            }
            $menuDataMap[$menuName][$blockIdx] += (int)$r['total_jumlah'];
        }

        $menuModel = new MenuModel();
        $allMenus = $menuModel->where('aktif', 1)->orderBy('nama_menu', 'ASC')->findAll();

        $resultRows = [];
        foreach ($allMenus as $menu) {
            $mName = $menu['nama_menu'];
            $blocks = $menuDataMap[$mName] ?? [0, 0, 0, 0];
            $w1 = $blocks[0];
            $w2 = $blocks[1];
            $w3 = $blocks[2];
            $w4 = $blocks[3];

            $resultRows[] = [
                'nama_menu' => $mName,
                'pekan_1'   => $w1,
                'pekan_2'   => $w2,
                'pekan_3'   => $w3,
                'pekan_4'   => $w4,
                'total'     => ($w1 + $w2 + $w3 + $w4)
            ];
        }

        return $this->response->setJSON([
            'success' => true,
            'data'    => $resultRows
        ]);
    }

    public function chartMenu($id_menu)
    {
        $id_menu = (int)$id_menu;
        $rawSeries = $this->getWeeklyAggregation($id_menu);
        $smoothedSeries = $this->movingAvgSmooth($rawSeries);

        $hasilPrediksiModel = new HasilPrediksiModel();
        $pred = $hasilPrediksiModel->where('id_menu', $id_menu)->first();
        
        if ($pred) {
            $pred['id']             = (int)$pred['id'];
            $pred['id_menu']        = (int)$pred['id_menu'];
            $pred['prediksi_cup']   = (int)$pred['prediksi_cup'];
            $pred['alpha_terpilih'] = (float)$pred['alpha_terpilih'];
            $pred['wmape']          = (float)$pred['wmape'];
            $pred['akurasi']        = (float)($pred['akurasi_a'] ?? max(0, 100 - $pred['wmape']));
            $pred['is_valid']       = (int)$pred['is_valid'];
        }

        return $this->response->setJSON([
            'series'   => $rawSeries,
            'smoothed' => $smoothedSeries,
            'pred'     => $pred ?: null
        ]);
    }

    public function getMenusForBarang($idBarang)
    {
        $idBarang = (int)$idBarang;
        $db = \Config\Database::connect();
        $rows = $db->table('takaran s')
                   ->select('m.id, m.nama_menu, m.harga, s.gramasi, b.satuan_resep, b.nama_barang')
                   ->join('menu m', 's.id_menu = m.id')
                   ->join('barang b', 's.id_barang = b.id')
                   ->where('s.id_barang', $idBarang)
                   ->where('m.aktif', 1)
                   ->orderBy('m.nama_menu', 'ASC')
                   ->get()->getResultArray();
        return $this->response->setJSON($rows);
    }

    private function getBarangMenuWeeklyAggregation($idBarang, $idMenu)
    {
        $db = \Config\Database::connect();

        $allRows = $db->table('transaksi')
                      ->select('tanggal')
                      ->groupBy('tanggal')
                      ->orderBy('tanggal', 'ASC')
                      ->get()->getResultArray();

        $opDays = [];
        foreach ($allRows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue;
            $opDays[date('Y-m-d', $ts)] = true;
        }
        $uniqueDays = array_keys($opDays);
        sort($uniqueDays);

        $dayToBlock = [];
        foreach ($uniqueDays as $idx => $dayStr) {
            $blockIdx = (int)floor($idx / 6);
            if ($blockIdx < 4) {
                $dayToBlock[$dayStr] = $blockIdx;
            }
        }

        $rows = $db->table('transaksi t')
                   ->select('t.tanggal, t.jumlah as menu_sales_qty, s.gramasi, (t.jumlah * s.gramasi) as usage_amount')
                   ->join('takaran s', 't.id_menu = s.id_menu')
                   ->where('s.id_barang', $idBarang)
                   ->where('t.id_menu', $idMenu)
                   ->orderBy('t.tanggal', 'ASC')
                   ->get()->getResultArray();

        $salesSeries = [0.0, 0.0, 0.0, 0.0];
        $usageSeries = [0.0, 0.0, 0.0, 0.0];

        foreach ($rows as $r) {
            $ts = strtotime($r['tanggal']);
            if (!$ts) continue;
            if ((int)date('N', $ts) === 7) continue;

            $dStr = date('Y-m-d', $ts);
            if (!isset($dayToBlock[$dStr])) continue;

            $bIdx = $dayToBlock[$dStr];
            $salesSeries[$bIdx] += (float)$r['menu_sales_qty'];
            $usageSeries[$bIdx] += (float)$r['usage_amount'];
        }

        return [
            'sales_series' => $salesSeries,
            'usage_series' => $usageSeries,
            'weeks'        => ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Pekan 4']
        ];
    }

    public function calculateSpecific()
    {
        $idBarang = (int)($this->request->getGet('id_barang') ?? $this->request->getPost('id_barang') ?? 0);
        $idMenu   = (int)($this->request->getGet('id_menu')   ?? $this->request->getPost('id_menu')   ?? 0);
        $alphaRaw = $this->request->getGet('alpha') ?? $this->request->getPost('alpha') ?? null;

        if (!$idBarang || !$idMenu) {
            return $this->response->setStatusCode(400)->setJSON(['error' => 'Pilih Bahan Baku dan Menu terlebih dahulu.']);
        }

        if ($alphaRaw === null) {
            $metaModel = new MetaModel();
            $savedAlpha = $metaModel->find('alpha_setting');
            $alpha = $savedAlpha ? (float)$savedAlpha['value'] : 0.50;
        } else {
            $alpha = (float)$alphaRaw;
        }
        if ($alpha <= 0.0 || $alpha > 1.0) {
            $alpha = 0.50;
        }

        $db = \Config\Database::connect();
        $barang = $db->table('barang')->where('id', $idBarang)->get()->getRowArray();
        $menu   = $db->table('menu')->where('id', $idMenu)->get()->getRowArray();
        $sop    = $db->table('takaran')->where('id_barang', $idBarang)->where('id_menu', $idMenu)->get()->getRowArray();

        if (!$barang || !$menu || !$sop) {
            return $this->response->setStatusCode(404)->setJSON(['error' => 'Bahan Baku tidak digunakan dalam resep takaran menu ini.']);
        }

        $factor   = (float)($barang['faktor_konversi'] ?: 1.0);
        $gramasi  = (float)($sop['gramasi'] ?: 0.0);

        $aggData     = $this->getBarangMenuWeeklyAggregation($idBarang, $idMenu);
        $salesSeries = $aggData['sales_series'];
        $usageSeries = $aggData['usage_series'];
        $weeks       = $aggData['weeks'];

        $weekLabels = [];
        for ($i = 0; $i < count($salesSeries); $i++) {
            $weekLabels[] = 'Pekan ' . ($i + 1);
        }

        if (empty($usageSeries)) {
            return $this->response->setJSON([
                'barang'                => $barang,
                'menu'                  => $menu,
                'alpha'                 => $alpha,
                'gramasi_per_cup'       => $gramasi,
                'week_labels'           => [],
                'sales_series'          => [],
                'usage_series'          => [],
                'predicted_cups'        => 0,
                'predicted_usage_resep' => 0,
                'predicted_usage_beli'  => 0,
                'wmape'                 => 0,
                'akurasi'               => 100,
                'has_data'              => false
            ]);
        }

        $smoothedSales = $this->movingAvgSmooth($salesSeries);
        $resSales      = $this->runSES($salesSeries, $smoothedSales, $alpha);

        $smoothedUsage = $this->movingAvgSmooth($usageSeries);
        $resUsage      = $this->runSES($usageSeries, $smoothedUsage, $alpha);

        $stokGudang           = (float)($barang['stok_gudang'] ?: 0.0);
        $stokGudangBeli       = $factor > 0 ? round($stokGudang / $factor, 2) : 0;

        $predUsageResep       = (float)$resUsage['prediction_raw'];
        $predUsageBeli        = $factor > 0 ? round($predUsageResep / $factor, 2) : 0;

        $kebutuhanBersihResep = max(0.0, $predUsageResep - $stokGudang);
        $kebutuhanBersihBeli  = $factor > 0 ? round($kebutuhanBersihResep / $factor, 2) : 0;

        $rekomendasiBelanja    = $factor > 0 ? (int)ceil($kebutuhanBersihResep / $factor) : 0;

        return $this->response->setJSON([
            'barang'                 => $barang,
            'menu'                   => $menu,
            'alpha'                  => $alpha,
            'gramasi_per_cup'        => $gramasi,
            'week_labels'            => $weekLabels,
            'sales_series'           => $salesSeries,
            'usage_series'           => $usageSeries,
            'predicted_cups'         => (int)ceil($resSales['prediction_raw']),
            'predicted_usage_resep'  => round($predUsageResep, 2),
            'predicted_usage_beli'   => $predUsageBeli,
            'stok_gudang_resep'      => $stokGudang,
            'stok_gudang_beli'       => $stokGudangBeli,
            'kebutuhan_bersih_resep' => round($kebutuhanBersihResep, 2),
            'kebutuhan_bersih_beli'  => $kebutuhanBersihBeli,
            'rekomendasi_belanja'    => $rekomendasiBelanja,
            'wmape'                  => round((float)$resUsage['wmape'], 2),
            'akurasi'                => round((float)$resUsage['akurasi'], 2),
            'has_data'               => true
        ]);
    }
}

