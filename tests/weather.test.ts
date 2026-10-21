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
});
