import{S as p,R as o}from"./index-DwfRM-Y_.js";import{L as s,A as n,T as r,a as g}from"./LocationBar-DDjrBrVz.js";class x{container;currentLocation=s.getLocation();locationBar=null;unsubLocation=null;mount(e){this.container=e,this.currentLocation=s.getLocation(),this.render(),this.unsubLocation=s.subscribe(i=>{this.currentLocation=i,this.render()})}onActivate(){this.currentLocation=s.getLocation(),this.render()}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){const e=p.getSettings(),i=new Date,t=n.getSunPosition(i,this.currentLocation.lat,this.currentLocation.lng),a=n.getSunTimes(i,this.currentLocation.lat,this.currentLocation.lng),l=n.getLightPhase(t.altitude),c=e.lastModule!=="home"?e.lastModule:null;this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: var(--space-4); width: 100%;">
        <!-- VELKOMST HERO -->
        <div class="fs-card" style="padding: var(--space-5); text-align: center; border-color: var(--border-highlight); background: linear-gradient(180deg, rgba(22, 27, 34, 0.95) 0%, rgba(15, 18, 23, 0.9) 100%);">
          <div style="display: flex; justify-content: center; margin-bottom: 12px;">
            <img src="fotografiske-signaler-wordmark.png" alt="Fotografiske Signaler" style="max-height: 48px; width: auto;" onerror="this.style.display='none'">
          </div>
          <h1 style="font-size: 1.4rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px;">
            Fotografisk værktøjskasse
          </h1>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 480px; margin: 0 auto; line-height: 1.45;">
            Professionel fotografisk værktøjskasse. Vejranalyse, sol- og lysretning samt optiske DOF-beregninger samlet i én mobiloptimeret PWA.
          </p>

          <!-- Aktuel status bar med solinfo -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); border-top: 1px solid var(--border-subtle); padding-top: 12px; flex-wrap: wrap;">
            <span style="color: ${l.color}; font-weight: 700;">● ${l.name}</span>
            <span>•</span>
            <span>Sol ${t.altitude>=0?"+":""}${t.altitude.toFixed(0)}° (${t.azimuth.toFixed(0)}° ${n.getCompassDirection(t.azimuth)})</span>
            <span>•</span>
            <span>Solnedgang: ${r.formatTime(a.sunset)}</span>
          </div>
        </div>

        <!-- FÆLLES LOKATIONSVÆLGER (§4.2, §9.1) -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: -6px; padding: 0 2px;">
          <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted);">
            Valgt lokation
          </span>
          <span style="font-size: 11px; color: var(--text-dim);">
            Søg adresse eller brug GPS
          </span>
        </div>
        <div id="homeLocationMount"></div>

        ${c?`
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface-elevated); padding:10px 14px; border-radius:var(--radius-sm); border:1px solid var(--border-subtle);">
            <span style="font-size:12px; color:var(--text-muted);">Sidst anvendte værktøj:</span>
            <button class="fs-btn" id="btnResumeLast" style="padding:4px 12px; font-size:12px; min-height:28px;">
              Gå til ${this.getModuleName(c)} →
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
            <span>Solopgang: ${r.formatTime(a.sunrise)} • Solnedgang: ${r.formatTime(a.sunset)}</span>
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
            <span>Aktuel retning: ${t.azimuth.toFixed(0)}° ${n.getCompassDirection(t.azimuth)}</span>
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
    `;const d=this.container.querySelector("#homeLocationMount");d&&(this.locationBar=new g({container:d,accentClass:"fs-btn-accent-sun"})),this.attachEventListeners()}attachEventListeners(){this.container.querySelector("#cardGoWeather")?.addEventListener("click",()=>{o.navigate("#/fotovejr")}),this.container.querySelector("#cardGoSun")?.addEventListener("click",()=>{o.navigate("#/fotosol")}),this.container.querySelector("#cardGoDof")?.addEventListener("click",()=>{o.navigate("#/fotodof")}),this.container.querySelector("#btnResumeLast")?.addEventListener("click",()=>{const e=p.getSettings();e.lastModule==="weather"?o.navigate("#/fotovejr"):e.lastModule==="sun"?o.navigate("#/fotosol"):e.lastModule==="dof"&&o.navigate("#/fotodof")})}getModuleName(e){return e==="weather"?"FotoVejr":e==="sun"?"FotoSol":e==="dof"?"FotoDOF":e}}export{x as default};
