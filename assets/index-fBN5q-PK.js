import{R as A}from"./index-D4Ye8Nfv.js";const F={medium_format:{id:"medium_format",name:"Mellemformat (44×33mm)",shortName:"MF 44×33",width:43.8,height:32.9,cropFactor:.79,coc:.038,description:"Fujifilm GFX, Hasselblad X2D"},full_frame:{id:"full_frame",name:"Full Frame / 35mm (36×24mm)",shortName:"Full Frame [FX]",width:36,height:24,cropFactor:1,coc:.029,description:"Sony A7/A9, Canon R5/R6, Nikon Z, Leica M/SL"},apsc_sony_nikon_fuji:{id:"apsc_sony_nikon_fuji",name:"APS-C 1.5× (Sony, Nikon, Fuji)",shortName:"APS-C 1.5× [DX]",width:23.5,height:15.6,cropFactor:1.53,coc:.019,description:"Fujifilm X-T, Sony A6700, Nikon Z50"},apsc_canon:{id:"apsc_canon",name:"APS-C Canon 1.6× (Canon EOS R/D)",shortName:"APS-C Canon 1.6×",width:22.2,height:14.8,cropFactor:1.62,coc:.018,description:"Canon EOS R7, R10, R50, 90D"},mft:{id:"mft",name:"Micro Four Thirds (MFT 2.0×)",shortName:"Micro 4/3 [2.0×]",width:17.3,height:13,cropFactor:2,coc:.015,description:"OM System, Olympus OM-D, Panasonic Lumix G"},one_inch:{id:"one_inch",name:'1" Tomme (13.2×8.8mm)',shortName:'1" Type [2.7×]',width:13.2,height:8.8,cropFactor:2.73,coc:.011,description:"Sony RX100, ZV-1, Canon G7X"},phone_main:{id:"phone_main",name:'Smartphone Stor Sensor (1/1.3")',shortName:'Mobil 1/1.3"',width:9.6,height:7.2,cropFactor:3.6,coc:.008,description:"iPhone 15/16 Pro, Samsung S24 Ultra, Pixel 8/9"},phone_small:{id:"phone_small",name:'Smartphone Standard (1/2.55")',shortName:'Mobil 1/2.5"',width:5.76,height:4.29,cropFactor:6,coc:.005,description:"Standard ultravidvinkel & ældre smartphones"}};class m{static calculateDOF(e){const t=Math.max(1,Number(e.focalLength)||50),a=Math.max(.5,Number(e.aperture)||2.8),s=Math.max(.05,Number(e.distance)||2),r=F[e.sensor]||F.full_frame;let h=e.customCoc?Number(e.customCoc):r.coc;(!h||h<=0)&&(h=.029);const f=t/1e3,u=h/1e3,o=a,n=s,c=f*f/(o*u)+f;let i=0;const g=n*(c-f),d=c+n-2*f;d>0?i=g/d:i=0,i=Math.max(.01,i);let l=1/0;const p=n>=c;if(!p){const I=c-n;I>1e-6?(l=n*(c-f)/I,(l>1e5||l<=0)&&(l=1/0)):l=1/0}let x=1/0;l!==1/0&&(x=Math.max(0,l-i));const S=Math.max(0,n-i);let v=1/0,y=50,E=50;l!==1/0?(v=Math.max(0,l-n),x>0&&(y=S/x*100,E=v/x*100)):(y=0,E=100);let M=0;n>f&&(M=f/(n-f));const k=t/a,b=Math.round(t*r.cropFactor),B=+(a*r.cropFactor).toFixed(1),P=1.342*a,O=h*1e3,T=P>O;let L={level:"optimal",label:"Optimal skarphed",badgeClass:"badge-success",desc:"Blænden er i det ideelle optiske område uden synlig diffraktionsuskarphed."};a>=16?L={level:"noticeable",label:"Mærkbar diffraktion",badgeClass:"badge-danger",desc:"Diffraktion gennem den lille blændeåbning spreder lyset og blødgør fine detaljer."}:(a>=11||T)&&(L={level:"mild",label:"Begyndende diffraktion",badgeClass:"badge-warning",desc:"Diffraktion kan anes ved 100% zoom på højtopløste sensorer."});const D=Math.max(.001,n-f),C=f*f/(o*D)*1e3/h;let w={rating:"medium",label:"Klassisk Bokeh",desc:"Behagelig separation mellem motiv og baggrund."};return C<1?w={rating:"sharp",label:"Skarp baggrund",desc:"Baggrunden bevarer fuld genkendelighed og skarphed."}:C<4?w={rating:"subtle",label:"Let sløring",desc:"Baggrunden er let dæmpet, men kontekst kan tydeligt ses."}:C>=15&&(w={rating:"creamy",label:'Fløjlsblød "Creamy" Bokeh',desc:"Baggrunden smelter fuldstændigt sammen til ren, blød bokeh."}),{focalLengthMm:t,aperture:a,distanceM:s,sensor:r,cocMm:h,hyperfocalM:c,nearLimitM:i,farLimitM:l,totalDofM:x,isInfinity:p,depthInFrontM:S,depthBehindM:v,frontPercent:Math.min(100,Math.max(0,y)),rearPercent:Math.min(100,Math.max(0,E)),magnification:M,pupilDiameterMm:k,equivFocalLength:b,equivAperture:B,diffractionStatus:L,airyDiskUm:P,bokehQuality:w,blurToCocRatio:C}}static formatDistance(e,t=!0){return e===1/0||e>=99999?t?"∞ (Uendelig)":"∞":e<.001?(e*1e3).toFixed(1).replace(".",",")+(t?" mm":""):e<.1||e<1?(e*100).toFixed(1).replace(".",",")+(t?" cm":""):e<10?e.toFixed(2).replace(".",",")+(t?" m":""):e<100?e.toFixed(1).replace(".",",")+(t?" m":""):Math.round(e).toString()+(t?" m":"")}static calculateBlurCircleAtDistance(e,t,a,s){if(e<=0||t<=0)return 0;const r=a/1e3,h=s,f=t,u=e;if(u===f)return 0;const o=h*Math.max(.001,f-r)*u;return Math.abs(o)<1e-6?0:Math.abs(r*r*(u-f)/o)*1e3}}class _{svgDiagram;evfContainer;peakingEnabled=!1;gridEnabled=!0;cachedBokehPositions=[];constructor(e,t){this.svgDiagram=e,this.evfContainer=t}toggleFocusPeaking(e){this.peakingEnabled=e!==void 0?e:!this.peakingEnabled;const t=document.getElementById("evfPeakingSubject");return t&&(t.style.opacity=this.peakingEnabled?"0.85":"0"),this.peakingEnabled}toggleGrid(e){this.gridEnabled=e!==void 0?e:!this.gridEnabled;const t=document.getElementById("evfGridOverlay");return t&&(t.style.display=this.gridEnabled?"block":"none"),this.gridEnabled}getDisplayMaxDistance(e,t,a){return a===1/0||a>100?Math.max(e*2.2,Math.min(t*1.4,60)):Math.max(a*1.35,e*1.5,1)}distanceToX(e,t){if(e<=0)return .08;const a=Math.min(1,e/t);return .1+Math.pow(a,.72)*.85}render(e){this.renderOpticalDiagram(e),this.renderEvfViewfinder(e)}renderOpticalDiagram(e){if(!this.svgDiagram)return;const{distanceM:t,hyperfocalM:a,nearLimitM:s,farLimitM:r,totalDofM:h,isInfinity:f}=e,u=this.getDisplayMaxDistance(t,a,r),o=1e3,n=72,c=125,i=75,g=this.distanceToX(t,u)*o,d=Math.max(i+8,this.distanceToX(s,u)*o),l=r===1/0||r>u,p=l?o-20:this.distanceToX(r,u)*o,x=a<=u?this.distanceToX(a,u)*o:null,S=this.generateScaleTicks(u);let v="";S.forEach(L=>{const D=this.distanceToX(L.val,u)*o;v+=`
        <line x1="${D}" y1="${c}" x2="${D}" y2="${c+7}" stroke="rgba(255,255,255,0.25)" stroke-width="1.2" />
        <text x="${D}" y="${c+20}" font-size="10.5" font-family="ui-monospace, monospace" fill="#94a3b8" text-anchor="middle">${L.label}</text>
      `});const y=46,E=`
      <polygon points="${i},${n} ${o-15},${n-y} ${o-15},${n+y}" fill="url(#rayGrad)" opacity="0.4" />
      <line x1="${i}" y1="${n}" x2="${o-15}" y2="${n-y}" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="${i}" y1="${n}" x2="${o-15}" y2="${n+y}" stroke="rgba(56, 189, 248, 0.35)" stroke-width="1" stroke-dasharray="3 3"/>
      <line x1="${i}" y1="${n}" x2="${o-10}" y2="${n}" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="2 4"/>
    `,M=Math.max(3,p-d),k=`
      <defs>
        <linearGradient id="dofZoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981" stop-opacity="0.25"/>
          <stop offset="50%" stop-color="#10b981" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${l?"#38bdf8":"#10b981"}" stop-opacity="${l?"0.2":"0.25"}"/>
        </linearGradient>
        <linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.03"/>
        </linearGradient>
      </defs>

      <rect x="${i+5}" y="24" width="${Math.max(0,d-i-5)}" height="100" fill="rgba(239, 68, 68, 0.05)" />
      <rect x="${d}" y="24" width="${M}" height="100" fill="url(#dofZoneGrad)" rx="3"/>
      <line x1="${d}" y1="24" x2="${d}" y2="${c}" stroke="#10b981" stroke-width="2.2" />
      <line x1="${p}" y1="24" x2="${p}" y2="${c}" stroke="${l?"#38bdf8":"#10b981"}" stroke-width="2.2" ${l?'stroke-dasharray="5 3"':""}/>
      ${l?`<polygon points="${o-20},${n-6} ${o-8},${n} ${o-20},${n+6}" fill="#38bdf8" opacity="0.85"/>`:""}
    `,b=f?"DOF: ∞":`DOF: ${m.formatDistance(h)}`,B=d+M/2,P=`
      <g transform="translate(${d}, 20)">
        <rect x="-30" y="-15" width="60" height="17" rx="3" fill="#0f172a" stroke="#10b981" stroke-width="1.1" opacity="0.95"/>
        <text x="0" y="-3" font-size="9" font-weight="700" font-family="ui-monospace, monospace" fill="#10b981" text-anchor="middle">
          Dn: ${m.formatDistance(s)}
        </text>
      </g>

      <g transform="translate(${g}, ${n})">
        <line x1="0" y1="-50" x2="0" y2="52" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 2"/>
        <circle cx="0" cy="0" r="11" fill="#1e293b" stroke="#f59e0b" stroke-width="2.2"/>
        <circle cx="0" cy="0" r="3.5" fill="#f59e0b"/>
        <line x1="-14" y1="0" x2="14" y2="0" stroke="#f59e0b" stroke-width="1.2"/>
        <line x1="0" y1="-14" x2="0" y2="14" stroke="#f59e0b" stroke-width="1.2"/>
        
        <rect x="-36" y="-68" width="72" height="18" rx="4" fill="#f59e0b" />
        <text x="0" y="-55" font-size="9.5" font-weight="800" font-family="-apple-system, sans-serif" fill="#07080a" text-anchor="middle">
          ${m.formatDistance(t)}
        </text>
      </g>

      <g transform="translate(${p}, 20)">
        <rect x="-30" y="-15" width="60" height="17" rx="3" fill="#0f172a" stroke="${l?"#38bdf8":"#10b981"}" stroke-width="1.1" opacity="0.95"/>
        <text x="0" y="-3" font-size="9" font-weight="700" font-family="ui-monospace, monospace" fill="${l?"#38bdf8":"#10b981"}" text-anchor="middle">
          Df: ${l?"∞":m.formatDistance(r)}
        </text>
      </g>

      ${M>60?`
        <g transform="translate(${B}, 48)">
          <rect x="-42" y="-10" width="84" height="19" rx="9" fill="rgba(16, 185, 129, 0.22)" stroke="#10b981" stroke-width="1.1"/>
          <text x="0" y="3" font-size="10" font-weight="800" font-family="-apple-system, sans-serif" fill="#10b981" text-anchor="middle">${b}</text>
        </g>
      `:""}

      ${x?`
        <g transform="translate(${x}, ${c-2})">
          <polygon points="0,0 -4,7 4,7" fill="#38bdf8"/>
          <text x="0" y="16" font-size="8" font-family="ui-monospace, monospace" fill="#38bdf8" text-anchor="middle" font-weight="700">H: ${m.formatDistance(a)}</text>
        </g>
      `:""}
    `,O=`
      <g transform="translate(16, ${n-22})">
        <rect x="0" y="6" width="38" height="34" rx="5" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
        <rect x="11" y="1" width="16" height="6" rx="2" fill="#334155"/>
        <circle cx="19" cy="23" r="10" fill="#0f172a" stroke="#64748b" stroke-width="1.3"/>
        <rect x="36" y="14" width="13" height="18" rx="2" fill="#334155" stroke="#64748b" stroke-width="1"/>
        <line x1="19" y1="9" x2="19" y2="37" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/>
        <text x="19" y="50" font-size="8.5" font-family="-apple-system, sans-serif" fill="#94a3b8" text-anchor="middle" font-weight="600">0 m</text>
      </g>
    `,T=`
      <line x1="${i}" y1="${c}" x2="${o-15}" y2="${c}" stroke="rgba(255,255,255,0.25)" stroke-width="1.5"/>
    `;this.svgDiagram.innerHTML=`
      <rect width="100%" height="100%" fill="#070a0f" rx="8"/>
      ${E}
      ${k}
      ${T}
      ${v}
      ${P}
      ${O}
    `}generateScaleTicks(e){const t=[];return e<=1?[.1,.25,.5,.75,1].forEach(a=>{a<=e*1.05&&t.push({val:a,label:(a*100).toFixed(0)+" cm"})}):e<=5?[.5,1,2,3,4,5].forEach(a=>{a<=e*1.05&&t.push({val:a,label:a+" m"})}):e<=20?[1,3,5,10,15,20].forEach(a=>{a<=e*1.05&&t.push({val:a,label:a+" m"})}):e<=60?[2,5,10,20,40,60].forEach(a=>{a<=e*1.05&&t.push({val:a,label:a+" m"})}):[5,15,30,60,100].forEach(a=>{a<=e*1.05&&t.push({val:a,label:a+" m"})}),t}renderEvfViewfinder(e){if(!this.evfContainer)return;const{focalLengthMm:t,aperture:a,distanceM:s,blurToCocRatio:r,bokehQuality:h}=e,f=Math.max(.15,s*.45),u=m.calculateBlurCircleAtDistance(f,s,t,a),o=Math.max(15,s*4),n=m.calculateBlurCircleAtDistance(o,s,t,a),c=38,i=Math.min(30,u*c).toFixed(1),g=Math.min(32,n*c).toFixed(1),d=document.getElementById("evfLayerForeground"),l=document.getElementById("evfLayerBackground"),p=document.getElementById("evfBokehOverlay"),x=document.getElementById("evfPeakingSubject");if(d&&(d.style.filter=`blur(${i}px)`,d.style.opacity=Number(i)>15?"0.6":"0.9"),l&&(l.style.filter=`blur(${g}px)`),x&&(x.style.opacity=this.peakingEnabled?"0.85":"0"),p){const k=Math.min(18,Math.floor(r*.9));if(k>=3){p.style.display="block";const b=Math.max(18,Math.min(65,n*80));this.renderBokehBalls(p,k,b)}else p.style.display="none",p.innerHTML=""}const S=document.getElementById("evfOsdShutter"),v=document.getElementById("evfOsdAperture"),y=document.getElementById("evfOsdDist"),E=document.getElementById("evfOsdFocal"),M=document.getElementById("evfBokehQualityLabel");if(v&&(v.textContent=`f/${a.toFixed(1).replace(".0","")}`),y&&(y.textContent=m.formatDistance(s)),E&&(E.textContent=`${t}mm`),M&&(M.textContent=h.label),S){const k=a*a/100;let b="1/500s";k<5e-4?b="1/4000s":k<.001?b="1/2000s":k<.002?b="1/1000s":k<.004?b="1/500s":k<.008?b="1/250s":k<.016?b="1/125s":k<.033?b="1/60s":b="1/30s",S.textContent=b}}renderBokehBalls(e,t,a){if(this.cachedBokehPositions.length!==t){this.cachedBokehPositions=[];for(let r=0;r<t;r++)this.cachedBokehPositions.push({x:10+(Math.sin(r*1.9)*.5+.5)*80,y:8+(Math.cos(r*2.3)*.5+.5)*55,scale:.6+(Math.sin(r*3.7)*.5+.5)*.8,color:["#fbbf24","#f59e0b","#38bdf8","#e2e8f0","#ffffff"][r%5]})}let s="";this.cachedBokehPositions.forEach(r=>{const h=a*r.scale;s+=`
        <div class="bokeh-ball" style="
          left: ${r.x}%;
          top: ${r.y}%;
          width: ${h}px;
          height: ${h}px;
          border-color: ${r.color};
          box-shadow: 0 0 ${h*.4}px ${r.color};
        "></div>
      `}),e.innerHTML=s}}const q=[{id:"portrait",name:"👤 Klassisk Portræt",sub:"85mm f/1.4 • FF • 2,0 m",params:{sensor:"full_frame",focalLength:85,aperture:1.4,distance:2}},{id:"landscape",name:"🏞️ Landskab (Hyperfokal)",sub:"24mm f/8 • FF • Hyperfokal",params:{sensor:"full_frame",focalLength:24,aperture:8,distance:"hyperfocal"}},{id:"macro",name:"🌿 Makro / Nærbillede",sub:"100mm f/2.8 • FF • 0,35 m",params:{sensor:"full_frame",focalLength:100,aperture:2.8,distance:.35}},{id:"street",name:"🏙️ Gadefoto / Zonefokus",sub:"35mm f/5.6 • APS-C • 3,0 m",params:{sensor:"apsc_sony_nikon_fuji",focalLength:35,aperture:5.6,distance:3}},{id:"wildlife",name:"🦅 Tele / Fugle & Dyr",sub:"400mm f/4 • FF • 15,0 m",params:{sensor:"full_frame",focalLength:400,aperture:4,distance:15}},{id:"phone",name:"📱 Mobilkamera",sub:"24mm ækv. f/1.8 • Mobil • 1,5 m",params:{sensor:"phone_main",focalLength:6.8,aperture:1.8,distance:1.5}}],$=[1,1.2,1.4,1.8,2,2.8,4,5.6,8,11,16,22],R=[16,24,35,50,85,105,135,200,400];class j{container;visualizer=null;currentParams={sensor:"full_frame",focalLength:50,aperture:2.8,distance:2};activeVisTab="diagram";mount(e){this.container=e,this.loadSavedState(),this.render(),this.attachEventListeners(),this.updateCalculations()}onActivate(e){if(e?.params){const t=e.params;t.has("focal")&&(this.currentParams.focalLength=Number(t.get("focal"))||50),t.has("f")&&(this.currentParams.aperture=Number(t.get("f"))||2.8),t.has("dist")&&(this.currentParams.distance=Number(t.get("dist"))||2),t.has("sensor")&&(this.currentParams.sensor=t.get("sensor")||"full_frame"),this.updateCalculations()}}loadSavedState(){try{const e=localStorage.getItem("fs_dof_state_v1");e&&(this.currentParams={...this.currentParams,...JSON.parse(e)})}catch(e){console.warn("Kunne ikke hente gemt DOF-tilstand:",e)}}saveState(){try{localStorage.setItem("fs_dof_state_v1",JSON.stringify(this.currentParams))}catch(e){console.warn("Kunne ikke gemme DOF-tilstand:",e)}}render(){const e=Object.values(F).map(s=>`<option value="${s.id}" ${s.id===this.currentParams.sensor?"selected":""}>${s.name}</option>`).join("");this.container.innerHTML=`
      <div class="dof-container">
        <!-- Modul top -->
        <div class="dof-header">
          <div class="dof-module-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <circle cx="12" cy="12" r="4"></circle>
              <line x1="12" y1="2" x2="12" y2="4"></line>
              <line x1="12" y1="20" x2="12" y2="22"></line>
            </svg>
            <span>DOF • Optisk Simulator</span>
          </div>
          <span class="fs-badge badge-dof" id="dofSensorBadge">Full Frame [1.0×]</span>
        </div>

        <!-- HERO KORT MED HOVEDTAL -->
        <div class="dof-hero-card">
          <div class="dof-main-metric">
            <div class="dof-total-val" id="dofTotalVal">--</div>
            <div class="dof-total-sub">Total Dybdeskarphed (DOF)</div>
          </div>

          <div class="dof-grid-stats">
            <div class="stat-item">
              <span class="stat-label">Nærgrænse (Dn)</span>
              <span class="stat-num" id="dofNearVal">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Fjerngrænse (Df)</span>
              <span class="stat-num highlight-dof" id="dofFarVal">--</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Hyperfokal (H)</span>
              <span class="stat-num highlight-hyper" id="dofHyperVal">--</span>
            </div>
          </div>

          <div class="dof-distribution-wrap">
            <div class="dof-dist-bar">
              <div class="dist-front" id="dofDistFront" style="width: 50%;"></div>
              <div class="dist-rear" id="dofDistRear" style="width: 50%;"></div>
            </div>
            <div class="dist-labels">
              <span id="dofFrontLabel">Foran: 50%</span>
              <span id="dofRearLabel">Bagved: 50%</span>
            </div>
          </div>
        </div>

        <!-- VISUALISERING TABS (Diagram vs EVF) -->
        <div class="dof-vis-card">
          <div class="vis-header-row">
            <div class="fs-segmented-control" style="max-width: 200px;">
              <button class="fs-segment-btn ${this.activeVisTab==="diagram"?"active":""}" data-tab="diagram" id="tabBtnDiagram">Diagram</button>
              <button class="fs-segment-btn ${this.activeVisTab==="evf"?"active":""}" data-tab="evf" id="tabBtnEvf">EVF Søger</button>
            </div>
            <div class="vis-toggles" id="evfControlsWrap" style="${this.activeVisTab==="evf"?"":"display: none;"}">
              <button class="vis-toggle-btn" id="btnTogglePeaking" title="Focus Peaking">Peaking</button>
              <button class="vis-toggle-btn active" id="btnToggleGrid" title="3x3 Kompositionsgitter">Gitter</button>
            </div>
          </div>

          <!-- SVG Diagram Visning -->
          <div class="dof-svg-wrap" id="diagramContainer" style="${this.activeVisTab==="diagram"?"":"display: none;"}">
            <svg class="dof-svg-diagram" id="dofSvgDiagram" viewBox="0 0 1000 165" preserveAspectRatio="none"></svg>
          </div>

          <!-- EVF Viewfinder Visning -->
          <div class="evf-viewfinder" id="evfContainer" style="${this.activeVisTab==="evf"?"":"display: none;"}">
            <!-- HUD Top -->
            <div class="evf-hud-top">
              <span class="hud-item"><span class="af-dot"></span> AF-C SINGLE</span>
              <span class="hud-item hud-bokeh" id="evfBokehQualityLabel">Bokeh</span>
              <span class="hud-item" id="evfOsdIso">ISO 100</span>
            </div>

            <!-- Landskab baggrund -->
            <div class="evf-layer evf-bg-scenery" id="evfLayerBackground">
              <div class="evf-sky"></div>
              <div class="evf-mountains"></div>
              <div class="evf-distant-trees"></div>
            </div>

            <!-- Bokeh bolde overlay -->
            <div class="evf-bokeh-overlay" id="evfBokehOverlay"></div>

            <!-- Motiv i fokus -->
            <div class="evf-layer evf-subject-wrap" id="evfLayerSubject">
              <div class="evf-peaking-glow" id="evfPeakingSubject"></div>
              <div class="evf-subject-figure">
                <!-- SVG af person -->
                <svg width="64" height="150" viewBox="0 0 64 150" fill="none">
                  <circle cx="32" cy="22" r="14" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
                  <path d="M12 55 C12 40, 52 40, 52 55 L56 100 L42 100 L44 145 L34 145 L32 102 L30 145 L20 145 L22 100 L8 100 Z" fill="#1e293b" stroke="#64748b" stroke-width="2"/>
                </svg>
              </div>
              <div class="evf-af-box">
                <span class="af-dot"></span>
              </div>
            </div>

            <!-- Forgrund lag -->
            <div class="evf-layer evf-foreground-wrap" id="evfLayerForeground">
              <svg width="100%" height="80" viewBox="0 0 400 80" preserveAspectRatio="none">
                <path d="M0,80 Q20,30 40,80 Q70,20 90,80 Q130,40 150,80 Q180,10 210,80 Q260,35 290,80 Q340,25 370,80 Q390,45 400,80 Z" fill="#0f172a" opacity="0.85"/>
              </svg>
            </div>

            <!-- 3x3 Gitter -->
            <div class="evf-grid-overlay" id="evfGridOverlay">
              <div class="grid-line grid-v1"></div>
              <div class="grid-line grid-v2"></div>
              <div class="grid-line grid-h1"></div>
              <div class="grid-line grid-h2"></div>
            </div>

            <!-- HUD Bund Telemetry -->
            <div class="evf-hud-bottom">
              <span id="evfOsdShutter">1/500s</span>
              <span id="evfOsdAperture" style="color: var(--golden-primary); font-weight: 700;">f/2.8</span>
              <span id="evfOsdDist">2,0 m</span>
              <span id="evfOsdFocal">50mm</span>
            </div>
          </div>
        </div>

        <!-- KONTROLPANEL KORT -->
        <div class="fs-card">
          <!-- 1. SENSOR VÆLGER -->
          <div class="fs-slider-wrap">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Sensorformat</span>
              <span class="fs-slider-val" id="dofCocDisplay">CoC: 0.029 mm</span>
            </div>
            <select class="fs-btn" id="dofSensorSelect" style="width: 100%; text-align: left; padding: 10px;">
              ${e}
            </select>
          </div>

          <!-- 2. BRÆNDVIDDE (FOCAL LENGTH) -->
          <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Brændvidde</span>
              <span class="fs-slider-val" id="dofFocalDisplay">50 mm</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="fs-btn-icon" id="btnFocalMinus" aria-label="Mindre brændvidde">-</button>
              <input type="range" id="dofFocalSlider" min="10" max="600" step="1" value="${this.currentParams.focalLength}">
              <button class="fs-btn-icon" id="btnFocalPlus" aria-label="Større brændvidde">+</button>
            </div>
            <div class="quick-btn-scroll">
              ${R.map(s=>`<button class="quick-val-btn ${s===this.currentParams.focalLength?"active":""}" data-focal="${s}">${s}mm</button>`).join("")}
            </div>
          </div>

          <!-- 3. BLÆNDE (APERTURE) -->
          <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Blænde</span>
              <span class="fs-slider-val" id="dofApertureDisplay" style="color: var(--golden-primary);">f/2.8</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="fs-btn-icon" id="btnApertureMinus" aria-label="Større blænde">-</button>
              <input type="range" id="dofApertureSlider" min="0" max="${$.length-1}" step="1" value="5">
              <button class="fs-btn-icon" id="btnAperturePlus" aria-label="Mindre blænde">+</button>
            </div>
            <div class="quick-btn-scroll">
              ${$.map(s=>`<button class="quick-val-btn ${s===this.currentParams.aperture?"active":""}" data-aperture="${s}">f/${s}</button>`).join("")}
            </div>
          </div>

          <!-- 4. AFSTAND (DISTANCE) -->
          <div class="fs-slider-wrap" style="margin-top: var(--space-3);">
            <div class="fs-slider-header">
              <span class="fs-slider-label">Motivafstand</span>
              <span class="fs-slider-val" id="dofDistanceDisplay">2,00 m</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="fs-btn-icon" id="btnDistMinus" aria-label="Tættere på">-</button>
              <input type="range" id="dofDistSlider" min="0.1" max="50" step="0.05" value="${this.currentParams.distance}">
              <button class="fs-btn-icon" id="btnDistPlus" aria-label="Længere væk">+</button>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
              <button class="fs-btn" id="btnSetHyperfocal" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">
                🎯 Sæt til Hyperfokal
              </button>
            </div>
          </div>
        </div>

        <!-- FOTOGRAFISKE SCENARIER (§8.2) -->
        <div class="fs-card">
          <div class="fs-card-header">
            <span class="fs-card-title">Hurtige Scenarier</span>
          </div>
          <div class="scenarios-grid">
            ${q.map(s=>`
              <button class="scenario-card-btn" data-scenario="${s.id}">
                <span class="scenario-name">${s.name}</span>
                <span class="scenario-sub">${s.sub}</span>
              </button>
            `).join("")}
          </div>
        </div>

        <!-- OPTISK TEKNIK INFO & DIFFRAKTION -->
        <div class="fs-card">
          <div class="fs-card-header">
            <span class="fs-card-title">Optisk Analyse</span>
            <span class="fs-badge" id="dofDiffractionBadge">Optimal skarphed</span>
          </div>
          <p id="dofDiffractionDesc" style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 12px;"></p>
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px; margin-bottom: 10px;">
            <span>35mm ækvivalent: <strong id="dofEquivDisplay" style="color: var(--text-main);">50mm f/2.8</strong></span>
            <span>Indgangspupil: <strong id="dofPupilDisplay" style="color: var(--text-main);">17,9 mm</strong></span>
          </div>
          <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-subtle); padding-top: 10px;">
            <button class="fs-btn" id="btnDofToExposure" style="padding: 6px 12px; font-size: 12px; min-height: 32px; color: var(--accent-exposure); border-color: var(--accent-exposure);">
              Overfør blænde & brændvidde til Eksponering →
            </button>
          </div>
        </div>
      </div>
    `;const t=this.container.querySelector("#dofSvgDiagram"),a=this.container.querySelector("#evfContainer");this.visualizer=new _(t,a)}attachEventListeners(){const e=this.container.querySelector("#tabBtnDiagram"),t=this.container.querySelector("#tabBtnEvf"),a=this.container.querySelector("#diagramContainer"),s=this.container.querySelector("#evfContainer"),r=this.container.querySelector("#evfControlsWrap");e?.addEventListener("click",()=>{this.activeVisTab="diagram",e.classList.add("active"),t?.classList.remove("active"),a.style.display="block",s.style.display="none",r.style.display="none",this.updateCalculations()}),t?.addEventListener("click",()=>{this.activeVisTab="evf",t.classList.add("active"),e?.classList.remove("active"),s.style.display="block",a.style.display="none",r.style.display="flex",this.updateCalculations()});const h=this.container.querySelector("#btnTogglePeaking");h?.addEventListener("click",()=>{const i=this.visualizer?.toggleFocusPeaking();h.classList.toggle("active",i)});const f=this.container.querySelector("#btnToggleGrid");f?.addEventListener("click",()=>{const i=this.visualizer?.toggleGrid();f.classList.toggle("active",i)});const u=this.container.querySelector("#dofSensorSelect");u?.addEventListener("change",()=>{this.currentParams.sensor=u.value,this.updateCalculations()});const o=this.container.querySelector("#dofFocalSlider");o?.addEventListener("input",()=>{this.currentParams.focalLength=Number(o.value),this.updateCalculations()}),this.container.querySelector("#btnFocalMinus")?.addEventListener("click",()=>{this.currentParams.focalLength=Math.max(10,this.currentParams.focalLength-5),o.value=String(this.currentParams.focalLength),this.updateCalculations()}),this.container.querySelector("#btnFocalPlus")?.addEventListener("click",()=>{this.currentParams.focalLength=Math.min(600,this.currentParams.focalLength+5),o.value=String(this.currentParams.focalLength),this.updateCalculations()}),this.container.querySelectorAll("[data-focal]").forEach(i=>{i.addEventListener("click",()=>{const g=Number(i.dataset.focal);this.currentParams.focalLength=g,o.value=String(g),this.updateCalculations()})});const n=this.container.querySelector("#dofApertureSlider");n?.addEventListener("input",()=>{const i=Number(n.value);this.currentParams.aperture=$[i]||2.8,this.updateCalculations()}),this.container.querySelector("#btnApertureMinus")?.addEventListener("click",()=>{const i=$.indexOf(this.currentParams.aperture);i>0&&(this.currentParams.aperture=$[i-1],n.value=String(i-1),this.updateCalculations())}),this.container.querySelector("#btnAperturePlus")?.addEventListener("click",()=>{const i=$.indexOf(this.currentParams.aperture);i>=0&&i<$.length-1&&(this.currentParams.aperture=$[i+1],n.value=String(i+1),this.updateCalculations())}),this.container.querySelectorAll("[data-aperture]").forEach(i=>{i.addEventListener("click",()=>{const g=Number(i.dataset.aperture);this.currentParams.aperture=g;const d=$.indexOf(g);d!==-1&&(n.value=String(d)),this.updateCalculations()})});const c=this.container.querySelector("#dofDistSlider");c?.addEventListener("input",()=>{this.currentParams.distance=Number(c.value),this.updateCalculations()}),this.container.querySelector("#btnDistMinus")?.addEventListener("click",()=>{this.currentParams.distance=Math.max(.1,Number((this.currentParams.distance*.85).toFixed(2))),c.value=String(this.currentParams.distance),this.updateCalculations()}),this.container.querySelector("#btnDistPlus")?.addEventListener("click",()=>{this.currentParams.distance=Math.min(100,Number((this.currentParams.distance*1.18).toFixed(2))),c.value=String(this.currentParams.distance),this.updateCalculations()}),this.container.querySelector("#btnSetHyperfocal")?.addEventListener("click",()=>{const i=m.calculateDOF(this.currentParams);this.currentParams.distance=Number(i.hyperfocalM.toFixed(2)),c.value=String(Math.min(50,this.currentParams.distance)),this.updateCalculations()}),this.container.querySelectorAll("[data-scenario]").forEach(i=>{i.addEventListener("click",()=>{const g=i.dataset.scenario,d=q.find(p=>p.id===g);if(!d)return;if(this.currentParams.sensor=d.params.sensor,this.currentParams.focalLength=d.params.focalLength,this.currentParams.aperture=d.params.aperture,d.params.distance==="hyperfocal"){const p=m.calculateDOF(this.currentParams);this.currentParams.distance=Number(p.hyperfocalM.toFixed(2))}else this.currentParams.distance=Number(d.params.distance);u.value=this.currentParams.sensor,o.value=String(this.currentParams.focalLength),c.value=String(Math.min(50,this.currentParams.distance));const l=$.indexOf(this.currentParams.aperture);l!==-1&&(n.value=String(l)),this.updateCalculations()})}),this.container.querySelector("#btnDofToExposure")?.addEventListener("click",()=>{const i=F[this.currentParams.sensor]||F.full_frame;A.navigate("#/eksponering",{aperture:this.currentParams.aperture,focalLength:this.currentParams.focalLength,cropFactor:i.cropFactor})})}updateCalculations(){const e=m.calculateDOF(this.currentParams);this.saveState();const t=this.container.querySelector("#dofTotalVal"),a=this.container.querySelector("#dofNearVal"),s=this.container.querySelector("#dofFarVal"),r=this.container.querySelector("#dofHyperVal"),h=this.container.querySelector("#dofSensorBadge"),f=this.container.querySelector("#dofCocDisplay"),u=this.container.querySelector("#dofFocalDisplay"),o=this.container.querySelector("#dofApertureDisplay"),n=this.container.querySelector("#dofDistanceDisplay");t&&(t.textContent=e.isInfinity?"∞ (Uendelig)":m.formatDistance(e.totalDofM)),a&&(a.textContent=m.formatDistance(e.nearLimitM)),s&&(s.textContent=e.isInfinity?"∞":m.formatDistance(e.farLimitM)),r&&(r.textContent=m.formatDistance(e.hyperfocalM)),h&&(h.textContent=`${e.sensor.shortName}`),f&&(f.textContent=`CoC: ${e.cocMm} mm`),u&&(u.textContent=`${e.focalLengthMm} mm`),o&&(o.textContent=`f/${e.aperture}`),n&&(n.textContent=m.formatDistance(e.distanceM));const c=this.container.querySelector("#dofDistFront"),i=this.container.querySelector("#dofDistRear"),g=this.container.querySelector("#dofFrontLabel"),d=this.container.querySelector("#dofRearLabel");c&&i&&(c.style.width=`${e.frontPercent}%`,i.style.width=`${e.rearPercent}%`),g&&(g.textContent=`Foran: ${Math.round(e.frontPercent)}% (${m.formatDistance(e.depthInFrontM)})`),d&&(d.textContent=`Bagved: ${Math.round(e.rearPercent)}% (${e.isInfinity?"∞":m.formatDistance(e.depthBehindM)})`),this.container.querySelectorAll("[data-focal]").forEach(v=>{const y=Number(v.dataset.focal);v.classList.toggle("active",y===e.focalLengthMm)}),this.container.querySelectorAll("[data-aperture]").forEach(v=>{const y=Number(v.dataset.aperture);v.classList.toggle("active",Math.abs(y-e.aperture)<.05)});const l=this.container.querySelector("#dofDiffractionBadge"),p=this.container.querySelector("#dofDiffractionDesc"),x=this.container.querySelector("#dofEquivDisplay"),S=this.container.querySelector("#dofPupilDisplay");l&&(l.textContent=e.diffractionStatus.label,l.className=`fs-badge ${e.diffractionStatus.badgeClass}`),p&&(p.textContent=e.diffractionStatus.desc),x&&(x.textContent=`${e.equivFocalLength}mm f/${e.equivAperture}`),S&&(S.textContent=`${e.pupilDiameterMm.toFixed(1).replace(".",",")} mm`),this.visualizer?.render(e)}}export{j as default};
