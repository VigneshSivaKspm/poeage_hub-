import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVendorAuth } from '../../context/AuthContext';
import { setDocument } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '@poeage/ui';
import { Package, ArrowLeft, AlertCircle, Plus, Trash2 } from 'lucide-react';
import type { Product, Inventory } from '@poeage/types';

const CATEGORIES = [
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home-kitchen', name: 'Home & Kitchen' },
  { id: 'beauty-health', name: 'Beauty & Health' },
  { id: 'sports-outdoors', name: 'Sports & Outdoors' },
  { id: 'books', name: 'Books' },
];

export const CreateProductPage: React.FC = () => {
  const { vendor } = useVendorAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('electronics');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [priceRupees, setPriceRupees] = useState<number>(999);
  const [compareAtPriceRupees, setCompareAtPriceRupees] = useState<number>(1499);
  const [costPriceRupees, setCostPriceRupees] = useState<number>(550);
  const [stockQuantity, setStockQuantity] = useState<number>(25);
  const [reorderLevel, setReorderLevel] = useState<number>(5);
  const [tagsInput, setTagsInput] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
  ]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    setErrorMsg(null);
    setLoading(true);

    try {
      const productId = `prod-${Date.now()}`;
      const slug = name
        .toLowerCase()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const basePrice = Math.round(priceRupees * 100);
      const salePrice = compareAtPriceRupees ? Math.round(compareAtPriceRupees * 100) : undefined;
      const costPrice = costPriceRupees ? Math.round(costPriceRupees * 100) : undefined;

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      const productDoc: Record<string, unknown> = {
        id: productId,
        vendorId: vendor.id,
        categoryId,
        name,
        slug,
        description,
        shortDescription,
        images,
        status: 'pending_review',
        basePrice,
        salePrice,
        costPrice,
        commissionRate: vendor.commissionRate ?? 0.10,
        tags,
        isFeatured: false,
        gstRate: 0.18,
        metadata: {
          totalSold: 0,
          totalRevenue: 0,
          averageRating: 5.0,
          totalRatings: 0,
          viewCount: 0,
        },
      };

      // 1. Create product record
      await setDocument(COLLECTION.PRODUCTS, productId, productDoc);

      // 2. Create corresponding inventory record
      const inventoryDoc: Record<string, unknown> = {
        id: productId,
        productId,
        vendorId: vendor.id,
        quantity: stockQuantity,
        reservedQuantity: 0,
        reorderLevel,
      };
      await setDocument(COLLECTION.INVENTORY, productId, inventoryDoc);

      navigate('/products', { replace: true });
    } catch (err: unknown) {
      console.error('Failed to create product:', err);
      setErrorMsg((err as { message?: string }).message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/products" className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <p className="text-xs text-gray-500">Provide product specifications, multi-images, pricing, and initial stock.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Identification</CardTitle>
            <CardDescription>Primary information shown to shoppers on POEAGE HUB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Product Title"
              required
              placeholder="e.g. Ergonomic Bluetooth Wireless Mouse"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Tags (comma-separated)"
                placeholder="tech, wireless, ergonomic, office"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
              />
            </div>

            <Input
              label="Short Catchy Tagline"
              placeholder="Comfortable wireless navigation with 18-month battery"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe product highlights, dimensions, box contents, and features..."
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Financials */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing & Commercials</CardTitle>
            <CardDescription>All retail prices will be handled in Indian Rupees (INR paise internally).</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={priceRupees}
                onChange={(e) => setPriceRupees(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compare-at MRP (₹)
              </label>
              <input
                type="number"
                min={priceRupees}
                value={compareAtPriceRupees}
                onChange={(e) => setCompareAtPriceRupees(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost Price (₹ - Private)
              </label>
              <input
                type="number"
                min={0}
                value={costPriceRupees}
                onChange={(e) => setCostPriceRupees(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stock & Inventory */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inventory Allocation</CardTitle>
            <CardDescription>Track live warehouse availability and prevent overselling.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Stock Units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Low-Stock Alert Threshold
              </label>
              <input
                type="number"
                min={1}
                value={reorderLevel}
                onChange={(e) => setReorderLevel(Number(e.target.value))}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Image Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Gallery</CardTitle>
            <CardDescription>High-resolution imagery increases conversion rate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <Button type="button" variant="outline" onClick={addImage}>
                Add Image
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-80 hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pt-4">
          <Link to="/products">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 shadow-md"
            isLoading={loading}
          >
            Submit for Admin Moderation
          </Button>
        </div>
      </form>
    </div>
  );
};
