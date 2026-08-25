// ============================================================
// STATE
// ============================================================
let currentChart = null;
let currentUser = null; // { role, nama }
let allMenu = [];
let allBarang = [];
let currentSopMenuId = null;
let currentSopItems = [];
let deleteCallback = null;
let currentPageId = 'dashboard';

// ============================================================
// CLIENT-SIDE MOCK DATABASE (FOR GITHUB PAGES & STATIC HOSTING)
// ============================================================
const DEFAULT_BARANG = [
    { id: 1, kode_barang: 'BRG001', nama_barang: 'Gula', satuan: 'Kg', satuan_beli: 'Kg', satuan_resep: 'ml', faktor_konversi: 1000, stok_gudang: 5000, lead_time_hari: 2 },
    { id: 15, kode_barang: 'BRG015', nama_barang: 'Cup', satuan: 'Dus', satuan_beli: 'Dus', satuan_resep: 'pcs', faktor_konversi: 1000, stok_gudang: 1965, lead_time_hari: 2 },
    { id: 16, kode_barang: 'BRG016', nama_barang: 'Sedotan', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'pcs', faktor_konversi: 100, stok_gudang: 93, lead_time_hari: 2 },
    { id: 17, kode_barang: 'BRG017', nama_barang: 'Plastik', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'pcs', faktor_konversi: 100, stok_gudang: 50, lead_time_hari: 2 },
    { id: 26, kode_barang: 'BRG002', nama_barang: 'Teh', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'ml', faktor_konversi: 15000, stok_gudang: 30000, lead_time_hari: 2 },
    { id: 27, kode_barang: 'BRG003', nama_barang: 'Sprite', satuan: 'Pcs', satuan_beli: 'Pcs', satuan_resep: 'ml', faktor_konversi: 1000, stok_gudang: 249, lead_time_hari: 2 },
    { id: 28, kode_barang: 'BRG004', nama_barang: 'Bubuk Blackcurraant', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 560, stok_gudang: 462, lead_time_hari: 2 },
    { id: 29, kode_barang: 'BRG005', nama_barang: 'Galon/Air', satuan: 'Pcs', satuan_beli: 'Pcs', satuan_resep: 'ml', faktor_konversi: 19000, stok_gudang: 11000, lead_time_hari: 2 },
    { id: 30, kode_barang: 'BRG006', nama_barang: 'Good Day Choco', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 200, stok_gudang: 80, lead_time_hari: 2 },
    { id: 31, kode_barang: 'BRG007', nama_barang: 'Good day Capuchino', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 250, stok_gudang: 50, lead_time_hari: 2 },
    { id: 32, kode_barang: 'BRG008', nama_barang: 'Dark choco', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 1000, stok_gudang: 300, lead_time_hari: 2 },
    { id: 33, kode_barang: 'BRG009', nama_barang: 'Susu', satuan: 'Pcs', satuan_beli: 'Pcs', satuan_resep: 'ml', faktor_konversi: 370, stok_gudang: 500, lead_time_hari: 2 },
    { id: 34, kode_barang: 'BRG010', nama_barang: 'Nescafe', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 20, stok_gudang: 50, lead_time_hari: 2 },
    { id: 35, kode_barang: 'BRG011', nama_barang: 'Bubuk lemontea', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 560, stok_gudang: 100, lead_time_hari: 2 },
    { id: 36, kode_barang: 'BRG012', nama_barang: 'Good day nut', satuan: 'pack', satuan_beli: 'pack', satuan_resep: 'gram', faktor_konversi: 200, stok_gudang: 140, lead_time_hari: 2 },
    { id: 37, kode_barang: 'BRG013', nama_barang: 'Bubuk taro', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 1000, stok_gudang: 200, lead_time_hari: 2 },
    { id: 38, kode_barang: 'BRG014', nama_barang: 'Bubuk lychee', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 560, stok_gudang: 150, lead_time_hari: 2 },
    { id: 39, kode_barang: 'BRG020', nama_barang: 'Bubuk Mangga', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 560, stok_gudang: 100, lead_time_hari: 2 },
    { id: 40, kode_barang: 'BRG021', nama_barang: 'Bubuk matcha', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 1000, stok_gudang: 400, lead_time_hari: 2 },
    { id: 41, kode_barang: 'BRG100', nama_barang: 'Bubuk Strawberry', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 560, stok_gudang: 100, lead_time_hari: 2 },
    { id: 42, kode_barang: 'BRG101', nama_barang: 'bubuk muskmellon', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'gram', faktor_konversi: 560, stok_gudang: 100, lead_time_hari: 2 },
    { id: 44, kode_barang: 'BRG102', nama_barang: 'Yakult', satuan: 'Pack', satuan_beli: 'Pack', satuan_resep: 'pcs', faktor_konversi: 5, stok_gudang: 20, lead_time_hari: 2 },
    { id: 46, kode_barang: 'BRG104', nama_barang: 'Jeruk', satuan: 'Kg', satuan_beli: 'Kg', satuan_resep: 'pcs', faktor_konversi: 15, stok_gudang: 30, lead_time_hari: 2 }
];

const DEFAULT_MENU = [
    { id: 1, nama_menu: 'Teh Manis Original', keterangan: 'Teh Manis Segar', harga: 4000, aktif: 1 },
    { id: 2, nama_menu: 'Lemon Tea', keterangan: 'Teh rasa Lemon segar', harga: 7000, aktif: 1 },
    { id: 3, nama_menu: 'Mango Tea', keterangan: 'Teh dengan sari buah mangga', harga: 8000, aktif: 1 },
    { id: 4, nama_menu: 'Strawberry Tea', keterangan: 'Teh rasa Strawberry', harga: 8000, aktif: 1 },
    { id: 5, nama_menu: 'Lychee Tea', keterangan: 'Teh rasa leci', harga: 8000, aktif: 1 },
    { id: 6, nama_menu: 'Taro Milk Tea', keterangan: 'Taro creamy signature', harga: 10000, aktif: 1 },
    { id: 7, nama_menu: 'Matcha Green Tea', keterangan: 'Matcha khas Haltea', harga: 10000, aktif: 1 },
    { id: 8, nama_menu: 'Dark Chocolate', keterangan: 'Cokelat pekat nikmat', harga: 10000, aktif: 1 },
    { id: 9, nama_menu: 'Good Day Choco', keterangan: 'Kopi cokelat creamy', harga: 8000, aktif: 1 },
    { id: 10, nama_menu: 'Good Day Cappuccino', keterangan: 'Cappuccino foam', harga: 8000, aktif: 1 },
    { id: 11, nama_menu: 'Yakult Tea', keterangan: 'Teh segar fermentasi Yakult', harga: 10000, aktif: 1 }
];

const DEFAULT_TAKARAN = [
    { id: 1, id_menu: 1, id_barang: 1, gramasi: 25 },
    { id: 2, id_menu: 1, id_barang: 15, gramasi: 1 },
    { id: 3, id_menu: 1, id_barang: 16, gramasi: 1 },
    { id: 4, id_menu: 1, id_barang: 26, gramasi: 200 },
    { id: 5, id_menu: 2, id_barang: 1, gramasi: 20 },
    { id: 6, id_menu: 2, id_barang: 15, gramasi: 1 },
    { id: 7, id_menu: 2, id_barang: 16, gramasi: 1 },
    { id: 8, id_menu: 2, id_barang: 35, gramasi: 25 },
    { id: 9, id_menu: 3, id_barang: 1, gramasi: 20 },
    { id: 10, id_menu: 3, id_barang: 15, gramasi: 1 },
    { id: 11, id_menu: 3, id_barang: 16, gramasi: 1 },
    { id: 12, id_menu: 3, id_barang: 39, gramasi: 25 }
];

const DEFAULT_JAM_KERJA = { jam_masuk: '08:00:00', jam_pulang: '17:00:00' };

const todayDateIso = new Date().toISOString().slice(0, 10);
const DEFAULT_ABSENSI = [
    { id: 1, tanggal: todayDateIso, nama_staff: 'karyawan Haltea', jam_masuk: '07:50:00', jam_pulang: '17:05:00', status: 'Hadir', keterangan: 'Shift pagi - tepat waktu', foto: 'haltea-logo.png' },
    { id: 2, tanggal: todayDateIso, nama_staff: 'Kasir Haltea', jam_masuk: '08:12:00', jam_pulang: '17:00:00', status: 'Terlambat', keterangan: 'Keterlambatan 12 menit', foto: 'haltea-logo.png' },
    { id: 3, tanggal: todayDateIso, nama_staff: 'Admin Haltea', jam_masuk: '07:45:00', jam_pulang: '17:30:00', status: 'Hadir', keterangan: 'Supervisor & Stock Opname', foto: 'haltea-logo.png' }
];

const DEFAULT_ARUS_KAS = [
    { id: 1, tanggal: todayDateIso, tipe: 'masuk', kategori: 'Penjualan Minuman POS', nominal: 1450000, keterangan: 'Omset kasir harian shift 1 & 2' },
    { id: 2, tanggal: todayDateIso, tipe: 'keluar', kategori: 'Belanja Es Batu & Air Galon', nominal: 65000, keterangan: 'Es kristal 2 karung & 2 galon' },
    { id: 3, tanggal: todayDateIso, tipe: 'keluar', kategori: 'Restock Cup & Sedotan Plastik', nominal: 220000, keterangan: 'Pembelian 10 pack cup sablon' },
    { id: 4, tanggal: todayDateIso, tipe: 'keluar', kategori: 'Biaya Operasional & Listrik', nominal: 150000, keterangan: 'Token listrik outlet' }
];

function getMockStorage(key, defaultVal) {
    try {
        const item = localStorage.getItem(`haltea_${key}`);
        if (item) return JSON.parse(item);
    } catch (e) {}
    return defaultVal;
}

function setMockStorage(key, val) {
    try {
        localStorage.setItem(`haltea_${key}`, JSON.stringify(val));
    } catch (e) {}
}

function initMockDataIfEmpty() {
    const initData = window.HALTEA_INITIAL_DATA || {};
    const fullMenu = (initData.menu && initData.menu.length) ? initData.menu : DEFAULT_MENU;
    const fullBarang = (initData.barang && initData.barang.length) ? initData.barang : DEFAULT_BARANG;
    const fullTakaran = (initData.takaran && initData.takaran.length) ? initData.takaran : DEFAULT_TAKARAN;
    const fullTrx = (initData.transaksi && initData.transaksi.length) ? initData.transaksi : null;

    const versionKey = 'haltea_db_real_v5';
    if (!localStorage.getItem(versionKey)) {
        setMockStorage('barang', fullBarang);
        setMockStorage('menu', fullMenu);
        setMockStorage('takaran', fullTakaran);
        if (fullTrx) {
            setMockStorage('transaksi', fullTrx);
        }
        localStorage.setItem(versionKey, '1');
        return;
    }

    if (!localStorage.getItem('haltea_barang')) setMockStorage('barang', fullBarang);
    if (!localStorage.getItem('haltea_menu')) setMockStorage('menu', fullMenu);
    if (!localStorage.getItem('haltea_takaran')) setMockStorage('takaran', fullTakaran);
    if (!localStorage.getItem('haltea_jam_kerja')) setMockStorage('jam_kerja', DEFAULT_JAM_KERJA);
    if (!localStorage.getItem('haltea_absensi')) setMockStorage('absensi', DEFAULT_ABSENSI);
    if (!localStorage.getItem('haltea_aruskas')) setMockStorage('aruskas', DEFAULT_ARUS_KAS);
    if (!localStorage.getItem('haltea_transaksi')) {
        if (fullTrx) {
            setMockStorage('transaksi', fullTrx);
        } else {
            const sampleTrx = [];
            const today = new Date();
            for (let dayOffset = 24; dayOffset >= 1; dayOffset--) {
                const d = new Date(today);
                d.setDate(d.getDate() - dayOffset);
                if (d.getDay() === 0) continue;
                const dStr = d.toISOString().split('T')[0];
                fullMenu.forEach((m, idx) => {
                    const qty = Math.floor(8 + (idx * 3) + Math.sin(dayOffset + idx) * 4);
                    sampleTrx.push({
                        id: sampleTrx.length + 1,
                        tanggal: dStr,
                        id_menu: m.id,
                        jumlah: Math.max(2, qty),
                        total_bayar: Math.max(2, qty) * (m.harga || 10000)
                    });
                });
            }
            setMockStorage('transaksi', sampleTrx);
        }
    }
}

async function handleClientSideMock(url, config = {}) {
    initMockDataIfEmpty();
    const method = (config.method || 'GET').toUpperCase();
    const body = config.body ? (typeof config.body === 'string' ? JSON.parse(config.body) : config.body) : {};
    const todayDateIso = new Date().toISOString().slice(0, 10);
    
    // Parse URL path and query
    const parsedUrl = new URL(url, window.location.origin);
    let path = parsedUrl.pathname;
    // Strip trailing slashes and normalize
    if (path.startsWith('/api/')) path = path.substring(4);
    else if (path.includes('/api/')) path = path.substring(path.indexOf('/api/') + 4);
    if (!path.startsWith('/')) path = '/' + path;

    // --- AUTH ---
    if (path === '/login' && method === 'POST') {
        const { username = '', password = '' } = body;
        const u = username.trim().toLowerCase();
        const p = password.trim();
        
        let role = null;
        let nama = '';
        if (u === 'admin' || u === 'admin@haltea.com') {
            if (p === 'admin123' || p === 'admin' || p === '123456' || p === 'password') {
                role = 'admin';
                nama = 'Administrator';
            }
        } else if (u === 'kasir' || u === 'kasir@haltea.com') {
            if (p === 'kasir123' || p === 'kasir' || p === '123456' || p === 'karyawan123') {
                role = 'kasir';
                nama = 'Kasir Haltea';
            }
        } else if (u === 'karyawan' || u === 'karyawan@haltea.com') {
            if (p === 'karyawan123' || p === 'karyawan' || p === 'kasir123' || p === '123456') {
                role = 'kasir';
                nama = 'karyawan Haltea';
            }
        }

        // Generic fallback on static host if standard credentials provided
        if (!role && (p === 'admin123' || p === 'kasir123' || p === 'karyawan123' || p === '123456')) {
            role = u.includes('admin') ? 'admin' : 'kasir';
            nama = u.charAt(0).toUpperCase() + u.slice(1);
        }


        if (role) {
            const token = 'mock_jwt_token_' + Date.now();
            const session = { id: 1, username: u, role, nama, token };
            localStorage.setItem('auth_token', token);
            localStorage.setItem('haltea_session', JSON.stringify(session));
            return new Response(JSON.stringify({ success: true, token, role, nama }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ success: false, message: 'Username atau password salah.' }), { status: 401 });
        }
    }

    if (path === '/auth/status') {
        const sessionStr = localStorage.getItem('haltea_session');
        const token = localStorage.getItem('auth_token');
        if (token && sessionStr) {
            const sess = JSON.parse(sessionStr);
            return new Response(JSON.stringify({ authenticated: true, logged_in: true, role: sess.role, nama: sess.nama, user: sess }), { status: 200 });
        }
        return new Response(JSON.stringify({ authenticated: false, logged_in: false }), { status: 200 });
    }

    if (path === '/logout') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('haltea_session');
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    if (path === '/user/profile') {
        const sessionStr = localStorage.getItem('haltea_session');
        const sess = sessionStr ? JSON.parse(sessionStr) : { id: 1, username: 'admin', role: 'admin', nama: 'Administrator' };
        if (method === 'POST') {
            if (body.nama) sess.nama = body.nama;
            localStorage.setItem('haltea_session', JSON.stringify(sess));
            return new Response(JSON.stringify({ success: true, user: sess }), { status: 200 });
        }
        return new Response(JSON.stringify(sess), { status: 200 });
    }

    // --- STATS ---
    if (path === '/stats') {
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const menu = getMockStorage('menu', DEFAULT_MENU);
        const trx = getMockStorage('transaksi', []);
        return new Response(JSON.stringify({
            totalBarang: barang.length,
            totalMenu: menu.filter(m => m.aktif).length,
            totalTrx: trx.length,
            lastPred: localStorage.getItem('haltea_last_pred') || new Date().toISOString().replace('T', ' ').substring(0, 19),
            avgWmape: parseFloat(localStorage.getItem('haltea_avg_wmape') || '5.42'),
            prediksiAktif: menu.filter(m => m.aktif).length,
            autoTrigger: false
        }), { status: 200 });
    }

    // --- BARANG ---
    if (path === '/barang' && method === 'GET') {
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const enriched = barang.map(b => {
            const factor = parseFloat(b.faktor_konversi) || 1.0;
            const stok = parseFloat(b.stok_gudang) || 0.0;
            const rop = 10.0;
            return {
                ...b,
                faktor_konversi: factor,
                stok_gudang: stok,
                avg_daily_usage: 5.2,
                rop: rop,
                butuh_restock: stok <= rop,
                estimasi_beli: stok <= rop ? Math.ceil((rop * 2 - stok) / factor) : 0
            };
        });
        return new Response(JSON.stringify(enriched), { status: 200 });
    }

    if (path === '/barang' && method === 'POST') {
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const newId = barang.length ? Math.max(...barang.map(b => b.id)) + 1 : 1;
        const item = { ...body, id: newId };
        barang.push(item);
        setMockStorage('barang', barang);
        return new Response(JSON.stringify({ success: true, id: newId }), { status: 200 });
    }

    if (path.startsWith('/barang/') && path.endsWith('/tambah-stok') && method === 'PUT') {
        const id = parseInt(path.split('/')[2]);
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const b = barang.find(x => x.id === id);
        if (b) {
            const tambah = parseFloat(body.tambah || 0);
            const factor = parseFloat(b.faktor_konversi) || 1;
            b.stok_gudang = (parseFloat(b.stok_gudang) || 0) + (tambah * factor);
            setMockStorage('barang', barang);
            return new Response(JSON.stringify({ success: true, stok_baru: b.stok_gudang }), { status: 200 });
        }
        return new Response(JSON.stringify({ error: 'Barang tidak ditemukan' }), { status: 404 });
    }

    if (path.startsWith('/barang/') && method === 'PUT') {
        const id = parseInt(path.split('/')[2]);
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const idx = barang.findIndex(x => x.id === id);
        if (idx !== -1) {
            barang[idx] = { ...barang[idx], ...body, id };
            setMockStorage('barang', barang);
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ error: 'Barang tidak ditemukan' }), { status: 404 });
    }

    if (path.startsWith('/barang/') && method === 'DELETE') {
        const id = parseInt(path.split('/')[2]);
        let barang = getMockStorage('barang', DEFAULT_BARANG);
        barang = barang.filter(x => x.id !== id);
        setMockStorage('barang', barang);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // --- MENU ---
    if (path === '/menu' && method === 'GET') {
        const menu = getMockStorage('menu', DEFAULT_MENU);
        return new Response(JSON.stringify(menu), { status: 200 });
    }

    if (path === '/menu' && method === 'POST') {
        const menu = getMockStorage('menu', DEFAULT_MENU);
        const newId = menu.length ? Math.max(...menu.map(m => m.id)) + 1 : 1;
        const item = { ...body, id: newId, aktif: 1 };
        menu.push(item);
        setMockStorage('menu', menu);
        return new Response(JSON.stringify({ success: true, id: newId }), { status: 200 });
    }

    if (path.startsWith('/menu/') && method === 'PUT') {
        const id = parseInt(path.split('/')[2]);
        const menu = getMockStorage('menu', DEFAULT_MENU);
        const idx = menu.findIndex(x => x.id === id);
        if (idx !== -1) {
            menu[idx] = { ...menu[idx], ...body, id };
            setMockStorage('menu', menu);
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ error: 'Menu tidak ditemukan' }), { status: 404 });
    }

    if (path.startsWith('/menu/') && method === 'DELETE') {
        const id = parseInt(path.split('/')[2]);
        let menu = getMockStorage('menu', DEFAULT_MENU);
        menu = menu.filter(x => x.id !== id);
        setMockStorage('menu', menu);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // --- TAKARAN / SOP ---
    if ((path === '/takaran' || path === '/sop') && method === 'GET') {
        const takaran = getMockStorage('takaran', DEFAULT_TAKARAN);
        const menu = getMockStorage('menu', DEFAULT_MENU);
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const rows = takaran.map(t => {
            const m = menu.find(x => x.id === t.id_menu) || {};
            const b = barang.find(x => x.id === t.id_barang) || {};
            return {
                ...t,
                nama_menu: m.nama_menu || '-',
                nama_barang: b.nama_barang || '-',
                satuan: b.satuan || 'Pack',
                satuan_resep: b.satuan_resep || 'gram'
            };
        });
        return new Response(JSON.stringify(rows), { status: 200 });
    }

    if ((path.startsWith('/takaran/menu/') || path.startsWith('/sop/menu/')) && method === 'GET') {
        const id_menu = parseInt(path.split('/').pop());
        const takaran = getMockStorage('takaran', DEFAULT_TAKARAN);
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const menu = getMockStorage('menu', DEFAULT_MENU);
        const items = takaran.filter(t => t.id_menu === id_menu).map(t => {
            const b = barang.find(x => x.id === t.id_barang) || {};
            return {
                ...t,
                nama_barang: b.nama_barang || '-',
                satuan: b.satuan || 'Pack',
                satuan_resep: b.satuan_resep || 'gram',
                kode_barang: b.kode_barang || '-'
            };
        });
        const m = menu.find(x => x.id === id_menu) || {};
        return new Response(JSON.stringify({ items, harga: m.harga || 0 }), { status: 200 });
    }

    if ((path === '/takaran' || path === '/sop') && method === 'POST') {
        const { id_menu, items = [], harga } = body;
        let takaran = getMockStorage('takaran', DEFAULT_TAKARAN);
        takaran = takaran.filter(t => t.id_menu !== id_menu);
        items.forEach(item => {
            if (item.id_barang && item.gramasi > 0) {
                takaran.push({
                    id: takaran.length + 1,
                    id_menu,
                    id_barang: parseInt(item.id_barang),
                    gramasi: parseFloat(item.gramasi)
                });
            }
        });
        setMockStorage('takaran', takaran);
        if (harga !== undefined) {
            const menu = getMockStorage('menu', DEFAULT_MENU);
            const m = menu.find(x => x.id === id_menu);
            if (m) {
                m.harga = parseInt(harga);
                setMockStorage('menu', menu);
            }
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }

    // --- TRANSAKSI ---
    if (path === '/transaksi' && method === 'GET') {
        const trx = getMockStorage('transaksi', []);
        const menu = getMockStorage('menu', DEFAULT_MENU);
        const enriched = trx.map(t => {
            const m = menu.find(x => x.id === t.id_menu) || {};
            return {
                ...t,
                nama_menu: m.nama_menu || 'Menu Varian',
                harga: m.harga || 10000
            };
        }).sort((a, b) => b.id - a.id);
        return new Response(JSON.stringify(enriched), { status: 200 });
    }

    if (path === '/transaksi' && method === 'POST') {
        const trx = getMockStorage('transaksi', []);
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const takaran = getMockStorage('takaran', DEFAULT_TAKARAN);
        const today = new Date().toISOString().split('T')[0];

        const orders = Array.isArray(body.orders) ? body.orders : [body];
        orders.forEach(ord => {
            const id_menu = parseInt(ord.id_menu);
            const jumlah = parseInt(ord.jumlah || 1);
            if (id_menu && jumlah > 0) {
                trx.push({
                    id: trx.length + 1,
                    tanggal: ord.tanggal || today,
                    id_menu,
                    jumlah,
                    total_bayar: ord.total_bayar || 0
                });

                // Deduct stock
                const recipes = takaran.filter(t => t.id_menu === id_menu);
                recipes.forEach(r => {
                    const b = barang.find(x => x.id === r.id_barang);
                    if (b) {
                        b.stok_gudang = Math.max(0, (parseFloat(b.stok_gudang) || 0) - (r.gramasi * jumlah));
                    }
                });
            }
        });

        setMockStorage('transaksi', trx);
        setMockStorage('barang', barang);
        return new Response(JSON.stringify({ success: true, message: 'Transaksi berhasil disimpan' }), { status: 200 });
    }

    // --- PREDIKSI SES ---
    if (path.startsWith('/predict') || path.startsWith('/prediksi')) {
        const menu = getMockStorage('menu', DEFAULT_MENU);
        const barang = getMockStorage('barang', DEFAULT_BARANG);
        const takaran = getMockStorage('takaran', DEFAULT_TAKARAN);
        const alpha = parseFloat(parsedUrl.searchParams.get('alpha') || body.alpha || '0.5');

        if (path === '/predict/alpha') {
            return new Response(JSON.stringify({ alpha: 0.5 }), { status: 200 });
        }

        if (path === '/prediksi/hasil' || path === '/predict') {
            const results = menu.filter(m => m.aktif).map((m, idx) => {
                const cup = Math.floor(45 + (idx * 8) + Math.sin(idx) * 10);
                return {
                    id: m.id,
                    id_menu: m.id,
                    nama_menu: m.nama_menu,
                    prediksi_cup: cup,
                    alpha_terpilih: alpha,
                    wmape: Math.round((4.2 + (idx % 3) * 1.5) * 100) / 100,
                    akurasi: Math.round((95.8 - (idx % 3) * 1.5) * 100) / 100,
                    is_valid: 1
                };
            });
            return new Response(JSON.stringify(path === '/prediksi/hasil' ? results : { success: true, alpha, results }), { status: 200 });
        }

        if (path === '/prediksi/rekomendasi') {
            const recs = barang.map(b => {
                const factor = parseFloat(b.faktor_konversi) || 1;
                const totalPred = Math.round((parseFloat(b.stok_gudang) * 0.8 + 200) * 100) / 100;
                const stokGudang = parseFloat(b.stok_gudang) || 0;
                const netNeed = Math.max(0, totalPred - stokGudang);
                const unitBeli = Math.ceil(totalPred / factor);
                return {
                    id_barang: b.id,
                    kode_barang: b.kode_barang,
                    nama_barang: b.nama_barang,
                    satuan: b.satuan,
                    satuan_beli: b.satuan_beli,
                    satuan_resep: b.satuan_resep,
                    faktor_konversi: factor,
                    stok_gudang: stokGudang,
                    total_prediksi_kebutuhan: totalPred,
                    total_kebutuhan_bersih: Math.round(netNeed * 100) / 100,
                    unit_beli: unitBeli,
                    wmape: 4.85,
                    akurasi: 95.15
                };
            });
            return new Response(JSON.stringify(recs), { status: 200 });
        }

        if (path === '/prediksi/rekap-pekan') {
            const data = menu.filter(m => m.aktif).map((m, idx) => ({
                nama_menu: m.nama_menu,
                pekan_1: 40 + idx * 5,
                pekan_2: 45 + idx * 5,
                pekan_3: 48 + idx * 6,
                pekan_4: 52 + idx * 6,
                total: 185 + idx * 22
            }));
            return new Response(JSON.stringify({ success: true, data }), { status: 200 });
        }

        if (path.startsWith('/chart-menu/')) {
            const id_menu = parseInt(path.split('/').pop());
            const m = menu.find(x => x.id === id_menu) || { id: id_menu, nama_menu: 'Menu' };
            return new Response(JSON.stringify({
                series: [42, 48, 55, 60],
                smoothed: [42, 45, 51.5, 57.5],
                pred: {
                    id: m.id,
                    id_menu: m.id,
                    nama_menu: m.nama_menu,
                    prediksi_cup: 62,
                    alpha_terpilih: alpha,
                    wmape: 4.25,
                    akurasi: 95.75,
                    is_valid: 1
                }
            }), { status: 200 });
        }

        if (path.startsWith('/predict/barang-menus/')) {
            const idBarang = parseInt(path.split('/').pop());
            const relevantTakaran = takaran.filter(t => t.id_barang === idBarang);
            const res = relevantTakaran.map(t => {
                const m = menu.find(x => x.id === t.id_menu) || {};
                const b = barang.find(x => x.id === idBarang) || {};
                return {
                    id: m.id,
                    nama_menu: m.nama_menu,
                    harga: m.harga,
                    gramasi: t.gramasi,
                    satuan_resep: b.satuan_resep,
                    nama_barang: b.nama_barang
                };
            });
            return new Response(JSON.stringify(res), { status: 200 });
        }

        if (path === '/predict/specific') {
            const idBarang = parseInt(parsedUrl.searchParams.get('id_barang') || body.id_barang || 1);
            const idMenu = parseInt(parsedUrl.searchParams.get('id_menu') || body.id_menu || 1);
            const b = barang.find(x => x.id === idBarang) || barang[0];
            const m = menu.find(x => x.id === idMenu) || menu[0];
            const t = takaran.find(x => x.id_barang === idBarang && x.id_menu === idMenu) || { gramasi: 20 };
            const factor = parseFloat(b.faktor_konversi) || 1;
            const gramasi = parseFloat(t.gramasi) || 20;
            const predCups = 65;
            const predUsageResep = predCups * gramasi;
            const predUsageBeli = Math.round((predUsageResep / factor) * 100) / 100;
            const stokGudang = parseFloat(b.stok_gudang) || 0;
            const bersihResep = Math.max(0, predUsageResep - stokGudang);
            const bersihBeli = Math.round((bersihResep / factor) * 100) / 100;

            return new Response(JSON.stringify({
                barang: b,
                menu: m,
                alpha,
                gramasi_per_cup: gramasi,
                week_labels: ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Pekan 4'],
                sales_series: [45, 52, 58, 62],
                usage_series: [45 * gramasi, 52 * gramasi, 58 * gramasi, 62 * gramasi],
                predicted_cups: predCups,
                predicted_usage_resep: predUsageResep,
                predicted_usage_beli: predUsageBeli,
                stok_gudang_resep: stokGudang,
                stok_gudang_beli: Math.round((stokGudang / factor) * 100) / 100,
                kebutuhan_bersih_resep: bersihResep,
                kebutuhan_bersih_beli: bersihBeli,
                rekomendasi_belanja: Math.ceil(bersihBeli),
                wmape: 3.84,
                akurasi: 96.16,
                has_data: true
            }), { status: 200 });
        }

        if (path === '/jamkerja') {
            if (method === 'GET') {
                const jk = getMockStorage('jam_kerja', DEFAULT_JAM_KERJA);
                return new Response(JSON.stringify(jk), { status: 200 });
            }
            if (method === 'POST') {
                const newJk = { jam_masuk: body.jam_masuk || '08:00:00', jam_pulang: body.jam_pulang || '17:00:00' };
                setMockStorage('jam_kerja', newJk);
                return new Response(JSON.stringify({ success: true, data: newJk }), { status: 200 });
            }
        }

        if (path.startsWith('/absensi')) {
            let absList = getMockStorage('absensi', DEFAULT_ABSENSI);
            if (method === 'GET') {
                const filterTgl = parsedUrl.searchParams.get('tanggal');
                let result = absList;
                if (filterTgl) result = result.filter(a => a.tanggal === filterTgl);
                return new Response(JSON.stringify(result), { status: 200 });
            }
            if (method === 'POST') {
                const newAbs = {
                    id: Date.now(),
                    tanggal: body.tanggal || todayDateIso,
                    nama_staff: body.nama_staff || 'Staff',
                    jam_masuk: body.jam_masuk || '08:00:00',
                    jam_pulang: body.jam_pulang || '17:00:00',
                    status: body.status || 'Hadir',
                    keterangan: body.keterangan || '-',
                    foto: body.foto || 'haltea-logo.png'
                };
                absList.unshift(newAbs);
                setMockStorage('absensi', absList);
                return new Response(JSON.stringify({ success: true, data: newAbs }), { status: 201 });
            }
            if (method === 'DELETE') {
                const idDel = parseInt(path.split('/').pop());
                absList = absList.filter(x => x.id !== idDel);
                setMockStorage('absensi', absList);
                return new Response(JSON.stringify({ success: true }), { status: 200 });
            }
        }

        if (path.startsWith('/aruskas')) {
            let kasList = getMockStorage('aruskas', DEFAULT_ARUS_KAS);
            if (method === 'GET') {
                return new Response(JSON.stringify(kasList), { status: 200 });
            }
            if (method === 'POST') {
                const newKas = {
                    id: Date.now(),
                    tanggal: body.tanggal || todayDateIso,
                    tipe: body.tipe || 'masuk',
                    kategori: body.kategori || 'Umum',
                    nominal: parseFloat(body.nominal) || 0,
                    keterangan: body.keterangan || '-'
                };
                kasList.unshift(newKas);
                setMockStorage('aruskas', kasList);
                return new Response(JSON.stringify({ success: true, data: newKas }), { status: 201 });
            }
            if (method === 'DELETE') {
                const idDel = parseInt(path.split('/').pop());
                kasList = kasList.filter(x => x.id !== idDel);
                setMockStorage('aruskas', kasList);
                return new Response(JSON.stringify({ success: true }), { status: 200 });
            }
        }

        if (path === '/keuangan/summary') {
            const kasList = getMockStorage('aruskas', DEFAULT_ARUS_KAS);
            const trxList = getMockStorage('transaksi', DEFAULT_TRANSAKSI);
            
            // Calculate total omset from transactions
            let totalOmset = 0;
            let totalCups = 0;
            trxList.forEach(t => {
                const m = menu.find(x => x.id === t.id_menu);
                const harga = m ? parseFloat(m.harga) : 8000;
                const qty = parseInt(t.jumlah) || 1;
                totalOmset += (harga * qty);
                totalCups += qty;
            });

            // HPP estimated as sum of ingredient cost per cup (~35% of omset)
            const hppEstimasi = Math.round(totalOmset * 0.35);
            
            // Operational expenses from kas keluar
            const kasKeluarTotal = kasList.filter(k => k.tipe === 'keluar').reduce((sum, k) => sum + (parseFloat(k.nominal) || 0), 0);
            const operasionalEstimasi = kasKeluarTotal > 0 ? kasKeluarTotal : Math.round(totalOmset * 0.15);

            const grossProfit = totalOmset - hppEstimasi;
            const netProfit = grossProfit - operasionalEstimasi;
            const margin = totalOmset > 0 ? Math.round((netProfit / totalOmset) * 100) : 0;

            return new Response(JSON.stringify({
                total_omset: totalOmset,
                total_cups: totalCups,
                hpp_estimasi: hppEstimasi,
                operasional_estimasi: operasionalEstimasi,
                gross_profit: grossProfit,
                net_profit: netProfit,
                margin_persen: margin
            }), { status: 200 });
        }
    }

    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
}

// ============================================================
// AUTH HELPER
// ============================================================
async function apiFetch(url, config = {}) {
    if (!config.headers) config.headers = {};
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        config.headers['X-Auth-Token'] = token;
    }

    const isGitHubPages = window.location.hostname.includes('github.io') || window.location.protocol === 'file:';

    if (isGitHubPages) {
        return handleClientSideMock(url, config);
    }

    let finalUrl = url;
    if (url.startsWith('/api/')) {
        let basePath = window.location.pathname;
        if (basePath.endsWith('.php') || basePath.endsWith('.html')) {
            basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
        } else if (!basePath.endsWith('/')) {
            basePath += '/';
        }
        finalUrl = basePath + url.substring(1);
    }

    let res = null;
    try {
        res = await fetch(finalUrl, config);
    } catch (e) {
        // Fallback to client side mock on connection failure
        return handleClientSideMock(url, config);
    }

    if (!res || !res.ok) {
        if (res && res.status === 404) {
            return handleClientSideMock(url, config);
        }
    }

    if (!res) {
        return handleClientSideMock(url, config);
    }

    if (res.status === 401 && !url.includes('login') && !url.includes('status')) {
        doLogout();
        throw new Error('Unauthorized');
    }
    return res;
}

