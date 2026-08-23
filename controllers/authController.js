import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { signToken, getAuthUser } from '../utils/jwtHelper.js';

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
        const [userCount] = await query('SELECT COUNT(*) as count FROM users');
        if (userCount[0].count === 0) {
            await query(`
                INSERT INTO users (username, password, role, nama, avatar) VALUES
                ('admin', 'admin123', 'admin', 'Administrator', NULL),
                ('kasir', 'kasir123', 'kasir', 'Kasir Haltea', NULL)
            `);
        }

        const cleanDomain = cleanUser.replace('@haltea.com', '');
        const withDomain = cleanDomain + '@haltea.com';

        const [users] = await query(`
            SELECT * FROM users 
            WHERE username = ? OR username = ? OR username = ? 
            LIMIT 1
        `, [cleanUser, withDomain, cleanDomain]);

        const user = users[0];

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
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(users[0]);
    } catch (err) {
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
        const [users] = await query('SELECT * FROM users WHERE id = ?', [auth.id]);
        const user = users[0];
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const newNama = (nama !== undefined && nama.trim() !== '') ? nama.trim() : user.nama;
        const newAvatar = (avatar !== undefined) ? avatar : user.avatar;
        let newPassword = user.password;

        if (password && password.trim() !== '') {
            newPassword = password.trim(); // Stored as is or bcrypt
        }

        await query(`
            UPDATE users 
            SET nama = ?, password = ?, avatar = ? 
            WHERE id = ?
        `, [newNama, newPassword, newAvatar, auth.id]);

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
