/**
 * index.ts - Hjemmeskærm controller for Fotografiske Signaler (§4.2)
 */

import { ModuleInstance } from '../../app/ModuleRegistry.ts';
import { Router } from '../../app/Router.ts';
import { LocationService, GeoLocation, PhotoSpot } from '../../shared/services/LocationService.ts';
import { TimeService } from '../../shared/services/TimeService.ts';
import { StorageService } from '../../shared/services/StorageService.ts';
import { AstroCore } from '../../shared/astronomy/AstroCore.ts';

export default class HomeModule implements ModuleInstance {
  private container!: HTMLElement;
  private currentLocation: GeoLocation = LocationService.getLocation();
  private unsubLocation: (() => void) | null = null;
  private searchOpen: boolean = false;
  private showSaveInput: boolean = false;

  public mount(container: HTMLElement): void {
    this.container = container;
    this.currentLocation = LocationService.getLocation();
    this.render();
    this.attachEventListeners();

    this.unsubLocation = LocationService.subscribe((loc) => {
      this.currentLocation = loc;
      this.render();
      this.attachEventListeners();
    });
  }

  public onActivate(): void {
    this.currentLocation = LocationService.getLocation();
    this.render();
    this.attachEventListeners();
  }

  public destroy(): void {
    if (this.unsubLocation) {
      this.unsubLocation();
    }
  }

  private render(): void {
    const settings = StorageService.getSettings();
    const now = new Date();
    const sunPos = AstroCore.getSunPosition(now, this.currentLocation.lat, this.currentLocation.lng);
    const sunTimes = AstroCore.getSunTimes(now, this.currentLocation.lat, this.currentLocation.lng);
    const lightPhase = AstroCore.getLightPhase(sunPos.altitude);
    const lastMod = settings.lastModule !== 'home' ? settings.lastModule : null;
    const savedSpots: PhotoSpot[] = LocationService.getSavedSpots();

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); width: 100%;">
        <!-- VELKOMST HERO -->
        <div class="fs-card" style="padding: var(--space-5); text-align: center; border-color: var(--border-highlight); background: linear-gradient(180deg, rgba(22, 27, 34, 0.95) 0%, rgba(15, 18, 23, 0.9) 100%);">
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <img src="fotografiske-signaler-wordmark.png" alt="Fotografiske Signaler" style="max-height: 48px; width: auto;" onerror="this.style.display='none'">
          </div>
          <h1 style="font-size: 1.4rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px;">
            Fotografiske Signaler
          </h1>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 480px; margin: 0 auto; line-height: 1.45;">
            Professionel fotografisk værktøjskasse. Vejranalyse, sol- og lysretning samt optiske DOF-beregninger samlet i én mobiloptimeret PWA.
          </p>

