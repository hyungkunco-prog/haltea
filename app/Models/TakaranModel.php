<?php

namespace App\Models;

use CodeIgniter\Model;

class TakaranModel extends Model
{
    protected $table            = 'takaran';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'id_menu',
        'id_barang',
        'gramasi'
    ];
}
