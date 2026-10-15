import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/products/productThunks';
import { addToCart } from '../features/cart/cartSlice';

export default function ProductListing() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.products);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <section>
      <h2>Products</h2>
      {!isAuthenticated && <p>Log in to add items to your cart.</p>}
      {loading && <p>Loading products...</p>}
      {error && (
        <p role="alert" style={{ color: 'crimson' }}>
          Error: {error}{' '}
          <button onClick={() => dispatch(fetchProducts())}>Retry</button>
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {items.map((product) => (
          <article
            key={product.id}
            style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{ width: '100%', height: 140, objectFit: 'contain' }}
            />
            <h3 style={{ fontSize: 14 }}>{product.title}</h3>
            <p>${product.price.toFixed(2)}</p>
            <button
              disabled={!isAuthenticated}
              onClick={() => dispatch(addToCart(product))}
            >
              Add to cart
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
