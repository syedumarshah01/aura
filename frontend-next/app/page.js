import FeaturedProducts from '../components/FeaturedProducts';
import InteractiveClientWrapper from '../components/InteractiveClientWrapper';
import Image from 'next/image';

export default function Home() {
    return (
        <InteractiveClientWrapper>
            <main>
                {/* Hero Section */}
                <section id="home" className="hero">
                    <div className="hero-content fade-in-up">
                        <span className="eyebrow">New Arrival</span>
                        <h1>Radiate Your True <br /><em>Essence</em></h1>
                        <p>Elevate your daily ritual with our curated collection of clean, effective, and ethically sourced beauty essentials.</p>
                        <a href="#featured" className="cta-btn">Shop The Collection</a>
                    </div>
                    <div className="hero-image fade-in">
                        <Image
                            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2000&auto=format&fit=crop"
                            alt="Ophélie Hero Beauty Background"
                            fill
                            priority
                            style={{ objectFit: 'cover', objectPosition: 'center' }}
                            sizes="100vw"
                            quality={85}
                        />
                    </div>
                </section>

                {/* Value Proposition */}
                <section className="values">
                    <div className="value-card fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                            <line x1="9" y1="9" x2="9.01" y2="9"></line>
                            <line x1="15" y1="9" x2="15.01" y2="9"></line>
                        </svg>
                        <h3>Cruelty Free</h3>
                        <p>Never tested on animals, always kind.</p>
                    </div>
                    <div className="value-card fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2v20"></path>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <h3>Ethical Sourcing</h3>
                        <p>Consciously gathered ingredients.</p>
                    </div>
                    <div className="value-card fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                            <line x1="16" y1="8" x2="2" y2="22"></line>
                            <line x1="17.5" y1="15" x2="9" y2="6.5"></line>
                        </svg>
                        <h3>Clean Formulas</h3>
                        <p>No parabens, sulfates, or harsh toxins.</p>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="about">
                    <div className="about-grid">
                        <div className="about-image reveal-left">
                            <Image
                                src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1200&auto=format&fit=crop"
                                alt="Pouring skincare serum"
                                width={800}
                                height={600}
                                style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    height: '600px',
                                    objectFit: 'cover',
                                    width: '100%'
                                }}
                            />
                        </div>
                        <div className="about-text reveal-right">
                            <h2>Nature Meets <br /><em>Science</em></h2>
                            <p>At Ophélie, we believe true beauty begins with skin health. Our formulations bridge the gap between potent botanical extracts and cutting-edge dermatological science. Every drop is crafted to restore, protect, and illuminate.</p>
                            <a href="#" className="link-btn">Discover Our Story &rarr;</a>
                        </div>
                    </div>
                </section>

                {/* Featured Component (Client Fetches API) */}
                <FeaturedProducts />

                {/* Newsletter */}
                <section className="newsletter">
                    <div className="newsletter-content">
                        <h2>Join The Ophélie Club</h2>
                        <p>Sign up to receive 15% off your first order, exclusive access to new launches, and skincare tips.</p>
                        <form className="subscribe-form" id="subscribe-form">
                            <input type="email" placeholder="Your email address" required />
                            <button type="submit" className="cta-btn secondary">Subscribe</button>
                        </form>
                    </div>
                </section>
            </main>
        </InteractiveClientWrapper>
    );
}
