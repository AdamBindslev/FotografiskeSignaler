/**
 * weather-engine.ts - Henter Open-Meteo data og beregner foto-specifikke indekser (§6)
 */

import { AstroCore, SunTimes, MoonIllumination, MoonTimes } from '../../../shared/astronomy/AstroCore.ts';
import { TimeService } from '../../../shared/services/TimeService.ts';

export interface HourlyWeather {
  time: string;
  hour: number;
  temp: number;
  apparentTemp: number;
  humidity: number;
  dewPoint: number;
  spread: number; // temp - dewPoint
  precipProb: number;
  precipMm: number;
  weatherCode: number;
  weatherDesc: string;
  weatherIcon: string;
  cloudTotal: number;
  cloudLow: number;
  cloudMid: number;
  cloudHigh: number;
  visibility: number; // meters
  windSpeed: number;  // m/s
  windDir: number;    // degrees
  windGusts: number;  // m/s
}

export interface DayForecast {
  date: Date;
  dayIndex: number;
  dateStr: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  weatherCode: number;
  weatherDesc: string;
  sun: SunTimes;
  moon: MoonIllumination;
  moonTimes: MoonTimes;
  fog: {
    score: number;
    level: string;
    text: string;
    icon: string;
    classType: string;
    avgSpread: string;
    avgHumidity: number;
    avgWind: string;
    minVisibilityKm: string;
    fogType: 'dense_fog' | 'radiation_mist' | 'clear';
    typeName: string;
    typeBadge: string;
    badgeClass: string;
    photoTip: string;
    period: 'night' | 'morning' | 'day' | 'evening' | 'all_day' | 'none';
    timeWindowLabel: string;
    startTime: Date | null;
    endTime: Date | null;
  };
  goldenHourMorning: {
    score: number;
    text: string;
    icon: string;
    clouds: { total: number; low: number; mid: number; high: number };
  };
  goldenHourEvening: {
    score: number;
    text: string;
    icon: string;
    clouds: { total: number; low: number; mid: number; high: number };
  };
  astro: {
    score: number;
    status: string;
    icon: string;
    text: string;
    roundClouds: number;
    moonImpact: string;
  };
  hourly: HourlyWeather[];
}

export interface ForecastResult {
  forecast: any;
  isCached: boolean;
  updatedAt: Date;
}

export interface EventTiming {
  status: 'active' | 'passed' | 'upcoming' | 'future' | 'future-distant';
  bannerClass: string;
  icon: string;
  pill: string;
  label: string;
  sub: string;
  isPassed: boolean;
}

const CACHE_PREFIX = 'photoweather_cache_v2_';

export class WeatherEngine {
  public static async fetchForecast(lat: number, lng: number, forceRefresh: boolean = false): Promise<ForecastResult> {
    const cacheKey = `${CACHE_PREFIX}${lat.toFixed(4)}_${lng.toFixed(4)}`;
    let cached: any = null;

    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        cached = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Kunne ikke læse vejr-cache:', e);
    }

    // Hvis cachen er frisk (under 2 timer) og vi ikke tvinger opdatering
    const now = Date.now();
    if (!forceRefresh && cached && cached.timestamp && now - cached.timestamp < 1000 * 60 * 60 * 2) {
      return {
        forecast: cached.data,
        isCached: true,
        updatedAt: new Date(cached.timestamp)
      };
    }

