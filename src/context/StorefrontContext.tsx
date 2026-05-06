import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { storefrontApi, type StorefrontConfig } from "@/services/storefront";

interface StorefrontContextValue {
  config: StorefrontConfig | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StorefrontContext = createContext<StorefrontContextValue | undefined>(
  undefined,
);

export function StorefrontProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const cfg = await storefrontApi.getConfig();
      setConfig(cfg);
      setError(null);
    } catch (e) {
      setError((e as Error).message ?? "Couldn't load storefront config");
      setConfig(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // Re-fetch every 60s so admin changes propagate without a hard refresh.
    const id = window.setInterval(() => void refresh(), 60_000);
    return () => window.clearInterval(id);
  }, []);

  // Apply theme tokens to :root whenever config changes
  useEffect(() => {
    if (!config) return;
    const root = document.documentElement;
    root.style.setProperty("--sf-primary", config.primaryColor);
    root.style.setProperty("--sf-secondary", config.secondaryColor);
    root.style.setProperty("--sf-accent", config.accentColor);
    root.style.setProperty("--sf-background", config.backgroundColor);
    root.style.setProperty("--sf-foreground", config.foregroundColor);
    root.style.setProperty("--sf-font-family", config.fontFamily);

    // Update document title from SEO defaults if set
    if (config.seoTitle) document.title = config.seoTitle;
    else if (config.storeName) document.title = config.storeName;

    // Favicon
    if (config.faviconUrl) {
      let link = document.querySelector(
        "link[rel='icon']",
      ) as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = config.faviconUrl;
    }
  }, [config]);

  const value = useMemo<StorefrontContextValue>(
    () => ({ config, isLoading, error, refresh }),
    [config, isLoading, error],
  );

  return (
    <StorefrontContext.Provider value={value}>
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const ctx = useContext(StorefrontContext);
  if (!ctx)
    throw new Error("useStorefront must be used within a StorefrontProvider");
  return ctx;
}
