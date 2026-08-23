<?php

namespace App\Models;

use CodeIgniter\Model;

class RekomendasiBelanjaModel extends Model
{
    protected $table            = 'rekomendasi_belanja';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'id_prediksi',
        'id_barang',
        'prediksi_kebutuhan',
        'stok_gudang',
        'kebutuhan_belanja',
        'tgl_prediksi'
    ];
}
