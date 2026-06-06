import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { GoogleAuthButton } from '@/components/GoogleAuthButton';

interface SignInSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Lightweight sign-in prompt shown from the bottom nav for guest users.
 * Offers email + password (via the /login and /register pages) and a
 * "Continue with Google" shortcut.
 */
export const SignInSheet = ({ isOpen, onClose }: SignInSheetProps) => {
  useBodyScrollLock(isOpen);
  const navigate = useNavigate();

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-foreground/50 z-50 transition-opacity duration-300 safari-fix',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          'lg:flex lg:items-center lg:justify-center',
        )}
        onClick={onClose}
      />

      {/* Sheet - Bottom sheet on mobile, centered dialog on desktop */}
      <div
        className={cn(
          'fixed z-50 bg-card shadow-none border border-border transition-all duration-300 safari-fix',
          'inset-x-0 bottom-0 rounded-t-3xl',
          isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none invisible',
          'lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl lg:w-full lg:max-w-md',
          isOpen
            ? 'lg:-translate-y-1/2 lg:opacity-100 lg:visible lg:pointer-events-auto'
            : 'lg:-translate-y-1/2 lg:opacity-0 lg:pointer-events-none lg:invisible',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-bold">Sign in</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-6 safe-bottom-pad space-y-3">
          <p className="text-muted-foreground text-sm mb-2">
            Sign in to save your orders, earn points, and more.
          </p>
          <Button onClick={() => go('/login')} className="w-full h-12 rounded-full">
            Sign in
          </Button>
          <Button
            onClick={() => go('/register')}
            variant="outline"
            className="w-full h-12 rounded-full"
          >
            Create an account
          </Button>
          <div className="relative my-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>
          <GoogleAuthButton text="continue_with" onSuccess={onClose} />
        </div>
      </div>
    </>
  );
};
