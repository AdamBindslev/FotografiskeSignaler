import{S as u,R as l}from"./index-BOCmCcGk.js";import{L as i,A as c,T as g}from"./AstroCore-CoxmUvae.js";const m=[{name:"Møns Klint",sub:"Kridtskrænter & Mælkevejen",lat:54.9667,lng:12.55},{name:"Skagen Grenen",sub:"Solnedgang & to have",lat:57.7441,lng:10.6478},{name:"Rubjerg Knude",sub:"Sandklit & Fyr",lat:57.4497,lng:9.7739},{name:"Hammershus, Bornholm",sub:"Klippekyst & Borgruin",lat:55.2728,lng:14.7544},{name:"Vadehavet, Rømø",sub:"Sort Sol & uendelig horisont",lat:55.1389,lng:8.5417},{name:"København Havn",sub:"Nyhavn & Byarkitektur",lat:55.6795,lng:12.591}];class y{container;currentLocation=i.getLocation();unsubLocation=null;searchOpen=!1;mount(n){this.container=n,this.currentLocation=i.getLocation(),this.render(),this.attachEventListeners(),this.unsubLocation=i.subscribe(o=>{this.currentLocation=o,this.render(),this.attachEventListeners()})}onActivate(){this.currentLocation=i.getLocation(),this.render(),this.attachEventListeners()}destroy(){this.unsubLocation&&this.unsubLocation()}render(){const n=u.getSettings(),o=new Date,a=c.getSunPosition(o,this.currentLocation.lat,this.currentLocation.lng),r=c.getSunTimes(o,this.currentLocation.lat,this.currentLocation.lng),e=c.getLightPhase(a.altitude),s=n.lastModule!=="home"?n.lastModule:null;this.container.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: var(--space-4); width: 100%;">
        <!-- VELKOMST HERO -->
        <div class="fs-card" style="padding: var(--space-5); text-align: center; border-color: var(--border-highlight); background: linear-gradient(180deg, rgba(22, 27, 34, 0.95) 0%, rgba(15, 18, 23, 0.9) 100%);">
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <img src="fotografiske-signaler-wordmark.png" alt="Fotografiske Signaler" style="max-height: 48px; width: auto;" onerror="this.style.display='none'">
          </div>
          <h1 style="font-size: 1.4rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px;">
            Fotografiske Signaler
          </h1>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 480px; margin: 0 auto; line-height: 1.45;">
            Professionel fotografisk værktøjskasse. Vejranalyse, sol- og lysretning samt optiske DOF-beregninger samlet i én mobiloptimeret PWA.
          </p>

          <!-- Aktuel status bar med solinfo -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); border-top: 1px solid var(--border-subtle); padding-top: 12px; flex-wrap: wrap;">
            <span style="color: ${e.color}; font-weight: 700;">● ${e.name}</span>
            <span>•</span>
            <span>Sol ${a.altitude>=0?"+":""}${a.altitude.toFixed(0)}° (${a.azimuth.toFixed(0)}° ${c.getCompassDirection(a.azimuth)})</span>
            <span>•</span>
            <span>Solnedgang: ${g.formatTime(r.sunset)}</span>
          </div>
        </div>

        <!-- LOKATIONSVÆLGER PÅ STARTSKÆRMEN (§4.2, §9.1) -->
        <div class="location-bar">
          <div class="loc-info-group" id="btnOpenHomeLocation" title="Vælg eller søg lokation" style="cursor: pointer;">
            <span class="loc-main-name" id="homeLocName">📍 ${this.currentLocation.name}</span>
            <span class="loc-sub-coords" id="homeLocCoords">${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø • Tryk for at skifte</span>
          </div>
          <div class="loc-actions">
            <button class="fs-btn-icon" id="btnHomeGps" title="Brug aktuel GPS-position" aria-label="Brug GPS">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="8"></circle>
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- SØGEPANEL MED FORSLAG OG POPULÆRE FOTOSPOTS -->
        <div id="homeSearchDropdown" class="fs-card" style="display: ${this.searchOpen?"block":"none"}; margin-bottom: 0;">
          <input type="text" id="homeSearchInput" placeholder="Søg by, postnr eller naturområde..." style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-highlight); background: var(--bg-surface); color: var(--text-main); font-size: 14px;">
          <div id="homeSearchResults" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
          
          <!-- Populære fotospots genveje -->
          <div style="margin-top: 12px; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
            <span style="font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Populære Fotospots i Danmark:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
              ${m.map(t=>`
                <button class="quick-val-btn" data-spot-lat="${t.lat}" data-spot-lng="${t.lng}" data-spot-name="${t.name}" style="padding: 5px 9px; font-size: 11px;">
                  📍 ${t.name}
                </button>
              `).join("")}
            </div>
          </div>
        </div>

        ${s?`
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-elevated); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:12px; color:var(--text-muted);">Sidst anvendte værktøj:</span>
            <button class="fs-btn" id="btnResumeLast" style="padding:4px 12px; font-size:12px; min-height:28px;">
              Gå til ${this.getModuleName(s)} →
            </button>
          </div>
        `:""}

        <!-- MODUL 1: FOTOVEJR -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-weather); cursor: pointer;" id="cardGoWeather">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-weather-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-weather);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">FotoVejr</h2>
                <span style="font-size: 11px; color: var(--accent-weather); font-weight: 600; text-transform: uppercase;">Atmosfære & Fotovinduer</span>
              </div>
            </div>
            <span class="fs-badge badge-weather">Vejr</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            7-døgns fotografisk vejranalyse for ${this.currentLocation.name}. Beregner morgentåge, gylden time-kvalitet, skydække i 3 lag og stjerneklart astro-vindue.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Solopgang: ${g.formatTime(r.sunrise)} • Solnedgang: ${g.formatTime(r.sunset)}</span>
            <span style="color: var(--accent-weather); font-weight: 600;">Åbn FotoVejr →</span>
          </div>
        </div>

        <!-- MODUL 2: FOTOSOL -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-sun); cursor: pointer;" id="cardGoSun">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-sun-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-sun);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">FotoSol</h2>
                <span style="font-size: 11px; color: var(--accent-sun); font-weight: 600; text-transform: uppercase;">Sol, Skygge & Lysretning</span>
              </div>
            </div>
            <span class="fs-badge badge-sun">3D & Kort</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            Interaktiv 3D-søger og satellitkort for ${this.currentLocation.name}. Simulerer solhøjde, azimut, skyggelængde for person/træ/bygning og farvetemperatur gennem døgnet.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Aktuel retning: ${a.azimuth.toFixed(0)}° ${c.getCompassDirection(a.azimuth)}</span>
            <span style="color: var(--accent-sun); font-weight: 600;">Åbn FotoSol →</span>
          </div>
        </div>

        <!-- MODUL 3: FOTODOF -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-dof); cursor: pointer;" id="cardGoDof">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-dof-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-dof);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="12" y1="2" x2="12" y2="4"></line>
                  <line x1="12" y1="20" x2="12" y2="22"></line>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">FotoDOF</h2>
                <span style="font-size: 11px; color: var(--accent-dof); font-weight: 600; text-transform: uppercase;">Optik, Fokus & Bokeh</span>
              </div>
            </div>
            <span class="fs-badge badge-dof">100% Offline</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            Præcisionsberegner for dybdeskarphed, hyperfokalafstand, diffraktionsgrænser og bokeh med simuleret EVF-søger og optisk målestok.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Understøtter Mellemformat, Full Frame, APS-C, MFT & Mobil</span>
            <span style="color: var(--accent-dof); font-weight: 600;">Åbn FotoDOF →</span>
          </div>
        </div>

        <!-- OM PROJEKTET & ASTRO NAT INFO -->
        <div class="fs-card" style="font-size: 12px; color: var(--text-dim); line-height: 1.5;">
          <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">Om Fotografiske Signaler PWA</strong>
          Appen kører 100% lokalt i din browser og kan installeres på startskærmen af din mobil. Tryk på måne-ikonet øverst til højre for at aktivere rød nattilstand (skåner nattesynet ved astro- og aftenfotografering).
        </div>
      </div>
    `}attachEventListeners(){this.container.querySelector("#cardGoWeather")?.addEventListener("click",()=>{l.navigate("#/fotovejr")}),this.container.querySelector("#cardGoSun")?.addEventListener("click",()=>{l.navigate("#/fotosol")}),this.container.querySelector("#cardGoDof")?.addEventListener("click",()=>{l.navigate("#/fotodof")}),this.container.querySelector("#btnResumeLast")?.addEventListener("click",()=>{const e=u.getSettings();e.lastModule==="weather"?l.navigate("#/fotovejr"):e.lastModule==="sun"?l.navigate("#/fotosol"):e.lastModule==="dof"&&l.navigate("#/fotodof")});const n=this.container.querySelector("#homeSearchDropdown"),o=this.container.querySelector("#homeSearchInput"),a=this.container.querySelector("#homeSearchResults");this.container.querySelector("#btnOpenHomeLocation")?.addEventListener("click",()=>{this.searchOpen=!this.searchOpen,n.style.display=this.searchOpen?"block":"none",this.searchOpen&&o?.focus()}),this.container.querySelector("#btnHomeGps")?.addEventListener("click",async()=>{try{const e=this.container.querySelector("#btnHomeGps");e.style.opacity="0.5";const s=await i.requestGpsLocation();this.currentLocation=s,this.searchOpen=!1,this.render(),this.attachEventListeners(),e.style.opacity="1"}catch(e){alert(e.message)}});let r=null;o?.addEventListener("input",()=>{clearTimeout(r);const e=o.value.trim();if(e.length<2){a.innerHTML="";return}r=setTimeout(async()=>{const s=await i.search(e);a.innerHTML=s.map(t=>`
          <button class="fs-btn" data-lat="${t.lat}" data-lng="${t.lng}" data-name="${t.name}" style="text-align:left; justify-content:space-between; width:100%; padding:8px 12px;">
            <strong>${t.name}</strong>
            <span style="font-size:11px;color:var(--text-muted);">${t.sub}</span>
          </button>
        `).join(""),a.querySelectorAll("[data-lat]").forEach(t=>{t.addEventListener("click",()=>{const d=Number(t.dataset.lat),p=Number(t.dataset.lng),h=t.dataset.name||"Valgt by";this.currentLocation=i.setLocation({lat:d,lng:p,name:h,source:"search"}),this.searchOpen=!1,this.render(),this.attachEventListeners()})})},300)}),this.container.querySelectorAll("[data-spot-lat]").forEach(e=>{e.addEventListener("click",()=>{const s=e,t=Number(s.dataset.spotLat),d=Number(s.dataset.spotLng),p=s.dataset.spotName||"Fotospot";this.currentLocation=i.setLocation({lat:t,lng:d,name:p,source:"search"}),this.searchOpen=!1,this.render(),this.attachEventListeners()})})}getModuleName(n){return n==="weather"?"FotoVejr":n==="sun"?"FotoSol":n==="dof"?"FotoDOF":n}}export{y as default};
