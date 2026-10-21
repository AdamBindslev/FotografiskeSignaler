/**
 * index.ts - FotoVejr modul controller (§6)
 */

import { ModuleInstance } from '../../app/ModuleRegistry.ts';
import { Router } from '../../app/Router.ts';
import { WeatherEngine, DayForecast, ForecastResult } from './calculations/weather-engine.ts';
import { LocationService, GeoLocation } from '../../shared/services/LocationService.ts';
import { TimeService } from '../../shared/services/TimeService.ts';
import { AstroCore } from '../../shared/astronomy/AstroCore.ts';
import './weather.css';

export default class WeatherModule implements ModuleInstance {
  private container!: HTMLElement;
  private currentLocation: GeoLocation = LocationService.getLocation();
  private selectedDayIndex: number = 0;
  private forecastData: any = null;
  private parsedDays: DayForecast[] = [];
  private isCachedForecast: boolean = false;
  private cacheUpdatedAt: Date | null = null;
  private isLoading: boolean = false;

  private unsubLocation: (() => void) | null = null;

  public async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    this.currentLocation = LocationService.getLocation();
    this.render();
    this.attachEventListeners();
    await this.loadWeather();

    this.unsubLocation = LocationService.subscribe(async (loc) => {
      this.currentLocation = loc;
      this.updateLocationDisplay();
      await this.loadWeather(false);
    });
  }

  public onActivate(context?: any): void {
    if (context?.params) {
      const p = context.params as URLSearchParams;
      if (p.has('day')) {
        this.selectedDayIndex = Math.min(6, Math.max(0, Number(p.get('day')) || 0));
        this.renderSelectedDay();
      }
    }
  }

  public destroy(): void {
    if (this.unsubLocation) {
      this.unsubLocation();
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="weather-container">
        <!-- Modul top -->
        <div class="weather-header">
          <div class="weather-module-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
            <span>FotoVejr • Vejranalyse</span>
          </div>
          <button class="fs-btn" id="btnWeatherRefresh" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">
            Opdater vejr
          </button>
        </div>

        <!-- LOKATION -->
        <div class="location-bar">
          <div class="loc-info-group" id="btnOpenWeatherSearch" title="Søg lokation">
            <span class="loc-main-name" id="weatherLocName">${this.currentLocation.name}</span>
            <span class="loc-sub-coords" id="weatherLocCoords">${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø</span>
          </div>
          <div class="loc-actions">
            <button class="fs-btn-icon" id="btnWeatherGps" title="Brug aktuel GPS-position" aria-label="Brug GPS">
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

        <!-- SØGE MODAL / DROPDOWN -->
        <div id="weatherSearchDropdown" class="fs-card" style="display: none; margin-bottom: 0;">
          <input type="text" id="weatherSearchInput" placeholder="Søg by eller naturområde i Danmark..." style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-highlight); background: var(--bg-surface); color: var(--text-main); font-size: 14px;">
          <div id="weatherSearchResults" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
        </div>

        <!-- OFFLINE STATUS BANNER (§6.4) -->
        <div class="weather-status-banner" id="weatherStatusBanner">
          <span id="weatherStatusText">Offline tilstand – gemt vejrudsigt</span>
          <span id="weatherStatusTime" style="font-family: var(--font-mono); font-weight: 700;"></span>
        </div>

        <!-- 7 DAGES VÆLGER -->
        <div class="days-scroll-wrap" id="weatherDaysScroll">
          <div style="color: var(--text-dim); font-size: 13px; padding: 12px;">Henter vejrudsigt...</div>
        </div>

        <!-- INDHOLD FOR DEN VALGTE DAG -->
        <div id="weatherSelectedDayWrap"></div>
      </div>
    `;
  }

  private attachEventListeners(): void {
    // Opdater knap
    this.container.querySelector('#btnWeatherRefresh')?.addEventListener('click', () => {
      this.loadWeather(true);
    });

    // GPS knap
    this.container.querySelector('#btnWeatherGps')?.addEventListener('click', async () => {
      try {
        const btn = this.container.querySelector('#btnWeatherGps') as HTMLElement;
        btn.style.opacity = '0.5';
        const loc = await LocationService.requestGpsLocation();
        this.currentLocation = loc;
        this.updateLocationDisplay();
        await this.loadWeather(true);
        btn.style.opacity = '1';
      } catch (err) {
        alert((err as Error).message);
      }
    });

    // Søgning
    const searchDropdown = this.container.querySelector('#weatherSearchDropdown') as HTMLElement;
    const searchInput = this.container.querySelector('#weatherSearchInput') as HTMLInputElement;
    const searchResults = this.container.querySelector('#weatherSearchResults') as HTMLElement;

    this.container.querySelector('#btnOpenWeatherSearch')?.addEventListener('click', () => {
      const isVisible = searchDropdown.style.display === 'block';
      searchDropdown.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        searchInput.focus();
      }
    });

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
            this.updateLocationDisplay();
            searchDropdown.style.display = 'none';
            searchInput.value = '';
            searchResults.innerHTML = '';
            this.loadWeather(false);
          });
        });
      }, 300);
    });
  }

  private updateLocationDisplay(): void {
    const nameEl = this.container.querySelector('#weatherLocName');
    const coordsEl = this.container.querySelector('#weatherLocCoords');
    if (nameEl) nameEl.textContent = this.currentLocation.name;
    if (coordsEl) coordsEl.textContent = `${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`;
  }

  private async loadWeather(forceRefresh: boolean = false): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const result: ForecastResult = await WeatherEngine.fetchForecast(
        this.currentLocation.lat,
        this.currentLocation.lng,
        forceRefresh
      );

      this.forecastData = result.forecast;
      this.isCachedForecast = result.isCached;
      this.cacheUpdatedAt = result.updatedAt;

      // Parse alle 7 dage
      this.parsedDays = [];
      for (let i = 0; i < 7; i++) {
        const parsed = WeatherEngine.parseDayData(this.forecastData, i, this.currentLocation.lat, this.currentLocation.lng);
        if (parsed) this.parsedDays.push(parsed);
      }

      this.renderDaysScroll();
      this.renderSelectedDay();
      this.renderStatusBanner();
    } catch (err) {
      console.error('Fejl ved indlæsning af vejr:', err);
      const wrap = this.container.querySelector('#weatherSelectedDayWrap');
      if (wrap) {
        wrap.innerHTML = `
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${(err as Error).message || 'Tjek din internetforbindelse'}</p>
          </div>
        `;
      }
    } finally {
      this.isLoading = false;
    }
  }

  private renderStatusBanner(): void {
    const banner = this.container.querySelector('#weatherStatusBanner') as HTMLElement;
    const timeEl = this.container.querySelector('#weatherStatusTime');
    if (!banner) return;

    if (this.isCachedForecast && this.cacheUpdatedAt) {
      banner.classList.add('active');
      if (timeEl) timeEl.textContent = `Hentet kl. ${TimeService.formatTime(this.cacheUpdatedAt)}`;
    } else {
      banner.classList.remove('active');
    }
  }

  private renderDaysScroll(): void {
    const scrollEl = this.container.querySelector('#weatherDaysScroll');
    if (!scrollEl || this.parsedDays.length === 0) return;

    scrollEl.innerHTML = this.parsedDays
      .map((day, idx) => {
        const isToday = idx === 0;
        const name = isToday ? 'I dag' : day.dayName.substring(0, 3);
        const iconInfo = WeatherEngine.getWeatherCodeDescription(day.weatherCode);

        return `
        <div class="day-tab-card ${idx === this.selectedDayIndex ? 'active' : ''}" data-day="${idx}">
          <span class="day-name">${name}</span>
          <span class="day-date">${day.date.getDate()}</span>
          <span class="day-icon">${iconInfo.icon}</span>
          <span class="day-temp-range">${Math.round(day.minTemp)}° / ${Math.round(day.maxTemp)}°</span>
        </div>
      `;
      })
      .join('');

    scrollEl.querySelectorAll('[data-day]').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = Number((card as HTMLElement).dataset.day);
        this.selectedDayIndex = idx;
        scrollEl.querySelectorAll('.day-tab-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        this.renderSelectedDay();
      });
    });
  }

  private renderSelectedDay(): void {
    const wrap = this.container.querySelector('#weatherSelectedDayWrap');
    if (!wrap || !this.parsedDays[this.selectedDayIndex]) return;

    const day = this.parsedDays[this.selectedDayIndex];
    const sun = day.sun;
    const moon = day.moon;
    const fog = day.fog;
    const morning = day.goldenHourMorning;
    const evening = day.goldenHourEvening;
    const astro = day.astro;

    const getScoreClass = (score: number) => {
      if (score >= 70) return 'score-high';
      if (score >= 40) return 'score-moderate';
      return 'score-low';
    };

    wrap.innerHTML = `
      <!-- ASTRONOMISK OVERBLIK (SOL & MÅNE) -->
      <div class="astro-overview-grid">
        <!-- Sol -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>☀️</span> Soltider
          </div>
          <div class="astro-sub-val">${TimeService.formatTime(sun.sunrise)} / ${TimeService.formatTime(sun.sunset)}</div>
          <div class="astro-sub-detail">Solopgang • Solnedgang</div>
          <div class="astro-sub-detail" style="color:var(--golden-primary);">Gylden: ${TimeService.formatTime(sun.goldenHourEvening?.start)} - ${TimeService.formatTime(sun.sunset)}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>${moon.icon}</span> Måne
          </div>
          <div class="astro-sub-val">${moon.fraction}% • ${moon.name}</div>
          <div class="astro-sub-detail">Op: ${TimeService.formatTime(day.moonTimes?.rise)} • Ned: ${TimeService.formatTime(day.moonTimes?.set)}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${sun.nightSky?.start ? `${TimeService.formatTime(sun.nightSky.start)} - ${TimeService.formatTime(sun.nightSky.end)}` : 'Lyse nætter'}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${fog.icon} Morgentåge & Dis</span>
            <span class="photo-score-badge ${getScoreClass(fog.score)}">${fog.score}/100 • ${fog.level}</span>
          </div>
          <div class="photo-card-time">Tidsvindue: ca. ${TimeService.formatTime(sun.civilDawn)} - ${TimeService.formatTime(sun.sunriseEnd || sun.sunrise)}</div>
          <div class="photo-card-desc">${fog.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${fog.avgSpread}°C • Fugt: ${fog.avgHumidity}% • Vind: ${fog.avgWind} m/s</span>
            <button class="btn-goto-fotosol" data-time="${sun.sunrise ? sun.sunrise.getTime() : day.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${morning.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${getScoreClass(morning.score)}">${morning.score}/100</span>
          </div>
          <div class="photo-card-time">Gylden time: ${TimeService.formatTime(sun.sunrise)} - ${TimeService.formatTime(sun.goldenHourMorning?.end)}</div>
          <div class="photo-card-desc">${morning.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${morning.clouds.total}% (Lav: ${morning.clouds.low}%, Mellem: ${morning.clouds.mid}%, Høj: ${morning.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${sun.sunrise ? sun.sunrise.getTime() : day.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${evening.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${getScoreClass(evening.score)}">${evening.score}/100</span>
          </div>
          <div class="photo-card-time">Gylden time: ${TimeService.formatTime(sun.goldenHourEvening?.start)} - ${TimeService.formatTime(sun.sunset)}</div>
          <div class="photo-card-desc">${evening.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${evening.clouds.total}% (Lav: ${evening.clouds.low}%, Mellem: ${evening.clouds.mid}%, Høj: ${evening.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${sun.sunset ? sun.sunset.getTime() : day.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${astro.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${getScoreClass(astro.score)}">${astro.score}/100 • ${astro.status}</span>
          </div>
          <div class="photo-card-time">Astronomisk mørke: ${sun.nightSky?.start ? `${TimeService.formatTime(sun.nightSky.start)} - ${TimeService.formatTime(sun.nightSky.end)}` : 'Ingen astro-nat (lyse nætter)'}</div>
          <div class="photo-card-desc">${astro.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${astro.moonImpact}</span>
            <button class="btn-goto-fotosol" data-time="${sun.nadir ? sun.nadir.getTime() : day.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>
      </div>

      <!-- TIME-FOR-TIME TABEL -->
      <div class="fs-card" style="margin-top: 14px;">
        <div class="fs-card-header">
          <span class="fs-card-title">Time-for-time vejrdata</span>
          <span class="fs-badge">${day.dayName}</span>
        </div>
        <div class="hourly-table-wrap">
          <div class="hourly-scroll">
            ${day.hourly
              .map((h) => {
                return `
                <div class="hourly-col">
                  <span class="hour-badge">${String(h.hour).padStart(2, '0')}:00</span>
                  <span>${h.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(h.temp)}°</span>
                  <span class="hour-clouds">☁️ ${h.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${h.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(h.visibility / 1000).toFixed(0)}km</span>
                </div>
              `;
              })
              .join('')}
          </div>
        </div>
      </div>
    `;

    // Handlingsknap: "Se lysretning i FotoSol"
    wrap.querySelectorAll('.btn-goto-fotosol').forEach((btn) => {
      btn.addEventListener('click', () => {
        const timeMs = Number((btn as HTMLElement).dataset.time);
        const targetDate = new Date(timeMs);
        TimeService.setDate(targetDate);
        Router.navigate('#/fotosol', {
          date: targetDate,
          lat: this.currentLocation.lat,
          lng: this.currentLocation.lng,
          name: this.currentLocation.name
        });
      });
    });
  }
}
