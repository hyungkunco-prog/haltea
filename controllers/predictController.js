import { query, getConnection } from '../config/database.js';
import {
    getWeeklyAggregation,
    getBarangWeeklyAggregation,
    getBarangMenuWeeklyAggregation,
    movingAvgSmooth,
    runSES
} from '../utils/sesAlgorithm.js';

export async function runPredictionProcess(alpha = 0.50) {
    let cleanAlpha = parseFloat(alpha);
    if (isNaN(cleanAlpha) || cleanAlpha <= 0.0 || cleanAlpha > 1.0) {
        cleanAlpha = 0.50;
    }

    const conn = await getConnection();
    try {
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('TRUNCATE TABLE rekomendasi_belanja');
        await conn.query('TRUNCATE TABLE hasil_prediksi');
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');

        // Save alpha setting to meta
        await conn.query(`
            INSERT INTO meta (\`key\`, \`value\`) 
            VALUES ('alpha_setting', ?) 
            ON DUPLICATE KEY UPDATE \`value\` = ?
        `, [String(cleanAlpha), String(cleanAlpha)]);

        const [barangList] = await conn.query('SELECT * FROM barang ORDER BY kode_barang ASC');
        const [menuList] = await conn.query('SELECT * FROM menu WHERE aktif = 1 ORDER BY nama_menu ASC');

        // 1. Menu Level SES predictions
        const predResults = [];
        for (const menu of menuList) {
            const rawSeries = await getWeeklyAggregation(menu.id);
            if (rawSeries.length < 2) {
                const [res] = await conn.query(`
                    INSERT INTO hasil_prediksi (id_menu, nama_menu, prediksi_cup, alpha_terpilih, wmape, is_valid)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [menu.id, menu.nama_menu, 0, cleanAlpha, 100.0, 0]);

                predResults.push({
                    id: res.insertId,
                    id_menu: menu.id,
                    nama_menu: menu.nama_menu,
                    prediksi_cup: 0,
                    alpha: cleanAlpha,
                    wmape: 100.0,
                    akurasi: 0.0,
                    valid: false
                });
                continue;
            }

            const smoothed = movingAvgSmooth(rawSeries);
            const ses = runSES(rawSeries, smoothed, cleanAlpha);

            const [res] = await conn.query(`
                INSERT INTO hasil_prediksi (id_menu, nama_menu, prediksi_cup, alpha_terpilih, wmape, is_valid)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [menu.id, menu.nama_menu, ses.prediction, ses.alpha, ses.wmape, ses.valid ? 1 : 0]);

            predResults.push({
                id: res.insertId,
                id_menu: menu.id,
                nama_menu: menu.nama_menu,
                prediksi_cup: ses.prediction,
                prediksi_cup_raw: ses.prediction_raw,
                alpha: ses.alpha,
                wmape: ses.wmape,
                akurasi: ses.akurasi,
                valid: ses.valid
            });
        }

        // 2. Direct Raw Material Centered Prediction
        for (const b of barangList) {
            const bId = parseInt(b.id, 10);
            const factor = parseFloat(b.faktor_konversi) || 1.0;
            const stokGudang = parseFloat(b.stok_gudang || 0);

            const rawSeries = await getBarangWeeklyAggregation(bId);
            const len = rawSeries.length;

            if (len < 2) {
                await conn.query(`
                    INSERT INTO rekomendasi_belanja (id_prediksi, id_barang, prediksi_kebutuhan, stok_gudang, kebutuhan_belanja, tgl_prediksi)
                    VALUES (NULL, ?, ?, ?, ?, NOW())
                `, [bId, 0.0, stokGudang, 0.0]);
                continue;
            }

            const smoothed = movingAvgSmooth(rawSeries);

            // SES calculation on raw material smoothed series using cleanAlpha
            const S = [parseFloat(smoothed[0] || 0)];
            for (let k = 1; k < len; k++) {
                const prevX = parseFloat(smoothed[k - 1] || 0);
                const prevS = S[k - 1];
                S.push(cleanAlpha * prevX + (1.0 - cleanAlpha) * prevS);
            }

            const lastX = parseFloat(smoothed[len - 1] || 0);
            const lastS = S[len - 1];
            const nextPred = cleanAlpha * lastX + (1.0 - cleanAlpha) * lastS;

            const belanja = nextPred > 0 ? Math.ceil(nextPred / factor) : 0;

            await conn.query(`
                INSERT INTO rekomendasi_belanja (id_prediksi, id_barang, prediksi_kebutuhan, stok_gudang, kebutuhan_belanja, tgl_prediksi)
                VALUES (NULL, ?, ?, ?, ?, NOW())
            `, [bId, nextPred, stokGudang, belanja * factor]);
        }

        // Update meta 'last_prediction'
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        await conn.query(`
            INSERT INTO meta (\`key\`, \`value\`) 
            VALUES ('last_prediction', ?) 
            ON DUPLICATE KEY UPDATE \`value\` = ?
        `, [nowStr, nowStr]);

        conn.release();
        return predResults;
    } catch (err) {
        conn.release();
        throw err;
    }
}

export async function getAlpha(req, res) {
    try {
        const [rows] = await query("SELECT value FROM meta WHERE `key` = 'alpha_setting'");
        const alpha = rows[0] ? parseFloat(rows[0].value) : 0.50;
        return res.json({ alpha });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function index(req, res) {
    try {
        const input = req.body || {};
        let alphaRaw = input.alpha || req.query.alpha;

        if (alphaRaw === undefined || alphaRaw === null) {
            const [rows] = await query("SELECT value FROM meta WHERE `key` = 'alpha_setting'");
            alphaRaw = rows[0] ? parseFloat(rows[0].value) : 0.50;
        }

        let alpha = parseFloat(alphaRaw);
        if (isNaN(alpha) || alpha <= 0.0 || alpha > 1.0) {
            alpha = 0.50;
        }

        const results = await runPredictionProcess(alpha);
        return res.json({
            success: true,
            alpha,
            message: `Prediksi bahan baku 6 hari operasional pekan depan berhasil diperbarui (Alpha = ${alpha}).`,
            results
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function auto(req, res) {
    try {
        const [rows] = await query("SELECT value FROM meta WHERE `key` = 'last_sunday_prediction'");
        const lastSundayRun = rows[0] ? rows[0].value : '';

        const now = new Date();
        const year = now.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        const currentWeekKey = `${year}-W${String(weekNum).padStart(2, '0')}`;

        const isSunday = now.getDay() === 0;

        if (isSunday && lastSundayRun !== currentWeekKey) {
            await runPredictionProcess();
            await query(`
                INSERT INTO meta (\`key\`, \`value\`) 
                VALUES ('last_sunday_prediction', ?) 
                ON DUPLICATE KEY UPDATE \`value\` = ?
            `, [currentWeekKey, currentWeekKey]);

            return res.json({
                triggered: true,
                type: 'auto_sunday',
                message: 'Prediksi otomatis hari Minggu 00.00 WIB telah berhasil dijalankan.'
            });
        }

        return res.json({
            triggered: false,
            isSunday,
            lastRun: lastSundayRun
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function hasil(req, res) {
    try {
        const [prediksi] = await query('SELECT * FROM hasil_prediksi ORDER BY nama_menu ASC');
        const formatted = prediksi.map(p => ({
            ...p,
            id: parseInt(p.id, 10),
            id_menu: parseInt(p.id_menu, 10),
            prediksi_cup: parseInt(p.prediksi_cup || 0, 10),
            alpha_terpilih: parseFloat(p.alpha_terpilih || 0.5),
            wmape: parseFloat(p.wmape || 0),
            akurasi: Math.max(0, 100 - parseFloat(p.wmape || 0)),
            is_valid: parseInt(p.is_valid || 0, 10)
        }));
        return res.json(formatted);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function rekomendasi(req, res) {
    try {
        let alphaRaw = req.query.alpha;
        if (alphaRaw === undefined || alphaRaw === null) {
            const [rows] = await query("SELECT value FROM meta WHERE `key` = 'alpha_setting'");
            alphaRaw = rows[0] ? parseFloat(rows[0].value) : 0.50;
        }
        let alpha = parseFloat(alphaRaw);
        if (isNaN(alpha) || alpha <= 0.0 || alpha > 1.0) {
            alpha = 0.50;
        }

        let [rows] = await query(`
            SELECT 
                b.id as id_barang,
                b.kode_barang,
                b.nama_barang,
                b.satuan,
                b.satuan_beli,
                b.satuan_resep,
                b.faktor_konversi,
                b.stok_gudang,
                rb.prediksi_kebutuhan as total_prediksi_kebutuhan,
                rb.kebutuhan_belanja as unit_beli,
                rb.tgl_prediksi
            FROM rekomendasi_belanja rb
            INNER JOIN barang b ON rb.id_barang = b.id
            ORDER BY b.nama_barang ASC
        `);

        if (rows.length === 0) {
            await runPredictionProcess(alpha);
            const [newRows] = await query(`
                SELECT 
                    b.id as id_barang,
                    b.kode_barang,
                    b.nama_barang,
                    b.satuan,
                    b.satuan_beli,
                    b.satuan_resep,
                    b.faktor_konversi,
                    b.stok_gudang,
                    rb.prediksi_kebutuhan as total_prediksi_kebutuhan,
                    rb.kebutuhan_belanja as unit_beli,
                    rb.tgl_prediksi
                FROM rekomendasi_belanja rb
                INNER JOIN barang b ON rb.id_barang = b.id
                ORDER BY b.nama_barang ASC
            `);
            rows = newRows;
        }

        const result = [];
        for (const r of rows) {
            const bId = parseInt(r.id_barang, 10);
            const factor = parseFloat(r.faktor_konversi) || 1.0;
            const stokGudang = parseFloat(r.stok_gudang || 0);
            const totalPred = parseFloat(r.total_prediksi_kebutuhan || 0);

            const rawSeries = await getBarangWeeklyAggregation(bId);
            const smoothedSeries = movingAvgSmooth(rawSeries);

            let sumErr = 0.0;
            let sumAct = 0.0;
            const len = rawSeries.length;

            if (len >= 2) {
                const S = [parseFloat(smoothedSeries[0] || 0)];
                for (let k = 1; k < len; k++) {
                    const prevX = parseFloat(smoothedSeries[k - 1] || 0);
                    const prevS = S[k - 1];
                    S.push(alpha * prevX + (1.0 - alpha) * prevS);
                }
                for (let k = 0; k < len; k++) {
                    const actual = parseFloat(rawSeries[k] || 0);
                    const pred = S[k];
                    sumErr += Math.abs(actual - pred);
                    sumAct += actual;
                }
            }

            const wmapeVal = sumAct > 0 ? (sumErr / sumAct) * 100.0 : 0.0;
            const akurasiVal = Math.max(0.0, 100.0 - wmapeVal);
            const netNeed = Math.max(0.0, totalPred - stokGudang);

            result.push({
                ...r,
                id_barang: bId,
                faktor_konversi: factor,
                stok_gudang: stokGudang,
                raw_series: rawSeries,
                smoothed_series: smoothedSeries,
                total_prediksi_kebutuhan: Math.round(totalPred * 100) / 100,
                total_kebutuhan_bersih: Math.round(netNeed * 100) / 100,
                unit_beli: r.unit_beli,
                wmape: Math.round(wmapeVal * 100) / 100,
                akurasi: Math.round(akurasiVal * 100) / 100
            });
        }

        return res.json(result);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function sampleTransaksi(req, res) {
    try {
        const [rows] = await query(`
            SELECT t.tanggal, m.nama_menu, SUM(t.jumlah) as total_jumlah
            FROM transaksi t
            INNER JOIN menu m ON t.id_menu = m.id
            GROUP BY t.tanggal, t.id_menu
            ORDER BY t.tanggal DESC
        `);

        const validDaysMap = {};
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const hariIndo = {
            'Monday': 'Senin', 'Tuesday': 'Selasa', 'Wednesday': 'Rabu',
            'Thursday': 'Kamis', 'Friday': 'Jumat', 'Saturday': 'Sabtu'
        };

        for (const r of rows) {
            const d = new Date(r.tanggal);
            if (isNaN(d.getTime())) continue;
            if (d.getDay() === 0) continue; // Exclude Sunday

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateKey = `${year}-${month}-${day}`;

            if (!validDaysMap[dateKey]) {
                if (Object.keys(validDaysMap).length >= 24) continue;
                const dayName = days[d.getDay()];
                validDaysMap[dateKey] = {
                    tanggal: dateKey,
                    hari: dayName,
                    hari_indo: hariIndo[dayName] || dayName,
                    items: [],
                    total_cup: 0
                };
            }

            validDaysMap[dateKey].items.push({
                nama_menu: r.nama_menu,
                jumlah: parseInt(r.total_jumlah || 0, 10)
            });
            validDaysMap[dateKey].total_cup += parseInt(r.total_jumlah || 0, 10);
        }

        const data = Object.values(validDaysMap);
        return res.json({
            total_hari: data.length,
            data
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function rekapPerPekan(req, res) {
    try {
        const [rows] = await query(`
            SELECT t.tanggal, t.id_menu, m.nama_menu, SUM(t.jumlah) as total_jumlah
            FROM transaksi t
            INNER JOIN menu m ON t.id_menu = m.id
            GROUP BY t.tanggal, t.id_menu
            ORDER BY t.tanggal ASC
        `);

        const opDaysMap = {};
        for (const r of rows) {
            const d = new Date(r.tanggal);
            if (isNaN(d.getTime())) continue;
            if (d.getDay() === 0) continue;

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            opDaysMap[`${year}-${month}-${day}`] = true;
        }

        const uniqueDays = Object.keys(opDaysMap).sort();
        const dayToBlockIndex = {};
        for (let idx = 0; idx < uniqueDays.length; idx++) {
            const blockIdx = Math.floor(idx / 6);
            if (blockIdx < 4) {
                dayToBlockIndex[uniqueDays[idx]] = blockIdx;
            }
        }

        const menuDataMap = {};
        for (const r of rows) {
            const d = new Date(r.tanggal);
            if (isNaN(d.getTime())) continue;
            if (d.getDay() === 0) continue;

            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const dateStr = `${year}-${month}-${day}`;

            if (dayToBlockIndex[dateStr] === undefined) continue;

            const blockIdx = dayToBlockIndex[dateStr];
            const menuName = r.nama_menu;

            if (!menuDataMap[menuName]) {
                menuDataMap[menuName] = [0, 0, 0, 0];
            }
            menuDataMap[menuName][blockIdx] += parseInt(r.total_jumlah || 0, 10);
        }

        const [allMenus] = await query('SELECT * FROM menu WHERE aktif = 1 ORDER BY nama_menu ASC');

        const resultRows = allMenus.map(menu => {
            const mName = menu.nama_menu;
            const blocks = menuDataMap[mName] || [0, 0, 0, 0];
            const w1 = blocks[0];
            const w2 = blocks[1];
            const w3 = blocks[2];
            const w4 = blocks[3];

            return {
                nama_menu: mName,
                pekan_1: w1,
                pekan_2: w2,
                pekan_3: w3,
                pekan_4: w4,
                total: (w1 + w2 + w3 + w4)
            };
        });

        return res.json({
            success: true,
            data: resultRows
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function chartMenu(req, res) {
    const id_menu = parseInt(req.params.id || 0, 10);
    try {
        const rawSeries = await getWeeklyAggregation(id_menu);
        const smoothedSeries = movingAvgSmooth(rawSeries);

        const [predList] = await query('SELECT * FROM hasil_prediksi WHERE id_menu = ? LIMIT 1', [id_menu]);
        let pred = null;
        if (predList[0]) {
            const p = predList[0];
            pred = {
                ...p,
                id: parseInt(p.id, 10),
                id_menu: parseInt(p.id_menu, 10),
                prediksi_cup: parseInt(p.prediksi_cup || 0, 10),
                alpha_terpilih: parseFloat(p.alpha_terpilih || 0.5),
                wmape: parseFloat(p.wmape || 0),
                akurasi: Math.max(0, 100 - parseFloat(p.wmape || 0)),
                is_valid: parseInt(p.is_valid || 0, 10)
            };
        }

        return res.json({
            series: rawSeries,
            smoothed: smoothedSeries,
            pred
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function getMenusForBarang(req, res) {
    const idBarang = parseInt(req.params.id || 0, 10);
    try {
        const [rows] = await query(`
            SELECT m.id, m.nama_menu, m.harga, s.gramasi, b.satuan_resep, b.nama_barang
            FROM takaran s
            INNER JOIN menu m ON s.id_menu = m.id
            INNER JOIN barang b ON s.id_barang = b.id
            WHERE s.id_barang = ? AND m.aktif = 1
            ORDER BY m.nama_menu ASC
        `, [idBarang]);

        return res.json(rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function calculateSpecific(req, res) {
    const idBarang = parseInt(req.query.id_barang || req.body.id_barang || 0, 10);
    const idMenu = parseInt(req.query.id_menu || req.body.id_menu || 0, 10);
    let alphaRaw = req.query.alpha || req.body.alpha;

    if (!idBarang || !idMenu) {
        return res.status(400).json({ error: 'Pilih Bahan Baku dan Menu terlebih dahulu.' });
    }

    if (alphaRaw === undefined || alphaRaw === null) {
        const [rows] = await query("SELECT value FROM meta WHERE `key` = 'alpha_setting'");
        alphaRaw = rows[0] ? parseFloat(rows[0].value) : 0.50;
    }
    let alpha = parseFloat(alphaRaw);
    if (isNaN(alpha) || alpha <= 0.0 || alpha > 1.0) {
        alpha = 0.50;
    }

    try {
        const [barangList] = await query('SELECT * FROM barang WHERE id = ?', [idBarang]);
        const [menuList] = await query('SELECT * FROM menu WHERE id = ?', [idMenu]);
        const [sopList] = await query('SELECT * FROM takaran WHERE id_barang = ? AND id_menu = ?', [idBarang, idMenu]);

        const barang = barangList[0];
        const menu = menuList[0];
        const sop = sopList[0];

        if (!barang || !menu || !sop) {
            return res.status(404).json({ error: 'Bahan Baku tidak digunakan dalam resep takaran menu ini.' });
        }

        const factor = parseFloat(barang.faktor_konversi) || 1.0;
        const gramasi = parseFloat(sop.gramasi) || 0.0;

        const aggData = await getBarangMenuWeeklyAggregation(idBarang, idMenu);
        const salesSeries = aggData.sales_series;
        const usageSeries = aggData.usage_series;

        const weekLabels = salesSeries.map((_, i) => `Pekan ${i + 1}`);

        const smoothedSales = movingAvgSmooth(salesSeries);
        const resSales = runSES(salesSeries, smoothedSales, alpha);

        const smoothedUsage = movingAvgSmooth(usageSeries);
        const resUsage = runSES(usageSeries, smoothedUsage, alpha);

        const stokGudang = parseFloat(barang.stok_gudang || 0);
        const stokGudangBeli = factor > 0 ? Math.round((stokGudang / factor) * 100) / 100 : 0;

        const predUsageResep = parseFloat(resUsage.prediction_raw || 0);
        const predUsageBeli = factor > 0 ? Math.round((predUsageResep / factor) * 100) / 100 : 0;

        const kebutuhanBersihResep = Math.max(0.0, predUsageResep - stokGudang);
        const kebutuhanBersihBeli = factor > 0 ? Math.round((kebutuhanBersihResep / factor) * 100) / 100 : 0;

        const rekomendasiBelanja = factor > 0 ? Math.ceil(kebutuhanBersihResep / factor) : 0;

        return res.json({
            barang,
            menu,
            alpha,
            gramasi_per_cup: gramasi,
            week_labels: weekLabels,
            sales_series: salesSeries,
            usage_series: usageSeries,
            predicted_cups: Math.ceil(resSales.prediction_raw),
            predicted_usage_resep: Math.round(predUsageResep * 100) / 100,
            predicted_usage_beli: predUsageBeli,
            stok_gudang_resep: stokGudang,
            stok_gudang_beli: stokGudangBeli,
            kebutuhan_bersih_resep: Math.round(kebutuhanBersihResep * 100) / 100,
            kebutuhan_bersih_beli: kebutuhanBersihBeli,
            rekomendasi_belanja: rekomendasiBelanja,
            wmape: Math.round(parseFloat(resUsage.wmape || 0) * 100) / 100,
            akurasi: Math.round(parseFloat(resUsage.akurasi || 0) * 100) / 100,
            has_data: true
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
