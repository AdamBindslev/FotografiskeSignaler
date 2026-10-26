const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-w9jfoLN3.js","./LocationBar-4UnW2ZOM.js","./index-DqYS_XBv.js","./index-CeFDGfOE.css","./index-CjyZXJDT.js","./index-PIBY4Ndj.css","./index-G-YnVX2T.js","./index-BoGGxuxd.css","./index-BDMj0xid.js","./index-Cb2fcxU8.css"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();const k="modulepreload",I=function(r,e){return new URL(r,e).href},b={},v=function(e,t,n){let a=Promise.resolve();if(t&&t.length>0){const o=document.getElementsByTagName("link"),s=document.querySelector("meta[property=csp-nonce]"),h=s?.nonce||s?.getAttribute("nonce");a=Promise.allSettled(t.map(d=>{if(d=I(d,n),d in b)return;b[d]=!0;const p=d.endsWith(".css"),w=p?'[rel="stylesheet"]':"";if(!!n)for(let c=o.length-1;c>=0;c--){const f=o[c];if(f.href===d&&(!p||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${d}"]${w}`))return;const u=document.createElement("link");if(u.rel=p?"stylesheet":k,p||(u.as="script"),u.crossOrigin="",u.href=d,h&&u.setAttribute("nonce",h),document.head.appendChild(u),p)return new Promise((c,f)=>{u.addEventListener("load",c),u.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${d}`)))})}))}function i(o){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=o,window.dispatchEvent(s),!s.defaultPrevented)throw o}return a.then(o=>{for(const s of o||[])s.status==="rejected"&&i(s.reason);return e().catch(i)})};class g{static modules=new Map;static instances=new Map;static register(e){this.modules.set(e.id,e)}static get(e){return this.modules.get(e)}static getAll(){return Array.from(this.modules.values())}static getByRoute(e){const t=e.split("?")[0].replace(/^#\/?/,"").toLowerCase();for(const n of this.modules.values()){if(n.route.replace(/^#\/?/,"").toLowerCase()===t||t===""&&n.id==="home")return n;if(n.aliases){for(const i of n.aliases)if(i.replace(/^#\/?/,"").toLowerCase()===t)return n}}return this.modules.get("home")}static async loadInstance(e){if(this.instances.has(e))return this.instances.get(e);const t=this.modules.get(e);if(!t)throw new Error(`Modul med id "${e}" er ikke registreret`);const n=await t.loader();return this.instances.set(e,n),n}}class y{static listeners=new Set;static pendingContext=null;static init(){window.addEventListener("hashchange",()=>this.handleHashChange()),window.location.hash?this.handleHashChange():window.location.hash="#/"}static subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}static navigate(e,t){this.pendingContext=t,window.location.hash===e?this.handleHashChange():window.location.hash=e}static handleHashChange(){const e=window.location.hash||"#/",[t,n]=e.replace(/^#\/?/,"").split("?"),a=t||"",i=new URLSearchParams(n||""),o=this.pendingContext;this.pendingContext=null;const s={route:e,path:a,params:i,context:o};this.listeners.forEach(h=>{try{h(s)}catch(d){console.error("Fejl i route listener:",d)}})}}const x={nightMode:!1,units:"metric",lastModule:"home",version:1},E="fs_app_settings_v1";class m{static getSettings(){try{const e=localStorage.getItem(E);if(e)return{...x,...JSON.parse(e)}}catch(e){console.warn("Fejl under læsning af indstillinger fra localStorage:",e)}return{...x}}static saveSettings(e){const n={...this.getSettings(),...e};try{localStorage.setItem(E,JSON.stringify(n))}catch(a){console.warn("Fejl under gemning af indstillinger i localStorage:",a)}return n}static getItem(e,t){try{const n=localStorage.getItem(e);if(n!==null)return JSON.parse(n)}catch(n){console.warn(`Fejl ved læsning af ${e}:`,n)}return t}static setItem(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch(n){console.warn(`Fejl ved lagring af ${e}:`,n)}}static removeItem(e){try{localStorage.removeItem(e)}catch(t){console.warn(`Fejl ved sletning af ${e}:`,t)}}}class M{static deferredPrompt=null;static bannerEl=null;static modalEl=null;static init(){this.isStandalone()||m.getSettings().installBannerDismissed||(window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),this.deferredPrompt=t,!m.getSettings().installBannerDismissed&&!this.isStandalone()&&this.renderBanner("native")}),window.addEventListener("appinstalled",()=>{this.deferredPrompt=null,this.removeBanner(),this.closeIosModal()}),this.isIos()&&this.renderBanner("ios"))}static isStandalone(){const e=window.matchMedia("(display-mode: standalone)").matches,t=window.navigator.standalone===!0;return e||t}static isIos(){const e=window.navigator.userAgent,t=/iPad|iPhone|iPod/.test(e),n=window.navigator.platform==="MacIntel"&&window.navigator.maxTouchPoints>1;return t||n}static renderBanner(e){if(this.bannerEl)return;const t=document.createElement("div");t.className="pwa-install-banner",t.setAttribute("role","region"),t.setAttribute("aria-label","Installer app"),t.innerHTML=`
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
          ${e==="ios"?"Sådan gør du":"Installer"}
        </button>
        <button class="pwa-install-close" id="btnPwaInstallDismiss" title="Luk" aria-label="Luk installationsbanner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `,document.body.appendChild(t),this.bannerEl=t,t.querySelector("#btnPwaInstallAction")?.addEventListener("click",async()=>{e==="native"&&this.deferredPrompt?(await this.deferredPrompt.prompt(),(await this.deferredPrompt.userChoice).outcome==="accepted"&&this.removeBanner(),this.deferredPrompt=null):this.showIosModal()}),t.querySelector("#btnPwaInstallDismiss")?.addEventListener("click",()=>{m.saveSettings({installBannerDismissed:!0}),this.removeBanner()})}static removeBanner(){this.bannerEl&&(this.bannerEl.remove(),this.bannerEl=null)}static showIosModal(){if(this.modalEl)return;const e=document.createElement("div");e.className="pwa-ios-modal-overlay",e.setAttribute("role","dialog"),e.setAttribute("aria-modal","true"),e.setAttribute("aria-labelledby","iosModalTitle"),e.innerHTML=`
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
    `,document.body.appendChild(e),this.modalEl=e;const t=()=>this.closeIosModal();e.querySelector("#btnCloseIosModal")?.addEventListener("click",t),e.querySelector("#btnGotItIosModal")?.addEventListener("click",t),e.addEventListener("click",n=>{n.target===e&&t()})}static closeIosModal(){this.modalEl&&(this.modalEl.remove(),this.modalEl=null)}}class L{static rootEl;static headerBadgeEl;static btnNightModeEl;static mainContentEl;static bottomNavEl;static updateToastEl=null;static currentModuleId=null;static moduleContainers=new Map;static loadedInstances=new Map;static init(e){this.rootEl=e,this.renderShell(),this.initNightMode(),this.setupNavigation(),this.setupPwaUpdateListener(),M.init()}static renderShell(){this.rootEl.innerHTML=`
      <header class="app-header">
        <div class="header-brand" id="btnHeaderBrand" role="button" aria-label="Gå til Hjem">
          <img src="fotografiske-signaler-wordmark.png" alt="Fotografiske Signaler" class="header-logo" onerror="this.style.display='none'">
          <span class="header-badge" id="headerModuleBadge" style="display: none;"></span>
        </div>
        <div class="header-actions">
          <button class="fs-btn-icon" id="btnNightMode" title="Astro Rød nattilstand" aria-label="Skift til rød nattilstand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </button>
        </div>
      </header>

      <main id="main-content" role="main"></main>

      <nav class="app-bottom-nav" aria-label="Hovednavigation" id="bottomNav"></nav>
    `,this.headerBadgeEl=this.rootEl.querySelector("#headerModuleBadge"),this.btnNightModeEl=this.rootEl.querySelector("#btnNightMode"),this.mainContentEl=this.rootEl.querySelector("#main-content"),this.bottomNavEl=this.rootEl.querySelector("#bottomNav"),this.rootEl.querySelector("#btnHeaderBrand")?.addEventListener("click",()=>{y.navigate("#/")}),this.btnNightModeEl.addEventListener("click",()=>{this.toggleNightMode()}),this.renderBottomNav()}static renderBottomNav(){const e=g.getAll();this.bottomNavEl.innerHTML=e.map(t=>`
      <a href="${t.route}" class="nav-item" data-module="${t.id}" id="nav-item-${t.id}">
        ${t.iconSvg}
        <span>${t.shortName}</span>
      </a>
    `).join("")}static setupNavigation(){y.subscribe(async e=>{await this.handleRoute(e)})}static async handleRoute(e){const t=g.getByRoute(e.route)||g.get("home");if(!t)return;const n=t.id;if(n==="home"?this.headerBadgeEl.style.display="none":(this.headerBadgeEl.textContent=t.name,this.headerBadgeEl.style.display="inline-block"),this.bottomNavEl.querySelectorAll(".nav-item").forEach(s=>{const h=s.getAttribute("data-module")===n;s.classList.toggle("active",h)}),this.currentModuleId===n){const s=this.loadedInstances.get(n);s?.onActivate&&s.onActivate({...e.context,params:e.params});return}if(this.currentModuleId){const s=this.loadedInstances.get(this.currentModuleId);s?.onDeactivate&&s.onDeactivate();const h=this.moduleContainers.get(this.currentModuleId);h&&h.classList.add("hidden")}let i=this.moduleContainers.get(n),o=this.loadedInstances.get(n);if(!i){i=document.createElement("div"),i.id=`view-${n}`,i.className="module-view",this.mainContentEl.appendChild(i),this.moduleContainers.set(n,i),i.innerHTML=`
        <div style="display:flex;align-items:center;justify-content:center;height:240px;color:var(--text-muted);gap:12px;">
          <div style="width:20px;height:20px;border:2px solid var(--border-subtle);border-top-color:var(--text-main);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
          <span>Indlæser ${t.name}...</span>
        </div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      `;try{o=await g.loadInstance(n),this.loadedInstances.set(n,o),i.innerHTML="",await o.mount(i)}catch(s){console.error(`Fejl ved indlæsning af modul ${n}:`,s),i.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h3 style="color:var(--accent-danger);margin-bottom:8px;">Kunne ikke indlæse ${t.name}</h3>
            <p style="color:var(--text-muted);">${s.message}</p>
          </div>
        `;return}}i.classList.remove("hidden"),this.currentModuleId=n,m.saveSettings({lastModule:n}),o?.onActivate&&o.onActivate({...e.context,params:e.params}),window.scrollTo({top:0,behavior:"instant"})}static initNightMode(){m.getSettings().nightMode&&(document.body.classList.add("theme-night-red"),this.btnNightModeEl.classList.add("active"))}static toggleNightMode(){const e=document.body.classList.toggle("theme-night-red");this.btnNightModeEl.classList.toggle("active",e),m.saveSettings({nightMode:e});const t=document.querySelector('meta[name="theme-color"]');t&&t.setAttribute("content",e?"#080000":"#07080a"),window.dispatchEvent(new CustomEvent("fs-theme-change",{detail:{nightMode:e}}))}static showUpdateToast(e){if(this.updateToastEl)return;const t=document.createElement("div");t.className="update-toast",t.innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">✨</span>
        <div style="font-size:13px;line-height:1.3;">
          <strong style="color:var(--text-main);display:block;">Ny version klar</strong>
          <span style="color:var(--text-muted);">Opdatering til Fotografiske Signaler</span>
        </div>
      </div>
      <button class="fs-btn fs-btn-accent-sun" id="btnPwaUpdate" style="padding:6px 12px;font-size:12px;min-height:32px;">Opdater</button>
    `,document.body.appendChild(t),this.updateToastEl=t,t.querySelector("#btnPwaUpdate")?.addEventListener("click",()=>{e(),t.remove(),this.updateToastEl=null})}static setupPwaUpdateListener(){window.addEventListener("pwa-update-available",e=>{e.detail&&typeof e.detail.update=="function"&&this.showUpdateToast(e.detail.update)})}}function N(r={}){const{immediate:e=!1,onNeedRefresh:t,onOfflineReady:n,onRegistered:a,onRegisteredSW:i,onRegisterError:o}=r;let s,h,d;const p=async(l=!0)=>{await h,await d?.()};async function w(){if("serviceWorker"in navigator){if(s=await v(async()=>{const{Workbox:l}=await import("./workbox-window.prod.es5-BqEJf4Xk.js");return{Workbox:l}},[],import.meta.url).then(({Workbox:l})=>new l("./sw.js",{scope:"./",type:"classic"})).catch(l=>{o?.(l)}),!s)return;d=async()=>{await s?.messageSkipWaiting()};{let l=!1;const u=()=>{l=!0,s?.addEventListener("controlling",c=>{c.isUpdate&&window.location.reload()}),t?.()};s.addEventListener("installed",c=>{typeof c.isUpdate>"u"?typeof c.isExternal<"u"?c.isExternal?u():!l&&n?.():c.isExternal?window.location.reload():!l&&n?.():c.isUpdate||n?.()}),s.addEventListener("waiting",u),s.addEventListener("externalwaiting",u)}s.register({immediate:e}).then(l=>{i?i("./sw.js",l):a?.(l)}).catch(l=>{o?.(l)})}}return h=w(),p}g.register({id:"home",name:"Hjem",shortName:"Hjem",description:"Oversigt og hurtigadgang",accentColor:"#c8cbce",route:"#/",iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,loader:async()=>{const r=await v(()=>import("./index-w9jfoLN3.js"),__vite__mapDeps([0,1]),import.meta.url);return new r.default}});g.register({id:"weather",name:"Vejr",shortName:"Vejr",description:"Vejranalyse og fotovinduer",accentColor:"#38bdf8",route:"#/vejr",aliases:["#/fotovejr"],iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
    </svg>
  `,loader:async()=>{const r=await v(()=>import("./index-DqYS_XBv.js"),__vite__mapDeps([2,1,3]),import.meta.url);return new r.default}});g.register({id:"sun",name:"Sol",shortName:"Sol",description:"Sol, skygge og lysretning",accentColor:"#f59e0b",route:"#/sol",aliases:["#/fotosol"],iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
    </svg>
  `,loader:async()=>{const r=await v(()=>import("./index-CjyZXJDT.js"),__vite__mapDeps([4,1,5]),import.meta.url);return new r.default}});g.register({id:"dof",name:"DOF",shortName:"DOF",description:"Dybdeskarphed og optik",accentColor:"#10b981",route:"#/dof",aliases:["#/fotodof"],iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="4"></circle>
      <line x1="12" y1="2" x2="12" y2="4"></line>
      <line x1="12" y1="20" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
    </svg>
  `,loader:async()=>{const r=await v(()=>import("./index-G-YnVX2T.js"),__vite__mapDeps([6,7]),import.meta.url);return new r.default}});g.register({id:"exposure",name:"Eksponering",shortName:"Eksp.",description:"Eksponeringstrekant, ND & bulb",accentColor:"#a855f7",route:"#/eksponering",aliases:["#/eksp","#/fotoeksponering"],iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
    </svg>
  `,loader:async()=>{const r=await v(()=>import("./index-BDMj0xid.js"),__vite__mapDeps([8,9]),import.meta.url);return new r.default}});const S=document.getElementById("app");S&&(L.init(S),y.init());const C=N({onNeedRefresh(){window.dispatchEvent(new CustomEvent("pwa-update-available",{detail:{update:()=>C(!0)}}))},onOfflineReady(){console.log("Fotografiske Signaler PWA er klar til offline brug.")}});export{y as R,m as S,v as _};
