import { query } from '../config/database.js';

export async function index(req, res) {
    try {
        const [barangList] = await query('SELECT * FROM barang ORDER BY kode_barang ASC');

        // Calculate 30-day average usage
        const d = new Date();
        d.setDate(d.getDate() - 30);
        const dateStr = d.toISOString().split('T')[0];

        const [menuSales] = await query(`
            SELECT id_menu, SUM(jumlah) as total_qty 
            FROM transaksi 
            WHERE tanggal >= ? 
            GROUP BY id_menu
        `, [dateStr]);

        const salesMap = {};
        for (const s of menuSales) {
            salesMap[s.id_menu] = parseFloat(s.total_qty || 0);
        }

        const [sopList] = await query('SELECT id_menu, id_barang, gramasi FROM takaran');

        const totalUsageMap = {};
        for (const sop of sopList) {
            const menuSalesQty = salesMap[sop.id_menu] || 0.0;
            const usage = menuSalesQty * parseFloat(sop.gramasi || 0);
            if (!totalUsageMap[sop.id_barang]) {
                totalUsageMap[sop.id_barang] = 0.0;
            }
            totalUsageMap[sop.id_barang] += usage;
        }

        const enrichedBarang = barangList.map(b => {
            const totalUsage30Days = totalUsageMap[b.id] || 0.0;
            const avgDailyUsage = totalUsage30Days / 30.0;

            const L = b.lead_time_hari !== null && b.lead_time_hari !== undefined ? parseInt(b.lead_time_hari, 10) : 2;
            const rop = avgDailyUsage * L;
            const stokGudang = parseFloat(b.stok_gudang || 0);
            const butuhRestock = stokGudang <= rop;
            let estimasiBeli = 0;
            const factor = parseFloat(b.faktor_konversi) || 1.0;

            if (butuhRestock && avgDailyUsage > 0) {
                const targetStok = avgDailyUsage * 7;
                const kekurangan = Math.max(0.0, targetStok - stokGudang);
                estimasiBeli = Math.ceil(kekurangan / factor);
            }

            return {
                ...b,
                id: parseInt(b.id, 10),
                faktor_konversi: factor,
                stok_gudang: stokGudang,
                lead_time_hari: L,
                avg_daily_usage: Math.round(avgDailyUsage * 1000) / 1000,
                rop: Math.round(rop * 1000) / 1000,
                butuh_restock: butuhRestock,
                estimasi_beli: estimasiBeli
            };
        });

        return res.json(enrichedBarang);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function create(req, res) {
    const input = req.body || {};
    const kode = (input.kode_barang || '').trim();
    const nama = (input.nama_barang || '').trim();
    const satBeli = (input.satuan_beli || 'Pack').trim();
    const satResep = (input.satuan_resep || 'gram').trim();
    const faktor = input.faktor_konversi !== undefined ? parseFloat(input.faktor_konversi) : 1.0;
    const stok = input.stok_gudang !== undefined ? parseFloat(input.stok_gudang) : 0.0;
    const lead = input.lead_time_hari !== undefined ? parseInt(input.lead_time_hari, 10) : 2;

    if (!kode || !nama) {
        return res.status(400).json({ error: 'Kode dan Nama Bahan Baku wajib diisi.' });
    }

    try {
        const [existing] = await query('SELECT * FROM barang WHERE kode_barang = ?', [kode]);
        if (existing.length > 0) {
            return res.status(400).json({ error: `Kode Barang '${kode}' sudah digunakan. Silakan gunakan kode lain.` });
        }

        const [result] = await query(`
            INSERT INTO barang (kode_barang, nama_barang, satuan, satuan_beli, satuan_resep, faktor_konversi, stok_gudang, lead_time_hari)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [kode, nama, satBeli, satBeli, satResep, faktor, stok, lead]);

        return res.json({ success: true, id: result.insertId });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const input = req.body || {};

    const kode = (input.kode_barang || '').trim();
    const nama = (input.nama_barang || '').trim();
    const satBeli = (input.satuan_beli || 'Pack').trim();
    const satResep = (input.satuan_resep || '').trim();
    const faktor = input.faktor_konversi !== undefined ? parseFloat(input.faktor_konversi) : 1.0;
    const stok = input.stok_gudang !== undefined ? parseFloat(input.stok_gudang) : 0.0;
    const lead = input.lead_time_hari !== undefined ? parseInt(input.lead_time_hari, 10) : 2;

    if (!kode || !nama) {
        return res.status(400).json({ error: 'Kode dan Nama Bahan Baku wajib diisi.' });
    }

    try {
        const [currentList] = await query('SELECT * FROM barang WHERE id = ?', [id]);
        const currentBarang = currentList[0];
        if (!currentBarang) {
            return res.status(404).json({ error: 'Bahan baku tidak ditemukan.' });
        }

        const [existing] = await query('SELECT * FROM barang WHERE kode_barang = ? AND id != ?', [kode, id]);
        if (existing.length > 0) {
            return res.status(400).json({ error: `Kode Barang '${kode}' sudah digunakan oleh bahan baku lain.` });
        }

        const satResepFinal = satResep ? satResep : (currentBarang.satuan_resep || 'gram');

        await query(`
            UPDATE barang 
            SET kode_barang = ?, nama_barang = ?, satuan = ?, satuan_beli = ?, satuan_resep = ?, faktor_konversi = ?, stok_gudang = ?, lead_time_hari = ?
            WHERE id = ?
        `, [kode, nama, satBeli, satBeli, satResepFinal, faktor, stok, lead, id]);

        return res.json({ success: true });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export async function remove(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        await query('DELETE FROM takaran WHERE id_barang = ?', [id]);
        await query('DELETE FROM rekomendasi_belanja WHERE id_barang = ?', [id]);
        await query('DELETE FROM barang WHERE id = ?', [id]);

        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function tambahStok(req, res) {
    const id = parseInt(req.params.id, 10);
    const input = req.body || {};
    const tambah = parseFloat(input.tambah || 0);

    try {
        const [items] = await query('SELECT * FROM barang WHERE id = ?', [id]);
        const b = items[0];
        if (!b) {
            return res.status(404).json({ error: 'Barang not found' });
        }

        const factor = parseFloat(b.faktor_konversi) || 1.0;
        const qtyResep = tambah * factor;
        const stokBaru = parseFloat(b.stok_gudang || 0) + qtyResep;

        await query('UPDATE barang SET stok_gudang = ? WHERE id = ?', [stokBaru, id]);

        return res.json({
            success: true,
            stok_baru: stokBaru
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
