<?php

namespace App\Models;

use CodeIgniter\Model;

class BarangModel extends Model
{
    protected $table            = 'barang';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'kode_barang',
        'nama_barang',
        'satuan',
        'satuan_beli',
        'satuan_resep',
        'faktor_konversi',
        'stok_gudang',
        'harga_beli',
        'lead_time_hari'
    ];
}
