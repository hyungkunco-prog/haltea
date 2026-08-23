import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'haltea-super-secret-key-2026';

export function signToken(payload, expiresIn = '24h') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

export function getAuthUser(req) {
    let token = null;

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
    }

    if (!token) {
        token = req.headers['x-auth-token'] || req.headers['x-token'];
    }

    if (!token && req.query && req.query.token) {
        token = req.query.token;
    }

    if (!token && req.body && req.body.token) {
        token = req.body.token;
    }

    if (!token) return null;
    return verifyToken(token);
}

export function requireAuth(req, res, next) {
    const user = getAuthUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = user;
    next();
}

export function requireAdmin(req, res, next) {
    const user = getAuthUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin only' });
    }
    req.user = user;
    next();
}
