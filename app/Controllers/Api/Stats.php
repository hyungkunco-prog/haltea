<?php

namespace App\Controllers\Api;

use App\Models\BarangModel;
use App\Models\MenuModel;
use App\Models\TransaksiModel;
use App\Models\HasilPrediksiModel;
use App\Models\MetaModel;

class Stats extends ApiController
{
    public function index()
    {
        $barangModel = new BarangModel();
        $menuModel = new MenuModel();
        $transaksiModel = new TransaksiModel();
        $hasilPrediksiModel = new HasilPrediksiModel();
        $metaModel = new MetaModel();

        $totalBarang = $barangModel->countAllResults();
        $totalMenu = $menuModel->where('aktif', 1)->countAllResults();
        $totalTrx = $transaksiModel->countAllResults();

        $lastPredRow = $metaModel->find('last_prediction');
        $lastPred = $lastPredRow['value'] ?? '-';

        $avgWmapeRow = $hasilPrediksiModel->selectAvg('wmape', 'avg_wmape')->where('is_valid', 1)->first();
        $avgWmape = $avgWmapeRow['avg_wmape'] ?? 0;

        $prediksiAktif = $hasilPrediksiModel->countAllResults();

        $intervalDaysRow = $metaModel->find('prediction_interval_days');
        $intervalDays = (int)($intervalDaysRow['value'] ?? 7);

        // Auto trigger calculation
        $user = $this->getAuthUser();
        $autoTrigger = false;
        if ($lastPred !== '-' && $user && $user['role'] === 'admin') {
            $lastPredTime = strtotime($lastPred);
            $daysSince = (time() - $lastPredTime) / (24 * 3600);
            $autoTrigger = $daysSince >= $intervalDays;
        }

        return $this->response->setJSON([
            'totalBarang'   => (int)$totalBarang,
            'totalMenu'     => (int)$totalMenu,
            'totalTrx'      => (int)$totalTrx,
            'lastPred'      => $lastPred,
            'avgWmape'      => $avgWmape ? round((float)$avgWmape, 2) : 0,
            'prediksiAktif' => (int)$prediksiAktif,
            'autoTrigger'   => $autoTrigger
        ]);
    }
}
