import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Card, CardContent, Badge } from '@poeage/ui';
import {
  Smartphone,
  Shirt,
  Home as HomeIcon,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Tag,
  Star,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Electronics', icon: Smartphone, count: '1,200+ items', color: 'bg-blue-50 text-blue-600', slug: 'electronics' },
  { name: 'Fashion', icon: Shirt, count: '2,500+ items', color: 'bg-rose-50 text-rose-600', slug: 'fashion' },
  { name: 'Home & Kitchen', icon: HomeIcon, count: '850+ items', color: 'bg-amber-50 text-amber-600', slug: 'home-kitchen' },
  { name: 'Beauty & Health', icon: Sparkles, count: '600+ items', color: 'bg-purple-50 text-purple-600', slug: 'beauty' },
];

const FEATURED_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Wireless Noise-Cancelling Earbuds Pro',
    category: 'Electronics',
    price: 249900, // ₹2,499
    originalPrice: 499900, // ₹4,999
    rating: 4.8,
    reviews: 142,
    badge: 'Best Seller',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-2',
    name: 'Pure Cotton Casual Slim Fit Shirt',
    category: 'Fashion',
    price: 99900, // ₹999
    originalPrice: 199900, // ₹1,999
    rating: 4.6,
    reviews: 89,
    badge: '50% OFF',
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-3',
    name: 'Smart Ambient Desk Lamp with App Control',
    category: 'Home & Kitchen',
    price: 149900, // ₹1,499
    originalPrice: 299900, // ₹2,999
    rating: 4.9,
    reviews: 215,
    badge: 'Trending',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: 'prod-4',
    name: 'Organic Vitamin C Glow Face Serum (30ml)',
    category: 'Beauty',
    price: 64900, // ₹649
    originalPrice: 129900, // ₹1,299
    rating: 4.7,
    reviews: 310,
    badge: 'Top Rated',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
  },
];

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Vendor Mega Commerce Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Curated Brands. <br />
              <span className="text-blue-400">Rapid Delivery.</span>
            </h1>

            <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
              Explore thousands of verified products from top local and national sellers with guaranteed authentic quality and lightning-fast fulfillment.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/products">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2 shadow-lg">
                  <ShoppingBag className="w-5 h-5" />
                  Explore Catalog
                </Button>
              </Link>
              {!user && (
                <Link to="/register">
                  <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    Join POEAGE HUB
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-sm text-gray-500">Handpicked selections across popular departments</p>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.slug} to={`/category/${cat.slug}`} className="group">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-gray-200">
                  <CardContent className="p-6 text-center space-y-3">
                    <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trending Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Trending Deals</h2>
              <p className="text-sm text-gray-500">Special offers direct from verified sellers</p>
            </div>
          </div>
          <Link to="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1">
            Explore All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((prod) => (
            <Card key={prod.id} className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200 flex flex-col">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {prod.badge}
                </span>
              </div>

              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-1">{prod.category}</p>
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 hover:text-blue-600 cursor-pointer">
                    {prod.name}
                  </h4>

                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-xs font-bold text-gray-700 ml-1">{prod.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">({prod.reviews})</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-gray-900">₹{(prod.price / 100).toLocaleString('en-IN')}</span>
                    <span className="text-xs text-gray-400 line-through ml-2">₹{(prod.originalPrice / 100).toLocaleString('en-IN')}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
