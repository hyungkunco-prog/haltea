import express from 'express';
import multer from 'multer';
import { requireAuth, requireAdmin } from '../utils/jwtHelper.js';

import * as authController from '../controllers/authController.js';
import * as statsController from '../controllers/statsController.js';
import * as barangController from '../controllers/barangController.js';
import * as menuController from '../controllers/menuController.js';
import * as takaranController from '../controllers/takaranController.js';
import * as transaksiController from '../controllers/transaksiController.js';
import * as predictController from '../controllers/predictController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// --- Auth Routes ---
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/auth/status', authController.status);
router.get('/user/profile', requireAuth, authController.profile);
router.post('/user/profile', requireAuth, authController.updateProfile);

// --- Stats Routes ---
router.get('/stats', statsController.index);

// --- Barang Routes ---
router.get('/barang', barangController.index);
router.post('/barang', requireAdmin, barangController.create);
router.put('/barang/:id', requireAdmin, barangController.update);
router.delete('/barang/:id', requireAdmin, barangController.remove);
router.put('/barang/:id/tambah-stok', requireAdmin, barangController.tambahStok);

// --- Menu Routes ---
router.get('/menu', menuController.index);
router.post('/menu', requireAdmin, menuController.create);
router.put('/menu/:id', requireAdmin, menuController.update);
router.delete('/menu/:id', requireAdmin, menuController.remove);

// --- Takaran (SOP) Routes ---
router.get('/takaran', takaranController.index);
router.get('/takaran/menu/:id_menu', takaranController.getByMenu);
router.post('/takaran', requireAdmin, takaranController.create);
router.delete('/takaran/:id', requireAdmin, takaranController.remove);

// Backward compatibility alias for SOP
router.get('/sop', takaranController.index);
router.get('/sop/menu/:id_menu', takaranController.getByMenu);
router.post('/sop', requireAdmin, takaranController.create);
router.delete('/sop/:id', requireAdmin, takaranController.remove);

// --- Transaksi Routes ---
router.get('/transaksi', transaksiController.index);
router.post('/transaksi', transaksiController.create);
router.delete('/transaksi/:id', transaksiController.remove);
router.post('/transaksi/import', upload.single('file'), transaksiController.importTransactions);
router.post('/transaksi/reset', transaksiController.reset);
router.post('/transaksi/restore', transaksiController.restore);
router.get('/transaksi/batches', transaksiController.getBatches);
router.post('/transaksi/restore-batch/:id', transaksiController.restoreBatch);

// --- Predict Routes ---
router.get('/predict', predictController.index);
router.post('/predict', predictController.index);
router.get('/predict/alpha', predictController.getAlpha);
router.get('/predict/auto', predictController.auto);
router.post('/predict/auto', predictController.auto);
router.get('/prediksi/hasil', predictController.hasil);
router.get('/prediksi/rekomendasi', predictController.rekomendasi);
router.get('/prediksi/sample', predictController.sampleTransaksi);
router.get('/prediksi/rekap-pekan', predictController.rekapPerPekan);
router.get('/predict/barang-menus/:id', predictController.getMenusForBarang);
router.get('/predict/specific', predictController.calculateSpecific);
router.post('/predict/specific', predictController.calculateSpecific);
router.get('/chart-menu/:id', predictController.chartMenu);

export default router;
