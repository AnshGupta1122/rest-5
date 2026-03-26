'use client';

import { CartItem, useCart } from '@/context/CartContext';
import Image from 'next/image';

interface MenuCardProps {
  item: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    imagePosition?: string;
    isVeg: boolean;
    isFeatured: boolean;
  };
}

export default function MenuCard({ item }: MenuCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  
  const cartItem = items.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  return (
    <div className="menu-card">
      <div className="menu-card-image">
        {item.image && (item.image.startsWith('data:') || item.image.startsWith('http')) ? (
          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: item.imagePosition || 'center' }} />
        ) : (
          <span className="emoji">{item.image || '🍽️'}</span>
        )}
        <div className={`menu-card-badge ${item.isVeg ? 'veg' : 'non-veg'}`}></div>
        {item.isFeatured && <div className="menu-card-featured">Special</div>}
      </div>
      
      <div className="menu-card-body">
        <h3>{item.name}</h3>
        {item.description && <p>{item.description}</p>}
        
        <div className="menu-card-footer">
          <div className="menu-card-price">₹{item.price}</div>
          
          {quantity > 0 ? (
            <div className="quantity-controls">
              <button aria-label="Decrease" onClick={() => updateQuantity(item.id, quantity - 1)}>-</button>
              <span>{quantity}</span>
              <button aria-label="Increase" onClick={() => updateQuantity(item.id, quantity + 1)}>+</button>
            </div>
          ) : (
            <button 
              className="add-to-cart-btn"
              onClick={() => addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                isVeg: item.isVeg,
                image: item.image,
                imagePosition: item.imagePosition
              })}
            >
              Add +
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
