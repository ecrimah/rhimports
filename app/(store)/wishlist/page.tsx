'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import PageHero from '@/components/PageHero';
import AnimatedSection from '@/components/AnimatedSection';
import { HERO_IMAGES_OTHER_PAGES } from '@/lib/hero-images';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function WishlistPage() {
  usePageTitle('Wishlist');
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
      slug: item.slug,
      maxStock: item.inStock ? 50 : 0,
      moq: 1,
    });
    removeFromWishlist(item.id);
  };

  const hasItems = wishlist.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHero
        title="Your Wishlist"
        subtitle="Save items you love and move them to your cart when you're ready."
        backgroundImage={HERO_IMAGES_OTHER_PAGES[6]}
      />

      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!hasItems ? (
          <AnimatedSection className="py-20">
            <div className="max-w-2xl mx-auto text-center">
              <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 bg-gray-200 rounded-full">
                <i className="ri-heart-3-line text-5xl text-gray-400"></i>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your wishlist is empty</h1>
              <p className="text-gray-600 mb-8 text-lg">
                Start exploring our collection and add items you like to your wishlist.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-primary hover:bg-primary text-white px-8 py-4 rounded-lg font-semibold transition-all hover:-translate-y-1 hover:shadow-lg whitespace-nowrap"
              >
                Browse Products
              </Link>
            </div>
          </AnimatedSection>
        ) : (
          <AnimatedSection direction="up" delay={0.05} className="py-8">
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wishlist</h1>
                <p className="text-gray-600 mt-1">
                  You have <span className="font-semibold">{wishlist.length}</span> item
                  {wishlist.length > 1 ? 's' : ''} saved for later.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/cart"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-100"
                >
                  Go to Cart
                </Link>
                <button
                  type="button"
                  onClick={clearWishlist}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-red-200 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 flex gap-4 sm:gap-6"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="112px"
                      className="object-cover object-top"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 hover:text-gray-900 line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.inStock ? 'In stock' : 'Currently unavailable'}
                      </p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          GH₵{item.price.toFixed(2)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-gray-500 line-through">
                            GH₵{item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleMoveToCart(item)}
                        disabled={!item.inStock}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-800 hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}

