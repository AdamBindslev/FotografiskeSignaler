/**
 * index.ts - FotoSol modul controller (§7)
 */

import { ModuleInstance } from '../../app/ModuleRegistry.ts';
import { AstroCore, SunTimes, ShadowCalculation, LightPhase } from '../../shared/astronomy/AstroCore.ts';
import { LocationService, GeoLocation } from '../../shared/services/LocationService.ts';
import { TimeService } from '../../shared/services/TimeService.ts';
import { ShadowSimulator } from './visualization/shadow-sim.ts';
import { MapView } from './visualization/map-view.ts';
import './sun.css';

export default class SunModule implements ModuleInstance {
  private container!: HTMLElement;
  private simulator: ShadowSimulator | null = null;
  private mapView: MapView | null = null;

  private activeViewMode: '3d' | 'compass' | 'map' = '3d';
  private subjectType: 'person' | 'tree' | 'building' | 'custom' = 'person';
  private subjectHeight: number = 1.75;

  private currentDate: Date = new Date();
  private currentLocation: GeoLocation = LocationService.getLocation();
  private isPlaying: boolean = false;
  private playSpeed: number = 1; // 1x, 2x, 4x
  private playIntervalId: any = null;

  private unsubLocation: (() => void) | null = null;

  public async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    this.currentLocation = LocationService.getLocation();
    this.currentDate = TimeService.getDate();

    this.render();
    this.initSimulator();
    this.attachEventListeners();
    this.updateCalculations();

