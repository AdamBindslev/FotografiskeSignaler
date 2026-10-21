const x=[{id:"nd2",name:"ND2",stops:1,ndFactor:2,opticalDensity:.3,description:"1 stop (Let lysdæmpning)"},{id:"cpl",name:"CPL Polfilter",stops:1.5,ndFactor:2.8,opticalDensity:.45,description:"~1.5 stops (Refleksioner)"},{id:"nd4",name:"ND4",stops:2,ndFactor:4,opticalDensity:.6,description:"2 stops (Mellem)"},{id:"nd8",name:"ND8",stops:3,ndFactor:8,opticalDensity:.9,description:"3 stops (Klassisk video/portræt)"},{id:"nd16",name:"ND16",stops:4,ndFactor:16,opticalDensity:1.2,description:"4 stops (Solskin portræt)"},{id:"nd32",name:"ND32",stops:5,ndFactor:32,opticalDensity:1.5,description:"5 stops"},{id:"nd64",name:"ND64",stops:6,ndFactor:64,opticalDensity:1.8,description:"6 stops (Vandfald & bevægelse)"},{id:"nd128",name:"ND128",stops:7,ndFactor:128,opticalDensity:2.1,description:"7 stops"},{id:"nd256",name:"ND256",stops:8,ndFactor:256,opticalDensity:2.4,description:"8 stops"},{id:"nd512",name:"ND512",stops:9,ndFactor:512,opticalDensity:2.7,description:"9 stops"},{id:"nd1000",name:"ND1000",stops:10,ndFactor:1024,opticalDensity:3,description:"10 stops (Big Stopper / Silkevand)"},{id:"nd2000",name:"ND2000",stops:11,ndFactor:2048,opticalDensity:3.3,description:"11 stops"},{id:"nd4000",name:"ND4000",stops:12,ndFactor:4096,opticalDensity:3.6,description:"12 stops"},{id:"nd32000",name:"ND32000",stops:15,ndFactor:32768,opticalDensity:4.5,description:"15 stops (Super Stopper)"},{id:"nd65000",name:"ND65000",stops:16,ndFactor:65536,opticalDensity:4.8,description:"16 stops"},{id:"nd1000000",name:"ND1000000",stops:20,ndFactor:1048576,opticalDensity:6,description:"20 stops (Solfotografering)"}],v=[1,1.2,1.4,1.8,2,2.2,2.5,2.8,3.2,3.5,4,4.5,5,5.6,6.3,7.1,8,9,10,11,13,14,16,18,20,22,32],T=[1,1.4,2,2.8,4,5.6,8,11,16,22,32],u=[1/8e3,1/6400,1/5e3,1/4e3,1/3200,1/2500,1/2e3,1/1600,1/1250,1/1e3,1/800,1/640,1/500,1/400,1/320,1/250,1/200,1/160,1/125,1/100,1/80,1/60,1/50,1/40,1/30,1/25,1/20,1/15,1/13,1/10,1/8,1/6,1/5,1/4,.3,.4,.5,.6,.8,1,1.3,1.6,2,2.5,3.2,4,5,6,8,10,13,15,20,25,30],g=[50,64,80,100,125,160,200,250,320,400,500,640,800,1e3,1250,1600,2e3,2500,3200,4e3,5e3,6400,8e3,1e4,12800,25600,51200],k=[{id:"birds_flight",category:"action",title:"🦅 Flyvende fugle & hurtig vildt",recommendedRange:"1/2000s – 1/4000s",minShutter:1/4e3,maxShutter:1/2e3,description:"Fryser lynhurtige vingeslag og dråber kastes fra vinger.",tip:"Brug blænde f/4 eller f/5.6 og lad Auto-ISO kompensere."},{id:"sports_action",category:"action",title:"⚽ Sport, løb & action",recommendedRange:"1/1000s – 1/2000s",minShutter:1/2e3,maxShutter:1/1e3,description:"Fryser intense bevægelser, bolde i luften og atleter.",tip:"Hurtig serieoptagelse og kontinuerlig autofokus (AF-C)."},{id:"children_pets",category:"action",title:"🐕 Børn & kæledyr i leg",recommendedRange:"1/500s – 1/1000s",minShutter:1/1e3,maxShutter:1/500,description:"Undgår bevægelsesuskarphed ved uforudsigelig leg.",tip:"Vær i øjenhøjde med motivet for den bedste dynamik."},{id:"street_walking",category:"creative",title:"🚶 Gadefoto & gående personer",recommendedRange:"1/250s – 1/500s",minShutter:1/500,maxShutter:1/250,description:"Fryser almindelig gang og byliv skarpt.",tip:"Glimrende zonefokus-hastighed ved f/5.6 eller f/8."},{id:"portrait_handheld",category:"handheld",title:"👤 Stillestående portræt",recommendedRange:"1/125s – 1/250s",minShutter:1/250,maxShutter:1/125,description:"Sikrer mod små mikrobevægelser og øjenblink.",tip:"Kombinér med stor blænde (f/1.4 - f/2.8) for blød bokeh."},{id:"water_texture",category:"creative",title:"🌊 Vandfald med tekstur & liv",recommendedRange:"1/8s – 1/2s",minShutter:.125,maxShutter:.5,description:"Bevarer vandets kraft og skumdråber med let slør.",tip:"Kræver stativ eller særdeles effektiv billedstabilisering."},{id:"silky_water",category:"creative",title:"✨ Silkeblødt hav & kystbølger",recommendedRange:"2s – 15s",minShutter:2,maxShutter:15,description:"Udjævner bølger til et drømmende slør omkring klipper.",tip:"Typisk oplagt med ND64 (6-stop) eller ND1000 (10-stop) filter."},{id:"stretched_clouds",category:"creative",title:"☁️ Strøgne skyer & spejlblankt vand",recommendedRange:"30s – 4 min",minShutter:30,maxShutter:240,description:"Total udglatning af vandoverflader og maleriske skytræk.",tip:"Brug kameraets Bulb-tilstand og appens indbyggede timer."},{id:"light_trails",category:"creative",title:"🚗 Biltrafik lysstriber i mørke",recommendedRange:"10s – 30s",minShutter:10,maxShutter:30,description:"Forvandler forlygter og baglygter til ubrudte lysbånd.",tip:"Blænde f/8-f/11 skaber flotte stjerneeffekter (starburst) på gadelamper."}];class c{static calculateEV100(t,e){return t<=0||e<=0?0:Math.log2(t*t/e)}static calculateEV(t,e,a){const s=this.calculateEV100(t,e),r=Math.log2(Math.max(1,a)/100);return s-r}static calculateMeterDelta(t,e,a,s){const r=this.calculateEV(t,e,a),o=s-r;return Math.max(-3,Math.min(3,o))}static solveShutter(t,e,a){const s=Math.pow(2,a)*(e/100);return s<=0?1/125:t*t/s}static solveAperture(t,e,a){const s=t*Math.pow(2,a)*(e/100);return s<=0?2.8:Math.sqrt(s)}static solveIso(t,e,a){const s=t*t,r=e*Math.pow(2,a);return r<=0?100:100*(s/r)}static findClosestValue(t,e){let a=e[0],s=Math.abs(t-a);for(const r of e){const o=Math.abs(t-r);o<s&&(s=o,a=r)}return a}static calculateHandheldShutter(t,e=1,a=0){const r=1/Math.max(10,t*e),o=Math.pow(2,Math.max(0,a)),d=r*o;return{baseSafeShutter:r,stabilizedSafeShutter:d,displayBase:this.formatShutterSpeed(r),displayStabilized:this.formatShutterSpeed(d),description:a>0?`Uden stabilisering: ${this.formatShutterSpeed(r)}. Med ${a} stops stabilisering kan du håndholde ned til ca. ${this.formatShutterSpeed(d)}.`:`Minimum ca. ${this.formatShutterSpeed(r)} håndholdt for at undgå rystelser med ${t}mm optik.`}}static calculateAstroShutter(t,e=1){const a=Math.max(10,t*e),s=500/a,r=300/a;return{rule500:s,rule300:r,display500:this.formatShutterSpeed(s),display300:this.formatShutterSpeed(r),tip:`Ved ${t}mm optik undgås stjernespor op til ${this.formatShutterSpeed(s)} (500-reglen) eller ${this.formatShutterSpeed(r)} (300-reglen til skarpe pixels).`}}static calculateNdExposure(t,e){const a=Math.pow(2,Math.max(0,e)),s=t*a,r=e*.30103;return{newShutter:s,factor:a,displayTime:this.formatShutterSpeed(s),opticalDensity:Number(r.toFixed(2)),requiresBulb:s>30}}static formatShutterSpeed(t){if(!Number.isFinite(t)||t<=0)return"0s";if(t<.45)return`1/${Math.round(1/t)}s`;if(t<2)return`${t.toFixed(1).replace(".",",")}s`;if(t<60)return`${Math.round(t)}s`;if(t<3600){const r=Math.floor(t/60),o=Math.round(t%60);return o>0?`${r}m ${o}s`:`${r}m`}const e=Math.floor(t/3600),a=Math.floor(t%3600/60),s=Math.round(t%60);return`${e}t ${a}m ${s}s`}static generateHistogramPath(t,e=240,a=70){const s=.5+t/6,r=Math.max(.1,Math.min(.9,s))*e,o=e*.18,d=[],h=40;for(let i=0;i<=h;i++){const l=i/h*e,p=l-r,m=Math.exp(-(p*p)/(2*o*o)),f=.08*Math.sin(l/e*Math.PI),y=Math.min(1,m*.9+f),b=a-y*(a-6);d.push([l,b])}let n=`M 0,${a}`;for(const[i,l]of d)n+=` L ${i.toFixed(1)},${l.toFixed(1)}`;return n+=` L ${e},${a} Z`,n}}class ${svgEl;meterEl;histSvgEl;statusTextEl;constructor(t,e,a,s){this.svgEl=t,this.meterEl=e,this.histSvgEl=a,this.statusTextEl=s}render(t){this.renderTriangle(t),this.renderMeter(t),this.renderHistogram(t)}renderTriangle(t){const i=Math.max(-3,Math.min(3,t.deltaEv)),l=i/3*22,p=-(i/3)*16,m=200+l,f=191+p;let y="var(--accent-exposure, #a855f7)",b="rgba(168, 85, 247, 0.4)";Math.abs(t.deltaEv)<=.33?(y="var(--accent-success, #10b981)",b="rgba(16, 185, 129, 0.5)"):t.deltaEv>1.5||t.deltaEv<-1.5?(y="var(--accent-danger, #ef4444)",b="rgba(239, 68, 68, 0.5)"):(y="var(--accent-warning, #f59e0b)",b="rgba(245, 158, 11, 0.5)"),this.svgEl.innerHTML=`
      <defs>
        <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="${b}" />
          <stop offset="100%" stop-color="transparent" />
        </radialGradient>
        <linearGradient id="edgeGradTopLeft" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="edgeGradTopRight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="edgeGradBottom" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#a855f7" stop-opacity="0.8" />
        </linearGradient>
      </defs>

      <!-- Trekant flade -->
      <polygon points="200,45 50,265 350,265"
               fill="var(--bg-surface-elevated, #161b22)"
               fill-opacity="0.55"
               stroke="var(--border-subtle, rgba(255,255,255,0.1))"
               stroke-width="1.5" />

      <!-- Vektorlinjer fra centrum til hjørner -->
      <line x1="200" y1="45" x2="200" y2="191" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
      <line x1="50" y1="265" x2="200" y2="191" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
      <line x1="350" y1="265" x2="200" y2="191" stroke="var(--border-subtle)" stroke-dasharray="3,3" />

      <!-- Farvede trekantkanter -->
      <line x1="200" y1="45" x2="50" y2="265" stroke="url(#edgeGradTopLeft)" stroke-width="2.5" />
      <line x1="200" y1="45" x2="350" y2="265" stroke="url(#edgeGradTopRight)" stroke-width="2.5" />
      <line x1="50" y1="265" x2="350" y2="265" stroke="url(#edgeGradBottom)" stroke-width="2.5" />

      <!-- Lysbalance glød i centrum -->
      <circle cx="${m}" cy="${f}" r="38" fill="url(#centerGlow)" />
      <circle cx="${m}" cy="${f}" r="8" fill="${y}" stroke="#ffffff" stroke-width="2" />
      <circle cx="${m}" cy="${f}" r="2" fill="#000000" />

      <!-- TOP VERTEX: BLÆNDE -->
      <g transform="translate(200, 45)">
        <circle cx="0" cy="0" r="22" fill="var(--bg-card, #0f1217)" stroke="#f59e0b" stroke-width="2" />
        <text x="0" y="-2" font-size="11" font-weight="800" fill="#f59e0b" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-mono)">f/${t.aperture}</text>
        <text x="0" y="8" font-size="8" fill="var(--text-muted)" text-anchor="middle" dominant-baseline="middle">BLÆNDE</text>
        <!-- Pædagogisk undertitel -->
        <text x="0" y="-28" font-size="10" font-weight="700" fill="var(--text-main)" text-anchor="middle">Dybdeskarphed & Lys</text>
      </g>

      <!-- VENSTRE VERTEX: LUKKERTID -->
      <g transform="translate(50, 265)">
        <circle cx="0" cy="0" r="24" fill="var(--bg-card, #0f1217)" stroke="#38bdf8" stroke-width="2" />
        <text x="0" y="-2" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-mono)">${c.formatShutterSpeed(t.shutter)}</text>
        <text x="0" y="8" font-size="8" fill="var(--text-muted)" text-anchor="middle" dominant-baseline="middle">LUKKER</text>
        <!-- Pædagogisk undertitel -->
        <text x="0" y="32" font-size="10" font-weight="700" fill="var(--text-main)" text-anchor="middle">Bevægelse & Frys</text>
      </g>

      <!-- HØJRE VERTEX: ISO -->
      <g transform="translate(350, 265)">
        <circle cx="0" cy="0" r="24" fill="var(--bg-card, #0f1217)" stroke="#a855f7" stroke-width="2" />
        <text x="0" y="-2" font-size="11" font-weight="800" fill="#a855f7" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-mono)">${t.iso}</text>
        <text x="0" y="8" font-size="8" fill="var(--text-muted)" text-anchor="middle" dominant-baseline="middle">ISO</text>
        <!-- Pædagogisk undertitel -->
        <text x="0" y="32" font-size="10" font-weight="700" fill="var(--text-main)" text-anchor="middle">Lysfølsomhed & Støj</text>
      </g>

      <!-- Center EV Badge -->
      <g transform="translate(200, 236)">
        <rect x="-42" y="-12" width="84" height="24" rx="12" fill="var(--bg-surface-elevated, #161b22)" stroke="var(--border-subtle)" />
        <text x="0" y="1" font-size="10" font-weight="700" fill="var(--text-main)" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-mono)">EV ${t.evCurrent.toFixed(1)}</text>
      </g>
    `}renderMeter(t){const a=(Math.max(-3,Math.min(3,t.deltaEv))+3)/6*100;let s=`${t.deltaEv>=0?"+":""}${t.deltaEv.toFixed(1)} EV`,r="status-balanced",o="Balanceret eksponering",d="Kombinationen matcher scenens belysning neutralt.";t.deltaEv<=-.33?(r="status-under",o=`Undereksponeret (${s})`,d="Billedet bliver for mørkt. Åbn blænden, forlæng lukkertiden eller hæv ISO."):t.deltaEv>=.33&&(r="status-over",o=`Overeksponeret (${s})`,d="Billedet bliver for lyst / udbrændt. Luk blænden, afkort lukkertiden eller sænk ISO."),this.meterEl.innerHTML=`
      <div class="ev-meter-scale">
        <div class="meter-tick" style="left: 0%;"><span>-3</span></div>
        <div class="meter-tick" style="left: 16.66%;"><span>-2</span></div>
        <div class="meter-tick" style="left: 33.33%;"><span>-1</span></div>
        <div class="meter-tick center" style="left: 50%;"><span>0</span></div>
        <div class="meter-tick" style="left: 66.66%;"><span>+1</span></div>
        <div class="meter-tick" style="left: 83.33%;"><span>+2</span></div>
        <div class="meter-tick" style="left: 100%;"><span>+3</span></div>
        
        <!-- Nål -->
        <div class="meter-needle ${r}" style="left: ${a}%;"></div>
      </div>
    `,this.statusTextEl.innerHTML=`
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <span class="fs-badge badge-${r}">${o}</span>
        <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">${t.evLock?"🔒 EV LÅST":"Målværdi: EV "+t.targetEv.toFixed(1)}</span>
      </div>
      <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin: 0;">${d}</p>
    `}renderHistogram(t){const s=c.generateHistogramPath(t.deltaEv,240,60),r=t.deltaEv<-1.8,o=t.deltaEv>1.8;this.histSvgEl.setAttribute("viewBox","0 0 240 60"),this.histSvgEl.innerHTML=`
      <defs>
        <linearGradient id="histGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="var(--accent-exposure, #a855f7)" stop-opacity="0.8" />
          <stop offset="100%" stop-color="var(--accent-exposure, #a855f7)" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- Histogram grid linjer for zoner (skygger, mellemtoner, højlys) -->
      <line x1="${240*.33}" y1="0" x2="${240*.33}" y2="60" stroke="var(--border-subtle)" stroke-dasharray="2,2" />
      <line x1="${240*.66}" y1="0" x2="${240*.66}" y2="60" stroke="var(--border-subtle)" stroke-dasharray="2,2" />

      <!-- Selve kurven -->
      <path d="${s}" fill="url(#histGradient)" stroke="var(--accent-exposure, #a855f7)" stroke-width="1.5" />

      <!-- Clipping indikatorer i kanterne -->
      ${r?'<rect x="0" y="0" width="4" height="60" fill="var(--accent-danger, #ef4444)" opacity="0.9" />':""}
      ${o?'<rect x="236" y="0" width="4" height="60" fill="var(--accent-danger, #ef4444)" opacity="0.9" />':""}
    `}}const E={aperture:8,shutter:1/125,iso:100,targetEv:13,evLock:!1,handheldFocal:50,handheldCrop:1,handheldIbis:0,ndBaseShutter:1/125,selectedNdIds:["nd1000"],timerDurationSec:60,timerDarkFrame:!1},N=[{name:"Fuld sol",ev:15,tip:"Klar solskin (Sunny 16)"},{name:"Overskyet",ev:12,tip:"Diffust dagslys"},{name:"Gylden time",ev:9,tip:"Solopgang / Solnedgang"},{name:"Indendørs",ev:6,tip:"Hjemme- eller galleribelysning"},{name:"By om natten",ev:3,tip:"Gadebelysning & neonskilte"}];class L{container;visualizer=null;state={...E};activeTab="triangle";timerInterval=null;timerRemainingSec=60;timerTotalSec=60;timerPhase="idle";timerRunning=!1;mount(t){this.container=t,this.loadState(),this.render(),this.attachEventListeners(),this.updateAllViews()}onActivate(t){if(t?.params){const e=t.params;if(e.has("tab")){const a=e.get("tab");["triangle","shutter","nd","timer"].includes(a)&&this.switchTab(a)}}}onDeactivate(){}destroy(){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.visualizer=null}loadState(){try{const t=localStorage.getItem("fs_exposure_state_v1");t&&(this.state={...E,...JSON.parse(t)})}catch(t){console.warn("Kunne ikke hente gemt tilstand for Eksponering:",t)}}saveState(){try{localStorage.setItem("fs_exposure_state_v1",JSON.stringify(this.state))}catch(t){console.warn("Kunne ikke gemme tilstand for Eksponering:",t)}}render(){const t=T.map(n=>`<button class="quick-val-btn ${n===this.state.aperture?"active":""}" data-aperture="${n}">f/${n}</button>`).join(""),e=[1/1e3,1/500,1/250,1/125,1/60,1/15,1/2,1,4,15,30].map(n=>`<button class="quick-val-btn ${Math.abs(n-this.state.shutter)<1e-4?"active":""}" data-shutter="${n}">${c.formatShutterSpeed(n)}</button>`).join(""),a=[100,200,400,800,1600,3200,6400].map(n=>`<button class="quick-val-btn ${n===this.state.iso?"active":""}" data-iso="${n}">ISO ${n}</button>`).join(""),s=x.map(n=>`
        <button class="nd-filter-btn ${this.state.selectedNdIds.includes(n.id)?"active":""}" data-nd-id="${n.id}">
          <div class="nd-btn-name">${n.name}</div>
          <div class="nd-btn-stops">${n.stops>=0?"+":""}${n.stops} ${n.stops===1?"stop":"stops"}</div>
          <div class="nd-btn-density">OD ${n.opticalDensity.toFixed(1)}</div>
        </button>
      `).join("");this.container.innerHTML=`
      <div class="exposure-container">
        <!-- TOP HEADER -->
        <div class="exposure-header">
          <div class="exposure-module-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="2" x2="12" y2="6"></line>
              <line x1="12" y1="18" x2="12" y2="22"></line>
              <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
              <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
              <line x1="2" y1="12" x2="6" y2="12"></line>
              <line x1="18" y1="12" x2="22" y2="12"></line>
            </svg>
            <span>Eksponering • Lysberegner</span>
          </div>
          <span class="fs-badge" id="expCurrentEvBadge">EV 13.0</span>
        </div>

        <!-- HOVED FANE-VÆLGER -->
        <div class="fs-segmented-control" style="width: 100%;">
          <button class="fs-segment-btn ${this.activeTab==="triangle"?"active":""}" data-exp-tab="triangle">📐 Trekant</button>
          <button class="fs-segment-btn ${this.activeTab==="shutter"?"active":""}" data-exp-tab="shutter">⏱️ Lukkertid</button>
          <button class="fs-segment-btn ${this.activeTab==="nd"?"active":""}" data-exp-tab="nd">🔲 ND-filter</button>
          <button class="fs-segment-btn ${this.activeTab==="timer"?"active":""}" data-exp-tab="timer">⏳ Bulb Timer</button>
        </div>

        <!-- ==================== FANE 1: EKSPONERINGSTREKANT ==================== -->
        <div id="tabContentTriangle" style="${this.activeTab==="triangle"?"":"display: none;"}">
          <!-- HERO CARD MED SVG TREKANT -->
          <div class="exposure-hero-card">
            <div class="exposure-hero-header">
              <div class="hero-title-group">
                <span class="hero-main-title">Eksponeringstrekanten</span>
                <span class="hero-sub-title">Samspillet mellem blænde, lukkertid & ISO</span>
              </div>
              <button class="fs-btn ${this.state.evLock?"active":""}" id="btnToggleEvLock" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">
                ${this.state.evLock?"🔒 EV Låst":"🔓 Fri måling"}
              </button>
            </div>

            <!-- SVG Diagram -->
            <div class="triangle-svg-wrap">
              <svg class="triangle-svg" id="expTriangleSvg" viewBox="0 0 400 320"></svg>
            </div>

            <!-- EV Lysmåler Bar -->
            <div class="ev-meter-wrap" id="expMeterWrap"></div>

            <!-- Dynamisk Histogram -->
            <div class="histogram-card">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Simuleret Tonal Fordeling</span>
                <span style="font-size: 10px; color: var(--text-dim);">Skygger • Mellemtoner • Højlys</span>
              </div>
              <svg class="hist-svg" id="expHistSvg"></svg>
              <div class="hist-labels">
                <span>0 (Sort)</span>
                <span>Mellem</span>
                <span>255 (Hvid)</span>
              </div>
            </div>

            <!-- Status Tekst -->
            <div id="expStatusTextWrap"></div>
          </div>

          <!-- KONTROLPANEL FOR TREKANT -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Kameraindstillinger</span>
              <div style="display: flex; gap: 4px;" id="scenePresetWrap">
                <select class="fs-btn" id="scenePresetSelect" style="padding: 3px 8px; font-size: 11px; min-height: 26px;">
                  <option value="" disabled selected>Vælg lysscene...</option>
                  ${N.map(n=>`<option value="${n.ev}">${n.name} (EV ${n.ev})</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- 1. BLÆNDE (Aperture) -->
            <div class="fs-slider-wrap">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Blænde (Aperture)</span>
                <span class="fs-slider-val" id="dispAperture" style="color: #f59e0b;">f/${this.state.aperture}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnApertureMinus" aria-label="Større blænde">-</button>
                <input type="range" id="sliderAperture" min="0" max="${v.length-1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnAperturePlus" aria-label="Mindre blænde">+</button>
              </div>
              <div class="quick-btn-scroll" id="apertureQuickScroll">
                ${t}
              </div>
            </div>

            <!-- 2. LUKKERTID (Shutter) -->
            <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Lukkertid (Shutter Speed)</span>
                <span class="fs-slider-val" id="dispShutter" style="color: #38bdf8;">${c.formatShutterSpeed(this.state.shutter)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnShutterMinus" aria-label="Hurtigere lukker">-</button>
                <input type="range" id="sliderShutter" min="0" max="${u.length-1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnShutterPlus" aria-label="Langsommere lukker">+</button>
              </div>
              <div class="quick-btn-scroll" id="shutterQuickScroll">
                ${e}
              </div>
            </div>

            <!-- 3. ISO FØLSOMHED -->
            <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Lysfølsomhed (ISO)</span>
                <span class="fs-slider-val" id="dispIso" style="color: #a855f7;">ISO ${this.state.iso}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnIsoMinus" aria-label="Lavere ISO">-</button>
                <input type="range" id="sliderIso" min="0" max="${g.length-1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnIsoPlus" aria-label="Højere ISO">+</button>
              </div>
              <div class="quick-btn-scroll" id="isoQuickScroll">
                ${a}
              </div>
            </div>

            <!-- HANDLINGER -->
            <div style="display: flex; justify-content: flex-end; margin-top: 14px; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
              <button class="fs-btn" id="btnTransferToNd" style="padding: 6px 12px; font-size: 12px; min-height: 32px;">
                Brug denne lukkertid i ND-filter →
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== FANE 2: LUKKERTID & BEVÆGELSE ==================== -->
        <div id="tabContentShutter" style="${this.activeTab==="shutter"?"":"display: none;"}">
          <!-- HÅNDHOLDT RYSTEREGEL KORT -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Håndholdt Rysteregel</span>
              <span class="fs-badge" id="handheldResultBadge">1/50s</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;" id="handheldAdviceText">
              Den reciprokke regel (1/brændvidde) beregner den længste sikre håndholdte lukkertid uden slør fra kamerarystelser.
            </p>

            <div class="fs-slider-wrap">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Optik Brændvidde</span>
                <span class="fs-slider-val" id="dispHHandheldFocal">${this.state.handheldFocal} mm</span>
              </div>
              <input type="range" id="sliderHandheldFocal" min="10" max="600" step="1" value="${this.state.handheldFocal}">
              <div class="quick-btn-scroll">
                ${[24,35,50,85,135,200,400].map(n=>`<button class="quick-val-btn ${n===this.state.handheldFocal?"active":""}" data-focal-h="${n}">${n}mm</button>`).join("")}
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;">
              <div>
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 4px;">Sensorformat</label>
                <select class="fs-btn" id="selectHandheldCrop" style="width: 100%; padding: 8px; font-size: 12px;">
                  <option value="1.0" ${this.state.handheldCrop===1?"selected":""}>Full Frame [1.0×]</option>
                  <option value="1.5" ${this.state.handheldCrop===1.5?"selected":""}>APS-C [1.5×]</option>
                  <option value="2.0" ${this.state.handheldCrop===2?"selected":""}>Micro Four Thirds [2.0×]</option>
                </select>
              </div>

              <div>
                <label style="font-size: 11px; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 4px;">Billedstabilisering (IBIS / IS)</label>
                <select class="fs-btn" id="selectHandheldIbis" style="width: 100%; padding: 8px; font-size: 12px;">
                  <option value="0" ${this.state.handheldIbis===0?"selected":""}>Ingen stabilisering</option>
                  <option value="2" ${this.state.handheldIbis===2?"selected":""}>2 stops (Let IS)</option>
                  <option value="3" ${this.state.handheldIbis===3?"selected":""}>3 stops (Standard)</option>
                  <option value="4" ${this.state.handheldIbis===4?"selected":""}>4 stops (Moderne)</option>
                  <option value="5" ${this.state.handheldIbis===5?"selected":""}>5 stops (Effektiv IBIS)</option>
                  <option value="6" ${this.state.handheldIbis===6?"selected":""}>6 stops (Avanceret sync)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ASTRO 500-REGLEN KORT -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Astrofoto • Punktformede Stjerner</span>
              <span class="fs-badge" style="background: rgba(168, 85, 247, 0.2); color: #c084fc;" id="astro500Badge">--</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 8px;" id="astroRuleDesc"></p>
            <div style="display: flex; gap: 8px; font-size: 11px; font-family: var(--font-mono); color: var(--text-dim);">
              <span>500-reglen: <strong id="astroT500" style="color: var(--text-main);">--</strong></span>
              <span>•</span>
              <span>300-reglen (højopløst): <strong id="astroT300" style="color: var(--text-main);">--</strong></span>
            </div>
          </div>

          <!-- MOTIV SCENARIER -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Motivscenarier & Frysning</span>
              <span style="font-size: 11px; color: var(--text-dim);">Klik for at vælge tid</span>
            </div>
            <div class="shutter-scenarios-grid">
              ${k.map(n=>`
                <div class="shutter-scenario-card" data-scenario-id="${n.id}">
                  <div class="scenario-header-row">
                    <strong style="font-size: 13px; color: var(--text-main);">${n.title}</strong>
                    <span class="scenario-badge-time">${n.recommendedRange}</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${n.description}</p>
                  <span style="font-size: 11px; color: var(--text-dim); font-style: italic;">💡 ${n.tip}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- ==================== FANE 3: ND-FILTER BEREGNER ==================== -->
        <div id="tabContentNd" style="${this.activeTab==="nd"?"":"display: none;"}">
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">ND-Filterberegner & Stacking</span>
              <button class="fs-btn" id="btnSyncFromTriangle" style="padding: 3px 8px; font-size: 11px; min-height: 26px;">
                🔄 Hent lukkertid fra trekant
              </button>
            </div>

            <!-- Basislukkertid -->
            <div class="fs-slider-wrap">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Basiseksponering (Uden filter)</span>
                <span class="fs-slider-val" id="dispNdBase" style="color: #38bdf8;">${c.formatShutterSpeed(this.state.ndBaseShutter)}</span>
              </div>
              <input type="range" id="sliderNdBase" min="0" max="${u.length-1}" step="1" value="0">
              <div class="quick-btn-scroll" id="ndBaseQuickScroll">
                ${[1/1e3,1/500,1/250,1/125,1/60,1/30,1/15,1/4,1].map(n=>`
                  <button class="quick-val-btn ${Math.abs(n-this.state.ndBaseShutter)<1e-4?"active":""}" data-nd-base="${n}">
                    ${c.formatShutterSpeed(n)}
                  </button>
                `).join("")}
              </div>
            </div>

            <!-- Vælg filtre (Multi-selection) -->
            <div style="margin-top: var(--space-4);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">
                  Monterede filtre (Kombinér flere / stacking)
                </span>
                <button class="fs-btn" id="btnClearFilters" style="padding: 2px 6px; font-size: 10px; min-height: 22px;">Nulstil filtre</button>
              </div>
              <div class="nd-filters-grid" id="ndFiltersGrid">
                ${s}
              </div>
            </div>

            <!-- RESULTAT HERO BOX -->
            <div class="nd-result-box">
              <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--accent-exposure, #a855f7); letter-spacing: 0.06em;">
                Ny Beregnet Eksponeringstid
              </div>
              <div class="nd-calc-value" id="dispNdFinalTime">--</div>
              <div style="display: flex; justify-content: center; gap: 14px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">
                <span>Total reduktion: <strong id="dispNdTotalStops" style="color: var(--text-main);">0 stops</strong></span>
                <span>•</span>
                <span>Faktor: <strong id="dispNdFactor" style="color: var(--text-main);">1×</strong></span>
                <span>•</span>
                <span>Optisk Densitet: <strong id="dispNdOd" style="color: var(--text-main);">0.0</strong></span>
              </div>
              <div style="display: flex; justify-content: center; gap: 8px; margin-top: 4px;">
                <button class="fs-btn fs-btn-accent-sun" id="btnTransferToTimer" style="padding: 8px 16px; font-size: 13px; font-weight: 700; min-height: 36px;">
                  ⏳ Start Bulb Timer med denne tid →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== FANE 4: LANGTIDSEKSPONERING & BULB TIMER ==================== -->
        <div id="tabContentTimer" style="${this.activeTab==="timer"?"":"display: none;"}">
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Bulb Nedtællingstimer</span>
              <span class="fs-badge" id="timerStatusBadge">Klar</span>
            </div>

            <!-- Cirkulær Timer Visualisering -->
            <div class="bulb-timer-wrap">
              <div class="timer-circle-wrap">
                <svg class="timer-svg" viewBox="0 0 200 200">
                  <circle class="timer-circle-bg" cx="100" cy="100" r="85"></circle>
                  <circle class="timer-circle-progress" id="timerCircleProgress" cx="100" cy="100" r="85"
                          stroke-dasharray="534.07"
                          stroke-dashoffset="0"></circle>
                </svg>
                <div class="timer-display-inner">
                  <div class="timer-time-main" id="timerDisplayNumber">01:00</div>
                  <div class="timer-phase-label" id="timerPhaseLabel">Eksponering</div>
                </div>
              </div>

              <!-- Start / Pause / Reset kontroller -->
              <div class="timer-controls-row">
                <button class="fs-btn fs-btn-accent-sun" id="btnTimerStartPause" style="flex: 2; min-height: 44px; font-weight: 700; font-size: 15px;">
                  Start Optagelse
                </button>
                <button class="fs-btn" id="btnTimerReset" style="flex: 1; min-height: 44px;">
                  Nulstil
                </button>
              </div>

              <!-- Hurtige forudindstillinger for tid -->
              <div class="quick-btn-scroll" style="justify-content: center; width: 100%;">
                ${[15,30,60,120,240,480].map(n=>`
                  <button class="quick-val-btn ${n===this.state.timerDurationSec?"active":""}" data-timer-preset="${n}">
                    ${c.formatShutterSpeed(n)}
                  </button>
                `).join("")}
              </div>
            </div>

            <!-- LENR Dark Frame Toggle -->
            <div style="background: var(--bg-surface-elevated); padding: 12px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-top: 10px; display: flex; align-items: center; justify-content: space-between;">
              <div>
                <strong style="font-size: 13px; color: var(--text-main); display: block;">Dark Frame (LENR)</strong>
                <span style="font-size: 11px; color: var(--text-muted); line-height: 1.3; display: block;">
                  Tæller automatisk ekstra tid til kameraets indbyggede støjreduktion
                </span>
              </div>
              <input type="checkbox" id="checkDarkFrame" ${this.state.timerDarkFrame?"checked":""} style="width: 18px; height: 18px; cursor: pointer;">
            </div>

            <!-- Pædagogisk Tjekliste -->
            <div style="margin-top: var(--space-4); border-top: 1px solid var(--border-subtle); padding-top: 12px;">
              <strong style="font-size: 12px; color: var(--text-main); text-transform: uppercase; display: block; margin-bottom: 6px;">
                Tjekliste til Langtidseksponering
              </strong>
              <ul style="font-size: 12px; color: var(--text-muted); padding-left: 18px; line-height: 1.5; margin: 0;">
                <li><strong>Solidt stativ:</strong> Placer på fast underlag og træk midtersøjlen helt ned i blæsevejr.</li>
                <li><strong>Slå billedstabilisering (IBIS) FRA:</strong> På stativ kan gyroen skabe mikroskopiske rystelser.</li>
                <li><strong>Dæk den optiske søger til:</strong> Forhindrer strølys i at sive ind og forringe kontrasten under lange eksponeringer.</li>
                <li><strong>Trådløs udløser eller 2s selvudløser:</strong> Undgå at berøre kameraet i affyringsøjeblikket.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;const r=this.container.querySelector("#expTriangleSvg"),o=this.container.querySelector("#expMeterWrap"),d=this.container.querySelector("#expHistSvg"),h=this.container.querySelector("#expStatusTextWrap");r&&o&&d&&h&&(this.visualizer=new $(r,o,d,h)),this.syncSlidersFromState()}attachEventListeners(){this.container.querySelectorAll("[data-exp-tab]").forEach(i=>{i.addEventListener("click",()=>{const l=i.dataset.expTab;this.switchTab(l)})}),this.container.querySelector("#btnToggleEvLock")?.addEventListener("click",()=>{this.state.evLock=!this.state.evLock;const i=this.container.querySelector("#btnToggleEvLock");i&&(i.classList.toggle("active",this.state.evLock),i.textContent=this.state.evLock?"🔒 EV Låst":"🔓 Fri måling"),this.updateTriangleView(),this.saveState()});const t=this.container.querySelector("#scenePresetSelect");t?.addEventListener("change",()=>{const i=Number(t.value);Number.isFinite(i)&&(this.state.targetEv=i,this.state.evLock&&(this.state.shutter=c.solveShutter(this.state.aperture,this.state.iso,this.state.targetEv)),this.syncSlidersFromState(),this.updateTriangleView(),this.saveState())});const e=this.container.querySelector("#sliderAperture");e?.addEventListener("input",()=>{const i=Number(e.value),l=v[i]||8;this.handleApertureChange(l)}),this.container.querySelector("#btnApertureMinus")?.addEventListener("click",()=>{const i=v.indexOf(this.state.aperture);i>0&&this.handleApertureChange(v[i-1])}),this.container.querySelector("#btnAperturePlus")?.addEventListener("click",()=>{const i=v.indexOf(this.state.aperture);i<v.length-1&&this.handleApertureChange(v[i+1])}),this.container.querySelectorAll("[data-aperture]").forEach(i=>{i.addEventListener("click",()=>{const l=Number(i.dataset.aperture);this.handleApertureChange(l)})});const a=this.container.querySelector("#sliderShutter");a?.addEventListener("input",()=>{const i=Number(a.value),l=u[i]||1/125;this.handleShutterChange(l)}),this.container.querySelector("#btnShutterMinus")?.addEventListener("click",()=>{const i=u.indexOf(this.state.shutter);i>0&&this.handleShutterChange(u[i-1])}),this.container.querySelector("#btnShutterPlus")?.addEventListener("click",()=>{const i=u.indexOf(this.state.shutter);i<u.length-1&&this.handleShutterChange(u[i+1])}),this.container.querySelectorAll("[data-shutter]").forEach(i=>{i.addEventListener("click",()=>{const l=Number(i.dataset.shutter);this.handleShutterChange(l)})});const s=this.container.querySelector("#sliderIso");s?.addEventListener("input",()=>{const i=Number(s.value),l=g[i]||100;this.handleIsoChange(l)}),this.container.querySelector("#btnIsoMinus")?.addEventListener("click",()=>{const i=g.indexOf(this.state.iso);i>0&&this.handleIsoChange(g[i-1])}),this.container.querySelector("#btnIsoPlus")?.addEventListener("click",()=>{const i=g.indexOf(this.state.iso);i<g.length-1&&this.handleIsoChange(g[i+1])}),this.container.querySelectorAll("[data-iso]").forEach(i=>{i.addEventListener("click",()=>{const l=Number(i.dataset.iso);this.handleIsoChange(l)})}),this.container.querySelector("#btnTransferToNd")?.addEventListener("click",()=>{this.state.ndBaseShutter=this.state.shutter,this.switchTab("nd"),this.updateNdView(),this.saveState()});const r=this.container.querySelector("#sliderHandheldFocal");r?.addEventListener("input",()=>{this.state.handheldFocal=Number(r.value),this.updateHandheldView(),this.saveState()}),this.container.querySelectorAll("[data-focal-h]").forEach(i=>{i.addEventListener("click",()=>{const l=Number(i.dataset.focalH);this.state.handheldFocal=l,r&&(r.value=String(l)),this.updateHandheldView(),this.saveState()})});const o=this.container.querySelector("#selectHandheldCrop");o?.addEventListener("change",()=>{this.state.handheldCrop=Number(o.value),this.updateHandheldView(),this.saveState()});const d=this.container.querySelector("#selectHandheldIbis");d?.addEventListener("change",()=>{this.state.handheldIbis=Number(d.value),this.updateHandheldView(),this.saveState()}),this.container.querySelectorAll("[data-scenario-id]").forEach(i=>{i.addEventListener("click",()=>{const l=i.dataset.scenarioId,p=k.find(m=>m.id===l);if(p){const m=(p.minShutter+p.maxShutter)/2,f=c.findClosestValue(m,u);this.handleShutterChange(f),this.switchTab("triangle")}})});const h=this.container.querySelector("#sliderNdBase");h?.addEventListener("input",()=>{const i=Number(h.value);this.state.ndBaseShutter=u[i]||1/125,this.updateNdView(),this.saveState()}),this.container.querySelectorAll("[data-nd-base]").forEach(i=>{i.addEventListener("click",()=>{const l=Number(i.dataset.ndBase);if(this.state.ndBaseShutter=l,h){const p=u.indexOf(l);p!==-1&&(h.value=String(p))}this.updateNdView(),this.saveState()})}),this.container.querySelector("#btnSyncFromTriangle")?.addEventListener("click",()=>{this.state.ndBaseShutter=this.state.shutter,this.updateNdView(),this.saveState()}),this.container.querySelectorAll("[data-nd-id]").forEach(i=>{i.addEventListener("click",()=>{const l=i.dataset.ndId,p=this.state.selectedNdIds.indexOf(l);p>=0?this.state.selectedNdIds.splice(p,1):this.state.selectedNdIds.push(l),this.updateNdView(),this.saveState()})}),this.container.querySelector("#btnClearFilters")?.addEventListener("click",()=>{this.state.selectedNdIds=[],this.updateNdView(),this.saveState()}),this.container.querySelector("#btnTransferToTimer")?.addEventListener("click",()=>{const i=this.calculateTotalNdStops(),l=c.calculateNdExposure(this.state.ndBaseShutter,i);this.setTimerDuration(Math.round(l.newShutter)),this.switchTab("timer")}),this.container.querySelector("#btnTimerStartPause")?.addEventListener("click",()=>{this.toggleTimer()}),this.container.querySelector("#btnTimerReset")?.addEventListener("click",()=>{this.resetTimer()}),this.container.querySelectorAll("[data-timer-preset]").forEach(i=>{i.addEventListener("click",()=>{const l=Number(i.dataset.timerPreset);this.setTimerDuration(l)})});const n=this.container.querySelector("#checkDarkFrame");n?.addEventListener("change",()=>{this.state.timerDarkFrame=n.checked,this.saveState()})}switchTab(t){this.activeTab=t,this.container.querySelectorAll(".fs-segment-btn").forEach(o=>{o.classList.toggle("active",o.dataset.expTab===t)});const e=this.container.querySelector("#tabContentTriangle"),a=this.container.querySelector("#tabContentShutter"),s=this.container.querySelector("#tabContentNd"),r=this.container.querySelector("#tabContentTimer");e&&(e.style.display=t==="triangle"?"block":"none"),a&&(a.style.display=t==="shutter"?"block":"none"),s&&(s.style.display=t==="nd"?"block":"none"),r&&(r.style.display=t==="timer"?"block":"none"),this.updateAllViews()}handleApertureChange(t){if(this.state.aperture=t,this.state.evLock){const e=c.solveShutter(this.state.aperture,this.state.iso,this.state.targetEv);this.state.shutter=c.findClosestValue(e,u)}this.syncSlidersFromState(),this.updateTriangleView(),this.saveState()}handleShutterChange(t){if(this.state.shutter=t,this.state.evLock){const e=c.solveAperture(this.state.shutter,this.state.iso,this.state.targetEv);this.state.aperture=c.findClosestValue(e,v)}this.syncSlidersFromState(),this.updateTriangleView(),this.saveState()}handleIsoChange(t){if(this.state.iso=t,this.state.evLock){const e=c.solveShutter(this.state.aperture,this.state.iso,this.state.targetEv);this.state.shutter=c.findClosestValue(e,u)}this.syncSlidersFromState(),this.updateTriangleView(),this.saveState()}syncSlidersFromState(){const t=this.container.querySelector("#sliderAperture"),e=this.container.querySelector("#sliderShutter"),a=this.container.querySelector("#sliderIso");if(t){const s=v.indexOf(this.state.aperture);s!==-1&&(t.value=String(s))}if(e){const s=u.indexOf(this.state.shutter);s!==-1&&(e.value=String(s))}if(a){const s=g.indexOf(this.state.iso);s!==-1&&(a.value=String(s))}this.container.querySelectorAll("[data-aperture]").forEach(s=>{const r=Number(s.dataset.aperture);s.classList.toggle("active",Math.abs(r-this.state.aperture)<.05)}),this.container.querySelectorAll("[data-shutter]").forEach(s=>{const r=Number(s.dataset.shutter);s.classList.toggle("active",Math.abs(r-this.state.shutter)<1e-4)}),this.container.querySelectorAll("[data-iso]").forEach(s=>{const r=Number(s.dataset.iso);s.classList.toggle("active",r===this.state.iso)})}updateAllViews(){this.updateTriangleView(),this.updateHandheldView(),this.updateNdView(),this.updateTimerDisplay()}updateTriangleView(){const t=c.calculateEV100(this.state.aperture,this.state.shutter),e=c.calculateEV(this.state.aperture,this.state.shutter,this.state.iso);this.state.evLock&&(this.state.targetEv=e);const a=c.calculateMeterDelta(this.state.aperture,this.state.shutter,this.state.iso,this.state.targetEv),s=this.container.querySelector("#expCurrentEvBadge");s&&(s.textContent=`EV ${e.toFixed(1)}`);const r=this.container.querySelector("#dispAperture"),o=this.container.querySelector("#dispShutter"),d=this.container.querySelector("#dispIso");r&&(r.textContent=`f/${this.state.aperture}`),o&&(o.textContent=c.formatShutterSpeed(this.state.shutter)),d&&(d.textContent=`ISO ${this.state.iso}`),this.visualizer?.render({aperture:this.state.aperture,shutter:this.state.shutter,iso:this.state.iso,ev100:t,evCurrent:e,targetEv:this.state.targetEv,deltaEv:a,evLock:this.state.evLock})}updateHandheldView(){const t=c.calculateHandheldShutter(this.state.handheldFocal,this.state.handheldCrop,this.state.handheldIbis),e=c.calculateAstroShutter(this.state.handheldFocal,this.state.handheldCrop),a=this.container.querySelector("#dispHHandheldFocal"),s=this.container.querySelector("#handheldResultBadge"),r=this.container.querySelector("#handheldAdviceText");a&&(a.textContent=`${this.state.handheldFocal} mm`),s&&(s.textContent=t.displayStabilized),r&&(r.textContent=t.description);const o=this.container.querySelector("#astro500Badge"),d=this.container.querySelector("#astroRuleDesc"),h=this.container.querySelector("#astroT500"),n=this.container.querySelector("#astroT300");o&&(o.textContent=`${e.display500} maks`),d&&(d.textContent=e.tip),h&&(h.textContent=e.display500),n&&(n.textContent=e.display300),this.container.querySelectorAll("[data-focal-h]").forEach(i=>{const l=Number(i.dataset.focalH);i.classList.toggle("active",l===this.state.handheldFocal)})}calculateTotalNdStops(){let t=0;for(const e of this.state.selectedNdIds){const a=x.find(s=>s.id===e);a&&(t+=a.stops)}return t}updateNdView(){const t=this.calculateTotalNdStops(),e=c.calculateNdExposure(this.state.ndBaseShutter,t),a=this.container.querySelector("#dispNdBase"),s=this.container.querySelector("#dispNdFinalTime"),r=this.container.querySelector("#dispNdTotalStops"),o=this.container.querySelector("#dispNdFactor"),d=this.container.querySelector("#dispNdOd");a&&(a.textContent=c.formatShutterSpeed(this.state.ndBaseShutter)),s&&(s.textContent=e.displayTime),r&&(r.textContent=`${t} stops`),o&&(o.textContent=`${Math.round(e.factor)}×`),d&&(d.textContent=`${e.opticalDensity.toFixed(1)}`),this.container.querySelectorAll("[data-nd-id]").forEach(h=>{const n=h.dataset.ndId;h.classList.toggle("active",this.state.selectedNdIds.includes(n))}),this.container.querySelectorAll("[data-nd-base]").forEach(h=>{const n=Number(h.dataset.ndBase);h.classList.toggle("active",Math.abs(n-this.state.ndBaseShutter)<1e-4)})}setTimerDuration(t){this.state.timerDurationSec=Math.max(1,t),this.resetTimer(),this.saveState()}toggleTimer(){this.timerRunning?this.pauseTimer():this.startTimer()}startTimer(){(this.timerPhase==="idle"||this.timerPhase==="finished")&&(this.timerTotalSec=this.state.timerDurationSec,this.timerRemainingSec=this.timerTotalSec,this.timerPhase="exposure"),this.timerRunning=!0;const t=this.container.querySelector("#btnTimerStartPause");t&&(t.textContent="Pause",t.classList.remove("fs-btn-accent-sun")),this.timerInterval&&clearInterval(this.timerInterval),this.timerInterval=window.setInterval(()=>{this.tickTimer()},1e3),this.updateTimerDisplay()}pauseTimer(){this.timerRunning=!1,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null);const t=this.container.querySelector("#btnTimerStartPause");t&&(t.textContent="Fortsæt Optagelse",t.classList.add("fs-btn-accent-sun")),this.updateTimerDisplay()}resetTimer(){this.timerRunning=!1,this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.timerPhase="idle",this.timerRemainingSec=this.state.timerDurationSec,this.timerTotalSec=this.state.timerDurationSec;const t=this.container.querySelector("#btnTimerStartPause");t&&(t.textContent="Start Optagelse",t.classList.add("fs-btn-accent-sun")),this.updateTimerDisplay()}tickTimer(){if(this.timerRemainingSec>0)this.timerRemainingSec--;else if(this.playCompletionSound(),this.triggerHaptic(),this.timerPhase==="exposure"&&this.state.timerDarkFrame)this.timerPhase="darkframe",this.timerTotalSec=this.state.timerDurationSec,this.timerRemainingSec=this.timerTotalSec;else{this.timerPhase="finished",this.pauseTimer();const t=this.container.querySelector("#btnTimerStartPause");t&&(t.textContent="Start Igen")}this.updateTimerDisplay()}updateTimerDisplay(){const t=this.container.querySelector("#timerDisplayNumber"),e=this.container.querySelector("#timerPhaseLabel"),a=this.container.querySelector("#timerStatusBadge"),s=this.container.querySelector("#timerCircleProgress"),r=Math.floor(this.timerRemainingSec/60),o=this.timerRemainingSec%60,d=String(r).padStart(2,"0"),h=String(o).padStart(2,"0");t&&(t.textContent=`${d}:${h}`);let n="Eksponering",i="Klar",l="var(--accent-exposure, #a855f7)";if(this.timerPhase==="exposure"?(n=this.timerRunning?"Optager lys...":"Pause",i="Lukker Åben"):this.timerPhase==="darkframe"?(n="Dark Frame (LENR Støjreduktion)",i="Dark Frame",l="var(--accent-sun, #f59e0b)"):this.timerPhase==="finished"&&(n="Færdig! Lukker lukket",i="Gennemført",l="var(--accent-success, #10b981)"),e&&(e.textContent=n,e.style.color=l),a&&(a.textContent=i,a.className=`fs-badge ${this.timerRunning?"badge-sun":""}`),s){const f=534.07*(1-(this.timerTotalSec>0?this.timerRemainingSec/this.timerTotalSec:0));s.style.strokeDashoffset=String(f),s.style.stroke=l}this.container.querySelectorAll("[data-timer-preset]").forEach(p=>{const m=Number(p.dataset.timerPreset);p.classList.toggle("active",m===this.state.timerDurationSec)})}playCompletionSound(){try{const t=window.AudioContext||window.webkitAudioContext;if(!t)return;const e=new t,a=e.createOscillator(),s=e.createGain();a.type="sine",a.frequency.setValueAtTime(880,e.currentTime),a.frequency.exponentialRampToValueAtTime(440,e.currentTime+.35),s.gain.setValueAtTime(.2,e.currentTime),s.gain.exponentialRampToValueAtTime(.01,e.currentTime+.35),a.connect(s),s.connect(e.destination),a.start(),a.stop(e.currentTime+.35)}catch{}}triggerHaptic(){try{typeof navigator.vibrate=="function"&&navigator.vibrate([150,100,150])}catch{}}}export{L as default};
