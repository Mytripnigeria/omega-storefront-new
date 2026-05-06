import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { storefrontApi, type StorefrontBanner } from "@/services/storefront";

export const FeaturedBanner = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<StorefrontBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await storefrontApi.getBanners();
        if (!cancelled) setBanners(list);
      } catch {
        if (!cancelled) setBanners([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading || banners.length === 0) return null;

  const handleClick = (banner: StorefrontBanner) => {
    if (!banner.actionUrl) return;
    if (banner.actionUrl.startsWith("http")) {
      window.location.href = banner.actionUrl;
    } else {
      navigate(banner.actionUrl);
    }
  };

  return (
    <div className="py-4 max-w-7xl mx-auto">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-4 lg:px-6 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {banners.map((banner) => {
          const isDark = banner.theme === "dark";
          const bg = isDark ? "bg-foreground" : "bg-secondary";
          return (
            <div
              key={banner.id}
              role={banner.actionUrl ? "button" : undefined}
              onClick={() => handleClick(banner)}
              className={`${bg} rounded-2xl overflow-hidden flex-shrink-0 w-[85vw] sm:w-[320px] lg:w-full cursor-pointer group`}
            >
              <div className="flex h-32 sm:h-36">
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <h3
                      className={`font-bold text-lg ${
                        isDark ? "text-background" : "text-foreground"
                      }`}
                    >
                      {banner.title}
                    </h3>
                    {banner.description && (
                      <p
                        className={`text-sm ${
                          isDark ? "text-background/70" : "text-muted-foreground"
                        }`}
                      >
                        {banner.description}
                      </p>
                    )}
                  </div>
                  {banner.actionText && (
                    <div
                      className={`flex items-center gap-1 text-sm font-medium ${
                        isDark ? "text-background" : "text-foreground"
                      } group-hover:gap-2 transition-all`}
                    >
                      {banner.actionText}
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="w-32 sm:w-36">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
