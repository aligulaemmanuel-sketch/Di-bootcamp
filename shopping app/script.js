const fallbackProducts = [
  {
    id: 1,
    name: 'Aurora Headphones',
    category: 'Audio',
    tag: 'Bestseller',
    rating: 4.8,
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
    description: 'Immersive sound with adaptive noise cancelling for all-day focus.'
  },
  {
    id: 2,
    name: 'Urban Backpack',
    category: 'Travel',
    tag: 'New',
    rating: 4.7,
    price: 89.5,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
    description: 'Lightweight and durable design built for work, hiking, and everyday routes.'
  },
  {
    id: 3,
    name: 'PureGlow Lamp',
    category: 'Home',
    tag: 'Top rated',
    rating: 4.9,
    price: 64.0,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    description: 'Soft ambient lighting that creates a calm, welcoming room atmosphere.'
  },
  {
    id: 4,
    name: 'Velocity Smartwatch',
    category: 'Wearables',
    tag: 'Hot',
    rating: 4.6,
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    description: 'Track workouts, sleep, and notifications with a stylish metal finish.'
  },
  {
    id: 5,
    name: 'Luna Sneakers',
    category: 'Footwear',
    tag: 'Popular',
    rating: 4.5,
    price: 119.0,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    description: 'Cushioned comfort with a sleek silhouette for daily movement.'
  },
  {
    id: 6,
    name: 'Terra Bottle',
    category: 'Lifestyle',
    tag: 'Eco',
    rating: 4.8,
    price: 35.75,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
    description: 'Vacuum insulated stainless steel for hydration on the go.'
  }
];

let products = [...fallbackProducts];

async function loadProducts() {
  try {
    const response = await fetch('/api/products');

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      products = data;
    }
  } catch (error) {
    products = [...fallbackProducts];
  }

  renderCategories();
  renderProducts();
  renderCart();
}

const state = {
  query: '',
  category: 'All',
  cart: JSON.parse(localStorage.getItem('urbanBasketCart') || '[]')
};

const productGrid = document.getElementById('productGrid');
const categoryFilters = document.getElementById('categoryFilters');
const searchInput = document.getElementById('searchInput');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const subtotalValue = document.getElementById('subtotalValue');
const resultsText = document.getElementById('resultsText');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const productTemplate = document.getElementById('productTemplate');
const loginButton = document.getElementById('loginButton');
const authOverlay = document.getElementById('authOverlay');
const closeModalBtn = document.getElementById('closeModal');
const authTabs = document.querySelectorAll('.auth-tab');
const nameField = document.getElementById('nameField');
const authForm = document.getElementById('authForm');

function openAuthModal() {
  authOverlay.classList.add('visible');
  authOverlay.setAttribute('aria-hidden', 'false');
}

function closeAuthModal() {
  authOverlay.classList.remove('visible');
  authOverlay.setAttribute('aria-hidden', 'true');
}

function setAuthTab(mode) {
  authTabs.forEach((tab) => {
    const isActive = tab.dataset.authTab === mode;
    tab.classList.toggle('active', isActive);
  });

  const isSignup = mode === 'signup';
  nameField.classList.toggle('hidden', !isSignup);
  document.getElementById('authTitle').textContent = isSignup ? 'Create account' : 'Welcome back';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function getCategories() {
  return ['All', ...new Set(products.map((product) => product.category))];
}

function saveCart() {
  localStorage.setItem('urbanBasketCart', JSON.stringify(state.cart));
}

function addToCart(productId) {
  const existingItem = state.cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }

  saveCart();
  renderCart();
}

function updateQuantity(productId, change) {
  const item = state.cart.find((entry) => entry.id === productId);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    state.cart = state.cart.filter((entry) => entry.id !== productId);
  }

  saveCart();
  renderCart();
}

function removeItem(productId) {
  state.cart = state.cart.filter((entry) => entry.id !== productId);
  saveCart();
  renderCart();
}

function clearCart() {
  state.cart = [];
  saveCart();
  renderCart();
}

function renderCategories() {
  const categories = getCategories();

  categoryFilters.innerHTML = categories
    .map(
      (category) => `
        <button class="filter-button ${state.category === category ? 'active' : ''}" data-category="${category}">
          ${category}
        </button>
      `
    )
    .join('');

  categoryFilters.querySelectorAll('.filter-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderProducts();
      renderCategories();
    });
  });
}

