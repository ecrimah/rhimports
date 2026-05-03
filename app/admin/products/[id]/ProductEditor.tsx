'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ProductEditor({ productId }: { productId: string }) {
  const [productName, setProductName] = useState('Premium Leather Crossbody Bag');
  const [category, setCategory] = useState('Bags & Accessories');
  const [price, setPrice] = useState('289.00');
  const [comparePrice, setComparePrice] = useState('349.00');
  const [sku, setSku] = useState('LCB-FG-001');
  const [stock, setStock] = useState('15');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [description, setDescription] = useState('Crafted from premium full-grain leather, this sophisticated crossbody bag combines timeless elegance with modern functionality. Features adjustable strap, secure zip closure, and multiple interior pockets.');
  const [status, setStatus] = useState('Active');
  const [featured, setFeatured] = useState(true);
  const [activeTab, setActiveTab] = useState('general');

  const PRESET_COLORS = [
    { name: 'Black',  hex: '#000000' },
    { name: 'White',  hex: '#FFFFFF' },
    { name: 'Red',    hex: '#EF4444' },
    { name: 'Blue',   hex: '#3B82F6' },
    { name: 'Navy',   hex: '#1e3a8a' },
    { name: 'Green',  hex: '#22C55E' },
    { name: 'Yellow', hex: '#EAB308' },
    { name: 'Pink',   hex: '#EC4899' },
    { name: 'Purple', hex: '#A855F7' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Gray',   hex: '#6B7280' },
    { name: 'Brown',  hex: '#92400E' },
    { name: 'Beige',  hex: '#D4B896' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Teal',   hex: '#0D9488' },
    { name: 'Cream',  hex: '#FFFDD0' },
    { name: 'Gold',   hex: '#D4AF37' },
    { name: 'Silver', hex: '#C0C0C0' },
  ];
  const PRESET_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [customColors, setCustomColors] = useState<{ name: string; hex: string }[]>([]);
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#808080');

  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [customSize, setCustomSize] = useState('');

  const toggleColor = (name: string) =>
    setSelectedColors(prev => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });

  const addCustomColor = () => {
    const name = customColorName.trim();
    if (!name) return;
    setCustomColors(prev => [...prev, { name, hex: customColorHex }]);
    setSelectedColors(prev => new Set(prev).add(name));
    setCustomColorName('');
    setCustomColorHex('#808080');
  };

  const toggleSize = (size: string) =>
    setSelectedSizes(prev => { const n = new Set(prev); n.has(size) ? n.delete(size) : n.add(size); return n; });

  const addCustomSize = () => {
    const s = customSize.trim();
    if (!s) return;
    setSelectedSizes(prev => new Set(prev).add(s));
    setCustomSize('');
  };

  const images = [
    'https://placehold.co/400x400?text=Image',
    'https://placehold.co/400x400?text=Image',
    'https://placehold.co/400x400?text=Image',
    'https://placehold.co/400x400?text=Image'
  ];

  const tabs = [
    { id: 'general', label: 'General', icon: 'ri-information-line' },
    { id: 'pricing', label: 'Pricing & Inventory', icon: 'ri-price-tag-3-line' },
    { id: 'variants', label: 'Variants', icon: 'ri-layout-grid-line' },
    { id: 'images', label: 'Images', icon: 'ri-image-line' },
    { id: 'seo', label: 'SEO', icon: 'ri-search-line' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
          >
            <i className="ri-arrow-left-line text-xl text-gray-700"></i>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600 mt-1">Update product information and settings</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold whitespace-nowrap cursor-pointer">
            <i className="ri-eye-line mr-2"></i>
            Preview
          </button>
          <button className="px-6 py-3 bg-gray-700 hover:bg-primary text-white rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer">
            <i className="ri-save-line mr-2"></i>
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-gray-700 text-gray-700 bg-gray-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <i className={`${tab.icon} text-xl`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                  placeholder="Describe your product..."
                />
                <p className="text-sm text-gray-500 mt-2">{description.length}/500 characters</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 cursor-pointer"
                  >
                    <option>Bags & Accessories</option>
                    <option>Home Decor</option>
                    <option>Textiles</option>
                    <option>Lighting</option>
                    <option>Wall Art</option>
                    <option>Kitchen & Dining</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 cursor-pointer"
                  >
                    <option>Active</option>
                    <option>Draft</option>
                    <option>Archived</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 text-gray-700 border-gray-300 rounded focus:ring-gray-500 cursor-pointer"
                />
                <label className="text-gray-900 font-medium">
                  Feature this product on homepage
                </label>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-3xl">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Price (GH₵) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">GH₵</span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Compare at Price (GH₵)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-semibold">GH₵</span>
                    <input
                      type="number"
                      value={comparePrice}
                      onChange={(e) => setComparePrice(e.target.value)}
                      className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Show original price for comparison</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-900 font-semibold mb-1">Discount Calculation</p>
                <p className="text-blue-800">
                  Savings: GH₵ {(parseFloat(comparePrice) - parseFloat(price)).toFixed(2)} 
                  <span className="ml-2">
                    ({(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100).toFixed(0)}% off)
                  </span>
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      SKU *
                    </label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 font-mono"
                      placeholder="PROD-SKU-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">Get notified when stock falls below this number</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div className="space-y-8 max-w-3xl">

              {/* Step 1 — Colors */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-palette-line text-primary text-lg" />
                  <h3 className="font-bold text-gray-900">Step 1: Select Colors</h3>
                </div>
                <p className="text-sm text-gray-500 mb-5">Click colors to add/remove. Skip if product has no color options.</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {[...PRESET_COLORS, ...customColors].map(({ name, hex }) => {
                    const selected = selectedColors.has(name);
                    const isLight = ['White', 'Cream', 'Yellow', 'Beige', 'Silver', 'Gold'].includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => toggleColor(name)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all cursor-pointer ${
                          selected ? 'border-gray-700 bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-gray-700">{name}</span>
                        {selected && <i className="ri-check-line text-xs text-gray-700" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom color */}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customColorHex}
                    onChange={e => setCustomColorHex(e.target.value)}
                    className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={customColorName}
                    onChange={e => setCustomColorName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomColor()}
                    placeholder="Custom color name"
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                  <button
                    onClick={addCustomColor}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-primary text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Add Color
                  </button>
                </div>

                {selectedColors.size > 0 && (
                  <p className="text-xs text-gray-400 mt-3">
                    Selected: {Array.from(selectedColors).join(', ')}
                  </p>
                )}
              </div>

              {/* Step 2 — Sizes */}
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <i className="ri-ruler-line text-primary text-lg" />
                  <h3 className="font-bold text-gray-900">Step 2: Select Sizes</h3>
                </div>
                <p className="text-sm text-gray-500 mb-5">Click sizes to add/remove. Use custom for volumes (100ml), weights, etc.</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {PRESET_SIZES.map(size => {
                    const selected = selectedSizes.has(size);
                    return (
                      <button
                        key={size}
                        onClick={() => toggleSize(size)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer ${
                          selected ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {/* Custom size */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customSize}
                    onChange={e => setCustomSize(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addCustomSize()}
                    placeholder="Custom size (e.g. 100ml, One Size, 42)"
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                  <button
                    onClick={addCustomSize}
                    className="px-4 py-2.5 bg-gray-700 hover:bg-primary text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Add Size
                  </button>
                </div>

                {selectedSizes.size > 0 && (
                  <p className="text-xs text-gray-400 mt-3">
                    Selected: {Array.from(selectedSizes).join(', ')}
                  </p>
                )}
              </div>

            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Product Images</h3>
                <p className="text-gray-600">Add up to 10 images. First image will be the primary image.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={image} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-gray-700 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-xl">
                      <button className="w-9 h-9 flex items-center justify-center bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                        <i className="ri-eye-line"></i>
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>
                ))}
                
                <button className="aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-700 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-gray-700 cursor-pointer">
                  <i className="ri-upload-2-line text-3xl"></i>
                  <span className="text-sm font-semibold">Upload Image</span>
                </button>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Image Guidelines:</strong> Use high-quality images (min 1000x1000px), white or neutral backgrounds work best. 
                  Supported formats: JPG, PNG, WebP (max 5MB each).
                </p>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Search Engine Optimization</h3>
                <p className="text-gray-600">Optimize how this product appears in search results</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  defaultValue="Premium Leather Crossbody Bag - Elegant & Functional"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                <p className="text-sm text-gray-500 mt-2">60 characters recommended</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Meta Description
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  defaultValue="Discover our premium full-grain leather crossbody bag. Timeless elegance meets modern functionality with adjustable strap and secure compartments. Perfect for everyday use."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">160 characters recommended</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-gray-600 bg-gray-100 px-4 py-3 border-2 border-r-0 border-gray-300 rounded-l-lg">
                    {(typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL) || 'example.com'}/product/
                  </span>
                  <input
                    type="text"
                    defaultValue="premium-leather-crossbody-bag"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Keywords
                </label>
                <input
                  type="text"
                  defaultValue="leather bag, crossbody bag, premium accessories, women's bag"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
                <p className="text-sm text-gray-500 mt-2">Separate keywords with commas</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
