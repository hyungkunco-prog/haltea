import { query } from '../config/database.js';
import { getAuthUser } from '../utils/jwtHelper.js';

export async function index(req, res) {
    try {
        const [barangCount] = await query('SELECT COUNT(*) as count FROM barang');
        const [menuCount] = await query('SELECT COUNT(*) as count FROM menu WHERE aktif = 1');
        const [trxCount] = await query('SELECT COUNT(*) as count FROM transaksi');

        const [lastPredRow] = await query("SELECT value FROM meta WHERE `key` = 'last_prediction'");
        const lastPred = lastPredRow[0] ? lastPredRow[0].value : '-';

        const [avgWmapeRow] = await query('SELECT AVG(wmape) as avg_wmape FROM hasil_prediksi WHERE is_valid = 1');
        const avgWmape = avgWmapeRow[0] && avgWmapeRow[0].avg_wmape !== null ? parseFloat(avgWmapeRow[0].avg_wmape) : 0;

        const [predCount] = await query('SELECT COUNT(*) as count FROM hasil_prediksi');

        const [intervalRow] = await query("SELECT value FROM meta WHERE `key` = 'prediction_interval_days'");
        const intervalDays = intervalRow[0] ? parseInt(intervalRow[0].value, 10) : 7;

        // Auto trigger calculation
        const user = getAuthUser(req);
        let autoTrigger = false;
        if (lastPred !== '-' && user && user.role === 'admin') {
            const lastPredTime = new Date(lastPred).getTime();
            const daysSince = (Date.now() - lastPredTime) / (24 * 3600 * 1000);
            autoTrigger = daysSince >= intervalDays;
        }

        return res.json({
            totalBarang: parseInt(barangCount[0].count || 0, 10),
            totalMenu: parseInt(menuCount[0].count || 0, 10),
            totalTrx: parseInt(trxCount[0].count || 0, 10),
            lastPred,
            avgWmape: avgWmape ? Math.round(avgWmape * 100) / 100 : 0,
            prediksiAktif: parseInt(predCount[0].count || 0, 10),
            autoTrigger
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
