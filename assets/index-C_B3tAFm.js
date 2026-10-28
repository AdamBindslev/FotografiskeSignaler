import{S as g,R as t}from"./index-GOXJ5gGV.js";import{L as a,A as n,T as o,a as x}from"./LocationBar-CZCNmsGQ.js";class f{container;currentLocation=a.getLocation();locationBar=null;unsubLocation=null;mount(e){this.container=e,this.currentLocation=a.getLocation(),this.render(),this.unsubLocation=a.subscribe(r=>{this.currentLocation=r,this.render()})}onActivate(){this.currentLocation=a.getLocation(),this.render()}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}static escapeHtml(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}render(){const e=g.getSettings(),r=new Date,i=n.getSunPosition(r,this.currentLocation.lat,this.currentLocation.lng),s=n.getSunTimes(r,this.currentLocation.lat,this.currentLocation.lng),l=n.getLightPhase(i.altitude),c=e.lastModule!=="home"?e.lastModule:null,d=f.escapeHtml(this.currentLocation.name);this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
      <div style="display: flex; flex-direction: column; gap: var(--space-4); width: 100%;">
        <!-- VELKOMST HERO -->
        <div class="fs-card" style="padding: var(--space-5); text-align: center; border-color: var(--border-highlight); background: linear-gradient(180deg, rgba(22, 27, 34, 0.95) 0%, rgba(15, 18, 23, 0.9) 100%);">
          <h1 style="font-size: 1.4rem; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px;">
            Fotografisk værktøjskasse
          </h1>
          <p style="font-size: 13px; color: var(--text-muted); max-width: 480px; margin: 0 auto; line-height: 1.45;">
            Professionel fotografisk værktøjskasse. Vejranalyse, sol- og lysretning, optiske DOF-beregninger samt eksponering og ND-filter samlet i én mobiloptimeret PWA.
          </p>

          <!-- Aktuel status bar med solinfo -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 14px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); border-top: 1px solid var(--border-subtle); padding-top: 12px; flex-wrap: wrap;">
            <span style="color: ${l.color}; font-weight: 700;">● ${l.name}</span>
            <span>•</span>
            <span>Sol ${i.altitude>=0?"+":""}${i.altitude.toFixed(0)}° (${i.azimuth.toFixed(0)}° ${n.getCompassDirection(i.azimuth)})</span>
            <span>•</span>
            <span>Solnedgang: ${o.formatTime(s.sunset)}</span>
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

        <!-- MODUL 1: VEJR -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-weather); cursor: pointer;" id="cardGoWeather">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-weather-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-weather);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Vejr</h2>
                <span style="font-size: 11px; color: var(--accent-weather); font-weight: 600; text-transform: uppercase;">Atmosfære & Fotovinduer</span>
              </div>
            </div>
            <span class="fs-badge badge-weather">Vejr</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            7-døgns fotografisk vejranalyse for ${d}. Beregner morgentåge, gylden time-kvalitet, skydække i 3 lag og stjerneklart astro-vindue.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Solopgang: ${o.formatTime(s.sunrise)} • Solnedgang: ${o.formatTime(s.sunset)}</span>
            <span style="color: var(--accent-weather); font-weight: 600;">Åbn Vejr →</span>
          </div>
        </div>

        <!-- MODUL 2: SOL/MÅNE -->
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
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Sol/Måne</h2>
                <span style="font-size: 11px; color: var(--accent-sun); font-weight: 600; text-transform: uppercase;">Sol, Måne, Skygge & Lysretning</span>
              </div>
            </div>
            <span class="fs-badge badge-sun">3D, Kompas & Kort</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            Interaktiv 3D-søger, live kompas og satellitkort for ${d}. Simulerer sol- og måneretning, op-/nedgangsvinkler, skyggelængde og farvetemperatur.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>Aktuel solretning: ${i.azimuth.toFixed(0)}° ${n.getCompassDirection(i.azimuth)}</span>
            <span style="color: var(--accent-sun); font-weight: 600;">Åbn Sol/Måne →</span>
          </div>
        </div>

        <!-- MODUL 3: DOF -->
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
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">DOF</h2>
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
            <span style="color: var(--accent-dof); font-weight: 600;">Åbn DOF →</span>
          </div>
        </div>

        <!-- MODUL 4: EKSPONERING -->
        <div class="fs-card" style="border-left: 3px solid var(--accent-exposure); cursor: pointer;" id="cardGoExposure">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-exposure-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-exposure);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Eksponering</h2>
                <span style="font-size: 11px; color: var(--accent-exposure); font-weight: 600; text-transform: uppercase;">Trekant, ND & Bulb-Timer</span>
              </div>
            </div>
            <span class="fs-badge badge-exposure">100% Offline</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;">
            Interaktiv eksponeringstrekant med EV-lysmåler og dynamisk histogram. Beregner sikker håndholdt lukkertid, astro 500-reglen, ND-filter stacking og integreret Bulb-nedtællingstimer med Dark Frame.
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 8px; font-size: 11px; color: var(--text-dim);">
            <span>EV-lås, ND2–ND1000000 & Dark Frame (LENR)</span>
            <span style="color: var(--accent-exposure); font-weight: 600;">Åbn Eksponering →</span>
          </div>
        </div>

        <!-- FÆLLESSKAB & FEEDBACK PÅ DISCORD -->
        <div class="fs-card fs-card-discord">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; border-radius: var(--radius-sm); background: var(--accent-discord-glow); display: flex; align-items: center; justify-content: center; color: var(--accent-discord);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div>
                <h2 style="font-size: 15px; font-weight: 700; color: var(--text-main);">Fotofællesskab & Feedback</h2>
                <span style="font-size: 11px; color: var(--accent-discord); font-weight: 600; text-transform: uppercase;">Deltag på Discord</span>
              </div>
            </div>
            <span class="fs-badge" style="background: var(--accent-discord-glow); color: var(--accent-discord); border: 1px solid var(--accent-discord);">Community</span>
          </div>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.45; margin-bottom: 12px;">
            Sparring om fotospots, lysforhold og billeder – samt direkte dialog, ønsker og feedback til udviklingen af Fotografiske Signaler.
          </p>
          <div style="display: flex; justify-content: flex-start; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
            <a href="https://discord.gg/kCJW62P6k" target="_blank" rel="noopener noreferrer" class="fs-discord-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Bliv en del af fællesskabet på Discord ↗</span>
            </a>
          </div>
        </div>

        <!-- OM PROJEKTET, ASTRO NAT INFO & KONTAKT -->
        <div class="fs-card" style="font-size: 12px; color: var(--text-dim); line-height: 1.5; margin-bottom: 0;">
          <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">Om Fotografiske Signaler PWA</strong>
          <p style="margin-bottom: 10px;">
            Appen kører 100% lokalt i din browser og kan installeres på startskærmen af din mobil. Tryk på måne-ikonet øverst til højre for at aktivere rød nattilstand (skåner nattesynet ved astro- og aftenfotografering).
          </p>
          <div style="border-top: 1px solid var(--border-subtle); padding-top: 10px; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; color: var(--text-muted);">
            <span>Udtænkt og udgivet af <strong style="color: var(--text-main);">Fotografiske Signaler</strong> – se mere og kontakt</span>
            <a href="https://fotografiskesignaler.dk" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 4px; color: var(--accent-sun); font-weight: 700; text-decoration: none; padding: 3px 10px; border-radius: var(--radius-full); background: var(--accent-sun-glow); border: 1px solid rgba(245, 158, 11, 0.35);">
              fotografiskesignaler.dk ↗
            </a>
          </div>
        </div>
      </div>
    `;const p=this.container.querySelector("#homeLocationMount");p&&(this.locationBar=new x({container:p,accentClass:"fs-btn-accent-sun"})),this.attachEventListeners()}attachEventListeners(){this.container.querySelector("#cardGoWeather")?.addEventListener("click",()=>{t.navigate("#/vejr")}),this.container.querySelector("#cardGoSun")?.addEventListener("click",()=>{t.navigate("#/sol")}),this.container.querySelector("#cardGoDof")?.addEventListener("click",()=>{t.navigate("#/dof")}),this.container.querySelector("#cardGoExposure")?.addEventListener("click",()=>{t.navigate("#/eksponering")}),this.container.querySelector("#btnResumeLast")?.addEventListener("click",()=>{const e=g.getSettings();e.lastModule==="weather"?t.navigate("#/vejr"):e.lastModule==="sun"?t.navigate("#/sol"):e.lastModule==="dof"?t.navigate("#/dof"):e.lastModule==="exposure"&&t.navigate("#/eksponering")})}getModuleName(e){return e==="weather"?"Vejr":e==="sun"?"Sol/Måne":e==="dof"?"DOF":e==="exposure"?"Eksponering":e}}export{f as default};
