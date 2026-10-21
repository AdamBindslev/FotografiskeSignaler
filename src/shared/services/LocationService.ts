/**
 * LocationService.ts - Fælles lokationstjeneste for Fotografiske Signaler (§9.1)
 * Understøtter browser-GPS, Open-Meteo geocoding og reverse geocoding, samt fallback.
 */

export interface GeoLocation {
  lat: number;
  lng: number;
  name: string;
  sub?: string;
  source: 'gps' | 'search' | 'default';
  accuracy?: number | null;
  updatedAt?: number;
}

export type LocationListener = (loc: GeoLocation) => void;

const LOCATION_STORAGE_KEY = 'fs_shared_location_v1';

export const DEFAULT_LOCATION: GeoLocation = {
  lat: 55.6761,
  lng: 12.5683,
  name: 'København',
  sub: 'Standard (tryk GPS for din position)',
  source: 'default',
  accuracy: null
};

export class LocationService {
  private static currentLocation: GeoLocation = LocationService.loadStoredLocation();
  private static listeners: Set<LocationListener> = new Set();
  private static isLocating = false;

  private static loadStoredLocation(): GeoLocation {
    try {
      const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_LOCATION, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Kunne ikke læse lokation fra storage:', e);
    }
    return { ...DEFAULT_LOCATION };
  }

  public static getLocation(): GeoLocation {
    return { ...this.currentLocation };
  }

  public static setLocation(loc: Partial<GeoLocation> & { lat: number; lng: number; name: string }): GeoLocation {
    this.currentLocation = {
      ...this.currentLocation,
      ...loc,
      updatedAt: Date.now()
    };
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(this.currentLocation));
    } catch (e) {
      console.warn('Fejl ved lagring af lokation:', e);
    }
    this.notifyListeners();
    return this.getLocation();
  }

  public static subscribe(listener: LocationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners(): void {
    const loc = this.getLocation();
    this.listeners.forEach((listener) => {
      try {
        listener(loc);
      } catch (err) {
        console.error('Fejl i location listener:', err);
      }
    });
  }

  public static async requestGpsLocation(): Promise<GeoLocation> {
    if (!navigator.geolocation) {
      throw new Error('GPS understøttes ikke af denne browser');
    }
    this.isLocating = true;

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          this.isLocating = false;
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const accuracy = Math.round(position.coords.accuracy);

          // Foretag reverse geocoding for at finde bynavn
          let name = 'Aktuel GPS-position';
          let sub = `Nøjagtighed: ±${accuracy}m`;

          try {
            const geo = await LocationService.reverseGeocode(lat, lng);
            if (geo) {
              name = geo.name;
              sub = `${geo.sub || 'GPS'} • ±${accuracy}m`;
            }
          } catch (e) {
            console.warn('Reverse geocode fejlede:', e);
          }

          const newLoc = LocationService.setLocation({
            lat,
            lng,
            name,
            sub,
            source: 'gps',
            accuracy
          });
          resolve(newLoc);
        },
        (error) => {
          this.isLocating = false;
          let msg = 'Kunne ikke hente GPS-position';
          if (error.code === error.PERMISSION_DENIED) {
            msg = 'Adgang til GPS blev afvist af bruger/browser';
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            msg = 'Positionen er utilgængelig lige nu';
          } else if (error.code === error.TIMEOUT) {
            msg = 'GPS-forespørgslen fik timeout';
          }
          reject(new Error(msg));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  }

  public static async search(query: string): Promise<Array<{ name: string; sub: string; lat: number; lng: number }>> {
    if (!query || query.trim().length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=da&format=json`;
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.results) return [];
      return data.results.map((item: any) => ({
        name: item.name,
        sub: [item.admin1, item.country].filter(Boolean).join(', '),
        lat: item.latitude,
        lng: item.longitude
      }));
    } catch (e) {
      console.warn('Stedsøgning fejlede:', e);
      return [];
    }
  }

  public static async reverseGeocode(lat: number, lng: number): Promise<{ name: string; sub?: string } | null> {
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&localityLanguage=da`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision || '';
        const region = data.principalSubdivision || data.countryName || '';
        if (city) {
          return {
            name: city,
            sub: region && region !== city ? region : data.countryName
          };
        }
      }
    } catch (e) {
      console.warn('Reverse geocoding netværksfejl:', e);
    }
    return null;
  }
}
