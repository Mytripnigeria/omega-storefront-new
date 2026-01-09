import { ChevronRight } from 'lucide-react';

interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  bgColor: string;
}

const banners: BannerItem[] = [
  {
    id: '1',
    title: 'Party Jollof Special',
    subtitle: 'Order 3 plates, get 1 free',
    image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400&h=200&fit=crop',
    bgColor: 'bg-foreground',
  },
  {
    id: '2',
    title: 'Weekend Suya Feast',
    subtitle: 'Free drink with suya orders',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=200&fit=crop',
    bgColor: 'bg-secondary',
  },
];

export const FeaturedBanner = () => {
  return (
    <div className="px-4 py-4">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`${banner.bgColor} rounded-2xl overflow-hidden flex-shrink-0 w-[85vw] sm:w-[320px] lg:w-[400px] cursor-pointer group`}
          >
            <div className="flex h-32 sm:h-36">
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <h3 className={`font-bold text-lg ${banner.bgColor === 'bg-foreground' ? 'text-background' : 'text-foreground'}`}>
                    {banner.title}
                  </h3>
                  <p className={`text-sm ${banner.bgColor === 'bg-foreground' ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {banner.subtitle}
                  </p>
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${banner.bgColor === 'bg-foreground' ? 'text-background' : 'text-foreground'} group-hover:gap-2 transition-all`}>
                  Order now
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
              <div className="w-32 sm:w-36">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
