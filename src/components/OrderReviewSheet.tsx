import { useState, useRef } from 'react';
import { Star, X, Send, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useHaptics } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderReviewSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string, images?: string[]) => void;
  orderId?: string;
}

export const OrderReviewSheet = ({ isOpen, onClose, onSubmit, orderId }: OrderReviewSheetProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { triggerHaptic } = useHaptics();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).slice(0, 4 - images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length === Math.min(files.length, 4 - images.length)) {
            setImages((prev) => [...prev, ...newImages].slice(0, 4));
            triggerHaptic('selection');
          }
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    triggerHaptic('selection');
  };

  const handleStarClick = (star: number) => {
    setRating(star);
    triggerHaptic('selection');
  };

  const handleStarHover = (star: number) => {
    setHoveredRating(star);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    triggerHaptic('success');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    onSubmit(rating, review, images.length > 0 ? images : undefined);
    setIsSubmitting(false);
    setRating(0);
    setReview('');
    setImages([]);
    onClose();
  };

  const displayRating = hoveredRating || rating;

  const ratingLabels: Record<number, string> = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50"
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-3xl shadow-modal safe-bottom-pad"
          >
            <div className="p-6">
              {/* Handle */}
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-6" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Order Delivered!</h2>
                <p className="text-muted-foreground">How was your experience?</p>
                {orderId && (
                  <p className="text-xs text-muted-foreground mt-1">Order #{orderId}</p>
                )}
              </div>

              {/* Star Rating */}
              <div className="flex flex-col items-center mb-6">
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStarClick(star)}
                      onMouseEnter={() => handleStarHover(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 transition-colors"
                    >
                      <Star
                        className={cn(
                          "w-10 h-10 transition-all duration-150",
                          star <= displayRating
                            ? "fill-warning text-warning"
                            : "text-muted-foreground/40"
                        )}
                      />
                    </motion.button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {displayRating > 0 && (
                    <motion.span
                      key={displayRating}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-sm font-medium text-warning"
                    >
                      {ratingLabels[displayRating]}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Review Text */}
              <div className="mb-4">
                <Textarea
                  placeholder="Share your thoughts about this order (optional)"
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[100px] bg-secondary border-border resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {review.length}/500
                </p>
              </div>

              {/* Image Attachments */}
              <div className="mb-6">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                <div className="flex items-center gap-2 flex-wrap">
                  {images.map((img, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative w-16 h-16 rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={img}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 bg-foreground/80 rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-background" />
                      </button>
                    </motion.div>
                  ))}
                  
                  {images.length < 4 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors"
                    >
                      <ImagePlus className="w-5 h-5" />
                      <span className="text-[10px]">Add</span>
                    </motion.button>
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Add up to 4 photos (optional)
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={rating === 0 || isSubmitting}
                className="w-full h-14 text-base font-bold gap-2"
              >
                {isSubmitting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Review
                  </>
                )}
              </Button>

              {/* Skip */}
              <button
                onClick={onClose}
                className="w-full py-3 text-muted-foreground text-sm mt-2 hover:text-foreground transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
