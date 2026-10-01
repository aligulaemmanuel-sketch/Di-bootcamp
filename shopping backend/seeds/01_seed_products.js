exports.seed = async function (knex) {
  await knex('products').del();

  await knex('products').insert([
    {
      name: 'Aurora Headphones',
      category: 'Audio',
      tag: 'Bestseller',
      rating: 4.8,
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80',
      description: 'Immersive sound with adaptive noise cancelling for all-day focus.'
    },
    {
      name: 'Urban Backpack',
      category: 'Travel',
      tag: 'New',
      rating: 4.7,
      price: 89.5,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80',
      description: 'Lightweight and durable design built for work, hiking, and everyday routes.'
    },
    {
      name: 'PureGlow Lamp',
      category: 'Home',
      tag: 'Top rated',
      rating: 4.9,
      price: 64.0,
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
      description: 'Soft ambient lighting that creates a calm, welcoming room atmosphere.'
    },
    {
      name: 'Velocity Smartwatch',
      category: 'Wearables',
      tag: 'Hot',
      rating: 4.6,
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      description: 'Track workouts, sleep, and notifications with a stylish metal finish.'
    },
    {
      name: 'Luna Sneakers',
      category: 'Footwear',
      tag: 'Popular',
      rating: 4.5,
      price: 119.0,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      description: 'Cushioned comfort with a sleek silhouette for daily movement.'
    },
    {
      name: 'Terra Bottle',
      category: 'Lifestyle',
      tag: 'Eco',
      rating: 4.8,
      price: 35.75,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80',
      description: 'Vacuum insulated stainless steel for hydration on the go.'
    }
  ]);
};
