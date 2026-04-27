'use client';

import { useState } from 'react';
import Link from 'next/link';
import LazyImage from './LazyImage';
import { useCart } from '@/context/CartContext';
import { useCMS } from '@/context/CMSContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice as formatCurrency } from '@/lib/formatCurrency';

const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
  navy: '#1E3A5F', green: '#22C55E', yellow: '#EAB308', orange: '#F97316',
  pink: '#EC4899', purple: '#A855F7', brown: '#92400E', beige: '#D4C5A9',
  grey: '#6B7280', gray: '#6B7280', cream: '#FFFDD0', teal: '#14B8A6',
  maroon: '#800000', coral: '#FF7F50', burgundy: '#800020', olive: '#808000',
  tan: '#D2B48C', khaki: '#C3B091', charcoal: '#36454F', ivory: '#FFFFF0',
  gold: '#FFD700', silver: '#C0C0C0', rose: '#FF007F', lavender: '#E6E6FA',
  mint: '#98FB98', peach: '#FFDAB9', wine: '#722F37', denim: '#1560BD',
  nude: '#E3BC9A', camel: '#C19A6B', sage: '#BCB88A', rust: '#B7410E',
  mustard: '#FFDB58', plum: '#8E4585', lilac: '#C8A2C8', stone: '#928E85',
  sand: '#C2B280', taupe: '#483C32', mauve: '#E0B0FF', sky: '#87CEEB',
  forest: '#228B22', cobalt: '#0047AB', emerald: '#50C878', scarlet: '#FF2400',
  aqua: '#00FFFF', turquoise: '#40E0D0', indigo: '#4B0082', crimson: '#DC143C',
  magenta: '#FF00FF', cyan: '#00FFFF', chocolate: '#7B3F00', coffee: '#6F4E37',
};

