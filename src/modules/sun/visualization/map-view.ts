/**
 * map-view.ts - Leaflet kortvisning med on-demand lazy loading for FotoSol (§7.2, §7.4)
 */

import { AstroCore } from '../../../shared/astronomy/AstroCore.ts';
import 'leaflet/dist/leaflet.css';

export class MapView {
  private container: HTMLElement;
  private map: any = null;
  private L: any = null;
  private marker: any = null;
  private sunRayLine: any = null;
  private shadowLine: any = null;
  private isLoaded: boolean = false;

  constructor(container: HTMLElement) {
    this.container = container;
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

    // Mørkt CartoDB / OSM flisetema
    this.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(this.map);

    // Fotograf markør
    const iconHtml = `
      <div style="width:28px;height:28px;border-radius:50%;background:#07080a;border:2px solid #f59e0b;display:flex;align-items:center;justify-content:center;box-shadow:0 0 10px rgba(245,158,11,0.5);">
        <span style="font-size:12px;">📷</span>
      </div>
    `;
    const customIcon = this.L.divIcon({
      className: 'fs-leaflet-icon',
      html: iconHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    this.marker = this.L.marker([lat, lng], { icon: customIcon }).addTo(this.map);

    // Sol- og skyggelinjer
    this.sunRayLine = this.L.polyline([], { color: '#f59e0b', weight: 3, dashArray: '6, 6' }).addTo(this.map);
    this.shadowLine = this.L.polyline([], { color: '#38bdf8', weight: 4 }).addTo(this.map);

    this.invalidateSize();
  }

  public update(lat: number, lng: number, sunAzimuthDeg: number, shadowAzimuthDeg: number, shadowLengthMeters: number): void {
    if (!this.map || !this.L) return;

    const origin = [lat, lng];
    this.marker.setLatLng(origin);

    // Beregn slutpunkter for sollinje (150m i modsat retning af azimut mod solen)
    const sunEndpoint = this.calculateDestination(lat, lng, 200, (sunAzimuthDeg + 180) % 360);
    this.sunRayLine.setLatLngs([origin, sunEndpoint]);

    // Skyggelinje
    const shadowDist = Math.max(10, Math.min(250, shadowLengthMeters));
    const shadowEndpoint = this.calculateDestination(lat, lng, shadowDist, shadowAzimuthDeg);
    this.shadowLine.setLatLngs([origin, shadowEndpoint]);
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
