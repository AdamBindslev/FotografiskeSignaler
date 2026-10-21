import{R as H}from"./index-BOCmCcGk.js";import{A as k,L as S,T as p}from"./AstroCore-CoxmUvae.js";const E="photoweather_cache_v2_";class L{static async fetchForecast(e,t,s=!1){const h=`${E}${e.toFixed(4)}_${t.toFixed(4)}`;let o=null;try{const a=localStorage.getItem(h);a&&(o=JSON.parse(a))}catch(a){console.warn("Kunne ikke læse vejr-cache:",a)}const i=Date.now();if(!s&&o&&o.timestamp&&i-o.timestamp<1e3*60*60*2)return{forecast:o.data,isCached:!0,updatedAt:new Date(o.timestamp)};const r=`https://api.open-meteo.com/v1/forecast?latitude=${e.toFixed(4)}&longitude=${t.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const a=await fetch(r);if(!a.ok)throw new Error(`Open-Meteo svarede med status ${a.status}`);const d=await a.json();try{localStorage.setItem(h,JSON.stringify({timestamp:i,data:d}))}catch(n){console.warn("Kunne ikke gemme vejr i localStorage:",n)}return{forecast:d,isCached:!1,updatedAt:new Date(i)}}catch(a){if(o&&o.data)return{forecast:o.data,isCached:!0,updatedAt:new Date(o.timestamp)};throw a}}static parseDayData(e,t,s,h){if(!e?.hourly?.time||!e?.daily?.time)return null;const o=e.daily.time[t];if(!o)return null;const i=o.split("-"),r=new Date(Number(i[0]),Number(i[1])-1,Number(i[2])),a=k.getSunTimes(r,s,h),d=k.getMoonIllumination(r),n=k.getMoonTimes(r,s,h),l=e.hourly.time,c=[],m=`${o}T`;for(let u=0;u<l.length;u++){const b=l[u];if(b.startsWith(m)){const $=Number(b.substring(11,13)),x=e.hourly.temperature_2m[u],T=e.hourly.dew_point_2m[u],D=e.hourly.weather_code[u],M=this.getWeatherCodeDescription(D);c.push({time:b,hour:$,temp:x,apparentTemp:e.hourly.apparent_temperature[u],humidity:e.hourly.relative_humidity_2m[u],dewPoint:T,spread:+(x-T).toFixed(1),precipProb:e.hourly.precipitation_probability[u],precipMm:e.hourly.precipitation[u],weatherCode:D,weatherDesc:M.desc,weatherIcon:M.icon,cloudTotal:e.hourly.cloud_cover[u],cloudLow:e.hourly.cloud_cover_low[u],cloudMid:e.hourly.cloud_cover_mid[u],cloudHigh:e.hourly.cloud_cover_high[u],visibility:e.hourly.visibility[u],windSpeed:e.hourly.wind_speed_10m[u],windDir:e.hourly.wind_direction_10m[u],windGusts:e.hourly.wind_gusts_10m[u]})}}const v=this.calculateFogRisk(c,a),w=this.calculateGoldenHourQuality(c,a.goldenHourMorning,a.sunrise),y=this.calculateGoldenHourQuality(c,a.goldenHourEvening,a.sunset),f=this.calculateAstroScore(c,a,d,s,h,r);return{date:r,dayIndex:t,dateStr:o,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][r.getDay()],maxTemp:e.daily.temperature_2m_max[t],minTemp:e.daily.temperature_2m_min[t],weatherCode:e.daily.weather_code[t],weatherDesc:this.getWeatherCodeDescription(e.daily.weather_code[t]).desc,sun:a,moon:d,moonTimes:n,fog:v,goldenHourMorning:w,goldenHourEvening:y,astro:f,hourly:c}}static calculateFogRisk(e,t){if(!e||e.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low"};const s=t.sunrise?t.sunrise.getHours():6,h=Math.max(0,s-3),o=Math.min(23,s+1),i=e.filter(g=>g.hour>=h&&g.hour<=o);if(i.length===0)return{score:10,level:"Lav",text:"Lav tågerisiko",icon:"☀️",classType:"low"};let r=0,a=0,d=0,n=99999,l=!1;i.forEach(g=>{r+=g.spread,a+=g.humidity,d+=g.windSpeed,g.visibility<n&&(n=g.visibility),(g.weatherCode===45||g.weatherCode===48)&&(l=!0)}),r/=i.length,a/=i.length,d/=i.length;let c=0;r<=.5?c+=40:r<=1.2?c+=32:r<=2.2?c+=20:r<=3.5&&(c+=10),a>=96?c+=30:a>=92?c+=24:a>=88?c+=16:a>=80&&(c+=8),d<=2?c+=20:d<=3.5?c+=14:d<=5?c+=6:c-=15,l||n<=1e3?c+=20:n<=4e3&&(c+=12);const m=Math.min(100,Math.max(0,c));let v="Lav",w="Lav tågerisiko – klar morgensigt",y="☀️",f="low";return m>=75?(v="Meget høj",w="Perfekte tågebetingelser! Tæt morgentåge forventes i lavninger og ved søer",y="🌫️",f="high"):m>=55?(v="Høj",w="Gode chancer for stemningsfuld morgendis og jordtåge",y="🌫️",f="high"):m>=35&&(v="Moderat",w="Mulighed for let dis over enge og vand tidligt om morgenen",y="🌁",f="moderate"),{score:m,level:v,text:w,icon:y,classType:f,avgSpread:r.toFixed(1),avgHumidity:Math.round(a),avgWind:d.toFixed(1),minVisibilityKm:(n/1e3).toFixed(1)}}static calculateGoldenHourQuality(e,t,s){if(!e||!s)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const h=s.getHours(),o=e.find(m=>m.hour===h)||e[h]||e[0],i=o.cloudTotal,r=o.cloudLow,a=o.cloudMid,d=o.cloudHigh;let n=50,l="Pænt lys",c="☀️";return r>=70||i>=85&&r+a>=80?(n=20,l="Tungt lavt skydække blokerer for direkte sollys og gylden glød",c="☁️"):i>=75?(n=35,l="Overvejende overskyet – diffust og dæmpet lys ved horisonten",c="☁️"):i<=15?(n=85,l="Klar himmel – rent gyldent lys og skarpe lange skygger",c="🌅"):r<=30&&a+d>=30&&a+d<=75?(n=95,l="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",c="🔥"):i<=50?(n=75,l="Gode forhold med dynamiske lysstriber gennem spredte skyer",c="🌤️"):(n=45,l="Vekslende skydække med diffuse lysforhold",c="⛅"),{score:n,text:l,icon:c,clouds:{total:i,low:r,mid:a,high:d}}}static calculateAstroScore(e,t,s,h,o,i){const r=t.astronomicalDusk&&t.astronomicalDawn;let a=e.filter(u=>u.hour>=22||u.hour<=4);a.length===0&&(a=e.slice(0,4));let d=0,n=0;a.forEach(u=>{d+=u.cloudTotal,n+=u.cloudLow}),d/=a.length,n/=a.length;const l=Math.round(d);let c=0;a.forEach(u=>{const b=new Date(i.getFullYear(),i.getMonth(),i.getDate()+(u.hour<=4?1:0),u.hour,0,0);try{const $=k.getMoonPosition(b,h,o);$&&$.altitude>0&&c++}catch{}});let m=100;l<=10?m-=l*.5:l<=30?m-=5+(l-10)*1:l<=60?m-=25+(l-30)*1.5:m-=70+(l-60)*.7,m-=n*.25;let v="";c===0?v="Månen er under horisonten hele natten (ingen måneforstyrrelse)":s.fraction<=15?v=`Nymåne / ultrasvagt segl (${s.fraction}%) – intet generende måneskin`:s.fraction<=45?(m-=Math.round(s.fraction/100*15),v=`Svag månefase (${s.fraction}%) – kun moderat lyspåvirkning`):(m-=Math.round(s.fraction/100*35),v=`Kraftigt måneskin (${s.fraction}%) oplyser natten og udvisker svage stjerner`),r||(m=Math.min(m,50),v+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const w=Math.min(100,Math.max(0,Math.round(m)));let y="Ugunstig",f="☁️",g="";return l>=75?(y="Ugunstig",f="☁️",g=`Tæt skydække (${l}%) dækker himlen i nat.`):l>=50?(y="Svag",f="⛅",g=`Overvejende skyet (${l}%). Kun spredte kighuller til enkelte klare stjerner.`):l>=25?(y="Moderat",f="✨",g=`Gode observationsforhold med lette slørskyer (${l}%).`):(y="Fremragende",f="🌌",g=`Krystalklar nattehimmel (${l}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:w,status:y,icon:f,text:g,roundClouds:l,moonImpact:v}}static getWeatherCodeDescription(e){switch(e){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}}class j{container;currentLocation=S.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;unsubLocation=null;async mount(e){this.container=e,this.currentLocation=S.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=S.subscribe(async t=>{this.currentLocation=t,this.updateLocationDisplay(),await this.loadWeather(!1)})}onActivate(e){if(e?.params){const t=e.params;t.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(t.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&this.unsubLocation()}render(){this.container.innerHTML=`
      <div class="weather-container">
        <!-- Modul top -->
        <div class="weather-header">
          <div class="weather-module-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
            <span>FotoVejr • Vejranalyse</span>
          </div>
          <button class="fs-btn" id="btnWeatherRefresh" style="padding: 4px 10px; font-size: 11px; min-height: 28px;">
            Opdater vejr
          </button>
        </div>

        <!-- LOKATION -->
        <div class="location-bar">
          <div class="loc-info-group" id="btnOpenWeatherSearch" title="Søg lokation">
            <span class="loc-main-name" id="weatherLocName">${this.currentLocation.name}</span>
            <span class="loc-sub-coords" id="weatherLocCoords">${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø</span>
          </div>
          <div class="loc-actions">
            <button class="fs-btn-icon" id="btnWeatherGps" title="Brug aktuel GPS-position" aria-label="Brug GPS">
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

        <!-- SØGE MODAL / DROPDOWN -->
        <div id="weatherSearchDropdown" class="fs-card" style="display: none; margin-bottom: 0;">
          <input type="text" id="weatherSearchInput" placeholder="Søg by eller naturområde i Danmark..." style="width: 100%; padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-highlight); background: var(--bg-surface); color: var(--text-main); font-size: 14px;">
          <div id="weatherSearchResults" style="display: flex; flex-direction: column; gap: 4px; margin-top: 8px;"></div>
        </div>

        <!-- OFFLINE STATUS BANNER (§6.4) -->
        <div class="weather-status-banner" id="weatherStatusBanner">
          <span id="weatherStatusText">Offline tilstand – gemt vejrudsigt</span>
          <span id="weatherStatusTime" style="font-family: var(--font-mono); font-weight: 700;"></span>
        </div>

        <!-- 7 DAGES VÆLGER -->
        <div class="days-scroll-wrap" id="weatherDaysScroll">
          <div style="color: var(--text-dim); font-size: 13px; padding: 12px;">Henter vejrudsigt...</div>
        </div>

        <!-- INDHOLD FOR DEN VALGTE DAG -->
        <div id="weatherSelectedDayWrap"></div>
      </div>
    `}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)}),this.container.querySelector("#btnWeatherGps")?.addEventListener("click",async()=>{try{const o=this.container.querySelector("#btnWeatherGps");o.style.opacity="0.5";const i=await S.requestGpsLocation();this.currentLocation=i,this.updateLocationDisplay(),await this.loadWeather(!0),o.style.opacity="1"}catch(o){alert(o.message)}});const e=this.container.querySelector("#weatherSearchDropdown"),t=this.container.querySelector("#weatherSearchInput"),s=this.container.querySelector("#weatherSearchResults");this.container.querySelector("#btnOpenWeatherSearch")?.addEventListener("click",()=>{const o=e.style.display==="block";e.style.display=o?"none":"block",o||t.focus()});let h=null;t?.addEventListener("input",()=>{clearTimeout(h);const o=t.value.trim();if(o.length<2){s.innerHTML="";return}h=setTimeout(async()=>{const i=await S.search(o);s.innerHTML=i.map(r=>`
          <button class="fs-btn" data-lat="${r.lat}" data-lng="${r.lng}" data-name="${r.name}" style="text-align:left; justify-content:space-between; width:100%; padding:8px 12px;">
            <strong>${r.name}</strong>
            <span style="font-size:11px;color:var(--text-muted);">${r.sub}</span>
          </button>
        `).join(""),s.querySelectorAll("[data-lat]").forEach(r=>{r.addEventListener("click",()=>{const a=Number(r.dataset.lat),d=Number(r.dataset.lng),n=r.dataset.name||"Valgt by";this.currentLocation=S.setLocation({lat:a,lng:d,name:n,source:"search"}),this.updateLocationDisplay(),e.style.display="none",t.value="",s.innerHTML="",this.loadWeather(!1)})})},300)})}updateLocationDisplay(){const e=this.container.querySelector("#weatherLocName"),t=this.container.querySelector("#weatherLocCoords");e&&(e.textContent=this.currentLocation.name),t&&(t.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(e=!1){if(!this.isLoading){this.isLoading=!0;try{const t=await L.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,e);this.forecastData=t.forecast,this.isCachedForecast=t.isCached,this.cacheUpdatedAt=t.updatedAt,this.parsedDays=[];for(let s=0;s<7;s++){const h=L.parseDayData(this.forecastData,s,this.currentLocation.lat,this.currentLocation.lng);h&&this.parsedDays.push(h)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(t){console.error("Fejl ved indlæsning af vejr:",t);const s=this.container.querySelector("#weatherSelectedDayWrap");s&&(s.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${t.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const e=this.container.querySelector("#weatherStatusBanner"),t=this.container.querySelector("#weatherStatusTime");e&&(this.isCachedForecast&&this.cacheUpdatedAt?(e.classList.add("active"),t&&(t.textContent=`Hentet kl. ${p.formatTime(this.cacheUpdatedAt)}`)):e.classList.remove("active"))}renderDaysScroll(){const e=this.container.querySelector("#weatherDaysScroll");!e||this.parsedDays.length===0||(e.innerHTML=this.parsedDays.map((t,s)=>{const o=s===0?"I dag":t.dayName.substring(0,3),i=L.getWeatherCodeDescription(t.weatherCode);return`
        <div class="day-tab-card ${s===this.selectedDayIndex?"active":""}" data-day="${s}">
          <span class="day-name">${o}</span>
          <span class="day-date">${t.date.getDate()}</span>
          <span class="day-icon">${i.icon}</span>
          <span class="day-temp-range">${Math.round(t.minTemp)}° / ${Math.round(t.maxTemp)}°</span>
        </div>
      `}).join(""),e.querySelectorAll("[data-day]").forEach(t=>{t.addEventListener("click",()=>{const s=Number(t.dataset.day);this.selectedDayIndex=s,e.querySelectorAll(".day-tab-card").forEach(h=>h.classList.remove("active")),t.classList.add("active"),this.renderSelectedDay()})}))}renderSelectedDay(){const e=this.container.querySelector("#weatherSelectedDayWrap");if(!e||!this.parsedDays[this.selectedDayIndex])return;const t=this.parsedDays[this.selectedDayIndex],s=t.sun,h=t.moon,o=t.fog,i=t.goldenHourMorning,r=t.goldenHourEvening,a=t.astro,d=n=>n>=70?"score-high":n>=40?"score-moderate":"score-low";e.innerHTML=`
      <!-- ASTRONOMISK OVERBLIK (SOL & MÅNE) -->
      <div class="astro-overview-grid">
        <!-- Sol -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>☀️</span> Soltider
          </div>
          <div class="astro-sub-val">${p.formatTime(s.sunrise)} / ${p.formatTime(s.sunset)}</div>
          <div class="astro-sub-detail">Solopgang • Solnedgang</div>
          <div class="astro-sub-detail" style="color:var(--golden-primary);">Gylden: ${p.formatTime(s.goldenHourEvening?.start)} - ${p.formatTime(s.sunset)}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>${h.icon}</span> Måne
          </div>
          <div class="astro-sub-val">${h.fraction}% • ${h.name}</div>
          <div class="astro-sub-detail">Op: ${p.formatTime(t.moonTimes?.rise)} • Ned: ${p.formatTime(t.moonTimes?.set)}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${s.nightSky?.start?`${p.formatTime(s.nightSky.start)} - ${p.formatTime(s.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${o.icon} Morgentåge & Dis</span>
            <span class="photo-score-badge ${d(o.score)}">${o.score}/100 • ${o.level}</span>
          </div>
          <div class="photo-card-time">Tidsvindue: ca. ${p.formatTime(s.civilDawn)} - ${p.formatTime(s.sunriseEnd||s.sunrise)}</div>
          <div class="photo-card-desc">${o.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${o.avgSpread}°C • Fugt: ${o.avgHumidity}% • Vind: ${o.avgWind} m/s</span>
            <button class="btn-goto-fotosol" data-time="${s.sunrise?s.sunrise.getTime():t.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${i.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${d(i.score)}">${i.score}/100</span>
          </div>
          <div class="photo-card-time">Gylden time: ${p.formatTime(s.sunrise)} - ${p.formatTime(s.goldenHourMorning?.end)}</div>
          <div class="photo-card-desc">${i.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${i.clouds.total}% (Lav: ${i.clouds.low}%, Mellem: ${i.clouds.mid}%, Høj: ${i.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${s.sunrise?s.sunrise.getTime():t.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${r.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${d(r.score)}">${r.score}/100</span>
          </div>
          <div class="photo-card-time">Gylden time: ${p.formatTime(s.goldenHourEvening?.start)} - ${p.formatTime(s.sunset)}</div>
          <div class="photo-card-desc">${r.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${r.clouds.total}% (Lav: ${r.clouds.low}%, Mellem: ${r.clouds.mid}%, Høj: ${r.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${s.sunset?s.sunset.getTime():t.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${a.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${d(a.score)}">${a.score}/100 • ${a.status}</span>
          </div>
          <div class="photo-card-time">Astronomisk mørke: ${s.nightSky?.start?`${p.formatTime(s.nightSky.start)} - ${p.formatTime(s.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}</div>
          <div class="photo-card-desc">${a.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${a.moonImpact}</span>
            <button class="btn-goto-fotosol" data-time="${s.nadir?s.nadir.getTime():t.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>
      </div>

      <!-- TIME-FOR-TIME TABEL -->
      <div class="fs-card" style="margin-top: 14px;">
        <div class="fs-card-header">
          <span class="fs-card-title">Time-for-time vejrdata</span>
          <span class="fs-badge">${t.dayName}</span>
        </div>
        <div class="hourly-table-wrap">
          <div class="hourly-scroll">
            ${t.hourly.map(n=>`
                <div class="hourly-col">
                  <span class="hour-badge">${String(n.hour).padStart(2,"0")}:00</span>
                  <span>${n.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(n.temp)}°</span>
                  <span class="hour-clouds">☁️ ${n.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${n.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(n.visibility/1e3).toFixed(0)}km</span>
                </div>
              `).join("")}
          </div>
        </div>
      </div>
    `,e.querySelectorAll(".btn-goto-fotosol").forEach(n=>{n.addEventListener("click",()=>{const l=Number(n.dataset.time),c=new Date(l);p.setDate(c),H.navigate("#/fotosol",{date:c,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{j as default};
