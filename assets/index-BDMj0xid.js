const x=[{id:"nd2",name:"ND2",stops:1,ndFactor:2,opticalDensity:.3,description:"1 stop (Let lysdæmpning)"},{id:"cpl",name:"CPL Polfilter",stops:1.5,ndFactor:2.8,opticalDensity:.45,description:"~1.5 stops (Refleksioner)"},{id:"nd4",name:"ND4",stops:2,ndFactor:4,opticalDensity:.6,description:"2 stops (Mellem)"},{id:"nd8",name:"ND8",stops:3,ndFactor:8,opticalDensity:.9,description:"3 stops (Klassisk video/portræt)"},{id:"nd16",name:"ND16",stops:4,ndFactor:16,opticalDensity:1.2,description:"4 stops (Solskin portræt)"},{id:"nd32",name:"ND32",stops:5,ndFactor:32,opticalDensity:1.5,description:"5 stops"},{id:"nd64",name:"ND64",stops:6,ndFactor:64,opticalDensity:1.8,description:"6 stops (Vandfald & bevægelse)"},{id:"nd128",name:"ND128",stops:7,ndFactor:128,opticalDensity:2.1,description:"7 stops"},{id:"nd256",name:"ND256",stops:8,ndFactor:256,opticalDensity:2.4,description:"8 stops"},{id:"nd512",name:"ND512",stops:9,ndFactor:512,opticalDensity:2.7,description:"9 stops"},{id:"nd1000",name:"ND1000",stops:10,ndFactor:1024,opticalDensity:3,description:"10 stops (Big Stopper / Silkevand)"},{id:"nd2000",name:"ND2000",stops:11,ndFactor:2048,opticalDensity:3.3,description:"11 stops"},{id:"nd4000",name:"ND4000",stops:12,ndFactor:4096,opticalDensity:3.6,description:"12 stops"},{id:"nd32000",name:"ND32000",stops:15,ndFactor:32768,opticalDensity:4.5,description:"15 stops (Super Stopper)"},{id:"nd65000",name:"ND65000",stops:16,ndFactor:65536,opticalDensity:4.8,description:"16 stops"},{id:"nd1000000",name:"ND1000000",stops:20,ndFactor:1048576,opticalDensity:6,description:"20 stops (Solfotografering)"}],m=[32,22,20,18,16,14,13,11,10,9,8,7.1,6.3,5.6,5,4.5,4,3.5,3.2,2.8,2.5,2.2,2,1.8,1.4,1.2,1],$=[22,16,11,8,5.6,4,2.8,2,1.4,1],u=[1/8e3,1/6400,1/5e3,1/4e3,1/3200,1/2500,1/2e3,1/1600,1/1250,1/1e3,1/800,1/640,1/500,1/400,1/320,1/250,1/200,1/160,1/125,1/100,1/80,1/60,1/50,1/40,1/30,1/25,1/20,1/15,1/13,1/10,1/8,1/6,1/5,1/4,.3,.4,.5,.6,.8,1,1.3,1.6,2,2.5,3.2,4,5,6,8,10,13,15,20,25,30],v=[50,64,80,100,125,160,200,250,320,400,500,640,800,1e3,1250,1600,2e3,2500,3200,4e3,5e3,6400,8e3,1e4,12800,25600,51200],k=[{id:"birds_flight",category:"action",title:"🦅 Flyvende fugle & hurtig vildt",recommendedRange:"1/2000s – 1/4000s",minShutter:1/4e3,maxShutter:1/2e3,description:"Fryser lynhurtige vingeslag og dråber kastes fra vinger.",tip:"Brug blænde f/4 eller f/5.6 og lad Auto-ISO kompensere."},{id:"sports_action",category:"action",title:"⚽ Sport, løb & action",recommendedRange:"1/1000s – 1/2000s",minShutter:1/2e3,maxShutter:1/1e3,description:"Fryser intense bevægelser, bolde i luften og atleter.",tip:"Hurtig serieoptagelse og kontinuerlig autofokus (AF-C)."},{id:"children_pets",category:"action",title:"🐕 Børn & kæledyr i leg",recommendedRange:"1/500s – 1/1000s",minShutter:1/1e3,maxShutter:1/500,description:"Undgår bevægelsesuskarphed ved uforudsigelig leg.",tip:"Vær i øjenhøjde med motivet for den bedste dynamik."},{id:"street_walking",category:"creative",title:"🚶 Gadefoto & gående personer",recommendedRange:"1/250s – 1/500s",minShutter:1/500,maxShutter:1/250,description:"Fryser almindelig gang og byliv skarpt.",tip:"Glimrende zonefokus-hastighed ved f/5.6 eller f/8."},{id:"portrait_handheld",category:"handheld",title:"👤 Stillestående portræt",recommendedRange:"1/125s – 1/250s",minShutter:1/250,maxShutter:1/125,description:"Sikrer mod små mikrobevægelser og øjenblink.",tip:"Kombinér med stor blænde (f/1.4 - f/2.8) for blød bokeh."},{id:"water_texture",category:"creative",title:"🌊 Vandfald med tekstur & liv",recommendedRange:"1/8s – 1/2s",minShutter:.125,maxShutter:.5,description:"Bevarer vandets kraft og skumdråber med let slør.",tip:"Kræver stativ eller særdeles effektiv billedstabilisering."},{id:"silky_water",category:"creative",title:"✨ Silkeblødt hav & kystbølger",recommendedRange:"2s – 15s",minShutter:2,maxShutter:15,description:"Udjævner bølger til et drømmende slør omkring klipper.",tip:"Typisk oplagt med ND64 (6-stop) eller ND1000 (10-stop) filter."},{id:"stretched_clouds",category:"creative",title:"☁️ Strøgne skyer & spejlblankt vand",recommendedRange:"30s – 4 min",minShutter:30,maxShutter:240,description:"Total udglatning af vandoverflader og maleriske skytræk.",tip:"Brug kameraets Bulb-tilstand og appens indbyggede timer."},{id:"light_trails",category:"creative",title:"🚗 Biltrafik lysstriber i mørke",recommendedRange:"10s – 30s",minShutter:10,maxShutter:30,description:"Forvandler forlygter og baglygter til ubrudte lysbånd.",tip:"Blænde f/8-f/11 skaber flotte stjerneeffekter (starburst) på gadelamper."}];class d{static calculateEV100(t,e){return t<=0||e<=0?0:Math.log2(t*t/e)}static calculateEV(t,e,s){const i=this.calculateEV100(t,e),n=Math.log2(Math.max(1,s)/100);return i-n}static calculateMeterDelta(t,e,s,i){const n=this.calculateEV(t,e,s),o=i-n;return Math.max(-3,Math.min(3,o))}static calculateApertureStopsDiff(t,e){return t<=0||e<=0?0:2*Math.log2(t/e)}static calculateShutterStopsDiff(t,e){return t<=0||e<=0?0:Math.log2(e/t)}static calculateIsoStopsDiff(t,e){return t<=0||e<=0?0:Math.log2(e/t)}static formatStopsDiff(t){if(Math.abs(t)<.15)return"0 stops (uændret)";const e=t>0?"+":"",s=Math.round(t*10)/10,i=Number.isInteger(s)?String(s):s.toFixed(1).replace(".",",");return`${e}${i} stops`}static solveShutter(t,e,s){const i=Math.pow(2,s)*(e/100);return i<=0?1/125:t*t/i}static solveAperture(t,e,s){const i=t*Math.pow(2,s)*(e/100);return i<=0?2.8:Math.sqrt(i)}static solveIso(t,e,s){const i=t*t,n=e*Math.pow(2,s);return n<=0?100:100*(i/n)}static findClosestValue(t,e){let s=e[0],i=Math.abs(t-s);for(const n of e){const o=Math.abs(t-n);o<i&&(i=o,s=n)}return s}static calculateHandheldShutter(t,e=1,s=0){const n=1/Math.max(10,t*e),o=Math.pow(2,Math.max(0,s)),c=n*o;return{baseSafeShutter:n,stabilizedSafeShutter:c,displayBase:this.formatShutterSpeed(n),displayStabilized:this.formatShutterSpeed(c),description:s>0?`Uden stabilisering: ${this.formatShutterSpeed(n)}. Med ${s} stops stabilisering kan du håndholde ned til ca. ${this.formatShutterSpeed(c)}.`:`Minimum ca. ${this.formatShutterSpeed(n)} håndholdt for at undgå rystelser med ${t}mm optik.`}}static calculateAstroShutter(t,e=1){const s=Math.max(10,t*e),i=500/s,n=300/s;return{rule500:i,rule300:n,display500:this.formatShutterSpeed(i),display300:this.formatShutterSpeed(n),tip:`Ved ${t}mm optik undgås stjernespor op til ${this.formatShutterSpeed(i)} (500-reglen) eller ${this.formatShutterSpeed(n)} (300-reglen til skarpe pixels).`}}static calculateNdExposure(t,e){const s=Math.pow(2,Math.max(0,e)),i=t*s,n=e*.30103;return{newShutter:i,factor:s,displayTime:this.formatShutterSpeed(i),opticalDensity:Number(n.toFixed(2)),requiresBulb:i>30}}static formatShutterSpeed(t){if(!Number.isFinite(t)||t<=0)return"0s";if(t<.45)return`1/${Math.round(1/t)}s`;if(t<2)return`${t.toFixed(1).replace(".",",")}s`;if(t<60)return`${Math.round(t)}s`;if(t<3600){const n=Math.floor(t/60),o=Math.round(t%60);return o>0?`${n}m ${o}s`:`${n}m`}const e=Math.floor(t/3600),s=Math.floor(t%3600/60),i=Math.round(t%60);return`${e}t ${s}m ${i}s`}static generateHistogramPath(t,e=240,s=70){const i=.5+t/6,n=Math.max(.1,Math.min(.9,i))*e,o=e*.18,c=[],h=40;for(let a=0;a<=h;a++){const l=a/h*e,p=l-n,f=Math.exp(-(p*p)/(2*o*o)),g=.08*Math.sin(l/e*Math.PI),y=Math.min(1,f*.9+g),b=s-y*(s-6);c.push([l,b])}let r=`M 0,${s}`;for(const[a,l]of c)r+=` L ${a.toFixed(1)},${l.toFixed(1)}`;return r+=` L ${e},${s} Z`,r}}class L{svgEl;meterEl;histSvgEl;statusTextEl;constructor(t,e,s,i){this.svgEl=t,this.meterEl=e,this.histSvgEl=s,this.statusTextEl=i}render(t){this.renderTriangle(t),this.renderMeter(t),this.renderHistogram(t)}renderTriangle(t){const a=Math.max(-3,Math.min(3,t.deltaEv)),l=a/3*22,p=-(a/3)*16,f=200+l,g=191+p;let y="var(--accent-exposure, #a855f7)",b="rgba(168, 85, 247, 0.4)";Math.abs(t.deltaEv)<=.33?(y="var(--accent-success, #10b981)",b="rgba(16, 185, 129, 0.5)"):t.deltaEv>1.5||t.deltaEv<-1.5?(y="var(--accent-danger, #ef4444)",b="rgba(239, 68, 68, 0.5)"):(y="var(--accent-warning, #f59e0b)",b="rgba(245, 158, 11, 0.5)"),this.svgEl.innerHTML=`
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
      <circle cx="${f}" cy="${g}" r="38" fill="url(#centerGlow)" />
      <circle cx="${f}" cy="${g}" r="8" fill="${y}" stroke="#ffffff" stroke-width="2" />
      <circle cx="${f}" cy="${g}" r="2" fill="#000000" />

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
        <text x="0" y="-2" font-size="11" font-weight="800" fill="#38bdf8" text-anchor="middle" dominant-baseline="middle" font-family="var(--font-mono)">${d.formatShutterSpeed(t.shutter)}</text>
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
    `}renderMeter(t){const e=t.isLocked?t.deltaEv:0,i=(Math.max(-3,Math.min(3,e))+3)/6*100;let n=`${e>=0?"+":""}${e.toFixed(1)} EV`,o="status-balanced",c="Balanceret eksponering",h="Kombinationen matcher dit låste udgangspunkt.";t.isLocked?e<=-.2?(o="status-under",c=`Undereksponeret (${n})`,h="Indstillingerne har nået grænsen og lukker mindre lys ind end dit låste udgangspunkt."):e>=.2&&(o="status-over",c=`Overeksponeret (${n})`,h="Indstillingerne har nået grænsen og lukker mere lys ind end dit låste udgangspunkt."):(o="status-balanced",c="Fri tilstand • Indstil måling",h='Juster blænde, lukker og ISO til hvad dit kamera måler, og tryk derefter på "Lås som udgangspunkt".'),this.meterEl.innerHTML=`
      <div class="ev-meter-scale">
        <div class="meter-tick" style="left: 0%;"><span>-3</span></div>
        <div class="meter-tick" style="left: 16.66%;"><span>-2</span></div>
        <div class="meter-tick" style="left: 33.33%;"><span>-1</span></div>
        <div class="meter-tick center" style="left: 50%;"><span>0</span></div>
        <div class="meter-tick" style="left: 66.66%;"><span>+1</span></div>
        <div class="meter-tick" style="left: 83.33%;"><span>+2</span></div>
        <div class="meter-tick" style="left: 100%;"><span>+3</span></div>
        
        <!-- Nål -->
        <div class="meter-needle ${o}" style="left: ${i}%;"></div>
      </div>
    `;const r=t.isLocked&&t.baseline?`🔒 LÅST TIL EV ${t.baseline.ev.toFixed(1)}`:`🔓 FRI MÅLING (EV ${t.evCurrent.toFixed(1)})`;this.statusTextEl.innerHTML=`
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
        <span class="fs-badge badge-${o}">${c}</span>
        <span style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);">${r}</span>
      </div>
      <p style="font-size: 12px; color: var(--text-muted); line-height: 1.4; margin: 0;">${h}</p>
    `}renderHistogram(t){const i=d.generateHistogramPath(t.deltaEv,240,60),n=t.deltaEv<-1.8,o=t.deltaEv>1.8;this.histSvgEl.setAttribute("viewBox","0 0 240 60"),this.histSvgEl.innerHTML=`
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
      <path d="${i}" fill="url(#histGradient)" stroke="var(--accent-exposure, #a855f7)" stroke-width="1.5" />

      <!-- Clipping indikatorer i kanterne -->
      ${n?'<rect x="0" y="0" width="4" height="60" fill="var(--accent-danger, #ef4444)" opacity="0.9" />':""}
      ${o?'<rect x="236" y="0" width="4" height="60" fill="var(--accent-danger, #ef4444)" opacity="0.9" />':""}
    `}}const T={aperture:8,shutter:1/125,iso:100,isLocked:!1,baseline:null,handheldFocal:50,handheldCrop:1,handheldIbis:0,ndBaseShutter:1/125,selectedNdIds:["nd1000"],timerDurationSec:60,timerDarkFrame:!1},E=[{name:"Fuld sol",ev:15,aperture:16,shutter:1/125,iso:100,tip:"Klar solskin (Sunny 16)"},{name:"Overskyet",ev:12,aperture:8,shutter:1/125,iso:100,tip:"Diffust dagslys"},{name:"Gylden time",ev:9,aperture:4,shutter:1/125,iso:200,tip:"Solopgang / Solnedgang"},{name:"Indendørs",ev:6,aperture:2.8,shutter:1/60,iso:800,tip:"Hjemme- eller galleribelysning"},{name:"By om natten",ev:3,aperture:2,shutter:1/30,iso:1600,tip:"Gadebelysning & neonskilte"}];class w{container;visualizer=null;state={...T};activeTab="triangle";timerInterval=null;timerEndTimeMs=null;timerRemainingSec=60;timerTotalSec=60;timerPhase="idle";timerRunning=!1;wakeLockSentinel=null;mount(t){this.container=t,this.loadState(),this.render(),this.attachEventListeners(),this.updateAllViews()}onActivate(t){if(t?.params){const s=t.params;if(s.has("tab")){const i=s.get("tab");["triangle","shutter","nd","timer"].includes(i)&&this.switchTab(i)}}let e=!1;if(t?.aperture!==void 0){const s=d.findClosestValue(Number(t.aperture),m);if(this.state.aperture=s,this.state.isLocked&&this.state.baseline){const i=d.solveShutter(this.state.aperture,this.state.iso,this.state.baseline.ev);this.state.shutter=d.findClosestValue(i,u)}e=!0}if(t?.focalLength!==void 0){this.state.handheldFocal=Math.min(600,Math.max(10,Math.round(Number(t.focalLength))));const s=this.container.querySelector("#sliderHandheldFocal");s&&(s.value=String(this.state.handheldFocal)),e=!0}if(t?.cropFactor!==void 0){this.state.handheldCrop=d.findClosestValue(Number(t.cropFactor),[1,1.5,2]);const s=this.container.querySelector("#selectHandheldCrop");s&&(s.value=String(this.state.handheldCrop)),e=!0}e&&(this.syncSlidersFromState(),this.updateAllViews(),this.saveState())}onDeactivate(){}destroy(){this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.releaseWakeLock(),this.visualizer=null}loadState(){try{const t=localStorage.getItem("fs_exposure_state_v1");t&&(this.state={...T,...JSON.parse(t)})}catch(t){console.warn("Kunne ikke hente gemt tilstand for Eksponering:",t)}}saveState(){try{localStorage.setItem("fs_exposure_state_v1",JSON.stringify(this.state))}catch(t){console.warn("Kunne ikke gemme tilstand for Eksponering:",t)}}render(){const t=$.map(r=>`<button class="quick-val-btn ${r===this.state.aperture?"active":""}" data-aperture="${r}">f/${r}</button>`).join(""),e=[1/1e3,1/500,1/250,1/125,1/60,1/15,1/2,1,4,15,30].map(r=>`<button class="quick-val-btn ${Math.abs(r-this.state.shutter)<1e-4?"active":""}" data-shutter="${r}">${d.formatShutterSpeed(r)}</button>`).join(""),s=[100,200,400,800,1600,3200,6400].map(r=>`<button class="quick-val-btn ${r===this.state.iso?"active":""}" data-iso="${r}">ISO ${r}</button>`).join(""),i=x.map(r=>`
        <button class="nd-filter-btn ${this.state.selectedNdIds.includes(r.id)?"active":""}" data-nd-id="${r.id}">
          <div class="nd-btn-name">${r.name}</div>
          <div class="nd-btn-stops">${r.stops>=0?"+":""}${r.stops} ${r.stops===1?"stop":"stops"}</div>
          <div class="nd-btn-density">OD ${r.opticalDensity.toFixed(1)}</div>
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
              <span class="fs-badge" id="expLockBadge">Fri tilstand</span>
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

          <!-- DYNAMISK BASELINE REFERENCE / LÅS-KONTROL -->
          <div id="expBaselineMount"></div>

          <!-- KONTROLPANEL FOR TREKANT -->
          <div class="fs-card">
            <div class="fs-card-header">
              <span class="fs-card-title">Kameraindstillinger</span>
              <div style="display: flex; gap: 4px;" id="scenePresetWrap">
                <select class="fs-btn" id="scenePresetSelect" style="padding: 3px 8px; font-size: 11px; min-height: 26px;">
                  <option value="" disabled selected>Hurtig lysscene (valgfri)...</option>
                  ${E.map((r,a)=>`<option value="${a}">${r.name} (EV ${r.ev})</option>`).join("")}
                </select>
              </div>
            </div>

            <!-- 1. BLÆNDE (Aperture) -->
            <div class="fs-slider-wrap">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Blænde <span style="font-size:10px;color:var(--text-dim);font-weight:normal;">• Lysåbning</span></span>
                <span class="fs-slider-val" id="dispAperture" style="color: #f59e0b;">f/${this.state.aperture}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnApertureMinus" title="Luk blænde ned (mindre lys)" aria-label="Luk blænde ned (mindre lys)">-</button>
                <input type="range" id="sliderAperture" min="0" max="${m.length-1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnAperturePlus" title="Åbn blænde op (mere lys)" aria-label="Åbn blænde op (mere lys)">+</button>
              </div>
              <div class="quick-btn-scroll" id="apertureQuickScroll">
                ${t}
              </div>
            </div>

            <!-- 2. LUKKERTID (Shutter) -->
            <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Lukkertid <span style="font-size:10px;color:var(--text-dim);font-weight:normal;">• Eksponeringstid</span></span>
                <span class="fs-slider-val" id="dispShutter" style="color: #38bdf8;">${d.formatShutterSpeed(this.state.shutter)}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnShutterMinus" title="Kortere tid (mindre lys)" aria-label="Kortere tid (mindre lys)">-</button>
                <input type="range" id="sliderShutter" min="0" max="${u.length-1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnShutterPlus" title="Længere tid (mere lys)" aria-label="Længere tid (mere lys)">+</button>
              </div>
              <div class="quick-btn-scroll" id="shutterQuickScroll">
                ${e}
              </div>
            </div>

            <!-- 3. ISO FØLSOMHED -->
            <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
              <div class="fs-slider-header">
                <span class="fs-slider-label">Lysfølsomhed <span style="font-size:10px;color:var(--text-dim);font-weight:normal;">• ISO</span></span>
                <span class="fs-slider-val" id="dispIso" style="color: #a855f7;">ISO ${this.state.iso}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <button class="fs-btn-icon" id="btnIsoMinus" title="Lavere ISO (mindre lys)" aria-label="Lavere ISO (mindre lys)">-</button>
                <input type="range" id="sliderIso" min="0" max="${v.length-1}" step="1" value="0">
                <button class="fs-btn-icon" id="btnIsoPlus" title="Højere ISO (mere lys)" aria-label="Højere ISO (mere lys)">+</button>
              </div>
              <div class="quick-btn-scroll" id="isoQuickScroll">
                ${s}
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
                ${[24,35,50,85,135,200,400].map(r=>`<button class="quick-val-btn ${r===this.state.handheldFocal?"active":""}" data-focal-h="${r}">${r}mm</button>`).join("")}
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
              ${k.map(r=>`
                <div class="shutter-scenario-card" data-scenario-id="${r.id}">
                  <div class="scenario-header-row">
                    <strong style="font-size: 13px; color: var(--text-main);">${r.title}</strong>
                    <span class="scenario-badge-time">${r.recommendedRange}</span>
                  </div>
                  <p style="font-size: 12px; color: var(--text-muted); margin: 0;">${r.description}</p>
                  <span style="font-size: 11px; color: var(--text-dim); font-style: italic;">💡 ${r.tip}</span>
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
                <span class="fs-slider-val" id="dispNdBase" style="color: #38bdf8;">${d.formatShutterSpeed(this.state.ndBaseShutter)}</span>
              </div>
              <input type="range" id="sliderNdBase" min="0" max="${u.length-1}" step="1" value="0">
              <div class="quick-btn-scroll" id="ndBaseQuickScroll">
                ${[1/1e3,1/500,1/250,1/125,1/60,1/30,1/15,1/4,1].map(r=>`
                  <button class="quick-val-btn ${Math.abs(r-this.state.ndBaseShutter)<1e-4?"active":""}" data-nd-base="${r}">
                    ${d.formatShutterSpeed(r)}
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
                ${i}
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
                ${[15,30,60,120,240,480].map(r=>`
                  <button class="quick-val-btn ${r===this.state.timerDurationSec?"active":""}" data-timer-preset="${r}">
                    ${d.formatShutterSpeed(r)}
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
    `;const n=this.container.querySelector("#expTriangleSvg"),o=this.container.querySelector("#expMeterWrap"),c=this.container.querySelector("#expHistSvg"),h=this.container.querySelector("#expStatusTextWrap");n&&o&&c&&h&&(this.visualizer=new L(n,o,c,h)),this.syncSlidersFromState()}attachEventListeners(){this.container.querySelectorAll("[data-exp-tab]").forEach(a=>{a.addEventListener("click",()=>{const l=a.dataset.expTab;this.switchTab(l)})});const t=this.container.querySelector("#scenePresetSelect");t?.addEventListener("change",()=>{const a=Number(t.value),l=E[a];l&&(this.state.aperture=l.aperture,this.state.shutter=l.shutter,this.state.iso=l.iso,this.state.isLocked&&(this.state.isLocked=!1,this.state.baseline=null),this.syncSlidersFromState(),this.updateTriangleView(),this.saveState())});const e=this.container.querySelector("#sliderAperture");e?.addEventListener("input",()=>{const a=Number(e.value),l=m[a]||8;this.handleApertureChange(l)}),this.container.querySelector("#btnApertureMinus")?.addEventListener("click",()=>{const a=m.indexOf(this.state.aperture);a>0&&this.handleApertureChange(m[a-1])}),this.container.querySelector("#btnAperturePlus")?.addEventListener("click",()=>{const a=m.indexOf(this.state.aperture);a<m.length-1&&this.handleApertureChange(m[a+1])}),this.container.querySelectorAll("[data-aperture]").forEach(a=>{a.addEventListener("click",()=>{const l=Number(a.dataset.aperture);this.handleApertureChange(l)})});const s=this.container.querySelector("#sliderShutter");s?.addEventListener("input",()=>{const a=Number(s.value),l=u[a]||1/125;this.handleShutterChange(l)}),this.container.querySelector("#btnShutterMinus")?.addEventListener("click",()=>{const a=u.indexOf(this.state.shutter);a>0&&this.handleShutterChange(u[a-1])}),this.container.querySelector("#btnShutterPlus")?.addEventListener("click",()=>{const a=u.indexOf(this.state.shutter);a<u.length-1&&this.handleShutterChange(u[a+1])}),this.container.querySelectorAll("[data-shutter]").forEach(a=>{a.addEventListener("click",()=>{const l=Number(a.dataset.shutter);this.handleShutterChange(l)})});const i=this.container.querySelector("#sliderIso");i?.addEventListener("input",()=>{const a=Number(i.value),l=v[a]||100;this.handleIsoChange(l)}),this.container.querySelector("#btnIsoMinus")?.addEventListener("click",()=>{const a=v.indexOf(this.state.iso);a>0&&this.handleIsoChange(v[a-1])}),this.container.querySelector("#btnIsoPlus")?.addEventListener("click",()=>{const a=v.indexOf(this.state.iso);a<v.length-1&&this.handleIsoChange(v[a+1])}),this.container.querySelectorAll("[data-iso]").forEach(a=>{a.addEventListener("click",()=>{const l=Number(a.dataset.iso);this.handleIsoChange(l)})}),this.container.querySelector("#btnTransferToNd")?.addEventListener("click",()=>{this.state.ndBaseShutter=this.state.shutter,this.switchTab("nd"),this.updateNdView(),this.saveState()});const n=this.container.querySelector("#sliderHandheldFocal");n?.addEventListener("input",()=>{this.state.handheldFocal=Number(n.value),this.updateHandheldView(),this.saveState()}),this.container.querySelectorAll("[data-focal-h]").forEach(a=>{a.addEventListener("click",()=>{const l=Number(a.dataset.focalH);this.state.handheldFocal=l,n&&(n.value=String(l)),this.updateHandheldView(),this.saveState()})});const o=this.container.querySelector("#selectHandheldCrop");o?.addEventListener("change",()=>{this.state.handheldCrop=Number(o.value),this.updateHandheldView(),this.saveState()});const c=this.container.querySelector("#selectHandheldIbis");c?.addEventListener("change",()=>{this.state.handheldIbis=Number(c.value),this.updateHandheldView(),this.saveState()}),this.container.querySelectorAll("[data-scenario-id]").forEach(a=>{a.addEventListener("click",()=>{const l=a.dataset.scenarioId,p=k.find(f=>f.id===l);if(p){const f=(p.minShutter+p.maxShutter)/2,g=d.findClosestValue(f,u);this.handleShutterChange(g),this.switchTab("triangle")}})});const h=this.container.querySelector("#sliderNdBase");h?.addEventListener("input",()=>{const a=Number(h.value);this.state.ndBaseShutter=u[a]||1/125,this.updateNdView(),this.saveState()}),this.container.querySelectorAll("[data-nd-base]").forEach(a=>{a.addEventListener("click",()=>{const l=Number(a.dataset.ndBase);if(this.state.ndBaseShutter=l,h){const p=u.indexOf(l);p!==-1&&(h.value=String(p))}this.updateNdView(),this.saveState()})}),this.container.querySelector("#btnSyncFromTriangle")?.addEventListener("click",()=>{this.state.ndBaseShutter=this.state.shutter,this.updateNdView(),this.saveState()}),this.container.querySelectorAll("[data-nd-id]").forEach(a=>{a.addEventListener("click",()=>{const l=a.dataset.ndId,p=this.state.selectedNdIds.indexOf(l);p>=0?this.state.selectedNdIds.splice(p,1):this.state.selectedNdIds.push(l),this.updateNdView(),this.saveState()})}),this.container.querySelector("#btnClearFilters")?.addEventListener("click",()=>{this.state.selectedNdIds=[],this.updateNdView(),this.saveState()}),this.container.querySelector("#btnTransferToTimer")?.addEventListener("click",()=>{const a=this.calculateTotalNdStops(),l=d.calculateNdExposure(this.state.ndBaseShutter,a);this.setTimerDuration(Math.round(l.newShutter)),this.switchTab("timer")}),this.container.querySelector("#btnTimerStartPause")?.addEventListener("click",()=>{this.toggleTimer()}),this.container.querySelector("#btnTimerReset")?.addEventListener("click",()=>{this.resetTimer()}),this.container.querySelectorAll("[data-timer-preset]").forEach(a=>{a.addEventListener("click",()=>{const l=Number(a.dataset.timerPreset);this.setTimerDuration(l)})});const r=this.container.querySelector("#checkDarkFrame");r?.addEventListener("change",()=>{this.state.timerDarkFrame=r.checked,this.saveState()})}switchTab(t){this.activeTab=t,this.container.querySelectorAll(".fs-segment-btn").forEach(o=>{o.classList.toggle("active",o.dataset.expTab===t)});const e=this.container.querySelector("#tabContentTriangle"),s=this.container.querySelector("#tabContentShutter"),i=this.container.querySelector("#tabContentNd"),n=this.container.querySelector("#tabContentTimer");e&&(e.style.display=t==="triangle"?"block":"none"),s&&(s.style.display=t==="shutter"?"block":"none"),i&&(i.style.display=t==="nd"?"block":"none"),n&&(n.style.display=t==="timer"?"block":"none"),this.updateAllViews()}handleApertureChange(t){if(this.state.aperture=t,this.state.isLocked&&this.state.baseline){const e=d.solveShutter(this.state.aperture,this.state.iso,this.state.baseline.ev);this.state.shutter=d.findClosestValue(e,u)}this.syncSlidersFromState(),this.updateTriangleView(),this.saveState()}handleShutterChange(t){if(this.state.shutter=t,this.state.isLocked&&this.state.baseline){const e=d.solveAperture(this.state.shutter,this.state.iso,this.state.baseline.ev);this.state.aperture=d.findClosestValue(e,m)}this.syncSlidersFromState(),this.updateTriangleView(),this.saveState()}handleIsoChange(t){if(this.state.iso=t,this.state.isLocked&&this.state.baseline){const e=d.solveShutter(this.state.aperture,this.state.iso,this.state.baseline.ev);this.state.shutter=d.findClosestValue(e,u)}this.syncSlidersFromState(),this.updateTriangleView(),this.saveState()}syncSlidersFromState(){const t=this.container.querySelector("#sliderAperture"),e=this.container.querySelector("#sliderShutter"),s=this.container.querySelector("#sliderIso");if(t){const i=m.indexOf(this.state.aperture);i!==-1&&(t.value=String(i))}if(e){const i=u.indexOf(this.state.shutter);i!==-1&&(e.value=String(i))}if(s){const i=v.indexOf(this.state.iso);i!==-1&&(s.value=String(i))}this.container.querySelectorAll("[data-aperture]").forEach(i=>{const n=Number(i.dataset.aperture);i.classList.toggle("active",Math.abs(n-this.state.aperture)<.05)}),this.container.querySelectorAll("[data-shutter]").forEach(i=>{const n=Number(i.dataset.shutter);i.classList.toggle("active",Math.abs(n-this.state.shutter)<1e-4)}),this.container.querySelectorAll("[data-iso]").forEach(i=>{const n=Number(i.dataset.iso);i.classList.toggle("active",n===this.state.iso)})}updateAllViews(){this.updateTriangleView(),this.updateHandheldView(),this.updateNdView(),this.updateTimerDisplay()}updateTriangleView(){const t=d.calculateEV100(this.state.aperture,this.state.shutter),e=d.calculateEV(this.state.aperture,this.state.shutter,this.state.iso),s=this.state.isLocked&&this.state.baseline?this.state.baseline.ev:e,i=d.calculateMeterDelta(this.state.aperture,this.state.shutter,this.state.iso,s),n=this.container.querySelector("#expCurrentEvBadge");n&&(n.textContent=`EV ${e.toFixed(1)}`);const o=this.container.querySelector("#expLockBadge");o&&(this.state.isLocked&&this.state.baseline?(o.textContent=`🔒 Låst (EV ${this.state.baseline.ev.toFixed(1)})`,o.className="fs-badge badge-exposure"):(o.textContent="🔓 Fri tilstand",o.className="fs-badge"));const c=this.container.querySelector("#dispAperture"),h=this.container.querySelector("#dispShutter"),r=this.container.querySelector("#dispIso");c&&(c.textContent=`f/${this.state.aperture}`),h&&(h.textContent=d.formatShutterSpeed(this.state.shutter)),r&&(r.textContent=`ISO ${this.state.iso}`),this.renderBaselineSection(i),this.visualizer?.render({aperture:this.state.aperture,shutter:this.state.shutter,iso:this.state.iso,ev100:t,evCurrent:e,targetEv:s,deltaEv:i,isLocked:this.state.isLocked,baseline:this.state.baseline})}renderBaselineSection(t){const e=this.container.querySelector("#expBaselineMount");if(e)if(!this.state.isLocked||!this.state.baseline)e.innerHTML=`
        <div class="exposure-instruction-banner">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
            <div style="font-size: 12px; color: var(--text-muted); line-height: 1.4; max-width: 440px;">
              <strong style="color: var(--text-main); display: block; margin-bottom: 2px;">Trin 1: Indstil hvad dit kamera måler</strong>
              Juster blænde, lukker og ISO frit herunder (eller vælg en hurtig lysscene). Lås derefter for at udforske ækvivalente tider eller bruge ND-filter.
            </div>
            <button class="fs-btn fs-btn-accent-sun" id="btnLockBaseline" style="padding: 8px 16px; font-size: 13px; font-weight: 700; min-height: 38px; white-space: nowrap;">
              🔒 Lås som udgangspunkt
            </button>
          </div>
        </div>
      `,e.querySelector("#btnLockBaseline")?.addEventListener("click",()=>{const s=d.calculateEV(this.state.aperture,this.state.shutter,this.state.iso);this.state.baseline={aperture:this.state.aperture,shutter:this.state.shutter,iso:this.state.iso,ev:Number(s.toFixed(1))},this.state.isLocked=!0,this.updateTriangleView(),this.saveState()});else{const s=this.state.baseline,i=d.calculateApertureStopsDiff(s.aperture,this.state.aperture),n=d.calculateShutterStopsDiff(s.shutter,this.state.shutter),o=d.calculateIsoStopsDiff(s.iso,this.state.iso);let c="✅ <strong>Gensidighedsloven:</strong> Eksponeringen er 100% identisk med dit udgangspunkt (0 EV afvigelse).";t<=-.2?c=`⚠️ <strong>Grænseværdi:</strong> Indstillingerne kan ikke kompensere yderligere (${Math.abs(t).toFixed(1)} stops for mørkt).`:t>=.2&&(c=`⚠️ <strong>Grænseværdi:</strong> Indstillingerne kan ikke kompensere yderligere (${t.toFixed(1)} stops for lyst).`),e.innerHTML=`
        <div class="exposure-baseline-card">
          <div class="baseline-header">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 18px;">🎯</span>
              <div>
                <strong style="font-size: 13px; color: var(--text-main);">Låst udgangspunkt</strong>
                <span style="font-size: 11px; color: var(--text-muted); display: block; font-family: var(--font-mono);">
                  f/${s.aperture} • ${d.formatShutterSpeed(s.shutter)} • ISO ${s.iso} (EV ${s.ev.toFixed(1)})
                </span>
              </div>
            </div>
            <button class="fs-btn" id="btnUnlockBaseline" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">
              🔓 Frigør / Ny måling
            </button>
          </div>

          <div class="baseline-diff-grid">
            <div class="diff-item">
              <span class="diff-label">Blænde</span>
              <span class="diff-val">${d.formatStopsDiff(i)}</span>
            </div>
            <div class="diff-item">
              <span class="diff-label">Lukkertid</span>
              <span class="diff-val highlight-shutter">${d.formatStopsDiff(n)}</span>
            </div>
            <div class="diff-item">
              <span class="diff-label">ISO</span>
              <span class="diff-val highlight-iso">${d.formatStopsDiff(o)}</span>
            </div>
          </div>
          <div class="baseline-summary-text">
            ${c}
          </div>
        </div>
      `,e.querySelector("#btnUnlockBaseline")?.addEventListener("click",()=>{this.state.isLocked=!1,this.state.baseline=null,this.updateTriangleView(),this.saveState()})}}updateHandheldView(){const t=d.calculateHandheldShutter(this.state.handheldFocal,this.state.handheldCrop,this.state.handheldIbis),e=d.calculateAstroShutter(this.state.handheldFocal,this.state.handheldCrop),s=this.container.querySelector("#dispHHandheldFocal"),i=this.container.querySelector("#handheldResultBadge"),n=this.container.querySelector("#handheldAdviceText");s&&(s.textContent=`${this.state.handheldFocal} mm`),i&&(i.textContent=t.displayStabilized),n&&(n.textContent=t.description);const o=this.container.querySelector("#astro500Badge"),c=this.container.querySelector("#astroRuleDesc"),h=this.container.querySelector("#astroT500"),r=this.container.querySelector("#astroT300");o&&(o.textContent=`${e.display500} maks`),c&&(c.textContent=e.tip),h&&(h.textContent=e.display500),r&&(r.textContent=e.display300),this.container.querySelectorAll("[data-focal-h]").forEach(a=>{const l=Number(a.dataset.focalH);a.classList.toggle("active",l===this.state.handheldFocal)})}calculateTotalNdStops(){let t=0;for(const e of this.state.selectedNdIds){const s=x.find(i=>i.id===e);s&&(t+=s.stops)}return t}updateNdView(){const t=this.calculateTotalNdStops(),e=d.calculateNdExposure(this.state.ndBaseShutter,t),s=this.container.querySelector("#dispNdBase"),i=this.container.querySelector("#dispNdFinalTime"),n=this.container.querySelector("#dispNdTotalStops"),o=this.container.querySelector("#dispNdFactor"),c=this.container.querySelector("#dispNdOd");s&&(s.textContent=d.formatShutterSpeed(this.state.ndBaseShutter)),i&&(i.textContent=e.displayTime),n&&(n.textContent=`${t} stops`),o&&(o.textContent=`${Math.round(e.factor)}×`),c&&(c.textContent=`${e.opticalDensity.toFixed(1)}`),this.container.querySelectorAll("[data-nd-id]").forEach(h=>{const r=h.dataset.ndId;h.classList.toggle("active",this.state.selectedNdIds.includes(r))}),this.container.querySelectorAll("[data-nd-base]").forEach(h=>{const r=Number(h.dataset.ndBase);h.classList.toggle("active",Math.abs(r-this.state.ndBaseShutter)<1e-4)})}async requestWakeLock(){try{const t=navigator;t.wakeLock&&typeof t.wakeLock.request=="function"&&(this.wakeLockSentinel=await t.wakeLock.request("screen"))}catch{}}releaseWakeLock(){try{this.wakeLockSentinel&&typeof this.wakeLockSentinel.release=="function"&&this.wakeLockSentinel.release()}catch{}finally{this.wakeLockSentinel=null}}setTimerDuration(t){this.state.timerDurationSec=Math.max(1,t),this.resetTimer(),this.saveState()}toggleTimer(){this.timerRunning?this.pauseTimer():this.startTimer()}startTimer(){(this.timerPhase==="idle"||this.timerPhase==="finished")&&(this.timerTotalSec=this.state.timerDurationSec,this.timerRemainingSec=this.timerTotalSec,this.timerPhase="exposure"),this.timerRunning=!0,this.timerEndTimeMs=Date.now()+this.timerRemainingSec*1e3,this.requestWakeLock();const t=this.container.querySelector("#btnTimerStartPause");t&&(t.textContent="Pause",t.classList.remove("fs-btn-accent-sun")),this.timerInterval&&clearInterval(this.timerInterval),this.timerInterval=window.setInterval(()=>{this.tickTimer()},250),this.updateTimerDisplay()}pauseTimer(){if(this.timerRunning&&this.timerEndTimeMs!==null){const e=Math.max(0,this.timerEndTimeMs-Date.now());this.timerRemainingSec=Math.ceil(e/1e3)}this.timerRunning=!1,this.timerEndTimeMs=null,this.releaseWakeLock(),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null);const t=this.container.querySelector("#btnTimerStartPause");t&&(t.textContent="Fortsæt Optagelse",t.classList.add("fs-btn-accent-sun")),this.updateTimerDisplay()}resetTimer(){this.timerRunning=!1,this.timerEndTimeMs=null,this.releaseWakeLock(),this.timerInterval&&(clearInterval(this.timerInterval),this.timerInterval=null),this.timerPhase="idle",this.timerRemainingSec=this.state.timerDurationSec,this.timerTotalSec=this.state.timerDurationSec;const t=this.container.querySelector("#btnTimerStartPause");t&&(t.textContent="Start Optagelse",t.classList.add("fs-btn-accent-sun")),this.updateTimerDisplay()}tickTimer(){const t=Date.now(),e=Math.max(0,(this.timerEndTimeMs??t)-t);if(this.timerRemainingSec=Math.ceil(e/1e3),e<=0)if(this.playCompletionSound(),this.triggerHaptic(),this.timerPhase==="exposure"&&this.state.timerDarkFrame)this.timerPhase="darkframe",this.timerTotalSec=this.state.timerDurationSec,this.timerRemainingSec=this.timerTotalSec,this.timerEndTimeMs=Date.now()+this.timerTotalSec*1e3;else{this.timerPhase="finished",this.timerRemainingSec=0,this.timerEndTimeMs=null,this.pauseTimer();const s=this.container.querySelector("#btnTimerStartPause");s&&(s.textContent="Start Igen")}this.updateTimerDisplay()}updateTimerDisplay(){const t=this.container.querySelector("#timerDisplayNumber"),e=this.container.querySelector("#timerPhaseLabel"),s=this.container.querySelector("#timerStatusBadge"),i=this.container.querySelector("#timerCircleProgress"),n=Math.floor(this.timerRemainingSec/60),o=this.timerRemainingSec%60,c=String(n).padStart(2,"0"),h=String(o).padStart(2,"0");t&&(t.textContent=`${c}:${h}`);let r="Eksponering",a="Klar",l="var(--accent-exposure, #a855f7)";if(this.timerPhase==="exposure"?(r=this.timerRunning?"Optager lys...":"Pause",a="Lukker Åben"):this.timerPhase==="darkframe"?(r="Dark Frame (LENR Støjreduktion)",a="Dark Frame",l="var(--accent-sun, #f59e0b)"):this.timerPhase==="finished"&&(r="Færdig! Lukker lukket",a="Gennemført",l="var(--accent-success, #10b981)"),e&&(e.textContent=r,e.style.color=l),s&&(s.textContent=a,s.className=`fs-badge ${this.timerRunning?"badge-sun":""}`),i){const g=534.07*(1-(this.timerTotalSec>0?this.timerRemainingSec/this.timerTotalSec:0));i.style.strokeDashoffset=String(g),i.style.stroke=l}this.container.querySelectorAll("[data-timer-preset]").forEach(p=>{const f=Number(p.dataset.timerPreset);p.classList.toggle("active",f===this.state.timerDurationSec)})}playCompletionSound(){try{const t=window.AudioContext||window.webkitAudioContext;if(!t)return;const e=new t,s=e.createOscillator(),i=e.createGain();s.type="sine",s.frequency.setValueAtTime(880,e.currentTime),s.frequency.exponentialRampToValueAtTime(440,e.currentTime+.35),i.gain.setValueAtTime(.2,e.currentTime),i.gain.exponentialRampToValueAtTime(.01,e.currentTime+.35),s.connect(i),i.connect(e.destination),s.start(),s.stop(e.currentTime+.35)}catch{}}triggerHaptic(){try{typeof navigator.vibrate=="function"&&navigator.vibrate([150,100,150])}catch{}}}export{w as default};