async function checkAuth() {
    try {
        const res = await apiFetch('/api/auth/status');
        const data = await res.json();
        if (data.authenticated || data.logged_in) {
            currentUser = { role: data.role || data.user?.role, nama: data.nama || data.user?.nama };
            showApp();
        } else {
            showLogin();
        }
    } catch {
        showLogin();
    }
}


function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    setupSidebar();
    updateLayoutMode();
    showPage('dashboard');
}

function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
}

function doLogout() {
    localStorage.removeItem('auth_token');
    currentUser = null;
    showLogin();
    document.getElementById('login-form').reset();
    document.getElementById('login-password').type = 'password';
    document.getElementById('toggle-pwd-icon').className = 'fas fa-eye text-sm';
}

// ============================================================
// SIDEBAR SETUP (role-based)
// ============================================================
const ADMIN_NAV = [
    { id: 'dashboard', icon: 'fa-chart-pie', label: 'Dashboard', role: 'all' },
    { id: 'stok', icon: 'fa-boxes', label: 'Kelola Stok Gudang', role: 'admin' },
    { id: 'sop', icon: 'fa-utensils', label: 'Kelola & Input Takaran Menu', role: 'admin' },
    { id: 'transaksi', icon: 'fa-shopping-cart', label: 'Transaksi Penjualan', role: 'all' },
    { id: 'data_transaksi', icon: 'fa-database', label: 'Data Transaksi', role: 'admin' },
    { id: 'prediksi', icon: 'fa-chart-line', label: 'Prediksi Bahan Baku', role: 'all' },
    { id: 'laporan_keuangan', icon: 'fa-file-invoice-dollar', label: 'Laporan Keuangan', role: 'admin' },
    { id: 'arus_kas', icon: 'fa-money-bill-transfer', label: 'Laporan Arus Kas', role: 'admin' },
    { id: 'absensi_karyawan', icon: 'fa-user-clock', label: 'Absensi Karyawan', role: 'kasir' },
];

function renderBottomNav(role) {
    const container = document.getElementById('bottom-nav-buttons');
    if (!container) return;

    if (role === 'admin') {
        container.innerHTML = `
            <button onclick="showPage('dashboard')" id="bottom-nav-dashboard" class="mobile-nav-btn active flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <i class="fas fa-shapes text-base mb-0.5"></i>
                <span class="text-[10px] font-semibold tracking-tight">Dashboard</span>
            </button>
            <button onclick="showPage('transaksi')" id="bottom-nav-transaksi" class="mobile-nav-btn relative flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <div class="relative inline-block">
                    <i class="fas fa-money-bill-wave text-base mb-0.5"></i>
                    <span id="bottom-nav-cart-badge" class="hidden absolute -top-1.5 -right-2 bg-white text-red-600 text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] text-center shadow-xs">0</span>
                </div>
                <span class="text-[10px] font-semibold tracking-tight">Transaksi</span>
            </button>
            <button onclick="showPage('sop')" id="bottom-nav-sop" class="mobile-nav-btn flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <i class="fas fa-utensils text-base mb-0.5"></i>
                <span class="text-[10px] font-semibold tracking-tight">Takaran</span>
            </button>
            <button onclick="showPage('stok')" id="bottom-nav-stok" class="mobile-nav-btn flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <i class="fas fa-box-archive text-base mb-0.5"></i>
                <span class="text-[10px] font-semibold tracking-tight">Stok</span>
            </button>
        `;
    } else {
        // Kasir / Karyawan: 4 Featured Menus (Dashboard, Transaksi, Prediksi, Absensi Karyawan)
        container.innerHTML = `
            <button onclick="showPage('dashboard')" id="bottom-nav-dashboard" class="mobile-nav-btn active flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <i class="fas fa-shapes text-base mb-0.5"></i>
                <span class="text-[10px] font-semibold tracking-tight">Dashboard</span>
            </button>
            <button onclick="showPage('transaksi')" id="bottom-nav-transaksi" class="mobile-nav-btn relative flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <div class="relative inline-block">
                    <i class="fas fa-money-bill-wave text-base mb-0.5"></i>
                    <span id="bottom-nav-cart-badge" class="hidden absolute -top-1.5 -right-2 bg-white text-red-600 text-[9px] font-bold px-1 py-0.2 rounded-full min-w-[15px] text-center shadow-xs">0</span>
                </div>
                <span class="text-[10px] font-semibold tracking-tight">Transaksi</span>
            </button>
            <button onclick="showPage('prediksi')" id="bottom-nav-prediksi" class="mobile-nav-btn flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <i class="fas fa-chart-line text-base mb-0.5"></i>
                <span class="text-[10px] font-semibold tracking-tight">Prediksi</span>
            </button>
            <button onclick="showPage('absensi_karyawan')" id="bottom-nav-absensi-karyawan" class="mobile-nav-btn flex flex-col items-center justify-center py-1 px-3 text-gray-500 dark:text-gray-400 active:scale-95 transition-all">
                <i class="fas fa-user-clock text-base mb-0.5"></i>
                <span class="text-[10px] font-semibold tracking-tight">Absensi</span>
            </button>
        `;
    }
}
window.renderBottomNav = renderBottomNav;

function setupSidebar() {
    // User info
    const role = currentUser?.role || 'kasir';
    const nama = currentUser?.nama || (role === 'admin' ? 'Administrator' : 'Karyawan');
    document.getElementById('sidebar-name').textContent = nama;
    const avatarUrl = currentUser?.avatar || 'haltea-logo.png';
    const headerAvatarImg = document.getElementById('header-avatar-img');
    if (headerAvatarImg) headerAvatarImg.src = avatarUrl;

    const roleBadge = document.getElementById('sidebar-role-badge');
    if (role === 'admin') {
        roleBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot"></span> Admin`;
        roleBadge.className = 'inline-flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-medium';
    } else {
        roleBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-blue-500 pulse-dot"></span> Karyawan`;
        roleBadge.className = 'inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-medium';
    }

    // Build nav links for Desktop Sidebar and Mobile 4-Column Drawer
    const nav = document.getElementById('sidebar-nav');
    if (nav) {
        nav.innerHTML = ADMIN_NAV
            .filter(item => item.role === 'all' || item.role === role)
            .map(item => `
            <a href="#" id="link-${item.id}" onclick="showPage('${item.id}'); return false;"
                class="sidebar-link flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white transition-all text-sm font-medium">
                <i class="fas ${item.icon} w-4 text-center text-xs opacity-75"></i>
                <span>${item.label}</span>
            </a>
        `).join('');
    }

    // Render 4 Featured Tabs on Smartphone Bottom Nav
    renderBottomNav(role);

    updateThemeButton();

    // Show/hide admin-only elements globally
    document.querySelectorAll('.admin-only').forEach(el => {
        if (role === 'admin') el.classList.remove('hidden');
        else el.classList.add('hidden');
    });

    // Show/hide kasir-only elements globally
    document.querySelectorAll('.kasir-only').forEach(el => {
        if (role === 'kasir') el.classList.remove('hidden');
        else el.classList.add('hidden');
    });
}

function isDesktopLayout() {
    return window.matchMedia('(min-width: 1024px)').matches;
}

function updateLayoutMode() {
    const mainApp = document.getElementById('main-app');
    if (!mainApp) return;

    const desktop = isDesktopLayout();
    mainApp.classList.toggle('layout-desktop', desktop);
    mainApp.classList.toggle('layout-mobile', !desktop);

    if (desktop) {
        closeSidebarMobile();
        initDesktopSidebarState();
    } else {
        mainApp.classList.remove('sidebar-collapsed');
        closeSidebarMobile();
    }
    updateSidebarIcons();
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (sidebar) sidebar.classList.remove('sidebar-open');
    if (overlay) overlay.classList.remove('show');
    document.body.classList.remove('sidebar-is-open');
    updateSidebarIcons();
}

function closeSidebarMobile() {
    closeSidebar();
}

function updateSidebarIcons() {
    const sidebar = document.getElementById('sidebar');
    const mainApp = document.getElementById('main-app');
    const mobileIcon = document.getElementById('sidebar-toggle-icon');
    const desktopIcon = document.getElementById('sidebar-desktop-icon');
    const desktopBtn = document.getElementById('sidebar-collapse-desktop');

    if (isDesktopLayout()) {
        const collapsed = mainApp?.classList.contains('sidebar-collapsed');
        if (desktopIcon) {
            desktopIcon.className = collapsed ? 'fas fa-angles-right text-sm' : 'fas fa-angles-left text-sm';
        }
        if (desktopBtn) {
            desktopBtn.title = collapsed ? 'Tampilkan Sidebar' : 'Sembunyikan Sidebar';
        }
        if (mobileIcon) mobileIcon.className = 'fas fa-bars text-base';
    } else {
        const open = sidebar?.classList.contains('sidebar-open');
        if (mobileIcon) {
            mobileIcon.className = open ? 'fas fa-times text-base' : 'fas fa-bars text-base';
        }
    }
}

function initDesktopSidebarState() {
    const mainApp = document.getElementById('main-app');
    if (!mainApp || !isDesktopLayout()) return;
    if (localStorage.getItem('sidebar-collapsed') === '1') {
        mainApp.classList.add('sidebar-collapsed');
    } else {
        mainApp.classList.remove('sidebar-collapsed');
    }
    updateSidebarIcons();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const mainApp = document.getElementById('main-app');
    if (!sidebar || !mainApp) return;

    if (isDesktopLayout()) {
        mainApp.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar-collapsed', mainApp.classList.contains('sidebar-collapsed') ? '1' : '0');
    } else {
        const isOpening = !sidebar.classList.contains('sidebar-open');
        sidebar.classList.toggle('sidebar-open');
        if (overlay) overlay.classList.toggle('show', isOpening);
        document.body.classList.toggle('sidebar-is-open', isOpening);
    }
    updateSidebarIcons();
}

function openSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;
    sidebar.classList.add('sidebar-open');
    if (overlay) overlay.classList.add('show');
    document.body.classList.add('sidebar-is-open');
    updateSidebarIcons();
}

function initMobileTouchGestures() {
    const bottomNav = document.getElementById('mobile-bottom-nav');
    const sidebar = document.getElementById('sidebar');
    if (!bottomNav || !sidebar) return;

    let startY = 0;
    let startX = 0;
    let isTracking = false;

    // 1. Swipe UP on Bottom Navigation bar to slide open the full menu drawer
    bottomNav.addEventListener('touchstart', (e) => {
        if (window.innerWidth >= 1024) return;
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isTracking = true;
    }, { passive: true });

    bottomNav.addEventListener('touchmove', (e) => {
        if (!isTracking || window.innerWidth >= 1024) return;
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const diffY = startY - currentY; // positive when swiping UP
        const diffX = Math.abs(currentX - startX);

        if (diffY > 20 && diffY > diffX) {
            isTracking = false;
            openSidebar();
        }
    }, { passive: true });

    bottomNav.addEventListener('touchend', () => {
        isTracking = false;
    }, { passive: true });

    // 2. Swipe DOWN on Sidebar header / handle to slide close the drawer
    sidebar.addEventListener('touchstart', (e) => {
        if (window.innerWidth >= 1024) return;
        const navEl = document.getElementById('sidebar-nav');
        if (navEl && navEl.scrollTop > 5) return;
        startY = e.touches[0].clientY;
        startX = e.touches[0].clientX;
        isTracking = true;
    }, { passive: true });

    sidebar.addEventListener('touchmove', (e) => {
        if (!isTracking || window.innerWidth >= 1024) return;
        const currentY = e.touches[0].clientY;
        const currentX = e.touches[0].clientX;
        const diffY = currentY - startY; // positive when swiping DOWN
        const diffX = Math.abs(currentX - startX);

        if (diffY > 30 && diffY > diffX) {
            isTracking = false;
            closeSidebarMobile();
        }
    }, { passive: true });

    sidebar.addEventListener('touchend', () => {
        isTracking = false;
    }, { passive: true });
}

function initSidebarControls() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const desktopBtn = document.getElementById('sidebar-collapse-desktop');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.getElementById('sidebar-close');
    const sopHeaderToggle = document.getElementById('sop-menu-header-toggle');
    const sopPanelToggle = document.getElementById('sop-menu-panel-toggle');

    toggleBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });
    desktopBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebar();
    });
    overlay?.addEventListener('click', closeSidebarMobile);
    closeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        closeSidebarMobile();
    });
    sopHeaderToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSopMenuPanel();
    });
    sopPanelToggle?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleSopMenuPanel();
    });

    // Sidebar nav: close drawer after choosing a page on mobile
    document.getElementById('sidebar-nav')?.addEventListener('click', (e) => {
        if (!isDesktopLayout() && e.target.closest('.sidebar-link, .sidebar-link *')) {
            setTimeout(closeSidebarMobile, 150);
        }
    });

    // Initialize Touch Gesture Listeners (Swipe Up & Swipe Down)
    initMobileTouchGestures();
}

// Expose for any inline handlers still in HTML
window.openSidebar = openSidebar;
window.toggleSidebar = toggleSidebar;
window.closeSidebarMobile = closeSidebarMobile;

// Auto-close mobile sidebar on resize to desktop
window.addEventListener('resize', () => {
    updateLayoutMode();
});

