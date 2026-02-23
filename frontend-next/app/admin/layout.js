// Standalone layout for /admin — bypasses the store layout (no navbar/footer)
export const metadata = {
    title: 'Admin — Aura',
};

export default function AdminLayout({ children }) {
    return children;
}
