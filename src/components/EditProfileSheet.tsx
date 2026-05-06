import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { profileApi } from "@/services/auth";

interface EditProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const EditProfileSheet = ({
  isOpen,
  onClose,
  onSaved,
}: EditProfileSheetProps) => {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthday: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      birthday: profile.birthday ?? "",
    });
  }, [profile]);

  const handleSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    setSubmitting(true);
    try {
      await profileApi.update({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email || null,
        phone: formData.phone || null,
        birthday: formData.birthday || null,
      });
      toast.success("Profile updated");
      onSaved?.();
    } catch (e) {
      toast.error((e as Error).message ?? "Couldn't update profile");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-foreground/40 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "fixed z-50 bg-card shadow-modal transition-all duration-300 flex flex-col",
          "inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh]",
          isOpen ? "translate-y-0" : "translate-y-full",
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:rounded-2xl lg:w-full lg:max-w-md lg:max-h-[80vh]",
          isOpen
            ? "lg:-translate-y-1/2 lg:opacity-100"
            : "lg:-translate-y-1/2 lg:opacity-0 lg:pointer-events-none",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 pb-3 border-b border-border">
          <h2 className="text-lg font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Birthday</Label>
            <Input
              id="birthday"
              type="date"
              value={formData.birthday}
              onChange={(e) =>
                setFormData({ ...formData, birthday: e.target.value })
              }
            />
          </div>
        </div>

        <div className="p-5 pt-3 border-t border-border safe-bottom-pad">
          <Button
            onClick={handleSave}
            className="w-full h-12 rounded-full"
            disabled={submitting}
          >
            {submitting ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </div>
    </>
  );
};
