import { describe, it, expect } from 'vitest';
import { WeatherEngine, HourlyWeather } from '../src/modules/weather/calculations/weather-engine.ts';
import { AstroCore } from '../src/shared/astronomy/AstroCore.ts';

describe('WeatherEngine - Fotografiske vurderingsmodeller', () => {
  const dummySun = AstroCore.getSunTimes(new Date('2026-06-21T12:00:00Z'), 55.67, 12.56);

  it('Beregner høj tågerisiko ved minimal dugpunktsforskel, høj fugtighed og lav vind', () => {
    const foggyHours: HourlyWeather[] = [
      {
        time: '2026-06-21T03:00',
        hour: 3,
        temp: 10.2,
        apparentTemp: 10.2,
        humidity: 98,
        dewPoint: 10.0,
        spread: 0.2,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 45, // Tåge
        weatherDesc: 'Tåge',
        weatherIcon: '🌫️',
        cloudTotal: 20,
        cloudLow: 10,
        cloudMid: 0,
        cloudHigh: 10,
        visibility: 800,
        windSpeed: 1.2,
        windDir: 180,
        windGusts: 2.0
      },
      {
        time: '2026-06-21T04:00',
        hour: 4,
        temp: 9.8,
        apparentTemp: 9.8,
        humidity: 99,
        dewPoint: 9.6,
        spread: 0.2,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 45,
        weatherDesc: 'Tåge',
        weatherIcon: '🌫️',
        cloudTotal: 10,
        cloudLow: 10,
        cloudMid: 0,
        cloudHigh: 0,
        visibility: 600,
        windSpeed: 0.8,
        windDir: 180,
        windGusts: 1.5
      }
    ];

    const fogRes = WeatherEngine.calculateFogRisk(foggyHours, dummySun);
    expect(fogRes.score).toBeGreaterThanOrEqual(75);
    expect(fogRes.classType).toBe('high');
    expect(fogRes.level).toBe('Meget høj');
    expect(fogRes.fogType).toBe('dense_fog');
    expect(fogRes.typeName).toBe('Tæt Morgentåge');
    expect(fogRes.photoTip).toContain('minimalistiske');
  });

  it('Registrerer og vejleder korrekt om nattåge med gadelygter og filmisk lys', () => {
    const nightFogHours: HourlyWeather[] = [
      {
        time: '2026-06-21T00:00',
        hour: 0,
        temp: 12.0,
        apparentTemp: 12.0,
        humidity: 98,
        dewPoint: 11.8,
        spread: 0.2,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 45,
        weatherDesc: 'Tåge',
        weatherIcon: '🌫️',
        cloudTotal: 40,
        cloudLow: 40,
        cloudMid: 0,
        cloudHigh: 0,
        visibility: 400,
        windSpeed: 1.5,
        windDir: 180,
        windGusts: 2.0
      },
      {
        time: '2026-06-21T01:00',
        hour: 1,
        temp: 11.5,
        apparentTemp: 11.5,
        humidity: 98,
        dewPoint: 11.3,
        spread: 0.2,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 45,
        weatherDesc: 'Tåge',
        weatherIcon: '🌫️',
        cloudTotal: 40,
        cloudLow: 40,
        cloudMid: 0,
        cloudHigh: 0,
        visibility: 300,
        windSpeed: 1.2,
        windDir: 180,
        windGusts: 1.8
      }
    ];

    const nightRes = WeatherEngine.calculateFogRisk(nightFogHours, dummySun);
    expect(nightRes.score).toBeGreaterThanOrEqual(75);
    expect(nightRes.period).toBe('night');
    expect(nightRes.typeName).toBe('Tæt Nattåge');
    expect(nightRes.icon).toBe('🌃');
    expect(nightRes.badgeClass).toBe('badge-night-fog');
    expect(nightRes.photoTip).toContain('Gadelygter');
  });

  it('Registrerer dagståge / havgus midt på dagen', () => {
    const dayFogHours: HourlyWeather[] = [
      {
        time: '2026-06-21T12:00',
        hour: 12,
        temp: 14.0,
        apparentTemp: 14.0,
        humidity: 97,
        dewPoint: 13.8,
        spread: 0.2,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 45,
        weatherDesc: 'Tåge',
        weatherIcon: '🌫️',
        cloudTotal: 100,
        cloudLow: 100,
        cloudMid: 0,
        cloudHigh: 0,
        visibility: 500,
        windSpeed: 3.5,
        windDir: 270,
        windGusts: 4.5
      },
      {
        time: '2026-06-21T13:00',
        hour: 13,
        temp: 14.2,
        apparentTemp: 14.2,
        humidity: 96,
        dewPoint: 13.9,
        spread: 0.3,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 45,
        weatherDesc: 'Tåge',
        weatherIcon: '🌫️',
        cloudTotal: 100,
        cloudLow: 100,
        cloudMid: 0,
        cloudHigh: 0,
        visibility: 400,
        windSpeed: 4.0,
        windDir: 270,
        windGusts: 5.0
      }
    ];

    const dayRes = WeatherEngine.calculateFogRisk(dayFogHours, dummySun);
    expect(dayRes.period).toBe('day');
    expect(dayRes.typeName).toContain('Dagståge');
    expect(dayRes.typeBadge).toContain('Havgus');
  });

  it('Klassificerer korrekt strålingståge / morgendis når sigtbarheden er over 1 km og luften er stille', () => {
    const radiationMistHours: HourlyWeather[] = [
      {
        time: '2026-06-21T03:00',
        hour: 3,
        temp: 11.0,
        apparentTemp: 11.0,
        humidity: 92,
        dewPoint: 10.2,
        spread: 0.8,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 2, // Ingen direkte tågekode
        weatherDesc: 'Let skyet',
        weatherIcon: '⛅',
        cloudTotal: 10,
        cloudLow: 10,
        cloudMid: 0,
        cloudHigh: 0,
        visibility: 3000, // 3 km sigt = dis, ikke massiv tåge
        windSpeed: 1.0,
        windDir: 90,
        windGusts: 1.5
      },
      {
        time: '2026-06-21T04:00',
        hour: 4,
        temp: 10.5,
        apparentTemp: 10.5,
        humidity: 94,
        dewPoint: 10.0,
        spread: 0.5,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 2,
        weatherDesc: 'Let skyet',
        weatherIcon: '⛅',
        cloudTotal: 5,
        cloudLow: 5,
        cloudMid: 0,
        cloudHigh: 0,
        visibility: 2500,
        windSpeed: 0.9,
        windDir: 90,
        windGusts: 1.2
      }
    ];

    const mistRes = WeatherEngine.calculateFogRisk(radiationMistHours, dummySun);
    expect(mistRes.score).toBeGreaterThanOrEqual(60);
    expect(mistRes.fogType).toBe('radiation_mist');
    expect(mistRes.typeName).toBe('Morgendis & Jordtåge');
    expect(mistRes.photoTip).toContain('modlys');
  });

  it('Beregner fremragende solnedgangskvalitet med høje/mellemskyer og fri forgrund', () => {
    const sunsetHours: HourlyWeather[] = [
      {
        time: '2026-06-21T21:00',
        hour: 21,
        temp: 18.0,
        apparentTemp: 18.0,
        humidity: 60,
        dewPoint: 10.0,
        spread: 8.0,
        precipProb: 0,
        precipMm: 0,
        weatherCode: 2,
        weatherDesc: 'Delvist skyet',
        weatherIcon: '⛅',
        cloudTotal: 45,
        cloudLow: 15,
        cloudMid: 30,
        cloudHigh: 40,
        visibility: 25000,
        windSpeed: 3.0,
        windDir: 220,
        windGusts: 4.5
      }
    ];

    const sunsetEvent = new Date('2026-06-21T21:55:00Z');
    const goldenRes = WeatherEngine.calculateGoldenHourQuality(sunsetHours, null, sunsetEvent);
    expect(goldenRes.score).toBeGreaterThanOrEqual(75);
  });

  it('Oversætter WMO vejrkoder til korrekte danske termer og ikoner', () => {
    expect(WeatherEngine.getWeatherCodeDescription(0).desc).toBe('Klar himmel / Skyfrit');
    expect(WeatherEngine.getWeatherCodeDescription(45).desc).toBe('Tåge');
    expect(WeatherEngine.getWeatherCodeDescription(63).desc).toBe('Moderat regn');
    expect(WeatherEngine.getWeatherCodeDescription(95).desc).toBe('Tordenvejr');
  });

  it('Beregner Astro-score ved at kombinere aftentimer (22-23) med næste dags morgentimer (00-04)', () => {
    const makeHour = (hour: number, cloudTotal: number): HourlyWeather => ({
      time: `2026-10-21T${String(hour).padStart(2, '0')}:00`,
      hour,
      temp: 8,
      apparentTemp: 7,
      humidity: 70,
      dewPoint: 3,
      spread: 5,
      precipProb: 0,
      precipMm: 0,
      weatherCode: 0,
      weatherDesc: 'Klar himmel / Skyfrit',
      weatherIcon: '☀️',
      cloudTotal,
      cloudLow: cloudTotal,
      cloudMid: 0,
      cloudHigh: 0,
      visibility: 20000,
      windSpeed: 2,
      windDir: 180,
      windGusts: 3
    });

    // Dag N havde overskyet morgen (00-04 = 100%), men stjerneklar aften (22-23 = 0%)
    const dayNHourly: HourlyWeather[] = [
      makeHour(0, 100),
      makeHour(1, 100),
      makeHour(2, 100),
      makeHour(3, 100),
      makeHour(4, 100),
      makeHour(22, 0),
      makeHour(23, 0)
    ];

    // Dag N+1 har stjerneklar nat efter midnat (00-04 = 0%)
    const nextDayMorningHourly: HourlyWeather[] = [
      makeHour(0, 0),
      makeHour(1, 0),
      makeHour(2, 0),
      makeHour(3, 0),
      makeHour(4, 0)
    ];

    const dateObj = new Date('2026-10-21T12:00:00Z');
    const octSun = AstroCore.getSunTimes(dateObj, 55.67, 12.56);
    const moon = { phase: 0.02, fraction: 2, name: 'Nymåne', icon: '🌑' };

    const astroScore = WeatherEngine.calculateAstroScore(
      dayNHourly,
      octSun,
      moon,
      55.67,
      12.56,
      dateObj,
      nextDayMorningHourly
    );

    expect(astroScore.roundClouds).toBe(0);
    expect(astroScore.score).toBeGreaterThanOrEqual(85);
    expect(astroScore.text).toContain('0%');
  });

  describe('WeatherEngine - Tidshåndtering og overskredne tidspunkter (getEventTiming)', () => {
    const today = new Date('2026-10-21T14:00:00');

    it('Marker begivenhed som passeret når sluttidspunkt er overskredet tidligere i dag', () => {
      const mornStart = new Date('2026-10-21T06:30:00');
      const mornEnd = new Date('2026-10-21T07:45:00');

      const timing = WeatherEngine.getEventTiming(mornStart, mornEnd, 0, today, 'morning', 80, today);

      expect(timing.isPassed).toBe(true);
      expect(timing.status).toBe('passed');
      expect(timing.bannerClass).toBe('banner-passed');
      expect(timing.pill).toBe('Passeret');
      expect(timing.label).toContain('I morges • For');
      expect(timing.label).toContain('siden');
    });

    it('Marker aftenbegivenhed som passeret når aftenlys er forbi', () => {
      const eveningEnd = new Date('2026-10-21T19:00:00');
      const lateEvening = new Date('2026-10-21T21:30:00');

      const timing = WeatherEngine.getEventTiming(
        new Date('2026-10-21T18:00:00'),
        eveningEnd,
        0,
        today,
        'evening',
        75,
        lateEvening
      );

      expect(timing.isPassed).toBe(true);
      expect(timing.status).toBe('passed');
      expect(timing.pill).toBe('Passeret');
      expect(timing.label).toContain('I aften • For');
    });

    it('Marker begivenhed som aktiv lige nu når aktuel tid er i intervallet', () => {
      const start = new Date('2026-10-21T13:30:00');
      const end = new Date('2026-10-21T14:30:00');

      const timing = WeatherEngine.getEventTiming(start, end, 0, today, 'fog', 60, today);

      expect(timing.isPassed).toBe(false);
      expect(timing.status).toBe('active');
      expect(timing.pill).toBe('Aktiv nu');
      expect(timing.label).toContain('slutter om 30 min');
    });

    it('Marker begivenhed som kommende når starttidspunkt er senere i dag', () => {
      const sunsetStart = new Date('2026-10-21T17:45:00');
      const sunsetEnd = new Date('2026-10-21T18:45:00');

      const timing = WeatherEngine.getEventTiming(sunsetStart, sunsetEnd, 0, today, 'evening', 80, today);

      expect(timing.isPassed).toBe(false);
      expect(timing.status).toBe('upcoming');
      expect(timing.pill).toBe('Kommende');
      expect(timing.label).toContain('I aften • Om');
    });

    it('Marker begivenheder i morgen med I morgen banner og om-tid', () => {
      const tomorrowMorn = new Date('2026-10-22T06:30:00');
      const tomorrowDate = new Date('2026-10-22T00:00:00');

      const timing = WeatherEngine.getEventTiming(tomorrowMorn, null, 1, tomorrowDate, 'morning', 70, today);

      expect(timing.isPassed).toBe(false);
      expect(timing.status).toBe('future');
      expect(timing.pill).toBe('I morgen');
      expect(timing.label).toContain('I morgen tidlig • Om');
    });

    it('Beregner astronomisk nat i aften/nat som kommende i dagtimerne og ikke som forrige nat', () => {
      const afternoon = new Date('2026-10-21T14:37:00');
      const todayDate = new Date(2026, 9, 21, 12, 0, 0); // middag Oct 21
      const sun = AstroCore.getSunTimes(todayDate, 55.67, 12.56);

      let aStart: Date | null = null;
      let aEnd: Date | null = null;

      if (sun.astronomicalDusk) {
        if (sun.astronomicalDawn && afternoon < sun.astronomicalDawn) {
          aStart = new Date(sun.astronomicalDusk.getTime() - 24 * 60 * 60 * 1000);
          aEnd = sun.astronomicalDawn;
        } else {
          aStart = sun.astronomicalDusk;
          aEnd = sun.astronomicalDawn
            ? new Date(sun.astronomicalDawn.getTime() + 24 * 60 * 60 * 1000)
            : new Date(aStart.getTime() + 9 * 60 * 60 * 1000);
        }
      }

      const timing = WeatherEngine.getEventTiming(aStart, aEnd, 0, todayDate, 'astro', 80, afternoon);

      expect(timing.isPassed).toBe(false);
      expect(timing.status).toBe('upcoming');
      expect(timing.pill).toBe('Kommende');
      expect(timing.label).toContain('I aften/nat • Om');
    });

    it('Marker begivenheder på fremtidige dage (dag 2+) med ugedag', () => {
      const fridayDate = new Date(2026, 9, 23, 12, 0, 0); // Fredag
      const timing = WeatherEngine.getEventTiming(null, null, 2, fridayDate, 'evening', 70, today);

      expect(timing.isPassed).toBe(false);
      expect(timing.status).toBe('future-distant');
      expect(timing.pill).toBe('Fredag');
      expect(timing.label).toContain('Fredag aften • Om 2 dage');
    });
  });
});
