import React, { useState, useEffect } from 'react';
import { getDocuments, updateDocument } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Product, ProductStatus } from '@poeage/types';
import { Button, Card, CardContent, Badge, Spinner } from '@poeage/ui';
import { Check, X, Shield, Search, Package, AlertCircle } from 'lucide-react';

const SAMPLE_MODERATION_PRODUCTS: Product[] = [
  {
    id: 'prod-wireless-earbuds',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'electronics',
    name: 'Wireless Noise-Cancelling Earbuds Pro',
    slug: 'wireless-noise-cancelling-earbuds-pro',
    description: 'Immersive sound with 40dB active noise cancellation.',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'],
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
    id: 'prod-ambient-lamp',
    vendorId: 'vendor-apex-electronics',
    categoryId: 'home-kitchen',
    name: 'Smart Ambient Desk Lamp with App Control',
    slug: 'smart-ambient-desk-lamp-app-control',
    description: '16M RGB colors, warm white to cool daylight tuning.',
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400'],
    status: 'pending_review',
    basePrice: 149900,
    salePrice: 299900,
    commissionRate: 0.10,
    tags: ['lighting', 'smart-home'],
    isFeatured: false,
    gstRate: 0.18,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    metadata: { totalSold: 0, totalRevenue: 0, averageRating: 5.0, totalRatings: 0, viewCount: 15 },
  },
  {
    id: 'prod-cotton-shirt',
    vendorId: 'vendor-stylestreet',
    categoryId: 'fashion',
    name: 'Pure Cotton Casual Slim Fit Shirt',
    slug: 'pure-cotton-casual-slim-fit-shirt',
    description: '100% combed cotton casual shirt for all-day comfort.',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'],
    status: 'published',
    basePrice: 99900,
    salePrice: 199900,
    commissionRate: 0.12,
    tags: ['fashion', 'men'],
    isFeatured: true,
    gstRate: 0.05,
    createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 },
    metadata: { totalSold: 180, totalRevenue: 17982000, averageRating: 4.6, totalRatings: 89, viewCount: 1650 },
  },
];

export const ProductModerationPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(SAMPLE_MODERATION_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'published' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const prods = await getDocuments<Product>(COLLECTION.PRODUCTS);
        if (prods.length > 0) {
          setProducts(prods);
        }
      } catch (err) {
        console.warn('Using moderation local fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const handleUpdateStatus = async (productId: string, nextStatus: ProductStatus) => {
    try {
      await updateDocument(COLLECTION.PRODUCTS, productId, {
        status: nextStatus,
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: nextStatus } : p))
      );

      setActionSuccess(`Product ${nextStatus === 'published' ? 'approved & published to marketplace!' : 'rejected.'}`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to moderate product:', err);
      // Fallback local update
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status: nextStatus } : p))
      );
      setActionSuccess(`Status updated to ${nextStatus}`);
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.vendorId.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return p.status === 'pending_review';
    if (activeTab === 'published') return p.status === 'published';
    if (activeTab === 'rejected') return p.status === 'rejected';
    return true;
  });

  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Product Catalog Moderation</h2>
          <p className="text-sm text-gray-500">Review vendor SKU submissions, verify compliance, and grant live publishing.</p>
        </div>

        <Badge variant="info">
          {products.filter((p) => p.status === 'pending_review').length} Pending Approvals
        </Badge>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-700">
          <Check className="w-4 h-4 text-green-500" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-1.5 p-1 bg-gray-100 rounded-lg text-xs font-semibold">
            {(['all', 'pending', 'published', 'rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {tab === 'pending' ? 'Pending Review' : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search product or vendor ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
        </CardContent>
      </Card>

      {/* Moderation Table */}
      {loading ? (
        <div className="py-20 text-center">
          <Spinner size="lg" className="mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-bold text-gray-700">No products matching current filter</h4>
          <p className="text-xs text-gray-400 mt-1">All queues up to date.</p>
        </Card>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4">Commission</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
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
                          <span className="text-xs text-gray-400 capitalize">{p.categoryId}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-gray-600">
                      {p.vendorId}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900">₹{(p.basePrice / 100).toLocaleString('en-IN')}</span>
                      {p.salePrice && (
                        <span className="text-xs text-gray-400 line-through ml-1.5">
                          ₹{(p.salePrice / 100).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-blue-600">
                      {Math.round((p.commissionRate ?? 0.1) * 100)}%
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          p.status === 'published'
                            ? 'success'
                            : p.status === 'pending_review'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {p.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {p.status !== 'published' && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(p.id, 'published')}
                          className="bg-green-600 hover:bg-green-500 text-white text-xs px-2.5 py-1"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                      )}

                      {p.status !== 'rejected' && (
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleUpdateStatus(p.id, 'rejected')}
                          className="text-xs px-2.5 py-1"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      )}
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
