'use client';

import { useState, useEffect } from 'react';
import MenuCard from '@/components/MenuCard';

export default function MenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);

  useEffect(() => {
    fetch('/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
        else setError('Failed to load menu');
        setLoading(false);
      })
      .catch(() => {
        setError('Network error');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section" style={{ textAlign: 'center', minHeight: '60vh' }}>
        <h2>Oops!</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Filter items based on category, search, and veg
  const visibleCategories = activeCategory === 'all' 
    ? categories 
    : categories.filter(c => c.id === activeCategory);

  return (
    <>
      <div style={{
        background: 'var(--bg-card)', 
        padding: 'calc(var(--navbar-height) + var(--space-md)) var(--space-lg) var(--space-md)',
        position: 'sticky', top: 0, zIndex: 100,
        borderBottom: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="search-box" style={{ maxWidth: 'var(--max-width)', margin: '0 auto', flex: 1, position: 'relative' }}>
          <span className="search-icon" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search for 'Cuisines' or 'Dishes'" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '14px 16px 14px 48px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '1rem', background: 'var(--bg-subtle)' }}
          />
        </div>
      </div>

      <div className="page-title" style={{ paddingTop: 'var(--space-xl)' }}>
        <h1>Our Menu</h1>
        <p>Discover our wide selection of authentic Indian dishes.</p>
      </div>

      <div className="section" style={{ paddingTop: 'var(--space-sm)' }}>
        <div className="section-inner">
          <div className="menu-filters" style={{ justifyContent: 'flex-start' }}>
            
            <button 
              className={`veg-toggle ${vegOnly ? 'active' : ''}`}
              onClick={() => { setVegOnly(!vegOnly); setNonVegOnly(false); }}
            >
              <div className="menu-card-badge veg" style={{ position: 'relative', top: 0, left: 0 }}></div>
              Veg Only
            </button>
            <button 
              className={`veg-toggle ${nonVegOnly ? 'active' : ''}`}
              onClick={() => { setNonVegOnly(!nonVegOnly); setVegOnly(false); }}
              style={{ marginLeft: 'var(--space-md)' }}
            >
              <div className="menu-card-badge non-veg" style={{ position: 'relative', top: 0, left: 0 }}></div>
              Non-Veg Only
            </button>
          </div>

          <div className="category-tabs">
            <button 
              className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.image} {cat.name}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3xl)' }}>
            {visibleCategories.map(cat => {
              const filteredItems = cat.items.filter((item: any) => {
                const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesVeg = !vegOnly || item.isVeg;
                const matchesNonVeg = !nonVegOnly || !item.isVeg;
                return matchesSearch && matchesVeg && matchesNonVeg;
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={cat.id}>
                  <h2 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-lg)', borderBottom: '2px solid var(--border-light)', paddingBottom: 'var(--space-xs)' }}>
                    {cat.image} {cat.name}
                  </h2>
                  <div className="menu-grid">
                    {filteredItems.map((item: any) => (
                      <MenuCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              );
            })}
            
            {!categories.some(cat => cat.items.some((item: any) => 
               (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))) && 
               (!vegOnly || item.isVeg) &&
               (!nonVegOnly || !item.isVeg)
            )) && (
              <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--text-secondary)' }}>
                <h3>No items found</h3>
                <p>Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