    const url =
      'https://api.open-meteo.com/v1/forecast?' +
      `latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}` +
      '&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,' +
      'precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,' +
      'cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min' +
      '&wind_speed_unit=ms' +
      '&timezone=auto';

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Open-Meteo svarede med status ${res.status}`);
      }
      const data = await res.json();

      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            timestamp: now,
            data
          })
        );
      } catch (e) {
        console.warn('Kunne ikke gemme vejr i localStorage:', e);
      }

      return {
        forecast: data,
        isCached: false,
        updatedAt: new Date(now)
      };
    } catch (err) {
      if (cached && cached.data) {
        return {
          forecast: cached.data,
          isCached: true,
          updatedAt: new Date(cached.timestamp)
        };
      }
      throw err;
    }
  }

  public static parseDayData(data: any, dayIndex: number, lat: number, lng: number): DayForecast | null {
    if (!data?.hourly?.time || !data?.daily?.time) return null;

    const dayDateStr = data.daily.time[dayIndex];
    if (!dayDateStr) return null;

    const parts = dayDateStr.split('-');
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0);

    const sun = AstroCore.getSunTimes(date, lat, lng);
    const moon = AstroCore.getMoonIllumination(date);
    const moonTimes = AstroCore.getMoonTimes(date, lat, lng);

    const hourlyTimes: string[] = data.hourly.time;
    const hourly: HourlyWeather[] = [];
    const nextDayMorningHourly: HourlyWeather[] = [];

    const prefix = `${dayDateStr}T`;
    const nextDayDateStr = data.daily.time[dayIndex + 1];
    const nextPrefix = nextDayDateStr ? `${nextDayDateStr}T` : null;

    const buildHourlyEntry = (i: number, t: string): HourlyWeather => {
      const hour = Number(t.substring(11, 13));
      const temp = data.hourly.temperature_2m[i];
      const dew = data.hourly.dew_point_2m[i];
      const weatherCode = data.hourly.weather_code[i];
      const descInfo = this.getWeatherCodeDescription(weatherCode);

      return {
        time: t,
        hour,
        temp,
        apparentTemp: data.hourly.apparent_temperature[i],
        humidity: data.hourly.relative_humidity_2m[i],
        dewPoint: dew,
        spread: +(temp - dew).toFixed(1),
        precipProb: data.hourly.precipitation_probability[i],
        precipMm: data.hourly.precipitation[i],
        weatherCode,
        weatherDesc: descInfo.desc,
        weatherIcon: descInfo.icon,
        cloudTotal: data.hourly.cloud_cover[i],
        cloudLow: data.hourly.cloud_cover_low[i],
        cloudMid: data.hourly.cloud_cover_mid[i],
        cloudHigh: data.hourly.cloud_cover_high[i],
        visibility: data.hourly.visibility[i],
        windSpeed: data.hourly.wind_speed_10m[i],
        windDir: data.hourly.wind_direction_10m[i],
        windGusts: data.hourly.wind_gusts_10m[i]
      };
    };

    for (let i = 0; i < hourlyTimes.length; i++) {
      const t = hourlyTimes[i];
      if (t.startsWith(prefix)) {
        hourly.push(buildHourlyEntry(i, t));
      } else if (nextPrefix && t.startsWith(nextPrefix)) {
        const hour = Number(t.substring(11, 13));
        if (hour <= 4) {
          nextDayMorningHourly.push(buildHourlyEntry(i, t));
        }
      }
    }

    const fog = this.calculateFogRisk(hourly, sun, date);
    const goldenHourMorning = this.calculateGoldenHourQuality(hourly, sun.goldenHourMorning, sun.sunrise);
    const goldenHourEvening = this.calculateGoldenHourQuality(hourly, sun.goldenHourEvening, sun.sunset);
    const astro = this.calculateAstroScore(hourly, sun, moon, lat, lng, date, nextDayMorningHourly);

    const daysDanish = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];

    return {
      date,
      dayIndex,
      dateStr: dayDateStr,
      dayName: daysDanish[date.getDay()],
      maxTemp: data.daily.temperature_2m_max[dayIndex],
      minTemp: data.daily.temperature_2m_min[dayIndex],
      weatherCode: data.daily.weather_code[dayIndex],
      weatherDesc: this.getWeatherCodeDescription(data.daily.weather_code[dayIndex]).desc,
      sun,
      moon,
      moonTimes,
      fog,
      goldenHourMorning,
      goldenHourEvening,
      astro,
      hourly
    };
  }

  public static calculateFogRisk(hourly: HourlyWeather[], sun: SunTimes, targetDate?: Date): any {
    const baseDate = targetDate || (sun.sunrise ? new Date(sun.sunrise.getTime()) : new Date());

    if (!hourly || hourly.length === 0) {
      return {
        score: 0,
        level: 'Ukendt',
        text: 'Ingen vejrdata tilgængelig',
        icon: '❓',
        classType: 'low',
        fogType: 'clear',
        typeName: 'Morgentåge & Dis',
        typeBadge: 'Ingen data',
        badgeClass: 'badge-clear',
        photoTip: 'Ingen vejrmeldinger tilgængelige.',
        avgSpread: '0.0',
        avgHumidity: 0,
        avgWind: '0.0',
        minVisibilityKm: '0.0',
        period: 'none',
        timeWindowLabel: 'Ingen data',
        startTime: null,
        endTime: null
      };
    }

    const sunriseHour = sun.sunrise ? sun.sunrise.getHours() : 6;
    const sunsetHour = sun.sunset ? sun.sunset.getHours() : 18;

    // Helper til at score en enkelt times tågebetingelser (0-100)
    const scoreHour = (h: HourlyWeather): number => {
      const hasFogCode = h.weatherCode === 45 || h.weatherCode === 48;
      const vis = typeof h.visibility === 'number' ? h.visibility : 10000;

      // Hård stopklods: Hvis sigtbarheden er 10+ km og ingen WMO tågekode, er der klar luft
      // Uanset hvor koldt, fugtigt eller vindstille det er, er det IKKE tåge!
      if (!hasFogCode && vis >= 10000) {
        return 10;
      }
      if (!hasFogCode && vis >= 6000) {
        return 20;
      }

      let pts = 0;
      if (h.spread <= 0.5) pts += 35;
      else if (h.spread <= 1.2) pts += 25;
      else if (h.spread <= 2.0) pts += 15;
      else if (h.spread <= 3.0) pts += 5;

      if (h.humidity >= 96) pts += 25;
      else if (h.humidity >= 92) pts += 18;
      else if (h.humidity >= 88) pts += 10;
      else if (h.humidity >= 80) pts += 5;

      const isDenseSignal = hasFogCode || vis <= 1000;
      if (isDenseSignal) {
        if (h.windSpeed <= 3.0) pts += 20;
        else if (h.windSpeed <= 5.0) pts += 12;
        else if (h.windSpeed <= 7.0) pts += 5;
        else pts -= 10;
        pts += 20;
      } else {
        if (h.windSpeed <= 2.0) pts += 20;
        else if (h.windSpeed <= 3.5) pts += 12;
        else if (h.windSpeed <= 5.0) pts += 5;
        else pts -= 15;
        if (vis <= 4500) pts += 8;
      }

      let score = Math.min(100, Math.max(0, pts));

      // Hårde lofter baseret på reel sigtbarhed når der ikke meldes WMO tågekode
      if (!hasFogCode) {
        if (vis > 5000) score = Math.min(score, 25);
        else if (vis > 3500) score = Math.min(score, 45);
        else if (vis > 1500) score = Math.min(score, 70);
      }

      return score;
    };

    // Vurder samtlige 24 timer i døgnet
    const hourScores = hourly.map((h) => ({ hour: h.hour, item: h, score: scoreHour(h) }));
    const fogHours = hourScores.filter((h) => h.score >= 35);

    // Hvis ingen timer overskrider grænsen for tåge/dis, tjekkes standard daggrysvindue
    if (fogHours.length === 0) {
      const morningStart = Math.max(0, sunriseHour - 3);
      const morningEnd = Math.min(23, sunriseHour + 1);
      const morningList = hourly.filter((h) => h.hour >= morningStart && h.hour <= morningEnd);
      const fallbackList = morningList.length > 0 ? morningList : hourly.slice(0, 4);

      let avgSpread = 0;
      let avgHumidity = 0;
      let avgWind = 0;
      let minVisibility = 99999;
      fallbackList.forEach((h) => {
        avgSpread += h.spread;
        avgHumidity += h.humidity;
        avgWind += h.windSpeed;
        if (h.visibility < minVisibility) minVisibility = h.visibility;
      });
      avgSpread /= fallbackList.length;
      avgHumidity /= fallbackList.length;
      avgWind /= fallbackList.length;

      const morningScore = Math.max(
        10,
        Math.round(fallbackList.reduce((acc, h) => acc + scoreHour(h), 0) / fallbackList.length)
      );

      const startTime = sun.civilDawn || (sun.sunrise ? new Date(sun.sunrise.getTime() - 45 * 60 * 1000) : null);
      const endTime = sun.sunriseEnd || (sun.sunrise ? new Date(sun.sunrise.getTime() + 65 * 60 * 1000) : null);

      return {
        score: morningScore,
        level: 'Lav',
        text: 'Lav tågerisiko – klar sigt over landskabet',
        icon: '☀️',
        classType: 'low',
        fogType: 'clear',
        typeName: 'Morgentåge & Dis',
        typeBadge: 'Lav risiko',
        badgeClass: 'badge-clear',
        photoTip: 'Gode betingelser for rene, kontrastrige solopgangsbilleder uden slørende tåge.',
        avgSpread: avgSpread.toFixed(1),
        avgHumidity: Math.round(avgHumidity),
        avgWind: avgWind.toFixed(1),
        minVisibilityKm: (minVisibility / 1000).toFixed(1),
        period: 'morning',
        timeWindowLabel: `ca. ${TimeService.formatTime(startTime)} - ${TimeService.formatTime(endTime)}`,
        startTime,
        endTime
      };
    }

    // 1. Tjek om der er tåge i morgenvinduet (før og omkring solopgang)
    // Fotografisk er morgentåge ved daggry/solopgang dagens vigtigste begivenhed
    const morningHours = fogHours.filter((h) => h.hour <= sunriseHour + 3);
    const hasSunriseFog = morningHours.some(
      (h) => h.hour >= sunriseHour - 2 && h.hour <= sunriseHour + 2 && (h.score >= 40 || h.item.visibility <= 3000)
    );

    // 2. Tjek om der er tæt tåge midt på dagen (kl. 11-15)
    const middayFog = fogHours.filter((h) => h.hour >= 11 && h.hour <= 15);
    const hasMiddayDenseFog = middayFog.some(
      (h) => h.item.weatherCode === 45 || h.item.weatherCode === 48 || h.item.visibility <= 1500
    );

    let period: 'night' | 'morning' | 'day' | 'evening' | 'all_day' = 'morning';
    let dominantGroup = fogHours;

    if (fogHours.length >= 8 && hasMiddayDenseFog && middayFog.length >= 3) {
      // Reel heldagståge der fortsætter uafbrudt henover middag
      period = 'all_day';
      dominantGroup = fogHours;
    } else if (hasSunriseFog && morningHours.length >= 2) {
      // Prioriter altid morgentåge hvis der er tåge omkring daggry og solopgang
      period = 'morning';
      dominantGroup = morningHours;
    } else {
      // Ellers vurder separat nat, aften eller dag
      const nightLateGroup = fogHours.filter((h) => h.hour >= sunsetHour + 2);
      const nightEarlyGroup = fogHours.filter((h) => h.hour <= sunriseHour - 3);
      const eveningGroup = fogHours.filter((h) => h.hour >= sunsetHour - 1 && h.hour <= sunsetHour + 1);
      const dayGroup = fogHours.filter((h) => h.hour > sunriseHour + 2 && h.hour < sunsetHour - 1);

      const counts = [
        {
          period: 'night' as const,
          group: nightEarlyGroup.length >= nightLateGroup.length ? nightEarlyGroup : nightLateGroup,
          weight: Math.max(
            nightEarlyGroup.reduce((a, b) => a + b.score, 0),
            nightLateGroup.reduce((a, b) => a + b.score, 0)
          )
        },
        { period: 'evening' as const, group: eveningGroup, weight: eveningGroup.reduce((a, b) => a + b.score, 0) },
        { period: 'day' as const, group: dayGroup, weight: dayGroup.reduce((a, b) => a + b.score, 0) }
      ].filter((c) => c.group.length > 0);

      counts.sort((a, b) => b.weight - a.weight);
      if (counts.length > 0) {
        period = counts[0].period;
        dominantGroup = counts[0].group;
      }
    }

    // Beregn værdier for den dominerende tågegruppe
    let avgSpread = 0;
    let avgHumidity = 0;
    let avgWind = 0;
    let minVisibility = 99999;
    let hasFogWeatherCode = false;
    let avgLowClouds = 0;
    let totalScore = 0;

    dominantGroup.forEach((item) => {
      const h = item.item;
      avgSpread += h.spread;
      avgHumidity += h.humidity;
      avgWind += h.windSpeed;
      avgLowClouds += h.cloudLow || 0;
      if (h.visibility < minVisibility) minVisibility = h.visibility;
      if (h.weatherCode === 45 || h.weatherCode === 48) hasFogWeatherCode = true;
      totalScore += item.score;
    });

    avgSpread /= dominantGroup.length;
    avgHumidity /= dominantGroup.length;
    avgWind /= dominantGroup.length;
    avgLowClouds /= dominantGroup.length;
    const finalScore = Math.min(100, Math.round(totalScore / dominantGroup.length));
    const minVisKm = (minVisibility / 1000).toFixed(1);

    // Fastlæg start- og sluttidspunkt samt timeWindowLabel
    let startTime: Date | null = null;
    let endTime: Date | null = null;
    let timeWindowLabel = '';

    const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

    if (period === 'all_day') {
      startTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0);
      endTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 23, 59, 59);
      timeWindowLabel = 'Heldagståge (døgnet rundt)';
    } else if (period === 'night') {
      const nightLate = dominantGroup.filter((h) => h.hour >= 18);
      const nightEarly = dominantGroup.filter((h) => h.hour < 12);
      if (nightLate.length > 0 && nightEarly.length > 0) {
        const sH = Math.min(...nightLate.map((h) => h.hour));
        const eH = Math.max(...nightEarly.map((h) => h.hour));
        startTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), sH, 0, 0);
        endTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1, eH + 1, 0, 0);
        timeWindowLabel = `kl. ${pad(sH)}:00 - ${pad(eH + 1)}:00 (i nat)`;
      } else {
        const hours = dominantGroup.map((h) => h.hour);
        const sH = Math.min(...hours);
        const eH = Math.max(...hours);
        startTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), sH, 0, 0);
        endTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), eH + 1, 0, 0);
        timeWindowLabel = `kl. ${pad(sH)}:00 - ${pad(eH + 1)}:00 (i nat)`;
      }
    } else if (period === 'morning') {
      const hours = dominantGroup.map((h) => h.hour);
      const sH = Math.min(...hours);
      const eH = Math.max(...hours);
      startTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), sH, 0, 0);
      endTime = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        Math.max(eH + 1, (sun.sunrise?.getHours() || 6) + 1),
        0,
        0
      );
      timeWindowLabel = `ca. ${pad(sH)}:00 - ${pad(eH + 1)}:00`;
    } else {
      const hours = dominantGroup.map((h) => h.hour);
      const sH = Math.min(...hours);
      const eH = Math.max(...hours);
      startTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), sH, 0, 0);
      endTime = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), eH + 1, 0, 0);
      timeWindowLabel = `kl. ${pad(sH)}:00 - ${pad(eH + 1)}:00`;
    }

    // Tæt tåge vs Morgendis/slør
    const isDenseFog =
      hasFogWeatherCode ||
      minVisibility <= 1200 ||
      (avgHumidity >= 96 && avgSpread <= 0.6 && avgLowClouds >= 60) ||
      (avgHumidity >= 93 && avgSpread <= 0.8 && avgWind >= 2.5);

    const level = finalScore >= 75 ? 'Meget høj' : finalScore >= 55 ? 'Høj' : 'Moderat';
    const classType = finalScore >= 55 ? 'high' : 'moderate';

    // Kontekstuelt indhold og rådgivning baseret på døgnperiode
    let typeName = 'Morgentåge & Dis';
    let icon = '🌫️';
    let typeBadge = 'Tæt tåge';
    let badgeClass = 'badge-dense-fog';
    let text = '';
    let photoTip = '';

    if (period === 'night') {
      typeName = isDenseFog ? 'Tæt Nattåge' : 'Nattåge & Slør';
      icon = '🌃';
      badgeClass = 'badge-night-fog';
      typeBadge = isDenseFog ? 'Nattåge' : 'Natslør';
      text =
        minVisibility < 1000
          ? `Tæt tåge over natten (${timeWindowLabel}, sigtdybde ca. ${Math.round(minVisibility)}m). Gadelygter og billygter skaber markante lyskegler.`
          : `Tågeslør lægger sig over natten (${timeWindowLabel}). Høj stemning med lysspredning fra gadelygter.`;
      photoTip =
        'Magiske forhold for nat- og gadefotografering! Gadelygter, neonskilte og billygter danner filmiske lyskegler (volumetrisk lys) og en stemningsfuld noir-æstetik på tomme gader og stier.';
    } else if (period === 'all_day') {
      typeName = 'Massiv Heldagståge';
      icon = '🌫️';
      badgeClass = 'badge-all-day';
      typeBadge = 'Heldagståge';
      text = `Massiv tåge dækker hele døgnet (${timeWindowLabel}) med markant nedsat sigtbarhed (${minVisKm} km). Solen forbliver skjult.`;
      photoTip =
        'Heldags-mulighed for melankolske og grafiske serier. Gå efter ensomme træer, strukturer i tågen og minimalistiske kompositioner med en markant forgrund.';
    } else if (period === 'day') {
      typeName = isDenseFog ? 'Tæt Dagståge / Havgus' : 'Dagdis & Slør';
      icon = '🌁';
      badgeClass = 'badge-day-fog';
      typeBadge = isDenseFog ? 'Dagståge / Havgus' : 'Dagdis';
      text = `Tåge og nedsat sigtbarhed midt på dagen (${timeWindowLabel}). Det diffuse dagslys udvisker baggrunde og fjerner hårde skygger.`;
      photoTip =
        'Perfekt til minimalistisk fotografi, kystlandskaber og rå arkitektur. Det bløde, skyggefrie lys fremhæver former og silhuetter frem for tekstur.';
    } else if (period === 'evening') {
      typeName = isDenseFog ? 'Tæt Aftentåge' : 'Aftentåge & Skumring';
      icon = '🌆';
      badgeClass = 'badge-dense-fog';
      typeBadge = isDenseFog ? 'Tæt aftentåge' : 'Aftendis';
      text = `Tågen trækker ind omkring solnedgang og aften (${timeWindowLabel}). Skumringens blå time blandes med tågens bløde lysdække.`;
      photoTip =
        'Udnyt samspillet mellem det blå skumringslys (den blå time) og tågens spredning af de første tændte vindues- og gadelamper til flotte farvekontraster.';
    } else {
      // morning
      const sunriseInfo = sun.sunrise ? ` ved daggry og solopgang kl. ${TimeService.formatTime(sun.sunrise)}` : ' ved daggry';
      if (isDenseFog) {
        typeName = 'Tæt Morgentåge';
        icon = '🌫️';
        badgeClass = 'badge-dense-fog';
        typeBadge = minVisibility < 1000 ? `Tæt tåge (sigt ${Math.round(minVisibility)}m)` : 'Massiv tåge';
        text =
          minVisibility < 1000
            ? `Massiv og tæt tåge dækker landskabet${sunriseInfo} (${timeWindowLabel}, sigtdybde ca. ${Math.round(minVisibility)}m). Tykt dække hvor solen næppe trænger igennem.`
            : `Massiv og tæt morgentåge (${timeWindowLabel})${sunriseInfo} med dæmpet, diffust lys.`;
        photoTip =
          `Fokusér på minimalistiske kompositioner, grafiske træer, ensomme strukturer og silhuetter under daggry${sun.sunrise ? ` og solopgang kl. ${TimeService.formatTime(sun.sunrise)}` : ''} før solen bryder igennem.`;
      } else {
        typeName = 'Morgendis & Jordtåge';
        icon = finalScore >= 75 ? '🌫️' : '🌁';
        badgeClass = 'badge-radiation-mist';
        typeBadge = 'Morgendis / Mosekonebryg';
        text =
          finalScore >= 75
            ? `Perfekte betingelser for eventyrlig morgendis over enge og vand${sunriseInfo} (${timeWindowLabel})! Høj chance for gyldne solstråler (god rays).`
            : `Gode chancer for stemningsfuld morgendis og lav jordtåge (${timeWindowLabel})${sunriseInfo} med smuk lagdelt dybde ved solopgang.`;
        photoTip =
          'Stil dig i modlys mod solopgangen for at fange gyldne lysstråler (god rays) igennem trækroner eller det lave slør over søer og marker.';
      }
    }

    return {
      score: finalScore,
      level,
      text,
      icon,
      classType,
      fogType: isDenseFog ? 'dense_fog' : 'radiation_mist',
      typeName,
      typeBadge,
      badgeClass,
      photoTip,
      period,
      timeWindowLabel,
      startTime,
      endTime,
      avgSpread: avgSpread.toFixed(1),
      avgHumidity: Math.round(avgHumidity),
      avgWind: avgWind.toFixed(1),
      minVisibilityKm: minVisKm
    };
  }

  public static calculateGoldenHourQuality(hourly: HourlyWeather[], _hourWindow: any, sunEventTime: Date | null): any {
    if (!hourly || !sunEventTime) {
      return { score: 50, text: 'Middel betingelser', cloudsDesc: 'Normalt skydække', clouds: { total: 50, low: 20, mid: 20, high: 20 } };
    }

    const targetH = sunEventTime.getHours();
    const matchHour = hourly.find((h) => h.hour === targetH) || hourly[targetH] || hourly[0];

    const total = matchHour.cloudTotal;
    const low = matchHour.cloudLow;
    const mid = matchHour.cloudMid;
    const high = matchHour.cloudHigh;

    let score = 50;
    let text = 'Pænt lys';
    let icon = '☀️';

    if (low >= 70 || (total >= 85 && low + mid >= 80)) {
      score = 20;
      text = 'Tungt lavt skydække blokerer for direkte sollys og gylden glød';
      icon = '☁️';
    } else if (total >= 75) {
      score = 35;
      text = 'Overvejende overskyet – diffust og dæmpet lys ved horisonten';
      icon = '☁️';
    } else if (total <= 15) {
      score = 85;
      text = 'Klar himmel – rent gyldent lys og skarpe lange skygger';
      icon = '🌅';
    } else if (low <= 30 && mid + high >= 30 && mid + high <= 75) {
      score = 95;
      text = 'Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel';
      icon = '🔥';
    } else if (total <= 50) {
      score = 75;
      text = 'Gode forhold med dynamiske lysstriber gennem spredte skyer';
      icon = '🌤️';
    } else {
      score = 45;
      text = 'Vekslende skydække med diffuse lysforhold';
      icon = '⛅';
    }

    return {
      score,
      text,
      icon,
      clouds: { total, low, mid, high }
    };
  }

  public static calculateAstroScore(
    hourly: HourlyWeather[],
    sun: SunTimes,
    moon: MoonIllumination,
    lat: number,
    lng: number,
    date: Date,
    nextDayMorningHourly?: HourlyWeather[]
  ): any {
    const hasAstroNight = sun.astronomicalDusk && sun.astronomicalDawn;
    // Kombinér aftentimerne (kl. 22-23 på dag N) med morgentimerne (kl. 00-04 på dag N+1, hvis tilgængelige)
    let nightHours: HourlyWeather[];
    if (nextDayMorningHourly && nextDayMorningHourly.length > 0) {
      nightHours = [
        ...hourly.filter((h) => h.hour >= 22),
        ...nextDayMorningHourly.filter((h) => h.hour <= 4)
      ];
    } else {
      nightHours = hourly.filter((h) => h.hour >= 22 || h.hour <= 4);
    }
    if (nightHours.length === 0) nightHours = hourly.slice(0, 4);

    let avgClouds = 0;
    let avgLowClouds = 0;
    nightHours.forEach((h) => {
      avgClouds += h.cloudTotal;
      avgLowClouds += h.cloudLow;
    });
    avgClouds /= nightHours.length;
    avgLowClouds /= nightHours.length;
    const roundClouds = Math.round(avgClouds);

    let moonUpHours = 0;
    nightHours.forEach((h) => {
      const d = new Date(date.getFullYear(), date.getMonth(), date.getDate() + (h.hour <= 4 ? 1 : 0), h.hour, 0, 0);
      try {
        const pos = AstroCore.getMoonPosition(d, lat, lng);
        if (pos && pos.altitude > 0) {
          moonUpHours++;
        }
      } catch (e) {}
    });

    let points = 100;
    if (roundClouds <= 10) points -= roundClouds * 0.5;
    else if (roundClouds <= 30) points -= 5 + (roundClouds - 10) * 1.0;
    else if (roundClouds <= 60) points -= 25 + (roundClouds - 30) * 1.5;
    else points -= 70 + (roundClouds - 60) * 0.7;

    points -= avgLowClouds * 0.25;

    let moonImpact = '';
    if (moonUpHours === 0) {
      moonImpact = 'Månen er under horisonten hele natten (ingen måneforstyrrelse)';
    } else if (moon.fraction <= 15) {
      moonImpact = `Nymåne / ultrasvagt segl (${moon.fraction}%) – intet generende måneskin`;
    } else if (moon.fraction <= 45) {
      points -= Math.round((moon.fraction / 100) * 15);
      moonImpact = `Svag månefase (${moon.fraction}%) – kun moderat lyspåvirkning`;
    } else {
      points -= Math.round((moon.fraction / 100) * 35);
      moonImpact = `Kraftigt måneskin (${moon.fraction}%) oplyser natten og udvisker svage stjerner`;
    }

    if (!hasAstroNight) {
      points = Math.min(points, 50);
      moonImpact += ' • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke';
    }

    const finalScore = Math.min(100, Math.max(0, Math.round(points)));

    let status = 'Ugunstig';
    let icon = '☁️';
    let text = '';

    if (roundClouds >= 75) {
      status = 'Ugunstig';
      icon = '☁️';
      text = `Tæt skydække (${roundClouds}%) dækker himlen i nat.`;
    } else if (roundClouds >= 50) {
      status = 'Svag';
      icon = '⛅';
      text = `Overvejende skyet (${roundClouds}%). Kun spredte kighuller til enkelte klare stjerner.`;
    } else if (roundClouds >= 25) {
      status = 'Moderat';
      icon = '✨';
      text = `Gode observationsforhold med lette slørskyer (${roundClouds}%).`;
    } else {
      status = 'Fremragende';
      icon = '🌌';
      text = `Krystalklar nattehimmel (${roundClouds}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`;
    }

    return {
      score: finalScore,
      status,
      icon,
      text,
      roundClouds,
      moonImpact
    };
  }

  public static getWeatherCodeDescription(code: number): { desc: string; icon: string } {
    switch (code) {
      case 0: return { desc: 'Klar himmel / Skyfrit', icon: '☀️' };
      case 1: return { desc: 'Hovedsageligt klart', icon: '🌤️' };
      case 2: return { desc: 'Delvist skyet', icon: '⛅' };
      case 3: return { desc: 'Overskyet', icon: '☁️' };
      case 45: return { desc: 'Tåge', icon: '🌫️' };
      case 48: return { desc: 'Rimtåge', icon: '🌫️' };
      case 51: return { desc: 'Let støvregn', icon: '🌦️' };
      case 53: return { desc: 'Moderat støvregn', icon: '🌧️' };
      case 55: return { desc: 'Tæt støvregn', icon: '🌧️' };
      case 61: return { desc: 'Let regn', icon: '🌦️' };
      case 63: return { desc: 'Moderat regn', icon: '🌧️' };
      case 65: return { desc: 'Kraftig regn', icon: '🌧️' };
      case 71: return { desc: 'Let snefald', icon: '🌨️' };
      case 73: return { desc: 'Moderat snefald', icon: '❄️' };
      case 75: return { desc: 'Kraftigt snefald', icon: '❄️' };
      case 80: return { desc: 'Lette regnbyger', icon: '🌦️' };
      case 81: return { desc: 'Moderate regnbyger', icon: '🌧️' };
      case 82: return { desc: 'Voldsomme regnbyger', icon: '⛈️' };
      case 95: return { desc: 'Tordenvejr', icon: '⛈️' };
      default: return { desc: 'Vekslende vejr', icon: '🌤️' };
    }
  }

  /**
   * Beregner tidsstatus for en fotobegivenhed (aktiv, passeret, kommende, fremtidig)
   * Tydeliggør hvornår et fotovindue er overskredet så brugeren ikke er i tvivl om dag/tid
   */
  public static getEventTiming(
    startTime: Date | null,
    endTime: Date | null,
    dayIndex: number,
    dayDate: Date,
    eventType: 'fog' | 'morning' | 'evening' | 'astro',
    score: number = 50,
    referenceNow?: Date
  ): EventTiming {
    const now = referenceNow || TimeService.getDate() || new Date();
    const dayNamesFull = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const quality = typeof score === 'number' ? score : 50;

    // I dag (dag 0)
    if (dayIndex === 0) {
      // 1. Aktiv lige nu
      if (startTime && endTime && now >= startTime && now <= endTime) {
        const remainingMs = endTime.getTime() - now.getTime();
        const durationStr = TimeService.formatDuration(remainingMs);

        let bannerClass = 'banner-active';
        let icon = '🟢';
        let pill = 'Aktiv nu';
        let label = `Aktiv lige nu • Slutter om ${durationStr}`;
        let sub = `Aktiv lige nu (slutter kl. ${TimeService.formatTime(endTime)})`;

        if (eventType === 'astro') {
          if (quality >= 65) {
            bannerClass = 'banner-active';
            icon = '✨';
            pill = 'Aktiv nu';
            label = `Gode stjerneforhold nu • Slutter om ${durationStr}`;
            sub = `Astronomisk nat aktiv lige nu (slutter kl. ${TimeService.formatTime(endTime)})`;
          } else if (quality >= 40) {
            bannerClass = 'banner-active-moderate';
            icon = '⛅';
            pill = 'Moderat nu';
            label = `Astronomisk nat aktiv • Vekslende skydække (slutter om ${durationStr})`;
            sub = `Mørke i gang (kl. ${TimeService.formatTime(endTime)}) • Skiftende skyer`;
          } else {
            bannerClass = 'banner-active-poor';
            icon = '☁️';
            pill = 'Overskyet nu';
            label = `Astronomisk nat er i gang • Desværre overskyet (slutter om ${durationStr})`;
            sub = `Mørke i gang (kl. ${TimeService.formatTime(endTime)}) • Dækket af skyer`;
          }
        } else if (eventType === 'fog') {
          if (quality >= 55) {
            bannerClass = 'banner-active';
            icon = '🌫️';
            pill = 'Aktiv nu';
            label = `Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${durationStr})`;
            sub = `Tågevindue aktivt lige nu (slutter kl. ${TimeService.formatTime(endTime)})`;
          } else if (quality >= 35) {
            bannerClass = 'banner-active-moderate';
            icon = '🌁';
            pill = 'Moderat nu';
            label = `Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${durationStr})`;
            sub = `Tidsvindue aktivt (slutter kl. ${TimeService.formatTime(endTime)})`;
          } else {
            bannerClass = 'banner-active-poor';
            icon = '☀️';
            pill = 'Klar sigt';
            label = `Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${durationStr})`;
            sub = `Morgenstund i gang (slutter kl. ${TimeService.formatTime(endTime)}) • Ingen tåge`;
          }
        } else if (eventType === 'morning') {
          if (quality >= 65) {
            bannerClass = 'banner-active';
            icon = '🌅';
            pill = 'Aktiv nu';
            label = `Gylden time aktiv lige nu • Flot morgenlys (slutter om ${durationStr})`;
            sub = `Daggry i gang nu (slutter kl. ${TimeService.formatTime(endTime)})`;
          } else if (quality >= 40) {
            bannerClass = 'banner-active-moderate';
            icon = '🌤️';
            pill = 'Vekslende nu';
            label = `Morgenlys aktivt nu • Vekslende skydække (slutter om ${durationStr})`;
            sub = `Morgenlys i gang (slutter kl. ${TimeService.formatTime(endTime)})`;
          } else {
            bannerClass = 'banner-active-poor';
            icon = '☁️';
            pill = 'Overskyet nu';
            label = `Morgentime i gang • Solen skjult af skydække (slutter om ${durationStr})`;
            sub = `Morgenlys i gang, men dækket af skyer`;
          }
        } else if (eventType === 'evening') {
          if (quality >= 65) {
            bannerClass = 'banner-active';
            icon = '🌆';
            pill = 'Aktiv nu';
            label = `Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${durationStr})`;
            sub = `Aktiv solnedgang lige nu (slutter kl. ${TimeService.formatTime(endTime)})`;
          } else if (quality >= 40) {
            bannerClass = 'banner-active-moderate';
            icon = '🌤️';
            pill = 'Moderat nu';
            label = `Aftenlys i gang • Vekslende skydække (slutter om ${durationStr})`;
            sub = `Solnedgang i gang (slutter kl. ${TimeService.formatTime(endTime)})`;
          } else {
            bannerClass = 'banner-active-poor';
            icon = '☁️';
            pill = 'Overskyet nu';
            label = `Solnedgang i gang • Skjult bag tungt skydække (slutter om ${durationStr})`;
            sub = `Solnedgang i gang, men skjult bag skyer`;
          }
        }

        return {
          status: 'active',
          bannerClass,
          icon,
          pill,
          label,
          sub,
          isPassed: false
        };
      }

      // 2. Passeret tidligere i dag
      if (endTime && now > endTime) {
        const elapsedMs = now.getTime() - endTime.getTime();
        const elapsedStr = TimeService.formatDuration(elapsedMs);
        let label = `I morges • For ${elapsedStr} siden`;
        let sub = `Afsluttet i morges (for ${elapsedStr} siden)`;

        if (eventType === 'fog') {
          label = `Tågevindue afsluttet • For ${elapsedStr} siden`;
          sub = `Afsluttet kl. ${TimeService.formatTime(endTime)} (for ${elapsedStr} siden)`;
        } else if (eventType === 'evening') {
          label = `I aften • For ${elapsedStr} siden`;
          sub = `Afsluttet i aften kl. ${TimeService.formatTime(endTime)}`;
        } else if (eventType === 'astro') {
          label = 'Natten er ovre';
          sub = `Astronomisk nat afsluttet kl. ${TimeService.formatTime(endTime)}`;
        }

        return {
          status: 'passed',
          bannerClass: 'banner-passed',
          icon: '⏳',
          pill: 'Passeret',
          label,
          sub,
          isPassed: true
        };
      }

      // 3. Kommende senere i dag
      if (startTime && now < startTime) {
        const untilMs = startTime.getTime() - now.getTime();
        const untilStr = TimeService.formatDuration(untilMs);
        let label = `I dag • Om ${untilStr}`;
        let sub = `Starter kl. ${TimeService.formatTime(startTime)} (om ${untilStr})`;

        if (eventType === 'evening') {
          label = quality >= 65
            ? `I aften • Om ${untilStr} (flot aftenlys)`
            : `I aften • Om ${untilStr}`;
          sub = `Starter i aften kl. ${TimeService.formatTime(startTime)} (om ${untilStr})`;
        } else if (eventType === 'astro') {
          label = quality >= 65
            ? `I aften/nat • Om ${untilStr} (klare stjerneforhold)`
            : quality <= 35
              ? `I aften/nat • Om ${untilStr} (forventet overskyet)`
              : `I aften/nat • Om ${untilStr}`;
          sub = `Astronomisk nat starter kl. ${TimeService.formatTime(startTime)} (om ${untilStr})`;
        } else if (eventType === 'fog') {
          label = `Tågevindue senere i dag • Om ${untilStr}`;
          sub = `Forventes kl. ${TimeService.formatTime(startTime)} (om ${untilStr})`;
        } else if (eventType === 'morning') {
          label = `I dag ved daggry • Om ${untilStr}`;
        }

        return {
          status: 'upcoming',
          bannerClass: 'banner-upcoming',
          icon: '⏱️',
          pill: 'Kommende',
          label,
          sub,
          isPassed: false
        };
      }
    }

    // I morgen (dag 1)
    if (dayIndex === 1) {
      const untilMs = startTime ? Math.max(0, startTime.getTime() - now.getTime()) : 0;
      const untilStr = TimeService.formatDuration(untilMs);
      let label = `I morgen • Om ${untilStr}`;
      let sub = `I morgen kl. ${startTime ? TimeService.formatTime(startTime) : '--:--'}`;

      if (eventType === 'fog') {
        label = `Tågevindue i morgen • Om ${untilStr}`;
        sub = `I morgen kl. ${TimeService.formatTime(startTime)} (om ${untilStr})`;
      } else if (eventType === 'morning') {
        label = `I morgen tidlig • Om ${untilStr}`;
        sub = `I morgen kl. ${TimeService.formatTime(startTime)} (om ${untilStr})`;
      } else if (eventType === 'evening') {
        label = `I morgen aften • Om ${untilStr}`;
        sub = `I morgen kl. ${TimeService.formatTime(startTime)} (om ${untilStr})`;
      } else if (eventType === 'astro') {
        label = `I morgen nat • Om ${untilStr}`;
        sub = `I morgen nat fra kl. ${TimeService.formatTime(startTime)}`;
      }

      return {
        status: 'future',
        bannerClass: 'banner-future',
        icon: '📅',
        pill: 'I morgen',
        label,
        sub,
        isPassed: false
      };
    }

    // Dag 2-6 (fremtid)
    const dayName = dayNamesFull[dayDate.getDay()];
    let label = `${dayName} • Om ${dayIndex} dage`;
    let sub = `${dayName}`;

    if (eventType === 'fog') {
      label = `${dayName} • Om ${dayIndex} dage`;
      sub = `${dayName} kl. ${startTime ? TimeService.formatTime(startTime) : '--:--'}`;
    } else if (eventType === 'morning') {
      label = `${dayName} morgen • Om ${dayIndex} dage`;
      sub = `${dayName} kl. ${startTime ? TimeService.formatTime(startTime) : '06:00'}`;
    } else if (eventType === 'evening') {
      label = `${dayName} aften • Om ${dayIndex} dage`;
      sub = `${dayName} kl. ${startTime ? TimeService.formatTime(startTime) : '18:00'}`;
    } else if (eventType === 'astro') {
      label = `${dayName} nat • Om ${dayIndex} dage`;
      sub = `${dayName} nat`;
    }

    return {
      status: 'future-distant',
      bannerClass: 'banner-future',
      icon: '📅',
      pill: dayName,
      label,
      sub,
      isPassed: false
    };
  }
}
