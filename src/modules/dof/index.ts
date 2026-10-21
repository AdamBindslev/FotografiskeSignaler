/**
 * index.ts - DOF modul controller (§8)
 */

import { ModuleInstance } from '../../app/ModuleRegistry.ts';
import { DofEngine, DofInputParams, DofResult, SENSOR_PRESETS } from './calculations/dof-engine.ts';
import { DofVisualizer } from './visualization/dof-visualizer.ts';
import './dof.css';

const SCENARIOS = [
  {
    id: 'portrait',
    name: '👤 Klassisk Portræt',
    sub: '85mm f/1.4 • FF • 2,0 m',
    params: { sensor: 'full_frame', focalLength: 85, aperture: 1.4, distance: 2.0 }
  },
  {
    id: 'landscape',
    name: '🏞️ Landskab (Hyperfokal)',
    sub: '24mm f/8 • FF • Hyperfokal',
    params: { sensor: 'full_frame', focalLength: 24, aperture: 8.0, distance: 'hyperfocal' }
  },
  {
    id: 'macro',
    name: '🌿 Makro / Nærbillede',
    sub: '100mm f/2.8 • FF • 0,35 m',
    params: { sensor: 'full_frame', focalLength: 100, aperture: 2.8, distance: 0.35 }
  },
  {
    id: 'street',
    name: '🏙️ Gadefoto / Zonefokus',
    sub: '35mm f/5.6 • APS-C • 3,0 m',
    params: { sensor: 'apsc_sony_nikon_fuji', focalLength: 35, aperture: 5.6, distance: 3.0 }
  },
  {
    id: 'wildlife',
    name: '🦅 Tele / Fugle & Dyr',
    sub: '400mm f/4 • FF • 15,0 m',
    params: { sensor: 'full_frame', focalLength: 400, aperture: 4.0, distance: 15.0 }
  },
  {
    id: 'phone',
    name: '📱 Mobilkamera',
    sub: '24mm ækv. f/1.8 • Mobil • 1,5 m',
    params: { sensor: 'phone_main', focalLength: 6.8, aperture: 1.8, distance: 1.5 }
  }
];

const APERTURE_STOPS = [1.0, 1.2, 1.4, 1.8, 2.0, 2.8, 4.0, 5.6, 8.0, 11.0, 16.0, 22.0];
const FOCAL_PRESETS = [16, 24, 35, 50, 85, 105, 135, 200, 400];

export default class DofModule implements ModuleInstance {
  private container!: HTMLElement;
  private visualizer: DofVisualizer | null = null;
  private currentParams: DofInputParams = {
    sensor: 'full_frame',
    focalLength: 50,
    aperture: 2.8,
    distance: 2.0
  };
  private activeVisTab: 'diagram' | 'evf' = 'diagram';

  public mount(container: HTMLElement): void {
    this.container = container;
    this.loadSavedState();
    this.render();
    this.attachEventListeners();
    this.updateCalculations();
  }

  public onActivate(context?: any): void {
    if (context?.params) {
      const p = context.params as URLSearchParams;
      if (p.has('focal')) this.currentParams.focalLength = Number(p.get('focal')) || 50;
      if (p.has('f')) this.currentParams.aperture = Number(p.get('f')) || 2.8;
      if (p.has('dist')) this.currentParams.distance = Number(p.get('dist')) || 2.0;
      if (p.has('sensor')) this.currentParams.sensor = p.get('sensor') || 'full_frame';
      this.updateCalculations();
    }
  }