export function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  maxStock?: number;
  moq?: number;
  hasVariants?: boolean;
  minVariantPrice?: number;
  colorVariants?: ColorVariant[];
  brand?: string;
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 0,
  reviewCount = 0,
  badge,
  inStock = true,
  maxStock = 50,
  moq = 1,
  hasVariants = false,
  minVariantPrice,
  colorVariants = [],
  brand,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { getSetting } = useCMS();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const currencySymbol = getSetting('currency_symbol') || '$';

  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);

  const displayPrice = hasVariants && minVariantPrice ? minVariantPrice : price;
  const hasDiscount = !!(originalPrice && originalPrice > displayPrice);
  const discountPct = hasDiscount ? Math.round((1 - displayPrice / (originalPrice || 1)) * 100) : 0;
  const savings = hasDiscount ? (originalPrice! - displayPrice) : 0;
  const inWishlist = isInWishlist(id);
  const lowStock = inStock && maxStock > 0 && maxStock <= 5;
  const MAX_SWATCHES = 5;

  const formatPrice = (val: number) => formatCurrency(val, currencySymbol);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!inStock) return;
    addToCart({ id, name, price: displayPrice, image, quantity: moq, slug, maxStock, moq });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(id);
    } else {
      addToWishlist({
        id,
        name,
        price: displayPrice,
        originalPrice,
        image,
        rating,
        reviewCount,
        badge,
        inStock,
        slug,
      });
    }
  };

  return (
    <article className="group relative h-full flex flex-col bg-white transition-all duration-500 hover:-translate-y-1">
      {/* ── Image Frame ─────────────────────────────────────────── */}
      <Link
        href={`/product/${slug}`}
        className="relative block aspect-[5/4] overflow-hidden bg-[radial-gradient(ellipse_at_center,_#fafafa_0%,_#f0f0f0_100%)] rounded-xl ring-1 ring-black/5 transition-shadow duration-500 group-hover:ring-black/10 group-hover:shadow-[0_18px_40px_-18px_rgba(15,26,71,0.25)]"
        aria-label={`View ${name}`}
      >
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-contain p-3 sm:p-4 transition-transform duration-700 ease-out group-hover:scale-110"
        />

        {/* Badges — top-left, vertical stack so they never overlap */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none">
          {badge && (
            <span className="inline-flex items-center gap-1 bg-black/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full shadow-sm">
              <span className="w-1 h-1 rounded-full bg-amber-400" />
              {badge}
            </span>
          )}
          {hasDiscount && (
            <span className="inline-flex items-center bg-red-500 text-white text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1 rounded-full shadow-sm">
              −{discountPct}%
            </span>
          )}
        </div>

        {/* Wishlist heart — top-right, glassmorphic */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWishlist}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 ${
            inWishlist
              ? 'bg-red-500 text-white'
              : 'bg-white/80 text-gray-700 hover:bg-white hover:text-red-500 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'
          }`}
        >
          <i className={`${inWishlist ? 'ri-heart-fill' : 'ri-heart-line'} text-base`} />
        </button>

        {/* Stock indicator — bottom-right */}
        {inStock && lowStock && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ring-1 ring-amber-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
            </span>
            Only {maxStock} left
          </span>
        )}

        {/* Quick view — bottom-left, slides in on hover */}
        {inStock && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-md text-gray-900 text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <i className="ri-eye-line text-sm" />
            Quick view
          </span>
        )}

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white text-[11px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* ── Info ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-grow pt-2.5 px-0.5">
        {/* Brand + rating on one line */}
        {(brand || rating > 0) && (
          <div className="flex items-center justify-between gap-2 mb-1">
            {brand ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400 truncate">
                {brand}
              </p>
            ) : <span />}
            {rating > 0 && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <i className="ri-star-fill text-[11px] text-amber-400" />
                <span className="text-[11px] text-gray-500 font-medium">
                  {rating.toFixed(1)}{reviewCount > 0 ? ` (${reviewCount})` : ''}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Name */}
        <Link href={`/product/${slug}`} className="mb-1.5">
          <h3 className="font-serif text-sm sm:text-[15px] leading-snug text-gray-900 line-clamp-2 transition-colors group-hover:text-primary">
            {name}
          </h3>
        </Link>

        {/* Color swatches */}
        {colorVariants.length > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {colorVariants.slice(0, MAX_SWATCHES).map((color) => (
              <button
                key={color.name}
                title={color.name}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveColor(activeColor === color.name ? null : color.name);
                }}
                className={`relative w-4 h-4 rounded-full transition-all duration-200 flex-shrink-0 ${
                  activeColor === color.name
                    ? 'ring-2 ring-offset-1 ring-gray-900 scale-110'
                    : 'ring-1 ring-black/10 hover:scale-110 hover:ring-gray-400'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={`Color: ${color.name}`}
              />
            ))}
            {colorVariants.length > MAX_SWATCHES && (
              <span className="text-[10px] text-gray-400 ml-0.5 font-medium">
                +{colorVariants.length - MAX_SWATCHES}
              </span>
            )}
          </div>
        )}

        {/* Price block */}
        <div className="mt-auto mb-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-sans text-base sm:text-lg font-bold text-gray-900 tracking-tight leading-none">
              {hasVariants && minVariantPrice != null ? `From ${formatPrice(minVariantPrice)}` : formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through font-medium">
                {formatPrice(originalPrice!)}
              </span>
            )}
            {hasDiscount && (
              <span className="text-[10px] font-semibold text-emerald-600 ml-auto tracking-wide">
                Save {formatPrice(savings)}
              </span>
            )}
          </div>
        </div>

        {/* CTA */}
        {hasVariants ? (
          <Link
            href={`/product/${slug}`}
            className="group/btn relative w-full flex items-center justify-center gap-2 bg-white border border-gray-900 text-gray-900 font-semibold text-xs py-2 px-3 rounded-full overflow-hidden transition-colors hover:bg-gray-900 hover:text-white"
          >
            <i className="ri-settings-3-line text-base transition-transform group-hover/btn:rotate-90" />
            <span>Select Options</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`group/btn relative w-full flex items-center justify-center gap-2 font-semibold text-xs py-2 px-3 rounded-full overflow-hidden transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-gray-900 text-white hover:bg-primary'
            }`}
          >
            {justAdded ? (
              <>
                <i className="ri-check-line text-base" />
                <span>Added to cart</span>
              </>
            ) : (
              <>
                <i className="ri-shopping-bag-line text-base transition-transform group-hover/btn:-translate-y-0.5" />
                <span>Add to cart</span>
                <i className="ri-arrow-right-line text-base opacity-0 -ml-2 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:ml-0" />
              </>
            )}
          </button>
        )}
      </div>
    </article>
  );
}