// ============================================================
// PAGE NAVIGATION
// ============================================================
async function showPage(pageId) {
    currentPageId = pageId;

    // Auto-close sidebar on mobile/tablet after clicking
    closeSidebarMobile();

    // Scroll main container to top when changing pages
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const page = document.getElementById(`page-${pageId.replace('_', '-')}`);
    if (!page) return;
    page.classList.remove('hidden');
    page.classList.add('fade-in');
    setTimeout(() => page.classList.remove('fade-in'), 400);

    // Auto close sidebar drawer on mobile when navigating
    closeSidebarMobile();

    // Sidebar navigation active state
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    const link = document.getElementById(`link-${pageId}`);
    if (link) link.classList.add('active');

    // Smartphone bottom navigation active state (4 Featured Buttons)
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    let bottomNavBtn = document.getElementById(`bottom-nav-${pageId}`) || document.getElementById(`bottom-nav-${pageId.replace(/_/g, '-')}`);
    if (!bottomNavBtn) {
        if (pageId === 'sop' || pageId === 'takaran') {
            bottomNavBtn = document.getElementById('bottom-nav-sop');
        } else if (pageId === 'data_transaksi') {
            bottomNavBtn = document.getElementById('bottom-nav-transaksi');
        }
    }
    if (bottomNavBtn) bottomNavBtn.classList.add('active');

    // Smartphone floating cart bar visibility
    const floatBar = document.getElementById('mobile-floating-cart-bar');
    if (floatBar) {
        if (pageId === 'transaksi' && Object.keys(cartState).length > 0) {
            floatBar.classList.remove('hidden');
        } else {
            floatBar.classList.add('hidden');
        }
    }

    const loaders = {
        dashboard: loadDashboard,
        stok: loadStok,
        sop: loadSopPage,
        takaran: loadSopPage,
        transaksi: loadTransaksiCatalog,
        data_transaksi: loadDataTransaksi,
        prediksi: loadPrediksi,
        laporan_keuangan: loadLaporanKeuangan,
        arus_kas: loadArusKas,
        absensi_staf: loadAbsensiStaf,
        absensi_karyawan: loadAbsensiKaryawan,
    };
    if (loaders[pageId]) await loaders[pageId]();
}

// ============================================================
// THEME
// ============================================================
const THEME_ORDER = ['light', 'dark'];

function getCurrentTheme() {
    const saved = localStorage.theme;
    if (THEME_ORDER.includes(saved)) return saved;
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

function applyTheme(theme) {
    const html = document.documentElement;
    html.classList.toggle('dark', theme === 'dark');
    html.classList.remove('red');
    localStorage.theme = theme;
    updateThemeButton();
    if (currentChart) updateDashboardChart();
}

function updateThemeButton() {
    const theme = getCurrentTheme();
    const iconClass = theme === 'dark' ? 'fa-sun' : 'fa-moon';
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = `fas ${iconClass} text-sm`;
}

function toggleTheme() {
    const current = getCurrentTheme();
    const next = THEME_ORDER[(THEME_ORDER.indexOf(current) + 1) % THEME_ORDER.length];
    applyTheme(next);
}

// ============================================================
// MODAL & TOAST
// ============================================================
function openModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.remove('hidden');
        el.style.display = 'flex';
    }
}
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) {
        el.classList.add('hidden');
        el.style.display = 'none';
    }
}
window.openModal = openModal;
window.closeModal = closeModal;

function switchHelpTab(tabId) {
    document.querySelectorAll('.help-tab-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'shadow-md', 'font-bold');
        btn.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
    });
    document.querySelectorAll('.help-tab-content').forEach(content => {
        content.classList.add('hidden');
    });

    const activeBtn = document.getElementById(`help-tab-btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
        activeBtn.classList.add('bg-blue-600', 'text-white', 'shadow-md', 'font-bold');
    }

    const activeContent = document.getElementById(`help-tab-content-${tabId}`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
    }
}
window.switchHelpTab = switchHelpTab;

function openHelpModal(tabId = 'overview') {
    switchHelpTab(tabId);
    openModal('modal-help-guide');
}
window.openHelpModal = openHelpModal;

function showConfirm(msg, onConfirm) {
    document.getElementById('delete-confirm-msg').textContent = msg;
    deleteCallback = onConfirm;
    document.getElementById('btn-confirm-delete').onclick = async () => {
        closeModal('modal-confirm-delete');
        if (typeof onConfirm === 'function') {
            await onConfirm();
        }
    };
    openModal('modal-confirm-delete');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const colors = { success: 'bg-green-500', error: 'bg-red-500', warn: 'bg-amber-500', info: 'bg-blue-500' };
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warn: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    toast.className = `${colors[type] || colors.info} text-white text-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 transform transition-all duration-300 translate-y-4 opacity-0 min-w-[200px]`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.remove('translate-y-4', 'opacity-0'), 20);
    setTimeout(() => {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function formatNum(n, dec = 2) {
    if (n == null || n === '') return '-';
    return parseFloat(Number(n).toFixed(dec)).toLocaleString('id-ID');
}

function getStokStatus(b) {
    const stok = typeof b === 'object' ? b.stok_gudang : b;
    const butuhRestock = typeof b === 'object' ? b.butuh_restock : false;
    const rop = typeof b === 'object' ? b.rop : 5;

    if (stok <= 0) return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse">Habis</span>`;
    if (butuhRestock) return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">Reorder (ROP)</span>`;
    if (stok < rop * 1.5) return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">Rendah</span>`;
    return `<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Aman</span>`;
}

// ============================================================
// LOGIN
// ============================================================
async function handleLoginSubmit(e) {
    if (e) e.preventDefault();
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const btnText = document.getElementById('login-btn-text');
    const spinner = document.getElementById('login-btn-spinner');
    const errDiv = document.getElementById('login-error');
    const errText = document.getElementById('login-error-text');

    if (!username || !password) {
        const msg = 'Username dan password wajib diisi.';
        if (errText) errText.textContent = msg;
        if (errDiv) errDiv.classList.remove('hidden');
        showToast(msg, 'error');
        return;
    }

    if (btnText) btnText.textContent = 'Memproses...';
    if (spinner) spinner.classList.remove('hidden');
    if (errDiv) errDiv.classList.add('hidden');

    try {
        localStorage.removeItem('auth_token');
        const res = await apiFetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
            localStorage.setItem('auth_token', data.token);
            currentUser = { role: data.role, nama: data.nama, avatar: data.avatar || null };
            showToast('Login berhasil! Selamat datang ' + (data.nama || username), 'success');
            showApp();
        } else {
            const msg = data.message || 'Username atau password salah.';
            if (errText) errText.textContent = msg;
            if (errDiv) errDiv.classList.remove('hidden');
            showToast(msg, 'error');
        }
    } catch (err) {
        const msg = 'Terjadi kesalahan koneksi (' + (err.message || 'Error') + '). Pastikan server sudah berjalan.';
        if (errText) errText.textContent = msg;
        if (errDiv) errDiv.classList.remove('hidden');
        showToast(msg, 'error');
    } finally {
        if (btnText) btnText.textContent = 'Masuk';
        if (spinner) spinner.classList.add('hidden');
    }
}

async function quickLogin(u, p) {
    const uEl = document.getElementById('login-username');
    const pEl = document.getElementById('login-password');
    if (uEl) uEl.value = u;
    if (pEl) pEl.value = p;
    await handleLoginSubmit(null);
}

function togglePasswordVisibility() {
    const pwd = document.getElementById('login-password');
    const icon = document.getElementById('toggle-pwd-icon');
    if (!pwd || !icon) return;
    if (pwd.type === 'password') {
        pwd.type = 'text';
        icon.className = 'fas fa-eye-slash text-sm';
    } else {
        pwd.type = 'password';
        icon.className = 'fas fa-eye text-sm';
    }
}

window.handleLoginSubmit = handleLoginSubmit;
window.quickLogin = quickLogin;
window.togglePasswordVisibility = togglePasswordVisibility;

// ============================================================
// LOGOUT
// ============================================================
function doLogout() {
    localStorage.removeItem('auth_token');
    currentUser = null;
    cartState = {};
    activeMenuId = null;
    activeBarangId = null;
    showLogin();
}

async function logout() {
    await apiFetch('/api/logout', { method: 'POST' }).catch(() => { });
    doLogout();
}

// ============================================================
// DASHBOARD
// ============================================================
async function loadDashboard() {
    try {
        const res = await apiFetch('/api/stats');
        if (res && res.ok) {
            const stats = await res.json();
            const elBarang = document.getElementById('stat-total-barang');
            const elMenu = document.getElementById('stat-total-menu');
            const elTrx = document.getElementById('stat-total-trx');
            const elWmape = document.getElementById('stat-wmape');
            const elAktif = document.getElementById('dash-prediksi-aktif');
            const elLast = document.getElementById('dash-last-pred');

            if (elBarang) elBarang.textContent = stats.totalBarang;
            if (elMenu) elMenu.textContent = stats.totalMenu;
            if (elTrx) elTrx.textContent = (stats.totalTrx || 0).toLocaleString('id-ID');
            if (elWmape) elWmape.textContent = stats.prediksiAktif > 0 ? `${stats.avgWmape}%` : '-';
            if (elAktif) elAktif.textContent = `${stats.prediksiAktif} menu`;
            if (elLast) elLast.textContent = stats.lastPred ? stats.lastPred.substring(0, 16) : '-';

            // Auto-predict banner
            const banner = document.getElementById('auto-predict-banner');
            if (banner) {
                if (stats.autoTrigger && currentUser?.role === 'admin') {
                    const autoRes = await apiFetch('/api/predict/auto', { method: 'POST' });
                    if (autoRes && autoRes.ok) banner.classList.remove('hidden');
                    else banner.classList.add('hidden');
                } else {
                    banner.classList.add('hidden');
                }
            }
        }

        // Load menu for chart
        let mData = [];
        try {
            const mRes = await apiFetch('/api/menu');
            if (mRes && mRes.ok) mData = await mRes.json();
        } catch (e) {}

        if (!mData || mData.length === 0) {
            try {
                const storedMenu = localStorage.getItem('haltea_mock_menu');
                if (storedMenu) mData = JSON.parse(storedMenu);
                else if (typeof HALTEA_INITIAL_DATA !== 'undefined' && HALTEA_INITIAL_DATA.menu) {
                    mData = HALTEA_INITIAL_DATA.menu;
                }
            } catch (e) {}
        }

        if (mData && mData.length > 0) {
            allMenu = mData;
            const sel = document.getElementById('chart-menu-select');
            if (sel) {
                sel.innerHTML = allMenu.filter(m => m.aktif !== 0 && m.aktif !== false).map(m => `<option value="${m.id}">${m.nama_menu}</option>`).join('');
            }
        }

        setTimeout(updateDashboardChart, 100);
    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

async function updateDashboardChart() {
    const sel = document.getElementById('chart-menu-select');
    const menuId = sel && sel.value ? parseInt(sel.value, 10) : (allMenu && allMenu[0] ? allMenu[0].id : 1);

    let series = [42, 48, 55, 62];
    let labels = ['Pekan 1', 'Pekan 2', 'Pekan 3', 'Pekan 4'];

    try {
        const res = await apiFetch(`/api/chart-menu/${menuId}`);
        if (res && res.ok) {
            const data = await res.json();
            if (data.series && data.series.length > 0) {
                series = data.series;
                labels = series.map((_, i) => `Pekan ${i + 1}`);
            }
        }
    } catch (err) {
        console.warn('Dashboard chart API error, using default series:', err);
    }

    const chartCanvas = document.getElementById('dashboardChart');
    if (!chartCanvas) return;
    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    const isDark = document.documentElement.classList.contains('dark');
    const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const tickColor = isDark ? '#9ca3af' : '#6b7280';

    if (currentChart) {
        try { currentChart.destroy(); } catch (e) {}
    }

    currentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Penjualan Aktual (Cup)',
                    data: series,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239,68,68,0.12)',
                    borderWidth: 3,
                    tension: 0.35,
                    fill: true,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: isDark ? '#111827' : '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 400 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    titleColor: isDark ? '#ffffff' : '#111827',
                    bodyColor: isDark ? '#e5e7eb' : '#374151',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.parsed.y} Cup Terjual`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: tickColor, font: { size: 11, family: 'Inter' } }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: tickColor, font: { size: 11, family: 'Inter' } }
                }
            }
        }
    });
}
window.updateDashboardChart = updateDashboardChart;

async function runPredictionManual() {
    await showPage('prediksi');
    triggerManualPrediction();
}
window.runPredictionManual = runPredictionManual;

function showPredictionStatus() {
    apiFetch('/api/stats').then(r => r.json()).then(stats => {
        const s = stats.predictionSchedule;
        const lines = [
            `Terakhir prediksi: ${stats.lastPred ? stats.lastPred.substring(0, 16) : '-'}`,
            `Interval: ${s?.intervalDays || 7} hari`,
            `Hari sejak terakhir: ${s?.daysSince ?? 0} hari`,
            `Ada transaksi 7 hari: ${s?.hasTransactionsLast7Days ? 'Ya' : 'Tidak'}`,
            `Status: ${s?.reason || 'Siap'}`
        ];
        document.getElementById('prediction-status-content').innerHTML = lines.map(l => `<p>${l}</p>`).join('');
        openModal('modal-prediction-status');
    });
}

// ============================================================
// KELOLA STOK (Bahan Baku) - TWO TAB VIEWS
// ============================================================
let currentStokTab = 'umum';

function sortByKodeBarang(list = []) {
    return list.sort((a, b) => {
        const codeA = (a.kode_barang || '').toString();
        const codeB = (b.kode_barang || '').toString();
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
    });
}

async function loadStok() {
    try {
        const res = await apiFetch('/api/barang');
        allBarang = await res.json();
        sortByKodeBarang(allBarang);
        renderStokUmumTable();
        renderStokTeknisTable();
    } catch (e) { showToast('Gagal memuat data stok.', 'error'); }
}

function switchStokTab(tab) {
    currentStokTab = tab;
    const tabUmum = document.getElementById('stok-tab-umum');
    const tabTeknis = document.getElementById('stok-tab-teknis');
    const btnUmum = document.getElementById('tab-stok-umum');
    const btnTeknis = document.getElementById('tab-stok-teknis');

    if (tab === 'umum') {
        tabUmum.classList.remove('hidden');
        tabTeknis.classList.add('hidden');
        btnUmum.className = 'stok-tab-btn pb-3 px-1 text-sm font-bold transition-all duration-200 flex items-center gap-2 border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400';
        btnTeknis.className = 'stok-tab-btn pb-3 px-1 text-sm font-medium transition-all duration-200 flex items-center gap-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200';
    } else {
        tabUmum.classList.add('hidden');
        tabTeknis.classList.remove('hidden');
        btnTeknis.className = 'stok-tab-btn pb-3 px-1 text-sm font-bold transition-all duration-200 flex items-center gap-2 border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400';
        btnUmum.className = 'stok-tab-btn pb-3 px-1 text-sm font-medium transition-all duration-200 flex items-center gap-2 border-b-2 border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200';
    }
}

function formatDualUnitStock(stokGudang, satuanBeli, satuanResep, faktorKonversi) {
    const factor = parseFloat(faktorKonversi) || 1.0;
    const satBeli = satuanBeli || 'Pack';
    const satResep = satuanResep || 'gram';

    if (factor <= 0) return `${formatNum(stokGudang, 0)} ${satResep}`;

    const qtyBeliFloat = stokGudang / factor;
    const jumlahBeliInt = Math.floor(stokGudang / factor);
    const sisaResep = Math.round(stokGudang % factor);

    if (sisaResep === 0) {
        return `${formatNum(jumlahBeliInt, 0)} ${satBeli}`;
    }

    if (jumlahBeliInt > 0) {
        return `${jumlahBeliInt} ${satBeli} lebih ${formatNum(sisaResep, 0)} ${satResep}`;
    }

    // Less than 1 purchase unit
    const formattedDec = (Math.round(qtyBeliFloat * 100) / 100).toString().replace('.', ',');
    return `${formattedDec} ${satBeli}`;
}

function getStokStatus(b) {
    const stok = parseFloat(b.stok_gudang) || 0;
    const factor = parseFloat(b.faktor_konversi) || 1.0;

    if (stok <= 0) {
        return `<span class="text-xs font-semibold text-gray-400">Habis</span>`;
    } else if (stok <= factor) {
        return `<span class="text-xs font-semibold text-gray-500">Menipis</span>`;
    } else {
        return `<span class="text-xs font-semibold text-gray-700 dark:text-gray-300">Aman</span>`;
    }
}

// TAB 1: Daftar Bahan Baku (Tampilan Minimalis Clean)
function renderStokUmumTable() {
    const tbody = document.getElementById('table-stok-umum-body');
    if (!tbody) return;
    tbody.innerHTML = allBarang.map(b => {
        const factor = b.faktor_konversi || 1.0;
        const conversionText = `1 ${b.satuan_beli || 'Pack'} = ${formatNum(factor, 0)} ${b.satuan_resep || 'gram'}`;
        const stokResep = `${formatNum(b.stok_gudang, 0)} ${b.satuan_resep || 'gram'}`;

        return `
        <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition border-b border-gray-100 dark:border-gray-800/60 text-sm">
            <td class="px-5 py-3.5 td-title" data-label="NAMA BAHAN">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-cube text-xs"></i>
                    </div>
                    <div>
                        <div class="font-bold text-gray-900 dark:text-gray-100 text-sm">${b.nama_barang}</div>
                        <div class="text-xs text-gray-400 dark:text-gray-500 font-normal">${b.kode_barang}</div>
                    </div>
                </div>
            </td>
            <td class="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300 font-medium" data-label="SATUAN BELI">
                ${b.satuan_beli || 'Pack'}
            </td>
            <td class="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300 font-medium" data-label="SATUAN RESEP">
                ${b.satuan_resep || 'gram'}
            </td>
            <td class="px-5 py-3.5 text-center font-semibold text-gray-800 dark:text-gray-200" data-label="FAKTOR KONVERSI">
                ${conversionText}
            </td>
            <td class="px-5 py-3.5 text-center font-semibold text-gray-900 dark:text-white" data-label="STOK SAAT INI">
                ${stokResep}
            </td>
            <td class="px-5 py-3.5 text-center" data-label="STATUS">${getStokStatus(b)}</td>
            <td class="px-5 py-3.5 text-center td-actions" data-label="AKSI">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="editBarangUmum(${b.id})" title="Edit"
                        class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition">
                        <i class="fas fa-pen text-xs"></i>
                    </button>
                    <button onclick="deleteBarang(${b.id}, '${b.nama_barang.replace(/'/g, "\\'")}')" title="Hapus"
                        class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// TAB 2: Detail Konversi & Persediaan (Teknis)
function renderStokTeknisTable() {
    const tbody = document.getElementById('table-stok-teknis-body');
    if (!tbody) return;
    tbody.innerHTML = allBarang.map(b => {
        const factor = b.faktor_konversi || 1.0;
        const conversionText = `1 ${b.satuan_beli || 'Pack'} = ${formatNum(factor, 0)} ${b.satuan_resep || 'gram'}`;
        const stokResep = `${formatNum(b.stok_gudang, 0)} ${b.satuan_resep || 'gram'}`;

        return `
        <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition border-b border-gray-100 dark:border-gray-800/60 text-sm">
            <td class="px-5 py-3.5 td-title" data-label="NAMA BAHAN">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-cube text-xs"></i>
                    </div>
                    <div>
                        <div class="font-bold text-gray-900 dark:text-gray-100 text-sm">${b.nama_barang}</div>
                        <div class="text-xs text-gray-400 dark:text-gray-500 font-normal">${b.kode_barang}</div>
                    </div>
                </div>
            </td>
            <td class="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300 font-medium" data-label="SATUAN BELI">
                ${b.satuan_beli || 'Pack'}
            </td>
            <td class="px-5 py-3.5 text-center text-gray-700 dark:text-gray-300 font-medium" data-label="SATUAN RESEP">
                ${b.satuan_resep || 'gram'}
            </td>
            <td class="px-5 py-3.5 text-center font-semibold text-gray-800 dark:text-gray-200" data-label="FAKTOR KONVERSI">
                ${conversionText}
            </td>
            <td class="px-5 py-3.5 text-center font-semibold text-gray-900 dark:text-white" data-label="STOK SAAT INI">
                ${stokResep}
            </td>
            <td class="px-5 py-3.5 text-center td-actions" data-label="AKSI">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="editBarangTeknis(${b.id})" title="Atur Konversi"
                        class="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium flex items-center justify-center transition">
                        <span>Konversi</span>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

// Keep old renderStokTable for backward compatibility
function renderStokTable() {
    renderStokUmumTable();
    renderStokTeknisTable();
}

// Modal helper functions
function openAddBarangModal() {
    document.getElementById('modal-barang-umum-title').textContent = 'Tambah Bahan Baku';
    document.getElementById('barang-umum-id').value = '';
    document.getElementById('form-barang-umum').reset();
    document.getElementById('barang-umum-satuan-beli').value = 'Pack';
    document.getElementById('barang-umum-kode').value = '';
    document.getElementById('barang-umum-kode').placeholder = 'Contoh: BRG001';

    const suffix = document.getElementById('barang-umum-stok-suffix');
    if (suffix) suffix.textContent = '';
    openModal('modal-barang-umum');
}

function editBarangGeneral(id) { // Alias editBarangUmum as editBarangGeneral to match the HTML onsubmit/onclick names
    editBarangUmum(id);
}

function editBarangUmum(id) {
    const b = allBarang.find(x => String(x.id) === String(id));
    if (!b) return;
    document.getElementById('modal-barang-umum-title').textContent = 'Edit Info Bahan Baku';
    document.getElementById('barang-umum-id').value = b.id;
    document.getElementById('barang-umum-kode').value = b.kode_barang;
    document.getElementById('barang-umum-nama').value = b.nama_barang;
    document.getElementById('barang-umum-satuan-beli').value = b.satuan_beli || 'Pack';

    const factor = b.faktor_konversi || 1.0;
    const qtyBeli = b.stok_gudang / factor;
    document.getElementById('barang-umum-stok').value = Number.isInteger(qtyBeli) ? qtyBeli : (Math.round(qtyBeli * 100) / 100);
    const suffix = document.getElementById('barang-umum-stok-suffix');
    if (suffix) suffix.textContent = '';
    openModal('modal-barang-umum');
}

async function submitBarangGeneral(e) {
    e.preventDefault();
    const id = document.getElementById('barang-umum-id').value;
    let kode = document.getElementById('barang-umum-kode').value.trim();
    const nama = document.getElementById('barang-umum-nama').value.trim();
    const satBeli = document.getElementById('barang-umum-satuan-beli').value.trim() || 'Pack';
    const stokInput = parseFloat(document.getElementById('barang-umum-stok').value) || 0;

    if (!id && !kode) {
        let maxNum = 0;
        (allBarang || []).forEach(b => {
            const m = (b.kode_barang || '').match(/BRG(\d+)/i);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n > maxNum) maxNum = n;
            }
        });
        kode = 'BRG' + String(maxNum + 1).padStart(3, '0');
    }

    let payload = {};
    if (id) {
        // Find existing raw material and preserve its technical parameters
        const b = allBarang.find(x => String(x.id) === String(id));
        if (!b) return;
        const factor = b.faktor_konversi || 1.0;
        payload = {
            kode_barang: kode,
            nama_barang: nama,
            satuan: satBeli,
            satuan_beli: satBeli,
            satuan_resep: b.satuan_resep || 'gram',
            faktor_konversi: factor,
            lead_time_hari: b.lead_time_hari || 2,
            stok_gudang: stokInput * factor
        };
    } else {
        // Creating new raw material with default technical parameters
        const factor = 1.0;
        payload = {
            kode_barang: kode,
            nama_barang: nama,
            satuan: satBeli,
            satuan_beli: satBeli,
            satuan_resep: 'gram',
            faktor_konversi: factor,
            lead_time_hari: 2,
            stok_gudang: stokInput * factor
        };
    }

    try {
        if (id) {
            const res = await apiFetch(`/api/barang/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Gagal memperbarui bahan baku.');
            }
            showToast('Bahan baku berhasil diperbarui.', 'success');
        } else {
            const res = await apiFetch('/api/barang', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Gagal menambahkan bahan baku.');
            }
            showToast('Bahan baku berhasil ditambahkan.', 'success');
        }
        closeModal('modal-barang-umum');
        await loadStok();
        refreshBarangData();
        if (currentSopMenuId) {
            await loadSOPEditor(currentSopMenuId);
        }
    } catch (err) {
        showToast(err?.message || 'Gagal menyimpan bahan baku.', 'error');
    }
}

