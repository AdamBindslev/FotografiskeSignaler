# Fotografiske Signaler – Samlet Modulær PWA

> **Version:** 1.0.0  
> **Platform:** Mobil-first Progressive Web App (PWA)  
> **Afsender:** Fotografiske Signaler  

Fotografiske Signaler forener tre specialiserede fotografiske værktøjer i én samlet, moderne og installerbar Progressive Web App:

1. **Vejr** – Vejranalyse med 7-døgns prognoser fra Open-Meteo, morgentåge- og dis-vurdering, gylden time-kvalitet, stjerneklar natsky-score, sol- og månefaser samt time-for-time vejrdata.
2. **Sol** – Solposition, skyggeberegning og kompositionsplanlægning med interaktiv roterbar 3D-søger (HTML5 Canvas Retina), 2D solurs-kompas og on-demand satellitkort (Leaflet).
3. **DOF** – Fysisk dybdeskarphedsberegner med hyperfokaldistance, nær-/fjerngrænser, fordeling foran/bagved, sensor Circle of Confusion (CoC), diffraktionsanalyse samt simuleret EVF (Electronic Viewfinder) med realistisk baggrundssløring og bokeh-bobler.

---

## 🌟 Hovedfunktioner

- **Én samlet PWA:** Installérbar på iOS Safari og Android Chrome via ét appikon.
- **Fuld Astro Rød Nattilstand:** Global nattilstand aktiveres med ét tryk i topbjælken og skåner fotografens nattesyn i felten (gælder både UI, canvas-scener og kontroller).
- **Fælles Lokation & Tidsmodel:** Automatisk to-vejs synkronisering af lokation mellem Vejr og Sol. Vejr indeholder direkte *"Se lysretning i Sol"*-handlinger på alle fotovinduer.
- **Ekstrem Mobil Ydeevne:** Bygget med Vite, TypeScript og moderne Vanilla ES-moduler. 0 kB framework-overhead, sub-50ms opstart og lazy-loading af moduler og tunge biblioteker (Leaflet hentes kun ved faktisk brug).
- **Aktiv pause af rendering:** Moduler pauser automatisk animationer, 60fps canvas-rendering og GPS-watching, når fotografen skifter fane (0% CPU/GPU-spild i baggrunden, samtidig med at kameravinkler og inputfelter bevares 100%).
- **100% Offline Understøttelse:** DOF kører fuldstændig offline. Sol foretager alle sol- og skyggeberegninger offline. Vejr bevarer lokale astronomiske beregninger og viser senest cachede vejrudsigt med tydeligt tidsstempel ved manglende forbindelse.
- **Diskret Opdateringsnotifikation:** Service Worker meddeler fotografen roligt med et toast-banner, når en ny version er klar, så igangværende beregninger i felten aldrig afbrydes vilkårligt.

---

## 📁 Projektstruktur

```text
FotografiskeSignaler/
├── public/
│   ├── icons/                  # 192x192, 512x512, apple-touch-icon, favicon
│   ├── manifest.webmanifest    # Samlet PWA webmanifest
│   ├── fotografiske-signaler-wordmark.png
│   └── logo-fs.jpg
├── src/
│   ├── app/
│   │   ├── AppShell.ts         # Topbjælke, bundnavigation, tema-styring, update toast
│   │   ├── Router.ts           # Hash-baseret SPA router med URL-parametre
│   │   └── ModuleRegistry.ts   # Central modulregistrering og dynamisk lazy loading
│   ├── shared/
│   │   ├── styles/
│   │   │   ├── variables.css   # Fælles farver, typografi, EVF-design og astro-rød
│   │   │   ├── base.css        # Reset, layout-primitives og tabelformede cifre
│   │   │   └── components.css  # Knapper, slidere, segment-tabs og kort
│   │   ├── services/
│   │   │   ├── LocationService.ts  # Browser-GPS, Open-Meteo geocoding og abonnenter
│   │   │   ├── TimeService.ts      # Fælles tidsstyring og dansk datoformatering
│   │   │   └── StorageService.ts   # Typet localStorage med versionering
│   │   └── astronomy/
│   │       └── AstroCore.ts    # Fælles sol-, måne-, tusmørke- og skyggematematik
│   ├── modules/
│   │   ├── home/               # Hjemmeskærm med modul-oversigt og status
│   │   ├── weather/            # Vejr modul
│   │   ├── sun/                # Sol modul
│   │   └── dof/                # DOF modul
│   └── main.ts                 # App bootstrap og Service Worker registrering
├── tests/
│   ├── dof.test.ts             # Tests for optiske DOF formler og formatering
│   ├── sun.test.ts             # Tests for solhøjde, azimut og skyggeberegning
│   └── weather.test.ts         # Tests for tågerisiko, gylden time og WMO koder
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 🛠️ Lokal Udvikling og Kørsel

### Forudsætninger
- Node.js version 18+ (anbefalet 20+)
- npm version 9+

### Installation
```bash
npm install
```

### Start lokal udviklingsserver
```bash
npm run dev
```
Åbn derefter den viste URL (f.eks. `http://localhost:5173/`) i din browser eller mobilsimulator.

### Kør automatiske enhedstests (Vitest)
```bash
npm run test
```

### Byg produktionsklar PWA bundle
```bash
npm run build
```
De optimerede, hash-versionerede filer, service worker og manifest placeres i mappen `dist/`.

---

## 🚀 Deployment til GitHub Pages

Projektet er konfigureret med relativ base (`./`) og hash-baseret routing (`#/`, `#/vejr`, `#/sol`, `#/dof`), hvilket garanterer, at appen fungerer out-of-the-box på GitHub Pages uden behov for 404-fallback hacks. Bagudkompatible rute-aliasser (`#/fotovejr`, `#/fotosol`, `#/fotodof`) understøttes automatisk.

Byg distributionsfilerne:
```bash
npm run build
```
Deploy indholdet af mappen `dist/` til GitHub Pages (f.eks. via GitHub Actions eller direkte fra en `gh-pages` branch).

---

## 🧩 Sådan tilføjes et nyt værktøj (Moduludvidelse)

Arkitekturen opfylder kravspecifikationens §10.4 og §16 om fremtidssikring. Et nyt værktøj (f.eks. **Måne**, **Stjerner**, **Eksponering** eller **FOV**) kan tilføjes uden at ændre eksisterende moduler:

1. Opret modulets mappe i `src/modules/<nyt-modul>/`:
   - Implementér controller-klassen med interface `ModuleInstance` (`mount`, `onActivate`, `onDeactivate`).
2. Registrér modulet i `src/main.ts`:
   ```typescript
   ModuleRegistry.register({
     id: 'nyt-modul',
     name: 'Måne',
     shortName: 'Måne',
     description: 'Kort beskrivelse',
     accentColor: '#var-farve',
     route: '#/nyt-modul',
     iconSvg: '<svg>...</svg>',
     loader: async () => {
       const mod = await import('./modules/nyt-modul/index.ts');
       return new mod.default();
     }
   });
   ```
3. Modulet optræder nu automatisk i bundnavigationen, routing og på hjemmeskærmen.

---

## 📄 Licens

Udviklet for Fotografiske Signaler. Alle rettigheder forbeholdes.
