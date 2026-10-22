/**
 * index.ts - Eksponering modul controller (§10, §16)
 * Omfatter Eksponeringstrekanten, Lukkertidsberegning (håndholdt + astro),
 * ND-filterberegning med stacking samt interaktiv Bulb-nedtællingstimer.
 */

import { ModuleInstance } from '../../app/ModuleRegistry.ts';
import {
  ExposureEngine,
  STANDARD_APERTURES,
  FULL_STOP_APERTURES,
  STANDARD_SHUTTERS,
  STANDARD_ISOS,
  STANDARD_ND_FILTERS,
  SHUTTER_SCENARIOS,
  NdFilterDef
} from './calculations/exposure-engine.ts';
import { TriangleVisualizer } from './visualization/triangle-visualizer.ts';
import './exposure.css';

interface SavedExposureState {
  aperture: number;
  shutter: number;
  iso: number;
  isLocked: boolean;
  baseline: {
    aperture: number;
    shutter: number;
    iso: number;
    ev: number;
  } | null;
  handheldFocal: number;
  handheldCrop: number;
  handheldIbis: number;
  ndBaseShutter: number;
  selectedNdIds: string[];
  timerDurationSec: number;
  timerDarkFrame: boolean;
}

const DEFAULT_STATE: SavedExposureState = {
  aperture: 8.0,
  shutter: 1 / 125,
  iso: 100,
  isLocked: false,
  baseline: null,
  handheldFocal: 50,
  handheldCrop: 1.0,
  handheldIbis: 0,
  ndBaseShutter: 1 / 125,
  selectedNdIds: ['nd1000'],
  timerDurationSec: 60,
  timerDarkFrame: false
};

const SCENE_EV_PRESETS = [
  { name: 'Fuld sol', ev: 15, aperture: 16.0, shutter: 1 / 125, iso: 100, tip: 'Klar solskin (Sunny 16)' },
  { name: 'Overskyet', ev: 12, aperture: 8.0, shutter: 1 / 125, iso: 100, tip: 'Diffust dagslys' },
  { name: 'Gylden time', ev: 9, aperture: 4.0, shutter: 1 / 125, iso: 200, tip: 'Solopgang / Solnedgang' },
  { name: 'Indendørs', ev: 6, aperture: 2.8, shutter: 1 / 60, iso: 800, tip: 'Hjemme- eller galleribelysning' },
  { name: 'By om natten', ev: 3, aperture: 2.0, shutter: 1 / 30, iso: 1600, tip: 'Gadebelysning & neonskilte' }
];

export default class ExposureModule implements ModuleInstance {
  private container!: HTMLElement;
  private visualizer: TriangleVisualizer | null = null;
  private state: SavedExposureState = { ...DEFAULT_STATE };
  private activeTab: 'triangle' | 'shutter' | 'nd' | 'timer' = 'triangle';

  // Timer tilstand
  private timerInterval: number | null = null;
  private timerRemainingSec: number = 60;
  private timerTotalSec: number = 60;
  private timerPhase: 'exposure' | 'darkframe' | 'finished' | 'idle' = 'idle';
  private timerRunning: boolean = false;

  public mount(container: HTMLElement): void {
    this.container = container;
    this.loadState();
    this.render();
    this.attachEventListeners();
    this.updateAllViews();
  }

  public onActivate(context?: any): void {
    if (context?.params) {
      const p = context.params as URLSearchParams;
      if (p.has('tab')) {
        const targetTab = p.get('tab') as any;
        if (['triangle', 'shutter', 'nd', 'timer'].includes(targetTab)) {
          this.switchTab(targetTab);
        }
      }
    }
  }

  public onDeactivate(): void {
    // Hvis timer kører, lad den køre eller pause baseret på behov
  }

