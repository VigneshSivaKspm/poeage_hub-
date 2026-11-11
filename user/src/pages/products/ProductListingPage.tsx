import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getDocuments } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Product } from '@poeage/types';
import { Button, Card, CardContent, Badge, Spinner } from '@poeage/ui';
import { Filter, Star, ShoppingBag, ArrowUpDown, Search } from 'lucide-react';

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-wireless-earbuds',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'electronics',
    name: 'Wireless Noise-Cancelling Earbuds Pro',
    slug: 'wireless-noise-cancelling-earbuds-pro',
    description: 'Immersive sound with 40dB active noise cancellation.',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'],
    status: 'published',
    basePrice: 249900,
    salePrice: 499900,
    commissionRate: 0.10,
    tags: ['audio', 'earbuds', 'wireless'],
    isFeatured: true,
    gstRate: 0.18,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    metadata: { totalSold: 310, totalRevenue: 77469000, averageRating: 4.8, totalRatings: 142, viewCount: 2400 },
  },
  {
    id: 'prod-cotton-shirt',
    vendorId: 'vendor-stylestreet',
    categoryId: 'fashion',
    name: 'Pure Cotton Casual Slim Fit Shirt',
    slug: 'pure-cotton-casual-slim-fit-shirt',
    description: '100% combed cotton casual shirt for all-day comfort.',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600'],
    status: 'published',
    basePrice: 99900,
    salePrice: 199900,
    commissionRate: 0.12,
    tags: ['shirt', 'cotton', 'men'],
    isFeatured: true,
    gstRate: 0.05,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    metadata: { totalSold: 180, totalRevenue: 17982000, averageRating: 4.6, totalRatings: 89, viewCount: 1650 },
  },
  {
    id: 'prod-smart-ambient-lamp',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'home-kitchen',
    name: 'Smart Ambient Desk Lamp with App Control',
    slug: 'smart-ambient-desk-lamp-app-control',
    description: '16M RGB colors, warm white to cool daylight tuning.',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'],
    status: 'published',
    basePrice: 149900,
    salePrice: 299900,
    commissionRate: 0.10,
    tags: ['lighting', 'smart-home'],
    isFeatured: true,
    gstRate: 0.18,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    metadata: { totalSold: 245, totalRevenue: 36725500, averageRating: 4.9, totalRatings: 215, viewCount: 3100 },
  },
  {
    id: 'prod-glow-serum',
    vendorId: 'vendor-stylestreet',
    categoryId: 'beauty-health',
    name: 'Organic Vitamin C Glow Face Serum (30ml)',
    slug: 'organic-vitamin-c-glow-face-serum',
    description: 'Infused with 20% Vitamin C and Hyaluronic Acid.',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600'],
    status: 'published',
    basePrice: 64900,
    salePrice: 129900,
    commissionRate: 0.12,
    tags: ['skincare', 'serum', 'beauty'],
    isFeatured: true,
    gstRate: 0.18,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    metadata: { totalSold: 520, totalRevenue: 33748000, averageRating: 4.7, totalRatings: 310, viewCount: 4200 },
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Departments' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home-kitchen', name: 'Home & Kitchen' },
  { id: 'beauty-health', name: 'Beauty & Health' },
];

export const ProductListingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || 'all';

  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating'>('featured');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPublishedCatalog = async () => {
      setLoading(true);
      try {
        const prods = await getDocuments<Product>(COLLECTION.PRODUCTS);
        const publishedOnly = prods.filter((p) => p.status === 'published');
        if (publishedOnly.length > 0) {
          setProducts(publishedOnly);
        }
      } catch (err) {
        console.warn('Using catalog fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedCatalog();
  }, []);

  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  const filtered = products
    .filter((p) => {
      if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;
      if (queryParam) {
        const q = queryParam.toLowerCase();
        const matchesTitle = p.name.toLowerCase().includes(q);
        const matchesTag = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesTag) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price_desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return (b.metadata?.averageRating ?? 0) - (a.metadata?.averageRating ?? 0);
      return 0; // featured default
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {queryParam ? `Search Results for "${queryParam}"` : 'Browse Catalog'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">Showing {filtered.length} verified products with express delivery</p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 flex items-center gap-1 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs font-semibold bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="featured">Featured Deals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <aside className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" /> Filter Departments
              </h3>

              <div className="space-y-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === c.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="py-20 text-center">
              <Spinner size="lg" className="mx-auto text-blue-600" />
              <p className="text-xs text-gray-400 mt-2">Loading marketplace catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <Card className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-bold text-gray-700">No products found</h4>
              <p className="text-xs text-gray-400 mt-1">Try relaxing filters or search terms.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((prod) => (
                <Link key={prod.id} to={`/product/${prod.slug}`} className="group">
                  <Card className="overflow-hidden hover:shadow-lg transition-all border-gray-200 h-full flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'}
                          alt={prod.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.salePrice && (
                          <span className="absolute top-2.5 left-2.5 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {Math.round(((prod.salePrice - prod.basePrice) / prod.salePrice) * 100)}% OFF
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          {prod.categoryId.replace('-', ' ')}
                        </span>
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {prod.name}
                        </h4>

                        <div className="flex items-center gap-1 text-xs">
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="font-bold text-gray-700 ml-1">{prod.metadata?.averageRating ?? 4.8}</span>
                          </div>
                          <span className="text-gray-400">({prod.metadata?.totalRatings ?? 50})</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-2">
                      <div>
                        <span className="text-base font-extrabold text-gray-900">
                          ₹{(prod.basePrice / 100).toLocaleString('en-IN')}
                        </span>
                        {prod.salePrice && (
                          <span className="text-xs text-gray-400 line-through ml-1.5">
                            ₹{(prod.salePrice / 100).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      <Button size="sm" variant="outline" className="text-xs">
                        View Item
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
