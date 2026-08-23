<?php

namespace App\Models;

use CodeIgniter\Model;

class ImportBatchesModel extends Model
{
    protected $table            = 'riwayat_import_transaksi';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'nama_batch',
        'file_source',
        'total_transaksi',
        'keterangan',
        'data_json',
        'tgl_import'
    ];
}