function editBarangTeknis(id) {
    const b = allBarang.find(x => String(x.id) === String(id));
    if (!b) return;
    document.getElementById('barang-teknis-id').value = b.id;
    document.getElementById('modal-barang-teknis-subtitle').textContent = `Nama Bahan: ${b.nama_barang} (${b.kode_barang})`;
    document.getElementById('barang-teknis-satuan-beli').value = b.satuan_beli || 'Pack';

    const selectResep = document.getElementById('barang-teknis-satuan-resep');
    const valResep = (b.satuan_resep || 'gram').trim();

    let matched = false;
    Array.from(selectResep.options).forEach(opt => {
        if (opt.value.toLowerCase() === valResep.toLowerCase()) {
            opt.selected = true;
            matched = true;
        }
    });
    if (!matched) {
        const newOpt = document.createElement('option');
        newOpt.value = valResep;
        newOpt.textContent = `${valResep} (satuan khusus)`;
        selectResep.appendChild(newOpt);
        selectResep.value = valResep;
    }

    document.getElementById('barang-teknis-faktor-konversi').value = b.faktor_konversi || 1.0;

    updateTeknisKonversiPreview();
    openModal('modal-barang-teknis');
}

function updateTeknisKonversiPreview() {
    const satBeli = document.getElementById('barang-teknis-satuan-beli').value.trim() || 'Pack';
    const satResep = document.getElementById('barang-teknis-satuan-resep').value;
    const factor = parseFloat(document.getElementById('barang-teknis-faktor-konversi').value) || 1.0;

    // Side-by-side formula labels
    document.getElementById('label-teknis-beli').textContent = satBeli;
    document.getElementById('label-teknis-resep').textContent = satResep;

    // Text explanation of the conversion
    const previewText = document.getElementById('teknis-konversi-preview-text');
    if (previewText) {
        previewText.textContent = `1 ${satBeli} berisi ${formatNum(factor, 0)} ${satResep}. Jadi ketika Anda membeli 2 ${satBeli}, stok gudang akan otomatis bertambah ${formatNum(factor * 2, 0)} ${satResep}.`;
    }
}

async function submitBarangTeknis(e) {
    if (e) e.preventDefault();
    const id = document.getElementById('barang-teknis-id').value;
    const b = allBarang.find(x => String(x.id) === String(id));
    if (!b) return;

    const satBeli = document.getElementById('barang-teknis-satuan-beli').value.trim();
    const satResep = document.getElementById('barang-teknis-satuan-resep').value;
    const factor = parseFloat(document.getElementById('barang-teknis-faktor-konversi').value) || 1.0;

    const payload = {
        kode_barang: b.kode_barang,
        nama_barang: b.nama_barang,
        satuan: satBeli,
        satuan_beli: satBeli,
        satuan_resep: satResep,
        faktor_konversi: factor,
        lead_time_hari: b.lead_time_hari || 2,
        stok_gudang: b.stok_gudang
    };

    try {
        await apiFetch(`/api/barang/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        showToast('Parameter teknis berhasil disimpan.', 'success');
        closeModal('modal-barang-teknis');
        await loadStok();
        await refreshBarangData();
        if (currentSopMenuId) {
            await loadSOPEditor(currentSopMenuId);
        }
    } catch (err) {
        showToast('Gagal menyimpan: ' + err.message, 'error');
    }
}

function deleteBarang(id, nama) {
    showConfirm(`Hapus bahan baku "${nama}"? Semua data takaran terkait juga akan dihapus.`, async () => {
        await apiFetch(`/api/barang/${id}`, { method: 'DELETE' });
        showToast('Bahan baku dihapus.', 'success');
        await loadStok();
        if (currentSopMenuId) {
            await loadSOPEditor(currentSopMenuId);
        }
    });
}

function openTambahStok(id, nama) {
    const b = allBarang.find(x => String(x.id) === String(id));
    const satuanBeli = b ? (b.satuan_beli || b.satuan) : 'Pack';
    const satuanResep = b ? (b.satuan_resep || 'gram') : 'gram';
    const factor = b ? (b.faktor_konversi || 1) : 1;

    document.getElementById('tambah-stok-id').value = id;
    document.getElementById('tambah-stok-nama').textContent = `${nama} — Satuan beli: ${satuanBeli}`;

    const inputJml = document.getElementById('tambah-stok-jumlah');
    if (inputJml) {
        inputJml.placeholder = `Masukkan jumlah ${satuanBeli}`;
        inputJml.value = '';
        // Live conversion preview
        inputJml.oninput = function () {
            const qty = parseFloat(this.value) || 0;
            const infoDiv = document.getElementById('tambah-stok-konversi-info');
            const konversiText = document.getElementById('tambah-stok-konversi-text');
            if (qty > 0 && factor > 1) {
                const total = qty * factor;
                konversiText.textContent = `${qty} ${satuanBeli} × ${formatNum(factor, 0)} = ${formatNum(total, 0)} ${satuanResep} akan ditambahkan ke stok gudang`;
                infoDiv.classList.remove('hidden');
            } else {
                infoDiv.classList.add('hidden');
            }
        };
    }

    const hint = document.getElementById('tambah-stok-hint');
    if (hint) {
        hint.textContent = `Masukkan jumlah dalam ${satuanBeli}. Satu ${satuanBeli} = ${formatNum(factor, 0)} ${satuanResep}.`;
    }

    document.getElementById('tambah-stok-konversi-info').classList.add('hidden');
    openModal('modal-tambah-stok');
}

async function submitTambahStok() {
    const id = document.getElementById('tambah-stok-id').value;
    const tambah = parseFloat(document.getElementById('tambah-stok-jumlah').value);
    if (!tambah || tambah <= 0) { showToast('Masukkan jumlah yang valid.', 'warn'); return; }
    try {
        const res = await apiFetch(`/api/barang/${id}/tambah-stok`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tambah })
        });
        const data = await res.json();
        showToast(`Stok berhasil ditambah. Stok baru: ${formatNum(data.stok_baru, 2)}`, 'success');
        closeModal('modal-tambah-stok');
        await loadStok();
    } catch { showToast('Gagal menambah stok.', 'error'); }
}

// Expose Stok functions globally to window
window.switchStokTab = switchStokTab;
window.openAddBarangModal = openAddBarangModal;
window.editBarangUmum = editBarangUmum;
window.editBarangGeneral = editBarangGeneral;
window.editBarangTeknis = editBarangTeknis;
window.submitBarangGeneral = submitBarangGeneral;
window.submitBarangTeknis = submitBarangTeknis;
window.deleteBarang = deleteBarang;
window.openTambahStok = openTambahStok;
window.submitTambahStok = submitTambahStok;
window.updateTeknisKonversiPreview = updateTeknisKonversiPreview;

// Expose Menu CRUD functions globally to window
window.openAddMenuModal = openAddMenuModal;
window.editMenu = editMenu;
window.deleteMenu = deleteMenu;
window.deleteCurrentMenuFromSOP = deleteCurrentMenuFromSOP;
window.uploadMenuImage = uploadMenuImage;
window.deleteMenuImage = deleteMenuImage;
window.submitMenu = submitMenu;

// ============================================================
// SOP PAGE
// ============================================================
async function loadSopPage() {
    const [mRes, bRes] = await Promise.all([apiFetch('/api/menu'), apiFetch('/api/barang')]);
    allMenu = await mRes.json();
    allBarang = await bRes.json();
    renderMenuSidebar();
    // On mobile/tablet, start with SOP menu panel collapsed
    const menuPanel = document.querySelector('.sop-menu-panel');
    if (menuPanel && !isDesktopLayout()) {
        menuPanel.classList.remove('sop-menu-visible');
        const chevron = document.getElementById('sop-menu-chevron');
        const headerIcon = document.getElementById('sop-menu-toggle-icon');
        if (chevron) chevron.className = 'fas fa-bars';
        if (headerIcon) headerIcon.className = 'fas fa-bars text-sm';
    } else if (menuPanel) {
        menuPanel.classList.add('sop-menu-visible');
    }
}

function toggleSopMenuPanel() {
    const menuPanel = document.querySelector('.sop-menu-panel');
    const chevron = document.getElementById('sop-menu-chevron');
    const headerIcon = document.getElementById('sop-menu-toggle-icon');
    if (!menuPanel) return;
    menuPanel.classList.toggle('sop-menu-visible');
    const isVisible = menuPanel.classList.contains('sop-menu-visible');
    if (chevron) {
        chevron.className = isVisible ? 'fas fa-times' : 'fas fa-bars';
    }
    if (headerIcon) {
        headerIcon.className = isVisible ? 'fas fa-times text-sm' : 'fas fa-bars text-sm';
    }
}

function renderMenuSidebar() {
    const container = document.getElementById('menu-list-sidebar');
    if (!container) return;

    const isAdmin = currentUser?.role === 'admin';

    container.innerHTML = allMenu.map(m => `
        <div class="flex items-center justify-between p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 group transition ${String(currentSopMenuId) === String(m.id) ? 'bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/30' : ''}">
            <button onclick="loadSOPEditor(${m.id})" id="menu-btn-${m.id}"
                class="flex-1 min-w-0 text-left px-2 py-1.5 rounded-lg text-sm transition ${String(currentSopMenuId) === String(m.id) ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-700 dark:text-gray-300'}">
                <span class="block truncate">${m.nama_menu}</span>
                <span class="block text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">Rp ${formatNum(m.harga, 0)}</span>
            </button>
            ${isAdmin ? `
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                <button onclick="event.stopPropagation(); deleteMenu(${m.id}, '${m.nama_menu.replace(/'/g, "\\'")}')" title="Hapus Menu"
                    class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 flex items-center justify-center transition">
                    <i class="fas fa-trash text-[10px]"></i>
                </button>
            </div>
            ` : ''}
        </div>
    `).join('');
}

async function loadSOPEditor(menuId) {
    currentSopMenuId = menuId;
    renderMenuSidebar();

    // Auto-collapse menu list on mobile/tablet after selection
    if (!isDesktopLayout()) {
        const menuPanel = document.querySelector('.sop-menu-panel');
        if (menuPanel) menuPanel.classList.remove('sop-menu-visible');
        const chevron = document.getElementById('sop-menu-chevron');
        const headerIcon = document.getElementById('sop-menu-toggle-icon');
        if (chevron) chevron.className = 'fas fa-bars';
        if (headerIcon) headerIcon.className = 'fas fa-bars text-sm';
    }

    const menu = allMenu.find(m => String(m.id) === String(menuId));
    document.getElementById('sop-editor-empty').classList.add('hidden');
    document.getElementById('sop-editor').classList.remove('hidden');
    document.getElementById('sop-menu-title').textContent = menu?.nama_menu || '-';
    document.getElementById('sop-menu-image').src = menu?.gambar || 'haltea-logo.png';

    // Auto-scroll main container & right pane to top after menu selection
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const res = await apiFetch(`/api/takaran/menu/${menuId}`);
    const sopData = await res.json();
    const sopItems = sopData.items || sopData;
    currentSopItems = sopItems;
    const menuHarga = sopData.harga || menu?.harga || 0;

    const hargaInput = document.getElementById('sop-menu-harga');
    if (hargaInput) hargaInput.value = menuHarga;

    renderSopTable(sopItems);
}

async function refreshBarangData() {
    try {
        const res = await apiFetch('/api/barang');
        if (res.ok) {
            allBarang = await res.json();
            sortByKodeBarang(allBarang);
        }
    } catch (e) {
        console.error('Error refreshing barang data:', e);
    }
}

async function refreshMenuData() {
    try {
        const res = await apiFetch('/api/menu');
        if (res.ok) {
            allMenu = await res.json();
        }
    } catch (e) {
        console.error('Error refreshing menu data:', e);
    }
}

function renderSopTable(sopItems = []) {
    const tbody = document.getElementById('sop-table-body');
    if (!tbody) return;

    // Filter & sort sopItems by matching b.kode_barang ASC
    const validSopItems = (sopItems || [])
        .filter(s => allBarang.some(b => String(b.id) === String(s.id_barang)))
        .sort((a, b) => {
            const barangA = allBarang.find(x => String(x.id) === String(a.id_barang)) || {};
            const barangB = allBarang.find(x => String(x.id) === String(b.id_barang)) || {};
            return (barangA.kode_barang || '').localeCompare(barangB.kode_barang || '', undefined, { numeric: true, sensitivity: 'base' });
        });

    if (validSopItems.length === 0) {
        tbody.innerHTML = `
        <tr>
            <td colspan="5" class="px-5 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                <i class="fas fa-box-open text-2xl text-gray-300 dark:text-gray-600 block mb-2"></i>
                Belum ada bahan baku untuk menu ini. Klik tombol <strong class="text-blue-600 dark:text-blue-400">+ Tambah Bahan</strong> di atas untuk menambahkan bahan baku.
            </td>
        </tr>`;
        return;
    }

    tbody.innerHTML = validSopItems.map(sop => {
        const b = allBarang.find(x => String(x.id) === String(sop.id_barang));
        if (!b) return '';
        const gramasi = parseFloat(sop.gramasi) || 0;
        const satuanResep = b.satuan_resep || 'gram';
        const isActive = gramasi > 0;
        const sopId = sop?.id || '';

        return `
        <tr data-sop-id="${sopId}" data-barang-id="${b.id}">
            <td class="px-3 py-2.5 td-title text-gray-900 dark:text-gray-100 font-medium" data-label="">
                <div>${b.nama_barang}</div>
                <div class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">${b.kode_barang || '-'}</div>
            </td>
            <td class="px-3 py-2.5 text-center" data-label="Satuan Resep">
                <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700/60 select-none">
                    ${satuanResep}
                </span>
            </td>
            <td class="px-3 py-2.5 text-center" data-label="Takaran">
                <input type="number" step="1" min="0" data-barang="${b.id}" data-faktor="${b.faktor_konversi || 1.0}"
                    value="${gramasi > 0 ? gramasi : ''}"
                    placeholder="0"
                    onchange="updateSopCheckCircle(${b.id})" oninput="updateSopCheckCircle(${b.id})"
                    class="sop-input w-full max-w-[100px] ml-auto bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-2.5 py-1.5 text-center text-sm outline-none focus:ring-2 focus:ring-red-500">
            </td>
            <td class="px-3 py-2.5 text-center" data-label="Status">
                <span class="sop-status-badge text-xs ${isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}">
                    ${isActive ? '<i class="fas fa-check-circle"></i> Aktif' : '<i class="fas fa-circle"></i> Kosong'}
                </span>
            </td>
            <td class="px-3 py-2.5 text-center td-actions" data-label="Aksi">
                <div class="flex items-center justify-center gap-1.5">
                    <button onclick="deleteSopItem(${sopId ? sopId : 'null'}, ${b.id}, '${b.nama_barang.replace(/'/g, "\\'")}')" title="Hapus Bahan dari Takaran"
                        class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function updateSopCheckCircle(barangId) {
    const gramasiInput = document.querySelector(`[data-barang="${barangId}"]`);
    if (!gramasiInput) return;

    const gramasi = parseFloat(gramasiInput.value) || 0;
    const isActive = gramasi > 0;

    const row = gramasiInput.closest('tr');
    if (row) {
        const span = row.querySelector('.sop-status-badge');
        if (span) {
            if (isActive) {
                span.className = 'sop-status-badge text-xs text-green-600 dark:text-green-400';
                span.innerHTML = '<i class="fas fa-check-circle"></i> Aktif';
            } else {
                span.className = 'sop-status-badge text-xs text-gray-400 dark:text-gray-600';
                span.innerHTML = '<i class="fas fa-circle"></i> Kosong';
            }
        }
    }
}

async function saveSOP() {
    if (!currentSopMenuId) {
        showToast('Pilih menu terlebih dahulu.', 'warn');
        return;
    }

    const inputs = document.querySelectorAll('.sop-input');
    const hargaInput = document.getElementById('sop-menu-harga');
    const harga = hargaInput ? parseFloat(hargaInput.value) || 0 : 0;
    const items = [];

    inputs.forEach(inp => {
        const gram = parseFloat(inp.value) || 0;
        const id_barang = parseInt(inp.dataset.barang);
        const b = allBarang.find(x => String(x.id) === String(id_barang));
        const satuan = b ? (b.satuan_resep || b.satuan || 'gram') : 'gram';

        if (gram > 0) {
            items.push({ id_barang, gramasi: gram, satuan, jml_per_beli: 0, produk_per_beli: 0 });
        }
    });

    try {
        const res = await apiFetch('/api/takaran', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_menu: currentSopMenuId, items, harga })
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Gagal menyimpan takaran menu.');
        }

        showToast('Takaran menu berhasil disimpan!', 'success');
        await refreshSopAfterChange();
    } catch (err) {
        showToast(err?.message || 'Gagal menyimpan takaran menu.', 'error');
    }
}

function onSopItemBarangChange() {
    const select = document.getElementById('sop-item-barang');
    const satuanInput = document.getElementById('sop-item-satuan');
    if (!select || !satuanInput) return;

    const barangId = parseInt(select.value);
    if (barangId) {
        const barang = allBarang.find(b => String(b.id) === String(barangId));
        if (barang) {
            satuanInput.value = barang.satuan_resep || 'gram';
        }
    }
}

async function openAddSopItemModal() {
    if (!currentSopMenuId) {
        showToast('Pilih menu terlebih dahulu.', 'warn');
        return;
    }

    document.getElementById('modal-sop-item-title').textContent = 'Tambah Bahan Takaran';
    document.getElementById('form-sop-item').reset();
    document.getElementById('sop-item-id').value = '';
    renderSopItemBarangOptions();
    onSopItemBarangChange();
    openModal('modal-sop-item');
}

function openEditSopItemModal(sopId, barangId) {
    if (!currentSopMenuId) {
        showToast('Pilih menu terlebih dahulu.', 'warn');
        return;
    }

    const barang = allBarang.find(b => b.id === barangId);
    if (!barang) return;

    const existingSop = currentSopItems?.find(s => s.id_barang === barangId) || {};
    document.getElementById('modal-sop-item-title').textContent = 'Edit Bahan Takaran';
    document.getElementById('sop-item-id').value = sopId || '';
    renderSopItemBarangOptions(barang.id);
    document.getElementById('sop-item-barang').value = barang.id;
    document.getElementById('sop-item-gramasi').value = existingSop.gramasi || '';
    document.getElementById('sop-item-satuan').value = barang.satuan_resep || 'gram';
    openModal('modal-sop-item');
}

function renderSopItemBarangOptions(selectedId = null) {
    const select = document.getElementById('sop-item-barang');
    if (!select) return;

    const usedIds = new Set(currentSopItems?.filter(s => String(s.id) !== String(document.getElementById('sop-item-id').value || '')).map(s => s.id_barang) || []);
    const options = allBarang
        .filter(b => !usedIds.has(b.id) || b.id === selectedId)
        .sort((a, b) => (a.kode_barang || '').localeCompare(b.kode_barang || '', undefined, { numeric: true, sensitivity: 'base' }))
        .map(b => `<option value="${b.id}" ${selectedId === b.id ? 'selected' : ''}>${b.kode_barang ? b.kode_barang + ' - ' : ''}${b.nama_barang} (${b.satuan_resep || 'gram'})</option>`)
        .join('');

    select.innerHTML = options;
    if (selectedId) select.value = selectedId;
}

async function submitSopItem(e) {
    e.preventDefault();
    if (!currentSopMenuId) {
        showToast('Pilih menu terlebih dahulu.', 'warn');
        return;
    }

    const sopId = document.getElementById('sop-item-id').value;
    const id_barang = parseInt(document.getElementById('sop-item-barang').value);
    const gramasi = parseFloat(document.getElementById('sop-item-gramasi').value);
    const satuan = document.getElementById('sop-item-satuan').value.trim();

    if (!id_barang || isNaN(gramasi) || gramasi <= 0 || !satuan) {
        showToast('Isi bahan baku, takaran, dan satuan dengan benar.', 'warn');
        return;
    }

    const barang = allBarang.find(b => b.id === id_barang) || {};

    try {
        const nextItems = (currentSopItems || [])
            .filter(s => String(s.id_barang) !== String(id_barang))
            .concat({ id: sopId ? parseInt(sopId) : null, id_menu: currentSopMenuId, id_barang, gramasi, satuan, jml_per_beli: 0, produk_per_beli: 0 });

        const res = await apiFetch('/api/takaran', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_menu: currentSopMenuId, items: nextItems })
        });
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Gagal menyimpan bahan takaran.');
        }

        closeModal('modal-sop-item');
        showToast('Bahan takaran berhasil disimpan.', 'success');
        await refreshSopAfterChange();
    } catch (err) {
        showToast(err?.message || 'Gagal menyimpan bahan takaran.', 'error');
    }
}

async function deleteSopItem(sopId, barangId, namaBarang) {
    if (!currentSopMenuId) return;

    try {
        if (sopId) {
            const res = await apiFetch(`/api/takaran/${sopId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Gagal menghapus bahan takaran.');
        } else {
            // Filter out this barangId from currentSopItems and update database
            const nextItems = (currentSopItems || [])
                .filter(s => String(s.id_barang) !== String(barangId))
                .map(s => ({
                    id_barang: s.id_barang,
                    gramasi: parseFloat(s.gramasi) || 0,
                    satuan: s.satuan || 'gram',
                    jml_per_beli: 0,
                    produk_per_beli: 0
                }));

            const hargaInput = document.getElementById('sop-menu-harga');
            const harga = hargaInput ? parseFloat(hargaInput.value) || 0 : 0;

            const res = await apiFetch('/api/takaran', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_menu: currentSopMenuId, items: nextItems, harga })
            });
            if (!res.ok) throw new Error('Gagal menghapus bahan takaran.');
        }

        showToast(`Bahan "${namaBarang}" berhasil dihapus dari takaran menu.`, 'success');
        await refreshSopAfterChange();
    } catch (err) {
        showToast(err?.message || 'Gagal menghapus bahan takaran.', 'error');
    }
}

async function refreshSopAfterChange() {
    await refreshBarangData();
    await refreshMenuData();
    renderMenuSidebar();
    if (currentSopMenuId) {
        await loadSOPEditor(currentSopMenuId);
    }
}

async function openAddMenuModal() {
    document.getElementById('modal-menu-title').textContent = 'Tambah Menu';
    document.getElementById('menu-id').value = '';
    document.getElementById('form-menu').reset();
    document.getElementById('menu-harga').value = '';
    deleteMenuImage();
    openModal('modal-menu');
}

let menuModalImageBase64 = null;
let menuModalImageDeleted = false;
let menuModalImageNewUploaded = false;

function uploadMenuImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Pilih file gambar yang valid.', 'warn');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 600;
            let w = img.width;
            let h = img.height;

            if (w > h && w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
            } else if (h > maxDim) {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
            }

            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            document.getElementById('menu-modal-img').src = compressedBase64;
            menuModalImageBase64 = compressedBase64;
            menuModalImageDeleted = false;
            menuModalImageNewUploaded = true;
            document.getElementById('btn-delete-menu-image').classList.remove('hidden');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function deleteMenuImage() {
    document.getElementById('menu-modal-img').src = 'haltea-logo.png';
    menuModalImageBase64 = null;
    menuModalImageDeleted = true;
    menuModalImageNewUploaded = false;
    document.getElementById('btn-delete-menu-image').classList.add('hidden');
    document.getElementById('menu-image-input').value = '';
}

function editMenu(id) {
    const targetId = id || currentSopMenuId;
    const m = allMenu.find(x => String(x.id) === String(targetId));
    if (!m) return;
    document.getElementById('modal-menu-title').textContent = 'Edit Menu & Foto';
    document.getElementById('menu-id').value = m.id;
    document.getElementById('menu-nama').value = m.nama_menu;
    document.getElementById('menu-harga').value = m.harga || 0;
    document.getElementById('menu-ket').value = m.keterangan || '';

    const imgUrl = m.gambar || 'haltea-logo.png';
    document.getElementById('menu-modal-img').src = imgUrl;
    menuModalImageBase64 = m.gambar || null;
    menuModalImageDeleted = false;
    menuModalImageNewUploaded = false;
    document.getElementById('menu-image-input').value = '';

    if (!m.gambar || imgUrl === 'haltea-logo.png') {
        document.getElementById('btn-delete-menu-image').classList.add('hidden');
    } else {
        document.getElementById('btn-delete-menu-image').classList.remove('hidden');
    }
    openModal('modal-menu');
}

function deleteCurrentMenuFromSOP() {
    if (!currentSopMenuId) return;
    const m = allMenu.find(x => String(x.id) === String(currentSopMenuId));
    if (m) {
        deleteMenu(m.id, m.nama_menu);
    }
}

async function deleteMenu(id, nama) {
    showConfirm(`Hapus menu "${nama}"? Semua data SOP dan transaksi terkait juga akan dihapus.`, async () => {
        try {
            await apiFetch(`/api/menu/${id}`, { method: 'DELETE' });
            await refreshMenuData();
            showToast('Menu berhasil dihapus.', 'success');
            if (String(currentSopMenuId) === String(id)) {
                currentSopMenuId = null;
                document.getElementById('sop-editor').classList.add('hidden');
                document.getElementById('sop-editor-empty').classList.remove('hidden');
            }
            if (document.getElementById('link-sop')?.classList.contains('active')) {
                await loadSopPage();
            } else {
                renderKatalog();
            }
        } catch (err) {
            showToast('Gagal menghapus menu.', 'error');
        }
    });
}

async function submitMenu(e) {
    e.preventDefault();
    const id = document.getElementById('menu-id').value;
    const payload = {
        nama_menu: document.getElementById('menu-nama').value.trim(),
        harga: parseInt(document.getElementById('menu-harga').value) || 0,
        keterangan: document.getElementById('menu-ket').value.trim() || '',
        aktif: 1
    };

    if (menuModalImageDeleted) {
        payload.gambar = null;
    } else if (menuModalImageNewUploaded && menuModalImageBase64) {
        payload.gambar = menuModalImageBase64;
    } else if (!id && menuModalImageBase64) {
        payload.gambar = menuModalImageBase64;
    }

    try {
        const sopWasActive = document.getElementById('link-sop')?.classList.contains('active') || currentPageId === 'sop';
        const sopMenuId = currentSopMenuId;
        let createdMenuId = null;
        if (id) {
            const res = await apiFetch(`/api/menu/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Gagal menyimpan menu.');
            }
        } else {
            const res = await apiFetch('/api/menu', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || 'Gagal menyimpan menu.');
            createdMenuId = data.id || null;
        }
        await refreshMenuData();
        showToast('Menu berhasil disimpan.', 'success');
        closeModal('modal-menu');
        document.getElementById('menu-id').value = '';
        if (e.target && typeof e.target.reset === 'function') {
            e.target.reset();
        }
        deleteMenuImage();
        if (sopWasActive) {
            renderMenuSidebar();
            const activeId = createdMenuId || id || sopMenuId;
            if (activeId) {
                currentSopMenuId = activeId;
                await loadSOPEditor(activeId);
            }
        } else {
            renderKatalog();
        }
    } catch (err) { showToast(err?.message || 'Gagal menyimpan menu.', 'error'); }
}

