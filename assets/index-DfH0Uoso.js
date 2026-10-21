const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./index-CRf4ADcA.js","./LocationBar-DDjrBrVz.js","./index-P1UReXDu.js","./index-CeFDGfOE.css","./index-Dt-0CknM.js","./index-vCPiRedw.css","./index-CejDkquL.js","./index-XbTx3hqW.css"])))=>i.map(i=>d[i]);
(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(a){if(a.ep)return;a.ep=!0;const i=t(a);fetch(a.href,i)}})();const N="modulepreload",L=function(r,e){return new URL(r,e).href},E={},m=function(e,t,n){let a=Promise.resolve();if(t&&t.length>0){const o=document.getElementsByTagName("link"),s=document.querySelector("meta[property=csp-nonce]"),u=s?.nonce||s?.getAttribute("nonce");a=Promise.allSettled(t.map(c=>{if(c=L(c,n),c in E)return;E[c]=!0;const p=c.endsWith(".css"),v=p?'[rel="stylesheet"]':"";if(!!n)for(let d=o.length-1;d>=0;d--){const f=o[d];if(f.href===c&&(!p||f.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${c}"]${v}`))return;const h=document.createElement("link");if(h.rel=p?"stylesheet":N,p||(h.as="script"),h.crossOrigin="",h.href=c,u&&h.setAttribute("nonce",u),document.head.appendChild(h),p)return new Promise((d,f)=>{h.addEventListener("load",d),h.addEventListener("error",()=>f(new Error(`Unable to preload CSS for ${c}`)))})}))}function i(o){const s=new Event("vite:preloadError",{cancelable:!0});if(s.payload=o,window.dispatchEvent(s),!s.defaultPrevented)throw o}return a.then(o=>{for(const s of o||[])s.status==="rejected"&&i(s.reason);return e().catch(i)})};class g{static modules=new Map;static instances=new Map;static register(e){this.modules.set(e.id,e)}static get(e){return this.modules.get(e)}static getAll(){return Array.from(this.modules.values())}static getByRoute(e){const t=e.split("?")[0].replace(/^#\/?/,"").toLowerCase();for(const n of this.modules.values()){if(n.route.replace(/^#\/?/,"").toLowerCase()===t||t===""&&n.id==="home")return n;if(n.aliases){for(const i of n.aliases)if(i.replace(/^#\/?/,"").toLowerCase()===t)return n}}return this.modules.get("home")}static async loadInstance(e){if(this.instances.has(e))return this.instances.get(e);const t=this.modules.get(e);if(!t)throw new Error(`Modul med id "${e}" er ikke registreret`);const n=await t.loader();return this.instances.set(e,n),n}}class w{static listeners=new Set;static pendingContext=null;static init(){window.addEventListener("hashchange",()=>this.handleHashChange()),window.location.hash?this.handleHashChange():window.location.hash="#/"}static subscribe(e){return this.listeners.add(e),()=>this.listeners.delete(e)}static navigate(e,t){this.pendingContext=t,window.location.hash===e?this.handleHashChange():window.location.hash=e}static handleHashChange(){const e=window.location.hash||"#/",[t,n]=e.replace(/^#\/?/,"").split("?"),a=t||"",i=new URLSearchParams(n||""),o=this.pendingContext;this.pendingContext=null;const s={route:e,path:a,params:i,context:o};this.listeners.forEach(u=>{try{u(s)}catch(c){console.error("Fejl i route listener:",c)}})}}const b={nightMode:!1,units:"metric",lastModule:"home",version:1},S="fs_app_settings_v1";class y{static getSettings(){try{const e=localStorage.getItem(S);if(e)return{...b,...JSON.parse(e)}}catch(e){console.warn("Fejl under læsning af indstillinger fra localStorage:",e)}return{...b}}static saveSettings(e){const n={...this.getSettings(),...e};try{localStorage.setItem(S,JSON.stringify(n))}catch(a){console.warn("Fejl under gemning af indstillinger i localStorage:",a)}return n}static getItem(e,t){try{const n=localStorage.getItem(e);if(n!==null)return JSON.parse(n)}catch(n){console.warn(`Fejl ved læsning af ${e}:`,n)}return t}static setItem(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch(n){console.warn(`Fejl ved lagring af ${e}:`,n)}}static removeItem(e){try{localStorage.removeItem(e)}catch(t){console.warn(`Fejl ved sletning af ${e}:`,t)}}}class M{static rootEl;static headerBadgeEl;static btnNightModeEl;static mainContentEl;static bottomNavEl;static updateToastEl=null;static currentModuleId=null;static moduleContainers=new Map;static loadedInstances=new Map;static init(e){this.rootEl=e,this.renderShell(),this.initNightMode(),this.setupNavigation(),this.setupPwaUpdateListener()}static renderShell(){this.rootEl.innerHTML=`
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
    `,this.headerBadgeEl=this.rootEl.querySelector("#headerModuleBadge"),this.btnNightModeEl=this.rootEl.querySelector("#btnNightMode"),this.mainContentEl=this.rootEl.querySelector("#main-content"),this.bottomNavEl=this.rootEl.querySelector("#bottomNav"),this.rootEl.querySelector("#btnHeaderBrand")?.addEventListener("click",()=>{w.navigate("#/")}),this.btnNightModeEl.addEventListener("click",()=>{this.toggleNightMode()}),this.renderBottomNav()}static renderBottomNav(){const e=g.getAll();this.bottomNavEl.innerHTML=e.map(t=>`
      <a href="${t.route}" class="nav-item" data-module="${t.id}" id="nav-item-${t.id}">
        ${t.iconSvg}
        <span>${t.shortName}</span>
      </a>
    `).join("")}static setupNavigation(){w.subscribe(async e=>{await this.handleRoute(e)})}static async handleRoute(e){const t=g.getByRoute(e.route)||g.get("home");if(!t)return;const n=t.id;if(n==="home"?this.headerBadgeEl.style.display="none":(this.headerBadgeEl.textContent=t.name,this.headerBadgeEl.style.display="inline-block"),this.bottomNavEl.querySelectorAll(".nav-item").forEach(s=>{const u=s.getAttribute("data-module")===n;s.classList.toggle("active",u)}),this.currentModuleId===n){const s=this.loadedInstances.get(n);s?.onActivate&&s.onActivate({...e.context,params:e.params});return}if(this.currentModuleId){const s=this.loadedInstances.get(this.currentModuleId);s?.onDeactivate&&s.onDeactivate();const u=this.moduleContainers.get(this.currentModuleId);u&&u.classList.add("hidden")}let i=this.moduleContainers.get(n),o=this.loadedInstances.get(n);if(!i){i=document.createElement("div"),i.id=`view-${n}`,i.className="module-view",this.mainContentEl.appendChild(i),this.moduleContainers.set(n,i),i.innerHTML=`
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
        `;return}}i.classList.remove("hidden"),this.currentModuleId=n,y.saveSettings({lastModule:n}),o?.onActivate&&o.onActivate({...e.context,params:e.params}),window.scrollTo({top:0,behavior:"instant"})}static initNightMode(){y.getSettings().nightMode&&(document.body.classList.add("theme-night-red"),this.btnNightModeEl.classList.add("active"))}static toggleNightMode(){const e=document.body.classList.toggle("theme-night-red");this.btnNightModeEl.classList.toggle("active",e),y.saveSettings({nightMode:e});const t=document.querySelector('meta[name="theme-color"]');t&&t.setAttribute("content",e?"#080000":"#07080a")}static showUpdateToast(e){if(this.updateToastEl)return;const t=document.createElement("div");t.className="update-toast",t.innerHTML=`
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="font-size:18px;">✨</span>
        <div style="font-size:13px;line-height:1.3;">
          <strong style="color:var(--text-main);display:block;">Ny version klar</strong>
          <span style="color:var(--text-muted);">Opdatering til Fotografiske Signaler</span>
        </div>
      </div>
      <button class="fs-btn fs-btn-accent-sun" id="btnPwaUpdate" style="padding:6px 12px;font-size:12px;min-height:32px;">Opdater</button>
    `,document.body.appendChild(t),this.updateToastEl=t,t.querySelector("#btnPwaUpdate")?.addEventListener("click",()=>{e(),t.remove(),this.updateToastEl=null})}static setupPwaUpdateListener(){window.addEventListener("pwa-update-available",e=>{e.detail&&typeof e.detail.update=="function"&&this.showUpdateToast(e.detail.update)})}}function C(r={}){const{immediate:e=!1,onNeedRefresh:t,onOfflineReady:n,onRegistered:a,onRegisteredSW:i,onRegisterError:o}=r;let s,u,c;const p=async(l=!0)=>{await u,await c?.()};async function v(){if("serviceWorker"in navigator){if(s=await m(async()=>{const{Workbox:l}=await import("./workbox-window.prod.es5-BqEJf4Xk.js");return{Workbox:l}},[],import.meta.url).then(({Workbox:l})=>new l("./sw.js",{scope:"./",type:"classic"})).catch(l=>{o?.(l)}),!s)return;c=async()=>{await s?.messageSkipWaiting()};{let l=!1;const h=()=>{l=!0,s?.addEventListener("controlling",d=>{d.isUpdate&&window.location.reload()}),t?.()};s.addEventListener("installed",d=>{typeof d.isUpdate>"u"?typeof d.isExternal<"u"?d.isExternal?h():!l&&n?.():d.isExternal?window.location.reload():!l&&n?.():d.isUpdate||n?.()}),s.addEventListener("waiting",h),s.addEventListener("externalwaiting",h)}s.register({immediate:e}).then(l=>{i?i("./sw.js",l):a?.(l)}).catch(l=>{o?.(l)})}}return u=v(),p}g.register({id:"home",name:"Hjem",shortName:"Hjem",description:"Oversigt og hurtigadgang",accentColor:"#c8cbce",route:"#/",iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  `,loader:async()=>{const r=await m(()=>import("./index-CRf4ADcA.js"),__vite__mapDeps([0,1]),import.meta.url);return new r.default}});g.register({id:"weather",name:"Vejr",shortName:"Vejr",description:"Vejranalyse og fotovinduer",accentColor:"#38bdf8",route:"#/vejr",aliases:["#/fotovejr"],iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
    </svg>
  `,loader:async()=>{const r=await m(()=>import("./index-P1UReXDu.js"),__vite__mapDeps([2,1,3]),import.meta.url);return new r.default}});g.register({id:"sun",name:"Sol",shortName:"Sol",description:"Sol, skygge og lysretning",accentColor:"#f59e0b",route:"#/sol",aliases:["#/fotosol"],iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
    </svg>
  `,loader:async()=>{const r=await m(()=>import("./index-Dt-0CknM.js"),__vite__mapDeps([4,1,5]),import.meta.url);return new r.default}});g.register({id:"dof",name:"DOF",shortName:"DOF",description:"Dybdeskarphed og optik",accentColor:"#10b981",route:"#/dof",aliases:["#/fotodof"],iconSvg:`
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10"></circle>
      <circle cx="12" cy="12" r="4"></circle>
      <line x1="12" y1="2" x2="12" y2="4"></line>
      <line x1="12" y1="20" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line>
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line>
    </svg>
  `,loader:async()=>{const r=await m(()=>import("./index-CejDkquL.js"),__vite__mapDeps([6,7]),import.meta.url);return new r.default}});const x=document.getElementById("app");x&&(M.init(x),w.init());const I=C({onNeedRefresh(){window.dispatchEvent(new CustomEvent("pwa-update-available",{detail:{update:()=>I(!0)}}))},onOfflineReady(){console.log("Fotografiske Signaler PWA er klar til offline brug.")}});export{w as R,y as S,m as _};