  public destroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.visualizer = null;
  }

  private loadState(): void {
    try {
      const raw = localStorage.getItem('fs_exposure_state_v1');
      if (raw) {
        this.state = { ...DEFAULT_STATE, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Kunne ikke hente gemt tilstand for Eksponering:', e);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('fs_exposure_state_v1', JSON.stringify(this.state));
    } catch (e) {
      console.warn('Kunne ikke gemme tilstand for Eksponering:', e);
    }
  }

  private render(): void {
    const apertureButtons = FULL_STOP_APERTURES.map(
      (a) => `<button class="quick-val-btn ${a === this.state.aperture ? 'active' : ''}" data-aperture="${a}">f/${a}</button>`
    ).join('');

    const shutterButtons = [1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 15, 1 / 2, 1, 4, 15, 30].map(
      (s) => `<button class="quick-val-btn ${Math.abs(s - this.state.shutter) < 0.0001 ? 'active' : ''}" data-shutter="${s}">${ExposureEngine.formatShutterSpeed(s)}</button>`
    ).join('');

    const isoButtons = [100, 200, 400, 800, 1600, 3200, 6400].map(
      (i) => `<button class="quick-val-btn ${i === this.state.iso ? 'active' : ''}" data-iso="${i}">ISO ${i}</button>`
    ).join('');

    const ndGridHtml = STANDARD_ND_FILTERS.map((nd) => {
      const isSelected = this.state.selectedNdIds.includes(nd.id);
      return `
        <button class="nd-filter-btn ${isSelected ? 'active' : ''}" data-nd-id="${nd.id}">
          <div class="nd-btn-name">${nd.name}</div>
          <div class="nd-btn-stops">${nd.stops >= 0 ? '+' : ''}${nd.stops} ${nd.stops === 1 ? 'stop' : 'stops'}</div>
          <div class="nd-btn-density">OD ${nd.opticalDensity.toFixed(1)}</div>
        </button>
      `;
    }).join('');

    this.container.innerHTML = `
      <div class="exposure-container">
        <!-- TOP HEADER -->
        <div class="exposure-header">
          <div class="exposure-module-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
            </svg>
            <span>Eksponering • Lysberegner</span>
          </div>
          <span class="fs-badge" id="expCurrentEvBadge">EV 13.0</span>
        </div>

        <!-- HOVED FANE-VÆLGER -->
        <div class="fs-segmented-control" style="width: 100%;">
          <button class="fs-segment-btn ${this.activeTab === 'triangle' ? 'active' : ''}" data-exp-tab="triangle">📐 Trekant</button>
          <button class="fs-segment-btn ${this.activeTab === 'shutter' ? 'active' : ''}" data-exp-tab="shutter">⏱️ Lukkertid</button>
          <button class="fs-segment-btn ${this.activeTab === 'nd' ? 'active' : ''}" data-exp-tab="nd">🔲 ND-filter</button>
          <button class="fs-segment-btn ${this.activeTab === 'timer' ? 'active' : ''}" data-exp-tab="timer">⏳ Bulb Timer</button>
        </div>

        <!-- ==================== FANE 1: EKSPONERINGSTREKANT ==================== -->
        <div id="tabContentTriangle" style="${this.activeTab === 'triangle' ? '' : 'display: none;'}">
          <!-- HERO CARD MED SVG TREKANT -->
          <div class="exposure-hero-card">
            <div class="exposure-hero-header">
              <div class="hero-title-group">
                <span class="hero-main-title">Eksponeringstrekanten</span>
                <span class="hero-sub-title">Samspillet mellem blænde, lukkertid & ISO</span>
              </div>
              <span class="fs-badge" id="expLockBadge">Fri tilstand</span>
            </div>

            <!-- SVG Diagram -->
            <div class="triangle-svg-wrap">
              <svg class="triangle-svg" id="expTriangleSvg" viewBox="0 0 400 320"></svg>
            </div>

            <!-- EV Lysmåler Bar -->
            <div class="ev-meter-wrap" id="expMeterWrap"></div>

            <!-- Dynamisk Histogram -->
            <div class="histogram-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Simuleret Tonal Fordeling</span>
                <span style="font-size: 10px; color: var(--text-dim);">Skygger • Mellemtoner • Højlys</span>
              </div>
              <svg class="hist-svg" id="expHistSvg"></svg>
              <div class="hist-labels">
                <span>0 (Sort)</span>
                <span>Mellem</span>
                <span>255 (Hvid)</span>
              </div>
            </div>

            <!-- Status Tekst -->
            <div id="expStatusTextWrap"></div>
          </div>

          <!-- DYNAMISK BASELINE REFERENCE / LÅS-KONTROL -->
          <div id="expBaselineMount"></div>

          <!-- KONTROLPANEL FOR TREKANT -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Kameraindstillinger</span>
              <div style="display: flex; gap: 4px;" id="scenePresetWrap">
                <select class="fs-btn" id="scenePresetSelect" style="padding: 3px 8px; font-size: 11px; min-height: 26px;">
                  <option value="" disabled selected>Hurtig lysscene (valgfri)...</option>
                  ${SCENE_EV_PRESETS.map((p, idx) => `<option value="${idx}">${p.name} (EV ${p.ev})</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- 1. BLÆNDE (Aperture) -->
            <div class="fs-slider-wrap">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Blænde <span style="font-size:10px;color:var(--text-dim);font-weight:normal;">• Lysåbning</span></span>
                <span class="fs-slider-val" id="dispAperture" style="color: #f59e0b;">f/${this.state.aperture}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnApertureMinus" title="Luk blænde ned (mindre lys)" aria-label="Luk blænde ned (mindre lys)">-</button>
                <input type="range" id="sliderAperture" min="0" max="${STANDARD_APERTURES.length - 1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnAperturePlus" title="Åbn blænde op (mere lys)" aria-label="Åbn blænde op (mere lys)">+</button>
              </div>
              <div class="quick-btn-scroll" id="apertureQuickScroll">
                ${apertureButtons}
              </div>
            </div>

            <!-- 2. LUKKERTID (Shutter) -->
            <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Lukkertid <span style="font-size:10px;color:var(--text-dim);font-weight:normal;">• Eksponeringstid</span></span>
                <span class="fs-slider-val" id="dispShutter" style="color: #38bdf8;">${ExposureEngine.formatShutterSpeed(this.state.shutter)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnShutterMinus" title="Kortere tid (mindre lys)" aria-label="Kortere tid (mindre lys)">-</button>
                <input type="range" id="sliderShutter" min="0" max="${STANDARD_SHUTTERS.length - 1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnShutterPlus" title="Længere tid (mere lys)" aria-label="Længere tid (mere lys)">+</button>
              </div>
              <div class="quick-btn-scroll" id="shutterQuickScroll">
                ${shutterButtons}
              </div>
            </div>

            <!-- 3. ISO FØLSOMHED -->
            <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Lysfølsomhed <span style="font-size:10px;color:var(--text-dim);font-weight:normal;">• ISO</span></span>
                <span class="fs-slider-val" id="dispIso" style="color: #a855f7;">ISO ${this.state.iso}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnIsoMinus" title="Lavere ISO (mindre lys)" aria-label="Lavere ISO (mindre lys)">-</button>
                <input type="range" id="sliderIso" min="0" max="${STANDARD_ISOS.length - 1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnIsoPlus" title="Højere ISO (mere lys)" aria-label="Højere ISO (mere lys)">+</button>
              </div>
              <div class="quick-btn-scroll" id="isoQuickScroll">
                ${isoButtons}
              </div>
            </div>

            <!-- HANDLINGER -->
            <div style="display: flex; justify-content: flex-end; margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <button class="fs-btn" id="btnTransferToNd" style="padding: 6px 12px; font-size: 12px; min-height: 32px;">
                Brug denne lukkertid i ND-filter →
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== FANE 2: LUKKERTID & BEVÆGELSE ==================== -->
        <div id="tabContentShutter" style="${this.activeTab === 'shutter' ? '' : 'display: none;'}">
          <!-- HÅNDHOLDT RYSTEREGEL KORT -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Håndholdt Rysteregel</span>
              <span class="fs-badge" id="handheldResultBadge">1/50s</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;" id="handheldAdviceText">
              Den reciprokke regel (1/brændvidde) beregner den længste sikre håndholdte lukkertid uden slør fra kamerarystelser.
            </p>

            <div class="fs-slider-wrap">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Optik Brændvidde</span>
                <span class="fs-slider-val" id="dispHHandheldFocal">${this.state.handheldFocal} mm</span>
              </div>
              <input type="range" id="sliderHandheldFocal" min="10" max="600" step="1" value="${this.state.handheldFocal}">
              <div class="quick-btn-scroll">
                ${[24, 35, 50, 85, 135, 200, 400].map((f) => `<button class="quick-val-btn ${f === this.state.handheldFocal ? 'active' : ''}" data-focal-h="${f}">${f}mm</button>`).join('')}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;">
              <div>
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 4px;">Sensorformat</label>
                <select class="fs-btn" id="selectHandheldCrop" style="width: 100%; padding: 8px; font-size: 12px;">
                  <option value="1.0" ${this.state.handheldCrop === 1.0 ? 'selected' : ''}>Full Frame [1.0×]</option>
                  <option value="1.5" ${this.state.handheldCrop === 1.5 ? 'selected' : ''}>APS-C [1.5×]</option>
                  <option value="2.0" ${this.state.handheldCrop === 2.0 ? 'selected' : ''}>Micro Four Thirds [2.0×]</option>
                </select>
              </div>

              <div>
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 4px;">Billedstabilisering (IBIS / IS)</label>
                <select class="fs-btn" id="selectHandheldIbis" style="width: 100%; padding: 8px; font-size: 12px;">
                  <option value="0" ${this.state.handheldIbis === 0 ? 'selected' : ''}>Ingen stabilisering</option>
                  <option value="2" ${this.state.handheldIbis === 2 ? 'selected' : ''}>2 stops (Let IS)</option>
                  <option value="3" ${this.state.handheldIbis === 3 ? 'selected' : ''}>3 stops (Standard)</option>
                  <option value="4" ${this.state.handheldIbis === 4 ? 'selected' : ''}>4 stops (Moderne)</option>
                  <option value="5" ${this.state.handheldIbis === 5 ? 'selected' : ''}>5 stops (Effektiv IBIS)</option>
                  <option value="6" ${this.state.handheldIbis === 6 ? 'selected' : ''}>6 stops (Avanceret sync)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ASTRO 500-REGLEN KORT -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Astrofoto • Punktformede Stjerner</span>
              <span class="fs-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;" id="astro500Badge">--</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px;" id="astroRuleDesc"></p>
            <div style="display: flex; gap: 8px; font-size: 11px; font-family: var(--font-mono); color: var(--text-dim);">
              <span>500-reglen: <strong id="astroT500" style="color: var(--text-main);">--</strong></span>
              <span>•</span>
              <span>300-reglen (højopløst): <strong id="astroT300" style="color: var(--text-main);">--</strong></span>
            </div>
          </div>

          <!-- MOTIV SCENARIER -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Motivscenarier & Frysning</span>
              <span style="font-size: 11px; color: var(--text-dim);">Klik for at vælge tid</span>
            </div>
            <div class="shutter-scenarios-grid">
              ${SHUTTER_SCENARIOS.map((sc) => `
                <div class="shutter-scenario-card" data-scenario-id="${sc.id}">
                  <div class="scenario-header-row">
                    <strong style="font-size: 13px; color: var(--text-main);">${sc.title}</strong>
                    <span class="scenario-badge-time">${sc.recommendedRange}</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${sc.description}</p>
                  <span style="font-size: 11px; color: var(--text-dim); font-style: italic;">💡 ${sc.tip}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- ==================== FANE 3: ND-FILTER BEREGNER ==================== -->
        <div id="tabContentNd" style="${this.activeTab === 'nd' ? '' : 'display: none;'}">
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">ND-Filterberegner & Stacking</span>
              <button class="fs-btn" id="btnSyncFromTriangle" style="padding: 3px 8px; font-size: 11px; min-height: 26px;">
                🔄 Hent lukkertid fra trekant
              </button>
            </div>

            <!-- Basislukkertid -->
            <div class="fs-slider-wrap">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Basiseksponering (Uden filter)</span>
                <span class="fs-slider-val" id="dispNdBase" style="color: #38bdf8;">${ExposureEngine.formatShutterSpeed(this.state.ndBaseShutter)}</span>
              </div>
              <input type="range" id="sliderNdBase" min="0" max="${STANDARD_SHUTTERS.length - 1}" step="1" value="0">
              <div class="quick-btn-scroll" id="ndBaseQuickScroll">
                ${[1 / 1000, 1 / 500, 1 / 250, 1 / 125, 1 / 60, 1 / 30, 1 / 15, 1 / 4, 1].map((s) => `
                  <button class="quick-val-btn ${Math.abs(s - this.state.ndBaseShutter) < 0.0001 ? 'active' : ''}" data-nd-base="${s}">
                    ${ExposureEngine.formatShutterSpeed(s)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Vælg filtre (Multi-selection) -->
            <div style="margin-top: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">
                  Monterede filtre (Kombinér flere / stacking)
                </span>
                <button class="fs-btn" id="btnClearFilters" style="padding: 2px 6px; font-size: 10px; min-height: 22px;">Nulstil filtre</button>
              </div>
              <div class="nd-filters-grid" id="ndFiltersGrid">
                ${ndGridHtml}
              </div>
            </div>

            <!-- RESULTAT HERO BOX -->
            <div class="nd-result-box">
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--accent-exposure, #a855f7); letter-spacing: 0.06em;">
                Ny Beregnet Eksponeringstid
              </div>
              <div class="nd-calc-value" id="dispNdFinalTime">--</div>
              <div style="display: flex; justify-content: center; gap: 14px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">
                <span>Total reduktion: <strong id="dispNdTotalStops" style="color: var(--text-main);">0 stops</strong></span>
                <span>•</span>
                <span>Faktor: <strong id="dispNdFactor" style="color: var(--text-main);">1×</strong></span>
                <span>•</span>
                <span>Optisk Densitet: <strong id="dispNdOd" style="color: var(--text-main);">0.0</strong></span>
              </div>
              <div style="display: flex; justify-content: center; gap: 8px; margin-top: 4px;">
                <button class="fs-btn fs-btn-accent-sun" id="btnTransferToTimer" style="padding: 8px 16px; font-size: 13px; font-weight: 700; min-height: 36px;">
                  ⏳ Start Bulb Timer med denne tid →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== FANE 4: LANGTIDSEKSPONERING & BULB TIMER ==================== -->
        <div id="tabContentTimer" style="${this.activeTab === 'timer' ? '' : 'display: none;'}">
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Bulb Nedtællingstimer</span>
              <span class="fs-badge" id="timerStatusBadge">Klar</span>
            </div>

            <!-- Cirkulær Timer Visualisering -->
            <div class="bulb-timer-wrap">
              <div class="timer-circle-wrap">
                <svg class="timer-svg" viewBox="0 0 200 200">
                  <circle class="timer-circle-bg" cx="100" cy="100" r="85"></circle>
                  <circle class="timer-circle-progress" id="timerCircleProgress" cx="100" cy="100" r="85"
                          stroke-dasharray="534.07"
                          stroke-dashoffset="0"></circle>
                </svg>
                <div class="timer-display-inner">
                  <div class="timer-time-main" id="timerDisplayNumber">01:00</div>
                  <div class="timer-phase-label" id="timerPhaseLabel">Eksponering</div>
                </div>
              </div>

              <!-- Start / Pause / Reset kontroller -->
              <div class="timer-controls-row">
                <button class="fs-btn fs-btn-accent-sun" id="btnTimerStartPause" style="flex: 2; min-height: 44px; font-weight: 700; font-size: 15px;">
                  Start Optagelse
                </button>
                <button class="fs-btn" id="btnTimerReset" style="flex: 1; min-height: 44px;">
                  Nulstil
                </button>
              </div>

              <!-- Hurtige forudindstillinger for tid -->
              <div class="quick-btn-scroll" style="justify-content: center; width: 100%;">
                ${[15, 30, 60, 120, 240, 480].map((s) => `
                  <button class="quick-val-btn ${s === this.state.timerDurationSec ? 'active' : ''}" data-timer-preset="${s}">
                    ${ExposureEngine.formatShutterSpeed(s)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- LENR Dark Frame Toggle -->
            <div style="background: var(--bg-surface-elevated); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-top: 10px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <strong style="font-size: 13px; color: var(--text-main); display: block;">Dark Frame (LENR)</strong>
                <span style="font-size: 11px; color: var(--text-muted); line-height: 1.3; display: block;">
                  Tæller automatisk ekstra tid til kameraets indbyggede støjreduktion
                </span>
              </div>
              <input type="checkbox" id="checkDarkFrame" ${this.state.timerDarkFrame ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
            </div>

            <!-- Pædagogisk Tjekliste -->
            <div style="margin-top: var(--space-4); border-top: 1px solid var(--border-subtle); padding-top: 12px;">
              <strong style="font-size: 12px; color: var(--text-main); text-transform: uppercase; display: block; margin-bottom: 6px;">
                Tjekliste til Langtidseksponering
              </strong>
              <ul style="font-size: 12px; color: var(--text-muted); padding-left: 18px; line-height: 1.5; margin: 0;">
                <li><strong>Solidt stativ:</strong> Placer på fast underlag og træk midtersøjlen helt ned i blæsevejr.</li>
                <li><strong>Slå billedstabilisering (IBIS) FRA:</strong> På stativ kan gyroen skabe mikroskopiske rystelser.</li>
                <li><strong>Dæk den optiske søger til:</strong> Forhindrer strølys i at sive ind og forringe kontrasten under lange eksponeringer.</li>
                <li><strong>Trådløs udløser eller 2s selvudløser:</strong> Undgå at berøre kameraet i affyringsøjeblikket.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    // Initialiser visualizer
    const triSvg = this.container.querySelector('#expTriangleSvg') as SVGSVGElement;
    const meterWrap = this.container.querySelector('#expMeterWrap') as HTMLElement;
    const histSvg = this.container.querySelector('#expHistSvg') as SVGSVGElement;
    const statusWrap = this.container.querySelector('#expStatusTextWrap') as HTMLElement;

    if (triSvg && meterWrap && histSvg && statusWrap) {
      this.visualizer = new TriangleVisualizer(triSvg, meterWrap, histSvg, statusWrap);
    }

    // Synkroniser sliders med state
    this.syncSlidersFromState();
  }

  private attachEventListeners(): void {
    // 1. Fane-skift
    this.container.querySelectorAll('[data-exp-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = (btn as HTMLElement).dataset.expTab as any;
        this.switchTab(tab);
      });
    });

    // 2. Scene Presets (valgfri genvej)
    const sceneSelect = this.container.querySelector('#scenePresetSelect') as HTMLSelectElement;
    sceneSelect?.addEventListener('change', () => {
      const idx = Number(sceneSelect.value);
      const preset = SCENE_EV_PRESETS[idx];
      if (preset) {
        this.state.aperture = preset.aperture;
        this.state.shutter = preset.shutter;
        this.state.iso = preset.iso;
        // Hvis allerede låst, frigør så brugeren ser den nye måling inden låsning
        if (this.state.isLocked) {
          this.state.isLocked = false;
          this.state.baseline = null;
        }
        this.syncSlidersFromState();
        this.updateTriangleView();
        this.saveState();
      }
    });

    // 4. Blænde kontrol
    const sliderA = this.container.querySelector('#sliderAperture') as HTMLInputElement;
    sliderA?.addEventListener('input', () => {
      const idx = Number(sliderA.value);
      const newA = STANDARD_APERTURES[idx] || 8.0;
      this.handleApertureChange(newA);
    });

    this.container.querySelector('#btnApertureMinus')?.addEventListener('click', () => {
      const curIdx = STANDARD_APERTURES.indexOf(this.state.aperture);
      if (curIdx > 0) this.handleApertureChange(STANDARD_APERTURES[curIdx - 1]);
    });

    this.container.querySelector('#btnAperturePlus')?.addEventListener('click', () => {
      const curIdx = STANDARD_APERTURES.indexOf(this.state.aperture);
      if (curIdx < STANDARD_APERTURES.length - 1) this.handleApertureChange(STANDARD_APERTURES[curIdx + 1]);
    });

    this.container.querySelectorAll('[data-aperture]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const a = Number((btn as HTMLElement).dataset.aperture);
        this.handleApertureChange(a);
      });
    });

    // 5. Lukkertid kontrol
    const sliderS = this.container.querySelector('#sliderShutter') as HTMLInputElement;
    sliderS?.addEventListener('input', () => {
      const idx = Number(sliderS.value);
      const newS = STANDARD_SHUTTERS[idx] || (1 / 125);
      this.handleShutterChange(newS);
    });

    this.container.querySelector('#btnShutterMinus')?.addEventListener('click', () => {
      const curIdx = STANDARD_SHUTTERS.indexOf(this.state.shutter);
      if (curIdx > 0) this.handleShutterChange(STANDARD_SHUTTERS[curIdx - 1]);
    });

    this.container.querySelector('#btnShutterPlus')?.addEventListener('click', () => {
      const curIdx = STANDARD_SHUTTERS.indexOf(this.state.shutter);
      if (curIdx < STANDARD_SHUTTERS.length - 1) this.handleShutterChange(STANDARD_SHUTTERS[curIdx + 1]);
    });

    this.container.querySelectorAll('[data-shutter]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = Number((btn as HTMLElement).dataset.shutter);
        this.handleShutterChange(s);
      });
    });

    // 6. ISO kontrol
    const sliderI = this.container.querySelector('#sliderIso') as HTMLInputElement;
    sliderI?.addEventListener('input', () => {
      const idx = Number(sliderI.value);
      const newI = STANDARD_ISOS[idx] || 100;
      this.handleIsoChange(newI);
    });

    this.container.querySelector('#btnIsoMinus')?.addEventListener('click', () => {
      const curIdx = STANDARD_ISOS.indexOf(this.state.iso);
      if (curIdx > 0) this.handleIsoChange(STANDARD_ISOS[curIdx - 1]);
    });

    this.container.querySelector('#btnIsoPlus')?.addEventListener('click', () => {
      const curIdx = STANDARD_ISOS.indexOf(this.state.iso);
      if (curIdx < STANDARD_ISOS.length - 1) this.handleIsoChange(STANDARD_ISOS[curIdx + 1]);
    });

    this.container.querySelectorAll('[data-iso]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const i = Number((btn as HTMLElement).dataset.iso);
        this.handleIsoChange(i);
      });
    });

    // 7. Overfør til ND-filter
    this.container.querySelector('#btnTransferToNd')?.addEventListener('click', () => {
      this.state.ndBaseShutter = this.state.shutter;
      this.switchTab('nd');
      this.updateNdView();
      this.saveState();
    });

    // 8. Håndholdt rysteregel kontroller
    const sliderFocalH = this.container.querySelector('#sliderHandheldFocal') as HTMLInputElement;
    sliderFocalH?.addEventListener('input', () => {
      this.state.handheldFocal = Number(sliderFocalH.value);
      this.updateHandheldView();
      this.saveState();
    });

    this.container.querySelectorAll('[data-focal-h]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = Number((btn as HTMLElement).dataset.focalH);
        this.state.handheldFocal = f;
        if (sliderFocalH) sliderFocalH.value = String(f);
        this.updateHandheldView();
        this.saveState();
      });
    });

    const selectCrop = this.container.querySelector('#selectHandheldCrop') as HTMLSelectElement;
    selectCrop?.addEventListener('change', () => {
      this.state.handheldCrop = Number(selectCrop.value);
      this.updateHandheldView();
      this.saveState();
    });

    const selectIbis = this.container.querySelector('#selectHandheldIbis') as HTMLSelectElement;
    selectIbis?.addEventListener('change', () => {
      this.state.handheldIbis = Number(selectIbis.value);
      this.updateHandheldView();
      this.saveState();
    });

    // Motivscenarier
    this.container.querySelectorAll('[data-scenario-id]').forEach((card) => {
      card.addEventListener('click', () => {
        const scId = (card as HTMLElement).dataset.scenarioId;
        const sc = SHUTTER_SCENARIOS.find((s) => s.id === scId);
        if (sc) {
          // Sæt lukkertid til gennemsnit af scenariet
          const midShutter = (sc.minShutter + sc.maxShutter) / 2;
          const closest = ExposureEngine.findClosestValue(midShutter, STANDARD_SHUTTERS);
          this.handleShutterChange(closest);
          this.switchTab('triangle');
        }
      });
    });

    // 9. ND Filter kontroller
    const sliderNdBase = this.container.querySelector('#sliderNdBase') as HTMLInputElement;
    sliderNdBase?.addEventListener('input', () => {
      const idx = Number(sliderNdBase.value);
      this.state.ndBaseShutter = STANDARD_SHUTTERS[idx] || (1 / 125);
      this.updateNdView();
      this.saveState();
    });

    this.container.querySelectorAll('[data-nd-base]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const s = Number((btn as HTMLElement).dataset.ndBase);
        this.state.ndBaseShutter = s;
        if (sliderNdBase) {
          const idx = STANDARD_SHUTTERS.indexOf(s);
          if (idx !== -1) sliderNdBase.value = String(idx);
        }
        this.updateNdView();
        this.saveState();
      });
    });

    this.container.querySelector('#btnSyncFromTriangle')?.addEventListener('click', () => {
      this.state.ndBaseShutter = this.state.shutter;
      this.updateNdView();
      this.saveState();
    });

    // Filter-knapper (stacking toggle)
    this.container.querySelectorAll('[data-nd-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ndId = (btn as HTMLElement).dataset.ndId!;
        const idx = this.state.selectedNdIds.indexOf(ndId);
        if (idx >= 0) {
          this.state.selectedNdIds.splice(idx, 1);
        } else {
          this.state.selectedNdIds.push(ndId);
        }
        this.updateNdView();
        this.saveState();
      });
    });

    this.container.querySelector('#btnClearFilters')?.addEventListener('click', () => {
      this.state.selectedNdIds = [];
      this.updateNdView();
      this.saveState();
    });

    // Overfør til timer knap
    this.container.querySelector('#btnTransferToTimer')?.addEventListener('click', () => {
      const totalStops = this.calculateTotalNdStops();
      const res = ExposureEngine.calculateNdExposure(this.state.ndBaseShutter, totalStops);
      this.setTimerDuration(Math.round(res.newShutter));
      this.switchTab('timer');
    });

    // 10. Bulb Timer kontroller
    this.container.querySelector('#btnTimerStartPause')?.addEventListener('click', () => {
      this.toggleTimer();
    });

    this.container.querySelector('#btnTimerReset')?.addEventListener('click', () => {
      this.resetTimer();
    });

    this.container.querySelectorAll('[data-timer-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sec = Number((btn as HTMLElement).dataset.timerPreset);
        this.setTimerDuration(sec);
      });
    });

    const checkDark = this.container.querySelector('#checkDarkFrame') as HTMLInputElement;
    checkDark?.addEventListener('change', () => {
      this.state.timerDarkFrame = checkDark.checked;
      this.saveState();
    });
  }

  private switchTab(tab: 'triangle' | 'shutter' | 'nd' | 'timer'): void {
    this.activeTab = tab;
    this.container.querySelectorAll('.fs-segment-btn').forEach((b) => {
      b.classList.toggle('active', (b as HTMLElement).dataset.expTab === tab);
    });

    const tabT = this.container.querySelector('#tabContentTriangle') as HTMLElement;
    const tabS = this.container.querySelector('#tabContentShutter') as HTMLElement;
    const tabN = this.container.querySelector('#tabContentNd') as HTMLElement;
    const tabB = this.container.querySelector('#tabContentTimer') as HTMLElement;

    if (tabT) tabT.style.display = tab === 'triangle' ? 'block' : 'none';
    if (tabS) tabS.style.display = tab === 'shutter' ? 'block' : 'none';
    if (tabN) tabN.style.display = tab === 'nd' ? 'block' : 'none';
    if (tabB) tabB.style.display = tab === 'timer' ? 'block' : 'none';

    this.updateAllViews();
  }

  private handleApertureChange(newA: number): void {
    this.state.aperture = newA;
    if (this.state.isLocked && this.state.baseline) {
      // Tilpas lukkertid for at bevare det låste udgangspunkt
      const targetS = ExposureEngine.solveShutter(this.state.aperture, this.state.iso, this.state.baseline.ev);
      this.state.shutter = ExposureEngine.findClosestValue(targetS, STANDARD_SHUTTERS);
    }
    this.syncSlidersFromState();
    this.updateTriangleView();
    this.saveState();
  }

  private handleShutterChange(newS: number): void {
    this.state.shutter = newS;
    if (this.state.isLocked && this.state.baseline) {
      // Tilpas blænde for at bevare det låste udgangspunkt
      const targetA = ExposureEngine.solveAperture(this.state.shutter, this.state.iso, this.state.baseline.ev);
      this.state.aperture = ExposureEngine.findClosestValue(targetA, STANDARD_APERTURES);
    }
    this.syncSlidersFromState();
    this.updateTriangleView();
    this.saveState();
  }

  private handleIsoChange(newI: number): void {
    this.state.iso = newI;
    if (this.state.isLocked && this.state.baseline) {
      // Tilpas lukkertid for at bevare det låste udgangspunkt
      const targetS = ExposureEngine.solveShutter(this.state.aperture, this.state.iso, this.state.baseline.ev);
      this.state.shutter = ExposureEngine.findClosestValue(targetS, STANDARD_SHUTTERS);
    }
    this.syncSlidersFromState();
    this.updateTriangleView();
    this.saveState();
  }

  private syncSlidersFromState(): void {
    const sliderA = this.container.querySelector('#sliderAperture') as HTMLInputElement;
    const sliderS = this.container.querySelector('#sliderShutter') as HTMLInputElement;
    const sliderI = this.container.querySelector('#sliderIso') as HTMLInputElement;

    if (sliderA) {
      const idxA = STANDARD_APERTURES.indexOf(this.state.aperture);
      if (idxA !== -1) sliderA.value = String(idxA);
    }
    if (sliderS) {
      const idxS = STANDARD_SHUTTERS.indexOf(this.state.shutter);
      if (idxS !== -1) sliderS.value = String(idxS);
    }
    if (sliderI) {
      const idxI = STANDARD_ISOS.indexOf(this.state.iso);
      if (idxI !== -1) sliderI.value = String(idxI);
    }

    // Opdater hurtigknapperne
    this.container.querySelectorAll('[data-aperture]').forEach((b) => {
      const val = Number((b as HTMLElement).dataset.aperture);
      b.classList.toggle('active', Math.abs(val - this.state.aperture) < 0.05);
    });
    this.container.querySelectorAll('[data-shutter]').forEach((b) => {
      const val = Number((b as HTMLElement).dataset.shutter);
      b.classList.toggle('active', Math.abs(val - this.state.shutter) < 0.0001);
    });
    this.container.querySelectorAll('[data-iso]').forEach((b) => {
      const val = Number((b as HTMLElement).dataset.iso);
      b.classList.toggle('active', val === this.state.iso);
    });
  }

  private updateAllViews(): void {
    this.updateTriangleView();
    this.updateHandheldView();
    this.updateNdView();
    this.updateTimerDisplay();
  }

  private updateTriangleView(): void {
    const ev100 = ExposureEngine.calculateEV100(this.state.aperture, this.state.shutter);
    const evCurrent = ExposureEngine.calculateEV(this.state.aperture, this.state.shutter, this.state.iso);

    const targetEv = this.state.isLocked && this.state.baseline ? this.state.baseline.ev : evCurrent;
    const deltaEv = ExposureEngine.calculateMeterDelta(
      this.state.aperture,
      this.state.shutter,
      this.state.iso,
      targetEv
    );

    // Top badges
    const topBadge = this.container.querySelector('#expCurrentEvBadge');
    if (topBadge) topBadge.textContent = `EV ${evCurrent.toFixed(1)}`;

    const lockBadge = this.container.querySelector('#expLockBadge');
    if (lockBadge) {
      if (this.state.isLocked && this.state.baseline) {
        lockBadge.textContent = `🔒 Låst (EV ${this.state.baseline.ev.toFixed(1)})`;
        lockBadge.className = 'fs-badge badge-exposure';
      } else {
        lockBadge.textContent = '🔓 Fri tilstand';
        lockBadge.className = 'fs-badge';
      }
    }

    // Værditekster
    const dispA = this.container.querySelector('#dispAperture');
    const dispS = this.container.querySelector('#dispShutter');
    const dispI = this.container.querySelector('#dispIso');

    if (dispA) dispA.textContent = `f/${this.state.aperture}`;
    if (dispS) dispS.textContent = ExposureEngine.formatShutterSpeed(this.state.shutter);
    if (dispI) dispI.textContent = `ISO ${this.state.iso}`;

    // Render baseline reference sektion
    this.renderBaselineSection(deltaEv);

    // Render visuel SVG trekant, EV meter og histogram
    this.visualizer?.render({
      aperture: this.state.aperture,
      shutter: this.state.shutter,
      iso: this.state.iso,
      ev100,
      evCurrent,
      targetEv,
      deltaEv,
      isLocked: this.state.isLocked,
      baseline: this.state.baseline
    });
  }

  private renderBaselineSection(deltaEv: number): void {
    const mountEl = this.container.querySelector('#expBaselineMount');
    if (!mountEl) return;

    if (!this.state.isLocked || !this.state.baseline) {
      mountEl.innerHTML = `
        <div class="exposure-instruction-banner">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; max-width: 440px;">
              <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">Trin 1: Indstil hvad dit kamera måler</strong>
              Juster blænde, lukker og ISO frit herunder (eller vælg en hurtig lysscene). Lås derefter for at udforske ækvivalente tider eller bruge ND-filter.
            </div>
            <button class="fs-btn fs-btn-accent-sun" id="btnLockBaseline" style="padding: 8px 16px; font-size: 13px; font-weight: 700; min-height: 38px; white-space: nowrap;">
              🔒 Lås som udgangspunkt
            </button>
          </div>
        </div>
      `;

      mountEl.querySelector('#btnLockBaseline')?.addEventListener('click', () => {
        const evCurrent = ExposureEngine.calculateEV(this.state.aperture, this.state.shutter, this.state.iso);
        this.state.baseline = {
          aperture: this.state.aperture,
          shutter: this.state.shutter,
          iso: this.state.iso,
          ev: Number(evCurrent.toFixed(1))
        };
        this.state.isLocked = true;
        this.updateTriangleView();
        this.saveState();
      });
    } else {
      const b = this.state.baseline;
      const diffAperture = ExposureEngine.calculateApertureStopsDiff(b.aperture, this.state.aperture);
      const diffShutter = ExposureEngine.calculateShutterStopsDiff(b.shutter, this.state.shutter);
      const diffIso = ExposureEngine.calculateIsoStopsDiff(b.iso, this.state.iso);

      let summaryText = '✅ <strong>Gensidighedsloven:</strong> Eksponeringen er 100% identisk med dit udgangspunkt (0 EV afvigelse).';
      if (deltaEv <= -0.2) {
        summaryText = `⚠️ <strong>Grænseværdi:</strong> Indstillingerne kan ikke kompensere yderligere (${Math.abs(deltaEv).toFixed(1)} stops for mørkt).`;
      } else if (deltaEv >= 0.2) {
        summaryText = `⚠️ <strong>Grænseværdi:</strong> Indstillingerne kan ikke kompensere yderligere (${deltaEv.toFixed(1)} stops for lyst).`;
      }

      mountEl.innerHTML = `
        <div class="exposure-baseline-card">
          <div class="baseline-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🎯</span>
              <div>
                <strong style="font-size: 13px; color: var(--text-main);">Låst udgangspunkt</strong>
                <span style="font-size: 11px; color: var(--text-muted); display: block; font-family: var(--font-mono);">
                  f/${b.aperture} • ${ExposureEngine.formatShutterSpeed(b.shutter)} • ISO ${b.iso} (EV ${b.ev.toFixed(1)})
                </span>
              </div>
            </div>
            <button class="fs-btn" id="btnUnlockBaseline" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">
              🔓 Frigør / Ny måling
            </button>
          </div>

          <div class="baseline-diff-grid">
            <div class="diff-item">
              <span class="diff-label">Blænde</span>
              <span class="diff-val">${ExposureEngine.formatStopsDiff(diffAperture)}</span>
            </div>
            <div class="diff-item">
              <span class="diff-label">Lukkertid</span>
              <span class="diff-val highlight-shutter">${ExposureEngine.formatStopsDiff(diffShutter)}</span>
            </div>
            <div class="diff-item">
              <span class="diff-label">ISO</span>
              <span class="diff-val highlight-iso">${ExposureEngine.formatStopsDiff(diffIso)}</span>
            </div>
          </div>
          <div class="baseline-summary-text">
            ${summaryText}
          </div>
        </div>
      `;

      mountEl.querySelector('#btnUnlockBaseline')?.addEventListener('click', () => {
        this.state.isLocked = false;
        this.state.baseline = null;
        this.updateTriangleView();
        this.saveState();
      });
    }
  }

  private updateHandheldView(): void {
    const res = ExposureEngine.calculateHandheldShutter(
      this.state.handheldFocal,
      this.state.handheldCrop,
      this.state.handheldIbis
    );

    const astro = ExposureEngine.calculateAstroShutter(
      this.state.handheldFocal,
      this.state.handheldCrop
    );

    const dispFocal = this.container.querySelector('#dispHHandheldFocal');
    const badgeHandheld = this.container.querySelector('#handheldResultBadge');
    const adviceHandheld = this.container.querySelector('#handheldAdviceText');

    if (dispFocal) dispFocal.textContent = `${this.state.handheldFocal} mm`;
    if (badgeHandheld) badgeHandheld.textContent = res.displayStabilized;
    if (adviceHandheld) adviceHandheld.textContent = res.description;

    const astroBadge = this.container.querySelector('#astro500Badge');
    const astroDesc = this.container.querySelector('#astroRuleDesc');
    const t500El = this.container.querySelector('#astroT500');
    const t300El = this.container.querySelector('#astroT300');

    if (astroBadge) astroBadge.textContent = `${astro.display500} maks`;
    if (astroDesc) astroDesc.textContent = astro.tip;
    if (t500El) t500El.textContent = astro.display500;
    if (t300El) t300El.textContent = astro.display300;

    this.container.querySelectorAll('[data-focal-h]').forEach((b) => {
      const val = Number((b as HTMLElement).dataset.focalH);
      b.classList.toggle('active', val === this.state.handheldFocal);
    });
  }

  private calculateTotalNdStops(): number {
    let stops = 0;
    for (const id of this.state.selectedNdIds) {
      const def = STANDARD_ND_FILTERS.find((f) => f.id === id);
      if (def) stops += def.stops;
    }
    return stops;
  }

  private updateNdView(): void {
    const totalStops = this.calculateTotalNdStops();
    const res = ExposureEngine.calculateNdExposure(this.state.ndBaseShutter, totalStops);

    const dispBase = this.container.querySelector('#dispNdBase');
    const dispFinal = this.container.querySelector('#dispNdFinalTime');
    const dispStops = this.container.querySelector('#dispNdTotalStops');
    const dispFactor = this.container.querySelector('#dispNdFactor');
    const dispOd = this.container.querySelector('#dispNdOd');

    if (dispBase) dispBase.textContent = ExposureEngine.formatShutterSpeed(this.state.ndBaseShutter);
    if (dispFinal) dispFinal.textContent = res.displayTime;
    if (dispStops) dispStops.textContent = `${totalStops} stops`;
    if (dispFactor) dispFactor.textContent = `${Math.round(res.factor)}×`;
    if (dispOd) dispOd.textContent = `${res.opticalDensity.toFixed(1)}`;

    // Opdater filter-knapper
    this.container.querySelectorAll('[data-nd-id]').forEach((btn) => {
      const id = (btn as HTMLElement).dataset.ndId!;
      btn.classList.toggle('active', this.state.selectedNdIds.includes(id));
    });

    // Opdater quick buttons
    this.container.querySelectorAll('[data-nd-base]').forEach((btn) => {
      const s = Number((btn as HTMLElement).dataset.ndBase);
      btn.classList.toggle('active', Math.abs(s - this.state.ndBaseShutter) < 0.0001);
    });
  }

  // ================= BULB TIMER LOGIK =================
  private setTimerDuration(seconds: number): void {
    this.state.timerDurationSec = Math.max(1, seconds);
    this.resetTimer();
    this.saveState();
  }

  private toggleTimer(): void {
    if (this.timerRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  private startTimer(): void {
    if (this.timerPhase === 'idle' || this.timerPhase === 'finished') {
      this.timerTotalSec = this.state.timerDurationSec;
      this.timerRemainingSec = this.timerTotalSec;
      this.timerPhase = 'exposure';
    }

    this.timerRunning = true;
    const btn = this.container.querySelector('#btnTimerStartPause');
    if (btn) {
      btn.textContent = 'Pause';
      btn.classList.remove('fs-btn-accent-sun');
    }

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = window.setInterval(() => {
      this.tickTimer();
    }, 1000);

    this.updateTimerDisplay();
  }

  private pauseTimer(): void {
    this.timerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    const btn = this.container.querySelector('#btnTimerStartPause');
    if (btn) {
      btn.textContent = 'Fortsæt Optagelse';
      btn.classList.add('fs-btn-accent-sun');
    }
    this.updateTimerDisplay();
  }

  private resetTimer(): void {
    this.timerRunning = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timerPhase = 'idle';
    this.timerRemainingSec = this.state.timerDurationSec;
    this.timerTotalSec = this.state.timerDurationSec;

    const btn = this.container.querySelector('#btnTimerStartPause');
    if (btn) {
      btn.textContent = 'Start Optagelse';
      btn.classList.add('fs-btn-accent-sun');
    }

    this.updateTimerDisplay();
  }

  private tickTimer(): void {
    if (this.timerRemainingSec > 0) {
      this.timerRemainingSec--;
    } else {
      // Fase færdig
      this.playCompletionSound();
      this.triggerHaptic();

      if (this.timerPhase === 'exposure' && this.state.timerDarkFrame) {
        // Skift til Dark Frame fase
        this.timerPhase = 'darkframe';
        this.timerTotalSec = this.state.timerDurationSec;
        this.timerRemainingSec = this.timerTotalSec;
      } else {
        // Fuldstændig færdig
        this.timerPhase = 'finished';
        this.pauseTimer();
        const btn = this.container.querySelector('#btnTimerStartPause');
        if (btn) btn.textContent = 'Start Igen';
      }
    }
    this.updateTimerDisplay();
  }

  private updateTimerDisplay(): void {
    const dispNumber = this.container.querySelector('#timerDisplayNumber');
    const phaseLabel = this.container.querySelector('#timerPhaseLabel') as HTMLElement | null;
    const badge = this.container.querySelector('#timerStatusBadge');
    const circle = this.container.querySelector('#timerCircleProgress') as SVGCircleElement;

    // Format MM:SS
    const mins = Math.floor(this.timerRemainingSec / 60);
    const secs = this.timerRemainingSec % 60;
    const strM = String(mins).padStart(2, '0');
    const strS = String(secs).padStart(2, '0');

    if (dispNumber) dispNumber.textContent = `${strM}:${strS}`;

    let phaseText = 'Eksponering';
    let badgeText = 'Klar';
    let strokeColor = 'var(--accent-exposure, #a855f7)';

    if (this.timerPhase === 'exposure') {
      phaseText = this.timerRunning ? 'Optager lys...' : 'Pause';
      badgeText = 'Lukker Åben';
    } else if (this.timerPhase === 'darkframe') {
      phaseText = 'Dark Frame (LENR Støjreduktion)';
      badgeText = 'Dark Frame';
      strokeColor = 'var(--accent-sun, #f59e0b)';
    } else if (this.timerPhase === 'finished') {
      phaseText = 'Færdig! Lukker lukket';
      badgeText = 'Gennemført';
      strokeColor = 'var(--accent-success, #10b981)';
    }

    if (phaseLabel) {
      phaseLabel.textContent = phaseText;
      phaseLabel.style.color = strokeColor;
    }
    if (badge) {
      badge.textContent = badgeText;
      badge.className = `fs-badge ${this.timerRunning ? 'badge-sun' : ''}`;
    }

    if (circle) {
      // Omkreds = 2 * PI * 85 ≈ 534.07
      const circumference = 534.07;
      const progress = this.timerTotalSec > 0 ? this.timerRemainingSec / this.timerTotalSec : 0;
      const offset = circumference * (1 - progress);
      circle.style.strokeDashoffset = String(offset);
      circle.style.stroke = strokeColor;
    }

    // Presets active style
    this.container.querySelectorAll('[data-timer-preset]').forEach((b) => {
      const val = Number((b as HTMLElement).dataset.timerPreset);
      b.classList.toggle('active', val === this.state.timerDurationSec);
    });
  }

  private playCompletionSound(): void {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Ignorer audio fejl hvis browser blokerer lyd
    }
  }

  private triggerHaptic(): void {
    try {
      if (typeof navigator.vibrate === 'function') {
        navigator.vibrate([150, 100, 150]);
      }
    } catch (e) {
      // Ignorer haptic fejl
    }
  }
}