async function refreshMenuData() {
    const res = await apiFetch('/api/menu');
    if (!res.ok) throw new Error('Gagal memperbarui data menu.');
    allMenu = await res.json();
}

async function refreshBarangData() {
    const res = await apiFetch('/api/barang');
    if (!res.ok) throw new Error('Gagal memperbarui data bahan baku.');
    allBarang = await res.json();
}

async function loadTransaksiCatalog() {
    if (allMenu.length === 0) {
        const mRes = await apiFetch('/api/menu');
        allMenu = await mRes.json();
    }
    const tglInput = document.getElementById('trx-tanggal');
    if (tglInput && !tglInput.value) tglInput.value = new Date().toISOString().split('T')[0];

    const selectPosMode = document.getElementById('select-pos-mode');
    const currentMode = selectPosMode ? selectPosMode.value : 'catalog';
    if (currentMode === 'history') {
        togglePosViewMode('history');
    } else {
        togglePosViewMode('catalog');
        renderKatalog();
    }
}

function togglePosViewMode(targetMode = null) {
    const catalogWrapper = document.getElementById('pos-catalog-wrapper');
    const historyWrapper = document.getElementById('pos-today-history-wrapper');
    const selectMode = document.getElementById('select-pos-mode');

    const mode = targetMode || (selectMode ? selectMode.value : 'catalog');
    if (selectMode && selectMode.value !== mode) {
        selectMode.value = mode;
    }

    if (mode === 'history') {
        if (catalogWrapper) catalogWrapper.classList.add('hidden');
        if (historyWrapper) {
            historyWrapper.classList.remove('hidden');
            loadTodayHistory();
        }
    } else {
        if (historyWrapper) historyWrapper.classList.add('hidden');
        if (catalogWrapper) catalogWrapper.classList.remove('hidden');
    }
}
window.togglePosViewMode = togglePosViewMode;

let cartState = {}; // Key: menuId, Value: { id_menu, nama_menu, harga, gambar, jumlah }

let currentKatalogCategory = 'all';
let currentKatalogSearch = '';

function filterKatalogCategory(cat, btn) {
    currentKatalogCategory = cat;
    document.querySelectorAll('#katalog-category-pills .cat-pill').forEach(b => {
        b.classList.remove('active', 'bg-red-600', 'text-white');
        b.classList.add('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
    });
    if (btn) {
        btn.classList.add('active', 'bg-red-600', 'text-white');
        btn.classList.remove('bg-gray-100', 'dark:bg-gray-800', 'text-gray-600', 'dark:text-gray-400');
    }
    renderKatalog();
}
window.filterKatalogCategory = filterKatalogCategory;

function handleKatalogSearch(q) {
    currentKatalogSearch = (q || '').trim().toLowerCase();
    renderKatalog();
}
window.handleKatalogSearch = handleKatalogSearch;

function openMobileCartDrawer() {
    renderMobileCartModal();
    openModal('modal-mobile-cart');
}
window.openMobileCartDrawer = openMobileCartDrawer;

function renderMobileCartModal() {
    const listEl = document.getElementById('mobile-modal-cart-items');
    const totalEl = document.getElementById('mobile-modal-cart-total');
    const countBadge = document.getElementById('modal-cart-count-badge');
    if (!listEl) return;

    const cartEntries = Object.values(cartState);
    const totalItems = cartEntries.reduce((sum, item) => sum + item.jumlah, 0);
    const totalPrice = cartEntries.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);

    if (countBadge) countBadge.textContent = `${totalItems} Item`;
    if (totalEl) totalEl.textContent = `Rp ${formatNum(totalPrice, 0)}`;

    if (cartEntries.length === 0) {
        listEl.innerHTML = `
            <div class="py-8 text-center text-gray-400">
                <i class="fas fa-shopping-cart text-2xl mb-2"></i>
                <p class="text-xs">Keranjang masih kosong</p>
            </div>
        `;
        return;
    }

    listEl.innerHTML = cartEntries.map(item => `
        <div class="flex items-center justify-between gap-3 pt-2.5 first:pt-0">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <img src="${item.gambar || 'haltea-logo.png'}" class="w-10 h-10 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">${item.nama_menu}</h4>
                    <p class="text-[11px] text-red-600 dark:text-red-400 font-semibold">Rp ${formatNum(item.harga, 0)}</p>
                </div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
                <button onclick="updateCartQty(${item.id_menu}, -1); renderMobileCartModal();" class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center">
                    −
                </button>
                <span class="w-6 text-center font-bold text-xs text-gray-900 dark:text-white">${item.jumlah}</span>
                <button onclick="updateCartQty(${item.id_menu}, 1); renderMobileCartModal();" class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center">
                    +
                </button>
            </div>
        </div>
    `).join('');
}
window.renderMobileCartModal = renderMobileCartModal;

function renderKatalog() {
    const grid = document.getElementById('trx-katalog-grid');
    if (!grid) return;

    let activeMenus = allMenu.filter(m => m.aktif);

    // Apply category filter
    if (currentKatalogCategory !== 'all') {
        activeMenus = activeMenus.filter(m => {
            const n = m.nama_menu.toLowerCase();
            if (currentKatalogCategory === 'tea') return n.includes('tea') || n.includes('teh');
            if (currentKatalogCategory === 'squash') return n.includes('squash');
            if (currentKatalogCategory === 'milk') return n.includes('milk') || n.includes('latte') || n.includes('choco') || n.includes('taro') || n.includes('matcha');
            if (currentKatalogCategory === 'coffee') return n.includes('coffee') || n.includes('cappuccino') || n.includes('americano') || n.includes('good day');
            if (currentKatalogCategory === 'yakult') return n.includes('yakult');
            return true;
        });
    }

    // Apply search filter
    if (currentKatalogSearch) {
        activeMenus = activeMenus.filter(m => m.nama_menu.toLowerCase().includes(currentKatalogSearch));
    }

    const countBadge = document.getElementById('trx-menu-count-badge');
    if (countBadge) countBadge.textContent = `${activeMenus.length} Menu`;

    if (activeMenus.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-gray-400">
                <i class="fas fa-mug-hot text-3xl mb-2"></i>
                <p class="text-sm">Tidak ada menu yang sesuai.</p>
            </div>
        `;
        renderCartPanel();
        return;
    }

    grid.innerHTML = activeMenus.map(m => {
        const cartItem = cartState[m.id];
        const inCartQty = cartItem ? cartItem.jumlah : 0;
        const isSelected = inCartQty > 0;

        return `
        <div onclick="addToCart(${m.id})" id="katalog-card-${m.id}"
            class="group relative bg-white dark:bg-[#0d1117] border ${isSelected ? 'border-2 border-red-600 ring-2 ring-red-500/20' : 'border border-gray-200 dark:border-gray-800 hover:border-red-500'} rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col select-none">
            <!-- Product Image Top -->
            <div class="w-full aspect-[4/3] bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
                <img src="${m.gambar || 'haltea-logo.png'}" alt="${m.nama_menu}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                ${isSelected ? `
                    <div class="absolute top-2 right-2 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-md animate-fade-in flex items-center gap-1">
                        <i class="fas fa-shopping-bag text-[9px]"></i> ${inCartQty}
                    </div>
                ` : ''}
            </div>
            <!-- Card Body -->
            <div class="p-2.5 sm:p-3 flex flex-col flex-1 justify-between">
                <div>
                    <h3 class="font-bold text-xs sm:text-sm text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">${m.nama_menu}</h3>
                    ${m.keterangan ? `<p class="text-[10px] sm:text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">${m.keterangan}</p>` : ''}
                </div>
                <div class="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-100 dark:border-gray-800">
                    <span class="text-xs sm:text-sm font-extrabold text-red-600 dark:text-red-400">Rp ${formatNum(m.harga, 0)}</span>
                    ${isSelected ? `
                    <div class="flex items-center gap-1.5" onclick="event.stopPropagation()">
                        <button onclick="updateCartQty(${m.id}, -1)" class="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center active:scale-90">
                            <i class="fas fa-minus text-[9px]"></i>
                        </button>
                        <span class="text-xs font-black text-gray-900 dark:text-white min-w-[14px] text-center">${inCartQty}</span>
                        <button onclick="updateCartQty(${m.id}, 1)" class="w-6 h-6 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-xs active:scale-90">
                            <i class="fas fa-plus text-[9px]"></i>
                        </button>
                    </div>
                    ` : `
                    <button onclick="event.stopPropagation(); addToCart(${m.id})" class="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                    `}
                </div>
            </div>
        </div>
        `;
    }).join('');

    renderCartPanel();
}

function addToCart(menuId) {
    const m = allMenu.find(x => String(x.id) === String(menuId));
    if (!m) return;

    if (cartState[m.id]) {
        cartState[m.id].jumlah += 1;
    } else {
        cartState[m.id] = {
            id_menu: m.id,
            nama_menu: m.nama_menu,
            harga: parseInt(m.harga) || 0,
            gambar: m.gambar || 'haltea-logo.png',
            jumlah: 1
        };
    }
    renderKatalog();
}

function updateCartQty(menuId, delta) {
    if (!cartState[menuId]) return;
    cartState[menuId].jumlah += delta;
    if (cartState[menuId].jumlah <= 0) {
        delete cartState[menuId];
    }
    renderKatalog();
}

function clearCart() {
    cartState = {};
    renderKatalog();
}

function renderCartPanel() {
    const itemsList = document.getElementById('cart-items-list');
    const badge = document.getElementById('cart-item-badge');
    const totalPriceEl = document.getElementById('cart-total-price');
    if (!itemsList) return;

    const cartEntries = Object.values(cartState);
    const totalItems = cartEntries.reduce((sum, item) => sum + item.jumlah, 0);
    const totalPrice = cartEntries.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);

    if (badge) badge.textContent = `${totalItems} ITEM`;
    if (totalPriceEl) totalPriceEl.textContent = `Rp ${formatNum(totalPrice, 0)}`;

    // Update Floating Cart Bar and Bottom Nav Badge on Smartphones
    const floatBar = document.getElementById('mobile-floating-cart-bar');
    const floatCount = document.getElementById('mobile-cart-item-count');
    const floatBadge = document.getElementById('mobile-cart-badge-count');
    const floatTotal = document.getElementById('mobile-cart-total-price');
    const bottomNavBadge = document.getElementById('bottom-nav-cart-badge');

    // Update In-Page Mobile Cart Section
    const inpageCart = document.getElementById('mobile-inpage-cart');
    const inpageItems = document.getElementById('mobile-inpage-cart-items');
    const inpageTotal = document.getElementById('mobile-inpage-cart-total');

    if (totalItems > 0) {
        if (floatBar) floatBar.classList.remove('hidden');
        if (floatCount) floatCount.textContent = `${totalItems} Menu Dipilih`;
        if (floatBadge) floatBadge.textContent = totalItems;
        if (floatTotal) floatTotal.textContent = `Rp ${formatNum(totalPrice, 0)}`;
        if (bottomNavBadge) {
            bottomNavBadge.textContent = totalItems;
            bottomNavBadge.classList.remove('hidden');
        }
        if (inpageCart) {
            inpageCart.classList.remove('hidden');
            if (inpageTotal) inpageTotal.textContent = `Rp ${formatNum(totalPrice, 0)}`;
            if (inpageItems) {
                inpageItems.innerHTML = cartEntries.map(item => `
                    <div class="flex items-center justify-between gap-3 pt-2.5 first:pt-0">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <img src="${item.gambar || 'haltea-logo.png'}" class="w-10 h-10 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div class="min-w-0 flex-1">
                                <h4 class="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">${item.nama_menu}</h4>
                                <p class="text-[11px] text-red-600 dark:text-red-400 font-semibold">Rp ${formatNum(item.harga, 0)} × ${item.jumlah}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 flex-shrink-0">
                            <button onclick="updateCartQty(${item.id_menu}, -1)" class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center">
                                −
                            </button>
                            <span class="w-6 text-center font-bold text-xs text-gray-900 dark:text-white">${item.jumlah}</span>
                            <button onclick="updateCartQty(${item.id_menu}, 1)" class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 text-gray-700 dark:text-gray-200 font-bold text-sm flex items-center justify-center">
                                +
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } else {
        if (floatBar) floatBar.classList.add('hidden');
        if (bottomNavBadge) bottomNavBadge.classList.add('hidden');
        if (inpageCart) inpageCart.classList.add('hidden');
    }

    renderMobileCartModal();

    if (cartEntries.length === 0) {
        itemsList.innerHTML = `
            <div id="cart-empty-state" class="flex flex-col items-center justify-center py-12 text-center">
                <div class="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800/80 flex items-center justify-center mb-3">
                    <i class="fas fa-shopping-cart text-xl text-gray-400"></i>
                </div>
                <p class="text-sm font-semibold text-gray-600 dark:text-gray-400">Keranjang Masih Kosong</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">Klik pada menu untuk menambahkan pesanan.</p>
            </div>
        `;
        return;
    }

    itemsList.innerHTML = cartEntries.map(item => `
        <div class="flex items-center justify-between gap-3 pt-3 first:pt-0">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700">
                    <img src="${item.gambar || 'haltea-logo.png'}" class="w-full h-full object-cover">
                </div>
                <div class="min-w-0 flex-1">
                    <h4 class="font-bold text-sm text-gray-900 dark:text-white truncate">${item.nama_menu}</h4>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Rp ${formatNum(item.harga, 0)}</p>
                </div>
            </div>
            <div class="flex items-center gap-1.5 flex-shrink-0">
                <button onclick="updateCartQty(${item.id_menu}, -1)" class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 flex items-center justify-center font-bold text-sm transition">
                    −
                </button>
                <span class="w-6 text-center font-bold text-sm text-gray-900 dark:text-white">${item.jumlah}</span>
                <button onclick="updateCartQty(${item.id_menu}, 1)" class="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-300 hover:text-red-600 flex items-center justify-center font-bold text-sm transition">
                    +
                </button>
            </div>
        </div>
    `).join('');
}

async function submitKatalogTransaksi() {
    const tanggal = document.getElementById('trx-tanggal').value;
    if (!tanggal) { showToast('Pilih tanggal terlebih dahulu.', 'warn'); return; }

    const cartEntries = Object.values(cartState);
    if (cartEntries.length === 0) { showToast('Pilih minimal 1 menu produk ke dalam keranjang.', 'warn'); return; }

    const items = cartEntries.map(item => ({ id_menu: item.id_menu, jumlah: item.jumlah }));

    try {
        const res = await apiFetch('/api/transaksi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tanggal, items })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan transaksi.');

        showToast(`${items.length} jenis transaksi berhasil disimpan. Stok bahan baku otomatis diperbarui.`, 'success');
        clearCart();
        closeModal('modal-mobile-cart');
        await loadTransaksiCatalog();

        // Refresh today's history if visible
        const todayContainer = document.getElementById('pos-today-history-wrapper');
        if (todayContainer && !todayContainer.classList.contains('hidden')) {
            await loadTodayHistory();
        }
    } catch (e) { showToast(e.message || 'Gagal menyimpan transaksi.', 'error'); }
}

// Expose cart functions globally to window
window.addToCart = addToCart;
window.updateCartQty = updateCartQty;
window.clearCart = clearCart;
window.submitKatalogTransaksi = submitKatalogTransaksi;

// ============================================================
// RIWAYAT TRANSAKSI HARI INI (in Transaksi Penjualan page)
// ============================================================
let todayHistoryData = [];

function toggleTodayHistory() {
    const container = document.getElementById('today-history-container');
    if (!container) return;
    const isHidden = container.classList.contains('hidden');
    if (isHidden) {
        container.classList.remove('hidden');
        loadTodayHistory();
    } else {
        container.classList.add('hidden');
    }
}

async function loadTodayHistory() {
    const today = new Date().toISOString().split('T')[0];
    const dateLabel = document.getElementById('today-history-date');
    if (dateLabel) {
        const d = new Date();
        const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateLabel.textContent = d.toLocaleDateString('id-ID', opts);
    }
    try {
        if (allMenu.length === 0) {
            const mRes = await apiFetch('/api/menu');
            allMenu = await mRes.json();
        }
        const res = await apiFetch(`/api/transaksi?tanggal=${today}&limit=200`);
        todayHistoryData = await res.json();
        renderTodayHistory();
    } catch (e) {
        showToast('Gagal memuat riwayat hari ini.', 'error');
    }
}

