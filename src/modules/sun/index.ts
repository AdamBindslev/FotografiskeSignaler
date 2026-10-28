/**
 * index.ts - Sol modul controller (§7)
 */

import { ModuleInstance } from '../../app/ModuleRegistry.ts';
import { AstroCore, SunTimes, MoonTimes, MoonIllumination, ShadowCalculation } from '../../shared/astronomy/AstroCore.ts';
import { LocationService, GeoLocation } from '../../shared/services/LocationService.ts';
import { TimeService } from '../../shared/services/TimeService.ts';
import { ShadowSimulator } from './visualization/shadow-sim.ts';
import { MapView } from './visualization/map-view.ts';
import { LocationBar } from '../../shared/components/LocationBar.ts';
import './sun.css';

export default class SunModule implements ModuleInstance {
  private container!: HTMLElement;
  private simulator: ShadowSimulator | null = null;
  private mapView: MapView | null = null;
  private locationBar: LocationBar | null = null;

  private celestialBody: 'sun' | 'moon' = 'sun';
  private activeViewMode: '3d' | 'compass' | 'map' = '3d';
  private subjectType: 'person' | 'tree' | 'building' | 'custom' = 'person';
  private subjectHeight: number = 1.75;

  private currentDate: Date = new Date();
  private currentLocation: GeoLocation = LocationService.getLocation();
  private isPlaying: boolean = false;
  private playSpeed: number = 1; // 1x, 2x, 4x
  private playIntervalId: any = null;

  private isLiveCompass: boolean = false;
  private currentHeading: number | null = null;
  private boundOrientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;

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

    let shouldFocusSun = false;

