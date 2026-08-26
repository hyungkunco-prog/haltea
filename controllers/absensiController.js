import { query } from '../config/database.js';

// Ensure table exists
async function ensureTables() {
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS absensi (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tanggal DATE NOT NULL,
                nama_staff VARCHAR(100) NOT NULL,
                jam_masuk VARCHAR(20) DEFAULT '-',
                jam_pulang VARCHAR(20) DEFAULT '-',
                status VARCHAR(50) DEFAULT 'Hadir',
                keterangan TEXT,
                foto LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        await query(`
            CREATE TABLE IF NOT EXISTS jam_kerja (
                id INT AUTO_INCREMENT PRIMARY KEY,
                jam_masuk VARCHAR(20) DEFAULT '08:00:00',
                jam_pulang VARCHAR(20) DEFAULT '16:00:00',
                toleransi_menit INT DEFAULT 10
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Check if jam_kerja has default row
        const [rows] = await query('SELECT * FROM jam_kerja LIMIT 1');
        if (!rows || rows.length === 0) {
            await query('INSERT INTO jam_kerja (jam_masuk, jam_pulang, toleransi_menit) VALUES (?, ?, ?)', ['08:00:00', '16:00:00', 10]);
        }
    } catch (e) {
        console.warn('ensureTables absensi/jam_kerja warning:', e.message);
    }
}

// In-memory fallback if MySQL not running or table fails
let memoryAbsensi = [
    { id: 1, tanggal: '2026-08-25', nama_staff: 'Kasir Haltea', jam_masuk: '07:55:00', jam_pulang: '16:05:00', status: 'Hadir', keterangan: 'Shift pagi - tepat waktu', foto: 'haltea-logo.png' },
    { id: 2, tanggal: '2026-08-24', nama_staff: 'Kasir Haltea', jam_masuk: '08:15:00', jam_pulang: '16:00:00', status: 'Terlambat', keterangan: 'Terlambat 15 menit', foto: 'haltea-logo.png' }
];
let memoryJamKerja = { jam_masuk: '08:00:00', jam_pulang: '16:00:00', toleransi_menit: 10 };

ensureTables();

export async function getAbsensi(req, res) {
    const { tanggal, nama_staff, bulan } = req.query;
    try {
        let sql = 'SELECT * FROM absensi WHERE 1=1';
        const params = [];

        if (tanggal) {
            sql += ' AND tanggal = ?';
            params.push(tanggal);
        }
        if (nama_staff) {
            sql += ' AND LOWER(nama_staff) LIKE ?';
            params.push(`%${nama_staff.toLowerCase()}%`);
        }
        if (bulan) {
            sql += ' AND DATE_FORMAT(tanggal, "%Y-%m") = ?';
            params.push(bulan);
        }

        sql += ' ORDER BY tanggal DESC, id DESC';
        const [rows] = await query(sql, params);
        return res.json(rows || []);
    } catch (err) {
        // Fallback to memory
        let filtered = [...memoryAbsensi];
        if (tanggal) filtered = filtered.filter(a => a.tanggal === tanggal);
        if (nama_staff) filtered = filtered.filter(a => (a.nama_staff || '').toLowerCase().includes(nama_staff.toLowerCase()));
        if (bulan) filtered = filtered.filter(a => (a.tanggal || '').startsWith(bulan));
        return res.json(filtered);
    }
}

export async function createAbsensi(req, res) {
    const { tanggal, nama_staff, jam_masuk, jam_pulang, status, keterangan, foto } = req.body;
    const tgl = tanggal || new Date().toISOString().slice(0, 10);
    const staff = nama_staff || 'Kasir Haltea';
    const masuk = jam_masuk || '-';
    const pulang = jam_pulang || '-';
    const st = status || 'Hadir';
    const ket = keterangan || '-';
    const ft = foto || 'haltea-logo.png';

    try {
        // Check if record exists for same staff and date
        const [existing] = await query('SELECT id FROM absensi WHERE tanggal = ? AND nama_staff = ? LIMIT 1', [tgl, staff]);
        if (existing && existing.length > 0) {
            const id = existing[0].id;
            await query(
                'UPDATE absensi SET jam_masuk = ?, jam_pulang = ?, status = ?, keterangan = ?, foto = ? WHERE id = ?',
                [masuk, pulang, st, ket, ft, id]
            );
            return res.json({ success: true, message: 'Absensi diperbarui', id });
        }

        const [result] = await query(
            'INSERT INTO absensi (tanggal, nama_staff, jam_masuk, jam_pulang, status, keterangan, foto) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [tgl, staff, masuk, pulang, st, ket, ft]
        );
        return res.status(201).json({ success: true, message: 'Absensi berhasil dicatat', id: result.insertId });
    } catch (err) {
        // Memory fallback
        const existingIdx = memoryAbsensi.findIndex(a => a.tanggal === tgl && a.nama_staff === staff);
        if (existingIdx !== -1) {
            memoryAbsensi[existingIdx] = {
                ...memoryAbsensi[existingIdx],
                jam_masuk: masuk !== '-' ? masuk : memoryAbsensi[existingIdx].jam_masuk,
                jam_pulang: pulang !== '-' ? pulang : memoryAbsensi[existingIdx].jam_pulang,
                status: st,
                keterangan: ket,
                foto: ft
            };
            return res.json({ success: true, message: 'Absensi diperbarui (memory)', id: memoryAbsensi[existingIdx].id });
        }
        const newObj = {
            id: Date.now(),
            tanggal: tgl,
            nama_staff: staff,
            jam_masuk: masuk,
            jam_pulang: pulang,
            status: st,
            keterangan: ket,
            foto: ft
        };
        memoryAbsensi.unshift(newObj);
        return res.status(201).json({ success: true, message: 'Absensi berhasil dicatat (memory)', data: newObj });
    }
}

export async function updateAbsensi(req, res) {
    const { id } = req.params;
    const { jam_masuk, jam_pulang, status, keterangan, foto } = req.body;

    try {
        const [rows] = await query('SELECT * FROM absensi WHERE id = ?', [id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ error: 'Data absensi tidak ditemukan' });
        }
        const cur = rows[0];
        const newMasuk = jam_masuk !== undefined ? jam_masuk : cur.jam_masuk;
        const newPulang = jam_pulang !== undefined ? jam_pulang : cur.jam_pulang;
        const newStatus = status !== undefined ? status : cur.status;
        const newKet = keterangan !== undefined ? keterangan : cur.keterangan;
        const newFoto = foto !== undefined ? foto : cur.foto;

        await query(
            'UPDATE absensi SET jam_masuk = ?, jam_pulang = ?, status = ?, keterangan = ?, foto = ? WHERE id = ?',
            [newMasuk, newPulang, newStatus, newKet, newFoto, id]
        );
        return res.json({ success: true, message: 'Absensi berhasil diperbarui' });
    } catch (err) {
        const numId = parseInt(id, 10);
        const item = memoryAbsensi.find(a => a.id === numId);
        if (item) {
            if (jam_masuk !== undefined) item.jam_masuk = jam_masuk;
            if (jam_pulang !== undefined) item.jam_pulang = jam_pulang;
            if (status !== undefined) item.status = status;
            if (keterangan !== undefined) item.keterangan = keterangan;
            if (foto !== undefined) item.foto = foto;
            return res.json({ success: true, message: 'Absensi berhasil diperbarui (memory)' });
        }
        return res.status(404).json({ error: 'Data absensi tidak ditemukan' });
    }
}

export async function deleteAbsensi(req, res) {
    const { id } = req.params;
    try {
        await query('DELETE FROM absensi WHERE id = ?', [id]);
        return res.json({ success: true, message: 'Rekaman absensi dihapus' });
    } catch (err) {
        const numId = parseInt(id, 10);
        memoryAbsensi = memoryAbsensi.filter(a => a.id !== numId);
        return res.json({ success: true, message: 'Rekaman absensi dihapus (memory)' });
    }
}

export async function getJamKerja(req, res) {
    try {
        const [rows] = await query('SELECT * FROM jam_kerja ORDER BY id DESC LIMIT 1');
        if (rows && rows.length > 0) {
            return res.json(rows[0]);
        }
        return res.json(memoryJamKerja);
    } catch (err) {
        return res.json(memoryJamKerja);
    }
}

export async function saveJamKerja(req, res) {
    const { jam_masuk, jam_pulang, toleransi_menit } = req.body;
    const masuk = jam_masuk || '08:00:00';
    const pulang = jam_pulang || '16:00:00';
    const tol = parseInt(toleransi_menit, 10) || 10;

    try {
        const [rows] = await query('SELECT id FROM jam_kerja LIMIT 1');
        if (rows && rows.length > 0) {
            await query('UPDATE jam_kerja SET jam_masuk = ?, jam_pulang = ?, toleransi_menit = ? WHERE id = ?', [masuk, pulang, tol, rows[0].id]);
        } else {
            await query('INSERT INTO jam_kerja (jam_masuk, jam_pulang, toleransi_menit) VALUES (?, ?, ?)', [masuk, pulang, tol]);
        }
        memoryJamKerja = { jam_masuk: masuk, jam_pulang: pulang, toleransi_menit: tol };
        return res.json({ success: true, message: 'Jam kerja berhasil disimpan' });
    } catch (err) {
        memoryJamKerja = { jam_masuk: masuk, jam_pulang: pulang, toleransi_menit: tol };
        return res.json({ success: true, message: 'Jam kerja berhasil disimpan (memory)' });
    }
}