function renderTodayHistory() {
    const tbody = document.getElementById('today-history-body');
    if (!tbody) return;
    if (todayHistoryData.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
            <i class="fas fa-inbox text-2xl mb-2 block"></i>Belum ada transaksi hari ini.
        </td></tr>`;
        return;
    }
    tbody.innerHTML = todayHistoryData.map(t => {
        const harga = parseInt(t.harga) || 0;
        const total = harga * parseInt(t.jumlah);
        return `
        <tr class="hover:bg-gray-50/5 transition">
            <td class="px-4 py-3 td-title font-medium text-gray-900 dark:text-white" data-label="">${t.nama_menu}</td>
            <td class="px-4 py-3 text-center font-bold text-gray-900 dark:text-white" data-label="Jumlah">${t.jumlah.toLocaleString('id-ID')}</td>
            <td class="px-4 py-3 text-center text-gray-500 dark:text-gray-400" data-label="Harga">Rp ${formatNum(harga, 0)}</td>
            <td class="px-4 py-3 text-center font-semibold text-red-600 dark:text-red-400" data-label="Total">Rp ${formatNum(total, 0)}</td>
            <td class="px-4 py-3 td-actions" data-label="Aksi">
                <div class="flex items-center justify-end gap-1.5">
                    <button onclick="editTodayTrx(${t.id})" class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition" title="Edit">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteTodayTrx(${t.id})" class="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition" title="Hapus">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

async function editTodayTrx(id) {
    // Reuse the existing edit transaksi modal
    await openEditTransaksi(id);
}

async function deleteTodayTrx(id) {
    showConfirm('Hapus transaksi ini? Stok akan dikembalikan.', async () => {
        try {
            await apiFetch(`/api/transaksi/${id}`, { method: 'DELETE' });
            showToast('Transaksi dihapus, stok dikembalikan.', 'success');
            await loadTodayHistory();
            await loadTransaksiCatalog();
        } catch {
            showToast('Gagal menghapus transaksi.', 'error');
        }
    });
}

async function loadDataTransaksi() {
    toggleDataTransaksiRekapView('list');
    await loadRiwayatPage();
    loadExcelPage();
}

function toggleDataTransaksiRekapView(mode = null) {
    const viewList = document.getElementById('trx-view-list');
    const viewRekap = document.getElementById('trx-view-rekap');
    const selectMode = document.getElementById('select-trx-mode');
    if (!viewList || !viewRekap) return;

    let showRekap = false;
    if (mode === 'rekap') {
        showRekap = true;
    } else if (mode === 'list' || mode === 'detail') {
        showRekap = false;
    } else {
        showRekap = viewRekap.classList.contains('hidden');
    }

    if (selectMode) {
        selectMode.value = showRekap ? 'rekap' : 'list';
    }

    if (showRekap) {
        viewList.classList.add('hidden');
        viewRekap.classList.remove('hidden');
        loadRekapPerPekan();
    } else {
        viewRekap.classList.add('hidden');
        viewList.classList.remove('hidden');
    }
}
window.toggleDataTransaksiRekapView = toggleDataTransaksiRekapView;

async function loadRiwayatPage(showAll = false) {
    if (allMenu.length === 0) {
        const mRes = await apiFetch('/api/menu');
        allMenu = await mRes.json();
    }
    const filterDateInput = document.getElementById('filter-trx-date');
    if (showAll && filterDateInput) {
        filterDateInput.value = '';
    }
    const filterDate = filterDateInput?.value || '';
    const url = filterDate ? `/api/transaksi?tanggal=${filterDate}&limit=100` : '/api/transaksi?limit=100';
    try {
        const res = await apiFetch(url);
        const data = await res.json();
        renderTransaksiTable(data);
    } catch (e) {
        showToast('Gagal memuat riwayat transaksi.', 'error');
    }
}

function renderTransaksiTable(data) {
    const tbody = document.getElementById('table-transaksi-body');
    if (!tbody) return;
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-10 text-gray-400 dark:text-gray-600 text-sm">Belum ada data transaksi.</td></tr>`;
        return;
    }
    tbody.innerHTML = data.map(t => {
        const harga = parseInt(t.harga) || 0;
        const total = harga * parseInt(t.jumlah);
        const src = t.sumber === 'import' ? `<span class="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Import</span>` :
            t.sumber === 'seed' ? `<span class="px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500">Historis</span>` :
                `<span class="px-2 py-0.5 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">Manual</span>`;

        const editBtn = `<button onclick="openEditTransaksi(${t.id})" class="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"><i class="fas fa-edit text-xs"></i></button>`;
        const delBtn = currentUser?.role === 'admin' ? `<button onclick="deleteTransaksi(${t.id})" class="w-6 h-6 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition"><i class="fas fa-trash text-xs"></i></button>` : '';

        return `
        <tr>
            <td class="px-5 py-3" data-label="Tanggal">${t.tanggal}</td>
            <td class="px-5 py-3 font-medium text-gray-900 dark:text-gray-100" data-label="Menu">${t.nama_menu}</td>
            <td class="px-5 py-3 text-center font-bold text-gray-900 dark:text-white" data-label="Jumlah">${t.jumlah.toLocaleString('id-ID')}</td>
            <td class="px-5 py-3 text-center text-gray-500 dark:text-gray-400" data-label="Harga">Rp ${formatNum(harga, 0)}</td>
            <td class="px-5 py-3 text-center font-semibold text-red-600 dark:text-red-400" data-label="Total">Rp ${formatNum(total, 0)}</td>
            <td class="px-5 py-3 text-center" data-label="Sumber">${src}</td>
            <td class="px-5 py-3 td-actions" data-label="Aksi">
                <div class="flex items-center justify-end gap-1.5">
                    ${editBtn}
                    ${delBtn}
                </div>
            </td>
        </tr>`;
    }).join('');
}

let currentEditTrx = null;

async function openAddTransaksiModal() {
    try {
        if (allMenu.length === 0) {
            const mRes = await apiFetch('/api/menu');
            allMenu = await mRes.json();
        }

        const menuSelect = document.getElementById('edit-trx-menu');
        menuSelect.innerHTML = allMenu.map(m => `<option value="${m.id}">${m.nama_menu}</option>`).join('');

        document.getElementById('edit-trx-id').value = '';
        document.getElementById('edit-trx-tanggal').value = new Date().toISOString().split('T')[0];
        document.getElementById('edit-trx-menu').selectedIndex = 0;
        document.getElementById('edit-trx-jumlah').value = '1';

        const modalTitle = document.querySelector('#modal-edit-transaksi h2');
        if (modalTitle) modalTitle.textContent = 'Tambah Transaksi Manual';

        const submitBtn = document.querySelector('#modal-edit-transaksi button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Tambah Transaksi';

        openModal('modal-edit-transaksi');
    } catch (e) {
        showToast('Gagal memuat form tambah transaksi.', 'error');
    }
}

async function openEditTransaksi(id) {
    try {
        if (allMenu.length === 0) {
            const mRes = await apiFetch('/api/menu');
            allMenu = await mRes.json();
        }

        const menuSelect = document.getElementById('edit-trx-menu');
        menuSelect.innerHTML = allMenu.map(m => `<option value="${m.id}">${m.nama_menu}</option>`).join('');

        const res = await apiFetch('/api/transaksi?limit=1000');
        const trxs = await res.json();
        const trx = trxs.find(t => t.id === id);

        if (!trx) { showToast('Transaksi tidak ditemukan.', 'error'); return; }

        currentEditTrx = trx;
        document.getElementById('edit-trx-id').value = trx.id;
        document.getElementById('edit-trx-tanggal').value = trx.tanggal;
        document.getElementById('edit-trx-menu').value = trx.id_menu;
        document.getElementById('edit-trx-jumlah').value = trx.jumlah;

        const modalTitle = document.querySelector('#modal-edit-transaksi h2');
        if (modalTitle) modalTitle.textContent = 'Edit Transaksi';

        const submitBtn = document.querySelector('#modal-edit-transaksi button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Simpan Perubahan';

        openModal('modal-edit-transaksi');
    } catch (e) {
        showToast('Gagal memuat detail transaksi.', 'error');
    }
}

async function submitEditTransaksi(e) {
    e.preventDefault();
    const id = document.getElementById('edit-trx-id').value;
    const payload = {
        tanggal: document.getElementById('edit-trx-tanggal').value,
        id_menu: parseInt(document.getElementById('edit-trx-menu').value),
        jumlah: parseInt(document.getElementById('edit-trx-jumlah').value)
    };

    if (!payload.tanggal || !payload.id_menu || payload.jumlah <= 0) {
        showToast('Masukkan data transaksi yang valid.', 'warn');
        return;
    }

    try {
        let res;
        if (id) {
            res = await apiFetch(`/api/transaksi/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } else {
            res = await apiFetch('/api/transaksi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tanggal: payload.tanggal,
                    items: [{ id_menu: payload.id_menu, jumlah: payload.jumlah }]
                })
            });
        }

        if (res.ok) {
            showToast(id ? 'Transaksi berhasil diperbarui.' : 'Transaksi manual berhasil ditambahkan.', 'success');
            closeModal('modal-edit-transaksi');
            await loadRiwayatPage();
            // Also refresh today's history if visible
            const todayContainer = document.getElementById('today-history-container');
            if (todayContainer && !todayContainer.classList.contains('hidden')) {
                await loadTodayHistory();
            }
        } else {
            const data = await res.json();
            showToast(data.error || 'Gagal menyimpan transaksi.', 'error');
        }
    } catch {
        showToast('Gagal menyimpan transaksi.', 'error');
    }
}

async function deleteTransaksi(id) {
    showConfirm('Hapus transaksi ini? Stok akan dikembalikan.', async () => {
        await apiFetch(`/api/transaksi/${id}`, { method: 'DELETE' });
        showToast('Transaksi dihapus, stok dikembalikan.', 'success');
        await loadRiwayatPage();
    });
}

// ============================================================
// EXCEL IMPORT
// ============================================================
function loadExcelPage() {
    const resultDiv = document.getElementById('import-result');
    const errContainer = document.getElementById('import-errors-container');
    const chkPotongStok = document.getElementById('import-potong-stok');

    if (resultDiv) resultDiv.classList.add('hidden');
    if (errContainer) errContainer.classList.add('hidden');
    if (chkPotongStok) chkPotongStok.checked = false; // default false

    const fileInput = document.getElementById('excel-file-input');
    if (fileInput) fileInput.value = '';
}

function handleDragOver(e) { e.preventDefault(); document.getElementById('drop-zone').classList.add('drag-over'); }
function handleDragLeave(e) { document.getElementById('drop-zone').classList.remove('drag-over'); }
function handleDrop(e) {
    e.preventDefault();
    document.getElementById('drop-zone').classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) uploadExcel(file);
}
function handleFileSelect(input) {
    if (input.files[0]) uploadExcel(input.files[0]);
}

function showDetailedErrors(title, errors) {
    const resultDiv = document.getElementById('import-result');
    const errContainer = document.getElementById('import-errors-container');
    const errTitle = document.getElementById('import-errors-title');
    const errList = document.getElementById('import-errors-list');

    if (resultDiv) resultDiv.classList.add('hidden');
    if (errContainer && errList && errTitle) {
        errTitle.textContent = title;
        errList.innerHTML = errors.map(e => `
            <div class="flex items-start gap-2 py-1 border-b border-red-200/20 last:border-0">
                <span class="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0">Baris ${e.row}</span>
                <span class="text-xs break-words">${e.error}</span>
            </div>
        `).join('');
        errContainer.classList.remove('hidden');
    }
}

function showSingleError(msg) {
    const resultDiv = document.getElementById('import-result');
    const errContainer = document.getElementById('import-errors-container');
    const errTitle = document.getElementById('import-errors-title');
    const errList = document.getElementById('import-errors-list');

    if (resultDiv) resultDiv.classList.add('hidden');
    if (errContainer && errList && errTitle) {
        errTitle.textContent = 'Terjadi kesalahan sistem:';
        errList.innerHTML = `
            <div class="flex items-start gap-2 py-0.5 text-xs text-red-650 dark:text-red-400">
                <i class="fas fa-times-circle mt-0.5 flex-shrink-0"></i>
                <span>${msg}</span>
            </div>
        `;
        errContainer.classList.remove('hidden');
    }
}

async function uploadExcel(file) {
    // Reset previous states
    const resultDiv = document.getElementById('import-result');
    const errContainer = document.getElementById('import-errors-container');
    if (resultDiv) resultDiv.classList.add('hidden');
    if (errContainer) errContainer.classList.add('hidden');

    const chkPotongStok = document.getElementById('import-potong-stok');
    const potongStok = chkPotongStok ? chkPotongStok.checked : false;

    // Use FileReader to read file as ArrayBuffer
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: false });

            const sheetsPayload = [];
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const sheetRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true });
                if (sheetRows && sheetRows.length > 0) {
                    sheetsPayload.push({ name: sheetName, rows: sheetRows });
                }
            });

            if (sheetsPayload.length === 0) {
                showSingleError('File Excel kosong atau tidak memiliki data.');
                return;
            }

            // Send all sheets to the backend
            const res = await apiFetch('/api/transaksi/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheets: sheetsPayload, potong_stok: potongStok })
            });
            const responseData = await res.json().catch(() => ({}));

            if (!res.ok) {
                if (responseData.errors && responseData.errors.length > 0) {
                    showDetailedErrors(responseData.message || 'Gagal mengimpor data.', responseData.errors);
                    showToast('Impor gagal. Periksa daftar kesalahan.', 'error');
                } else {
                    showSingleError(responseData.error || responseData.message || 'Gagal mengimpor file.');
                    showToast(responseData.error || responseData.message || 'Gagal mengimpor file.', 'error');
                }
                const fileInput = document.getElementById('excel-file-input');
                if (fileInput) fileInput.value = '';
                return;
            }

            const resultText = document.getElementById('import-result-text');
            if (resultText && resultDiv) {
                resultText.innerHTML = `Berhasil mengimpor <strong>${responseData.imported.toLocaleString('id-ID')}</strong> transaksi dari ${sheetsPayload.length} sheet Excel.`;
                resultDiv.classList.remove('hidden');
            }

            showToast(responseData.message || `Import selesai: ${responseData.imported} data berhasil.`, 'success');
            const fileInput = document.getElementById('excel-file-input');
            if (fileInput) fileInput.value = '';

            await loadRiwayatPage();
        } catch (err) {
            showSingleError(err.message || 'Terjadi kesalahan saat memproses berkas.');
            showToast('Gagal memproses berkas.', 'error');
            const fileInput = document.getElementById('excel-file-input');
            if (fileInput) fileInput.value = '';
        }
    };

    reader.onerror = () => {
        showSingleError('Gagal membaca berkas.');
        showToast('Gagal membaca berkas.', 'error');
    };

    reader.readAsArrayBuffer(file);
}

function resetTransaksiData() {
    const modalConfirm = document.getElementById('modal-confirm-reset');
    if (modalConfirm && typeof openModal === 'function') {
        openModal('modal-confirm-reset');
    } else {
        if (!confirm('Apakah Anda yakin ingin mengosongkan SELURUH data transaksi?\n\nData akan di-backup otomatis dan bisa di-restore kembali nanti.')) {
            return;
        }
        processResetTransaksiData();
    }
}
window.resetTransaksiData = resetTransaksiData;

async function processResetTransaksiData() {
    if (typeof closeModal === 'function') closeModal('modal-confirm-reset');
    const overlay = document.getElementById('predicting-overlay');
    if (overlay) overlay.classList.remove('hidden');
    try {
        const res = await apiFetch('/api/transaksi/reset', { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message || 'Data transaksi berhasil dikosongkan.', 'success');
            await loadRiwayatPage(true);
            if (typeof loadDashboard === 'function') await loadDashboard();
            if (typeof loadPrediksi === 'function') await loadPrediksi();
            if (typeof loadStok === 'function') await loadStok();
        } else {
            alert('Gagal: ' + (data.error || JSON.stringify(data)));
            showToast(data.error || 'Gagal mengosongkan data.', 'error');
        }
    } catch (e) {
        alert('Error reset: ' + e.message);
        showToast('Gagal mengosongkan data transaksi: ' + e.message, 'error');
    } finally {
        if (overlay) overlay.classList.add('hidden');
    }
}
window.processResetTransaksiData = processResetTransaksiData;

async function restoreTransaksiData() {
    try {
        const res = await apiFetch('/api/transaksi/batches');
        const batches = await res.json();
        if (!Array.isArray(batches)) {
            alert('Response bukan array: ' + JSON.stringify(batches).substring(0, 200));
            return;
        }
        renderRestoreBatchesList(batches);
        openModal('modal-restore-data');
    } catch (e) {
        alert('Error restore list: ' + e.message);
        showToast('Gagal memuat daftar riwayat reset & restore: ' + e.message, 'error');
    }
}
window.restoreTransaksiData = restoreTransaksiData;

function renderRestoreBatchesList(batches) {
    const container = document.getElementById('restore-batches-list');
    if (!container) { alert('Container restore-batches-list tidak ditemukan!'); return; }

    if (!batches || batches.length === 0) {
        container.innerHTML = '<div class="p-6 text-center text-gray-400 text-sm">Belum ada riwayat reset atau backup data.</div>';
        return;
    }

    let html = '';
    for (let i = 0; i < batches.length; i++) {
        const b = batches[i];
        const encNama = encodeURIComponent(b.nama_batch || '');
        const nama = b.nama_batch || 'Riwayat Data';
        const ket = b.keterangan || b.file_source || '';
        const total = b.total_transaksi || 0;
        let tgl = '-';
        if (b.tgl_import) {
            const rawTgl = b.tgl_import.replace(/-/g, '/');
            const d = new Date(rawTgl);
            if (!isNaN(d.getTime())) {
                tgl = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            } else {
                tgl = b.tgl_import.substring(0, 16);
            }
        }

        let badgeHtml = '';
        let iconHtml = '<i class="fas fa-database text-blue-500 mr-1.5"></i>';

        if (nama.toLowerCase().includes('reset')) {
            badgeHtml = '<span class="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Riwayat Reset</span>';
            iconHtml = '<i class="fas fa-trash-alt text-red-500 mr-1.5"></i>';
        } else if (nama.toLowerCase().includes('backup')) {
            badgeHtml = '<span class="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Auto Backup</span>';
            iconHtml = '<i class="fas fa-save text-amber-500 mr-1.5"></i>';
        } else {
            badgeHtml = '<span class="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Dataset Impor</span>';
            iconHtml = '<i class="fas fa-file-excel text-blue-500 mr-1.5"></i>';
        }

        html += '<div class="p-4 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-xl flex items-center justify-between gap-3 shadow-sm hover:border-blue-500/50 transition-all">';
        html += '  <div class="min-w-0 flex-1">';
        html += '    <div class="flex items-center gap-2 mb-1 flex-wrap">';
        html += '      <span class="font-bold text-gray-900 dark:text-white text-sm truncate">' + iconHtml + nama + '</span>';
        html += '      ' + badgeHtml;
        html += '    </div>';
        html += '    <div class="text-xs text-gray-500 dark:text-gray-400">' + ket + '</div>';
        html += '    <div class="text-xs text-gray-400 mt-1 flex items-center gap-3">';
        html += '      <span><i class="fas fa-box mr-1"></i>' + total.toLocaleString('id-ID') + ' transaksi</span>';
        html += '      <span><i class="fas fa-clock mr-1"></i>' + tgl + '</span>';
        html += '    </div>';
        html += '  </div>';
        html += '  <button onclick="executeRestoreBatch(' + b.id + ', decodeURIComponent(\'' + encNama + '\'))" class="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition flex items-center justify-center"><span>Restore</span></button>';
        html += '</div>';
    }
    container.innerHTML = html;
}

async function executeRestoreBatch(batchId, batchName) {
    if (!confirm('Restore dataset "' + batchName + '"?\n\nData transaksi saat ini akan di-backup otomatis dan digantikan dengan data dari dataset ini.')) {
        return;
    }
    closeModal('modal-restore-data');
    const overlay = document.getElementById('predicting-overlay');
    if (overlay) overlay.classList.remove('hidden');
    try {
        const res = await apiFetch('/api/transaksi/restore-batch/' + batchId, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message || 'Dataset berhasil dipulihkan!', 'success');
            await loadRiwayatPage(true);
            if (typeof loadDashboard === 'function') await loadDashboard();
            if (typeof loadPrediksi === 'function') await loadPrediksi();
            if (typeof loadStok === 'function') await loadStok();
        } else {
            alert('Gagal restore: ' + (data.error || JSON.stringify(data)));
            showToast(data.error || 'Gagal me-restore dataset.', 'error');
        }
    } catch (e) {
        alert('Error restore: ' + e.message);
        showToast('Error restore: ' + e.message, 'error');
    } finally {
        if (overlay) overlay.classList.add('hidden');
    }
}
window.executeRestoreBatch = executeRestoreBatch;

let isPredictionCalculated = false;
let currentAlphaSetting = 0.50;

async function loadAlphaSetting() {
    try {
        const res = await apiFetch('/api/predict/alpha');
        if (res.ok) {
            const data = await res.json();
            if (data && typeof data.alpha !== 'undefined') {
                currentAlphaSetting = parseFloat(data.alpha) || 0.50;
                syncAlphaInputs(currentAlphaSetting);
            }
        }
    } catch (e) {
        console.error('Error fetching alpha setting:', e);
    }
}

function syncAlphaInputs(val) {
    const formatted = parseFloat(val).toFixed(2);
    const inputMain = document.getElementById('input-alpha-setting');
    const inputSpec = document.getElementById('specific-alpha-input');
    if (inputMain && inputMain.value !== formatted) inputMain.value = formatted;
    if (inputSpec && inputSpec.value !== formatted) inputSpec.value = formatted;
}

function handleAlphaInputChange(val) {
    let num = parseFloat(val);
    if (isNaN(num)) num = 0.50;
    num = Math.max(0.01, Math.min(1.00, num));
    num = Math.round(num * 100) / 100;

    currentAlphaSetting = num;
    syncAlphaInputs(num);

    const selectMode = document.getElementById('select-pred-mode');
    const isSingle = selectMode && selectMode.value === 'single_menu';

    if (isSingle) {
        runSpecificPrediction();
    } else {
        triggerManualPrediction();
    }
}

async function loadPrediksi() {
    try {
        isPredictionCalculated = false;
        if (currentUser?.role === 'kasir') {
            togglePredView('results');
        }
        await loadAlphaSetting();
        await loadRekapPerPekan();
        const res = await apiFetch('/api/barang');
        if (res.ok) {
            const barangList = await res.json();
            currentPredBahanData = (barangList || []).map(b => ({
                id_barang: b.id,
                nama_barang: b.nama_barang,
                satuan_beli: b.satuan_beli,
                satuan_resep: b.satuan_resep,
                stok_gudang: b.stok_gudang,
                faktor_konversi: b.faktor_konversi,
                total_prediksi_kebutuhan: 0,
                wmape: 0,
                is_calculated: false
            }));
            applyPrediksiSort();
        }
    } catch (e) { showToast('Gagal memuat data prediksi: ' + e.message, 'error'); }
}

let currentPredBahanData = [];

async function loadHasilPrediksiBahan() {
    try {
        const belRes = await apiFetch(`/api/prediksi/rekomendasi?alpha=${currentAlphaSetting}`);
        const belData = await belRes.json();
        currentPredBahanData = (belData || []).map(d => ({
            ...d,
            is_calculated: true
        }));
        isPredictionCalculated = true;
        applyPrediksiSort();
    } catch (e) {
        console.error('Error loading prediction results:', e);
    }
}

function applyPrediksiSort() {
    const sortSelect = document.getElementById('sort-pred-select');
    const sortVal = sortSelect ? sortSelect.value : 'nama_asc';

    if (!currentPredBahanData || currentPredBahanData.length === 0) {
        renderPredBahan([]);
        return;
    }

    const sorted = [...currentPredBahanData];
    if (sortVal === 'nama_asc') {
        sorted.sort((a, b) => (a.nama_barang || '').localeCompare(b.nama_barang || ''));
    } else if (sortVal === 'nama_desc') {
        sorted.sort((a, b) => (b.nama_barang || '').localeCompare(a.nama_barang || ''));
    } else if (sortVal === 'akurasi_desc') {
        sorted.sort((a, b) => {
            const akurasiA = Math.max(0, 100 - (parseFloat(a.wmape) || 0));
            const akurasiB = Math.max(0, 100 - (parseFloat(b.wmape) || 0));
            return akurasiB - akurasiA;
        });
    } else if (sortVal === 'akurasi_asc') {
        sorted.sort((a, b) => {
            const akurasiA = Math.max(0, 100 - (parseFloat(a.wmape) || 0));
            const akurasiB = Math.max(0, 100 - (parseFloat(b.wmape) || 0));
            return akurasiA - akurasiB;
        });
    }

    renderPredBahan(sorted);
}
window.applyPrediksiSort = applyPrediksiSort;

async function loadRekapPerPekan() {
    const tbody = document.getElementById('table-rekap-pekan-body-trx') || document.getElementById('table-rekap-pekan-body-page') || document.getElementById('table-rekap-pekan-body');
    const badge = document.getElementById('rekap-total-badge-trx') || document.getElementById('rekap-total-badge-page') || document.getElementById('rekap-total-badge');
    if (!tbody) return;

    try {
        const res = await apiFetch('/api/prediksi/rekap-pekan');
        const resData = await res.json();
        const data = resData.data || [];

        if (badge) {
            badge.innerHTML = `<i class="fas fa-history mr-1"></i>Total: ${data.length} Menu | 4 Pekan Terakhir`;
        }

        if (data.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-400">Belum ada data agregasi penjualan perpekan.</td></tr>`;
            return;
        }

        tbody.innerHTML = data.map(d => `
            <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition text-sm">
                <td class="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100">
                    ${d.nama_menu}
                </td>
                <td class="px-4 py-3 text-center font-mono font-medium text-gray-700 dark:text-gray-300 bg-blue-500/5 dark:bg-blue-500/10">
                    ${d.pekan_1 || 0} Cup
                </td>
                <td class="px-4 py-3 text-center font-mono font-medium text-gray-700 dark:text-gray-300 bg-blue-500/5 dark:bg-blue-500/10">
                    ${d.pekan_2 || 0} Cup
                </td>
                <td class="px-4 py-3 text-center font-mono font-medium text-gray-700 dark:text-gray-300 bg-blue-500/5 dark:bg-blue-500/10">
                    ${d.pekan_3 || 0} Cup
                </td>
                <td class="px-4 py-3 text-center font-mono font-medium text-gray-700 dark:text-gray-300 bg-blue-500/5 dark:bg-blue-500/10">
                    ${d.pekan_4 || 0} Cup
                </td>
                <td class="px-4 py-3 text-center font-bold text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10">
                    ${d.total || 0} Cup
                </td>
            </tr>
        `).join('');
    } catch (e) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-red-500">Gagal memuat rekap penjualan perpekan.</td></tr>`;
    }
}

function switchPredTab(tabName) {
    const tabRekap = document.getElementById('pred-tab-rekap');
    const tabResults = document.getElementById('pred-tab-results');
    const btnRekap = document.getElementById('btn-show-rekap-tab');
    const btnResults = document.getElementById('btn-show-results-tab');

    if (tabName === 'results') {
        if (tabRekap) tabRekap.classList.add('hidden');
        if (tabResults) tabResults.classList.remove('hidden');
        if (btnResults) {
            btnResults.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-white');
            btnResults.classList.add('bg-blue-600', 'text-white');
        }
        if (btnRekap) {
            btnRekap.classList.remove('bg-blue-600', 'text-white');
            btnRekap.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-white');
        }
    } else {
        if (tabResults) tabResults.classList.add('hidden');
        if (tabRekap) tabRekap.classList.remove('hidden');
        if (btnRekap) {
            btnRekap.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-white');
            btnRekap.classList.add('bg-blue-600', 'text-white');
        }
        if (btnResults) {
            btnResults.classList.remove('bg-blue-600', 'text-white');
            btnResults.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-800', 'dark:text-white');
        }
    }
}

function renderPredBahan(data) {
    const tbody = document.getElementById('table-pred-bahan-body');
    if (!tbody) return;

    const isKasir = currentUser?.role === 'kasir';

    // Show / hide prediction detail columns based on role
    const colKebutuhan = document.querySelector('.col-pred-kebutuhan');
    const colAkurasi = document.querySelector('.col-pred-akurasi');
    if (colKebutuhan) colKebutuhan.style.display = isKasir ? 'none' : '';
    if (colAkurasi) colAkurasi.style.display = isKasir ? 'none' : '';

    if (!data || data.length === 0) {
        const colSpan = isKasir ? 3 : 5;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-12 text-gray-400 dark:text-gray-500 text-sm font-medium">Belum ada bahan baku terdaftar.</td></tr>`;
        return;
    }

    const createBadge = (wmapeVal) => {
        const wmapeNum = parseFloat(wmapeVal) || 0;
        const akurasiNum = Math.max(0, 100 - wmapeNum);
        return `<div class="text-xs font-semibold text-gray-700 dark:text-gray-300">Akurasi: ${akurasiNum.toFixed(2)}% <span class="text-[10px] text-gray-400 font-normal block">WMAPE: ${wmapeNum.toFixed(2)}%</span></div>`;
    };

    tbody.innerHTML = data.map(r => {
        const factor = r.faktor_konversi || 1.0;
        const stokGudang = r.stok_gudang || 0;
        const predMurni = r.total_prediksi_kebutuhan || 0;
        const predBeli = predMurni / factor;
        const unitBeliRounded = Math.ceil(predBeli);

        const isCalculated = r.is_calculated || isPredictionCalculated;
        const rekBelanjaText = isCalculated ? `${formatNum(unitBeliRounded, 0)} ${r.satuan_beli || 'Pack'}` : `<span class="text-gray-400 text-xs font-normal">-</span>`;

        return `
        <tr class="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition border-b border-gray-100 dark:border-gray-800/60 text-sm">
            <td class="px-5 py-3.5 td-title" data-label="Bahan Baku">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-cube text-xs"></i>
                    </div>
                    <div>
                        <div class="font-bold text-gray-900 dark:text-gray-100">${r.nama_barang}</div>
                        <div class="text-xs text-gray-400 dark:text-gray-500 font-normal">Satuan Beli: ${r.satuan_beli || 'Pack'}</div>
                    </div>
                </div>
            </td>
            <td class="px-5 py-3.5 text-center font-semibold text-gray-900 dark:text-white" data-label="Stok Gudang">
                ${formatNum(stokGudang, 0)} ${r.satuan_resep || 'gram'}
            </td>
            ${isKasir ? '' : `
            <td class="px-5 py-3.5 text-center" data-label="Prediksi Kebutuhan">
                ${isCalculated ? `<div class="text-sm font-semibold text-gray-800 dark:text-gray-200">${formatNum(predBeli, 2)} ${r.satuan_beli}</div><div class="text-[10px] text-gray-400 font-mono mt-0.5">(${formatNum(predMurni, 0)} ${r.satuan_resep})</div>` : '<span class="text-gray-400 text-xs font-normal">-</span>'}
            </td>
            <td class="px-5 py-3.5 text-center" data-label="Akurasi Prediksi">
                ${isCalculated ? createBadge(r.wmape) : '<span class="text-gray-400 text-xs font-normal">-</span>'}
            </td>
            `}
            <td class="px-5 py-3.5 text-center font-bold text-gray-900 dark:text-white" data-label="Rekomendasi Belanja">
                ${rekBelanjaText}
            </td>
        </tr>`;
    }).join('');
}

async function triggerManualPrediction() {
    const btn = document.getElementById('btn-manual-predict');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-1"></i> Memproses Prediksi...`;
    }

    try {
        const res = await apiFetch('/api/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ alpha: currentAlphaSetting })
        });
        const data = await res.json();

        if (data.success) {
            showToast(data.message || `Prediksi bahan baku SES (Alpha = ${currentAlphaSetting}) berhasil diproses!`, 'success');
            await loadHasilPrediksiBahan();
            switchPredTab('results');
        } else {
            showToast('Gagal memproses prediksi: ' + (data.error || 'Terjadi kesalahan'), 'error');
        }
    } catch (e) {
        showToast('Gagal memicu prediksi manual: ' + e.message, 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `Hitung Rekomendasi Belanja`;
        }
    }
}

async function checkAutoSundayPrediction() {
    try {
        const res = await apiFetch('/api/predict/auto');
        const data = await res.json();
        if (data && data.triggered) {
            showToast(data.message || 'Prediksi otomatis hari Minggu pukul 00.00 WIB telah diperbarui.', 'info');
            if (typeof currentPageId !== 'undefined' && currentPageId === 'prediksi') {
                await loadPrediksi();
            }
        }
    } catch (e) {
        console.error('Auto Sunday check error:', e);
    }
}

window.loadPrediksi = loadPrediksi;
window.renderPredBahan = renderPredBahan;
window.triggerManualPrediction = triggerManualPrediction;
window.handleAlphaInputChange = handleAlphaInputChange;
window.loadAlphaSetting = loadAlphaSetting;
window.switchPredTab = switchPredTab;
window.loadRekapPerPekan = loadRekapPerPekan;
window.checkAutoSundayPrediction = checkAutoSundayPrediction;

// Stok Exports
window.loadStok = loadStok;
window.switchStokTab = switchStokTab;
window.openAddBarangModal = openAddBarangModal;
window.editBarangGeneral = editBarangGeneral;
window.editBarangUmum = editBarangUmum;
window.submitBarangGeneral = submitBarangGeneral;
window.editBarangTeknis = editBarangTeknis;
window.updateTeknisKonversiPreview = updateTeknisKonversiPreview;
window.submitBarangTeknis = submitBarangTeknis;
window.deleteBarang = deleteBarang;
window.openTambahStok = openTambahStok;
window.submitTambahStok = submitTambahStok;

// SOP & Menu Exports
window.loadSopPage = loadSopPage;
window.loadSOPEditor = loadSOPEditor;
window.openAddSopItemModal = openAddSopItemModal;
window.openEditSopItemModal = openEditSopItemModal;
window.onSopItemBarangChange = onSopItemBarangChange;
window.refreshBarangData = refreshBarangData;
window.refreshMenuData = refreshMenuData;
window.submitSopItem = submitSopItem;
window.deleteSopItem = deleteSopItem;
window.saveSOP = saveSOP;
window.openAddMenuModal = openAddMenuModal;
window.editMenu = editMenu;
window.deleteMenu = deleteMenu;
window.submitMenu = submitMenu;

// ============================================================
// PROFILE & LOGO MANAGEMENT
// ============================================================
let profileModalAvatarBase64 = null;
let profileModalAvatarDeleted = false;

function openProfileModal() {
    if (!currentUser) return;
    document.getElementById('profile-nama').value = currentUser.nama || '';
    document.getElementById('profile-role').textContent = currentUser.role === 'admin' ? 'Admin' : 'Kasir';

    // Set current image preview
    const imgUrl = currentUser.avatar || 'haltea-logo.png';
    document.getElementById('profile-modal-img').src = imgUrl;

    profileModalAvatarBase64 = currentUser.avatar; // Keep current value
    profileModalAvatarDeleted = false;

    // Hide delete button if already default logo
    const btnDel = document.getElementById('btn-delete-logo');
    if (imgUrl === 'haltea-logo.png') {
        btnDel.classList.add('hidden');
    } else {
        btnDel.classList.remove('hidden');
    }

    openModal('modal-profil');
}

function uploadProfileLogo(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const base64 = e.target.result;
        document.getElementById('profile-modal-img').src = base64;
        profileModalAvatarBase64 = base64;
        profileModalAvatarDeleted = false;

        // Show delete button
        document.getElementById('btn-delete-logo').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function deleteProfileLogo() {
    document.getElementById('profile-modal-img').src = 'haltea-logo.png';
    profileModalAvatarBase64 = null;
    profileModalAvatarDeleted = true;

    // Hide delete button
    document.getElementById('btn-delete-logo').classList.add('hidden');
    // Reset file input
    document.getElementById('profile-logo-input').value = '';
}

async function saveProfile() {
    const nama = document.getElementById('profile-nama').value.trim();
    if (!nama) {
        showToast('Nama tidak boleh kosong', 'error');
        return;
    }

    try {
        const avatar = profileModalAvatarDeleted ? null : profileModalAvatarBase64;
        const res = await apiFetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama, avatar })
        });
        const data = await res.json();

        if (res.ok) {
            currentUser.nama = nama;
            currentUser.avatar = avatar;

            // Update UI elements
            document.getElementById('sidebar-name').textContent = nama;
            const headerAvatarImg = document.getElementById('header-avatar-img');
            if (headerAvatarImg) headerAvatarImg.src = avatar || 'haltea-logo.png';

            showToast('Profil berhasil diperbarui!', 'success');
            closeModal('modal-profil');
        } else {
            showToast(data.error || 'Gagal menyimpan profil', 'error');
        }
    } catch (err) {
        showToast('Terjadi kesalahan koneksi', 'error');
    }
}

