import { describe, it, expect } from 'vitest';
import { AstroCore } from '../src/shared/astronomy/AstroCore.ts';

describe('AstroCore - Sol beregninger', () => {
  const cphLat = 55.6761;
  const cphLng = 12.5683;

  it('Beregner korrekt solhøjde og azimut for København sommersolhverv', () => {
    // 21. juni 2026 kl. 13:00 (nær solmiddag i sommertid UTC+2)
    const noonSummer = new Date('2026-06-21T13:00:00+02:00');
    const pos = AstroCore.getSunPosition(noonSummer, cphLat, cphLng);

    // I København er maksimal solhøjde ved midsommer ca 57.7° (90 - 55.67 + 23.44 ≈ 57.7°)
    expect(pos.altitude).toBeGreaterThan(55);
    expect(pos.altitude).toBeLessThan(60);

    // Ved solmiddag står solen næsten stik syd (azimut ca 180°)
    expect(pos.azimuth).toBeGreaterThan(160);
    expect(pos.azimuth).toBeLessThan(200);
  });

  it('Beregner skyggelængde: L = H / tan(alt)', () => {
    // Solhøjde 45°: skyggelængden skal være præcis lig genstandens højde (tan(45°) = 1)
    const shadow45 = AstroCore.calculateShadow(45, 180, 1.75);
    expect(shadow45.hasDirectShadow).toBe(true);
    expect(shadow45.shadowLength).toBeCloseTo(1.75, 2);
    expect(shadow45.shadowRatio).toBeCloseTo(1.0, 2);
    // Sol i Syd (180°) kaster skygge mod Nord (0°)
    expect(shadow45.shadowAzimuth).toBeCloseTo(0, 0);
    expect(shadow45.shadowCompass).toBe('N');

    // Solhøjde 30°: skyggelængden = H / tan(30°) = 1.75 * sqrt(3) ≈ 3.03 m
    const shadow30 = AstroCore.calculateShadow(30, 90, 2.0);
    expect(shadow30.shadowLength).toBeCloseTo(3.464, 2);
    // Sol i Øst (90°) kaster skygge mod Vest (270°)
    expect(shadow30.shadowAzimuth).toBeCloseTo(270, 0);
    expect(shadow30.shadowCompass).toBe('V');
  });

  it('Håndterer nat og sol under horisonten korrekt for skygger', () => {
    const nightShadow = AstroCore.calculateShadow(-10, 350, 1.75);
    expect(nightShadow.hasDirectShadow).toBe(false);
    expect(nightShadow.shadowLength).toBe(Infinity);
    expect(nightShadow.lightPhase.id).toBe('nautical');
  });

  it('Klassificerer fotofaser og farvetemperatur (Kelvin) korrekt', () => {
    // Gylden time (solhøjde 4°)
    const golden = AstroCore.calculateShadow(4, 180, 1.75);
    expect(golden.lightPhase.id).toBe('golden-hour');
    const kelvinGolden = AstroCore.getEstimatedKelvin(4);
    expect(kelvinGolden.kelvin).toBe(3300);

    // Blå time (solhøjde -5°)
    const bluePhase = AstroCore.getLightPhase(-5);
    expect(bluePhase.id).toBe('blue-hour');
    const kelvinBlue = AstroCore.getEstimatedKelvin(-5);
    expect(kelvinBlue.kelvin).toBe(9000);
  });
});
