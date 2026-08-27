import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { signToken, getAuthUser } from '../utils/jwtHelper.js';

// In-memory fallback accounts
let memoryUsers = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin', nama: 'Administrator', avatar: null, created_at: new Date() },
    { id: 2, username: 'kasir', password: 'kasir123', role: 'kasir', nama: 'Kasir Haltea', avatar: null, created_at: new Date() }
];

export async function login(req, res) {
    const { username = '', password = '' } = req.body || {};
    const cleanUser = username.trim();

    if (!cleanUser || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username dan password wajib diisi'
        });
    }

    try {
        // Auto-seed default accounts if table is empty
        try {
            const [userCount] = await query('SELECT COUNT(*) as count FROM users');
            if (userCount[0].count === 0) {
                await query(`
                    INSERT INTO users (username, password, role, nama, avatar) VALUES
                    ('admin', 'admin123', 'admin', 'Administrator', NULL),
                    ('kasir', 'kasir123', 'kasir', 'Kasir Haltea', NULL)
                `);
            }
        } catch (e) {
            console.warn('User seed check notice:', e.message);
        }

        const cleanDomain = cleanUser.replace('@haltea.com', '');
        const withDomain = cleanDomain + '@haltea.com';

        let user = null;
        try {
            const [users] = await query(`
                SELECT * FROM users 
                WHERE username = ? OR username = ? OR username = ? 
                LIMIT 1
            `, [cleanUser, withDomain, cleanDomain]);
            user = users[0];
        } catch (e) {
            user = memoryUsers.find(u => u.username === cleanUser || u.username === withDomain || u.username === cleanDomain);
        }

        let isValidPassword = false;
        if (user) {
            if (user.password === password) {
                isValidPassword = true;
            } else {
                try {
                    isValidPassword = await bcrypt.compare(password, user.password);
                } catch (e) {
                    isValidPassword = false;
                }
            }
        }

        if (user && isValidPassword) {
            const payload = {
                id: user.id,
                username: user.username,
                role: user.role,
                nama: user.nama
            };
            const token = signToken(payload);

            return res.json({
                success: true,
                token,
                role: user.role,
                nama: user.nama,
                avatar: user.avatar
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Username atau password salah'
            });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export function logout(req, res) {
    return res.json({ success: true, message: 'Berhasil logout' });
}

export function status(req, res) {
    const user = getAuthUser(req);
    if (!user) {
        return res.json({ logged_in: false });
    }
    return res.json({
        logged_in: true,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            nama: user.nama
        }
    });
}

export async function profile(req, res) {
    const auth = getAuthUser(req);
    if (!auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const [users] = await query('SELECT id, username, role, nama, avatar FROM users WHERE id = ?', [auth.id]);
        if (!users[0]) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }
        return res.json(users[0]);
    } catch (err) {
        const u = memoryUsers.find(x => x.id === auth.id);
        if (u) {
            return res.json({ id: u.id, username: u.username, role: u.role, nama: u.nama, avatar: u.avatar });
        }
        return res.status(500).json({ error: err.message });
    }
}

