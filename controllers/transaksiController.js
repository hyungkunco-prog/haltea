import { query, getConnection } from '../config/database.js';
import * as xlsx from 'xlsx';

/**
 * Deduct raw material stock based on recipe (takaran)
 */
async function deductStock(id_menu, jumlah) {
    const [takaranItems] = await query('SELECT id_barang, gramasi FROM takaran WHERE id_menu = ?', [id_menu]);

    for (const sop of takaranItems) {
        const usage = parseFloat(sop.gramasi || 0) * parseFloat(jumlah || 0);

        const [barangList] = await query('SELECT id, stok_gudang FROM barang WHERE id = ?', [sop.id_barang]);
        if (barangList[0]) {
            const b = barangList[0];
            const stokBaru = Math.max(0.0, parseFloat(b.stok_gudang || 0) - usage);
            await query('UPDATE barang SET stok_gudang = ? WHERE id = ?', [stokBaru, b.id]);
        }
    }
}

/**
 * Robust date parser supporting YYYY-MM-DD, DD/MM/YYYY, Excel serial numbers, and Indonesian month names
 */
function parseDateValue(rawVal) {
    if (rawVal === undefined || rawVal === null || rawVal === '') return null;
    const valStr = String(rawVal).trim();
    if (!valStr) return null;

    // If YYYY-MM-DD or YYYY/MM/DD
    let m = valStr.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/);
    if (m) {
        const y = m[1];
        const month = String(parseInt(m[2], 10)).padStart(2, '0');
        const day = String(parseInt(m[3], 10)).padStart(2, '0');
        return `${y}-${month}-${day}`;
    }

    // If DD-MM-YYYY or DD/MM/YYYY
    m = valStr.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/);
    if (m) {
        const y = m[3];
        const month = String(parseInt(m[2], 10)).padStart(2, '0');
        const day = String(parseInt(m[1], 10)).padStart(2, '0');
        return `${y}-${month}-${day}`;
    }

    // If Excel serial number (e.g. 45939)
    if (!isNaN(valStr) && !valStr.includes('-') && !valStr.includes('/')) {
        const num = parseFloat(valStr);
        if (num > 30000 && num < 60000) {
            const unixTimestamp = (num - 25569) * 86400 * 1000;
            const d = new Date(unixTimestamp);
            if (!isNaN(d.getTime())) {
                const year = d.getUTCFullYear();
                const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                const day = String(d.getUTCDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        }
    }

    // Handle Indonesian month names
    const indonesianMonths = {
        'januari': 'january', 'jan': 'january',
        'februari': 'february', 'feb': 'february',
        'maret': 'march', 'mar': 'march',
        'april': 'april', 'apr': 'april',
        'mei': 'may',
        'juni': 'june', 'jun': 'june',
        'juli': 'july', 'jul': 'july',
        'agustus': 'august', 'agu': 'august', 'agst': 'august',
        'september': 'september', 'sep': 'september',
        'oktober': 'october', 'okt': 'october',
        'november': 'november', 'nov': 'november',
        'desember': 'december', 'des': 'december'
    };

    let lowerVal = valStr.toLowerCase();
    for (const [idMonth, enMonth] of Object.entries(indonesianMonths)) {
        if (lowerVal.includes(idMonth)) {
            lowerVal = lowerVal.replace(idMonth, enMonth);
            break;
        }
    }

    const parsedDate = new Date(lowerVal);
    if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    return null;
}

export async function index(req, res) {
    try {
        const tanggal = req.query.tanggal;
        const limit = parseInt(req.query.limit || '0', 10);

        let sql = `
            SELECT t.*, COALESCE(m.nama_menu, "Menu Varian") as nama_menu, COALESCE(m.harga, 10000) as harga
            FROM transaksi t
            LEFT JOIN menu m ON t.id_menu = m.id
        `;
        const params = [];

        if (tanggal) {
            sql += ' WHERE t.tanggal = ?';
            params.push(tanggal);
        }

        sql += ' ORDER BY t.tanggal DESC, t.id DESC';

        if (limit > 0) {
            sql += ` LIMIT ${limit}`;
        }

        const [rows] = await query(sql, params);

        const formatted = rows.map(r => ({
            ...r,
            id: parseInt(r.id, 10),
            id_menu: parseInt(r.id_menu, 10),
            jumlah: parseInt(r.jumlah || 0, 10),
            harga: parseInt(r.harga || 0, 10),
            total_bayar: parseInt(r.total_bayar || 0, 10)
        }));

        return res.json(formatted);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function create(req, res) {
    const input = req.body || {};
    const today = new Date().toISOString().split('T')[0];

    try {
        // Multi-order support (Cart checkout)
        if (Array.isArray(input.orders) && input.orders.length > 0) {
            const results = [];
            for (const item of input.orders) {
                const id_menu = parseInt(item.id_menu || 0, 10);
                const jumlah = parseInt(item.jumlah || 1, 10);
                const tanggal = item.tanggal || today;
                const total_bayar = item.total_bayar !== undefined ? parseInt(item.total_bayar, 10) : null;

                if (id_menu && jumlah > 0) {
                    const [resInsert] = await query(`
                        INSERT INTO transaksi (tanggal, id_menu, jumlah, total_bayar) 
                        VALUES (?, ?, ?, ?)
                    `, [tanggal, id_menu, jumlah, total_bayar]);

                    await deductStock(id_menu, jumlah);
                    results.push(resInsert.insertId);
                }
            }

            return res.json({
                success: true,
                message: 'Transaksi berhasil disimpan dan stok gudang telah dikurangi.',
                ids: results
            });
        }

        // Single transaction
        const id_menu = parseInt(input.id_menu || 0, 10);
        const jumlah = parseInt(input.jumlah || 1, 10);
        const tanggal = input.tanggal || today;
        const total_bayar = input.total_bayar !== undefined ? parseInt(input.total_bayar, 10) : null;

        if (!id_menu || jumlah <= 0) {
            return res.status(400).json({ error: 'Menu dan jumlah wajib diisi.' });
        }

        const [resInsert] = await query(`
            INSERT INTO transaksi (tanggal, id_menu, jumlah, total_bayar) 
            VALUES (?, ?, ?, ?)
        `, [tanggal, id_menu, jumlah, total_bayar]);

        await deductStock(id_menu, jumlah);

        return res.json({
            success: true,
            id: resInsert.insertId,
            message: 'Transaksi berhasil disimpan dan stok gudang telah dikurangi.'
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function remove(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        await query('DELETE FROM transaksi WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Transaksi berhasil dihapus.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const { tanggal, id_menu, jumlah, total_bayar } = req.body;
    try {
        const [rows] = await query('SELECT * FROM transaksi WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Transaksi tidak ditemukan.' });
        }
        const cur = rows[0];
        const newTgl = tanggal || cur.tanggal;
        const newIdMenu = id_menu !== undefined ? parseInt(id_menu, 10) : cur.id_menu;
        const newJml = jumlah !== undefined ? parseInt(jumlah, 10) : cur.jumlah;

        let newTotal = total_bayar;
        if (newTotal === undefined || newTotal === null) {
            const [menus] = await query('SELECT harga FROM menu WHERE id = ?', [newIdMenu]);
            const harga = menus[0] ? parseInt(menus[0].harga, 10) : 5000;
            newTotal = harga * newJml;
        }

        await query(
            'UPDATE transaksi SET tanggal = ?, id_menu = ?, jumlah = ?, total_bayar = ? WHERE id = ?',
            [newTgl, newIdMenu, newJml, newTotal, id]
        );
        return res.json({ success: true, message: 'Transaksi berhasil diperbarui.' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function importTransactions(req, res) {
    try {
        let rows = [];

        if (req.file) {
            const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        } else if (Array.isArray(req.body.data)) {
            rows = req.body.data;
        }

        if (!rows || rows.length === 0) {
            return res.status(400).json({ error: 'File Excel kosong atau format tidak valid.' });
        }

        const [menuList] = await query('SELECT id, nama_menu FROM menu');
        const menuMap = {};
        for (const m of menuList) {
            menuMap[m.nama_menu.toLowerCase().trim()] = m.id;
        }

        const batchName = `Import ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`;
        const [batchRes] = await query('INSERT INTO import_batches (batch_name, created_at) VALUES (?, NOW())', [batchName]);
        const batchId = batchRes.insertId;

        let insertedCount = 0;
        let skippedCount = 0;

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length < 2) continue;

            const rawDate = row[0];
            const rawMenu = String(row[1] || '').trim();
            const rawQty = parseInt(row[2] || '1', 10);

            const parsedDate = parseDateValue(rawDate);
            const menuId = menuMap[rawMenu.toLowerCase()];

            if (parsedDate && menuId && rawQty > 0) {
                await query(`
                    INSERT INTO transaksi (tanggal, id_menu, jumlah) 
                    VALUES (?, ?, ?)
                `, [parsedDate, menuId, rawQty]);
                insertedCount++;
            } else {
                skippedCount++;
            }
        }

        return res.json({
            success: true,
            batch_id: batchId,
            inserted: insertedCount,
            skipped: skippedCount,
            message: `Berhasil mengimpor ${insertedCount} data transaksi.`
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function reset(req, res) {
    const { scope = 'all', date, month, from_date, to_date } = req.body || {};
    const todayStr = new Date().toISOString().slice(0, 10);
    try {
        let selectSql = 'SELECT * FROM transaksi';
        let deleteSql = 'DELETE FROM transaksi';
        let params = [];
        let scopeLabel = 'Semua Data';

        if (scope === 'today') {
            const targetDate = date || todayStr;
            selectSql += ' WHERE tanggal = ?';
            deleteSql += ' WHERE tanggal = ?';
            params = [targetDate];
            scopeLabel = `Hari Ini (${targetDate})`;
        } else if (scope === 'week') {
            const d = new Date();
            d.setDate(d.getDate() - 6);
            const fromD = d.toISOString().slice(0, 10);
            selectSql += ' WHERE tanggal >= ? AND tanggal <= ?';
            deleteSql += ' WHERE tanggal >= ? AND tanggal <= ?';
            params = [fromD, todayStr];
            scopeLabel = `1 Pekan (${fromD} s/d ${todayStr})`;
        } else if (scope === 'month') {
            const targetMonth = month || todayStr.slice(0, 7);
            selectSql += ' WHERE tanggal LIKE ?';
            deleteSql += ' WHERE tanggal LIKE ?';
            params = [`${targetMonth}%`];
            scopeLabel = `Bulan (${targetMonth})`;
        } else if (scope === 'range') {
            const fDate = from_date || todayStr;
            const tDate = to_date || todayStr;
            selectSql += ' WHERE tanggal >= ? AND tanggal <= ?';
            deleteSql += ' WHERE tanggal >= ? AND tanggal <= ?';
            params = [fDate, tDate];
            scopeLabel = `Rentang (${fDate} s/d ${tDate})`;
        }

        const [matching] = await query(selectSql, params);

        if (matching.length > 0) {
            const backupJson = JSON.stringify(matching);
            await query(`
                INSERT INTO import_batches (batch_name, backup_data, created_at) 
                VALUES (?, ?, NOW())
            `, [`Reset ${scopeLabel} - ${new Date().toISOString().replace('T', ' ').substring(0, 19)}`, backupJson]);
        }

        if (scope === 'all') {
            await query('TRUNCATE TABLE transaksi');
        } else if (matching.length > 0) {
            await query(deleteSql, params);
        }

        return res.json({ 
            success: true, 
            count: matching.length, 
            message: `Berhasil mereset ${matching.length} data transaksi (${scopeLabel}).` 
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function restore(req, res) {
    try {
        const [batches] = await query('SELECT * FROM import_batches WHERE backup_data IS NOT NULL ORDER BY id DESC LIMIT 1');
        if (!batches[0]) {
            return res.status(404).json({ error: 'Tidak ada data backup yang dapat di-restore.' });
        }

        const items = JSON.parse(batches[0].backup_data || '[]');
        for (const item of items) {
            await query(`
                INSERT INTO transaksi (tanggal, id_menu, jumlah, total_bayar) 
                VALUES (?, ?, ?, ?)
            `, [item.tanggal, item.id_menu, item.jumlah, item.total_bayar]);
        }

        return res.json({ success: true, message: `Berhasil me-restore ${items.length} transaksi.` });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function getBatches(req, res) {
    try {
        const [batches] = await query('SELECT id, batch_name, created_at, backup_data FROM import_batches ORDER BY id DESC');
        const formatted = batches.map(b => {
            let total = 0;
            try {
                if (b.backup_data) total = JSON.parse(b.backup_data).length;
            } catch (e) {}
            return {
                id: b.id,
                nama_batch: b.batch_name,
                tgl_import: b.created_at,
                total_transaksi: total,
                keterangan: b.backup_data ? 'Backup data riwayat reset' : 'Dataset transaksi'
            };
        });
        return res.json(formatted);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function restoreBatch(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        const [batches] = await query('SELECT * FROM import_batches WHERE id = ?', [id]);
        if (!batches[0] || !batches[0].backup_data) {
            return res.status(404).json({ error: 'Batch backup tidak ditemukan.' });
        }

        const items = JSON.parse(batches[0].backup_data || '[]');
        for (const item of items) {
            await query(`
                INSERT INTO transaksi (tanggal, id_menu, jumlah, total_bayar) 
                VALUES (?, ?, ?, ?)
            `, [item.tanggal, item.id_menu, item.jumlah, item.total_bayar]);
        }

        return res.json({ success: true, message: `Berhasil me-restore ${items.length} transaksi dari batch #${id}.` });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
