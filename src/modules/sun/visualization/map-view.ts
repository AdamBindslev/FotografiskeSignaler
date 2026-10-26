/**
 * map-view.ts - Leaflet kortvisning med on-demand lazy loading for Sol (§7.2, §7.4)
 * Viser solens indfaldsvinkel, skyggens retning og længde direkte på kortet i harmoni med kompasvisningen.
 */

import { AstroCore } from '../../../shared/astronomy/AstroCore.ts';
import 'leaflet/dist/leaflet.css';

export interface MapViewOptions {
  onLocationChange?: (lat: number, lng: number) => void;
}

export class MapView {
  private container: HTMLElement;
  private options: MapViewOptions;
  private map: any = null;
  private L: any = null;
  private marker: any = null;
  private sunRayLine: any = null;
  private sunMarker: any = null;
  private riseRayLine: any = null;
  private riseMarker: any = null;
  private setRayLine: any = null;
  private setMarker: any = null;
  private shadowLine: any = null;
  private shadowPoly: any = null;
  private shadowMarker: any = null;
  private isLoaded: boolean = false;
  private lastUpdateArgs: [number, number, number, number, number, number, ('sun' | 'moon')?, any?] | null = null;

  constructor(container: HTMLElement, options?: MapViewOptions) {
    this.container = container;
    this.options = options || {};
  }

  public async init(lat: number, lng: number): Promise<void> {
    if (this.isLoaded) return;

    // Dynamisk import af Leaflet
    const leafletModule = await import('leaflet');
    this.L = leafletModule.default || leafletModule;
    this.isLoaded = true;

    // Opret kortinstans
    this.map = this.L.map(this.container, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false
    });