function renderProducts() {
  const filteredProducts = products.filter((product) => {
    const matchesCategory = state.category === 'All' || product.category === state.category;
    const matchesQuery = product.name.toLowerCase().includes(state.query.toLowerCase()) ||
      product.description.toLowerCase().includes(state.query.toLowerCase());

    return matchesCategory && matchesQuery;
  });

  resultsText.textContent = `${filteredProducts.length} item${filteredProducts.length === 1 ? '' : 's'}`;

  if (filteredProducts.length === 0) {
    productGrid.innerHTML = '<div class="empty-state">No products match your search.</div>';
    return;
  }

  productGrid.innerHTML = '';

  filteredProducts.forEach((product) => {
    const clone = productTemplate.content.cloneNode(true);
    const card = clone.querySelector('.product-card');
    const image = clone.querySelector('.product-image');
    const tag = clone.querySelector('.product-tag');
    const category = clone.querySelector('.product-category');
    const rating = clone.querySelector('.rating-value');
    const name = clone.querySelector('.product-name');
    const description = clone.querySelector('.product-description');
    const price = clone.querySelector('.product-price');
    const addButton = clone.querySelector('.add-btn');

    image.src = product.image;
    image.alt = product.name;
    tag.textContent = product.tag;
    category.textContent = product.category;
    rating.textContent = product.rating.toFixed(1);
    name.textContent = product.name;
    description.textContent = product.description;
    price.textContent = formatCurrency(product.price);

    addButton.addEventListener('click', () => addToCart(product.id));
    productGrid.appendChild(clone);
  });
}

function renderCart() {
  if (state.cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-state">Your cart is empty.</div>';
    cartCount.textContent = '0';
    subtotalValue.textContent = '$0.00';
    return;
  }

  const cartWithDetails = state.cart
    .map((entry) => {
      const product = products.find((item) => item.id === entry.id);
      return product ? { ...product, quantity: entry.quantity } : null;
    })
    .filter(Boolean);

  const subtotal = cartWithDetails.reduce((total, product) => total + product.price * product.quantity, 0);

  cartCount.textContent = String(cartWithDetails.reduce((count, product) => count + product.quantity, 0));
  subtotalValue.textContent = formatCurrency(subtotal);

  cartItems.innerHTML = cartWithDetails
    .map(
      (product) => `
        <div class="cart-item">
          <img src="${product.image}" alt="${product.name}" />
          <div class="cart-item-info">
            <span class="cart-item-name">${product.name}</span>
            <span class="cart-item-price">${formatCurrency(product.price)} each</span>
          </div>
          <div class="cart-item-actions">
            <div class="qty-controls">
              <button aria-label="Decrease quantity" data-action="decrease" data-id="${product.id}">−</button>
              <span>${product.quantity}</span>
              <button aria-label="Increase quantity" data-action="increase" data-id="${product.id}">+</button>
            </div>
            <button class="remove-item" data-action="remove" data-id="${product.id}">Remove</button>
          </div>
        </div>
      `
    )
    .join('');

  cartItems.querySelectorAll('button[data-action]').forEach((button) => {
    const { action, id } = button.dataset;
    const productId = Number(id);

    button.addEventListener('click', () => {
      if (action === 'increase') updateQuantity(productId, 1);
      if (action === 'decrease') updateQuantity(productId, -1);
      if (action === 'remove') removeItem(productId);
    });
  });
}

searchInput.addEventListener('input', (event) => {
  state.query = event.target.value.trim();
  renderProducts();
});

clearCartBtn.addEventListener('click', clearCart);
checkoutBtn.addEventListener('click', () => {
  alert('Checkout is ready — connect this with your payment flow next.');
});

loginButton.addEventListener('click', openAuthModal);
closeModalBtn.addEventListener('click', closeAuthModal);
authOverlay.addEventListener('click', (event) => {
  if (event.target === authOverlay) closeAuthModal();
});

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => setAuthTab(tab.dataset.authTab));
});

authForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const action = document.querySelector('.auth-tab.active')?.dataset.authTab || 'signin';
  alert(action === 'signup' ? 'Account created successfully!' : 'Signed in successfully!');
  closeAuthModal();
});

setAuthTab('signin');
loadProducts();