  private loadSavedState(): void {
    try {
      const saved = localStorage.getItem('fs_dof_state_v1');
      if (saved) {
        this.currentParams = { ...this.currentParams, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Kunne ikke hente gemt DOF-tilstand:', e);
    }
  }

  private saveState(): void {
    try {
      localStorage.setItem('fs_dof_state_v1', JSON.stringify(this.currentParams));
    } catch (e) {
      console.warn('Kunne ikke gemme DOF-tilstand:', e);
    }
  }

  private render(): void {
    const sensorOptions = Object.values(SENSOR_PRESETS)
      .map((s) => `<option value="${s.id}" ${s.id === this.currentParams.sensor ? 'selected' : ''}>${s.name}</option>`)
      .join('');

    this.container.innerHTML = `
      <div class="dof-container">
        <!-- Modul top -->
        <div class="dof-header">
          <div class="dof-module-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="12" y1="2" x2="12" y2="4"></line>
              <line x1="12" y1="20" x2="12" y2="22"></line>
            </svg>
            <span>DOF • Optisk Simulator</span>
          </div>
          <span class="fs-badge badge-dof" id="dofSensorBadge">Full Frame [1.0×]</span>
        </div>

        <!-- HERO KORT MED HOVEDTAL -->
        <div class="dof-hero-card">
          <div class="dof-main-metric">
            <div class="dof-total-val" id="dofTotalVal">--</div>
            <div class="dof-total-sub">Total Dybdeskarphed (DOF)</div>
          </div>

          <div class="dof-grid-stats">
            <div class="stat-item">
              <span class="stat-label">Nærgrænse (Dn)</span>
              <span class="stat-num" id="dofNearVal">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Fjerngrænse (Df)</span>
              <span class="stat-num highlight-dof" id="dofFarVal">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Hyperfokal (H)</span>
              <span class="stat-num highlight-hyper" id="dofHyperVal">--</span>
            </div>
          </div>

          <div class="dof-distribution-wrap">
            <div class="dof-dist-bar">
              <div class="dist-front" id="dofDistFront" style="width: 50%;"></div>
              <div class="dist-rear" id="dofDistRear" style="width: 50%;"></div>
            </div>
            <div class="dist-labels">
              <span id="dofFrontLabel">Foran: 50%</span>
              <span id="dofRearLabel">Bagved: 50%</span>
            </div>
          </div>
        </div>

        <!-- VISUALISERING TABS (Diagram vs EVF) -->
        <div class="dof-vis-card">
          <div class="vis-header-row">
            <div class="fs-segmented-control" style="max-width: 200px;">
              <button class="fs-segment-btn ${this.activeVisTab === 'diagram' ? 'active' : ''}" data-tab="diagram" id="tabBtnDiagram">Diagram</button>
              <button class="fs-segment-btn ${this.activeVisTab === 'evf' ? 'active' : ''}" data-tab="evf" id="tabBtnEvf">EVF Søger</button>
            </div>
            <div class="vis-toggles" id="evfControlsWrap" style="${this.activeVisTab === 'evf' ? '' : 'display: none;'}">
              <button class="vis-toggle-btn" id="btnTogglePeaking" title="Focus Peaking">Peaking</button>
              <button class="vis-toggle-btn active" id="btnToggleGrid" title="3x3 Kompositionsgitter">Gitter</button>
            </div>
          </div>

          <!-- SVG Diagram Visning -->
          <div class="dof-svg-wrap" id="diagramContainer" style="${this.activeVisTab === 'diagram' ? '' : 'display: none;'}">
            <svg class="dof-svg-diagram" id="dofSvgDiagram" viewBox="0 0 1000 165" preserveAspectRatio="none"></svg>
          </div>

          <!-- EVF Viewfinder Visning -->
          <div class="evf-viewfinder" id="evfContainer" style="${this.activeVisTab === 'evf' ? '' : 'display: none;'}">
            <!-- HUD Top -->
            <div class="evf-hud-top">
              <span class="hud-item"><span class="af-dot"></span> AF-C SINGLE</span>
              <span class="hud-item hud-bokeh" id="evfBokehQualityLabel">Bokeh</span>
              <span class="hud-item" id="evfOsdIso">ISO 100</span>
            </div>

            <!-- Landskab baggrund -->
            <div class="evf-layer evf-bg-scenery" id="evfLayerBackground">
              <div class="evf-sky"></div>
              <div class="evf-mountains"></div>
              <div class="evf-distant-trees"></div>
            </div>

            <!-- Bokeh bolde overlay -->
            <div class="evf-bokeh-overlay" id="evfBokehOverlay"></div>

            <!-- Motiv i fokus -->
            <div class="evf-layer evf-subject-wrap" id="evfLayerSubject">
              <div class="evf-peaking-glow" id="evfPeakingSubject"></div>
              <div class="evf-subject-figure">
                <!-- SVG af person -->
                <svg width="64" height="150" viewBox="0 0 64 150" fill="none">
                  <circle cx="32" cy="22" r="14" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
                  <path d="M12 55 C12 40, 52 40, 52 55 L56 100 L42 100 L44 145 L34 145 L32 102 L30 145 L20 145 L22 100 L8 100 Z" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
                </svg>
              </div>
              <div class="evf-af-box">
                <span class="af-dot"></span>
              </div>
            </div>

            <!-- Forgrund lag -->
            <div class="evf-layer evf-foreground-wrap" id="evfLayerForeground">
              <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
                <path d="M0,80 Q20,30 40,80 Q70,20 90,80 Q130,40 150,80 Q180,10 210,80 Q260,35 290,80 Q340,25 370,80 Q390,45 400,80 Z" fill="#0f172a" opacity="0.85"/>
              </svg>
            </div>

            <!-- 3x3 Gitter -->
            <div class="evf-grid-overlay" id="evfGridOverlay">
              <div class="grid-line grid-v1"></div>
              <div class="grid-line grid-v2"></div>
              <div class="grid-line grid-h1"></div>
              <div class="grid-line grid-h2"></div>
            </div>

            <!-- HUD Bund Telemetry -->
            <div class="evf-hud-bottom">
              <span id="evfOsdShutter">1/500s</span>
              <span id="evfOsdAperture" style="color: var(--golden-primary); font-weight: 700;">f/2.8</span>
              <span id="evfOsdDist">2,0 m</span>
              <span id="evfOsdFocal">50mm</span>
            </div>
          </div>
        </div>

        <!-- KONTROLPANEL KORT -->
        <div class="fs-card">
          <!-- 1. SENSOR VÆLGER -->
          <div class="fs-slider-wrap">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Sensorformat</span>
              <span class="fs-slider-val" id="dofCocDisplay">CoC: 0.029 mm</span>
            </div>
            <select class="fs-btn" id="dofSensorSelect" style="width: 100%; text-align: left; padding: 10px;">
              ${sensorOptions}
            </select>
          </div>

          <!-- 2. BRÆNDVIDDE (FOCAL LENGTH) -->
          <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Brændvidde</span>
              <span class="fs-slider-val" id="dofFocalDisplay">50 mm</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="fs-btn-icon" id="btnFocalMinus" aria-label="Mindre brændvidde">-</button>
              <input type="range" id="dofFocalSlider" min="10" max="600" step="1" value="${this.currentParams.focalLength}">
              <button class="fs-btn-icon" id="btnFocalPlus" aria-label="Større brændvidde">+</button>
            </div>
            <div class="quick-btn-scroll">
              ${FOCAL_PRESETS.map((f) => `<button class="quick-val-btn ${f === this.currentParams.focalLength ? 'active' : ''}" data-focal="${f}">${f}mm</button>`).join('')}
            </div>
          </div>

          <!-- 3. BLÆNDE (APERTURE) -->
          <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Blænde</span>
              <span class="fs-slider-val" id="dofApertureDisplay" style="color: var(--golden-primary);">f/2.8</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="fs-btn-icon" id="btnApertureMinus" aria-label="Større blænde">-</button>
              <input type="range" id="dofApertureSlider" min="0" max="${APERTURE_STOPS.length - 1}" step="1" value="5">
              <button class="fs-btn-icon" id="btnAperturePlus" aria-label="Mindre blænde">+</button>
            </div>
            <div class="quick-btn-scroll">
              ${APERTURE_STOPS.map((a) => `<button class="quick-val-btn ${a === this.currentParams.aperture ? 'active' : ''}" data-aperture="${a}">f/${a}</button>`).join('')}
            </div>
          </div>

          <!-- 4. AFSTAND (DISTANCE) -->
          <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Motivafstand</span>
              <span class="fs-slider-val" id="dofDistanceDisplay">2,00 m</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="fs-btn-icon" id="btnDistMinus" aria-label="Tættere på">-</button>
              <input type="range" id="dofDistSlider" min="0.1" max="50" step="0.05" value="${this.currentParams.distance}">
              <button class="fs-btn-icon" id="btnDistPlus" aria-label="Længere væk">+</button>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
              <button class="fs-btn" id="btnSetHyperfocal" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">
                🎯 Sæt til Hyperfokal
              </button>
            </div>
          </div>
        </div>

        <!-- FOTOGRAFISKE SCENARIER (§8.2) -->
        <div class="fs-card">
          <div class="fs-card-header">
            <span class="fs-card-title">Hurtige Scenarier</span>
          </div>
          <div class="scenarios-grid">
            ${SCENARIOS.map(
              (sc) => `
              <button class="scenario-card-btn" data-scenario="${sc.id}">
                <span class="scenario-name">${sc.name}</span>
                <span class="scenario-sub">${sc.sub}</span>
              </button>
            `
            ).join('')}
          </div>
        </div>

        <!-- OPTISK TEKNIK INFO & DIFFRAKTION -->
        <div class="fs-card">
          <div class="fs-card-header">
            <span class="fs-card-title">Optisk Analyse</span>
            <span class="fs-badge" id="dofDiffractionBadge">Optimal skarphed</span>
          </div>
          <p id="dofDiffractionDesc" style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;"></p>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
            <span>35mm ækvivalent: <strong id="dofEquivDisplay" style="color: var(--text-main);">50mm f/2.8</strong></span>
            <span>Indgangspupil: <strong id="dofPupilDisplay" style="color: var(--text-main);">17,9 mm</strong></span>
          </div>
        </div>
      </div>
    `;

    const svgEl = this.container.querySelector('#dofSvgDiagram') as SVGSVGElement;
    const evfEl = this.container.querySelector('#evfContainer') as HTMLElement;
    this.visualizer = new DofVisualizer(svgEl, evfEl);
  }

  private attachEventListeners(): void {
    // Tab vælger (Diagram vs EVF)
    const tabBtnDiagram = this.container.querySelector('#tabBtnDiagram');
    const tabBtnEvf = this.container.querySelector('#tabBtnEvf');
    const diagramContainer = this.container.querySelector('#diagramContainer') as HTMLElement;
    const evfContainer = this.container.querySelector('#evfContainer') as HTMLElement;
    const evfControlsWrap = this.container.querySelector('#evfControlsWrap') as HTMLElement;

    tabBtnDiagram?.addEventListener('click', () => {
      this.activeVisTab = 'diagram';
      tabBtnDiagram.classList.add('active');
      tabBtnEvf?.classList.remove('active');
      diagramContainer.style.display = 'block';
      evfContainer.style.display = 'none';
      evfControlsWrap.style.display = 'none';
      this.updateCalculations();
    });

    tabBtnEvf?.addEventListener('click', () => {
      this.activeVisTab = 'evf';
      tabBtnEvf.classList.add('active');
      tabBtnDiagram?.classList.remove('active');
      evfContainer.style.display = 'block';
      diagramContainer.style.display = 'none';
      evfControlsWrap.style.display = 'flex';
      this.updateCalculations();
    });

    // Peaking & Grid
    const btnPeaking = this.container.querySelector('#btnTogglePeaking');
    btnPeaking?.addEventListener('click', () => {
      const active = this.visualizer?.toggleFocusPeaking();
      btnPeaking.classList.toggle('active', active);
    });

    const btnGrid = this.container.querySelector('#btnToggleGrid');
    btnGrid?.addEventListener('click', () => {
      const active = this.visualizer?.toggleGrid();
      btnGrid.classList.toggle('active', active);
    });

    // Sensor select
    const sensorSelect = this.container.querySelector('#dofSensorSelect') as HTMLSelectElement;
    sensorSelect?.addEventListener('change', () => {
      this.currentParams.sensor = sensorSelect.value;
      this.updateCalculations();
    });

    // Focal length slider & buttons
    const focalSlider = this.container.querySelector('#dofFocalSlider') as HTMLInputElement;
    focalSlider?.addEventListener('input', () => {
      this.currentParams.focalLength = Number(focalSlider.value);
      this.updateCalculations();
    });

    this.container.querySelector('#btnFocalMinus')?.addEventListener('click', () => {
      this.currentParams.focalLength = Math.max(10, this.currentParams.focalLength - 5);
      focalSlider.value = String(this.currentParams.focalLength);
      this.updateCalculations();
    });

    this.container.querySelector('#btnFocalPlus')?.addEventListener('click', () => {
      this.currentParams.focalLength = Math.min(600, this.currentParams.focalLength + 5);
      focalSlider.value = String(this.currentParams.focalLength);
      this.updateCalculations();
    });

    this.container.querySelectorAll('[data-focal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const f = Number((btn as HTMLElement).dataset.focal);
        this.currentParams.focalLength = f;
        focalSlider.value = String(f);
        this.updateCalculations();
      });
    });

