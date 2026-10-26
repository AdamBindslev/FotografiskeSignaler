/**
 * InstallBanner.ts - PWA installationsbanner med direkte prompt (Android/PC) og guide til iOS (Safari)
 */

import { StorageService } from '../services/StorageService.ts';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export class InstallBanner {
  private static deferredPrompt: BeforeInstallPromptEvent | null = null;
  private static bannerEl: HTMLElement | null = null;
  private static modalEl: HTMLElement | null = null;

  public static init(): void {
    // 1. Hvis appen allerede kører som installeret PWA (standalone), gør intet
    if (this.isStandalone()) {
      return;
    }

    // 2. Hvis brugeren tidligere har lukket banneret, vis det ikke igen
    const settings = StorageService.getSettings();
    if (settings.installBannerDismissed) {
      return;
    }

    // 3. Lyt efter browserens native install-event (Chrome, Edge, Android m.fl.)
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      if (!StorageService.getSettings().installBannerDismissed && !this.isStandalone()) {
        this.renderBanner('native');
      }
    });

    // 4. Skjul banneret automatisk hvis appen bliver installeret
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.removeBanner();
      this.closeIosModal();
    });

    // 5. Tjek om brugeren er på iOS (iPhone / iPad) i almindelig browser
    if (this.isIos()) {
      this.renderBanner('ios');
    }
  }

  public static isStandalone(): boolean {
    const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
    const isStandaloneIos = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    return isStandaloneMedia || isStandaloneIos;
  }

  public static isIos(): boolean {
    const ua = window.navigator.userAgent;
    const isIPhoneOrIPad = /iPad|iPhone|iPod/.test(ua);
    // iPadOS 13+ rapporterer sig ofte som MacIntel med touch-punkter
    const isIPadOS = window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1;
    return isIPhoneOrIPad || isIPadOS;
  }

  private static renderBanner(mode: 'native' | 'ios'): void {
    if (this.bannerEl) return;

    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Installer app');

    banner.innerHTML = `
      <div class="pwa-install-content">
        <div class="pwa-install-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        </div>
        <div class="pwa-install-text">
          <strong>Installer FotoSignaler</strong>
          <span>Hurtig adgang fra hjemmeskærm & offline brug</span>
        </div>
      </div>
      <div class="pwa-install-actions">
        <button class="fs-btn fs-btn-accent-sun pwa-install-btn" id="btnPwaInstallAction">
          ${mode === 'ios' ? 'Sådan gør du' : 'Installer'}
        </button>
        <button class="pwa-install-close" id="btnPwaInstallDismiss" title="Luk" aria-label="Luk installationsbanner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(banner);
    this.bannerEl = banner;

    banner.querySelector('#btnPwaInstallAction')?.addEventListener('click', async () => {
      if (mode === 'native' && this.deferredPrompt) {
        await this.deferredPrompt.prompt();
        const choice = await this.deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          this.removeBanner();
        }
        this.deferredPrompt = null;
      } else {
        this.showIosModal();
      }
    });

    banner.querySelector('#btnPwaInstallDismiss')?.addEventListener('click', () => {
      StorageService.saveSettings({ installBannerDismissed: true });
      this.removeBanner();
    });
  }

  private static removeBanner(): void {
    if (this.bannerEl) {
      this.bannerEl.remove();
      this.bannerEl = null;
    }
  }

  private static showIosModal(): void {
    if (this.modalEl) return;

    const overlay = document.createElement('div');
    overlay.className = 'pwa-ios-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'iosModalTitle');

    overlay.innerHTML = `
      <div class="pwa-ios-modal">
        <div class="pwa-ios-modal-header">
          <h3 id="iosModalTitle">Installer på iPhone / iPad</h3>
          <button class="pwa-install-close" id="btnCloseIosModal" aria-label="Luk vejledning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <p class="pwa-ios-modal-intro">
          Føj <strong>Fotografiske Signaler</strong> til din hjemmeskærm for fuldskærms-visning og hurtig adgang i felten:
        </p>
        <ol class="pwa-ios-steps">
          <li>
            <span class="pwa-step-num">1</span>
            <div class="pwa-step-body">
              Tryk på <strong>Del-ikonet</strong> i menulinjen i Safari
              <span class="pwa-ios-inline-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
              </span>
            </div>
          </li>
          <li>
            <span class="pwa-step-num">2</span>
            <div class="pwa-step-body">
              Rul ned i menuen og vælg <strong>"Føj til hjemmeskærm"</strong>
              <span class="pwa-ios-inline-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </span>
            </div>
          </li>
          <li>
            <span class="pwa-step-num">3</span>
            <div class="pwa-step-body">
              Tryk på <strong>"Tilføj"</strong> øverst til højre.
            </div>
          </li>
        </ol>
        <button class="fs-btn fs-btn-accent-sun" id="btnGotItIosModal" style="width: 100%; margin-top: 14px;">
          Forstået
        </button>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    const closeHandler = () => this.closeIosModal();
    overlay.querySelector('#btnCloseIosModal')?.addEventListener('click', closeHandler);
    overlay.querySelector('#btnGotItIosModal')?.addEventListener('click', closeHandler);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeHandler();
      }
    });
  }

  private static closeIosModal(): void {
    if (this.modalEl) {
      this.modalEl.remove();
      this.modalEl = null;
    }
  }
}
