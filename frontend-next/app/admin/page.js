'use client';

import { useState, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Colour palette (light) ───────────────────────────────────────────────
const C = {
    bg: '#F8F6F4',
    surface: '#FFFFFF',
    border: '#EDE8E4',
    sidebar: '#2D2825',
    sidebarActive: '#3D3330',
    accent: '#C9A99D',
    text: '#2D2825',
    muted: '#7A726D',
    danger: '#DC2626',
};

const STATUS_COLORS = {
    processing: { bg: '#FFF7ED', color: '#C2410C' },
    shipped: { bg: '#EFF6FF', color: '#1D4ED8' },
    delivered: { bg: '#F0FDF4', color: '#15803D' },
    cancelled: { bg: '#FEF2F2', color: '#B91C1C' },
    pending: { bg: '#FFF7ED', color: '#C2410C' },
    approved: { bg: '#F0FDF4', color: '#15803D' },
    rejected: { bg: '#FEF2F2', color: '#B91C1C' },
    completed: { bg: '#F5F3FF', color: '#6D28D9' },
};

function Badge({ status }) {
    const s = STATUS_COLORS[status] || { bg: '#f5f5f5', color: '#333' };
    return <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize', backgroundColor: s.bg, color: s.color, letterSpacing: '0.04em' }}>{status}</span>;
}

function StatCard({ label, value, sub, accent }) {
    return (
        <div style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '1.5rem', borderLeft: `4px solid ${accent}` }}>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, marginBottom: '0.4rem' }}>{label}</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700, color: C.text, lineHeight: 1 }}>{value}</p>
            {sub && <p style={{ fontSize: '0.75rem', color: C.muted, marginTop: '0.35rem' }}>{sub}</p>}
        </div>
    );
}

const th = { padding: '0.7rem 1rem', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.muted, fontWeight: 600, textAlign: 'left', borderBottom: `1px solid ${C.border}`, background: C.bg, whiteSpace: 'nowrap' };
const td = { padding: '0.9rem 1rem', fontSize: '0.875rem', color: C.text, borderBottom: `1px solid ${C.border}`, verticalAlign: 'middle' };

const cleanTitle = t => t ? t.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/gi, '').split(' - ')[0].trim() : '—';