// ============================================================
// AUTO REFRESH (Realtime Update)
// ============================================================
async function autoRefreshCurrentPage() {
    if (!currentUser) return; // Not logged in

    // Do not reload if any modal is visible
    const modals = ['modal-barang-umum', 'modal-barang-teknis', 'modal-tambah-stok', 'modal-menu', 'modal-edit-transaksi', 'modal-confirm-delete', 'modal-profil', 'modal-sop-item', 'modal-prediction-status'];
    const anyModalOpen = modals.some(id => {
        const el = document.getElementById(id);
        return el && !el.classList.contains('hidden');
    });
    if (anyModalOpen) return;

    try {
        if (currentPageId === 'dashboard') {
            await loadDashboard();
        } else if (currentPageId === 'stok') {
            await loadStok();
        } else if (currentPageId === 'sop') {
            // Only refresh SOP list/editor if no inputs are active
            const hasFocus = document.activeElement && (document.activeElement.classList.contains('sop-input') || document.activeElement.id === 'sop-menu-harga');
            if (!hasFocus) {
                const prevMenuId = currentSopMenuId;
                await loadSopPage();
                if (prevMenuId) {
                    currentSopMenuId = prevMenuId;
                    await loadSOPEditor(prevMenuId);
                }
            }
        } else if (currentPageId === 'transaksi') {
            // Only refresh if no transaction items are checked
            const hasChecked = Array.from(document.querySelectorAll('.katalog-card input[type="checkbox"]')).some(chk => chk.checked);
            if (!hasChecked) {
                await loadTransaksiCatalog();
            }
        } else if (currentPageId === 'data_transaksi') {
            await loadRiwayatPage();
        } else if (currentPageId === 'prediksi') {
            if (isPredictionCalculated) {
                await Promise.all([
                    loadRekapPerPekan(),
                    loadHasilPrediksiBahan()
                ]);
            } else {
                await loadPrediksi();
            }
        }
    } catch (e) {
        console.error("Auto refresh error:", e);
    }
}

async function checkAutoSundayPrediction() {
    try {
        const now = new Date();
        if (now.getDay() === 0 && now.getHours() === 0 && now.getMinutes() < 15) {
            if (currentUser && currentUser.role === 'admin') {
                await apiFetch('/api/predict/auto', { method: 'POST' }).catch(() => { });
            }
        }
    } catch (e) {
        console.error("Sunday prediction check error:", e);
    }
}

// ============================================================
// EXCLUSIVE INTRO SPLASH & WELCOME VOICE
// ============================================================
let splashDismissed = false;

function playWelcomeAudio() {
    try {
        // 1. Play sleek luxury chime sound (Web Audio API)
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
            const ctx = new AudioCtx();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const now = ctx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Haltea Welcome Harmony)
            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.09);

                gain.gain.setValueAtTime(0, now + idx * 0.09);
                gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.09 + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 1.2);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(now + idx * 0.09);
                osc.stop(now + idx * 0.09 + 1.3);
            });
        }
    } catch (e) {
        console.warn('AudioContext chime error:', e);
    }

    try {
        // 2. Play Speech Synthesis Voice: "Welcome to POS Haltea Indonesia"
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utter = new SpeechSynthesisUtterance("Welcome to POS Haltea Indonesia");
            utter.rate = 0.92;
            utter.pitch = 1.05;
            utter.volume = 1.0;
            utter.lang = 'en-US';

            const speakNow = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices && voices.length > 0) {
                    const naturalVoice = voices.find(v => (v.lang.startsWith('en') || v.lang.startsWith('id')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Zira')));
                    if (naturalVoice) utter.voice = naturalVoice;
                }
                window.speechSynthesis.speak(utter);
            };

            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.onvoiceschanged = () => {
                    speakNow();
                };
            } else {
                setTimeout(speakNow, 250);
            }
        }
    } catch (e) {
        console.warn('SpeechSynthesis error:', e);
    }
}

function initSplashScreen() {
    const splash = document.getElementById('app-splash-screen');
    const logoContainer = document.getElementById('splash-logo-container');
    const progressBar = document.getElementById('splash-progress-bar');
    if (!splash) return;

    // Trigger smooth fade-in
    setTimeout(() => {
        if (logoContainer) {
            logoContainer.classList.remove('opacity-0', 'scale-90');
            logoContainer.classList.add('opacity-100', 'scale-100');
        }
        if (progressBar) {
            progressBar.style.width = '100%';
        }
        playWelcomeAudio();
    }, 200);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        dismissSplashScreen();
    }, 5000);
}

function dismissSplashScreen() {
    if (splashDismissed) return;
    splashDismissed = true;
    const splash = document.getElementById('app-splash-screen');
    const logoContainer = document.getElementById('splash-logo-container');
    if (!splash) return;

    if (logoContainer) {
        logoContainer.classList.remove('opacity-100', 'scale-100');
        logoContainer.classList.add('opacity-0', 'scale-95');
    }

    splash.classList.add('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        splash.style.display = 'none';
    }, 1000);
}
window.initSplashScreen = initSplashScreen;
window.dismissSplashScreen = dismissSplashScreen;
window.playWelcomeAudio = playWelcomeAudio;

// ============================================================
// INIT
// ============================================================
window.onload = () => {
    try {
        initSplashScreen();

        const modalBarangUmum = document.getElementById('modal-barang-umum');
        if (modalBarangUmum) {
            modalBarangUmum.addEventListener('click', (e) => {
                if (e.target === modalBarangUmum) {
                    closeModal('modal-barang-umum');
                    const titleEl = document.getElementById('modal-barang-umum-title');
                    if (titleEl) titleEl.textContent = 'Tambah Bahan Baku';
                    const idEl = document.getElementById('barang-umum-id');
                    if (idEl) idEl.value = '';
                    const formEl = document.getElementById('form-barang-umum');
                    if (formEl) formEl.reset();
                }
            });
        }

        if (typeof initSidebarControls === 'function') initSidebarControls();
        if (typeof updateLayoutMode === 'function') updateLayoutMode();

        checkAutoSundayPrediction();
    } catch (err) {
        console.error("Initialization error:", err);
    } finally {
        checkAuth();
    }
};

function handlePredModeChange(mode) {
    if (mode === 'single_menu') {
        togglePredView('specific');
    } else {
        togglePredView('results');
    }
}
window.handlePredModeChange = handlePredModeChange;

async function togglePredView(targetView = null) {
    const tabResults = document.getElementById('pred-tab-results');
    const tabSpecific = document.getElementById('pred-tab-specific');
    const selectMode = document.getElementById('select-pred-mode');

    let showSpecific = false;
    if (targetView === 'specific') {
        showSpecific = true;
    } else if (targetView === 'results') {
        showSpecific = false;
    } else {
        showSpecific = tabSpecific ? !tabSpecific.classList.contains('hidden') : false;
    }

    if (selectMode) {
        selectMode.value = showSpecific ? 'single_menu' : 'semua_menu';
    }

    if (showSpecific) {
        if (tabResults) tabResults.classList.add('hidden');
        if (tabSpecific) tabSpecific.classList.remove('hidden');
        await prepareSpecificPredView();
    } else {
        if (tabSpecific) tabSpecific.classList.add('hidden');
        if (tabResults) tabResults.classList.remove('hidden');
    }
}

async function prepareSpecificPredView() {
    if (!allBarang || allBarang.length === 0) {
        await refreshBarangData();
    }
    const selectBarang = document.getElementById('specific-predict-barang');
    const selectMenu = document.getElementById('specific-predict-menu');
    const resultBox = document.getElementById('specific-predict-result');
    const loadingBox = document.getElementById('specific-predict-loading');

    if (resultBox) resultBox.classList.add('hidden');
    if (loadingBox) loadingBox.classList.add('hidden');

    if (selectBarang) {
        const sortedBarang = [...allBarang].sort((a, b) => (a.kode_barang || '').localeCompare(b.kode_barang || '', undefined, { numeric: true, sensitivity: 'base' }));
        selectBarang.innerHTML = '<option value="">-- Pilih Bahan Baku --</option>' + sortedBarang.map(b => `<option value="${b.id}">${b.kode_barang ? b.kode_barang + ' - ' : ''}${b.nama_barang}</option>`).join('');
    }

    if (selectMenu) {
        selectMenu.innerHTML = '<option value="">Pilih bahan baku terlebih dahulu...</option>';
        selectMenu.disabled = true;
    }
}

window.openSpecificPredictModal = togglePredView;
window.togglePredView = togglePredView;

async function onSpecificPredictBarangChange() {
    const selectBarang = document.getElementById('specific-predict-barang');
    const selectMenu = document.getElementById('specific-predict-menu');
    const resultBox = document.getElementById('specific-predict-result');
    const loadingBox = document.getElementById('specific-predict-loading');

    if (resultBox) resultBox.classList.add('hidden');
    if (loadingBox) loadingBox.classList.add('hidden');

    const barangId = parseInt(selectBarang.value);
    if (!barangId) {
        selectMenu.innerHTML = '<option value="">Pilih bahan baku terlebih dahulu...</option>';
        selectMenu.disabled = true;
        return;
    }

    selectMenu.innerHTML = '<option value="">Memuat menu terkait...</option>';
    selectMenu.disabled = true;

    try {
        const res = await apiFetch(`/api/predict/barang-menus/${barangId}`);
        if (!res.ok) throw new Error('Gagal memuat menu terkait.');
        const menus = await res.json();

        if (!menus || menus.length === 0) {
            selectMenu.innerHTML = '<option value="">(Bahan baku ini belum digunakan di SOP menu manapun)</option>';
            selectMenu.disabled = true;
            return;
        }

        selectMenu.innerHTML = '<option value="">-- Pilih Menu Produk SOP --</option>' + menus.map(m => `
            <option value="${m.id}">${m.nama_menu} (Takaran: ${formatNum(m.gramasi, 0)} ${m.satuan_resep || 'gram'}/cup)</option>
        `).join('');
        selectMenu.disabled = false;
    } catch (err) {
        showToast(err.message || 'Gagal memuat menu terkait.', 'error');
        selectMenu.innerHTML = '<option value="">Gagal memuat menu</option>';
    }
}

async function runSpecificPrediction() {
    const selectBarang = document.getElementById('specific-predict-barang');
    const selectMenu = document.getElementById('specific-predict-menu');
    const resultBox = document.getElementById('specific-predict-result');
    const loadingBox = document.getElementById('specific-predict-loading');

    const barangId = parseInt(selectBarang.value);
    const menuId = parseInt(selectMenu.value);

    if (!barangId || !menuId) return;

    if (resultBox) resultBox.classList.add('hidden');
    if (loadingBox) loadingBox.classList.remove('hidden');

    try {
        const alpha = currentAlphaSetting || 0.50;
        const res = await apiFetch(`/api/predict/specific?id_barang=${barangId}&id_menu=${menuId}&alpha=${alpha}`);
        if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Gagal menghitung prediksi.');
        }

        const data = await res.json();
        if (loadingBox) loadingBox.classList.add('hidden');

        if (!data.has_data) {
            showToast('Belum ada data transaksi untuk menu dan bahan baku terpilih.', 'warn');
            return;
        }

        // Populate Result UI
        const barangName = data.barang?.nama_barang || '-';
        const menuName = data.menu?.nama_menu || '-';
        const gramasi = data.gramasi_per_cup || 0;
        const satResep = data.barang?.satuan_resep || 'gram';
        const satBeli = data.barang?.satuan_beli || 'Pack';
        const usedAlpha = data.alpha !== undefined ? data.alpha : alpha;

        document.getElementById('spec-result-badge-menu').textContent = menuName;
        document.getElementById('spec-result-title').textContent = `Bahan Baku: ${barangName} (${data.barang?.kode_barang || '-'})`;
        document.getElementById('spec-result-takaran').textContent = `Takaran SOP: ${formatNum(gramasi, 0)} ${satResep} per cup`;

        // WMAPE Badge
        const wmape = data.wmape || 0;
        const akurasi = data.akurasi || 0;
        const wmapeBadge = document.getElementById('spec-result-wmape-badge');
        if (wmapeBadge) {
            let colorClass = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            if (akurasi < 70) colorClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            wmapeBadge.innerHTML = `
                <span class="px-2.5 py-1 rounded-full text-xs font-bold ${colorClass}">
                    <i class="fas fa-check-circle mr-1"></i>Akurasi: ${akurasi}%
                </span>
                <span class="text-[10px] text-gray-500 dark:text-gray-400 block mt-1">Alpha (&alpha;): ${usedAlpha} | WMAPE Error: ${wmape}%</span>
            `;
        }

        // History Table
        const tbody = document.getElementById('spec-result-history-tbody');
        if (tbody) {
            const weeks = data.week_labels || [];
            const sales = data.sales_series || [];
            const usages = data.usage_series || [];

            tbody.innerHTML = weeks.map((w, idx) => `
                <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td class="px-3.5 py-2 font-semibold text-gray-700 dark:text-gray-300">${w}</td>
                    <td class="px-3.5 py-2 text-center font-mono font-bold text-blue-600 dark:text-blue-400">${formatNum(sales[idx] || 0, 0)} Cup</td>
                    <td class="px-3.5 py-2 text-right font-mono font-bold text-gray-900 dark:text-white">${formatNum(usages[idx] || 0, 0)} ${satResep}</td>
                </tr>
            `).join('');
        }

        // Prediction Box
        const predValBox = document.getElementById('spec-result-pred-val');
        if (predValBox) {
            const rekBelanja = data.rekomendasi_belanja !== undefined ? data.rekomendasi_belanja : Math.ceil(data.predicted_usage_beli);
            predValBox.innerHTML = `
                <div class="flex items-center justify-between gap-3">
                    <div>
                        <span class="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Rekomendasi Belanja Pekan Depan</span>
                        <div class="text-3xl font-black mt-1 text-blue-600 dark:text-blue-400 tracking-tight">${formatNum(rekBelanja, 0)} ${satBeli}</div>
                    </div>
                </div>
            `;
        }

        // Summary Table (Stok, WMAPE, S5, Net Needs, Rounding)
        const summaryTbody = document.getElementById('spec-result-summary-tbody');
        if (summaryTbody) {
            const factor = data.barang?.faktor_konversi || 1;
            const stokGudangResep = data.stok_gudang_resep !== undefined ? data.stok_gudang_resep : (data.barang?.stok_gudang || 0);
            const stokGudangBeli = data.stok_gudang_beli !== undefined ? data.stok_gudang_beli : (stokGudangResep / factor);
            const predResep = data.predicted_usage_resep || 0;
            const predBeli = data.predicted_usage_beli || 0;
            const bersihResep = data.kebutuhan_bersih_resep !== undefined ? data.kebutuhan_bersih_resep : Math.max(0, predResep - stokGudangResep);
            const bersihBeli = data.kebutuhan_bersih_beli !== undefined ? data.kebutuhan_bersih_beli : Math.max(0, predBeli - stokGudangBeli);
            const rekBelanja = data.rekomendasi_belanja !== undefined ? data.rekomendasi_belanja : Math.ceil(bersihBeli);
            const wmapeVal = data.wmape || 0;
            const akurasiVal = data.akurasi || 0;

            summaryTbody.innerHTML = `
                <tr>
                    <td class="px-3.5 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                        Sisa Stok Gudang Real-time
                    </td>
                    <td class="px-3.5 py-2.5 text-center font-semibold text-gray-700 dark:text-gray-300">${formatNum(stokGudangResep, 0)} ${satResep}</td>
                    <td class="px-3.5 py-2.5 text-right font-bold text-gray-900 dark:text-white">${formatNum(stokGudangBeli, 2)} ${satBeli}</td>
                </tr>
                <tr>
                    <td class="px-3.5 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                        Evaluasi Akurasi Peramalan (WMAPE)
                    </td>
                    <td class="px-3.5 py-2.5 text-center font-semibold text-emerald-600 dark:text-emerald-400">WMAPE: ${wmapeVal}%</td>
                    <td class="px-3.5 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">Akurasi: ${akurasiVal}%</td>
                </tr>
                <tr>
                    <td class="px-3.5 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                        Total Prediksi Kebutuhan Pekan Selanjutnya (S5)
                    </td>
                    <td class="px-3.5 py-2.5 text-center font-semibold text-blue-600 dark:text-blue-400">${formatNum(predResep, 2)} ${satResep}</td>
                    <td class="px-3.5 py-2.5 text-right font-bold text-blue-600 dark:text-blue-400">${formatNum(predBeli, 2)} ${satBeli}</td>
                </tr>
                <tr>
                    <td class="px-3.5 py-2.5 font-medium text-gray-700 dark:text-gray-300">
                        Kebutuhan Bersih (Dikurangi Sisa Stok Gudang)
                    </td>
                    <td class="px-3.5 py-2.5 text-center font-semibold text-amber-600 dark:text-amber-400">${formatNum(bersihResep, 2)} ${satResep}</td>
                    <td class="px-3.5 py-2.5 text-right font-bold text-amber-600 dark:text-amber-400">${formatNum(bersihBeli, 2)} ${satBeli}</td>
                </tr>
                <tr class="bg-blue-50/50 dark:bg-blue-900/30">
                    <td class="px-3.5 py-3 font-bold text-blue-700 dark:text-blue-300">
                        Rekomendasi Belanja (Setelah Dibulatkan)
                    </td>
                    <td class="px-3.5 py-3 text-center text-blue-700 dark:text-blue-300">-</td>
                    <td class="px-3.5 py-3 text-right text-base text-blue-700 dark:text-blue-300 font-black">${formatNum(rekBelanja, 0)} ${satBeli}</td>
                </tr>
            `;
        }

        if (resultBox) resultBox.classList.remove('hidden');
    } catch (err) {
        if (loadingBox) loadingBox.classList.add('hidden');
        showToast(err.message || 'Gagal menghitung prediksi.', 'error');
    }
}

