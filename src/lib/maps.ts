// Loads the Google Maps JS API (with the places/geocoding library) once,
// shared across callers. Returns the `google.maps` namespace (untyped — no
// @types/google.maps dependency).
const MAPS_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "") as string;

/* eslint-disable @typescript-eslint/no-explicit-any */
let mapsPromise: Promise<any> | null = null;

export function hasMapsKey(): boolean {
  return !!MAPS_KEY;
}

export function loadGoogleMaps(): Promise<any> {
  if (!MAPS_KEY) return Promise.reject(new Error("Maps API key not configured"));
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise<any>((resolve, reject) => {
    if ((window as any).google?.maps) return resolve((window as any).google.maps);
    const cb = "__omegaMapsReady";
    (window as any)[cb] = () => resolve((window as any).google.maps);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      MAPS_KEY,
    )}&libraries=places&callback=${cb}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return mapsPromise;
}
