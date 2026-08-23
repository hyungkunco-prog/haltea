import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API Routes
app.use('/api', apiRouter);
// Fallback for legacy paths that include index.php
app.use('/index.php/api', apiRouter);

// Serve static frontend assets
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
app.use('/js', express.static(path.join(publicDir, 'js')));

// SPA Fallback for any client-side routes
app.get('*', (req, res) => {
    // If request looks like an API call that was not found
    if (req.path.startsWith('/api') || req.path.startsWith('/index.php/api')) {
        return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(`  HALTEA Server running at http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`================================================`);
});

export default app;
