import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <div style={{ 
        background: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%)', 
        color: 'white', 
        textAlign: 'center', 
        padding: '12px var(--space-md)',
        fontWeight: '600',
        fontSize: '0.95rem',
        marginTop: 'var(--navbar-height)'
      }}>
        🎉 50% OFF up to ₹100 on your first order! Use code <span style={{ background: 'white', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', marginLeft: '6px' }}>WELCOME50</span>
      </div>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">🌟 #1 Rated Indian Restaurant in Town</div>
            <h1>
              Authentic Flavors, <br />
              <span className="highlight">Unforgettable Moments.</span>
            </h1>
            <p>
              Experience the rich tapestry of Indian culinary heritage. 
              Our master chefs craft every dish with love, using traditional spices 
              and the freshest local ingredients.
            </p>
            <div className="hero-actions">
              <Link href="/menu" className="btn btn-primary btn-lg pulse-animation">
                Explore Menu
              </Link>
              <Link href="#features" className="btn btn-outline btn-lg">
                Discover More
              </Link>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="hero-emoji-grid">
              {[
                { emoji: '🍛', label: 'Curries', i: 1 },
                { emoji: '🫓', label: 'Breads', i: 2 },
                { emoji: '🥗', label: 'Starters', i: 3 },
                { emoji: '🍧', label: 'Desserts', i: 4 },
                { emoji: '🥤', label: 'Drinks', i: 5 },
                { emoji: '🌶️', label: 'Spicy', i: 6 },
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="hero-emoji-card" 
                  style={{ '--i': item.i } as React.CSSProperties}
                >
                  <span className="emoji">{item.emoji}</span>
                  <span className="label">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-inner">
          <div className="section-header">
            <h2>Why Dine With Us?</h2>
            <p>We bring you more than just food; we bring you an experience.</p>
          </div>
          
          <div className="menu-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="menu-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🌿</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }}>Fresh Ingredients</h3>
              <p style={{ color: 'var(--text-secondary)' }}>We source our produce locally ensuring every bite is farm-fresh and packed with nutrients.</p>
            </div>
            <div className="menu-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>👨‍🍳</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }}>Master Chefs</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Our culinary experts bring decades of experience from the finest kitchens across India.</p>
            </div>
            <div className="menu-card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🛵</div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)' }}>Fast Delivery</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Hot and fresh food delivered directly to your doorstep with our express delivery partners.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--bg-card)' }}>
        <div className="section-inner" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: 'var(--space-lg)' }}>
            Ready to satisfy your cravings?
          </h2>
          <Link href="/menu" className="btn btn-primary btn-lg pulse-animation">
            Order Now
          </Link>
        </div>
      </section>
    </>
  );
}