export async function updateProfile(req, res) {
    const auth = getAuthUser(req);
    if (!auth) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { nama, password, avatar } = req.body || {};

    try {
        let user = null;
        try {
            const [users] = await query('SELECT * FROM users WHERE id = ?', [auth.id]);
            user = users[0];
        } catch (e) {
            user = memoryUsers.find(x => x.id === auth.id);
        }

        if (!user) {
            return res.status(404).json({ error: 'User tidak ditemukan' });
        }

        const newNama = (nama !== undefined && nama.trim() !== '') ? nama.trim() : user.nama;
        const newAvatar = (avatar !== undefined) ? avatar : user.avatar;
        let newPassword = user.password;

        if (password && password.trim() !== '') {
            newPassword = password.trim();
        }

        try {
            await query(`
                UPDATE users 
                SET nama = ?, password = ?, avatar = ? 
                WHERE id = ?
            `, [newNama, newPassword, newAvatar, auth.id]);
        } catch (e) {
            user.nama = newNama;
            user.password = newPassword;
            user.avatar = newAvatar;
        }

        return res.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                nama: newNama,
                avatar: newAvatar
            }
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// ============================================================
// USER MANAGEMENT (ADMIN ONLY)
// ============================================================

export async function listUsers(req, res) {
    try {
        const [rows] = await query('SELECT id, username, role, nama, avatar, created_at FROM users ORDER BY id ASC');
        return res.json(rows || []);
    } catch (err) {
        return res.json(memoryUsers.map(u => ({
            id: u.id,
            username: u.username,
            role: u.role,
            nama: u.nama,
            avatar: u.avatar,
            created_at: u.created_at
        })));
    }
}

export async function createUser(req, res) {
    const { username = '', password = '', nama = '', role = 'kasir' } = req.body || {};
    const cleanUser = username.trim().toLowerCase();
    const cleanNama = nama.trim() || cleanUser;
    const cleanRole = role === 'admin' ? 'admin' : 'kasir';

    if (!cleanUser || !password) {
        return res.status(400).json({ success: false, message: 'Username dan Password wajib diisi.' });
    }

    try {
        // Check duplicate
        try {
            const [existing] = await query('SELECT id FROM users WHERE username = ? LIMIT 1', [cleanUser]);
            if (existing && existing.length > 0) {
                return res.status(400).json({ success: false, message: `Username '${cleanUser}' sudah digunakan.` });
            }
        } catch (e) {
            if (memoryUsers.some(u => u.username === cleanUser)) {
                return res.status(400).json({ success: false, message: `Username '${cleanUser}' sudah digunakan.` });
            }
        }

        const [result] = await query(
            'INSERT INTO users (username, password, role, nama, avatar) VALUES (?, ?, ?, ?, NULL)',
            [cleanUser, password.trim(), cleanRole, cleanNama]
        );

        return res.status(201).json({
            success: true,
            message: `Akun ${cleanNama} (${cleanUser}) berhasil dibuat!`,
            id: result.insertId
        });
    } catch (err) {
        // Memory fallback
        const newObj = {
            id: Date.now(),
            username: cleanUser,
            password: password.trim(),
            role: cleanRole,
            nama: cleanNama,
            avatar: null,
            created_at: new Date()
        };
        memoryUsers.push(newObj);
        return res.status(201).json({
            success: true,
            message: `Akun ${cleanNama} (${cleanUser}) berhasil dibuat (memory)!`,
            id: newObj.id
        });
    }
}

export async function updateUser(req, res) {
    const { id } = req.params;
    const { nama, password, role } = req.body || {};

    try {
        let user = null;
        try {
            const [rows] = await query('SELECT * FROM users WHERE id = ?', [id]);
            user = rows[0];
        } catch (e) {
            user = memoryUsers.find(u => u.id === parseInt(id, 10));
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'Akun tidak ditemukan.' });
        }

        const newNama = (nama !== undefined && nama.trim() !== '') ? nama.trim() : user.nama;
        const newRole = role !== undefined ? role : user.role;
        let newPassword = user.password;

        if (password && password.trim() !== '') {
            newPassword = password.trim();
        }

        try {
            await query('UPDATE users SET nama = ?, role = ?, password = ? WHERE id = ?', [newNama, newRole, newPassword, id]);
        } catch (e) {
            user.nama = newNama;
            user.role = newRole;
            user.password = newPassword;
        }

        return res.json({
            success: true,
            message: 'Akun berhasil diperbarui!',
            user: { id, nama: newNama, role: newRole }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteUser(req, res) {
    const auth = getAuthUser(req);
    const { id } = req.params;

    if (auth && String(auth.id) === String(id)) {
        return res.status(400).json({ success: false, message: 'Tidak dapat menghapus akun admin yang sedang login!' });
    }

    try {
        try {
            await query('DELETE FROM users WHERE id = ?', [id]);
        } catch (e) {
            memoryUsers = memoryUsers.filter(u => u.id !== parseInt(id, 10));
        }
        return res.json({ success: true, message: 'Akun berhasil dihapus!' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}
