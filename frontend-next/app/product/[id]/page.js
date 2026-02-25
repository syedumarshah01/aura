import InteractiveClientWrapper from '../../../components/InteractiveClientWrapper';
import RelatedProducts from '../../../components/RelatedProducts';
import ProductClientBoundary from '../../../components/ProductClientBoundary';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const { id } = params;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${id}`, { cache: 'no-store' });
        if (!response.ok) return { title: 'Product Not Found | Ophélie' };

        const product = await response.json();
        const cleanTitle = product.title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim();

        return {
            title: `${cleanTitle} | Ophélie Premium Beauty`,
            description: product.description || `Discover ${cleanTitle}, a premium addition to your daily ritual.`,
            openGraph: {
                title: cleanTitle,
                description: product.description || `Discover ${cleanTitle}, a premium addition to your daily ritual.`,
                images: product.images && product.images.length > 0 ? [{ url: product.images[0] }] : [],
                type: 'website',
            },
        };
    } catch (e) {
        return { title: 'Product | Ophélie' };
    }
}

export default async function ProductPage({ params }) {
    const { id } = params;

    let product = null;
    let error = null;

    try {
        // Fetch data natively on the Server before sending HTML to the browser
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/products/${id}`, { cache: 'no-store' });

        if (!response.ok) {
            if (response.status === 404) return notFound();
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        product = await response.json();
    } catch (err) {
        console.error("Could not fetch product:", err);
        error = "Failed to load product details.";
    }

    if (error || !product) {
        return (
            <InteractiveClientWrapper>
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <h2>Product Not Found</h2>
                    <p style={{ color: 'var(--clr-text-muted)' }}>{error || "This item may have been removed."}</p>
                </div>
            </InteractiveClientWrapper>
        );
    }

    const cleanTitle = product.title.replace(/^(?:Buy|Purchase|Order)\s+/i, '').replace(/\s*(?:-|\|)?\s*(?:Online at best price in pakistan|naheed\.pk)\s*/ig, '').trim();
    const formatPrice = (priceStr) => priceStr || 'Price TBA';
    const isSoldOut = !product.in_stock;

    return (
        <InteractiveClientWrapper>
            <main style={{ paddingTop: '6rem', backgroundColor: 'var(--clr-bg)' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '4rem', padding: '4rem 1rem' }}>

                    {/* Offload the heavy interactive states (Image Gallery toggles, Add to Cart context, Accordions) into a tightly bounded Client Component */}
                    <ProductClientBoundary
                        product={product}
                        cleanTitle={cleanTitle}
                        formattedPrice={formatPrice(product.price)}
                        isSoldOut={isSoldOut}
                    />

                </div>

                <div style={{ backgroundColor: 'var(--clr-surface)', padding: '4rem 0' }}>
                    <RelatedProducts currentProductId={product._id} subcategory={product.subcategory} />
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
