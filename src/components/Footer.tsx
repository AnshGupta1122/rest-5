import { prisma } from '@/lib/prisma';

export default async function Footer({ siteName = 'Spice Garden' }: { siteName?: string }) {
  let phone = '+91 98765 43210';
  let address = '123 Food Street, Mumbai';
  
  try {
    const p = await prisma.settings.findUnique({ where: { key: 'restaurant_phone' } });
    const a = await prisma.settings.findUnique({ where: { key: 'restaurant_address' } });
    if (p?.value) phone = p.value;
    if (a?.value) address = a.value;
  } catch(e) {}

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>{siteName}</h3>
          <p>
            Experience the authentic taste of Indian cuisine. 
            Prepared with fresh ingredients and traditional recipes 
            passed down through generations.
          </p>
        </div>
        
        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="/">Home</a>
          <a href="/menu">Our Menu</a>
          <a href="/cart">Your Cart</a>
        </div>
        
        <div className="footer-links">
          <h4>Contact Us</h4>
          <p>📍 {address}</p>
          <p>📞 {phone}</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {siteName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