          <!-- Aktuel status bar med solinfo -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); border-top: 1px solid var(--border-subtle); padding-top: 12px; flex-wrap: wrap;">
            <span style="color: ${lightPhase.color}; font-weight: 700;">● ${lightPhase.name}</span>
            <span>•</span>
            <span>Sol ${sunPos.altitude >= 0 ? '+' : ''}${sunPos.altitude.toFixed(0)}° (${sunPos.azimuth.toFixed(0)}° ${AstroCore.getCompassDirection(sunPos.azimuth)})</span>
            <span>•</span>
            <span>Solnedgang: ${TimeService.formatTime(sunTimes.sunset)}</span>
          </div>
        </div>

        <!-- LOKATIONSVÆLGER PÅ STARTSKÆRMEN (§4.2, §9.1) -->
        <div class="location-bar">
          <div class="loc-info-group" id="btnOpenHomeLocation" title="Vælg eller søg lokation" style="cursor: pointer;">
            <span class="loc-main-name" id="homeLocName">📍 ${this.currentLocation.name}</span>
            <span class="loc-sub-coords" id="homeLocCoords">${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø • Tryk for at skifte</span>
          </div>
          <div class="loc-actions">
            <button class="fs-btn-icon" id="btnHomeGps" title="Brug aktuel GPS-position" aria-label="Brug GPS">
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

        <!-- SØGEPANEL & GEMTE FOTOSPOTS -->
        <div id="homeSearchDropdown" class="fs-card" style="display: ${this.searchOpen ? 'block' : 'none'}; margin-bottom: 0;">
          <!-- Søgefelt -->
          <div style="margin-bottom: 12px;">
            <input type="text" id="homeSearchInput" placeholder="Søg by, postnr eller naturområde i Danmark..." style="width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-highlight); background: var(--bg-surface); color: var(--text-main); font-size: 14px;">
            <div id="homeSearchResults" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
          </div>

          <!-- Gem aktuel position som nyt spot -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px; margin-bottom: 12px;">
            ${
              this.showSaveInput
                ? `
              <div style="display: flex; flex-direction: column; gap: 8px; background: var(--bg-surface); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--accent-sun);">
                <label style="font-size: 12px; color: var(--text-muted); font-weight: 600;">Navngiv fotospot:</label>
                <input type="text" id="inputSpotName" value="${this.currentLocation.name}" style="padding: 8px; border-radius: var(--radius-xs); border: 1px solid var(--border-highlight); background: var(--bg-surface-elevated); color: var(--text-main); font-size: 13px;">
                <div style="display: flex; gap: 6px; justify-content: flex-end;">
                  <button class="fs-btn" id="btnCancelSaveSpot" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">Annuller</button>
                  <button class="fs-btn fs-btn-accent-sun" id="btnConfirmSaveSpot" style="padding: 4px 12px; font-size: 11px; min-height: 28px;">Gem spot</button>
                </div>
              </div>
            `
                : `
              <button class="fs-btn" id="btnTriggerSaveSpot" style="width: 100%; justify-content: center; gap: 6px; background: var(--bg-surface-elevated); border: 1px dashed var(--accent-sun); color: var(--accent-sun); font-size: 12px; min-height: 36px;">
                ⭐ Gem aktuel lokation som fotospot
              </button>
            `
            }
          </div>

          <!-- Dine gemte fotospots liste -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Dine Gemte Fotospots (${savedSpots.length}):</span>
            </div>

            <div id="homeSavedSpotsList" style="display: flex; flex-direction: column; gap: 6px;">
              ${
                savedSpots.length === 0
                  ? `
                <div style="font-size: 12px; color: var(--text-dim); text-align: center; padding: 12px 6px; line-height: 1.4;">
                  Ingen gemte fotospots endnu.<br>Tryk på <em>"Gem aktuel lokation"</em> herover for at tilføje dit første spot.
                </div>
              `
                  : savedSpots
                      .map(
                        (spot) => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface-elevated); padding: 8px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); transition: border-color 0.15s ease;">
                  <div style="cursor: pointer; flex: 1; overflow: hidden;" data-select-spot="${spot.id}">
                    <strong style="color: var(--text-main); font-size: 13px; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">📍 ${spot.name}</strong>
                    <span style="color: var(--text-muted); font-size: 11px; font-family: var(--font-mono);">${spot.lat.toFixed(4)}°N, ${spot.lng.toFixed(4)}°Ø</span>
                  </div>
                  <button class="fs-btn-icon" data-delete-spot="${spot.id}" title="Slet spot" style="width: 28px; height: 28px; border: none; color: var(--text-dim); background: transparent; cursor: pointer;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              `
                      )
                      .join('')
              }
            </div>
          </div>
        </div>

        ${
          lastMod
            ? `
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-elevated); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:12px; color:var(--text-muted);">Sidst anvendte værktøj:</span>
            <button class="fs-btn" id="btnResumeLast" style="padding:4px 12px; font-size:12px; min-height:28px;">
              Gå til ${this.getModuleName(lastMod)} →
            </button>
          </div>
        `
            : ''
        }

        <!-- MODUL 1: FOTOVEJR -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-weather); cursor: pointer;" id="cardGoWeather">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-weather-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-weather);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">FotoVejr</h2>
                <span style="font-size: 11px; color: var(--accent-weather); font-weight: 600; text-transform: uppercase;">Atmosfære & Fotovinduer</span>
              </div>
            </div>
            <span class="fs-badge badge-weather">Vejr</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            7-døgns fotografisk vejranalyse for ${this.currentLocation.name}. Beregner morgentåge, gylden time-kvalitet, skydække i 3 lag og stjerneklart astro-vindue.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Solopgang: ${TimeService.formatTime(sunTimes.sunrise)} • Solnedgang: ${TimeService.formatTime(sunTimes.sunset)}</span>
            <span style="color: var(--accent-weather); font-weight: 600;">Åbn FotoVejr →</span>
          </div>
        </div>

        <!-- MODUL 2: FOTOSOL -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-sun); cursor: pointer;" id="cardGoSun">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-sun-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-sun);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">FotoSol</h2>
                <span style="font-size: 11px; color: var(--accent-sun); font-weight: 600; text-transform: uppercase;">Sol, Skygge & Lysretning</span>
              </div>
            </div>
            <span class="fs-badge badge-sun">3D & Kort</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            Interaktiv 3D-søger og satellitkort for ${this.currentLocation.name}. Simulerer solhøjde, azimut, skyggelængde for person/træ/bygning og farvetemperatur gennem døgnet.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Aktuel retning: ${sunPos.azimuth.toFixed(0)}° ${AstroCore.getCompassDirection(sunPos.azimuth)}</span>
            <span style="color: var(--accent-sun); font-weight: 600;">Åbn FotoSol →</span>
          </div>
        </div>

        <!-- MODUL 3: FOTODOF -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-dof); cursor: pointer;" id="cardGoDof">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-dof-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-dof);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="12" y1="2" x2="12" y2="4"></line>
                  <line x1="12" y1="20" x2="12" y2="22"></line>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">FotoDOF</h2>
                <span style="font-size: 11px; color: var(--accent-dof); font-weight: 600; text-transform: uppercase;">Optik, Fokus & Bokeh</span>
              </div>
            </div>
            <span class="fs-badge badge-dof">100% Offline</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            Præcisionsberegner for dybdeskarphed, hyperfokalafstand, diffraktionsgrænser og bokeh med simuleret EVF-søger og optisk målestok.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Understøtter Mellemformat, Full Frame, APS-C, MFT & Mobil</span>
            <span style="color: var(--accent-dof); font-weight: 600;">Åbn FotoDOF →</span>
          </div>
        </div>

        <!-- OM PROJEKTET & ASTRO NAT INFO -->
        <div class="fs-card" style="font-size: 12px; color: var(--text-dim); line-height: 1.5;">
          <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">Om Fotografiske Signaler PWA</strong>
          Appen kører 100% lokalt i din browser og kan installeres på startskærmen af din mobil. Tryk på måne-ikonet øverst til højre for at aktivere rød nattilstand (skåner nattesynet ved astro- og aftenfotografering).
        </div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Navigation til moduler
    this.container.querySelector('#cardGoWeather')?.addEventListener('click', () => {
      Router.navigate('#/fotovejr');
    });

    this.container.querySelector('#cardGoSun')?.addEventListener('click', () => {
      Router.navigate('#/fotosol');
    });

    this.container.querySelector('#cardGoDof')?.addEventListener('click', () => {
      Router.navigate('#/fotodof');
    });

    this.container.querySelector('#btnResumeLast')?.addEventListener('click', () => {
      const settings = StorageService.getSettings();
      if (settings.lastModule === 'weather') Router.navigate('#/fotovejr');
      else if (settings.lastModule === 'sun') Router.navigate('#/fotosol');
      else if (settings.lastModule === 'dof') Router.navigate('#/fotodof');
    });

    // Lokationshåndtering på Hjemmeskærmen
    const searchDropdown = this.container.querySelector('#homeSearchDropdown') as HTMLElement;
    const searchInput = this.container.querySelector('#homeSearchInput') as HTMLInputElement;
    const searchResults = this.container.querySelector('#homeSearchResults') as HTMLElement;

    this.container.querySelector('#btnOpenHomeLocation')?.addEventListener('click', () => {
      this.searchOpen = !this.searchOpen;
      searchDropdown.style.display = this.searchOpen ? 'block' : 'none';
      if (this.searchOpen) {
        searchInput?.focus();
      }
    });

    // GPS-knap på startskærmen
    this.container.querySelector('#btnHomeGps')?.addEventListener('click', async () => {
      try {
        const btn = this.container.querySelector('#btnHomeGps') as HTMLElement;
        btn.style.opacity = '0.5';
        const loc = await LocationService.requestGpsLocation();
        this.currentLocation = loc;
        this.searchOpen = false;
        this.render();
        this.attachEventListeners();
        btn.style.opacity = '1';
      } catch (err) {
        alert((err as Error).message);
      }
    });

    // Gem aktuel position trigger
    this.container.querySelector('#btnTriggerSaveSpot')?.addEventListener('click', () => {
      this.showSaveInput = true;
      this.render();
      this.attachEventListeners();
      const input = this.container.querySelector('#inputSpotName') as HTMLInputElement;
      input?.focus();
      input?.select();
    });

    this.container.querySelector('#btnCancelSaveSpot')?.addEventListener('click', () => {
      this.showSaveInput = false;
      this.render();
      this.attachEventListeners();
    });

    this.container.querySelector('#btnConfirmSaveSpot')?.addEventListener('click', () => {
      const input = this.container.querySelector('#inputSpotName') as HTMLInputElement;
      const spotName = input?.value || this.currentLocation.name;
      LocationService.saveSpot(spotName, this.currentLocation.lat, this.currentLocation.lng);
      this.showSaveInput = false;
      this.render();
      this.attachEventListeners();
    });

    // Vælg et gemt spot
    this.container.querySelectorAll('[data-select-spot]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const spotId = (btn as HTMLElement).dataset.selectSpot;
        const spots = LocationService.getSavedSpots();
        const spot = spots.find((s) => s.id === spotId);
        if (spot) {
          this.currentLocation = LocationService.setLocation({
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            source: 'search'
          });
          this.searchOpen = false;
          this.render();
          this.attachEventListeners();
        }
      });
    });

    // Slet et gemt spot
    this.container.querySelectorAll('[data-delete-spot]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const spotId = (btn as HTMLElement).dataset.deleteSpot;
        if (spotId && confirm('Vil du fjerne dette gemte fotospot?')) {
          LocationService.deleteSpot(spotId);
          this.render();
          this.attachEventListeners();
        }
      });
    });

    // Søgning efter byer/steder med debounce
    let searchTimer: any = null;
    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimer);
      const val = searchInput.value.trim();
      if (val.length < 2) {
        searchResults.innerHTML = '';
        return;
      }
      searchTimer = setTimeout(async () => {
        const results = await LocationService.search(val);
        searchResults.innerHTML = results
          .map(
            (r) => `
          <button class="fs-btn" data-lat="${r.lat}" data-lng="${r.lng}" data-name="${r.name}" style="text-align:left; justify-content:space-between; width:100%; padding:8px 12px;">
            <strong>${r.name}</strong>
            <span style="font-size:11px;color:var(--text-muted);">${r.sub}</span>
          </button>
        `
          )
          .join('');

        searchResults.querySelectorAll('[data-lat]').forEach((btn) => {
          btn.addEventListener('click', () => {
            const lat = Number((btn as HTMLElement).dataset.lat);
            const lng = Number((btn as HTMLElement).dataset.lng);
            const name = (btn as HTMLElement).dataset.name || 'Valgt by';
            this.currentLocation = LocationService.setLocation({ lat, lng, name, source: 'search' });
            this.searchOpen = false;
            this.render();
            this.attachEventListeners();
          });
        });
      }, 300);
    });
  }

  private getModuleName(id: string): string {
    if (id === 'weather') return 'FotoVejr';
    if (id === 'sun') return 'FotoSol';
    if (id === 'dof') return 'FotoDOF';
    return id;
  }
}
