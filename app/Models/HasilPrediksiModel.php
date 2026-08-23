<?php

namespace App\Models;

use CodeIgniter\Model;

class HasilPrediksiModel extends Model
{
    protected $table            = 'hasil_prediksi';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'id_menu',
        'nama_menu',
        'prediksi_cup',
        'alpha_terpilih',
        'wmape',
        'is_valid',
        'tgl_prediksi'
    ];
}
