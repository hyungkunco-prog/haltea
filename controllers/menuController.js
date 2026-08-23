import { query } from '../config/database.js';

export async function index(req, res) {
    try {
        const [menuList] = await query('SELECT * FROM menu ORDER BY nama_menu ASC');
        const formatted = menuList.map(m => ({
            ...m,
            id: parseInt(m.id, 10),
            harga: parseInt(m.harga || 0, 10),
            aktif: parseInt(m.aktif !== undefined ? m.aktif : 1, 10)
        }));
        return res.json(formatted);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function create(req, res) {
    const input = req.body || {};
    const nama = (input.nama_menu || '').trim();
    const ket = (input.keterangan || '').trim();
    const gambar = input.gambar || null;
    const harga = input.harga !== undefined ? parseInt(input.harga, 10) : 0;

    if (!nama) {
        return res.status(400).json({ error: 'Nama Menu wajib diisi.' });
    }

    try {
        const [dup] = await query('SELECT * FROM menu WHERE nama_menu = ?', [nama]);
        if (dup.length > 0) {
            return res.status(400).json({ error: `Nama Menu '${nama}' sudah digunakan. Silakan gunakan nama lain.` });
        }

        const [result] = await query(`
            INSERT INTO menu (nama_menu, keterangan, gambar, harga, aktif)
            VALUES (?, ?, ?, ?, 1)
        `, [nama, ket, gambar, harga]);

        return res.json({ success: true, id: result.insertId });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export async function update(req, res) {
    const id = parseInt(req.params.id, 10);
    const input = req.body || {};

    try {
        const [existingList] = await query('SELECT * FROM menu WHERE id = ?', [id]);
        const existing = existingList[0];
        if (!existing) {
            return res.status(404).json({ error: 'Menu tidak ditemukan' });
        }

        const nama = (input.nama_menu !== undefined && input.nama_menu.trim() !== '') 
            ? input.nama_menu.trim() 
            : existing.nama_menu;
        const ket = input.keterangan !== undefined ? input.keterangan.trim() : existing.keterangan;
        const aktif = input.aktif !== undefined ? parseInt(input.aktif, 10) : parseInt(existing.aktif, 10);
        const harga = input.harga !== undefined ? parseInt(input.harga, 10) : parseInt(existing.harga, 10);

        const [dup] = await query('SELECT * FROM menu WHERE nama_menu = ? AND id != ?', [nama, id]);
        if (dup.length > 0) {
            return res.status(400).json({ error: `Nama Menu '${nama}' sudah digunakan oleh menu lain.` });
        }

        if (input.gambar !== undefined) {
            await query(`
                UPDATE menu 
                SET nama_menu = ?, keterangan = ?, aktif = ?, harga = ?, gambar = ?
                WHERE id = ?
            `, [nama, ket, aktif, harga, input.gambar, id]);
        } else {
            await query(`
                UPDATE menu 
                SET nama_menu = ?, keterangan = ?, aktif = ?, harga = ?
                WHERE id = ?
            `, [nama, ket, aktif, harga, id]);
        }

        return res.json({ success: true });
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
}

export async function remove(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        await query('DELETE FROM takaran WHERE id_menu = ?', [id]);
        await query('DELETE FROM transaksi WHERE id_menu = ?', [id]);
        await query('DELETE FROM menu WHERE id = ?', [id]);

        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
