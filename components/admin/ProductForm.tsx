'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
    initialData?: any;
    isEditMode?: boolean;
}

export default function ProductForm({ initialData, isEditMode = false }: ProductFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    const [productName, setProductName] = useState(initialData?.name || '');
    const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
    const [price, setPrice] = useState(initialData?.price || '');
    const [comparePrice, setComparePrice] = useState(initialData?.compare_at_price || '');
    const [sku, setSku] = useState(initialData?.sku || '');
    const [stock, setStock] = useState(initialData?.quantity || '');
    const [moq, setMoq] = useState(initialData?.moq || '1');
    const [lowStockThreshold, setLowStockThreshold] = useState(initialData?.metadata?.low_stock_threshold || '5');
    const [description, setDescription] = useState(initialData?.description || '');
    const [status, setStatus] = useState(initialData?.status || 'Active');
    const [featured, setFeatured] = useState(initialData?.featured || false);
    const [preorderShipping, setPreorderShipping] = useState(initialData?.metadata?.preorder_shipping || '');
    const [activeTab, setActiveTab] = useState('general');

    // Auto-generate SKU function
    const generateSku = () => {
        const prefix = process.env.NEXT_PUBLIC_SKU_PREFIX || 'SKU';
        const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    };

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

    // ── Default Product Option Groups ──────────────────────────────────
    type OptionGroupDef = {
        key: string;
        label: string;
        type: 'values' | 'color';
        defaultValues: string[];
        generatesVariants: boolean;
    };

    const DEFAULT_OPTION_GROUPS: OptionGroupDef[] = [
        { key: 'color', label: 'Color', type: 'color', defaultValues: [], generatesVariants: false },
        { key: 'size',  label: 'Size',  type: 'values', defaultValues: [], generatesVariants: true },
    ];

    // State: which option groups are enabled + their current values
    type OptionGroupState = {
        enabled: boolean;
        values: string[];
        generatesVariants: boolean;
    };

    const [optionGroupStates, setOptionGroupStates] = useState<Record<string, OptionGroupState>>(() => {
        const stored = initialData?.metadata?.product_options as Record<string, { values: string[]; generatesVariants?: boolean }> | undefined;
        const state: Record<string, OptionGroupState> = {};
        DEFAULT_OPTION_GROUPS.forEach(def => {
            if (stored && stored[def.key]) {
                state[def.key] = {
                    enabled: true,
                    values: stored[def.key].values || def.defaultValues,
                    generatesVariants: stored[def.key].generatesVariants ?? def.generatesVariants,
                };
            } else {
                state[def.key] = {
                    enabled: false,
                    values: def.defaultValues,
                    generatesVariants: def.generatesVariants,
                };
            }
        });
        return state;
    });

    // Custom (non-default) option groups — for other product types
    const [customGroups, setCustomGroups] = useState<{ name: string; values: string[]; generatesVariants: boolean }[]>(() => {
        const storedCustom = initialData?.metadata?.custom_option_groups as { name: string; values: string[]; generatesVariants?: boolean }[] | undefined;
        return (storedCustom || []).map((g) => ({ ...g, generatesVariants: g.generatesVariants ?? true }));
    });
    const [customGroupInput, setCustomGroupInput] = useState('');

    // Color picker state
    const [colorPickerHex, setColorPickerHex] = useState('#000000');
    const [colorPickerName, setColorPickerName] = useState('');

    const [customOptionInput, setCustomOptionInput] = useState<Record<string, string>>({});

    const toggleOptionGroup = (key: string) => {
        setOptionGroupStates(prev => ({
            ...prev,
            [key]: { ...prev[key], enabled: !prev[key].enabled },
        }));
    };

    const toggleGeneratesVariants = (key: string) => {
        setOptionGroupStates(prev => ({
            ...prev,
            [key]: { ...prev[key], generatesVariants: !prev[key].generatesVariants },
        }));
    };

    const addValueToGroup = (key: string, value: string) => {
        if (!value.trim()) return;
        setOptionGroupStates(prev => {
            const g = prev[key];
            if (g.values.includes(value.trim())) return prev;
            return { ...prev, [key]: { ...g, values: [...g.values, value.trim()] } };
        });
        setCustomOptionInput(prev => ({ ...prev, [key]: '' }));
    };

    const removeValueFromGroup = (key: string, value: string) => {
        setOptionGroupStates(prev => ({
            ...prev,
            [key]: { ...prev[key], values: prev[key].values.filter(v => v !== value) },
        }));
    };

    const addColorValue = () => {
        const label = colorPickerName.trim() || colorPickerHex;
        const colorVal = `${label}|${colorPickerHex}`;
        setOptionGroupStates(prev => {
            const g = prev['color'];
            if (g.values.some(v => v.split('|')[1] === colorPickerHex)) return prev;
            return { ...prev, color: { ...g, values: [...g.values, colorVal] } };
        });
        setColorPickerName('');
    };

    const togglePresetColor = (name: string, hex: string) => {
        const existing = optionGroupStates['color']?.values.find(v => v.startsWith(name + '|'));
        if (existing) {
            const newVals = optionGroupStates['color'].values.filter(v => !v.startsWith(name + '|'));
            setOptionGroupStates(prev => ({ ...prev, color: { ...prev['color'], values: newVals, enabled: newVals.length > 0 } }));
        } else {
            setOptionGroupStates(prev => ({ ...prev, color: { ...prev['color'], values: [...prev['color'].values, `${name}|${hex}`], enabled: true } }));
        }
    };

    const togglePresetSize = (size: string) => {
        const grp = optionGroupStates['size'];
        if (!grp) return;
        if (grp.values.includes(size)) {
            const newVals = grp.values.filter(v => v !== size);
            setOptionGroupStates(prev => ({ ...prev, size: { ...prev['size'], values: newVals, enabled: newVals.length > 0 } }));
        } else {
            setOptionGroupStates(prev => ({ ...prev, size: { ...prev['size'], values: [...prev['size'].values, size], enabled: true } }));
        }
    };

    const resetGroupToDefaults = (key: string) => {
        const def = DEFAULT_OPTION_GROUPS.find(d => d.key === key);
        if (!def) return;
        setOptionGroupStates(prev => ({
            ...prev,
            [key]: { ...prev[key], values: def.defaultValues },
        }));
    };

    // Custom group helpers
    const addCustomGroup = () => {
        const name = customGroupInput.trim();
        if (!name || customGroups.some(g => g.name === name)) return;
        setCustomGroups(prev => [...prev, { name, values: [], generatesVariants: false }]);
        setCustomGroupInput('');
    };
    const removeCustomGroup = (idx: number) => setCustomGroups(prev => prev.filter((_, i) => i !== idx));
    const addCustomGroupValue = (idx: number, val: string) => {
        if (!val.trim()) return;
        setCustomGroups(prev => prev.map((g, i) => i === idx && !g.values.includes(val.trim()) ? { ...g, values: [...g.values, val.trim()] } : g));
        setCustomOptionInput(prev => ({ ...prev, [`custom_${idx}`]: '' }));
    };
    const removeCustomGroupValue = (idx: number, val: string) => {
        setCustomGroups(prev => prev.map((g, i) => i === idx ? { ...g, values: g.values.filter(v => v !== val) } : g));
    };

    // Build the variant-generating groups for price/stock table
    const enabledDefaults = DEFAULT_OPTION_GROUPS.filter(d => optionGroupStates[d.key]?.enabled && optionGroupStates[d.key]?.values.length > 0);
    const variantGeneratingGroups = [
        ...enabledDefaults.filter(d => optionGroupStates[d.key].generatesVariants).map(d => ({
            name: d.label,
            values: d.key === 'color' ? optionGroupStates[d.key].values.map(v => v.split('|')[0]) : optionGroupStates[d.key].values,
        })),
        ...customGroups.filter(g => g.generatesVariants && g.values.length > 0).map(g => ({ name: g.name, values: g.values })),
    ];

    // Legacy compat: optionGroups / activeGroups used in handleSubmit
    const activeGroups = variantGeneratingGroups;

    const existingVariants = (initialData?.product_variants || []).map((v: any) => ({
        ...v,
        stock: v.stock ?? v.quantity ?? 0,
    }));

    // Variant data map keyed by joined option values
    const [variantData, setVariantData] = useState<Record<string, { price: string; stock: string; sku: string }>>(() => {
        const data: Record<string, { price: string; stock: string; sku: string }> = {};
        const storedNames: string[] = initialData?.metadata?.option_names || [];
        (initialData?.product_variants || []).forEach((v: any) => {
            const values = storedNames
                .map((_: string, idx: number) => (v[`option${idx + 1}`] as string) || '')
                .filter(Boolean);
            if (values.length > 0) {
                data[values.join('|||')] = {
                    price: v.price?.toString() || '',
                    stock: (v.stock ?? v.quantity ?? 0).toString(),
                    sku: v.sku || '',
                };
            }
        });
        return data;
    });

    const cartesian = (arrays: string[][]): string[][] => {
        if (arrays.length === 0) return [[]];
        const [first, ...rest] = arrays;
        const restProduct = cartesian(rest);
        return first.flatMap(item => restProduct.map(combo => [item, ...combo]));
    };

    const variantCombinations = activeGroups.length > 0
        ? cartesian(activeGroups.map(g => g.values)).map(values => ({
            values,
            key: values.join('|||'),
        }))
        : [];

    const variants = variantCombinations.map(combo => {
        const d = variantData[combo.key] || { price: price?.toString() || '', stock: '0', sku: '' };
        return { values: combo.values, sku: d.sku, price: d.price || price?.toString() || '', stock: d.stock || '0' };
    });

    const updateVariantField = (key: string, field: string, value: string) => {
        setVariantData(prev => ({
            ...prev,
            [key]: { ...prev[key] || { price: price?.toString() || '', stock: '0', sku: '' }, [field]: value },
        }));
    };

    const bulkSetField = (field: 'price' | 'stock', value: string) => {
        setVariantData(prev => {
            const updated = { ...prev };
            variantCombinations.forEach(combo => {
                updated[combo.key] = { ...updated[combo.key] || { price: price?.toString() || '', stock: '0', sku: '' }, [field]: value };
            });
            return updated;
        });
    };

    // Images
    const [images, setImages] = useState<any[]>(initialData?.product_images || []);
    const [uploading, setUploading] = useState(false);

    // SEO
    const [seoTitle, setSeoTitle] = useState(initialData?.seo_title || '');
    const [metaDescription, setMetaDescription] = useState(initialData?.seo_description || '');
    const [urlSlug, setUrlSlug] = useState(initialData?.slug || '');
    const [keywords, setKeywords] = useState(initialData?.tags?.join(', ') || '');

    const tabs = [
        { id: 'general', label: 'General', icon: 'ri-information-line' },
        { id: 'pricing', label: 'Pricing & Inventory', icon: 'ri-price-tag-3-line' },
        { id: 'variants', label: 'Variants', icon: 'ri-layout-grid-line' },
        { id: 'images', label: 'Images', icon: 'ri-image-line' },
        { id: 'seo', label: 'SEO', icon: 'ri-search-line' }
    ];

    // Fetch categories on mount
    useEffect(() => {
        async function fetchCategories() {
            const { data } = await supabase.from('categories').select('id, name').eq('status', 'active');
            if (data) {
                setCategories(data);
                if (data.length > 0 && !categoryId) {
                    setCategoryId(data[0].id);
                }
            }
        }
        fetchCategories();
    }, [categoryId]);

    // Auto-generate slug from name if not manually edited
    useEffect(() => {
        if (!isEditMode && productName && !urlSlug) {
            setUrlSlug(productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [productName, isEditMode, urlSlug]);

    // Auto-generate SKU for new products
    useEffect(() => {
        if (!isEditMode && !sku) {
            setSku(generateSku());
        }
    }, [isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

    const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    const isVideoFile = (url: string) => /\.(mp4|webm|ogg|mov|avi)$/i.test(url);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;

            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('products')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(filePath);

            setImages([...images, { url: publicUrl, position: images.length, is_video: VIDEO_TYPES.includes(file.type) }]);

        } catch (error: any) {
            alert('Error uploading file: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(images.filter((_, idx) => idx !== indexToRemove));
    };

    // Variant helpers removed — variants are now auto-generated from selectedColors × selectedSizes

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // If product has variants, auto-sync main stock = sum of variant stocks
            const hasVariants = variants.length > 0;
            const variantStockTotal = hasVariants
                ? variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)
                : parseInt(stock) || 0;

            const productData = {
                name: productName,
                slug: urlSlug || productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
                description,
                category_id: categoryId || null,
                price: parseFloat(price) || 0,
                compare_at_price: comparePrice ? parseFloat(comparePrice) : null,
                sku: sku || generateSku(), // Auto-generate if empty
                quantity: hasVariants ? variantStockTotal : (parseInt(stock) || 0),
                moq: parseInt(moq) || 1,
                status: status.toLowerCase(),
                featured,
                seo_title: seoTitle,
                seo_description: metaDescription,
                tags: (keywords as string).split(',').map((k: string) => k.trim()).filter(Boolean),
                metadata: {
                    low_stock_threshold: parseInt(lowStockThreshold) || 5,
                    preorder_shipping: preorderShipping.trim() || null,
                    option_names: activeGroups.map((g, i) => g.name || `Option ${i + 1}`),
                    product_options: Object.fromEntries(
                        enabledDefaults.map(d => [d.key, {
                            values: optionGroupStates[d.key].values,
                            generatesVariants: optionGroupStates[d.key].generatesVariants,
                        }])
                    ),
                    custom_option_groups: customGroups.filter(g => g.values.length > 0),
                }
            };

            let productId = initialData?.id;
            let error;

            if (isEditMode && productId) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', productId);
                error = updateError;
            } else {
                // Create new
                const { data: newProduct, error: insertError } = await supabase
                    .from('products')
                    .insert([productData])
                    .select()
                    .single();

                if (newProduct) productId = newProduct.id;
                error = insertError;
            }

            if (error) throw error;

            // Update Images
            if (productId) {
                // Strategy: We will just delete all old images/variants and recreate them for simplicity in this MVP.
                // In a clearer implementation, we would diff them.

                // 1. Images
                if (isEditMode) {
                    await supabase.from('product_images').delete().eq('product_id', productId);
                }
                if (images.length > 0) {
                    const imageInserts = images.map((img, idx) => ({
                        product_id: productId,
                        url: img.url,
                        position: idx,
                        alt_text: productName
                    }));
                    await supabase.from('product_images').insert(imageInserts);
                }

                // 2. Variants
                if (isEditMode) {
                    // Be careful not to delete ALL variants if we want to preserve IDs etc, 
                    // but for now, full replacement is safer to ensure sync.
                    // Note: This might break order-item references if they rely on variant_id hard constraints without cascading.
                    // Our Schema migration has ON DELETE SET NULL for order_items -> variant_id, so this is safe for now (but distinct from "archiving").
                    await supabase.from('product_variants').delete().eq('product_id', productId);
                }

                if (variants.length > 0) {
                    const variantInserts = variants.map(v => ({
                        product_id: productId,
                        name: v.values.join(' / ') || 'Default',
                        sku: v.sku || null,
                        price: parseFloat(v.price) || 0,
                        quantity: parseInt(v.stock) || 0,
                        option1: v.values[0] || null,
                        option2: v.values[1] || null,
                        option3: v.values[2] || null,
                        metadata: {},
                    }));
                    const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
                    if (varError) throw varError;
                }
            }

            alert(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
            router.push('/admin/products');

        } catch (err: any) {
            console.error('Error saving product:', err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-3xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Product' : 'Add New Product'}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEditMode ? 'Update product information and settings' : 'Create a new product for your catalog'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {isEditMode && (
                        <Link
                            href={`/product/${initialData?.id}`}
                            target="_blank"
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-semibold whitespace-nowrap cursor-pointer flex items-center"
                        >
                            <i className="ri-eye-line mr-2"></i>
                            Preview
                        </Link>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`px-6 py-3 bg-primary hover:bg-primary text-white rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <i className="ri-loader-4-line animate-spin mr-2"></i>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="ri-save-line mr-2"></i>
                                {isEditMode ? 'Save Changes' : 'Create Product'}
                            </>
                        )}
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
                                className={`flex items-center space-x-2 px-6 py-4 font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900 bg-gray-50'
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
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
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none"
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
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 cursor-pointer"
                                    >
                                        {categories.length === 0 && <option value="">Loading categories...</option>}
                                        {categories.length > 0 && <option value="">Select a category</option>}
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full px-4 py-3 pr-8 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 cursor-pointer"
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
                                    className="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-600 cursor-pointer"
                                />
                                <label className="text-gray-900 font-medium">
                                    Feature this product on homepage
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Pre-order / Estimated Shipping
                                </label>
                                <input
                                    type="text"
                                    value={preorderShipping}
                                    onChange={(e) => setPreorderShipping(e.target.value)}
                                    placeholder="e.g., Ships in 14 days, Available March 15"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty if product ships immediately. Otherwise, enter estimated shipping time.</p>
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
                                            className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                            step="0.01"
                                            placeholder="0.00"
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
                                            className="w-full pl-16 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Show original price for comparison</p>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-900 font-semibold mb-1">Discount Calculation</p>
                                {price && comparePrice && parseFloat(comparePrice) > parseFloat(price) ? (
                                    <p className="text-blue-800">
                                        Savings: GH₵ {(parseFloat(comparePrice) - parseFloat(price)).toFixed(2)}
                                        <span className="ml-2">
                                            ({(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100).toFixed(0)}% off)
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-blue-800 text-sm">Enter a valid compare price higher than the price to see discount.</p>
                                )}
                            </div>

                            <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Inventory</h3>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            SKU (Auto-generated)
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={sku}
                                                onChange={(e) => setSku(e.target.value)}
                                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 font-mono bg-gray-50"
                                                placeholder="Auto-generated"
                                                readOnly
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setSku(generateSku())}
                                                className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                                                title="Generate new SKU"
                                            >
                                                <i className="ri-refresh-line text-lg"></i>
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">SKU is auto-generated. Click refresh to generate a new one.</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Stock Quantity *
                                        </label>
                                        {variants.length > 0 ? (
                                            <div>
                                                <input
                                                    type="number"
                                                    value={variants.reduce((sum: number, v: any) => sum + (parseInt(v.stock) || 0), 0)}
                                                    readOnly
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                                />
                                                <p className="text-sm text-amber-600 mt-1 flex items-center">
                                                    <i className="ri-information-line mr-1"></i>
                                                    Stock is managed per variant. Edit stock in the Variants tab.
                                                </p>
                                            </div>
                                        ) : (
                                            <input
                                                type="number"
                                                value={stock}
                                                onChange={(e) => setStock(e.target.value)}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                                placeholder="0"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mt-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Minimum Order Quantity (MOQ)
                                        </label>
                                        <input
                                            type="number"
                                            value={moq}
                                            onChange={(e) => setMoq(e.target.value)}
                                            min="1"
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                            placeholder="1"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Minimum quantity customers must order</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                                            Low Stock Threshold
                                        </label>
                                        <input
                                            type="number"
                                            value={lowStockThreshold}
                                            onChange={(e) => setLowStockThreshold(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                        />
                                        <p className="text-sm text-gray-500 mt-1">Get notified when stock falls below this number</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'variants' && (
                        <div className="space-y-6 max-w-3xl">

                            {/* Step 1 — Colors */}
                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <i className="ri-palette-line text-primary text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Step 1: Select Colors</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-5">Click colors to add/remove. Skip if product has no color options.</p>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {PRESET_COLORS.map(({ name, hex }) => {
                                        const selected = optionGroupStates['color']?.values.some(v => v.startsWith(name + '|'));
                                        return (
                                            <button
                                                key={name}
                                                type="button"
                                                onClick={() => togglePresetColor(name, hex)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all cursor-pointer ${selected ? 'border-gray-900 bg-gray-50 shadow-sm' : 'border-gray-200 hover:border-gray-400'}`}
                                            >
                                                <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: hex }} />
                                                <span className="text-gray-700">{name}</span>
                                                {selected && <i className="ri-check-line text-xs text-gray-700"></i>}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom color */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={colorPickerHex}
                                        onChange={e => setColorPickerHex(e.target.value)}
                                        className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer p-0.5 flex-shrink-0"
                                    />
                                    <input
                                        type="text"
                                        value={colorPickerName}
                                        onChange={e => setColorPickerName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addColorValue()}
                                        placeholder="Custom color name"
                                        className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={addColorValue}
                                        className="px-4 py-2.5 bg-gray-700 hover:bg-primary text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                                    >
                                        Add Color
                                    </button>
                                </div>

                                {(optionGroupStates['color']?.values.length ?? 0) > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {optionGroupStates['color'].values.map(val => {
                                            const [name, hex] = val.split('|');
                                            return (
                                                <span key={val} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium shadow-sm">
                                                    <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: hex || '#000' }} />
                                                    {name}
                                                    <button type="button" onClick={() => removeValueFromGroup('color', val)} className="text-gray-400 hover:text-red-500 ml-1">
                                                        <i className="ri-close-line text-xs"></i>
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Step 2 — Sizes */}
                            <div className="border border-gray-200 rounded-xl p-6">
                                <div className="flex items-center gap-2 mb-1">
                                    <i className="ri-ruler-line text-primary text-lg"></i>
                                    <h3 className="font-bold text-gray-900">Step 2: Select Sizes</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-5">Click sizes to add/remove. Use custom for volumes (100ml), weights, etc.</p>

                                <div className="flex flex-wrap gap-2 mb-5">
                                    {PRESET_SIZES.map(size => {
                                        const selected = optionGroupStates['size']?.values.includes(size);
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => togglePresetSize(size)}
                                                className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all cursor-pointer ${selected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-700 hover:border-gray-400'}`}
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
                                        value={customOptionInput['size'] || ''}
                                        onChange={e => setCustomOptionInput(prev => ({ ...prev, size: e.target.value }))}
                                        onKeyDown={e => e.key === 'Enter' && addValueToGroup('size', customOptionInput['size'] || '')}
                                        placeholder="Custom size (e.g. 100ml, One Size, 42)"
                                        className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addValueToGroup('size', customOptionInput['size'] || '')}
                                        className="px-4 py-2.5 bg-gray-700 hover:bg-primary text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                                    >
                                        Add Size
                                    </button>
                                </div>

                                {(optionGroupStates['size']?.values.filter(v => !PRESET_SIZES.includes(v)).length ?? 0) > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {optionGroupStates['size'].values.filter(v => !PRESET_SIZES.includes(v)).map(val => (
                                            <span key={val} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm font-medium shadow-sm">
                                                {val}
                                                <button type="button" onClick={() => removeValueFromGroup('size', val)} className="text-gray-400 hover:text-red-500">
                                                    <i className="ri-close-line text-xs"></i>
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Variant Price/Stock Grid */}
                            {variantCombinations.length > 0 && (
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                                        <h4 className="text-sm font-bold text-gray-900 flex items-center">
                                            <i className="ri-grid-line mr-2 text-lg text-purple-600"></i>
                                            Set Price & Stock — {variantCombinations.length} variant{variantCombinations.length > 1 ? 's' : ''}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => { const val = prompt('Set price for ALL variants:', price?.toString() || '0'); if (val !== null) bulkSetField('price', val); }}
                                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Bulk Set Price
                                            </button>
                                            <button
                                                onClick={() => { const val = prompt('Set stock for ALL variants:', '0'); if (val !== null) bulkSetField('stock', val); }}
                                                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                                            >
                                                Bulk Set Stock
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 border-b border-gray-200">
                                                <tr>
                                                    {activeGroups.map((g, i) => (
                                                        <th key={i} className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                            {g.name || `Option ${i + 1}`}
                                                        </th>
                                                    ))}
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price (GH₵)</th>
                                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variantCombinations.map((combo) => {
                                                    const d = variantData[combo.key] || { price: price?.toString() || '', stock: '0', sku: '' };
                                                    return (
                                                        <tr key={combo.key} className="border-b border-gray-100 hover:bg-gray-50">
                                                            {combo.values.map((val, vi) => (
                                                                <td key={vi} className="py-3 px-4">
                                                                    <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded">{val}</span>
                                                                </td>
                                                            ))}
                                                            <td className="py-3 px-4">
                                                                <input
                                                                    type="number"
                                                                    value={d.price}
                                                                    onChange={(e) => updateVariantField(combo.key, 'price', e.target.value)}
                                                                    className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                                                                    step="0.01"
                                                                    placeholder={price?.toString() || '0'}
                                                                />
                                                            </td>
                                                            <td className="py-3 px-4">
                                                                <input
                                                                    type="number"
                                                                    value={d.stock}
                                                                    onChange={(e) => updateVariantField(combo.key, 'stock', e.target.value)}
                                                                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                                                                    placeholder="0"
                                                                />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                                        <p className="text-xs text-gray-800 flex items-center">
                                            <i className="ri-information-line mr-1.5"></i>
                                            Total stock across all variants: <strong className="ml-1">{variants.reduce((sum, v) => sum + (parseInt(v.stock) || 0), 0)}</strong>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {variantCombinations.length === 0 && (
                                <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <i className="ri-list-settings-line text-4xl text-gray-300 mb-3 block"></i>
                                    <p className="font-semibold text-gray-700">No size variants yet</p>
                                    <p className="text-sm mt-1 text-gray-400">Select sizes above to generate a price &amp; stock table per size. Colors are selection-only and won&apos;t generate separate variants.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'images' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Product Media</h3>
                                <p className="text-gray-600">Add images and/or videos. The first item will be the primary media.</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img: any, index: number) => {
                                    const isVid = img.is_video || isVideoFile(img.url);
                                    return (
                                        <div key={index} className="relative group">
                                            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                                                {isVid ? (
                                                    <video
                                                        src={img.url}
                                                        className="w-full h-full object-cover"
                                                        muted
                                                        playsInline
                                                        loop
                                                        onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                                                        onMouseLeave={e => { (e.currentTarget as HTMLVideoElement).pause(); (e.currentTarget as HTMLVideoElement).currentTime = 0; }}
                                                    />
                                                ) : (
                                                    <img src={img.url} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="absolute top-2 left-2 flex gap-1">
                                                {index === 0 && (
                                                    <span className="bg-primary text-white px-2 py-1 rounded text-xs font-semibold">Primary</span>
                                                )}
                                                {isVid && (
                                                    <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                                        <i className="ri-video-line text-xs"></i> Video
                                                    </span>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 rounded-xl">
                                                <a href={img.url} target="_blank" rel="noreferrer" className="w-9 h-9 flex items-center justify-center bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                                    <i className="ri-eye-line"></i>
                                                </a>
                                                <button
                                                    onClick={() => handleRemoveImage(index)}
                                                    className="w-9 h-9 flex items-center justify-center bg-white text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                                >
                                                    <i className="ri-delete-bin-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}

                                <label className={`aspect-square border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-colors flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-gray-900 cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    {uploading ? (
                                        <i className="ri-loader-4-line animate-spin text-3xl"></i>
                                    ) : (
                                        <i className="ri-add-circle-line text-3xl"></i>
                                    )}
                                    <span className="text-sm font-semibold text-center px-2">{uploading ? 'Uploading...' : 'Image or Video'}</span>
                                    <input
                                        type="file"
                                        accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>

                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-700">
                                    <strong>Images:</strong> JPG, PNG, WebP — min 1000×1000px recommended. &nbsp;|&nbsp;
                                    <strong>Videos:</strong> MP4, WebM, MOV, AVI — hover to preview. Videos play automatically on the product page.
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
                                    value={seoTitle}
                                    onChange={(e) => setSeoTitle(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                    placeholder="Seo friendly title"
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
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600 resize-none"
                                    placeholder="Seo friendly description"
                                />
                                <p className="text-sm text-gray-500 mt-2">160 characters recommended</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    URL Slug
                                </label>
                                <div className="flex items-center">
                                    <span className="text-gray-600 bg-gray-100 px-4 py-3 border-2 border-r-0 border-gray-300 rounded-l-lg">
                                        store.com/product/
                                    </span>
                                    <input
                                        type="text"
                                        value={urlSlug}
                                        onChange={(e) => setUrlSlug(e.target.value)}
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                        placeholder="product-slug"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Keywords
                                </label>
                                <input
                                    type="text"
                                    value={keywords}
                                    onChange={(e) => setKeywords(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-600 focus:border-gray-600"
                                    placeholder="keyword1, keyword2"
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
