import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onCartClick?: () => void;
  onWalletClick?: () => void;
}

export const Header = ({ onCartClick, onWalletClick }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="container flex items-center justify-between h-14 px-4">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-base">🍔</span>
          </div>
          <span className="font-bold text-lg">QuickBite</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-full px-4 font-medium"
        >
          Sign in
        </Button>
      </div>
    </header>
  );
};
