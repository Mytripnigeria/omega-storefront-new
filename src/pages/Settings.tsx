import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Globe, Shield, Smartphone, MapPin, Volume2, Vibrate, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PageTransition } from '@/components/PageTransition';
import { toast } from 'sonner';

interface SettingItem {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  enabled: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  
  const [settings, setSettings] = useState<SettingItem[]>([
    {
      id: 'push_notifications',
      icon: Bell,
      label: 'Push Notifications',
      description: 'Receive order updates and promotions',
      enabled: true,
    },
    {
      id: 'dark_mode',
      icon: Moon,
      label: 'Dark Mode',
      description: 'Use dark theme throughout the app',
      enabled: false,
    },
    {
      id: 'location_services',
      icon: MapPin,
      label: 'Location Services',
      description: 'Allow access to your location for delivery',
      enabled: true,
    },
    {
      id: 'sound_effects',
      icon: Volume2,
      label: 'Sound Effects',
      description: 'Play sounds for notifications and actions',
      enabled: true,
    },
    {
      id: 'haptic_feedback',
      icon: Vibrate,
      label: 'Haptic Feedback',
      description: 'Vibration feedback on interactions',
      enabled: true,
    },
    {
      id: 'biometric_login',
      icon: Shield,
      label: 'Biometric Login',
      description: 'Use fingerprint or face recognition',
      enabled: false,
    },
    {
      id: 'order_tracking',
      icon: Eye,
      label: 'Live Order Tracking',
      description: 'Show real-time order progress',
      enabled: true,
    },
    {
      id: 'language',
      icon: Globe,
      label: 'Multi-language',
      description: 'Enable language switching',
      enabled: false,
    },
    {
      id: 'data_saver',
      icon: Smartphone,
      label: 'Data Saver Mode',
      description: 'Reduce data usage by lowering image quality',
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    const setting = settings.find(s => s.id === id);
    toast.success(`${setting?.label} ${!setting?.enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 lg:pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4">Settings</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {settings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center gap-4 p-4"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <setting.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{setting.label}</p>
                  <p className="text-sm text-muted-foreground truncate">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled}
                  onCheckedChange={() => handleToggle(setting.id)}
                />
              </div>
            ))}
          </div>

          {/* App Version */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">App Version 1.0.0</p>
            <p className="text-xs text-muted-foreground mt-1">© 2024 Toasty Foods. All rights reserved.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
