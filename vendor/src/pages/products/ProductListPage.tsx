import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVendorAuth } from '../../context/AuthContext';
import { getDocuments, db } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Product } from '@poeage/types';
import { Button, Card, CardContent, Badge, Spinner } from '@poeage/ui';
import { Package, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

const SAMPLE_VENDOR_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    vendorId: 'vendor-1',
    categoryId: 'electronics',
    name: 'Wireless Noise-Cancelling Earbuds Pro',
    slug: 'wireless-noise-cancelling-earbuds-pro',
    description: '40dB active noise cancellation earbuds with 32h battery.',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200'],
    status: 'published',
    basePrice: 249900,
    salePrice: 499900,
    commissionRate: 0.10,
    tags: ['audio', 'earbuds'],
    isFeatured: true,
    gstRate: 0.18,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    metadata: { totalSold: 310, totalRevenue: 77469000, averageRating: 4.8, totalRatings: 142, viewCount: 2400 },
  },
  {
    id: 'prod-3',
    vendorId: 'vendor-1',
    categoryId: 'home-kitchen',
    name: 'Smart Ambient Desk Lamp with App Control',
    slug: 'smart-ambient-desk-lamp-app-control',
    description: 'RGB Smart LED desk lamp with app controls.',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200'],
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
];

export const ProductListPage: React.FC = () => {
  const { vendor } = useVendorAuth();
  const [products, setProducts] = useState<Product[]>(SAMPLE_VENDOR_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchVendorProducts = async () => {
      if (!vendor) return;
      setLoading(true);
      try {
        const prods = await getDocuments<Product>(COLLECTION.PRODUCTS);
        const filtered = prods.filter((p) => p.vendorId === vendor.id);
        if (filtered.length > 0) {
          setProducts(filtered);
        }
      } catch (err) {
        console.warn('Using local vendor products fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorProducts();
  }, [vendor]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Product Catalog</h2>
          <p className="text-sm text-gray-500">Manage your SKU listings, pricing, and stock status.</p>
        </div>

        <Link to="/products/new">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Add New Product
          </Button>
        </Link>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by product title or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Showing {filteredProducts.length} items
          </span>
        </CardContent>
      </Card>

      {/* Product Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Spinner size="lg" className="text-emerald-500 mx-auto" />
          <p className="text-xs text-gray-400 mt-2">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-700">No products found</h4>
          <p className="text-xs text-gray-400 mt-1 mb-4">Start selling by adding your first product listing.</p>
          <Link to="/products/new">
            <Button size="sm" className="bg-emerald-600 text-white">
              Create Product Listing
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Selling Price</th>
                  <th className="py-3.5 px-4">Total Sold</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200 flex-shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {p.id.slice(0, 12)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 capitalize">
                      {p.categoryId.replace('-', ' ')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900">₹{(p.basePrice / 100).toLocaleString('en-IN')}</span>
                      {p.salePrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">
                          ₹{(p.salePrice / 100).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      {p.metadata?.totalSold ?? 0} units
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          p.status === 'published'
                            ? 'success'
                            : p.status === 'pending_review'
                            ? 'warning'
                            : p.status === 'draft'
                            ? 'default'
                            : 'danger'
                        }
                      >
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        title="Edit Product"
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
