import { query, getConnection } from '../config/database.js';

export async function index(req, res) {
    try {
        const [rows] = await query(`
            SELECT s.*, m.nama_menu, b.nama_barang, b.satuan, b.satuan_resep 
            FROM takaran s 
            INNER JOIN menu m ON s.id_menu = m.id 
            INNER JOIN barang b ON s.id_barang = b.id 
            ORDER BY m.nama_menu ASC, b.nama_barang ASC
        `);

        const formatted = rows.map(r => ({
            ...r,
            id: parseInt(r.id, 10),
            id_menu: parseInt(r.id_menu, 10),
            id_barang: parseInt(r.id_barang, 10),
            gramasi: parseFloat(r.gramasi || 0)
        }));

        return res.json(formatted);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function getByMenu(req, res) {
    const id_menu = parseInt(req.params.id_menu || req.params.id, 10);
    try {
        const [rows] = await query(`
            SELECT s.*, b.nama_barang, b.satuan, b.satuan_resep, b.kode_barang 
            FROM takaran s 
            INNER JOIN barang b ON s.id_barang = b.id 
            WHERE s.id_menu = ? 
            ORDER BY b.nama_barang ASC
        `, [id_menu]);

        const formatted = rows.map(r => ({
            ...r,
            id: parseInt(r.id, 10),
            id_menu: parseInt(r.id_menu, 10),
            id_barang: parseInt(r.id_barang, 10),
            gramasi: parseFloat(r.gramasi || 0)
        }));

        const [menuList] = await query('SELECT harga FROM menu WHERE id = ?', [id_menu]);
        const harga = menuList[0] ? parseInt(menuList[0].harga || 0, 10) : 0;

        return res.json({
            items: formatted,
            harga
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function create(req, res) {
    const input = req.body || {};
    const id_menu = parseInt(input.id_menu || 0, 10);
    const items = Array.isArray(input.items) ? input.items : [];
    const harga = input.harga !== undefined ? parseInt(input.harga, 10) : null;

    if (!id_menu) {
        return res.status(400).json({ error: 'Menu ID wajib ditentukan.' });
    }

    const conn = await getConnection();
    try {
        await conn.beginTransaction();

        if (harga !== null) {
            await conn.query('UPDATE menu SET harga = ? WHERE id = ?', [harga, id_menu]);
        }

        await conn.query('DELETE FROM takaran WHERE id_menu = ?', [id_menu]);

        for (const item of items) {
            const id_barang = parseInt(item.id_barang, 10);
            const gramasi = parseFloat(item.gramasi || 0);

            if (id_barang && gramasi > 0) {
                await conn.query(`
                    INSERT INTO takaran (id_menu, id_barang, gramasi) 
                    VALUES (?, ?, ?)
                `, [id_menu, id_barang, gramasi]);
            }
        }

        await conn.commit();
        conn.release();
        return res.json({ success: true });
    } catch (err) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: err.message });
    }
}

export async function remove(req, res) {
    const id = parseInt(req.params.id, 10);
    try {
        await query('DELETE FROM takaran WHERE id = ?', [id]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
