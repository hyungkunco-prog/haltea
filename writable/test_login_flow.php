<?php
// Simulate CodeIgniter request & login execution
define('HOMEPATH', __DIR__ . '/../');
require HOMEPATH . 'app/Config/Paths.php';
$paths = new Config\Paths();
require $paths->systemDirectory . '/bootstrap.php';

// Connect DB to verify configuration used by CI4
$db = \Config\Database::connect();
echo "CI4 DB Host: " . $db->hostname . ", Port: " . $db->port . ", DB: " . $db->database . "\n";

try {
    $userModel = new \App\Models\UserModel();
    $admin = $userModel->where('username', 'admin')->first();
    echo "Query 'admin' user from CI4 UserModel:\n";
    print_r($admin);
} catch (\Throwable $t) {
    echo "CI4 UserModel Error: " . $t->getMessage() . "\n";
}