    // Aperture slider & buttons
    const apertureSlider = this.container.querySelector('#dofApertureSlider') as HTMLInputElement;
    apertureSlider?.addEventListener('input', () => {
      const idx = Number(apertureSlider.value);
      this.currentParams.aperture = APERTURE_STOPS[idx] || 2.8;
      this.updateCalculations();
    });

    this.container.querySelector('#btnApertureMinus')?.addEventListener('click', () => {
      const currentIdx = APERTURE_STOPS.indexOf(this.currentParams.aperture);
      if (currentIdx > 0) {
        this.currentParams.aperture = APERTURE_STOPS[currentIdx - 1];
        apertureSlider.value = String(currentIdx - 1);
        this.updateCalculations();
      }
    });

    this.container.querySelector('#btnAperturePlus')?.addEventListener('click', () => {
      const currentIdx = APERTURE_STOPS.indexOf(this.currentParams.aperture);
      if (currentIdx >= 0 && currentIdx < APERTURE_STOPS.length - 1) {
        this.currentParams.aperture = APERTURE_STOPS[currentIdx + 1];
        apertureSlider.value = String(currentIdx + 1);
        this.updateCalculations();
      }
    });

    this.container.querySelectorAll('[data-aperture]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const a = Number((btn as HTMLElement).dataset.aperture);
        this.currentParams.aperture = a;
        const idx = APERTURE_STOPS.indexOf(a);
        if (idx !== -1) apertureSlider.value = String(idx);
        this.updateCalculations();
      });
    });

    // Distance slider & buttons
    const distSlider = this.container.querySelector('#dofDistSlider') as HTMLInputElement;
    distSlider?.addEventListener('input', () => {
      this.currentParams.distance = Number(distSlider.value);
      this.updateCalculations();
    });

    this.container.querySelector('#btnDistMinus')?.addEventListener('click', () => {
      this.currentParams.distance = Math.max(0.1, Number((this.currentParams.distance * 0.85).toFixed(2)));
      distSlider.value = String(this.currentParams.distance);
      this.updateCalculations();
    });

    this.container.querySelector('#btnDistPlus')?.addEventListener('click', () => {
      this.currentParams.distance = Math.min(100, Number((this.currentParams.distance * 1.18).toFixed(2)));
      distSlider.value = String(this.currentParams.distance);
      this.updateCalculations();
    });

    // Sæt til hyperfokal knap
    this.container.querySelector('#btnSetHyperfocal')?.addEventListener('click', () => {
      const calc = DofEngine.calculateDOF(this.currentParams);
      this.currentParams.distance = Number(calc.hyperfocalM.toFixed(2));
      distSlider.value = String(Math.min(50, this.currentParams.distance));
      this.updateCalculations();
    });

    // Scenarier
    this.container.querySelectorAll('[data-scenario]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const scId = (btn as HTMLElement).dataset.scenario;
        const sc = SCENARIOS.find((s) => s.id === scId);
        if (!sc) return;

        this.currentParams.sensor = sc.params.sensor;
        this.currentParams.focalLength = sc.params.focalLength;
        this.currentParams.aperture = sc.params.aperture;

        if (sc.params.distance === 'hyperfocal') {
          const temp = DofEngine.calculateDOF(this.currentParams);
          this.currentParams.distance = Number(temp.hyperfocalM.toFixed(2));
        } else {
          this.currentParams.distance = Number(sc.params.distance);
        }

        // Synkroniser inputs
        sensorSelect.value = this.currentParams.sensor;
        focalSlider.value = String(this.currentParams.focalLength);
        distSlider.value = String(Math.min(50, this.currentParams.distance));
        const aIdx = APERTURE_STOPS.indexOf(this.currentParams.aperture);
        if (aIdx !== -1) apertureSlider.value = String(aIdx);

        this.updateCalculations();
      });
    });
  }

  private updateCalculations(): void {
    const res: DofResult = DofEngine.calculateDOF(this.currentParams);
    this.saveState();

    // Opdater tal i interfacet
    const totalEl = this.container.querySelector('#dofTotalVal');
    const nearEl = this.container.querySelector('#dofNearVal');
    const farEl = this.container.querySelector('#dofFarVal');
    const hyperEl = this.container.querySelector('#dofHyperVal');
    const badgeEl = this.container.querySelector('#dofSensorBadge');
    const cocEl = this.container.querySelector('#dofCocDisplay');
    const focalEl = this.container.querySelector('#dofFocalDisplay');
    const apertureEl = this.container.querySelector('#dofApertureDisplay');
    const distEl = this.container.querySelector('#dofDistanceDisplay');

    if (totalEl) totalEl.textContent = res.isInfinity ? '∞ (Uendelig)' : DofEngine.formatDistance(res.totalDofM);
    if (nearEl) nearEl.textContent = DofEngine.formatDistance(res.nearLimitM);
    if (farEl) farEl.textContent = res.isInfinity ? '∞' : DofEngine.formatDistance(res.farLimitM);
    if (hyperEl) hyperEl.textContent = DofEngine.formatDistance(res.hyperfocalM);

    if (badgeEl) badgeEl.textContent = `${res.sensor.shortName}`;
    if (cocEl) cocEl.textContent = `CoC: ${res.cocMm} mm`;
    if (focalEl) focalEl.textContent = `${res.focalLengthMm} mm`;
    if (apertureEl) apertureEl.textContent = `f/${res.aperture}`;
    if (distEl) distEl.textContent = DofEngine.formatDistance(res.distanceM);

    // Fordeling bar
    const frontBar = this.container.querySelector('#dofDistFront') as HTMLElement;
    const rearBar = this.container.querySelector('#dofDistRear') as HTMLElement;
    const frontLabel = this.container.querySelector('#dofFrontLabel');
    const rearLabel = this.container.querySelector('#dofRearLabel');

    if (frontBar && rearBar) {
      frontBar.style.width = `${res.frontPercent}%`;
      rearBar.style.width = `${res.rearPercent}%`;
    }
    if (frontLabel) frontLabel.textContent = `Foran: ${Math.round(res.frontPercent)}% (${DofEngine.formatDistance(res.depthInFrontM)})`;
    if (rearLabel) rearLabel.textContent = `Bagved: ${Math.round(res.rearPercent)}% (${res.isInfinity ? '∞' : DofEngine.formatDistance(res.depthBehindM)})`;

    // Hurtig knapper active class update
    this.container.querySelectorAll('[data-focal]').forEach((btn) => {
      const f = Number((btn as HTMLElement).dataset.focal);
      btn.classList.toggle('active', f === res.focalLengthMm);
    });

    this.container.querySelectorAll('[data-aperture]').forEach((btn) => {
      const a = Number((btn as HTMLElement).dataset.aperture);
      btn.classList.toggle('active', Math.abs(a - res.aperture) < 0.05);
    });

    // Diffraktion
    const diffBadge = this.container.querySelector('#dofDiffractionBadge') as HTMLElement;
    const diffDesc = this.container.querySelector('#dofDiffractionDesc');
    const equivEl = this.container.querySelector('#dofEquivDisplay');
    const pupilEl = this.container.querySelector('#dofPupilDisplay');

    if (diffBadge) {
      diffBadge.textContent = res.diffractionStatus.label;
      diffBadge.className = `fs-badge ${res.diffractionStatus.badgeClass}`;
    }
    if (diffDesc) diffDesc.textContent = res.diffractionStatus.desc;
    if (equivEl) equivEl.textContent = `${res.equivFocalLength}mm f/${res.equivAperture}`;
    if (pupilEl) pupilEl.textContent = `${res.pupilDiameterMm.toFixed(1).replace('.', ',')} mm`;

    // Render visuel diagram og EVF
    this.visualizer?.render(res);
  }
}