    this.L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    // Fliselag: OpenStreetMap gadekort og Esri satellit
    const streetLayer = this.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    const satLayer = this.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '&copy; Esri World Imagery'
    });

    streetLayer.addTo(this.map);

    const baseMaps = {
      '🗺️ Gadekort': streetLayer,
      '🛰️ Satellit': satLayer
    };
    this.L.control.layers(baseMaps, null, { position: 'topright' }).addTo(this.map);

    // Fotograf / Kamera markør (trækbar)
    const cameraIconHtml = `
      <div style="width:30px;height:30px;border-radius:50%;background:#07080a;border:2px solid #f59e0b;display:flex;align-items:center;justify-content:center;box-shadow:0 0 12px rgba(245,158,11,0.6);cursor:grab;">
        <span style="font-size:13px;line-height:1;">📷</span>
      </div>
    `;
    const cameraIcon = this.L.divIcon({
      className: 'fs-leaflet-icon',
      html: cameraIconHtml,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    this.marker = this.L.marker([lat, lng], {
      icon: cameraIcon,
      draggable: true
    }).addTo(this.map);

    this.marker.on('dragend', (e: any) => {
      const pos = e.target.getLatLng();
      if (this.options.onLocationChange) {
        this.options.onLocationChange(pos.lat, pos.lng);
      }
    });

    this.map.on('click', (e: any) => {
      this.marker.setLatLng(e.latlng);
      if (this.options.onLocationChange) {
        this.options.onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    });

    // 1. Hoved-vektor (Sol eller Måne): Stiplet linje pegende mod himmellegemet
    this.sunRayLine = this.L.polyline([], {
      color: '#f59e0b',
      weight: 3.5,
      dashArray: '6, 6',
      opacity: 0.95
    }).addTo(this.map);

    // Opgangs-vektor (viser retningen hvor månen/solen står op)
    this.riseRayLine = this.L.polyline([], {
      color: '#a855f7',
      weight: 2,
      dashArray: '3, 6',
      opacity: 0.75
    }).addTo(this.map);

    const riseIcon = this.L.divIcon({
      className: 'fs-leaflet-sun-marker',
      html: `
        <div class="fs-map-rise-badge" style="background:rgba(15,23,42,0.92);border:1px solid #c084fc;padding:2px 7px;border-radius:12px;font-size:10px;font-weight:700;color:#e9d5ff;font-family:var(--font-mono);white-space:nowrap;">
          <span class="fs-map-rise-text">↑ OP</span>
        </div>
      `,
      iconSize: [90, 22],
      iconAnchor: [45, 11]
    });
    this.riseMarker = this.L.marker([lat, lng], { icon: riseIcon, interactive: false, opacity: 0 }).addTo(this.map);

    // Nedgangs-vektor (viser retningen hvor månen/solen går ned)
    this.setRayLine = this.L.polyline([], {
      color: '#6366f1',
      weight: 2,
      dashArray: '3, 6',
      opacity: 0.65
    }).addTo(this.map);

    const setIcon = this.L.divIcon({
      className: 'fs-leaflet-sun-marker',
      html: `
        <div class="fs-map-set-badge" style="background:rgba(15,23,42,0.92);border:1px solid #818cf8;padding:2px 7px;border-radius:12px;font-size:10px;font-weight:700;color:#c7d2fe;font-family:var(--font-mono);white-space:nowrap;">
          <span class="fs-map-set-text">↓ NED</span>
        </div>
      `,
      iconSize: [90, 22],
      iconAnchor: [45, 11]
    });
    this.setMarker = this.L.marker([lat, lng], { icon: setIcon, interactive: false, opacity: 0 }).addTo(this.map);

    // Sol/Måne-markør for enden af hovedstrålen
    const sunIcon = this.L.divIcon({
      className: 'fs-leaflet-sun-marker',
      html: `
        <div class="fs-map-sun-badge">
          <span class="fs-map-sun-icon" style="font-size:15px;line-height:1;">☀️</span>
          <span class="fs-map-sun-text">SOL</span>
        </div>
      `,
      iconSize: [110, 28],
      iconAnchor: [55, 14]
    });
    this.sunMarker = this.L.marker([lat, lng], { icon: sunIcon, interactive: false }).addTo(this.map);

    // 2. Skygge-vektor: Blå skyggekegle og centerlinje i modsat retning af solen
    this.shadowPoly = this.L.polygon([], {
      color: '#38bdf8',
      fillColor: '#0369a1',
      fillOpacity: 0.45,
      weight: 2
    }).addTo(this.map);

    this.shadowLine = this.L.polyline([], {
      color: '#38bdf8',
      weight: 3,
      dashArray: '4, 4',
      opacity: 0.9
    }).addTo(this.map);

    // Skygge-længde etiket
    const shadowIcon = this.L.divIcon({
      className: 'fs-leaflet-shadow-marker',
      html: `
        <div class="fs-map-shadow-badge">
          <span style="font-size:11px;line-height:1;">👤</span>
          <span class="fs-map-shadow-text">0,0 m</span>
        </div>
      `,
      iconSize: [85, 22],
      iconAnchor: [42, 11]
    });
    this.shadowMarker = this.L.marker([lat, lng], { icon: shadowIcon, interactive: false }).addTo(this.map);

    this.invalidateSize();

    if (this.lastUpdateArgs) {
      this.update(...this.lastUpdateArgs);
    }
  }

  public update(
    lat: number,
    lng: number,
    sunAltitudeDeg: number,
    sunAzimuthDeg: number,
    shadowAzimuthDeg: number,
    shadowLengthMeters: number,
    celestialBody: 'sun' | 'moon' = 'sun',
    extraInfo?: {
      icon?: string;
      riseAzimuth?: number | null;
      setAzimuth?: number | null;
      hasMoonShadow?: boolean;
    }
  ): void {
    this.lastUpdateArgs = [lat, lng, sunAltitudeDeg, sunAzimuthDeg, shadowAzimuthDeg, shadowLengthMeters, celestialBody, extraInfo];

    if (!this.map || !this.L) return;

    const origin: [number, number] = [lat, lng];
    this.marker.setLatLng(origin);

    const isMoon = celestialBody === 'moon';
    const isVisibleBodyOrTwilight = isMoon ? sunAltitudeDeg > -6 : sunAltitudeDeg > -8;
    const isBelowHorizon = sunAltitudeDeg <= 0;
    const hasShadow = isMoon ? Boolean(extraInfo?.hasMoonShadow && sunAltitudeDeg > 0) : sunAltitudeDeg > 0;

    // Opdater op- og nedgangslinjer (viser hvor månen står op og går ned)
    if (isMoon && extraInfo?.riseAzimuth !== null && extraInfo?.riseAzimuth !== undefined) {
      const riseEndpoint = this.calculateDestination(lat, lng, 290, extraInfo.riseAzimuth);
      this.riseRayLine.setLatLngs([origin, riseEndpoint]);
      this.riseMarker.setLatLng(riseEndpoint);
      this.riseMarker.setOpacity(0.95);
      const riseEl = this.container.querySelector('.fs-map-rise-text');
      if (riseEl) {
        riseEl.textContent = `↑ OP ${extraInfo.riseAzimuth.toFixed(0)}° ${AstroCore.getCompassDirection(extraInfo.riseAzimuth)}`;
      }
    } else {
      this.riseRayLine?.setLatLngs([]);
      this.riseMarker?.setOpacity(0);
    }

    if (isMoon && extraInfo?.setAzimuth !== null && extraInfo?.setAzimuth !== undefined) {
      const setEndpoint = this.calculateDestination(lat, lng, 290, extraInfo.setAzimuth);
      this.setRayLine.setLatLngs([origin, setEndpoint]);
      this.setMarker.setLatLng(setEndpoint);
      this.setMarker.setOpacity(0.85);
      const setEl = this.container.querySelector('.fs-map-set-text');
      if (setEl) {
        setEl.textContent = `↓ NED ${extraInfo.setAzimuth.toFixed(0)}° ${AstroCore.getCompassDirection(extraInfo.setAzimuth)}`;
      }
    } else {
      this.setRayLine?.setLatLngs([]);
      this.setMarker?.setOpacity(0);
    }

    // 1. SOLVEKTOR / MÅNEVEKTOR: Peger MOD solen eller månen (også lige under horisonten)
    if (isVisibleBodyOrTwilight) {
      const sunDistMeters = 350;
      const sunEndpoint = this.calculateDestination(lat, lng, sunDistMeters, sunAzimuthDeg);
      const activeColor = isMoon ? (isBelowHorizon ? '#818cf8' : '#a855f7') : (isBelowHorizon ? '#fb923c' : '#f59e0b');
      this.sunRayLine.setLatLngs([origin, sunEndpoint]);
      this.sunRayLine.setStyle({
        color: activeColor,
        dashArray: isBelowHorizon ? '4, 6' : '6, 6',
        opacity: isBelowHorizon ? 0.85 : 0.95
      });

      this.sunMarker.setLatLng(sunEndpoint);
      this.sunMarker.setOpacity(1);

      const compassDir = AstroCore.getCompassDirection(sunAzimuthDeg);
      const sunEl = this.container.querySelector('.fs-map-sun-text') as HTMLElement | null;
      const iconEl = this.container.querySelector('.fs-map-sun-icon') as HTMLElement | null;
      const badgeEl = this.container.querySelector('.fs-map-sun-badge') as HTMLElement | null;

      if (iconEl) {
        iconEl.textContent = isMoon ? (extraInfo?.icon || '🌕') : '☀️';
      }
      if (sunEl) {
        const sign = sunAltitudeDeg >= 0 ? '+' : '';
        sunEl.style.color = isMoon ? '#e9d5ff' : '#fbbf24';
        if (isMoon) {
          sunEl.textContent = isBelowHorizon
            ? `MÅNE ${sunAzimuthDeg.toFixed(0)}° ${compassDir} (${sign}${sunAltitudeDeg.toFixed(1)}°)`
            : `MÅNE ${sunAzimuthDeg.toFixed(0)}° ${compassDir}`;
        } else {
          sunEl.textContent = isBelowHorizon
            ? `SOLSKIVE ${sunAzimuthDeg.toFixed(0)}° ${compassDir} (${sign}${sunAltitudeDeg.toFixed(1)}°)`
            : `SOL ${sunAzimuthDeg.toFixed(0)}° ${compassDir}`;
        }
      }
      if (badgeEl) {
        badgeEl.style.borderStyle = isBelowHorizon ? 'dashed' : 'solid';
        badgeEl.style.borderColor = activeColor;
        badgeEl.style.boxShadow = isMoon ? '0 0 14px rgba(168, 85, 247, 0.5)' : '0 0 14px rgba(245, 158, 11, 0.55)';
      }
    } else {
      this.sunRayLine.setLatLngs([]);
      this.sunMarker.setOpacity(0);
    }

    // 2. SKYGGEVEKTOR: Peger modsat solen/månen (i retning af shadowAzimuthDeg)
    if (hasShadow) {
      // Visuel længde: Vis reel skyggelængde, men mindst 24m så den rager tydeligt ud fra kameramarkøren
      const displayLen = Math.max(24, Math.min(shadowLengthMeters, 2000));
      const tipCenter = this.calculateDestination(lat, lng, displayLen, shadowAzimuthDeg);
      const tipLeft = this.calculateDestination(lat, lng, displayLen, (shadowAzimuthDeg - 3.5 + 360) % 360);
      const tipRight = this.calculateDestination(lat, lng, displayLen, (shadowAzimuthDeg + 3.5) % 360);

      this.shadowPoly.setLatLngs([origin, tipLeft, tipCenter, tipRight]);
      this.shadowPoly.setStyle({ opacity: 0.9, fillOpacity: isMoon ? 0.3 : 0.45 });

      this.shadowLine.setLatLngs([origin, tipCenter]);
      this.shadowLine.setStyle({ opacity: 0.9 });

      this.shadowMarker.setLatLng(tipCenter);
      this.shadowMarker.setOpacity(1);

      const lenFormatted =
        shadowLengthMeters < 1000
          ? `${shadowLengthMeters.toFixed(1).replace('.', ',')} m`
          : `${(shadowLengthMeters / 1000).toFixed(2).replace('.', ',')} km`;

      const shadowEl = this.container.querySelector('.fs-map-shadow-text');
      if (shadowEl) {
        shadowEl.textContent = `${lenFormatted}`;
      }
    } else {
      this.shadowPoly.setLatLngs([]);
      this.shadowLine.setLatLngs([]);
      this.shadowMarker.setOpacity(0);
    }
  }

  public setCenter(lat: number, lng: number): void {
    if (!this.map) return;
    this.map.setView([lat, lng], this.map.getZoom());
    this.invalidateSize();
  }

  public invalidateSize(): void {
    if (this.map) {
      setTimeout(() => {
        this.map?.invalidateSize();
      }, 50);
    }
  }

  private calculateDestination(lat: number, lng: number, distanceMeters: number, bearingDeg: number): [number, number] {
    const R = 6371e3; // Jordens radius i meter
    const d = distanceMeters;
    const brng = (bearingDeg * Math.PI) / 180;
    const lat1 = (lat * Math.PI) / 180;
    const lon1 = (lng * Math.PI) / 180;

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

    return [(lat2 * 180) / Math.PI, (lon2 * 180) / Math.PI];
  }
}
