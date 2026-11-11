import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { getDocuments } from '@poeage/firebase-client';
import { COLLECTION } from '@poeage/config';
import type { Product } from '@poeage/types';
import { Button, Card, CardContent, Badge, Spinner } from '@poeage/ui';
import {
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Zap,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';

const FALLBACK_DETAIL: Product = {
  id: 'prod-wireless-earbuds',
  vendorId: 'vendor-apex-electronics',
  categoryId: 'electronics',
  name: 'Wireless Noise-Cancelling Earbuds Pro',
  slug: 'wireless-noise-cancelling-earbuds-pro',
  description:
    'Experience high-fidelity wireless audio with advanced 40dB hybrid active noise cancellation. Equipped with 11mm dynamic drivers, 6-microphone call filtering, IPX5 water resistance, and up to 32 hours of total battery life with the wireless charging case.',
  shortDescription: 'Active noise cancellation earbuds with 32hr battery life.',
  images: [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
    'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800',
  ],
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
};

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product>(FALLBACK_DETAIL);
  const [selectedImage, setSelectedImage] = useState<string>(FALLBACK_DETAIL.images[0]!);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const prods = await getDocuments<Product>(COLLECTION.PRODUCTS);
        const match = prods.find((p) => p.slug === slug || p.id === slug);
        if (match) {
          setProduct(match);
          if (match.images?.[0]) setSelectedImage(match.images[0]);
        }
      } catch (err) {
        console.warn('Using product detail fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const discountPercent = product.salePrice
    ? Math.round(((product.salePrice - product.basePrice) / product.salePrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-blue-600">Catalog</Link>
        <span>/</span>
        <span className="capitalize text-gray-700">{product.categoryId.replace('-', ' ')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Gallery */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
            <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images?.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  selectedImage === img ? 'border-blue-600 shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Product Overview */}
        <div className="space-y-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {product.categoryId.replace('-', ' ')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.metadata?.averageRating ?? 5) ? 'fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="font-bold text-gray-800 text-sm ml-2">
                  {product.metadata?.averageRating ?? 4.8}
                </span>
              </div>
              <span className="text-xs text-gray-400">({product.metadata?.totalRatings ?? 142} ratings)</span>
              <span className="text-xs text-green-600 font-semibold ml-2">Verified Purchase Reviews</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-gray-900">
                ₹{(product.basePrice / 100).toLocaleString('en-IN')}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{(product.salePrice / 100).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    Save {discountPercent}%
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-gray-500">Inclusive of all applicable GST taxes. Free express shipping.</p>
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-sm"
                >
                  +
                </button>
              </div>
              <Badge variant="success">In Stock (Dispatch within 24h)</Badge>
            </div>

            {addedNotice && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-xs text-green-700">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Added {quantity} item(s) to shopping cart!
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>

              <Button
                size="lg"
                variant="secondary"
                onClick={handleBuyNow}
                className="flex-1 bg-slate-900 hover:bg-black text-white font-bold flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 text-amber-400" />
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 border-t border-b border-gray-200 py-4 text-center">
            <div className="space-y-1">
              <Truck className="w-5 h-5 text-blue-600 mx-auto" />
              <p className="text-[11px] font-bold text-gray-900">Express Delivery</p>
              <p className="text-[10px] text-gray-400">Guaranteed 2-3 days</p>
            </div>
            <div className="space-y-1">
              <RotateCcw className="w-5 h-5 text-amber-600 mx-auto" />
              <p className="text-[11px] font-bold text-gray-900">Easy Returns</p>
              <p className="text-[10px] text-gray-400">7-day replacement</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 text-green-600 mx-auto" />
              <p className="text-[11px] font-bold text-gray-900">100% Genuine</p>
              <p className="text-[10px] text-gray-400">Verified Seller item</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-bold text-base text-gray-900">Product Highlights</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
