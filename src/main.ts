/**
 * main.ts - App bootstrap og modulregistrering for Fotografiske Signaler
 */

import './shared/styles/variables.css';
import './shared/styles/base.css';
import './shared/styles/components.css';

import { ModuleRegistry } from './app/ModuleRegistry.ts';
import { AppShell } from './app/AppShell.ts';
import { Router } from './app/Router.ts';
import { registerSW } from 'virtual:pwa-register';

// 1. Registrer moduler med lazy loaders (§10.4, §10.5)
ModuleRegistry.register({
  id: 'home',
  name: 'Hjem',
  shortName: 'Hjem',
  description: 'Oversigt og hurtigadgang',
  accentColor: '#c8cbce',
  route: '#/',
  iconSvg: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,
  loader: async () => {
    const mod = await import('./modules/home/index.ts');
    return new mod.default();
  }
});

ModuleRegistry.register({
  id: 'weather',
  name: 'FotoVejr',
  shortName: 'FotoVejr',
  description: 'Vejranalyse og fotovinduer',
  accentColor: '#38bdf8',
  route: '#/fotovejr',
  iconSvg: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
    </svg>
  `,
  loader: async () => {
    const mod = await import('./modules/weather/index.ts');
    return new mod.default();
  }
});

ModuleRegistry.register({
  id: 'sun',
  name: 'FotoSol',
  shortName: 'FotoSol',
  description: 'Sol, skygge og lysretning',
  accentColor: '#f59e0b',
  route: '#/fotosol',
  iconSvg: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
    </svg>
  `,
  loader: async () => {
    const mod = await import('./modules/sun/index.ts');
    return new mod.default();
  }
});

ModuleRegistry.register({
  id: 'dof',
  name: 'FotoDOF',
  shortName: 'FotoDOF',
  description: 'Dybdeskarphed og optik',
  accentColor: '#10b981',
  route: '#/fotodof',
  iconSvg: `
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="4"></circle>
      <line x1="12" y1="2" x2="12" y2="4"></line>
      <line x1="12" y1="20" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
    </svg>
  `,
  loader: async () => {
    const mod = await import('./modules/dof/index.ts');
    return new mod.default();
  }
});

// 2. Initialiser AppShell
const appRoot = document.getElementById('app');
if (appRoot) {
  AppShell.init(appRoot);
  Router.init();
}

// 3. Registrer Service Worker med opdateringsnotifikation (§12.5)
const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(
      new CustomEvent('pwa-update-available', {
        detail: {
          update: () => updateSW(true)
        }
      })
    );
  },
  onOfflineReady() {
    console.log('Fotografiske Signaler PWA er klar til offline brug.');
  }
});
