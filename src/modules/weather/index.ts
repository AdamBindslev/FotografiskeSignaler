/**
 * index.ts - FotoVejr modul controller (§6)
 */

import { ModuleInstance } from '../../app/ModuleRegistry.ts';
import { Router } from '../../app/Router.ts';
import { WeatherEngine, DayForecast, ForecastResult, EventTiming } from './calculations/weather-engine.ts';
import { LocationService, GeoLocation } from '../../shared/services/LocationService.ts';
import { TimeService } from '../../shared/services/TimeService.ts';
import { AstroCore } from '../../shared/astronomy/AstroCore.ts';
import { LocationBar } from '../../shared/components/LocationBar.ts';
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
  private locationBar: LocationBar | null = null;
  private unsubLocation: (() => void) | null = null;

  public async mount(container: HTMLElement): Promise<void> {
    this.container = container;
    this.currentLocation = LocationService.getLocation();
    this.render();
    this.attachEventListeners();
    await this.loadWeather();

    this.unsubLocation = LocationService.subscribe(async (loc) => {
      this.currentLocation = loc;
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
      this.unsubLocation = null;
    }
    if (this.locationBar) {
      this.locationBar.destroy();
      this.locationBar = null;
    }
  }

  private render(): void {
    if (this.locationBar) {
      this.locationBar.destroy();
      this.locationBar = null;
    }

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

        <!-- FÆLLES LOKATION (§4.2, §9.1) -->
        <div id="weatherLocationMount"></div>

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

    // Monter fælles LocationBar
    const mountEl = this.container.querySelector('#weatherLocationMount') as HTMLElement | null;
    if (mountEl) {
      this.locationBar = new LocationBar({
        container: mountEl,
        accentClass: 'fs-btn-accent-weather',
        onLocationChange: (loc) => {
          this.currentLocation = loc;
          this.loadWeather(false);
        }
      });
    }
  }

  private attachEventListeners(): void {
    // Opdater knap
    this.container.querySelector('#btnWeatherRefresh')?.addEventListener('click', () => {
      this.loadWeather(true);
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

  public selectDay(idx: number): void {
    this.selectedDayIndex = Math.min(6, Math.max(0, idx));
    const scrollEl = this.container.querySelector('#weatherDaysScroll');
    if (scrollEl) {
      scrollEl.querySelectorAll('.day-tab-card').forEach((c) => c.classList.remove('active'));
      scrollEl.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add('active');
    }
    this.renderSelectedDay();
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
        this.selectDay(idx);
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
    const now = TimeService.getDate() || new Date();
    const isToday = this.selectedDayIndex === 0;
    const isTomorrow = this.selectedDayIndex === 1;

    // 1. Beregn tidsvinduer og overskredet-status (§6)
    const fogStart = sun.civilDawn || (sun.sunrise ? new Date(sun.sunrise.getTime() - 45 * 60 * 1000) : null);
    const fogEnd = sun.sunriseEnd || (sun.sunrise ? new Date(sun.sunrise.getTime() + 65 * 60 * 1000) : null);
    const fogTiming: EventTiming = WeatherEngine.getEventTiming(fogStart, fogEnd, this.selectedDayIndex, day.date, 'fog', fog.score, now);

    const mStart = (sun.blueHourMorning && sun.blueHourMorning.start) || (sun.sunrise ? new Date(sun.sunrise.getTime() - 50 * 60 * 1000) : null);
    const mEnd = (sun.goldenHourMorning && sun.goldenHourMorning.end) || (sun.sunrise ? new Date(sun.sunrise.getTime() + 45 * 60 * 1000) : null);
    const morningTiming: EventTiming = WeatherEngine.getEventTiming(mStart, mEnd, this.selectedDayIndex, day.date, 'morning', morning.score, now);

    const eStart = (sun.goldenHourEvening && sun.goldenHourEvening.start) || (sun.sunset ? new Date(sun.sunset.getTime() - 45 * 60 * 1000) : null);
    const eEnd = (sun.blueHourEvening && sun.blueHourEvening.end) || (sun.sunset ? new Date(sun.sunset.getTime() + 45 * 60 * 1000) : null);
    const eveningTiming: EventTiming = WeatherEngine.getEventTiming(eStart, eEnd, this.selectedDayIndex, day.date, 'evening', evening.score, now);

    let aStart: Date | null = null;
    let aEnd: Date | null = null;

    if (sun.astronomicalDusk) {
      if (isToday && sun.astronomicalDawn && now < sun.astronomicalDawn) {
        // Natten fra i går er i gang lige nu (tidlig morgenstund før daggry)
        aStart = new Date(sun.astronomicalDusk.getTime() - 24 * 60 * 60 * 1000);
        aEnd = sun.astronomicalDawn;
      } else {
        // Nattens astronomiske mørke for denne dag (starter i aften og slutter næste morgen)
        aStart = sun.astronomicalDusk;
        aEnd = sun.astronomicalDawn
          ? new Date(sun.astronomicalDawn.getTime() + 24 * 60 * 60 * 1000)
          : new Date(aStart.getTime() + 9 * 60 * 60 * 1000);
      }
    }
    const astroTiming: EventTiming = WeatherEngine.getEventTiming(aStart, aEnd, this.selectedDayIndex, day.date, 'astro', astro.score, now);

    // 2. Overordnet dags-banner tekst
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
    let dayBannerTitle = '';
    let dayBannerSubtitle = '';

    if (isToday) {
      dayBannerTitle = `I dag (${day.dayName.toLowerCase()} d. ${day.date.getDate()}. ${monthNames[day.date.getMonth()]})`;
      if (sun.sunset && now > sun.sunset) {
        dayBannerSubtitle = "Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys";
      } else if (fogTiming.status === 'active') {
        dayBannerSubtitle = fog.score >= 50
          ? `Aktuel nu: Morgentåge & solopgang kl. ${TimeService.formatTime(sun.sunrise)}`
          : `Aktuel nu: Solopgang & daggry kl. ${TimeService.formatTime(sun.sunrise)}`;
      } else if (morningTiming.status === 'active') {
        dayBannerSubtitle = morning.score >= 50 ? 'Aktuel lige nu: Daggry & gylden time!' : 'Aktuel lige nu: Daggry (skydækket morgen)';
      } else if (eveningTiming.status === 'active') {
        dayBannerSubtitle = evening.score >= 50 ? 'Aktuel lige nu: Solnedgang & aftenlys!' : 'Aktuel lige nu: Solnedgang (skjult bag skyer)';
      } else if (eStart && now < eStart) {
        dayBannerSubtitle = `Næste: Gylden time i aften kl. ${TimeService.formatTime(eStart)} (om ${TimeService.formatDuration(eStart.getTime() - now.getTime())})`;
      } else if (aStart && now < aStart) {
        dayBannerSubtitle = astro.score >= 60
          ? `Næste: Stjernehimmel i aften kl. ${TimeService.formatTime(aStart)} (om ${TimeService.formatDuration(aStart.getTime() - now.getTime())})`
          : `Næste: Astronomisk mørke i aften kl. ${TimeService.formatTime(aStart)} (om ${TimeService.formatDuration(aStart.getTime() - now.getTime())})`;
      } else {
        dayBannerSubtitle = "Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";
      }
    } else if (isTomorrow) {
      dayBannerTitle = `I morgen (${day.dayName.toLowerCase()} d. ${day.date.getDate()}. ${monthNames[day.date.getMonth()]})`;
      const mEarliest = sun.blueHourMorning?.start || sun.sunrise;
      const untilMorn = mEarliest ? Math.max(0, mEarliest.getTime() - now.getTime()) : 0;
      dayBannerSubtitle = `Første fotomulighed: Daggry kl. ${TimeService.formatTime(mEarliest)} (om ${TimeService.formatDuration(untilMorn)}) • Fotovejrudsigt for i morgen`;
    } else {
      dayBannerTitle = `${day.dayName} d. ${day.date.getDate()}. ${monthNames[day.date.getMonth()]}`;
      dayBannerSubtitle = `7-dages fotovejrudsigt for ${this.currentLocation.name}`;
    }

    const getScoreClass = (score: number) => {
      if (score >= 70) return 'score-high';
      if (score >= 40) return 'score-moderate';
      return 'score-low';
    };

    const renderTimingBanner = (t: EventTiming) => `
      <div class="card-timing-banner ${t.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${t.icon}</span>
          <span class="timing-label">${t.label}</span>
        </div>
        <span class="timing-banner-pill">${t.pill}</span>
      </div>
    `;

    const renderPassedJump = (isPassed: boolean, text: string, btnText: string) => {
      if (!isPassed || !isToday || this.parsedDays.length <= 1) return '';
      return `
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${text}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${btnText} ➔</button>
        </div>
      `;
    };

    // Soltider detaljer med passerede angivelser
    let sunValHtml = `${TimeService.formatTime(sun.sunrise)} / ${TimeService.formatTime(sun.sunset)}`;
    let sunDetail1 = 'Solopgang • Solnedgang';
    let sunDetail2 = `<span style="color:var(--golden-primary);">Gylden: ${TimeService.formatTime(sun.goldenHourEvening?.start)} - ${TimeService.formatTime(sun.sunset)}</span>`;

    if (isToday) {
      if (sun.sunset && now > sun.sunset) {
        sunValHtml += ' <span class="time-passed-tag">Passeret</span>';
        sunDetail1 = 'Solopgang • Solnedgang (dagens soltimer er forbi)';
        sunDetail2 = `<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;
      } else if (sun.sunrise && now > sun.sunrise) {
        sunDetail1 = `Solopgang var for ${TimeService.formatDuration(now.getTime() - sun.sunrise.getTime())} siden`;
        const untilEve = (sun.goldenHourEvening?.start || sun.sunset)
          ? TimeService.formatDuration((sun.goldenHourEvening?.start || sun.sunset)!.getTime() - now.getTime())
          : '';
        sunDetail2 = `<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${TimeService.formatTime(sun.goldenHourEvening?.start || sun.sunset)} (om ${untilEve})</span>`;
      } else {
        const untilRise = sun.sunrise ? TimeService.formatDuration(sun.sunrise.getTime() - now.getTime()) : '';
        sunDetail1 = `Solopgang i morges/dag kl. ${TimeService.formatTime(sun.sunrise)} (om ${untilRise})`;
      }
    } else if (isTomorrow) {
      sunDetail1 = `Solopgang i morgen kl. ${TimeService.formatTime(sun.sunrise)} • Solnedgang kl. ${TimeService.formatTime(sun.sunset)}`;
    }

    // Måne detaljer
    let moonRiseSet = `Op: ${TimeService.formatTime(day.moonTimes?.rise)} • Ned: ${TimeService.formatTime(day.moonTimes?.set)}`;
    if (isToday) {
      const riseDesc = day.moonTimes?.rise
        ? (now > day.moonTimes.rise
            ? `Op kl. ${TimeService.formatTime(day.moonTimes.rise)} (var for ${TimeService.formatDuration(now.getTime() - day.moonTimes.rise.getTime())} siden)`
            : `Op i aften kl. ${TimeService.formatTime(day.moonTimes.rise)} (om ${TimeService.formatDuration(day.moonTimes.rise.getTime() - now.getTime())})`)
        : 'Går ikke op';
      const setDesc = day.moonTimes?.set
        ? (now > day.moonTimes.set
            ? `Ned for ${TimeService.formatDuration(now.getTime() - day.moonTimes.set.getTime())} siden`
            : `Ned kl. ${TimeService.formatTime(day.moonTimes.set)}`)
        : 'Går ikke ned';
      moonRiseSet = `${riseDesc} • ${setDesc}`;
    } else if (isTomorrow) {
      moonRiseSet = `I morgen: Op kl. ${TimeService.formatTime(day.moonTimes?.rise)} • Ned kl. ${TimeService.formatTime(day.moonTimes?.set)}`;
    }

    const currentHour = now.getHours();

    wrap.innerHTML = `
      <!-- OVERORDNET DAG-STATUS BANNER -->
      <div class="weather-day-banner">
        <div class="weather-day-banner-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="weather-day-banner-content">
          <div class="weather-day-banner-title">${dayBannerTitle}</div>
          <div class="weather-day-banner-sub">${dayBannerSubtitle}</div>
        </div>
      </div>

      <!-- ASTRONOMISK OVERBLIK (SOL & MÅNE) -->
      <div class="astro-overview-grid">
        <!-- Sol -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>☀️</span> Soltider
          </div>
          <div class="astro-sub-val">${sunValHtml}</div>
          <div class="astro-sub-detail">${sunDetail1}</div>
          <div class="astro-sub-detail">${sunDetail2}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>${moon.icon}</span> Måne
          </div>
          <div class="astro-sub-val">${moon.fraction}% • ${moon.name}</div>
          <div class="astro-sub-detail">${moonRiseSet}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${sun.nightSky?.start ? `${TimeService.formatTime(sun.nightSky.start)} - ${TimeService.formatTime(sun.nightSky.end)}` : 'Lyse nætter'}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis -->
        <div class="photo-card ${fogTiming.isPassed ? 'card-event-passed' : ''}">
          ${renderTimingBanner(fogTiming)}
          <div class="photo-card-top">
            <span class="photo-card-title">${fog.icon} Morgentåge & Dis</span>
            <span class="photo-score-badge ${getScoreClass(fog.score)}">${fog.score}/100 • ${fog.level}</span>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ca. ${TimeService.formatTime(fogStart)} - ${TimeService.formatTime(fogEnd)}
            ${fogTiming.isPassed ? '<span class="time-passed-tag">Afsluttet i morges</span>' : `• ${fogTiming.sub}`}
          </div>
          <div class="photo-card-desc">${fog.text}</div>
          ${renderPassedJump(fogTiming.isPassed, 'Morgentågen fandt sted i morges. Tjek i morgen?', 'Se i morgen tidlig')}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${fog.avgSpread}°C • Fugt: ${fog.avgHumidity}% • Vind: ${fog.avgWind} m/s</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card ${morningTiming.isPassed ? 'card-event-passed' : ''}">
          ${renderTimingBanner(morningTiming)}
          <div class="photo-card-top">
            <span class="photo-card-title">${morning.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${getScoreClass(morning.score)}">${morning.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${TimeService.formatTime(sun.sunrise)} - ${TimeService.formatTime(sun.goldenHourMorning?.end)}
            ${morningTiming.isPassed ? `<span class="time-passed-tag">Passeret (kl. ${TimeService.formatTime(sun.sunrise)})</span>` : `• ${morningTiming.sub}`}
          </div>
          <div class="photo-card-desc">${morning.text}</div>
          ${renderPassedJump(morningTiming.isPassed, 'Morgenens gyldne time fandt sted i morges. Tjek i morgen?', 'Se daggry i morgen')}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${morning.clouds.total}% (Lav: ${morning.clouds.low}%, Mellem: ${morning.clouds.mid}%, Høj: ${morning.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${sun.sunrise ? sun.sunrise.getTime() : day.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card ${eveningTiming.isPassed ? 'card-event-passed' : ''}">
          ${renderTimingBanner(eveningTiming)}
          <div class="photo-card-top">
            <span class="photo-card-title">${evening.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${getScoreClass(evening.score)}">${evening.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${TimeService.formatTime(sun.goldenHourEvening?.start)} - ${TimeService.formatTime(sun.sunset)}
            ${eveningTiming.isPassed ? '<span class="time-passed-tag">Passeret i aften</span>' : `• ${eveningTiming.sub}`}
          </div>
          <div class="photo-card-desc">${evening.text}</div>
          ${renderPassedJump(eveningTiming.isPassed, 'Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?', 'Se solnedgang i morgen')}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${evening.clouds.total}% (Lav: ${evening.clouds.low}%, Mellem: ${evening.clouds.mid}%, Høj: ${evening.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${sun.sunset ? sun.sunset.getTime() : day.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card ${astroTiming.isPassed ? 'card-event-passed' : ''}">
          ${renderTimingBanner(astroTiming)}
          <div class="photo-card-top">
            <span class="photo-card-title">${astro.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${getScoreClass(astro.score)}">${astro.score}/100 • ${astro.status}</span>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${sun.nightSky?.start ? `${TimeService.formatTime(sun.nightSky.start)} - ${TimeService.formatTime(sun.nightSky.end)}` : 'Ingen astro-nat (lyse nætter)'}
            ${astroTiming.isPassed ? '<span class="time-passed-tag">Natten er ovre</span>' : `• ${astroTiming.sub}`}
          </div>
          <div class="photo-card-desc">${astro.text}</div>
          ${renderPassedJump(astroTiming.isPassed, 'Astronomisk mørke for denne nat er ovre. Tjek næste nat?', 'Se stjernehimmel i morgen')}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${astro.moonImpact}</span>
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
                let hourClass = 'hourly-col';
                let hourBadgeContent = `<span class="hour-badge">${String(h.hour).padStart(2, '0')}:00</span>`;

                if (isToday) {
                  if (h.hour < currentHour) {
                    hourClass += ' hourly-past-hour';
                    hourBadgeContent += `<span class="hour-past-pill">forbi</span>`;
                  } else if (h.hour === currentHour) {
                    hourClass += ' hourly-current-hour';
                    hourBadgeContent += `<span class="hour-now-badge">NU</span>`;
                  }
                }

                return `
                <div class="${hourClass}">
                  ${hourBadgeContent}
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

    // Hurtigspring til i morgen fra passerede begivenheder
    wrap.querySelectorAll('.btn-jump-tomorrow').forEach((btn) => {
      btn.addEventListener('click', () => {
        const jumpDay = Number((btn as HTMLElement).dataset.jumpDay ?? 1);
        this.selectDay(jumpDay);
      });
    });

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
