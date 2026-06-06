import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadGoogleMaps } from "@/lib/maps";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PickedAddress {
  line1: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
}

interface MapAddressPickerProps {
  onConfirm: (addr: PickedAddress) => void;
  onCancel: () => void;
}

// Lagos fallback centre when geolocation is unavailable.
const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 };

function extractComponents(result: any): Partial<PickedAddress> {
  const out: Partial<PickedAddress> = {};
  for (const c of result?.address_components ?? []) {
    const types: string[] = c.types ?? [];
    if (types.includes("locality")) out.city = c.long_name;
    else if (!out.city && types.includes("administrative_area_level_2"))
      out.city = c.long_name;
    if (types.includes("administrative_area_level_1")) out.state = c.long_name;
    if (types.includes("country")) out.country = c.long_name;
  }
  return out;
}

export function MapAddressPicker({ onConfirm, onCancel }: MapAddressPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<PickedAddress | null>(null);

  useEffect(() => {
    let cancelled = false;

    const reverseGeocode = (lat: number, lng: number) => {
      geocoderRef.current?.geocode(
        { location: { lat, lng } },
        (results: any[], status: string) => {
          if (cancelled) return;
          if (status === "OK" && results?.[0]) {
            setPicked({
              line1: results[0].formatted_address,
              latitude: lat,
              longitude: lng,
              ...extractComponents(results[0]),
            });
          } else {
            setPicked({
              line1: `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
              latitude: lat,
              longitude: lng,
            });
          }
        },
      );
    };

    loadGoogleMaps()
      .then((maps) => {
        if (cancelled || !mapRef.current) return;
        geocoderRef.current = new maps.Geocoder();

        const init = (center: { lat: number; lng: number }) => {
          const map = new maps.Map(mapRef.current, {
            center,
            zoom: 16,
            disableDefaultUI: true,
            zoomControl: true,
          });
          const marker = new maps.Marker({
            position: center,
            map,
            draggable: true,
          });
          markerRef.current = marker;
          marker.addListener("dragend", () => {
            const pos = marker.getPosition();
            reverseGeocode(pos.lat(), pos.lng());
          });
          map.addListener("click", (e: any) => {
            marker.setPosition(e.latLng);
            reverseGeocode(e.latLng.lat(), e.latLng.lng());
          });
          reverseGeocode(center.lat, center.lng);
          setLoading(false);
        };

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) =>
              init({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
              }),
            () => init(DEFAULT_CENTER),
            { timeout: 5000 },
          );
        } else {
          init(DEFAULT_CENTER);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError((e as Error).message ?? "Couldn't load the map");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative h-64 rounded-xl overflow-hidden border border-border">
        <div ref={mapRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/60">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-destructive p-4">
            {error}
          </div>
        )}
      </div>

      {picked && (
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
          <span className="text-muted-foreground">{picked.line1}</span>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="flex-1"
          disabled={!picked}
          onClick={() => picked && onConfirm(picked)}
        >
          Use this address
        </Button>
      </div>
    </div>
  );
}
