/**
 * LocationService.ts - Fælles lokationstjeneste for Fotografiske Signaler (§9.1)
 * Understøtter browser-GPS, Open-Meteo geocoding og reverse geocoding, samt fallback.
 */

export interface PhotoSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  createdAt: number;
}

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
const SPOTS_STORAGE_KEY = 'fs_saved_spots_v1';

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
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
        if (raw) {
          return { ...DEFAULT_LOCATION, ...JSON.parse(raw) };
        }
      }
    } catch (e) {
      console.warn('Kunne ikke læse lokation fra storage:', e);
    }
    return { ...DEFAULT_LOCATION };
  }

  public static getSavedSpots(): PhotoSpot[] {
    try {
      const raw = localStorage.getItem(SPOTS_STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Kunne ikke hente gemte fotospots:', e);
    }
    return [];
  }

  public static saveSpot(name: string, lat: number, lng: number): PhotoSpot {
    const spots = this.getSavedSpots();
    const cleanName = name.trim() || 'Mit fotospot';
    const newSpot: PhotoSpot = {
      id: 'spot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: cleanName,
      lat: +lat.toFixed(4),
      lng: +lng.toFixed(4),
      createdAt: Date.now()
    };
    spots.unshift(newSpot);
    try {
      localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(spots));
    } catch (e) {
      console.warn('Kunne ikke gemme fotospot:', e);
    }
    return newSpot;
  }

  public static deleteSpot(id: string): void {
    const spots = this.getSavedSpots().filter((s) => s.id !== id);
    try {
      localStorage.setItem(SPOTS_STORAGE_KEY, JSON.stringify(spots));
    } catch (e) {
      console.warn('Kunne ikke slette fotospot:', e);
    }
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
    const trimmed = query.trim();

    // Kør DAWA (dansk adresse-API med gade + husnummer) og Open-Meteo (byer, naturområder, udland) sideløbende
    const dawaUrl = `https://api.dataforsyningen.dk/adresser/autocomplete?q=${encodeURIComponent(trimmed)}`;
    const meteoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=da&format=json`;

    const results: Array<{ name: string; sub: string; lat: number; lng: number }> = [];
    const seen = new Set<string>();

    const [dawaSettled, meteoSettled] = await Promise.allSettled([
      fetch(dawaUrl).then(async (r) => (r.ok ? r.json() : [])),
      fetch(meteoUrl).then(async (r) => (r.ok ? r.json() : {}))
    ]);

    // 1. DAWA danske adresser
    if (dawaSettled.status === 'fulfilled' && Array.isArray(dawaSettled.value)) {
      for (const item of dawaSettled.value) {
        if (item?.adresse && typeof item.adresse.y === 'number' && typeof item.adresse.x === 'number') {
          const addr = item.adresse;
          const street = [addr.vejnavn, addr.husnr, addr.etage, addr.dør].filter(Boolean).join(' ');
          const city = [addr.postnr, addr.postnrnavn].filter(Boolean).join(' ');
          const name = street || item.tekst;
          const sub = city ? `${city}, Danmark` : 'Danmark';
          const key = `${addr.y.toFixed(4)},${addr.x.toFixed(4)}`;

          if (!seen.has(key)) {
            seen.add(key);
            results.push({
              name,
              sub,
              lat: addr.y, // DAWA: y = breddegrad (lat)
              lng: addr.x  // DAWA: x = længdegrad (lng)
            });
          }
        }
      }
    }

    // 2. Open-Meteo steder, byer og naturområder
    if (meteoSettled.status === 'fulfilled' && meteoSettled.value && Array.isArray(meteoSettled.value.results)) {
      for (const item of meteoSettled.value.results) {
        const key = `${item.latitude.toFixed(4)},${item.longitude.toFixed(4)}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            name: item.name,
            sub: [item.admin1, item.country].filter(Boolean).join(', '),
            lat: item.latitude,
            lng: item.longitude
          });
        }
      }
    }

    return results.slice(0, 10);
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
