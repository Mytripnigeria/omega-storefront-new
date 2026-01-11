import { ExternalLink } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

const footerLinks = [
  { label: 'About Us', href: 'https://example.com/about' },
  { label: 'Contact', href: 'https://example.com/contact' },
  { label: 'Privacy Policy', href: 'https://example.com/privacy' },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-8 mb-20 lg:mb-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        {/* Mobile layout */}
        <div className="lg:hidden space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {link.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <ThemeSwitcher />
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Toasty
            </p>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {link.label}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Toasty. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
