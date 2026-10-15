import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  selectCartItems,
  selectCartTotalItems,
  selectCartTotalPrice,
} from '../features/cart/cartSlice';

export default function ShoppingCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalItems = useSelector(selectCartTotalItems);
  const totalPrice = useSelector(selectCartTotalPrice);

  return (
    <section>
      <h2>Cart ({totalItems})</h2>
      {items.length === 0 && <p>Your cart is empty.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {items.map((item) => (
          <li key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontSize: 14 }}>{item.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                aria-label={`Decrease quantity of ${item.title}`}
                onClick={() =>
                  dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))
                }
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                aria-label={`Increase quantity of ${item.title}`}
                onClick={() =>
                  dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))
                }
              >
                +
              </button>
              <span style={{ marginLeft: 'auto' }}>
                ${(item.price * item.quantity).toFixed(2)}
              </span>
              <button
                aria-label={`Remove ${item.title}`}
                onClick={() => dispatch(removeFromCart(item.id))}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <>
          <p>
            <strong>Total: ${totalPrice.toFixed(2)}</strong>
          </p>
          <button onClick={() => dispatch(clearCart())}>Clear cart</button>
        </>
      )}
    </section>
  );
}
