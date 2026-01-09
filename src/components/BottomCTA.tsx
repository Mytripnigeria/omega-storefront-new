import { ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomCTAProps {
  onStartOrder: () => void;
}

export const BottomCTA = ({ onStartOrder }: BottomCTAProps) => {
  const { itemCount, subtotal } = useCart();

  if (itemCount === 0) {
    return (
      <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <Button
          onClick={onStartOrder}
          className="w-full h-14 text-lg font-bold"
          size="lg"
        >
          Start order
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
      <Button
        onClick={onStartOrder}
        className="w-full h-14 text-lg font-bold"
        size="lg"
      >
        <span>View cart ({itemCount})</span>
        <ChevronRight className="w-5 h-5 ml-1" />
        <span className="ml-auto">${subtotal.toFixed(2)}</span>
      </Button>
    </div>
  );
};
