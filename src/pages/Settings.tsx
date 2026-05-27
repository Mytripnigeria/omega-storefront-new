import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Moon, Smartphone, Volume2, Vibrate, Eye } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { PageTransition } from '@/components/PageTransition';
import { useTheme } from '@/context/ThemeContext';
import { useStorefront } from '@/context/StorefrontContext';
import { useAuth } from '@/context/AuthContext';
import { useWebPush } from '@/hooks/useWebPush';
import { usePreference, type PreferenceKey } from '@/hooks/usePreferences';

interface SettingItem {
  key: PreferenceKey;
  icon: React.ElementType;
  label: string;
  description: string;
}

// Only client-side preferences we can genuinely honour are exposed here.
// Push notifications, location services, biometric login, and multi-language
// each need backend or platform support that isn't built yet — they were
// previously rendered as no-op toggles and have been removed.
const PREFERENCES: SettingItem[] = [
  {
    key: 'sound_effects',
    icon: Volume2,
    label: 'Sound Effects',
    description: 'Play sounds for notifications and actions',
  },
  {
    key: 'haptic_feedback',
    icon: Vibrate,
    label: 'Haptic Feedback',
    description: 'Vibration feedback on interactions',
  },
  {
    key: 'order_tracking',
    icon: Eye,
    label: 'Live Order Tracking',
    description: 'Auto-refresh the order tracking screen',
  },
  {
    key: 'data_saver',
    icon: Smartphone,
    label: 'Data Saver Mode',
    description: 'Reduce data usage where possible',
  },
];

const PreferenceRow = ({ item }: { item: SettingItem }) => {
  const [enabled, setEnabled] = usePreference(item.key);
  const Icon = item.icon;
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{item.label}</p>
        <p className="text-sm text-muted-foreground truncate">{item.description}</p>
      </div>
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </div>
  );
};

const Settings = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { config } = useStorefront();
  const { isAuthenticated } = useAuth();
  const push = useWebPush();

  const brand = config?.storeName ?? '';
  const year = new Date().getFullYear();

  const handlePushToggle = (next: boolean) => {
    if (next) void push.enable();
    else void push.disable();
  };
  const pushEnabled = push.status === 'subscribed';
  const pushBlocked = push.status === 'permission-denied';
  const pushUnsupported = push.status === 'unsupported';
  const pushUnconfigured = push.status === 'unconfigured';

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center h-14 px-4 max-w-7xl mx-auto lg:px-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold ml-4">Settings</h1>
          </div>
        </header>

        <div className="max-w-2xl mx-auto px-4 lg:px-6 py-6">
          <div className="bg-card rounded-2xl border border-border overflow-hidden divide-y divide-border">
            {/* Dark Mode toggle drives ThemeContext directly. */}
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <Moon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground truncate">Use dark theme throughout the app</p>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>

            {PREFERENCES.map((item) => (
              <PreferenceRow key={item.key} item={item} />
            ))}

            {/* Web-push subscription — only meaningful for logged-in customers. */}
            {isAuthenticated && !pushUnsupported && (
              <div className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {pushBlocked
                      ? 'Blocked in your browser — enable notifications in site settings to turn this on.'
                      : pushUnconfigured
                        ? "Not available yet — the merchant hasn't enabled push."
                        : push.error
                          ? push.error
                          : "Order updates delivered to your device when the app isn't open."}
                  </p>
                </div>
                <Switch
                  checked={pushEnabled}
                  disabled={
                    push.isBusy ||
                    pushBlocked ||
                    pushUnconfigured ||
                    push.status === 'loading'
                  }
                  onCheckedChange={handlePushToggle}
                />
              </div>
            )}
          </div>

          {/* Footer credit reads the live business name and current year. */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              {brand ? `© ${year} ${brand}. All rights reserved.` : `© ${year}. All rights reserved.`}
            </p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Settings;
