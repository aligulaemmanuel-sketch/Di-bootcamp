import AuthForm from './components/AuthForm';
import ProductListing from './components/ProductListing';
import ShoppingCart from './components/ShoppingCart';

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 1100, margin: '1.5rem auto', padding: '0 16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Simulated Shop</h1>
        <AuthForm />
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24, marginTop: 24 }}>
        <ProductListing />
        <ShoppingCart />
      </div>
    </div>
  );
}
