import { query } from '../config/database.js';

/**
 * Format a Date object to YYYY-MM-DD
 */
function formatDateKey(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Get operational days mapping (Exclude Sunday / Day 0, 6 operational days per block)
 */
async function getOperationalDaysMapping() {
    const [allRows] = await query(`
        SELECT tanggal 
        FROM transaksi 
        GROUP BY tanggal 
        ORDER BY tanggal ASC
    `);

    const opDays = {};
    for (const r of allRows) {
        const d = new Date(r.tanggal);
        if (isNaN(d.getTime())) continue;
        if (d.getDay() === 0) continue; // Skip Sunday
        opDays[formatDateKey(d)] = true;
    }

    const uniqueDays = Object.keys(opDays).sort();
    const dayToBlock = {};
    for (let idx = 0; idx < uniqueDays.length; idx++) {
        const blockIdx = Math.floor(idx / 6);
        if (blockIdx < 4) {
            dayToBlock[uniqueDays[idx]] = blockIdx;
        }
    }

    return dayToBlock;
}

/**
 * Weekly aggregation for a specific menu
 */
export async function getWeeklyAggregation(menuId) {
    const dayToBlock = await getOperationalDaysMapping();

    const [rows] = await query(`
        SELECT tanggal, SUM(jumlah) as total 
        FROM transaksi 
        WHERE id_menu = ? 
        GROUP BY tanggal 
        ORDER BY tanggal ASC
    `, [menuId]);

    const series = [0.0, 0.0, 0.0, 0.0];
    for (const row of rows) {
        const d = new Date(row.tanggal);
        if (isNaN(d.getTime())) continue;
        if (d.getDay() === 0) continue;

        const dStr = formatDateKey(d);
        if (dayToBlock[dStr] !== undefined) {
            const bIdx = dayToBlock[dStr];
            series[bIdx] += parseFloat(row.total || 0);
        }
    }

    return series;
}

/**
 * Weekly aggregation for a raw material
 */
export async function getBarangWeeklyAggregation(idBarang) {
    const dayToBlock = await getOperationalDaysMapping();

    const [rows] = await query(`
        SELECT t.tanggal, (t.jumlah * s.gramasi) as usage_amount 
        FROM transaksi t 
        INNER JOIN takaran s ON t.id_menu = s.id_menu 
        WHERE s.id_barang = ? 
        ORDER BY t.tanggal ASC
    `, [idBarang]);

    const series = [0.0, 0.0, 0.0, 0.0];
    for (const r of rows) {
        const d = new Date(r.tanggal);
        if (isNaN(d.getTime())) continue;
        if (d.getDay() === 0) continue;

        const dStr = formatDateKey(d);
        if (dayToBlock[dStr] !== undefined) {
            const bIdx = dayToBlock[dStr];
            series[bIdx] += parseFloat(r.usage_amount || 0);
        }
    }

    return series;
}

/**
 * Weekly aggregation for a specific combination of Barang and Menu
 */
export async function getBarangMenuWeeklyAggregation(idBarang, idMenu) {
    const dayToBlock = await getOperationalDaysMapping();

    const [rows] = await query(`
        SELECT t.tanggal, t.jumlah as menu_sales_qty, s.gramasi, (t.jumlah * s.gramasi) as usage_amount 
        FROM transaksi t 
        INNER JOIN takaran s ON t.id_menu = s.id_menu 
        WHERE s.id_barang = ? AND t.id_menu = ? 
        ORDER BY t.tanggal ASC
    `, [idBarang, idMenu]);

    const salesSeries = [0.0, 0.0, 0.0, 0.0];
    const usageSeries = [0.0, 0.0, 0.0, 0.0];

    for (const r of rows) {
        const d = new Date(r.tanggal);
        if (isNaN(d.getTime())) continue;
        if (d.getDay() === 0) continue;

        const dStr = formatDateKey(d);
        if (dayToBlock[dStr] !== undefined) {
            const bIdx = dayToBlock[dStr];
            salesSeries[bIdx] += parseFloat(r.menu_sales_qty || 0);
            usageSeries[bIdx] += parseFloat(r.usage_amount || 0);
        }
    }

    return {
        sales_series: salesSeries,
        usage_series: usageSeries,
        weeks: ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Pekan 4']
    };
}

/**
 * Moving Average Smoothing: S_t = (X_{t-1} + X_t) / 2
 */
export function movingAvgSmooth(series) {
    if (!series || series.length === 0) return [];
    const smoothed = [parseFloat(series[0] || 0)];
    for (let k = 1; k < series.length; k++) {
        const val = (parseFloat(series[k - 1] || 0) + parseFloat(series[k] || 0)) / 2.0;
        smoothed.push(val);
    }
    return smoothed;
}

/**
 * Execute Single Exponential Smoothing (SES) and calculate WMAPE evaluation
 */
export function runSES(rawSeries, smoothedSeries, alpha = 0.50) {
    const len = rawSeries.length;
    if (len < 2) {
        return {
            prediction: 0,
            prediction_raw: 0.0,
            alpha: alpha,
            wmape: 100.0,
            akurasi: 0.0,
            valid: false
        };
    }

    const S = [parseFloat(smoothedSeries[0] || 0)];
    for (let k = 1; k < len; k++) {
        const prevX = parseFloat(smoothedSeries[k - 1] || 0);
        const prevS = S[k - 1];
        S.push(alpha * prevX + (1.0 - alpha) * prevS);
    }

    const lastX = parseFloat(smoothedSeries[len - 1] || 0);
    const lastS = S[len - 1];
    const nextPred = alpha * lastX + (1.0 - alpha) * lastS;

    let sumErr = 0.0;
    let sumAct = 0.0;

    for (let k = 0; k < len; k++) {
        const actual = parseFloat(rawSeries[k] || 0);
        const pred = S[k];

        sumErr += Math.abs(actual - pred);
        sumAct += actual;
    }

    const wmape = sumAct > 0 ? (sumErr / sumAct) * 100.0 : 0.0;
    const akurasi = Math.max(0.0, 100.0 - wmape);

    return {
        prediction: Math.ceil(nextPred),
        prediction_raw: Math.round(nextPred * 100) / 100,
        alpha: alpha,
        wmape: Math.round(wmape * 100) / 100,
        akurasi: Math.round(akurasi * 100) / 100,
        valid: wmape <= 15.0
    };
}
