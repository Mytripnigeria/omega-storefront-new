import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
  };
  onSave: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    dateOfBirth: string;
  }) => void;
}

export const EditProfileSheet = ({ isOpen, onClose, userData, onSave }: EditProfileSheetProps) => {
  const [formData, setFormData] = useState(userData);

  const handleSave = () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    onSave(formData);
    toast.success('Profile updated successfully');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-foreground/40 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div 
        className={cn(
          "fixed z-50 bg-card shadow-modal transition-all duration-300 flex flex-col",
          "inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh]",
          isOpen ? "translate-y-0" : "translate-y-full",
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl lg:w-full lg:max-w-md lg:max-h-[80vh]",
          isOpen ? "lg:-translate-y-1/2 lg:opacity-100" : "lg:-translate-y-1/2 lg:opacity-0 lg:pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter your address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-3 border-t border-border safe-bottom-pad">
          <Button onClick={handleSave} className="w-full h-12 rounded-full">
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
};
