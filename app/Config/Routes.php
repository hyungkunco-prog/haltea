<?php

namespace Config;

// Create a new instance of our RouteCollection class.
$routes = Services::routes();

// Load the system's routing file first, so that the app and ENVIRONMENT
// can override as needed.
if (is_file(SYSTEMPATH . 'Config/Routes.php')) {
    require SYSTEMPATH . 'Config/Routes.php';
}

/*
 * --------------------------------------------------------------------
 * Router Setup
 * --------------------------------------------------------------------
 */
$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Home');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();
// The Auto Routing (Legacy) is very dangerous. It is easy to create vulnerable apps
// where controller filters or CSRF protection are bypassed.
// If you don't want to define all routes, please use the Auto Routing (Improved).
// Set `$autoRoutesImproved` to true in `app/Config/Feature.php` and set the following to true.
// $routes->setAutoRoute(false);

/*
 * --------------------------------------------------------------------
 * Route Definitions
 * --------------------------------------------------------------------
 */

// We get a performance increase by specifying the default
// route since we don't have to scan directories.
$routes->get('/', 'Home::index');

$routes->group('api', ['namespace' => 'App\Controllers\Api'], function ($routes) {
    // Auth routes
    $routes->post('login', 'Auth::login');
    $routes->post('logout', 'Auth::logout');
    $routes->get('auth/status', 'Auth::status');
    $routes->get('user/profile', 'Auth::profile');
    $routes->post('user/profile', 'Auth::updateProfile');

    // Stats
    $routes->get('stats', 'Stats::index');

    // Barang
    $routes->get('barang', 'Barang::index');
    $routes->post('barang', 'Barang::create');
    $routes->put('barang/(:num)', 'Barang::update/$1');
    $routes->delete('barang/(:num)', 'Barang::delete/$1');
    $routes->put('barang/(:num)/tambah-stok', 'Barang::tambahStok/$1');

    // Menu
    $routes->get('menu', 'Menu::index');
    $routes->post('menu', 'Menu::create');
    $routes->put('menu/(:num)', 'Menu::update/$1');
    $routes->delete('menu/(:num)', 'Menu::delete/$1');

    // Takaran Menu
    $routes->get('takaran', 'Takaran::index');
    $routes->get('takaran/menu/(:num)', 'Takaran::menu/$1');
    $routes->post('takaran', 'Takaran::create');
    $routes->delete('takaran/(:num)', 'Takaran::delete/$1');

    // Sop (Backward compatibility)
    $routes->get('sop', 'Takaran::index');
    $routes->get('sop/menu/(:num)', 'Takaran::menu/$1');
    $routes->post('sop', 'Takaran::create');
    $routes->delete('sop/(:num)', 'Takaran::delete/$1');

    // Transaksi
    $routes->get('transaksi', 'Transaksi::index');
    $routes->post('transaksi', 'Transaksi::create');
    $routes->delete('transaksi/(:num)', 'Transaksi::delete/$1');
    $routes->post('transaksi/import', 'Transaksi::import');
    $routes->post('transaksi/reset', 'Transaksi::reset');
    $routes->post('transaksi/restore', 'Transaksi::restore');
    $routes->get('transaksi/batches', 'Transaksi::getBatches');
    $routes->post('transaksi/restore-batch/(:num)', 'Transaksi::restoreBatch/$1');

    // Predict
    $routes->post('predict', 'Predict::index');
    $routes->get('predict', 'Predict::index');
    $routes->get('predict/alpha', 'Predict::getAlpha');
    $routes->post('predict/auto', 'Predict::auto');
    $routes->get('predict/auto', 'Predict::auto');
    $routes->get('prediksi/hasil', 'Predict::hasil');
    $routes->get('prediksi/rekomendasi', 'Predict::rekomendasi');
    $routes->get('prediksi/sample', 'Predict::sampleTransaksi');
    $routes->get('prediksi/rekap-pekan', 'Predict::rekapPerPekan');
    $routes->get('predict/barang-menus/(:num)', 'Predict::getMenusForBarang/$1');
    $routes->get('predict/specific', 'Predict::calculateSpecific');
    $routes->post('predict/specific', 'Predict::calculateSpecific');
    $routes->get('chart-menu/(:num)', 'Predict::chartMenu/$1');
});

/*
 * --------------------------------------------------------------------
 * Additional Routing
 * --------------------------------------------------------------------
 *
 * There will often be times that you need additional routing and you
 * need it to be able to override any defaults in this file. Environment
 * based routes is one such time. require() additional route files here
 * to make that happen.
 *
 * You will have access to the $routes object within that file without
 * needing to reload it.
 */
if (is_file(APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php')) {
    require APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php';
}