    // Håndter kontekst fra f.eks. Vejr
    if (context?.body === 'moon' || context?.body === 'sun') {
      this.setCelestialBody(context.body, false);
      shouldFocusSun = true;
    }
    if (context?.date) {
      this.currentDate = new Date(context.date);
      shouldFocusSun = true;
    }
    if (context?.params) {
      const p = context.params as URLSearchParams;
      if (p.has('body')) {
        const b = p.get('body');
        if (b === 'moon' || b === 'sun') {
          this.setCelestialBody(b, false);
          shouldFocusSun = true;
        }
      }
      if (p.has('date')) {
        const dStr = p.get('date')!;
        const parsed = TimeService.parseIsoDate(dStr);
        if (parsed) {
          parsed.setHours(this.currentDate.getHours(), this.currentDate.getMinutes(), 0, 0);
          this.currentDate = parsed;
          shouldFocusSun = true;
        }
      }
      if (p.has('hour')) {
        const h = Number(p.get('hour')) || 12;
        this.currentDate.setHours(h, 0, 0, 0);
        shouldFocusSun = true;
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

    // Synkroniser tidslinjeslider med den aktuelle tid
    const slider = this.container.querySelector('#sunTimeSlider') as HTMLInputElement | null;
    if (slider) {
      const minutes = this.currentDate.getHours() * 60 + this.currentDate.getMinutes();
      slider.value = String(minutes);
    }

    this.updateLocationDisplay();
    this.updateCalculations();

    if (shouldFocusSun) {
      this.simulator?.resetCamera('default');
    }

    if (this.activeViewMode === 'map') {
      this.mapView?.invalidateSize();
    }
  }

  public onDeactivate(): void {
    this.pausePlayback();
    this.stopLiveCompass();
    this.simulator?.pause();
  }

  public destroy(): void {
    this.pausePlayback();
    this.stopLiveCompass();
    if (this.unsubLocation) {
      this.unsubLocation();
      this.unsubLocation = null;
    }
    if (this.locationBar) {
      this.locationBar.destroy();
      this.locationBar = null;
    }
    if (this.simulator) {
      this.simulator.destroy();
      this.simulator = null;
    }
  }

  private render(): void {
    if (this.locationBar) {
      this.locationBar.destroy();
      this.locationBar = null;
    }

    const minutesOfDay = this.currentDate.getHours() * 60 + this.currentDate.getMinutes();

    this.container.innerHTML = `
      <div class="sun-container ${this.celestialBody === 'moon' ? 'mode-moon' : ''}" id="sunModuleRoot">
        <!-- Modul header med [☀️ Sol | 🌕 Måne] tilstandsknap -->
        <div class="sun-header">
          <div class="sun-celestial-segmented" role="tablist" aria-label="Vælg himmellegeme">
            <button class="sun-celestial-btn ${this.celestialBody === 'sun' ? 'active' : ''}" data-body="sun" id="btnBodySun" role="tab" aria-selected="${this.celestialBody === 'sun'}">
              <span>☀️</span>
              <span>Sol</span>
            </button>
            <button class="sun-celestial-btn ${this.celestialBody === 'moon' ? 'active' : ''}" data-body="moon" id="btnBodyMoon" role="tab" aria-selected="${this.celestialBody === 'moon'}">
              <span id="btnBodyMoonIcon">🌕</span>
              <span>Måne</span>
            </button>
          </div>
          <span class="fs-badge badge-sun" id="sunPhaseHeaderBadge">Gylden time</span>
        </div>

        <!-- FÆLLES LOKATION (§4.2, §9.1) -->
        <div id="sunLocationMount"></div>

        <!-- HERO TELEMETRI -->
        <div class="sun-hero-card">
          <div class="sun-main-telemetry">
            <div>
              <div class="sun-time-large" id="sunTimeDisplay">${TimeService.formatTime(this.currentDate)}</div>
              <div class="sun-date-sub" id="sunDateDisplay" role="button" tabindex="0" title="Tryk for at vælge dato">${TimeService.formatDateDanish(this.currentDate)}</div>
            </div>
            <div class="sun-phase-badge-wrap">
              <span class="fs-badge badge-sun" id="sunLightPhaseBadge">Gylden time</span>
              <span class="sun-kelvin-badge" id="sunKelvinDisplay">3300K</span>
            </div>
          </div>

          <div class="sun-grid-metrics">
            <div class="stat-item">
              <span class="stat-label" id="lblMetric1">Solhøjde</span>
              <span class="stat-num" id="sunAltitudeVal">+0.0°</span>
            </div>
            <div class="stat-item">
              <span class="stat-label" id="lblMetric2">Solretning</span>
              <span class="stat-num" id="sunAzimuthVal">180° S</span>
            </div>
            <div class="stat-item">
              <span class="stat-label" id="lblMetric3">Skyggelængde</span>
              <span class="stat-num" id="sunShadowLengthVal">0,0 m</span>
            </div>
          </div>

          <!-- Måne opgang / kulmination / nedgang med kompasretning (vises i Måne-tilstand) -->
          <div class="moon-events-strip" id="moonEventsStrip" style="display: ${this.celestialBody === 'moon' ? 'grid' : 'none'};">
            <div class="moon-event-box" id="boxMoonRise" title="Tryk for at hoppe til måneopgang">
              <span class="moon-event-label">↑ Måneopgang</span>
              <span class="moon-event-time" id="moonRiseTimeVal">--:--</span>
              <span class="moon-event-dir" id="moonRiseDirVal">--°</span>
            </div>
            <div class="moon-event-box" id="boxMoonTransit" title="Tryk for at hoppe til månens højeste punkt">
              <span class="moon-event-label"> culminating • Top</span>
              <span class="moon-event-time" id="moonTransitTimeVal">--:--</span>
              <span class="moon-event-dir" id="moonTransitAltVal">--°</span>
            </div>
            <div class="moon-event-box" id="boxMoonSet" title="Tryk for at hoppe til månenedgang">
              <span class="moon-event-label">↓ Månenedgang</span>
              <span class="moon-event-time" id="moonSetTimeVal">--:--</span>
              <span class="moon-event-dir" id="moonSetDirVal">--°</span>
            </div>
          </div>
        </div>

        <!-- 3D / KOMPAS / KORT VISNING KORT -->
        <div class="sun-scene-card">
          <div class="scene-header-row">
            <div class="fs-segmented-control" style="max-width: 245px;">
              <button class="fs-segment-btn ${this.activeViewMode === '3d' ? 'active' : ''}" data-mode="3d" id="btnMode3D">3D Søger</button>
              <button class="fs-segment-btn ${this.activeViewMode === 'compass' ? 'active' : ''}" data-mode="compass" id="btnModeCompass">Kompas</button>
              <button class="fs-segment-btn ${this.activeViewMode === 'map' ? 'active' : ''}" data-mode="map" id="btnModeMap">Kort</button>
            </div>
            <div style="display:flex;align-items:center;gap:6px;">
              <button class="btn-live-compass ${this.isLiveCompass ? 'active' : ''}" id="btnLiveCompass" style="${this.activeViewMode !== 'map' ? '' : 'display:none;'}" title="Følg telefonens indbyggede kompas (peger opad mod din synsretning)">
                <span>🧭</span>
                <span id="lblLiveCompass">Live kompas</span>
              </button>
              <span style="font-size: 11px; color: var(--text-dim); ${this.activeViewMode === 'map' ? '' : 'display:none;'}" id="sunSceneHint">Satellitkort</span>
            </div>
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

        <!-- TIDSLINJE, DATO & SCRUBBER -->
        <div class="timeline-card">
          <!-- TIDSKONTROL, LIVETID & SLIDER (PLACERET ØVERST LIGE UNDER SCENEN) -->
          <div class="sun-scrubber-section">
            <div class="timeline-controls-row">
              <div class="playback-btns">
                <button class="btn-play-pause" id="btnPlayPause" title="Start/Pause tidsanimation" aria-label="Afspil">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </button>
                <button class="btn-speed-badge" id="btnSpeedToggle" title="Skift afspilningshastighed">1x</button>
              </div>

              <!-- CENTRERET LIVETID & FASE LIGE VED SLIDEREN -->
              <div class="timeline-time-display-wrap">
                <div class="timeline-time-main" id="sunScrubberTimeVal">${TimeService.formatTime(this.currentDate)}</div>
                <div class="timeline-time-sub" id="sunScrubberPhasePill">Gylden time</div>
              </div>

              <button class="fs-btn" id="btnJumpNow" style="padding: 4px 10px; font-size: 11px; min-height: 32px;" title="Gå til dags dato og aktuel tid">
                Nu (I dag)
              </button>
            </div>

            <!-- SLIDER MED FLYDENDE TIDSBOBLE OG 24T AKSE -->
            <div class="fs-slider-wrap sun-slider-container">
              <div class="sun-slider-bubble" id="sunSliderBubble">${TimeService.formatTime(this.currentDate)}</div>
              <input type="range" id="sunTimeSlider" min="0" max="1439" step="1" value="${minutesOfDay}" aria-label="Juster tid på døgnet">
              <div class="sun-slider-scale">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>24:00</span>
              </div>
            </div>

            <!-- HURTIGE SPRING I DØGNET -->
            <div class="sun-jump-scroll" id="sunQuickJumps">
              <!-- Udfyldes dynamisk ud fra dagens astronomiske soltider -->
            </div>
          </div>

          <div class="sun-timeline-divider"></div>

          <!-- DATO-VÆLGER OG PLANLÆGNING (§7) -->
          <div class="sun-planner-section">
            <div class="sun-planner-header">
              <div class="sun-planner-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Planlæg dato</span>
              </div>
              <span class="fs-badge" id="sunDateStatusBadge">I dag</span>
            </div>

            <!-- DATO NAVIGATIONSLINJE: [-1 dag] [DATO DISPLAY + NATIV DATOVÆLGER] [+1 dag] -->
            <div class="sun-date-nav-row">
              <button class="fs-btn-icon sun-day-step-btn" id="btnPrevDay" title="Forrige dag (-1 dag)" aria-label="Forrige dag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>

              <div class="sun-date-box" id="sunDateBox" title="Tryk for at vælge dato i kalenderen">
                <input type="date" id="sunDatePickerInput" class="sun-date-input" value="${TimeService.formatIsoDate(this.currentDate)}" aria-label="Vælg dato">
                <div class="sun-date-box-content">
                  <div class="sun-date-box-main">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span id="sunDateMainLabel">${TimeService.formatDateDanish(this.currentDate)} ${this.currentDate.getFullYear()}</span>
                  </div>
                  <div class="sun-date-box-sub" id="sunDateSubLabel">Tryk for kalender • Dags dato</div>
                </div>
              </div>

              <button class="fs-btn-icon sun-day-step-btn" id="btnNextDay" title="Næste dag (+1 dag)" aria-label="Næste dag">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <!-- HURTIGE PLANLÆGNINGSGENVEJE -->
            <div class="sun-date-presets-scroll" id="sunDatePresets">
              <button class="sun-preset-pill active" data-preset="today">I dag</button>
              <button class="sun-preset-pill" data-preset="tomorrow">I morgen</button>
              <button class="sun-preset-pill" data-preset="day-after">I overmorgen</button>
              <button class="sun-preset-pill" data-preset="next-full-moon" title="Hop til næste fuldmåne">🌕 Næste fuldmåne</button>
              <button class="sun-preset-pill" data-preset="next-new-moon" title="Hop til næste nymåne (mørk himmel)">🌑 Næste nymåne</button>
              <button class="sun-preset-pill" data-preset="week">+7 dage</button>
              <button class="sun-preset-pill" data-preset="month">+30 dage</button>
              <button class="sun-preset-pill" data-preset="summer-solstice" title="Sommersolhverv (21. jun)">☀️ Sommersolhverv</button>
              <button class="sun-preset-pill" data-preset="autumn-equinox" title="Efterårsjævndøgn (22. sep)">🍂 Efterårsjævndøgn</button>
              <button class="sun-preset-pill" data-preset="winter-solstice" title="Vintersolhverv (21. dec)">❄️ Vintersolhverv</button>
              <button class="sun-preset-pill" data-preset="spring-equinox" title="Forårsjævndøgn (20. mar)">🌱 Forårsjævndøgn</button>
            </div>
          </div>
        </div>

        <!-- MOTIV OG SKYGGEINDSTILLINGER -->
        <div class="fs-card">
          <div class="fs-card-header">
            <span class="fs-card-title">Motiv & Skygge</span>
            <span class="fs-badge" id="subjectHeightBadge">${this.subjectHeight.toFixed(2).replace('.', ',').replace(',00', ',0')} m</span>
          </div>

          <div class="subject-selector-row" style="grid-template-columns: repeat(4, 1fr);">
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
            <button class="subject-btn ${this.subjectType === 'custom' ? 'active' : ''}" data-subject="custom" data-height="${this.subjectHeight}">
              <span class="subject-icon">📏</span>
              <span class="subject-name">Valgfri</span>
            </button>
          </div>

          <!-- Valgfri højde slider -->
          <div class="fs-slider-wrap" id="customHeightWrap" style="margin-top: 12px; display: ${this.subjectType === 'custom' ? 'flex' : 'none'};">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Brugerdefineret højde</span>
              <span class="fs-slider-val" id="customHeightDisplay">${this.subjectHeight.toFixed(1).replace('.', ',')} m</span>
            </div>
            <input type="range" id="customHeightSlider" min="0.5" max="50" step="0.25" value="${this.subjectHeight}">
          </div>

          <div style="margin-top: 14px;">
            <p id="sunShadowTip" style="font-size: 13px; color: var(--text-muted); line-height: 1.4;"></p>
          </div>
        </div>
      </div>
    `;

    // Monter fælles LocationBar
    const mountEl = this.container.querySelector('#sunLocationMount') as HTMLElement | null;
    if (mountEl) {
      this.locationBar = new LocationBar({
        container: mountEl,
        accentClass: 'fs-btn-accent-sun'
      });
    }
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

  private setCelestialBody(body: 'sun' | 'moon', updateAfter: boolean = true): void {
    this.celestialBody = body;
    const root = this.container.querySelector('#sunModuleRoot');
    const btnSun = this.container.querySelector('#btnBodySun');
    const btnMoon = this.container.querySelector('#btnBodyMoon');
    const moonStrip = this.container.querySelector('#moonEventsStrip') as HTMLElement | null;

    root?.classList.toggle('mode-moon', body === 'moon');
    btnSun?.classList.toggle('active', body === 'sun');
    btnSun?.setAttribute('aria-selected', String(body === 'sun'));
    btnMoon?.classList.toggle('active', body === 'moon');
    btnMoon?.setAttribute('aria-selected', String(body === 'moon'));

    if (moonStrip) {
      moonStrip.style.display = body === 'moon' ? 'grid' : 'none';
    }

    if (updateAfter) {
      this.updateCalculations();
      this.simulator?.resetCamera('default');
    }
  }

  private attachEventListeners(): void {
    // Skift mellem Sol og Måne ([☀️ Sol | 🌕 Måne])
    this.container.querySelector('#btnBodySun')?.addEventListener('click', () => {
      this.setCelestialBody('sun', true);
    });
    this.container.querySelector('#btnBodyMoon')?.addEventListener('click', () => {
      this.setCelestialBody('moon', true);
    });

    // Klik på måneopgang / kulmination / månenedgang i Hero-kortet hopper direkte til tidspunktet
    const jumpToDatasetTime = (elId: string) => {
      const el = this.container.querySelector(elId) as HTMLElement | null;
      el?.addEventListener('click', () => {
        const ts = Number(el.dataset.time || 0);
        if (ts > 0) {
          this.pausePlayback();
          this.currentDate = new Date(ts);
          const minutes = this.currentDate.getHours() * 60 + this.currentDate.getMinutes();
          const slider = this.container.querySelector('#sunTimeSlider') as HTMLInputElement;
          if (slider) slider.value = String(minutes);
          this.updateCalculations();
          this.simulator?.resetCamera('default');
        }
      });
    };
    jumpToDatasetTime('#boxMoonRise');
    jumpToDatasetTime('#boxMoonTransit');
    jumpToDatasetTime('#boxMoonSet');

    // Mode skift (3D / Kompas / Kort)
    const btn3D = this.container.querySelector('#btnMode3D');
    const btnCompass = this.container.querySelector('#btnModeCompass');
    const btnMap = this.container.querySelector('#btnModeMap');
    const btnLiveCompass = this.container.querySelector('#btnLiveCompass') as HTMLElement | null;
    const canvas = this.container.querySelector('#sunCanvas') as HTMLElement;
    const mapContainer = this.container.querySelector('#sunMapContainer') as HTMLElement;
    const camPresets = this.container.querySelector('#cameraPresetsWrap') as HTMLElement;
    const sceneHint = this.container.querySelector('#sunSceneHint') as HTMLElement | null;

    btnLiveCompass?.addEventListener('click', () => {
      this.toggleLiveCompass();
    });

    const setMode = async (mode: '3d' | 'compass' | 'map') => {
      this.activeViewMode = mode;
      btn3D?.classList.toggle('active', mode === '3d');
      btnCompass?.classList.toggle('active', mode === 'compass');
      btnMap?.classList.toggle('active', mode === 'map');

      if (mode === 'map') {
        canvas.style.display = 'none';
        mapContainer.style.display = 'block';
        camPresets.style.display = 'none';
        if (btnLiveCompass) btnLiveCompass.style.display = 'none';
        if (sceneHint) {
          sceneHint.style.display = 'inline';
          sceneHint.textContent = 'Satellitkort';
        }

        // Lazy-load Leaflet kort
        if (!this.mapView) {
          this.mapView = new MapView(mapContainer, {
            onLocationChange: (newLat, newLng) => {
              this.currentLocation = LocationService.setLocation({
                lat: newLat,
                lng: newLng,
                name: 'Valgt position på kort'
              });
              this.updateLocationDisplay();
              this.updateCalculations();
            }
          });
          await this.mapView.init(this.currentLocation.lat, this.currentLocation.lng);
        }
        this.mapView.invalidateSize();
      } else {
        canvas.style.display = 'block';
        mapContainer.style.display = 'none';
        camPresets.style.display = mode === '3d' ? 'flex' : 'none';
        if (btnLiveCompass) btnLiveCompass.style.display = 'inline-flex';
        if (sceneHint) sceneHint.style.display = 'none';
        this.simulator?.setMode(mode);
        if (this.isLiveCompass && this.currentHeading !== null) {
          this.simulator?.setLiveCompass(true, this.currentHeading);
        }
      }
      this.updateCalculations();
    };

    btn3D?.addEventListener('click', () => setMode('3d'));
    btnCompass?.addEventListener('click', () => setMode('compass'));
    btnMap?.addEventListener('click', () => setMode('map'));

    // Kameragenveje
    this.container.querySelectorAll('[data-cam]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.isLiveCompass) {
          this.stopLiveCompass();
        }
        const preset = (btn as HTMLElement).dataset.cam as any;
        this.simulator?.resetCamera(preset);
      });
    });

    // Datovælger & Planlægning listeners
    const dateInput = this.container.querySelector('#sunDatePickerInput') as HTMLInputElement;
    const handleDateInput = () => {
      this.pausePlayback();
      if (dateInput?.value) {
        const parsed = TimeService.parseIsoDate(dateInput.value);
        if (parsed) {
          this.setDate(parsed);
        }
      }
    };
    dateInput?.addEventListener('change', handleDateInput);
    dateInput?.addEventListener('input', handleDateInput);

    // Åbn datovælger ved klik på datovisning i hero-kort eller datoboks
    const openDatePicker = () => {
      if (dateInput) {
        if (typeof (dateInput as any).showPicker === 'function') {
          try {
            (dateInput as any).showPicker();
          } catch {
            dateInput.focus();
            dateInput.click();
          }
        } else {
          dateInput.focus();
          dateInput.click();
        }
      }
    };
    this.container.querySelector('#sunDateDisplay')?.addEventListener('click', openDatePicker);

    // Forrige / Næste dag knapper (-1 dag / +1 dag)
    this.container.querySelector('#btnPrevDay')?.addEventListener('click', () => {
      this.pausePlayback();
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() - 1);
      this.setDate(d);
    });

    this.container.querySelector('#btnNextDay')?.addEventListener('click', () => {
      this.pausePlayback();
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + 1);
      this.setDate(d);
    });

    // Hurtige planlægnings-presets
    this.container.querySelectorAll('[data-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.pausePlayback();
        const preset = (btn as HTMLElement).dataset.preset;
        const now = new Date();
        let target = new Date();
        switch (preset) {
          case 'today':
            target = new Date();
            break;
          case 'tomorrow':
            target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'day-after':
            target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
            break;
          case 'next-full-moon':
            target = AstroCore.getNextMoonPhaseDate('full', now);
            break;
          case 'next-new-moon':
            target = AstroCore.getNextMoonPhaseDate('new', now);
            break;
          case 'week':
            target = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + 7);
            break;
          case 'month':
            target = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), this.currentDate.getDate() + 30);
            break;
          case 'summer-solstice':
            target = TimeService.getNextSolsticeOrEquinox('summer-solstice', now);
            break;
          case 'autumn-equinox':
            target = TimeService.getNextSolsticeOrEquinox('autumn-equinox', now);
            break;
          case 'winter-solstice':
            target = TimeService.getNextSolsticeOrEquinox('winter-solstice', now);
            break;
          case 'spring-equinox':
            target = TimeService.getNextSolsticeOrEquinox('spring-equinox', now);
            break;
        }
        this.setDate(target);
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

    // "Nu" knap (nulstil til aktuel dag og tid)
    this.container.querySelector('#btnJumpNow')?.addEventListener('click', () => {
      this.pausePlayback();
      const now = new Date();
      TimeService.setTimeToNow();
      timeSlider.value = String(now.getHours() * 60 + now.getMinutes());
      this.setDate(now);
    });

    // Genstandsvælgere
    const customHeightWrap = this.container.querySelector('#customHeightWrap') as HTMLElement | null;
    const customHeightSlider = this.container.querySelector('#customHeightSlider') as HTMLInputElement | null;
    const customHeightDisplay = this.container.querySelector('#customHeightDisplay');

    this.container.querySelectorAll('[data-subject]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn as HTMLElement;
        const type = target.dataset.subject as any;
        this.subjectType = type;

        if (type !== 'custom') {
          this.subjectHeight = Number(target.dataset.height);
          if (customHeightSlider) customHeightSlider.value = String(this.subjectHeight);
        }

        if (customHeightWrap) {
          customHeightWrap.style.display = type === 'custom' ? 'flex' : 'none';
        }

        this.container.querySelectorAll('[data-subject]').forEach((b) => b.classList.remove('active'));
        target.classList.add('active');

        const badge = this.container.querySelector('#subjectHeightBadge');
        if (badge) badge.textContent = `${this.subjectHeight.toFixed(2).replace('.', ',').replace(',00', ',0')} m`;
        if (customHeightDisplay) customHeightDisplay.textContent = `${this.subjectHeight.toFixed(1).replace('.', ',')} m`;

        this.simulator?.setSubjectType(type, this.subjectHeight);
        this.updateCalculations();
      });
    });

    customHeightSlider?.addEventListener('input', () => {
      const val = Number(customHeightSlider.value);
      this.subjectHeight = val;
      const badge = this.container.querySelector('#subjectHeightBadge');
      if (badge) badge.textContent = `${val.toFixed(2).replace('.', ',').replace(',00', ',0')} m`;
      if (customHeightDisplay) customHeightDisplay.textContent = `${val.toFixed(2).replace('.', ',').replace(',00', ',0')} m`;
      this.simulator?.setSubjectType(this.subjectType, val);
      this.updateCalculations();
    });
  }

  private async toggleLiveCompass(): Promise<void> {
    if (this.isLiveCompass) {
      this.stopLiveCompass();
      return;
    }

    const DOE = (window as any).DeviceOrientationEvent;
    if (!DOE) {
      alert('Din enhed eller browser understøtter ikke kompas-sensorer.');
      return;
    }

    // iOS 13+ kræver eksplicit brugertilladelse via en klik-handling
    if (typeof DOE.requestPermission === 'function') {
      try {
        const permState = await DOE.requestPermission();
        if (permState !== 'granted') {
          alert('Adgang til telefonens kompas blev afvist. Tillad bevægelses- og orienteringssensorer i Safari-indstillinger.');
          return;
        }
      } catch (err) {
        console.error('Fejl ved anmodning om kompas-tilladelse:', err);
        return;
      }
    }

    this.isLiveCompass = true;
    this.updateLiveCompassButtonUI();

    this.boundOrientationHandler = (e: any) => {
      let heading: number | null = null;

      if (typeof e.webkitCompassHeading === 'number' && !isNaN(e.webkitCompassHeading)) {
        // iOS Safari: webkitCompassHeading er grader med uret fra magnetisk nord (0 = N, 90 = Ø)
        heading = e.webkitCompassHeading;
      } else if (typeof e.alpha === 'number' && !isNaN(e.alpha)) {
        // Android / Standard DeviceOrientation: alpha er rotation mod uret, så kompasretning = (360 - alpha) % 360
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null) {
        // Udglat små rystelser (lavpas-filter med cirkulær vinkelhåndtering)
        if (this.currentHeading === null) {
          this.currentHeading = heading;
        } else {
          let diff = ((heading - this.currentHeading + 540) % 360) - 180;
          if (Math.abs(diff) > 0.4) {
            this.currentHeading = (this.currentHeading + diff * 0.35 + 360) % 360;
          }
        }
        this.updateLiveCompassButtonUI();
        this.simulator?.setLiveCompass(true, this.currentHeading);
      }
    };

    const win = window as any;
    // Lyt på både deviceorientationabsolute (Android) og deviceorientation (iOS)
    if ('ondeviceorientationabsolute' in win) {
      win.addEventListener('deviceorientationabsolute', this.boundOrientationHandler, true);
    } else {
      win.addEventListener('deviceorientation', this.boundOrientationHandler, true);
    }

    this.simulator?.setLiveCompass(true, this.currentHeading ?? 0);
  }

  private stopLiveCompass(): void {
    this.isLiveCompass = false;
    this.currentHeading = null;
    if (this.boundOrientationHandler) {
      const win = window as any;
      if ('ondeviceorientationabsolute' in win) {
        win.removeEventListener('deviceorientationabsolute', this.boundOrientationHandler, true);
      }
      win.removeEventListener('deviceorientation', this.boundOrientationHandler, true);
      this.boundOrientationHandler = null;
    }
    this.updateLiveCompassButtonUI();
    this.simulator?.setLiveCompass(false, null);
  }

  private updateLiveCompassButtonUI(): void {
    const btn = this.container.querySelector('#btnLiveCompass');
    const lbl = this.container.querySelector('#lblLiveCompass');
    if (btn) {
      btn.classList.toggle('active', this.isLiveCompass);
    }
    if (lbl) {
      if (this.isLiveCompass && this.currentHeading !== null) {
        const degVal = Math.round(this.currentHeading) % 360;
        lbl.textContent = `Live ${degVal}° ${AstroCore.getCompassDirection(degVal)}`;
      } else if (this.isLiveCompass) {
        lbl.textContent = 'Live (Kalibrerer...)';
      } else {
        lbl.textContent = 'Live kompas';
      }
    }
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

  private setDate(newDate: Date): void {
    const hours = this.currentDate.getHours();
    const minutes = this.currentDate.getMinutes();
    const seconds = this.currentDate.getSeconds();
    this.currentDate = new Date(newDate);
    this.currentDate.setHours(hours, minutes, seconds, 0);

    TimeService.setDate(this.currentDate);

    const dateInput = this.container.querySelector('#sunDatePickerInput') as HTMLInputElement;
    if (dateInput) {
      dateInput.value = TimeService.formatIsoDate(this.currentDate);
    }

    this.updateCalculations();
  }

  private updateDateDisplay(moonIllum?: MoonIllumination): void {
    const isToday = TimeService.isToday(this.currentDate);
    const relText = TimeService.formatRelativeDay(this.currentDate);
    const formattedDanish = TimeService.formatDateDanish(this.currentDate);
    const fullYear = this.currentDate.getFullYear();
    const isoDate = TimeService.formatIsoDate(this.currentDate);

    // Hero-kort datovisning
    const heroDateEl = this.container.querySelector('#sunDateDisplay');
    if (heroDateEl) {
      if (isToday) {
        heroDateEl.textContent = formattedDanish;
      } else {
        const accentColor = this.celestialBody === 'moon' ? '#c084fc' : 'var(--accent-sun)';
        heroDateEl.innerHTML = `<span style="color: ${accentColor}; font-weight: 700;">📅 Plan: ${TimeService.formatShortDate(this.currentDate)} (${relText})</span>`;
      }
    }

    // Tidslinje datokomponent
    const mainLabel = this.container.querySelector('#sunDateMainLabel');
    const subLabel = this.container.querySelector('#sunDateSubLabel');
    const statusBadge = this.container.querySelector('#sunDateStatusBadge');
    const dateInput = this.container.querySelector('#sunDatePickerInput') as HTMLInputElement;

    if (mainLabel) {
      mainLabel.textContent = `${formattedDanish} ${fullYear}`;
    }
    if (subLabel) {
      const moonHint = moonIllum ? ` • ${moonIllum.icon} ${moonIllum.fraction}%` : '';
      subLabel.textContent = isToday
        ? `Tryk for kalender • Dags dato${moonHint}`
        : `Tryk for kalender • ${relText}${moonHint}`;
    }
    if (statusBadge) {
      statusBadge.textContent = isToday ? 'I dag' : relText;
      statusBadge.className = isToday ? 'fs-badge' : this.celestialBody === 'moon' ? 'fs-badge badge-exposure' : 'fs-badge badge-sun';
    }
    if (dateInput && dateInput.value !== isoDate) {
      dateInput.value = isoDate;
    }

    // Preset knapper
    const presetsWrap = this.container.querySelector('#sunDatePresets');
    if (presetsWrap) {
      presetsWrap.querySelectorAll('.sun-preset-pill').forEach((btn) => {
        const p = (btn as HTMLElement).dataset.preset;
        let isActive = false;
        if (p === 'today' && isToday) isActive = true;
        else if (p === 'tomorrow' && TimeService.isTomorrow(this.currentDate)) isActive = true;
        else if (p === 'next-full-moon' && moonIllum && moonIllum.phase >= 0.47 && moonIllum.phase <= 0.53 && !isToday) isActive = true;
        else if (p === 'next-new-moon' && moonIllum && (moonIllum.phase < 0.03 || moonIllum.phase > 0.97) && !isToday) isActive = true;
        else if (p === 'summer-solstice' && this.currentDate.getMonth() === 5 && this.currentDate.getDate() === 21) isActive = true;
        else if (p === 'autumn-equinox' && this.currentDate.getMonth() === 8 && this.currentDate.getDate() === 22) isActive = true;
        else if (p === 'winter-solstice' && this.currentDate.getMonth() === 11 && this.currentDate.getDate() === 21) isActive = true;
        else if (p === 'spring-equinox' && this.currentDate.getMonth() === 2 && this.currentDate.getDate() === 20) isActive = true;
        btn.classList.toggle('active', isActive);
      });
    }
  }

  private updateSliderBubble(minutes: number): void {
    const bubble = this.container.querySelector('#sunSliderBubble') as HTMLElement | null;
    if (!bubble) return;
    const pct = Math.max(0, Math.min(1, minutes / 1439));
    bubble.style.left = `calc(${pct * 100}% + ${(0.5 - pct) * 20}px)`;
    bubble.textContent = TimeService.formatTime(this.currentDate);
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
    const moonPos = AstroCore.getMoonPosition(this.currentDate, lat, lng);
    const moonTimes = AstroCore.getMoonTimes(this.currentDate, lat, lng);
    const moonIllum = AstroCore.getMoonIllumination(this.currentDate);

    const isMoon = this.celestialBody === 'moon';

    // Opdater måne-ikon på knappen øverst så man altid kan se fasen
    const btnMoonIcon = this.container.querySelector('#btnBodyMoonIcon');
    if (btnMoonIcon) btnMoonIcon.textContent = moonIllum.icon;

    // Opdater tal i interfacet
    const timeEl = this.container.querySelector('#sunTimeDisplay');
    const lblMetric1 = this.container.querySelector('#lblMetric1');
    const lblMetric2 = this.container.querySelector('#lblMetric2');
    const lblMetric3 = this.container.querySelector('#lblMetric3');
    const altEl = this.container.querySelector('#sunAltitudeVal');
    const azEl = this.container.querySelector('#sunAzimuthVal');
    const shadowEl = this.container.querySelector('#sunShadowLengthVal');
    const kelvinEl = this.container.querySelector('#sunKelvinDisplay');
    const phaseBadge = this.container.querySelector('#sunLightPhaseBadge');
    const headerBadge = this.container.querySelector('#sunPhaseHeaderBadge');
    const tipEl = this.container.querySelector('#sunShadowTip');

    if (timeEl) timeEl.textContent = TimeService.formatTime(this.currentDate);
    this.updateDateDisplay(moonIllum);

    if (!isMoon) {
      const shadowCalc: ShadowCalculation = AstroCore.calculateShadow(sunPos.altitude, sunPos.azimuth, this.subjectHeight);
      const kelvin = AstroCore.getEstimatedKelvin(sunPos.altitude);

      if (lblMetric1) lblMetric1.textContent = 'Solhøjde';
      if (lblMetric2) lblMetric2.textContent = 'Solretning';
      if (lblMetric3) lblMetric3.textContent = 'Skyggelængde';

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
        headerBadge.className = 'fs-badge badge-sun';
      }
      if (tipEl) {
        tipEl.textContent = `${shadowCalc.description} ${shadowCalc.cameraTip}`;
      }

      this.simulator?.update(sunPos.altitude, sunPos.azimuth, this.subjectHeight, {
        subjectType: this.subjectType,
        sunTimes,
        moonTimes,
        moonIllum,
        celestialBody: 'sun',
        lat,
        lng
      });

      if (this.activeViewMode === 'map' && this.mapView) {
        this.mapView.update(
          lat,
          lng,
          sunPos.altitude,
          sunPos.azimuth,
          shadowCalc.shadowAzimuth,
          shadowCalc.shadowLength,
          'sun'
        );
      }
    } else {
      // MÅNE-TILSTAND
      const moonGuidance = AstroCore.getMoonGuidance(moonPos.altitude, moonPos.azimuth, sunPos.altitude, moonIllum, moonTimes);
      const hasMoonShadow = moonPos.altitude > 0 && sunPos.altitude <= -4 && moonIllum.fraction >= 25;
      const moonShadowAz = (moonPos.azimuth + 180) % 360;
      const moonShadowLen = hasMoonShadow ? this.subjectHeight / Math.tan((moonPos.altitude * Math.PI) / 180) : Infinity;

      if (lblMetric1) lblMetric1.textContent = 'Månehøjde';
      if (lblMetric2) lblMetric2.textContent = 'Måneretning';
      if (lblMetric3) lblMetric3.textContent = 'Månefase & Lys';

      if (altEl) altEl.textContent = `${moonPos.altitude >= 0 ? '+' : ''}${moonPos.altitude.toFixed(1)}°`;
      if (azEl) azEl.textContent = `${moonPos.azimuth.toFixed(0)}° ${AstroCore.getCompassDirection(moonPos.azimuth)}`;
      if (shadowEl) shadowEl.textContent = `${moonIllum.icon} ${moonIllum.fraction}%`;
      if (kelvinEl) {
        kelvinEl.textContent = hasMoonShadow
          ? `Måneskygge: ${moonShadowLen.toFixed(1).replace('.', ',')} m mod ${AstroCore.getCompassDirection(moonShadowAz)}`
          : `${moonIllum.name} (${moonIllum.fraction}% belyst)`;
      }

      if (phaseBadge) {
        phaseBadge.textContent = moonGuidance.badge;
        phaseBadge.setAttribute('style', `background: ${moonGuidance.color}33; color: ${moonGuidance.color};`);
      }
      if (headerBadge) {
        headerBadge.textContent = `${moonIllum.icon} ${moonIllum.name}`;
        headerBadge.className = 'fs-badge badge-exposure';
      }
      if (tipEl) {
        tipEl.textContent = `${moonGuidance.description} ${moonGuidance.cameraTip}`;
      }

      // Opdater Måneopgang / Kulmination / Månenedgang bokse med kompasretninger
      const riseTimeEl = this.container.querySelector('#moonRiseTimeVal');
      const riseDirEl = this.container.querySelector('#moonRiseDirVal');
      const boxRise = this.container.querySelector('#boxMoonRise') as HTMLElement | null;

      if (moonTimes.rise && moonTimes.riseAzimuth !== null && moonTimes.riseAzimuth !== undefined) {
        if (riseTimeEl) riseTimeEl.textContent = TimeService.formatTime(moonTimes.rise);
        if (riseDirEl) riseDirEl.textContent = `${moonTimes.riseAzimuth.toFixed(0)}° ${AstroCore.getCompassDirection(moonTimes.riseAzimuth)}`;
        if (boxRise) boxRise.dataset.time = String(moonTimes.rise.getTime());
      } else {
        if (riseTimeEl) riseTimeEl.textContent = '--:--';
        if (riseDirEl) riseDirEl.textContent = moonTimes.alwaysUp ? 'Over horisont' : 'Går ikke op';
        if (boxRise) boxRise.dataset.time = '0';
      }

      const transitTimeEl = this.container.querySelector('#moonTransitTimeVal');
      const transitAltEl = this.container.querySelector('#moonTransitAltVal');
      const boxTransit = this.container.querySelector('#boxMoonTransit') as HTMLElement | null;
      if (moonTimes.transit && moonTimes.transitAltitude !== null && moonTimes.transitAltitude !== undefined) {
        if (transitTimeEl) transitTimeEl.textContent = TimeService.formatTime(moonTimes.transit);
        if (transitAltEl) transitAltEl.textContent = `${moonTimes.transitAltitude >= 0 ? '+' : ''}${moonTimes.transitAltitude.toFixed(1)}° Syd`;
        if (boxTransit) boxTransit.dataset.time = String(moonTimes.transit.getTime());
      } else {
        if (transitTimeEl) transitTimeEl.textContent = '--:--';
        if (transitAltEl) transitAltEl.textContent = '--°';
        if (boxTransit) boxTransit.dataset.time = '0';
      }

      const setTimeEl = this.container.querySelector('#moonSetTimeVal');
      const setDirEl = this.container.querySelector('#moonSetDirVal');
      const boxSet = this.container.querySelector('#boxMoonSet') as HTMLElement | null;
      if (moonTimes.set && moonTimes.setAzimuth !== null && moonTimes.setAzimuth !== undefined) {
        if (setTimeEl) setTimeEl.textContent = TimeService.formatTime(moonTimes.set);
        if (setDirEl) setDirEl.textContent = `${moonTimes.setAzimuth.toFixed(0)}° ${AstroCore.getCompassDirection(moonTimes.setAzimuth)}`;
        if (boxSet) boxSet.dataset.time = String(moonTimes.set.getTime());
      } else {
        if (setTimeEl) setTimeEl.textContent = '--:--';
        if (setDirEl) setDirEl.textContent = moonTimes.alwaysDown ? 'Under horisont' : 'Går ikke ned';
        if (boxSet) boxSet.dataset.time = '0';
      }

      this.simulator?.update(moonPos.altitude, moonPos.azimuth, this.subjectHeight, {
        subjectType: this.subjectType,
        sunTimes,
        moonTimes,
        moonIllum,
        celestialBody: 'moon',
        hasDirectShadowOverride: hasMoonShadow,
        diffusionFactor: 0.7,
        lat,
        lng
      });

      if (this.activeViewMode === 'map' && this.mapView) {
        this.mapView.update(
          lat,
          lng,
          moonPos.altitude,
          moonPos.azimuth,
          moonShadowAz,
          moonShadowLen,
          'moon',
          {
            icon: moonIllum.icon,
            riseAzimuth: moonTimes.riseAzimuth,
            setAzimuth: moonTimes.setAzimuth,
            hasMoonShadow
          }
        );
      }
    }

    // Opdater scrubber-tid og fase lige over slideren
    const scrubberTimeEl = this.container.querySelector('#sunScrubberTimeVal');
    const scrubberPhaseEl = this.container.querySelector('#sunScrubberPhasePill');
    if (scrubberTimeEl) scrubberTimeEl.textContent = TimeService.formatTime(this.currentDate);
    if (scrubberPhaseEl) {
      if (!isMoon) {
        const shadowCalc = AstroCore.calculateShadow(sunPos.altitude, sunPos.azimuth, this.subjectHeight);
        scrubberPhaseEl.textContent = `${shadowCalc.lightPhase.name} • ${sunPos.altitude >= 0 ? '+' : ''}${sunPos.altitude.toFixed(1)}°`;
      } else {
        scrubberPhaseEl.textContent = `${moonIllum.name} (${moonIllum.fraction}%) • ${moonPos.altitude >= 0 ? '+' : ''}${moonPos.altitude.toFixed(1)}°`;
      }
    }
    const currentMins = this.currentDate.getHours() * 60 + this.currentDate.getMinutes();
    this.updateSliderBubble(currentMins);

    // Render hurtige spring pills (tilpasset Sol eller Måne)
    this.renderQuickJumps(sunTimes, moonTimes);
  }

  private renderQuickJumps(times: SunTimes, moonTimes: MoonTimes): void {
    const jumpsWrap = this.container.querySelector('#sunQuickJumps');
    if (!jumpsWrap) return;

    let events: Array<{ name: string; time: Date | null | undefined }> = [];

    if (this.celestialBody === 'moon') {
      const riseDir =
        moonTimes.riseAzimuth !== null && moonTimes.riseAzimuth !== undefined
          ? ` (${moonTimes.riseAzimuth.toFixed(0)}° ${AstroCore.getCompassDirection(moonTimes.riseAzimuth)})`
          : '';
      const setDir =
        moonTimes.setAzimuth !== null && moonTimes.setAzimuth !== undefined
          ? ` (${moonTimes.setAzimuth.toFixed(0)}° ${AstroCore.getCompassDirection(moonTimes.setAzimuth)})`
          : '';

      events = [
        { name: `↑ Måneopgang${riseDir}`, time: moonTimes.rise },
        { name: 'Måne højest', time: moonTimes.transit },
        { name: `↓ Månenedgang${setDir}`, time: moonTimes.set },
        { name: 'Solnedgang', time: times.sunset },
        { name: 'Blå time (aften)', time: times.blueHourEvening?.end },
        { name: 'Solopgang', time: times.sunrise }
      ]
        .filter((e) => e.time !== null && e.time !== undefined)
        .sort((a, b) => (a.time as Date).getTime() - (b.time as Date).getTime());
    } else {
      events = [
        { name: 'Blå time (morgen)', time: times.blueHourMorning?.start },
        { name: 'Solopgang', time: times.sunrise },
        { name: 'Gylden time (morgen)', time: times.goldenHourMorning?.end },
        { name: 'Solmiddag', time: times.solarNoon },
        { name: 'Gylden time (aften)', time: times.goldenHourEvening?.start },
        { name: 'Solnedgang', time: times.sunset },
        { name: 'Blå time (aften)', time: times.blueHourEvening?.end },
        { name: '🌕 Måneopgang', time: moonTimes.rise }
      ].filter((e) => e.time !== null && e.time !== undefined);
    }

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
        this.simulator?.resetCamera('default');
      });
    });
  }
}
