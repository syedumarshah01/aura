import InfiniteProductsGrid from '../../components/InfiniteProductsGrid';
import InteractiveClientWrapper from '../../components/InteractiveClientWrapper';

// Generate metadata specifically for the collections page
export const metadata = {
    title: 'All Collections | Aura Premium Beauty',
    description: 'Explore our full catalog of premium beauty, cosmetics, and skincare products.',
};

export default function CollectionsPage() {
    return (
        <InteractiveClientWrapper>
            <main>
                {/* Collection Hero */}
                <section className="hero" style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: 'var(--clr-bg)' }}>
                    <div className="container" style={{ paddingTop: '8rem' }}>
                        <span className="fade-in" style={{ display: 'block', marginBottom: '1rem', color: 'var(--clr-primary-dark)', letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
                            The Full Catalog
                        </span>
                        <h1 className="fade-in-up" style={{ animationDelay: '0.2s', fontSize: 'clamp(2.5rem, 5vw, 4rem)' }}>
                            Our <em>Collections</em>
                        </h1>
                        <p className="hero-text fade-in-up" style={{ animationDelay: '0.4s', maxWidth: '600px', margin: '1.5rem auto 0' }}>
                            Discover every premium product meticulously curated for your daily ritual.
                        </p>
                    </div>
                </section>

                {/* Infinite Grid Client Component */}
                <div style={{ backgroundColor: 'var(--clr-surface)' }}>
                    <InfiniteProductsGrid />
                </div>
            </main>
        </InteractiveClientWrapper>
    );
}