    // Lyt efter lokationsændringer
    this.unsubLocation = LocationService.subscribe((loc) => {
      this.currentLocation = loc;
      this.updateLocationDisplay();
      this.updateCalculations();
      if (this.mapView) {
        this.mapView.setCenter(loc.lat, loc.lng);
      }
    });
  }

  public onActivate(context?: any): void {
    this.simulator?.resume();

    // Håndter kontekst fra f.eks. FotoVejr ("Se lysretning i FotoSol")
    if (context?.date) {
      this.currentDate = new Date(context.date);
    }
    if (context?.params) {
      const p = context.params as URLSearchParams;
      if (p.has('hour')) {
        const h = Number(p.get('hour')) || 12;
        this.currentDate.setHours(h, 0, 0, 0);
      }
      if (p.has('lat') && p.has('lng')) {
        const lat = Number(p.get('lat'));
        const lng = Number(p.get('lng'));
        if (!isNaN(lat) && !isNaN(lng)) {
          this.currentLocation = LocationService.setLocation({
            lat,
            lng,
            name: p.get('name') || 'Valgt position'
          });
        }
      }
    }

    this.updateLocationDisplay();
    this.updateCalculations();

    if (this.activeViewMode === 'map') {
      this.mapView?.invalidateSize();
    }
  }

  public onDeactivate(): void {
    this.pausePlayback();
    this.simulator?.pause();
  }

  public destroy(): void {
    this.pausePlayback();
    if (this.unsubLocation) {
      this.unsubLocation();
    }
  }

  private render(): void {
    const minutesOfDay = this.currentDate.getHours() * 60 + this.currentDate.getMinutes();

    this.container.innerHTML = `
      <div class="sun-container">
        <!-- Modul header -->
        <div class="sun-header">
          <div class="sun-module-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
            </svg>
            <span>FotoSol • Sol & Skygge</span>
          </div>
          <span class="fs-badge badge-sun" id="sunPhaseHeaderBadge">Gylden time</span>
        </div>

        <!-- LOKATION -->
        <div class="location-bar">
          <div class="loc-info-group" id="btnOpenLocationModal" title="Vælg lokation">
            <span class="loc-main-name" id="sunLocName">${this.currentLocation.name}</span>
            <span class="loc-sub-coords" id="sunLocCoords">${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø</span>
          </div>
          <div class="loc-actions">
            <button class="fs-btn-icon" id="btnSunGps" title="Brug aktuel GPS-position" aria-label="Brug GPS">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="8"></circle>
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- HERO TELEMETRI -->
        <div class="sun-hero-card">
          <div class="sun-main-telemetry">
            <div>
              <div class="sun-time-large" id="sunTimeDisplay">${TimeService.formatTime(this.currentDate)}</div>
              <div class="sun-date-sub" id="sunDateDisplay">${TimeService.formatDateDanish(this.currentDate)}</div>
            </div>
            <div class="sun-phase-badge-wrap">
              <span class="fs-badge badge-sun" id="sunLightPhaseBadge">Gylden time</span>
              <span class="sun-kelvin-badge" id="sunKelvinDisplay">3300K</span>
            </div>
          </div>

          <div class="sun-grid-metrics">
            <div class="stat-item">
              <span class="stat-label">Solhøjde</span>
              <span class="stat-num" id="sunAltitudeVal">+0.0°</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Solretning</span>
              <span class="stat-num" id="sunAzimuthVal">180° S</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Skyggelængde</span>
              <span class="stat-num" id="sunShadowLengthVal">0,0 m</span>
            </div>
          </div>
        </div>

        <!-- 3D / KOMPAS / KORT VISNING KORT -->
        <div class="sun-scene-card">
          <div class="scene-header-row">
            <div class="fs-segmented-control" style="max-width: 250px;">
              <button class="fs-segment-btn ${this.activeViewMode === '3d' ? 'active' : ''}" data-mode="3d" id="btnMode3D">3D Søger</button>
              <button class="fs-segment-btn ${this.activeViewMode === 'compass' ? 'active' : ''}" data-mode="compass" id="btnModeCompass">Kompas</button>
              <button class="fs-segment-btn ${this.activeViewMode === 'map' ? 'active' : ''}" data-mode="map" id="btnModeMap">Kort</button>
            </div>
            <span style="font-size: 11px; color: var(--text-dim);" id="sunSceneHint">3D EVF</span>
          </div>

          <div class="canvas-viewport-wrap">
            <canvas id="sunCanvas" style="${this.activeViewMode !== 'map' ? '' : 'display: none;'}"></canvas>
            <div id="sunMapContainer" style="${this.activeViewMode === 'map' ? '' : 'display: none;'}"></div>
          </div>

          <!-- 3D Kameragenveje -->
          <div class="camera-preset-bar" id="cameraPresetsWrap" style="${this.activeViewMode === '3d' ? '' : 'display: none;'}">
            <button class="quick-val-btn" data-cam="default">Standard 3D</button>
            <button class="quick-val-btn" data-cam="top">Fugleperspektiv</button>
            <button class="quick-val-btn" data-cam="rim">Modlys (Rim)</button>
            <button class="quick-val-btn" data-cam="shadow">Medlys (Skygge)</button>
          </div>
        </div>

        <!-- TIDSLINJE & SCRUBBER -->
        <div class="timeline-card">
          <div class="timeline-controls-row">
            <div class="playback-btns">
              <button class="btn-play-pause" id="btnPlayPause" title="Start/Pause tidsanimation" aria-label="Afspil">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              </button>
              <button class="btn-speed-badge" id="btnSpeedToggle">1x</button>
            </div>
            <button class="fs-btn" id="btnJumpNow" style="padding: 4px 10px; font-size: 11px; min-height: 32px;">
              Nu
            </button>
          </div>

          <div class="fs-slider-wrap">
            <input type="range" id="sunTimeSlider" min="0" max="1439" step="1" value="${minutesOfDay}">
          </div>

          <!-- HURTIGE SPRING I DØGNET -->
          <div class="sun-jump-scroll" id="sunQuickJumps">
            <!-- Udfyldes dynamisk ud fra dagens astronomiske soltider -->
          </div>
        </div>

        <!-- MOTIV OG SKYGGEINDSTILLINGER -->
        <div class="fs-card">
          <div class="fs-card-header">
            <span class="fs-card-title">Motiv & Skygge</span>
            <span class="fs-badge" id="subjectHeightBadge">1.75 m</span>
          </div>

          <div class="subject-selector-row">
            <button class="subject-btn ${this.subjectType === 'person' ? 'active' : ''}" data-subject="person" data-height="1.75">
              <span class="subject-icon">👤</span>
              <span class="subject-name">Person</span>
            </button>
            <button class="subject-btn ${this.subjectType === 'tree' ? 'active' : ''}" data-subject="tree" data-height="5.0">
              <span class="subject-icon">🌳</span>
              <span class="subject-name">Træ</span>
            </button>
            <button class="subject-btn ${this.subjectType === 'building' ? 'active' : ''}" data-subject="building" data-height="12.0">
              <span class="subject-icon">🏢</span>
              <span class="subject-name">Bygning</span>
            </button>
          </div>

          <div style="margin-top: 14px;">
            <p id="sunShadowTip" style="font-size: 13px; color: var(--text-muted); line-height: 1.4;"></p>
          </div>
        </div>
      </div>
    `;
  }

  private initSimulator(): void {
    const canvas = this.container.querySelector('#sunCanvas') as HTMLCanvasElement;
    if (canvas) {
      this.simulator = new ShadowSimulator(canvas, {
        mode: this.activeViewMode === 'compass' ? 'compass' : '3d',
        subjectType: this.subjectType,
        subjectHeight: this.subjectHeight
      });
    }
  }

  private attachEventListeners(): void {
    // Mode skift (3D / Kompas / Kort)
    const btn3D = this.container.querySelector('#btnMode3D');
    const btnCompass = this.container.querySelector('#btnModeCompass');
    const btnMap = this.container.querySelector('#btnModeMap');
    const canvas = this.container.querySelector('#sunCanvas') as HTMLElement;
    const mapContainer = this.container.querySelector('#sunMapContainer') as HTMLElement;
    const camPresets = this.container.querySelector('#cameraPresetsWrap') as HTMLElement;
    const sceneHint = this.container.querySelector('#sunSceneHint');

    const setMode = async (mode: '3d' | 'compass' | 'map') => {
      this.activeViewMode = mode;
      btn3D?.classList.toggle('active', mode === '3d');
      btnCompass?.classList.toggle('active', mode === 'compass');
      btnMap?.classList.toggle('active', mode === 'map');

      if (mode === 'map') {
        canvas.style.display = 'none';
        mapContainer.style.display = 'block';
        camPresets.style.display = 'none';
        if (sceneHint) sceneHint.textContent = 'Satellitkort';

        // Lazy-load Leaflet kort
        if (!this.mapView) {
          this.mapView = new MapView(mapContainer);
          await this.mapView.init(this.currentLocation.lat, this.currentLocation.lng);
        }
        this.mapView.invalidateSize();
      } else {
        canvas.style.display = 'block';
        mapContainer.style.display = 'none';
        camPresets.style.display = mode === '3d' ? 'flex' : 'none';
        if (sceneHint) sceneHint.textContent = mode === '3d' ? '3D EVF' : 'Top-down Solur';
        this.simulator?.setMode(mode);
      }
      this.updateCalculations();
    };

    btn3D?.addEventListener('click', () => setMode('3d'));
    btnCompass?.addEventListener('click', () => setMode('compass'));
    btnMap?.addEventListener('click', () => setMode('map'));

    // Kameragenveje
    this.container.querySelectorAll('[data-cam]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = (btn as HTMLElement).dataset.cam as any;
        this.simulator?.resetCamera(preset);
      });
    });

    // Tidslinje slider
    const timeSlider = this.container.querySelector('#sunTimeSlider') as HTMLInputElement;
    timeSlider?.addEventListener('input', () => {
      this.pausePlayback();
      const minutes = Number(timeSlider.value);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      this.currentDate.setHours(hours, mins, 0, 0);
      this.updateCalculations();
    });

    // Play/Pause og hastighed
    const btnPlay = this.container.querySelector('#btnPlayPause');
    btnPlay?.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pausePlayback();
      } else {
        this.startPlayback();
      }
    });

    const btnSpeed = this.container.querySelector('#btnSpeedToggle');
    btnSpeed?.addEventListener('click', () => {
      if (this.playSpeed === 1) this.playSpeed = 2;
      else if (this.playSpeed === 2) this.playSpeed = 4;
      else this.playSpeed = 1;
      if (btnSpeed) btnSpeed.textContent = `${this.playSpeed}x`;
      if (this.isPlaying) {
        this.pausePlayback();
        this.startPlayback();
      }
    });

    // "Nu" knap
    this.container.querySelector('#btnJumpNow')?.addEventListener('click', () => {
      this.pausePlayback();
      this.currentDate = new Date();
      timeSlider.value = String(this.currentDate.getHours() * 60 + this.currentDate.getMinutes());
      this.updateCalculations();
    });

    // GPS knap
    this.container.querySelector('#btnSunGps')?.addEventListener('click', async () => {
      try {
        const btn = this.container.querySelector('#btnSunGps') as HTMLElement;
        btn.style.opacity = '0.5';
        const loc = await LocationService.requestGpsLocation();
        this.currentLocation = loc;
        this.updateLocationDisplay();
        this.updateCalculations();
        btn.style.opacity = '1';
      } catch (err) {
        alert((err as Error).message);
      }
    });

    // Genstandsvælgere
    this.container.querySelectorAll('[data-subject]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn as HTMLElement;
        const type = target.dataset.subject as any;
        const height = Number(target.dataset.height);
        this.subjectType = type;
        this.subjectHeight = height;

        this.container.querySelectorAll('[data-subject]').forEach((b) => b.classList.remove('active'));
        target.classList.add('active');

        const badge = this.container.querySelector('#subjectHeightBadge');
        if (badge) badge.textContent = `${height.toFixed(1)} m`;

        this.simulator?.setSubjectType(type, height);
        this.updateCalculations();
      });
    });
  }

  private startPlayback(): void {
    this.isPlaying = true;
    const btnPlay = this.container.querySelector('#btnPlayPause');
    if (btnPlay) {
      btnPlay.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      `;
    }

    const intervalMs = Math.max(25, Math.floor(100 / this.playSpeed));
    this.playIntervalId = setInterval(() => {
      // Tilføj 2 minutter pr tick
      this.currentDate = new Date(this.currentDate.getTime() + 2 * 60 * 1000);
      const minutes = this.currentDate.getHours() * 60 + this.currentDate.getMinutes();
      const slider = this.container.querySelector('#sunTimeSlider') as HTMLInputElement;
      if (slider) slider.value = String(minutes);
      this.updateCalculations();
    }, intervalMs);
  }

  private pausePlayback(): void {
    this.isPlaying = false;
    if (this.playIntervalId) {
      clearInterval(this.playIntervalId);
      this.playIntervalId = null;
    }
    const btnPlay = this.container.querySelector('#btnPlayPause');
    if (btnPlay) {
      btnPlay.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      `;
    }
  }

  private updateLocationDisplay(): void {
    const nameEl = this.container.querySelector('#sunLocName');
    const coordsEl = this.container.querySelector('#sunLocCoords');
    if (nameEl) nameEl.textContent = this.currentLocation.name;
    if (coordsEl) coordsEl.textContent = `${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`;
  }

  private updateCalculations(): void {
    const lat = this.currentLocation.lat;
    const lng = this.currentLocation.lng;

    const sunPos = AstroCore.getSunPosition(this.currentDate, lat, lng);
    const sunTimes = AstroCore.getSunTimes(this.currentDate, lat, lng);
    const shadowCalc: ShadowCalculation = AstroCore.calculateShadow(sunPos.altitude, sunPos.azimuth, this.subjectHeight);
    const kelvin = AstroCore.getEstimatedKelvin(sunPos.altitude);

    // Opdater tal i interfacet
    const timeEl = this.container.querySelector('#sunTimeDisplay');
    const dateEl = this.container.querySelector('#sunDateDisplay');
    const altEl = this.container.querySelector('#sunAltitudeVal');
    const azEl = this.container.querySelector('#sunAzimuthVal');
    const shadowEl = this.container.querySelector('#sunShadowLengthVal');
    const kelvinEl = this.container.querySelector('#sunKelvinDisplay');
    const phaseBadge = this.container.querySelector('#sunLightPhaseBadge');
    const headerBadge = this.container.querySelector('#sunPhaseHeaderBadge');
    const tipEl = this.container.querySelector('#sunShadowTip');

    if (timeEl) timeEl.textContent = TimeService.formatTime(this.currentDate);
    if (dateEl) dateEl.textContent = TimeService.formatDateDanish(this.currentDate);
    if (altEl) altEl.textContent = `${sunPos.altitude >= 0 ? '+' : ''}${sunPos.altitude.toFixed(1)}°`;
    if (azEl) azEl.textContent = `${sunPos.azimuth.toFixed(0)}° ${AstroCore.getCompassDirection(sunPos.azimuth)}`;
    if (shadowEl) shadowEl.textContent = shadowCalc.hasDirectShadow ? `${shadowCalc.shadowLength.toFixed(1).replace('.', ',')} m` : 'Ingen (Diffust)';
    if (kelvinEl) kelvinEl.textContent = `${kelvin.kelvin}K (${kelvin.label})`;

    if (phaseBadge) {
      phaseBadge.textContent = shadowCalc.lightPhase.badge;
      phaseBadge.setAttribute('style', `background: ${shadowCalc.lightPhase.color}33; color: ${shadowCalc.lightPhase.color};`);
    }
    if (headerBadge) {
      headerBadge.textContent = shadowCalc.lightPhase.name;
    }
    if (tipEl) {
      tipEl.textContent = `${shadowCalc.description} ${shadowCalc.cameraTip}`;
    }

    // Opdater 3D Canvas
    this.simulator?.update(sunPos.altitude, sunPos.azimuth, this.subjectHeight, {
      subjectType: this.subjectType,
      sunTimes
    });

    // Opdater Leaflet kort
    if (this.activeViewMode === 'map' && this.mapView) {
      this.mapView.update(lat, lng, sunPos.azimuth, shadowCalc.shadowAzimuth, shadowCalc.shadowLength);
    }

    // Render hurtige solspring pills
    this.renderQuickJumps(sunTimes);
  }

  private renderQuickJumps(times: SunTimes): void {
    const jumpsWrap = this.container.querySelector('#sunQuickJumps');
    if (!jumpsWrap) return;

    const events = [
      { name: 'Blå time', time: times.blueHourMorning?.start },
      { name: 'Solopgang', time: times.sunrise },
      { name: 'Gylden time', time: times.goldenHourMorning?.end },
      { name: 'Solmiddag', time: times.solarNoon },
      { name: 'Gylden time', time: times.goldenHourEvening?.start },
      { name: 'Solnedgang', time: times.sunset },
      { name: 'Blå time', time: times.blueHourEvening?.end }
    ].filter((e) => e.time !== null && e.time !== undefined);

    jumpsWrap.innerHTML = events
      .map(
        (ev) => `
      <button class="sun-jump-btn" data-time="${(ev.time as Date).getTime()}">
        <span class="jump-time">${TimeService.formatTime(ev.time)}</span>
        <span class="jump-name">${ev.name}</span>
      </button>
    `
      )
      .join('');

    jumpsWrap.querySelectorAll('[data-time]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.pausePlayback();
        const t = Number((btn as HTMLElement).dataset.time);
        this.currentDate = new Date(t);
        const minutes = this.currentDate.getHours() * 60 + this.currentDate.getMinutes();
        const slider = this.container.querySelector('#sunTimeSlider') as HTMLInputElement;
        if (slider) slider.value = String(minutes);
        this.updateCalculations();
      });
    });
  }
}
