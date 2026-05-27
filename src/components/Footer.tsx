import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStorefront } from '@/context/StorefrontContext';
import { storefrontApi, type StorefrontPage } from '@/services/storefront';

/**
 * Footer renders the live storefront pages (About, Contact, Privacy, etc.)
 * as configured in the merchant hub. Pages and the business name are pulled
 * from the public storefront API so there's no hardcoded content here.
 */
export const Footer = () => {
  const { config } = useStorefront();
  const [pages, setPages] = useState<StorefrontPage[]>([]);

  useEffect(() => {
    let cancelled = false;
    storefrontApi
      .getPages()
      .then((res) => {
        if (cancelled) return;
        const published = (res ?? [])
          .filter((p) => p.status === 'published')
          .sort((a, b) => a.position - b.position);
        setPages(published);
      })
      .catch(() => {
        // Failure leaves the footer with brand-only — preferable to dead links.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const brand = config?.storeName ?? '';
  const year = new Date().getFullYear();
  const copyright = brand
    ? `© ${year} ${brand}. All rights reserved.`
    : `© ${year}. All rights reserved.`;

  return (
    <footer className="border-t border-border bg-card mt-8 mb-20 lg:mb-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Mobile layout */}
        <div className="lg:hidden space-y-4">
          {pages.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  to={`/p/${page.slug}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {page.name}
                </Link>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{copyright}</p>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-6">
            {pages.map((page) => (
              <Link
                key={page.id}
                to={`/p/${page.slug}`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {page.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{copyright}</p>
        </div>
      </div>
    </footer>
  );
};