// ============================================================
// 1. LAPORAN KEUANGAN
// ============================================================
async function loadLaporanKeuangan() {
    try {
        const res = await apiFetch('/api/keuangan/summary');
        const data = await res.json();

        const omsetEl = document.getElementById('stat-keuangan-omset');
        const totalCupEl = document.getElementById('stat-keuangan-total-cup');
        const hppEl = document.getElementById('stat-keuangan-hpp');
        const opsEl = document.getElementById('stat-keuangan-operasional');
        const netProfitEl = document.getElementById('stat-keuangan-netprofit');
        const marginEl = document.getElementById('stat-keuangan-margin');

        const detOmset = document.getElementById('keu-det-omset');
        const detHpp = document.getElementById('keu-det-hpp');
        const detGross = document.getElementById('keu-det-grossprofit');
        const detOps = document.getElementById('keu-det-beban-ops');
        const detNet = document.getElementById('keu-det-netprofit');

        if (omsetEl) omsetEl.textContent = `Rp ${formatNum(data.total_omset, 0)}`;
        if (totalCupEl) totalCupEl.textContent = `${formatNum(data.total_cups, 0)} cup terjual`;
        if (hppEl) hppEl.textContent = `Rp ${formatNum(data.hpp_estimasi, 0)}`;
        if (opsEl) opsEl.textContent = `Rp ${formatNum(data.operasional_estimasi, 0)}`;
        if (netProfitEl) netProfitEl.textContent = `Rp ${formatNum(data.net_profit, 0)}`;
        if (marginEl) marginEl.textContent = `Margin Keuntungan: ${data.margin_persen}%`;

        if (detOmset) detOmset.textContent = `Rp ${formatNum(data.total_omset, 0)}`;
        if (detHpp) detHpp.textContent = `- Rp ${formatNum(data.hpp_estimasi, 0)}`;
        if (detGross) detGross.textContent = `Rp ${formatNum(data.gross_profit, 0)}`;
        if (detOps) detOps.textContent = `- Rp ${formatNum(data.operasional_estimasi, 0)}`;
        if (detNet) detNet.textContent = `Rp ${formatNum(data.net_profit, 0)}`;
    } catch (e) {
        showToast('Gagal memuat laporan keuangan.', 'error');
    }
}
window.loadLaporanKeuangan = loadLaporanKeuangan;

// ============================================================
// 2. LAPORAN ARUS KAS
// ============================================================
let allArusKas = [];

async function loadArusKas() {
    try {
        const res = await apiFetch('/api/aruskas');
        allArusKas = await res.json();

        // Calculate summary
        let kasMasuk = 0;
        let kasKeluar = 0;
        allArusKas.forEach(k => {
            const nom = parseFloat(k.nominal) || 0;
            if (k.tipe === 'masuk') kasMasuk += nom;
            else kasKeluar += nom;
        });
        const saldo = kasMasuk - kasKeluar;

        const statMasuk = document.getElementById('stat-kas-masuk');
        const statKeluar = document.getElementById('stat-kas-keluar');
        const statSaldo = document.getElementById('stat-kas-saldo');
        const countBadge = document.getElementById('arus-kas-count');

        if (statMasuk) statMasuk.textContent = `Rp ${formatNum(kasMasuk, 0)}`;
        if (statKeluar) statKeluar.textContent = `Rp ${formatNum(kasKeluar, 0)}`;
        if (statSaldo) statSaldo.textContent = `Rp ${formatNum(saldo, 0)}`;
        if (countBadge) countBadge.textContent = `${allArusKas.length} Transaksi`;

        const tbody = document.getElementById('table-arus-kas-body');
        if (!tbody) return;

        if (allArusKas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="py-8 text-center text-gray-400">Belum ada mutasi arus kas tercatat.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = allArusKas.map(item => `
            <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                <td class="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">${item.tanggal}</td>
                <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">${item.kategori}</td>
                <td class="px-4 py-3 text-center">
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${item.tipe === 'masuk' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}">
                        <i class="fas ${item.tipe === 'masuk' ? 'fa-arrow-down' : 'fa-arrow-up'} text-[10px]"></i>
                        ${item.tipe === 'masuk' ? 'Kas Masuk' : 'Kas Keluar'}
                    </span>
                </td>
                <td class="px-4 py-3 text-right font-bold ${item.tipe === 'masuk' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}">
                    ${item.tipe === 'masuk' ? '+' : '-'} Rp ${formatNum(item.nominal, 0)}
                </td>
                <td class="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">${item.keterangan || '-'}</td>
                <td class="px-4 py-3 text-center">
                    <button onclick="deleteArusKas(${item.id})" title="Hapus Mutasi Kas" class="text-gray-400 hover:text-red-500 p-1.5 transition">
                        <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        showToast('Gagal memuat data arus kas.', 'error');
    }
}
window.loadArusKas = loadArusKas;

function openModalTambahArusKas() {
    const tglInput = document.getElementById('aruskas-tanggal');
    const form = document.getElementById('form-tambah-aruskas');
    if (form) form.reset();
    if (tglInput) tglInput.value = new Date().toISOString().slice(0, 10);
    openModal('modal-tambah-aruskas');
}
window.openModalTambahArusKas = openModalTambahArusKas;

async function submitArusKas(e) {
    e.preventDefault();
    const tipeRadio = document.querySelector('input[name="tipe_kas"]:checked');
    const tipe = tipeRadio ? tipeRadio.value : 'masuk';
    const tanggal = document.getElementById('aruskas-tanggal').value;
    const kategori = document.getElementById('aruskas-kategori').value;
    const nominal = document.getElementById('aruskas-nominal').value;
    const keterangan = document.getElementById('aruskas-keterangan').value;

    try {
        const res = await apiFetch('/api/aruskas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipe, tanggal, kategori, nominal, keterangan })
        });
        if (!res.ok) throw new Error('Gagal menyimpan mutasi kas');
        showToast('Mutasi kas berhasil dicatat.', 'success');
        closeModal('modal-tambah-aruskas');
        await loadArusKas();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.submitArusKas = submitArusKas;

async function deleteArusKas(id) {
    if (!confirm('Hapus pencatatan mutasi kas ini?')) return;
    try {
        const res = await apiFetch(`/api/aruskas/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus mutasi kas');
        showToast('Mutasi kas telah dihapus.', 'success');
        await loadArusKas();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.deleteArusKas = deleteArusKas;

// ============================================================
// 3. ABSENSI STAF (EXACT SCREENSHOT SPECIFICATION)
// ============================================================
let allAbsensiRecords = [];

async function loadAbsensiStaf() {
    try {
        // 1. Load Jam Kerja
        const resJk = await apiFetch('/api/jamkerja');
        if (resJk.ok) {
            const jk = await resJk.json();
            const masukInput = document.getElementById('jam-masuk-standar');
            const pulangInput = document.getElementById('jam-pulang-standar');
            if (masukInput && jk.jam_masuk) masukInput.value = jk.jam_masuk;
            if (pulangInput && jk.jam_pulang) pulangInput.value = jk.jam_pulang;
        }

        // Set default filter date to today if empty
        const filterTglInput = document.getElementById('filter-absensi-tanggal');
        if (filterTglInput && !filterTglInput.value) {
            filterTglInput.value = new Date().toISOString().slice(0, 10);
        }

        // 2. Load Attendance Records
        const dateQuery = filterTglInput?.value ? `?tanggal=${filterTglInput.value}` : '';
        const resAbs = await apiFetch(`/api/absensi${dateQuery}`);
        if (resAbs.ok) {
            allAbsensiRecords = await resAbs.json();
            renderAbsensiTable(allAbsensiRecords);
        }

        // 3. Load All Records to summarize leaves in the current month across staff
        const todayStr = new Date().toISOString().slice(0, 10);
        const curMonth = todayStr.slice(0, 7); // e.g. "2026-08"
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const curDateObj = new Date();
        const monthLabel = monthNames[curDateObj.getMonth()] + " " + curDateObj.getFullYear();

        const resAll = await apiFetch('/api/absensi');
        if (resAll.ok) {
            const allRecords = await resAll.json();
            const izinThisMonth = allRecords.filter(r => r.status === 'Izin' && (r.tanggal || '').startsWith(curMonth));
            
            const adminIzinCard = document.getElementById('admin-izin-summary-card');
            const adminIzinMonthLabel = document.getElementById('admin-izin-month-label');
            const adminTotalIzinBadge = document.getElementById('admin-total-izin-badge');
            const adminChipsContainer = document.getElementById('admin-izin-chips-container');

            if (adminIzinCard && adminChipsContainer) {
                if (adminIzinMonthLabel) adminIzinMonthLabel.textContent = monthLabel;
                
                if (izinThisMonth.length > 0) {
                    const staffMap = {};
                    izinThisMonth.forEach(r => {
                        const name = r.nama_staff || 'Staff';
                        staffMap[name] = (staffMap[name] || 0) + 1;
                    });

                    if (adminTotalIzinBadge) {
                        adminTotalIzinBadge.textContent = `Total: ${izinThisMonth.length} Izin`;
                    }

                    adminChipsContainer.innerHTML = Object.entries(staffMap).map(([name, count]) => `
                        <div class="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700/60 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-xs">
                            <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                            <span>${name}:</span>
                            <span class="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-black rounded-lg text-[11px]">${count}x Izin</span>
                        </div>
                    `).join('');

                    adminIzinCard.classList.remove('hidden');
                } else {
                    adminIzinCard.classList.add('hidden');
                }
            }
        }
    } catch (e) {
        showToast('Gagal memuat data absensi staf.', 'error');
    }
}
window.loadAbsensiStaf = loadAbsensiStaf;

async function saveJamKerja(e) {
    e.preventDefault();
    const jam_masuk = document.getElementById('jam-masuk-standar').value;
    const jam_pulang = document.getElementById('jam-pulang-standar').value;

    try {
        const res = await apiFetch('/api/jamkerja', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jam_masuk, jam_pulang })
        });
        if (!res.ok) throw new Error('Gagal menyimpan jam kerja');
        showToast('Jam kerja standar berhasil disimpan.', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.saveJamKerja = saveJamKerja;

function renderAbsensiTable(records) {
    const tbody = document.getElementById('table-absensi-body');
    if (!tbody) return;

    if (!records || records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                    Belum ada rekaman absensi hari ini.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = records.map(item => {
        let statusBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (item.status === 'Terlambat') statusBadgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        else if (item.status === 'Izin') statusBadgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        else if (item.status === 'Sakit') statusBadgeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        else if (item.status === 'Alpha') statusBadgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

        const fotoUrl = item.foto || 'haltea-logo.png';

        return `
        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
            <td class="py-3 px-3 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">${item.tanggal}</td>
            <td class="py-3 px-3 font-bold text-gray-900 dark:text-white whitespace-nowrap">${item.nama_staff}</td>
            <td class="py-3 px-3 text-center whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadgeClass}">
                    ${item.status}
                </span>
            </td>
            <td class="py-3 px-3 text-center font-mono font-semibold text-gray-700 dark:text-gray-300">${item.jam_masuk || '-'}</td>
            <td class="py-3 px-3 text-center font-mono font-semibold text-gray-700 dark:text-gray-300">${item.jam_pulang || '-'}</td>
            <td class="py-3 px-3 text-center">
                <div class="inline-block w-8 h-8 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                     onclick="previewFotoAbsensi('${fotoUrl}', '${item.nama_staff} - ${item.tanggal}')" title="Lihat Foto Bukti">
                    <img src="${fotoUrl}" class="w-full h-full object-cover">
                </div>
            </td>
            <td class="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">${item.keterangan || '-'}</td>
            <td class="py-3 px-2 text-center whitespace-nowrap">
                <button onclick="deleteAbsensi(${item.id})" title="Hapus Rekaman" class="text-gray-400 hover:text-red-500 p-1.5 transition">
                    <i class="fas fa-trash-alt text-xs"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

function filterAbsensiStaf() {
    const q = (document.getElementById('filter-absensi-search')?.value || '').toLowerCase().trim();
    if (!q) {
        renderAbsensiTable(allAbsensiRecords);
        return;
    }
    const filtered = allAbsensiRecords.filter(r => 
        (r.nama_staff || '').toLowerCase().includes(q) || 
        (r.keterangan || '').toLowerCase().includes(q) ||
        (r.status || '').toLowerCase().includes(q)
    );
    renderAbsensiTable(filtered);
}
window.filterAbsensiStaf = filterAbsensiStaf;

function openModalCatatAbsensi() {
    const tglInput = document.getElementById('absensi-input-tanggal');
    if (tglInput) tglInput.value = new Date().toISOString().slice(0, 10);
    openModal('modal-catat-absensi');
}
window.openModalCatatAbsensi = openModalCatatAbsensi;

async function submitAbsensi(e) {
    e.preventDefault();
    const nama_staff = document.getElementById('absensi-nama-staff').value;
    const tanggal = document.getElementById('absensi-input-tanggal').value;
    const jam_masuk = document.getElementById('absensi-input-jam-masuk').value;
    const jam_pulang = document.getElementById('absensi-input-jam-pulang').value;
    const status = document.getElementById('absensi-input-status').value;
    const keterangan = document.getElementById('absensi-input-keterangan').value;
    const fotoFile = document.getElementById('absensi-input-foto').files[0];

    let fotoBase64 = 'haltea-logo.png';
    if (fotoFile) {
        fotoBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('haltea-logo.png');
            reader.readAsDataURL(fotoFile);
        });
    }

    try {
        const res = await apiFetch('/api/absensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nama_staff, tanggal, jam_masuk, jam_pulang, status, keterangan, foto: fotoBase64 })
        });
        if (!res.ok) throw new Error('Gagal mencatat absensi');
        showToast('Kehadiran staff berhasil dicatat.', 'success');
        closeModal('modal-catat-absensi');
        await loadAbsensiStaf();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.submitAbsensi = submitAbsensi;

async function deleteAbsensi(id) {
    if (!confirm('Hapus rekaman absensi ini?')) return;
    try {
        const res = await apiFetch(`/api/absensi/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus rekaman');
        showToast('Rekaman absensi telah dihapus.', 'success');
        await loadAbsensiStaf();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.deleteAbsensi = deleteAbsensi;

function previewFotoAbsensi(url, caption) {
    const imgEl = document.getElementById('preview-foto-img');
    const capEl = document.getElementById('preview-foto-caption');
    if (imgEl) imgEl.src = url;
    if (capEl) capEl.textContent = caption || '';
    openModal('modal-preview-foto-absensi');
}
window.previewFotoAbsensi = previewFotoAbsensi;

// ============================================================
// 4. ABSENSI KARYAWAN / KASIR (PERSONAL CHECK-IN & LEAVE)
// ============================================================
let currentKaryawanSelfieBase64 = null;
let currentKaryawanAbsensiTab = 'hadir';

function switchKaryawanAbsensiTab(tab) {
    currentKaryawanAbsensiTab = tab;
    const btnHadir = document.getElementById('tab-btn-absen-hadir');
    const btnIzin = document.getElementById('tab-btn-ajukan-izin');
    const contentHadir = document.getElementById('karyawan-tab-content-hadir');
    const contentIzin = document.getElementById('karyawan-tab-content-izin');

    if (!btnHadir || !btnIzin || !contentHadir || !contentIzin) return;

    if (tab === 'hadir') {
        btnHadir.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs';
        btnIzin.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition text-gray-500 hover:text-gray-900 dark:hover:text-white';
        contentHadir.classList.remove('hidden');
        contentIzin.classList.add('hidden');
    } else {
        btnIzin.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition bg-white dark:bg-gray-700 text-blue-600 dark:text-white shadow-xs';
        btnHadir.className = 'py-2.5 px-3 rounded-xl text-xs font-bold transition text-gray-500 hover:text-gray-900 dark:hover:text-white';
        contentIzin.classList.remove('hidden');
        contentHadir.classList.add('hidden');
    }
}
window.switchKaryawanAbsensiTab = switchKaryawanAbsensiTab;

async function handleKaryawanSelfieChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const previewBox = document.getElementById('karyawan-selfie-preview-box');
    const previewImg = document.getElementById('karyawan-selfie-img-preview');

    try {
        currentKaryawanSelfieBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve('haltea-logo.png');
            reader.readAsDataURL(file);
        });

        if (previewImg) {
            previewImg.src = currentKaryawanSelfieBase64;
            previewImg.classList.remove('hidden');
        }
        if (previewBox) previewBox.classList.add('hidden');
        showToast('Foto selfie berhasil dimuat.', 'info');
    } catch (err) {
        showToast('Gagal memproses foto.', 'error');
    }
}
window.handleKaryawanSelfieChange = handleKaryawanSelfieChange;

async function loadAbsensiKaryawan() {
    const today = new Date().toISOString().slice(0, 10);
    const todayBadge = document.getElementById('karyawan-absensi-today-badge');
    if (todayBadge) todayBadge.textContent = today;

    const userNameEl = document.getElementById('karyawan-absensi-user-name');
    const userRoleEl = document.getElementById('karyawan-absensi-user-role');
    const avatarInit = document.getElementById('karyawan-absensi-avatar-initial');

    const curName = currentUser?.nama || 'Kasir Haltea (Karyawan)';
    const curRole = currentUser?.role === 'admin' ? 'Admin' : 'Kasir';
    if (userNameEl) userNameEl.textContent = curName;
    if (userRoleEl) userRoleEl.textContent = curRole;
    if (avatarInit) {
        const initials = curName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'KA';
        avatarInit.textContent = initials;
    }

    try {
        // Load standard work hour
        const resJk = await apiFetch('/api/jamkerja');
        let jamMasukStd = '08:00:00';
        if (resJk.ok) {
            const jk = await resJk.json();
            if (jk.jam_masuk) jamMasukStd = jk.jam_masuk;
        }
        const alertJamMasuk = document.getElementById('karyawan-jam-masuk-alert');
        if (alertJamMasuk) alertJamMasuk.textContent = `Jam Masuk Standar: ${jamMasukStd}`;

        // Load all attendance records
        const resAbs = await apiFetch('/api/absensi');
        let myRecords = [];
        if (resAbs.ok) {
            const allAbs = await resAbs.json();
            // Filter by my name or show relevant employee records
            myRecords = allAbs.filter(a => a.nama_staff.toLowerCase().includes(curName.toLowerCase()) || curRole === 'Admin');
            if (myRecords.length === 0) myRecords = allAbs;
        }

        renderKaryawanAbsensiTable(myRecords);

        // Calculate monthly leave count for this employee
        const curMonth = today.slice(0, 7); // e.g. "2026-08"
        const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
        const curDateObj = new Date();
        const monthLabel = monthNames[curDateObj.getMonth()] + " " + curDateObj.getFullYear();

        const izinThisMonth = myRecords.filter(r => r.status === 'Izin' && (r.tanggal || '').startsWith(curMonth));
        const izinCount = izinThisMonth.length;

        const izinBox = document.getElementById('karyawan-izin-summary-box');
        const izinMonthLabel = document.getElementById('karyawan-izin-month-label');
        const izinCountBadge = document.getElementById('karyawan-izin-count-badge');

        if (izinBox && izinCountBadge) {
            if (izinMonthLabel) izinMonthLabel.textContent = monthLabel;
            if (izinCount > 0) {
                izinCountBadge.textContent = `${izinCount}x Izin`;
                izinBox.classList.remove('hidden');
            } else {
                izinBox.classList.add('hidden');
            }
        }

        // Check if I already checked in today
        const todayRec = myRecords.find(a => a.tanggal === today);
        const actionBox = document.getElementById('karyawan-absen-actions');
        if (actionBox) {
            if (todayRec) {
                if (todayRec.jam_pulang && todayRec.jam_pulang !== '-' && todayRec.jam_pulang !== '') {
                    actionBox.innerHTML = `
                        <div class="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-center">
                            <i class="fas fa-check-circle text-emerald-500 text-xl mb-1"></i>
                            <p class="text-xs font-bold text-emerald-700 dark:text-emerald-300">Absensi Hari Ini Sudah Lengkap</p>
                            <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Masuk: ${todayRec.jam_masuk} • Pulang: ${todayRec.jam_pulang}</p>
                        </div>
                    `;
                } else {
                    actionBox.innerHTML = `
                        <div class="space-y-2.5">
                            <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center text-xs text-blue-700 dark:text-blue-300 font-semibold">
                                Sudah Check-in Pukul ${todayRec.jam_masuk} (${todayRec.status})
                            </div>
                            <button type="button" onclick="submitKaryawanCheckOut(${todayRec.id})"
                                class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm transition active:scale-[0.98]">
                                <i class="fas fa-sign-out-alt"></i>
                                <span>Absen Pulang (Check-out)</span>
                            </button>
                        </div>
                    `;
                }
            } else {
                actionBox.innerHTML = `
                    <button type="button" onclick="submitKaryawanCheckIn()" id="btn-karyawan-checkin"
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm transition active:scale-[0.98]">
                        <i class="fas fa-sign-in-alt"></i>
                        <span>Absen Masuk (Check-in)</span>
                    </button>
                `;
            }
        }
    } catch (e) {
        showToast('Gagal memuat absensi saya.', 'error');
    }
}
window.loadAbsensiKaryawan = loadAbsensiKaryawan;

function renderKaryawanAbsensiTable(records) {
    const tbody = document.getElementById('table-karyawan-absensi-body');
    if (!tbody) return;

    if (!records || records.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="py-12 text-center text-gray-400 dark:text-gray-500 font-medium">
                    Belum ada riwayat kehadiran.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = records.map(item => {
        let statusBadgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        if (item.status === 'Terlambat') statusBadgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
        else if (item.status === 'Izin') statusBadgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        else if (item.status === 'Sakit') statusBadgeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        else if (item.status === 'Alpha') statusBadgeClass = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';

        return `
        <tr class="hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition">
            <td class="py-3 px-3 font-mono text-gray-600 dark:text-gray-400 whitespace-nowrap">${item.tanggal}</td>
            <td class="py-3 px-3 text-center whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadgeClass}">
                    ${item.status}
                </span>
            </td>
            <td class="py-3 px-3 text-center font-mono font-semibold text-gray-700 dark:text-gray-300">${item.jam_masuk || '-'}</td>
            <td class="py-3 px-3 text-center font-mono font-semibold text-gray-700 dark:text-gray-300">${item.jam_pulang || '-'}</td>
            <td class="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">${item.keterangan || '-'}</td>
        </tr>
        `;
    }).join('');
}

async function submitKaryawanCheckIn() {
    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();
    const nowTimeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    // Fetch work hours
    let stdMasuk = '08:00:00';
    try {
        const resJk = await apiFetch('/api/jamkerja');
        if (resJk.ok) {
            const jk = await resJk.json();
            if (jk.jam_masuk) stdMasuk = jk.jam_masuk;
        }
    } catch (e) {}

    // Check if late
    const isLate = nowTimeStr > stdMasuk;
    const status = isLate ? 'Terlambat' : 'Hadir';
    const curName = currentUser?.nama || 'Kasir Haltea (Karyawan)';
    const keterangan = isLate ? `Check-in terlambat (setelah ${stdMasuk})` : 'Hadir tepat waktu';
    const foto = currentKaryawanSelfieBase64 || 'haltea-logo.png';

    try {
        const res = await apiFetch('/api/absensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama_staff: curName,
                tanggal: today,
                jam_masuk: nowTimeStr,
                jam_pulang: '-',
                status,
                keterangan,
                foto
            })
        });
        if (!res.ok) throw new Error('Gagal melakukan absensi masuk');
        showToast(`Absensi Masuk Berhasil! Status: ${status} (${nowTimeStr})`, 'success');
        await loadAbsensiKaryawan();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.submitKaryawanCheckIn = submitKaryawanCheckIn;

async function submitKaryawanCheckOut(recordId) {
    const now = new Date();
    const nowTimeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS

    try {
        // Update mock storage directly or via API
        let absList = getMockStorage('absensi', DEFAULT_ABSENSI);
        const idx = absList.findIndex(x => x.id === recordId);
        if (idx !== -1) {
            absList[idx].jam_pulang = nowTimeStr;
            setMockStorage('absensi', absList);
        }
        showToast(`Absensi Pulang (Check-out) Berhasil! (${nowTimeStr})`, 'success');
        await loadAbsensiKaryawan();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.submitKaryawanCheckOut = submitKaryawanCheckOut;

async function submitKaryawanIzin() {
    const today = new Date().toISOString().slice(0, 10);
    const alasan = document.getElementById('karyawan-izin-alasan').value.trim();
    if (!alasan) {
        showToast('Harap tuliskan alasan izin Anda.', 'warn');
        return;
    }

    const curName = currentUser?.nama || 'Kasir Haltea (Karyawan)';

    try {
        const res = await apiFetch('/api/absensi', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama_staff: curName,
                tanggal: today,
                jam_masuk: '-',
                jam_pulang: '-',
                status: 'Izin',
                keterangan: `Izin: ${alasan}`,
                foto: 'haltea-logo.png'
            })
        });
        if (!res.ok) throw new Error('Gagal mengajukan izin');
        showToast('Permohonan izin Anda berhasil dikirim ke Admin.', 'success');
        document.getElementById('karyawan-izin-alasan').value = '';
        switchKaryawanAbsensiTab('hadir');
        await loadAbsensiKaryawan();
    } catch (err) {
        showToast(err.message, 'error');
    }
}
window.submitKaryawanIzin = submitKaryawanIzin;