export default function AdminPage() {
    // ─── Auth state ───
    const [authed, setAuthed] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && sessionStorage.getItem('aura_admin') === 'true') {
            setAuthed(true);
        }
        setAuthChecked(true);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);
        try {
            const res = await fetch(`${API}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            const data = await res.json();
            if (data.success) {
                sessionStorage.setItem('aura_admin', 'true');
                setAuthed(true);
            } else {
                setLoginError(data.message || 'Invalid password.');
            }
        } catch {
            setLoginError('Connection failed. Is the server running?');
        } finally { setLoginLoading(false); }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('aura_admin');
        setAuthed(false);
        setPassword('');
    };

    const [tab, setTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Per-tab state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedRow, setExpandedRow] = useState(null);

    // Products tab state
    const [productSearch, setProductSearch] = useState('');
    const [editingPrice, setEditingPrice] = useState({}); // { id: newPriceStr }
    const [savingId, setSavingId] = useState(null);

    const [productSearching, setProductSearching] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [sRes, oRes, rRes] = await Promise.all([
                fetch(`${API}/orders/stats`),
                fetch(`${API}/orders`),
                fetch(`${API}/returns`),
            ]);
            setStats(await sRes.json());
            setOrders(await oRes.json());
            setReturns(await rRes.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    // Search products on-demand when user types
    useEffect(() => {
        if (!productSearch.trim()) { setProducts([]); return; }
        const timer = setTimeout(async () => {
            setProductSearching(true);
            try {
                const res = await fetch(`${API}/products?keyword=${encodeURIComponent(productSearch.trim())}&limit=30`);
                const data = await res.json();
                setProducts(data.products || []);
            } catch (e) { console.error(e); }
            finally { setProductSearching(false); }
        }, 350); // 350ms debounce
        return () => clearTimeout(timer);
    }, [productSearch]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const updateOrderStatus = async (id, status) => {
        await fetch(`${API}/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
        setOrders(prev => prev.map(o => o._id === id ? { ...o, orderStatus: status } : o));
        fetchAll();
    };

    const updateReturnStatus = async (id, status) => {
        await fetch(`${API}/returns/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
        setReturns(prev => prev.map(r => r._id === id ? { ...r, status } : r));
        fetchAll();
    };

    const savePrice = async (id) => {
        const newPrice = editingPrice[id];
        if (!newPrice) return;
        setSavingId(id);
        try {
            const res = await fetch(`${API}/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ price: newPrice })
            });
            if (res.ok) {
                setProducts(prev => prev.map(p => p._id === id ? { ...p, price: newPrice } : p));
                setEditingPrice(prev => { const n = { ...prev }; delete n[id]; return n; });
            }
        } finally { setSavingId(null); }
    };

    const filteredOrders = orders.filter(o => {
        const q = search.toLowerCase();
        const matchSearch = !q || o.orderNumber?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q) || `${o.shippingAddress?.firstName} ${o.shippingAddress?.lastName}`.toLowerCase().includes(q);
        return matchSearch && (statusFilter === 'all' || o.orderStatus === statusFilter);
    });

    const filteredReturns = returns.filter(r => {
        const q = search.toLowerCase();
        const matchSearch = !q || r.orderNumber?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.refNumber?.toLowerCase().includes(q);
        return matchSearch && (statusFilter === 'all' || r.status === statusFilter);
    });

    // Products come pre-filtered from the API — no client-side filter needed
    const filteredProducts = products;

    const navItems = [
        { id: 'overview', label: 'Overview', icon: '⬡' },
        { id: 'orders', label: 'Orders', icon: '◉', badge: stats?.ordersByStatus?.processing },
        { id: 'returns', label: 'Returns', icon: '↩', badge: stats?.pendingReturns },
        { id: 'products', label: 'Products', icon: '◈' },
    ];

    const switchTab = (id) => { setTab(id); setSearch(''); setStatusFilter('all'); setExpandedRow(null); };

    return (
        <>
            {/* ─── Login Gate ─────────────────────────────────────── */}
            {(!authChecked || !authed) ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '380px', padding: '2.5rem', backgroundColor: C.surface, borderRadius: '16px', border: `1px solid ${C.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '2rem', color: C.accent, margin: 0 }}>Aura.</p>
                            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: C.muted, marginTop: '4px' }}>Admin Dashboard</p>
                        </div>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                            autoFocus
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: `1px solid ${loginError ? C.danger : C.border}`, backgroundColor: C.bg, color: C.text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', marginBottom: '0.75rem' }}
                        />
                        {loginError && <p style={{ fontSize: '0.8rem', color: C.danger, marginBottom: '0.75rem' }}>{loginError}</p>}
                        <button type="submit" disabled={loginLoading || !password} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: 'none', backgroundColor: C.accent, color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', opacity: loginLoading || !password ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                            {loginLoading ? 'Verifying…' : 'Sign In'}
                        </button>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: C.bg, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

                    {/* ─── Sidebar ─────────────────────────────────────────────── */}
                    <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '210px', backgroundColor: C.sidebar, display: 'flex', flexDirection: 'column', padding: '1.75rem 1.25rem', zIndex: 50 }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.6rem', color: C.accent, margin: 0 }}>Aura.</p>
                            <p style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>Admin</p>
                        </div>

                        <nav style={{ flex: 1 }}>
                            {navItems.map(({ id, label, icon, badge }) => {
                                const active = tab === id;
                                return (
                                    <button key={id} onClick={() => switchTab(id)} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', width: '100%', padding: '0.65rem 0.9rem', borderRadius: '9px', border: 'none', cursor: 'pointer', backgroundColor: active ? 'rgba(201,169,157,0.18)' : 'transparent', color: active ? C.accent : 'rgba(255,255,255,0.55)', fontSize: '0.875rem', fontWeight: active ? 600 : 400, marginBottom: '4px', textAlign: 'left', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                                        <span style={{ fontSize: '1rem', width: '18px', textAlign: 'center' }}>{icon}</span>
                                        <span style={{ flex: 1 }}>{label}</span>
                                        {badge > 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, backgroundColor: C.accent, color: '#fff', borderRadius: '10px', padding: '2px 6px' }}>{badge}</span>}
                                    </button>
                                );
                            })}
                        </nav>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
                            <a href="/" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>← Back to Store</a>
                            <button onClick={handleLogout} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⏻ Logout</button>
                        </div>
                    </aside>

                    {/* ─── Main ────────────────────────────────────────────────── */}
                    <main style={{ marginLeft: '210px', flex: 1, padding: '2.5rem', overflow: 'auto' }}>

                        {/* Header */}
                        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: C.text, margin: 0 }}>
                                    {{ overview: 'Overview', orders: 'Orders', returns: 'Return Requests', products: 'Products' }[tab]}
                                </h1>
                                <p style={{ fontSize: '0.8rem', color: C.muted, marginTop: '2px' }}>{new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <button onClick={fetchAll} style={{ padding: '0.5rem 1rem', border: `1px solid ${C.border}`, borderRadius: '8px', backgroundColor: C.surface, color: C.muted, cursor: 'pointer', fontSize: '0.8rem' }}>↻ Refresh</button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '5rem', color: C.muted }}>Loading…</div>
                        ) : (
                            <>
                                {/* ══ OVERVIEW ══════════════════════════════════════════ */}
                                {tab === 'overview' && stats && (
                                    <>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                            <StatCard label="Total Orders" value={stats.totalOrders} sub={`${stats.ordersByStatus?.shipped || 0} shipped`} accent="#C9A99D" />
                                            <StatCard label="Total Revenue" value={`₨ ${Math.round(stats.totalRevenue).toLocaleString()}`} sub="All time" accent="#86EFAC" />
                                            <StatCard label="Pending Returns" value={stats.pendingReturns} sub={`${stats.totalReturns} total`} accent="#FCA5A5" />
                                            <StatCard label="Delivered" value={stats.ordersByStatus?.delivered || 0} sub={`${stats.ordersByStatus?.processing || 0} processing`} accent="#93C5FD" />
                                        </div>

                                        {/* Status breakdown */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                            <div style={{ backgroundColor: C.surface, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${C.border}` }}>
                                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text, marginBottom: '1.25rem' }}>Order Status Breakdown</h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    {['processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                                        <div key={s} style={{ textAlign: 'center', padding: '1rem', borderRadius: '10px', backgroundColor: STATUS_COLORS[s]?.bg }}>
                                                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: STATUS_COLORS[s]?.color }}>{stats.ordersByStatus?.[s] || 0}</p>
                                                            <p style={{ fontSize: '0.7rem', textTransform: 'capitalize', color: STATUS_COLORS[s]?.color, marginTop: '2px' }}>{s}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Recent orders */}
                                            <div style={{ backgroundColor: C.surface, borderRadius: '14px', padding: '1.5rem', border: `1px solid ${C.border}` }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: C.text }}>Recent Orders</h3>
                                                    <button onClick={() => switchTab('orders')} style={{ fontSize: '0.75rem', color: C.accent, background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
                                                </div>
                                                {orders.slice(0, 6).map(o => (
                                                    <div key={o._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: `1px solid ${C.border}` }}>
                                                        <div>
                                                            <p style={{ fontWeight: 600, fontSize: '0.8rem', color: C.text }}>{o.orderNumber}</p>
                                                            <p style={{ fontSize: '0.72rem', color: C.muted }}>{o.shippingAddress?.firstName} {o.shippingAddress?.lastName}</p>
                                                        </div>
                                                        <Badge status={o.orderStatus} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ══ ORDERS ════════════════════════════════════════════ */}
                                {tab === 'orders' && (
                                    <>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order #, name, email…" style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.9rem', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: '0.875rem', outline: 'none' }} />
                                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: '0.875rem', cursor: 'pointer' }}>
                                                {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                            </select>
                                        </div>

                                        <div style={{ backgroundColor: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead><tr>{['Order #', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Update Status', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                                    <tbody>
                                                        {filteredOrders.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: C.muted, padding: '3rem' }}>No orders found.</td></tr>}
                                                        {filteredOrders.map(o => (
                                                            <>
                                                                <tr key={o._id} onClick={() => setExpandedRow(expandedRow === o._id ? null : o._id)} style={{ cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                                                    <td style={td}><b style={{ color: C.accent }}>{o.orderNumber}</b></td>
                                                                    <td style={td}>{o.shippingAddress?.firstName} {o.shippingAddress?.lastName}</td>
                                                                    <td style={{ ...td, color: C.muted, fontSize: '0.8rem' }}>{o.email}</td>
                                                                    <td style={{ ...td, color: C.muted }}>{o.orderItems?.length}</td>
                                                                    <td style={td}><b>₨ {Math.round(o.totalAmount || 0).toLocaleString()}</b></td>
                                                                    <td style={td}><Badge status={o.orderStatus} /></td>
                                                                    <td style={td} onClick={e => e.stopPropagation()}>
                                                                        <select value={o.orderStatus} onChange={e => updateOrderStatus(o._id, e.target.value)} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                            {['processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td style={{ ...td, color: C.muted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                                </tr>
                                                                {expandedRow === o._id && (
                                                                    <tr key={o._id + '_exp'}>
                                                                        <td colSpan={8} style={{ padding: '0 1rem 1rem', backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                                                                            <div style={{ padding: '1.25rem', backgroundColor: C.surface, borderRadius: '10px', border: `1px solid ${C.border}` }}>
                                                                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: '0.75rem' }}>Items Ordered</p>
                                                                                {o.orderItems?.map((item, i) => (
                                                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0', borderBottom: `1px solid ${C.border}`, fontSize: '0.85rem' }}>
                                                                                        <span style={{ color: C.text }}>{cleanTitle(item.title)}</span>
                                                                                        <span style={{ color: C.muted }}>× {item.quantity} &nbsp; {item.price}</span>
                                                                                    </div>
                                                                                ))}
                                                                                <p style={{ marginTop: '0.75rem', fontSize: '0.78rem', color: C.muted }}>📍 {o.shippingAddress?.address}, {o.shippingAddress?.city}</p>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div style={{ padding: '0.6rem 1rem', borderTop: `1px solid ${C.border}`, fontSize: '0.75rem', color: C.muted }}>
                                                {filteredOrders.length} of {orders.length} orders
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ══ RETURNS ═══════════════════════════════════════════ */}
                                {tab === 'returns' && (
                                    <>
                                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ref #, order #, email…" style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.9rem', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: '0.875rem', outline: 'none' }} />
                                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '0.6rem 0.9rem', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: '0.875rem', cursor: 'pointer' }}>
                                                {['all', 'pending', 'approved', 'rejected', 'completed'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                            </select>
                                        </div>

                                        <div style={{ backgroundColor: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <thead><tr>{['Ref #', 'Order #', 'Customer', 'Reason', 'Resolution', 'Status', 'Update', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                                    <tbody>
                                                        {filteredReturns.length === 0 && <tr><td colSpan={8} style={{ ...td, textAlign: 'center', color: C.muted, padding: '3rem' }}>No return requests found.</td></tr>}
                                                        {filteredReturns.map(r => (
                                                            <>
                                                                <tr key={r._id} onClick={() => setExpandedRow(expandedRow === r._id ? null : r._id)} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                                                                    <td style={td}><b style={{ color: C.accent }}>{r.refNumber}</b></td>
                                                                    <td style={{ ...td, fontSize: '0.82rem' }}>{r.orderNumber}</td>
                                                                    <td style={td}>{r.firstName} {r.lastName || ''}</td>
                                                                    <td style={{ ...td, color: C.muted, maxWidth: '140px' }}><span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }} title={r.reason}>{r.reason}</span></td>
                                                                    <td style={{ ...td, color: C.muted, fontSize: '0.8rem' }}>{r.preferredResolution || '—'}</td>
                                                                    <td style={td}><Badge status={r.status} /></td>
                                                                    <td style={td} onClick={e => e.stopPropagation()}>
                                                                        <select value={r.status} onChange={e => updateReturnStatus(r._id, e.target.value)} style={{ padding: '0.35rem 0.6rem', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.text, fontSize: '0.8rem', cursor: 'pointer' }}>
                                                                            {['pending', 'approved', 'rejected', 'completed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                                                        </select>
                                                                    </td>
                                                                    <td style={{ ...td, color: C.muted, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                                                </tr>
                                                                {expandedRow === r._id && (
                                                                    <tr key={r._id + '_exp'}>
                                                                        <td colSpan={8} style={{ padding: '0 1rem 1rem', backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                                                                            <div style={{ padding: '1.25rem', backgroundColor: C.surface, borderRadius: '10px', border: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                                                                <div>
                                                                                    <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: '0.5rem' }}>Items to Return</p>
                                                                                    <pre style={{ fontSize: '0.85rem', color: C.text, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{r.returnItems}</pre>
                                                                                </div>
                                                                                <div>
                                                                                    <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: '0.4rem' }}>Condition</p>
                                                                                    <p style={{ fontSize: '0.875rem', color: C.text, marginBottom: '1rem' }}>{r.condition || '—'}</p>
                                                                                    <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: '0.4rem' }}>Contact</p>
                                                                                    <p style={{ fontSize: '0.875rem', color: C.accent }}>{r.email}</p>
                                                                                    {r.phone && <p style={{ fontSize: '0.85rem', color: C.muted }}>{r.phone}</p>}
                                                                                </div>
                                                                                <div>
                                                                                    <p style={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: C.muted, marginBottom: '0.4rem' }}>Additional Notes</p>
                                                                                    <p style={{ fontSize: '0.875rem', color: C.text, lineHeight: 1.6 }}>{r.additionalNotes || '—'}</p>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div style={{ padding: '0.6rem 1rem', borderTop: `1px solid ${C.border}`, fontSize: '0.75rem', color: C.muted }}>
                                                {filteredReturns.length} of {returns.length} return requests
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* ══ PRODUCTS ══════════════════════════════════════════ */}
                                {tab === 'products' && (
                                    <>
                                        {/* Search bar */}
                                        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: C.muted, fontSize: '0.9rem', pointerEvents: 'none' }}>🔍</span>
                                            <input
                                                autoFocus
                                                value={productSearch}
                                                onChange={e => setProductSearch(e.target.value)}
                                                placeholder="Search a product to edit its price…"
                                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.4rem', borderRadius: '10px', border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.text, fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                                            />
                                            {productSearching && <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: C.muted }}>Searching…</span>}
                                        </div>

                                        {/* Empty state */}
                                        {!productSearch.trim() && (
                                            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: C.muted }}>
                                                <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🏷️</p>
                                                <p style={{ fontWeight: 600, color: C.text, marginBottom: '0.4rem' }}>Search for a product</p>
                                                <p style={{ fontSize: '0.875rem' }}>Type a product name above to find and edit its price.</p>
                                            </div>
                                        )}

                                        {/* No results */}
                                        {productSearch.trim() && !productSearching && filteredProducts.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: C.muted }}>
                                                <p style={{ fontSize: '0.9rem' }}>No products found for <strong style={{ color: C.text }}>&ldquo;{productSearch}&rdquo;</strong></p>
                                            </div>
                                        )}

                                        {/* Results table */}
                                        {filteredProducts.length > 0 && (
                                            <div style={{ backgroundColor: C.surface, borderRadius: '14px', border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                                                <div style={{ overflowX: 'auto' }}>
                                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                        <thead><tr>{['Product', 'Category', 'Current Price', 'New Price', 'Action'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                                                        <tbody>
                                                            {filteredProducts.map(p => {
                                                                const isEditing = editingPrice[p._id] !== undefined;
                                                                return (
                                                                    <tr key={p._id} onMouseEnter={e => e.currentTarget.style.backgroundColor = C.bg} onMouseLeave={e => e.currentTarget.style.backgroundColor = ''} style={{ transition: 'background 0.1s' }}>
                                                                        <td style={{ ...td, maxWidth: '340px' }}>
                                                                            <span style={{ fontSize: '0.875rem', color: C.text, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cleanTitle(p.title)}>{cleanTitle(p.title)}</span>
                                                                        </td>
                                                                        <td style={{ ...td, color: C.muted, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{p.subcategory || p.category || '—'}</td>
                                                                        <td style={td}><span style={{ fontWeight: 600, color: isEditing ? C.muted : C.text }}>{p.price || '—'}</span></td>
                                                                        <td style={td}>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="e.g. Rs. 1,499"
                                                                                value={editingPrice[p._id] ?? ''}
                                                                                onChange={e => setEditingPrice(prev => ({ ...prev, [p._id]: e.target.value }))}
                                                                                style={{ padding: '0.35rem 0.65rem', borderRadius: '7px', border: `1px solid ${isEditing ? C.accent : C.border}`, backgroundColor: C.bg, color: C.text, fontSize: '0.85rem', outline: 'none', width: '150px', transition: 'border-color 0.2s' }}
                                                                            />
                                                                        </td>
                                                                        <td style={td}>
                                                                            {isEditing ? (
                                                                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                                                    <button onClick={() => savePrice(p._id)} disabled={savingId === p._id} style={{ padding: '0.35rem 0.8rem', borderRadius: '7px', border: 'none', backgroundColor: C.accent, color: '#fff', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600, opacity: savingId === p._id ? 0.7 : 1 }}>
                                                                                        {savingId === p._id ? '…' : 'Save'}
                                                                                    </button>
                                                                                    <button onClick={() => setEditingPrice(prev => { const n = { ...prev }; delete n[p._id]; return n; })} style={{ padding: '0.35rem 0.8rem', borderRadius: '7px', border: `1px solid ${C.border}`, backgroundColor: C.surface, color: C.muted, fontSize: '0.8rem', cursor: 'pointer' }}>✕</button>
                                                                                </div>
                                                                            ) : (
                                                                                <span style={{ fontSize: '0.75rem', color: C.muted }}>Type a price to edit</span>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div style={{ padding: '0.6rem 1rem', borderTop: `1px solid ${C.border}`, fontSize: '0.75rem', color: C.muted }}>
                                                    {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for &ldquo;{productSearch}&rdquo;
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </main>
                </div>
            )}
        </>
    );
}
