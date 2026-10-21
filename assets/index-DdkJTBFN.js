import{R as H}from"./index-BRqZpamw.js";import{A as k,L as b,a as E,T as g}from"./LocationBar-DDjrBrVz.js";const F="photoweather_cache_v2_";class L{static async fetchForecast(e,t,s=!1){const h=`${F}${e.toFixed(4)}_${t.toFixed(4)}`;let r=null;try{const a=localStorage.getItem(h);a&&(r=JSON.parse(a))}catch(a){console.warn("Kunne ikke læse vejr-cache:",a)}const i=Date.now();if(!s&&r&&r.timestamp&&i-r.timestamp<1e3*60*60*2)return{forecast:r.data,isCached:!0,updatedAt:new Date(r.timestamp)};const c=`https://api.open-meteo.com/v1/forecast?latitude=${e.toFixed(4)}&longitude=${t.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const a=await fetch(c);if(!a.ok)throw new Error(`Open-Meteo svarede med status ${a.status}`);const u=await a.json();try{localStorage.setItem(h,JSON.stringify({timestamp:i,data:u}))}catch(n){console.warn("Kunne ikke gemme vejr i localStorage:",n)}return{forecast:u,isCached:!1,updatedAt:new Date(i)}}catch(a){if(r&&r.data)return{forecast:r.data,isCached:!0,updatedAt:new Date(r.timestamp)};throw a}}static parseDayData(e,t,s,h){if(!e?.hourly?.time||!e?.daily?.time)return null;const r=e.daily.time[t];if(!r)return null;const i=r.split("-"),c=new Date(Number(i[0]),Number(i[1])-1,Number(i[2])),a=k.getSunTimes(c,s,h),u=k.getMoonIllumination(c),n=k.getMoonTimes(c,s,h),l=e.hourly.time,o=[],m=`${r}T`;for(let d=0;d<l.length;d++){const S=l[d];if(S.startsWith(m)){const $=Number(S.substring(11,13)),T=e.hourly.temperature_2m[d],D=e.hourly.dew_point_2m[d],M=e.hourly.weather_code[d],_=this.getWeatherCodeDescription(M);o.push({time:S,hour:$,temp:T,apparentTemp:e.hourly.apparent_temperature[d],humidity:e.hourly.relative_humidity_2m[d],dewPoint:D,spread:+(T-D).toFixed(1),precipProb:e.hourly.precipitation_probability[d],precipMm:e.hourly.precipitation[d],weatherCode:M,weatherDesc:_.desc,weatherIcon:_.icon,cloudTotal:e.hourly.cloud_cover[d],cloudLow:e.hourly.cloud_cover_low[d],cloudMid:e.hourly.cloud_cover_mid[d],cloudHigh:e.hourly.cloud_cover_high[d],visibility:e.hourly.visibility[d],windSpeed:e.hourly.wind_speed_10m[d],windDir:e.hourly.wind_direction_10m[d],windGusts:e.hourly.wind_gusts_10m[d]})}}const v=this.calculateFogRisk(o,a),w=this.calculateGoldenHourQuality(o,a.goldenHourMorning,a.sunrise),f=this.calculateGoldenHourQuality(o,a.goldenHourEvening,a.sunset),y=this.calculateAstroScore(o,a,u,s,h,c);return{date:c,dayIndex:t,dateStr:r,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][c.getDay()],maxTemp:e.daily.temperature_2m_max[t],minTemp:e.daily.temperature_2m_min[t],weatherCode:e.daily.weather_code[t],weatherDesc:this.getWeatherCodeDescription(e.daily.weather_code[t]).desc,sun:a,moon:u,moonTimes:n,fog:v,goldenHourMorning:w,goldenHourEvening:f,astro:y,hourly:o}}static calculateFogRisk(e,t){if(!e||e.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low"};const s=t.sunrise?t.sunrise.getHours():6,h=Math.max(0,s-3),r=Math.min(23,s+1),i=e.filter(p=>p.hour>=h&&p.hour<=r);if(i.length===0)return{score:10,level:"Lav",text:"Lav tågerisiko",icon:"☀️",classType:"low"};let c=0,a=0,u=0,n=99999,l=!1;i.forEach(p=>{c+=p.spread,a+=p.humidity,u+=p.windSpeed,p.visibility<n&&(n=p.visibility),(p.weatherCode===45||p.weatherCode===48)&&(l=!0)}),c/=i.length,a/=i.length,u/=i.length;let o=0;c<=.5?o+=40:c<=1.2?o+=32:c<=2.2?o+=20:c<=3.5&&(o+=10),a>=96?o+=30:a>=92?o+=24:a>=88?o+=16:a>=80&&(o+=8),u<=2?o+=20:u<=3.5?o+=14:u<=5?o+=6:o-=15,l||n<=1e3?o+=20:n<=4e3&&(o+=12);const m=Math.min(100,Math.max(0,o));let v="Lav",w="Lav tågerisiko – klar morgensigt",f="☀️",y="low";return m>=75?(v="Meget høj",w="Perfekte tågebetingelser! Tæt morgentåge forventes i lavninger og ved søer",f="🌫️",y="high"):m>=55?(v="Høj",w="Gode chancer for stemningsfuld morgendis og jordtåge",f="🌫️",y="high"):m>=35&&(v="Moderat",w="Mulighed for let dis over enge og vand tidligt om morgenen",f="🌁",y="moderate"),{score:m,level:v,text:w,icon:f,classType:y,avgSpread:c.toFixed(1),avgHumidity:Math.round(a),avgWind:u.toFixed(1),minVisibilityKm:(n/1e3).toFixed(1)}}static calculateGoldenHourQuality(e,t,s){if(!e||!s)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const h=s.getHours(),r=e.find(m=>m.hour===h)||e[h]||e[0],i=r.cloudTotal,c=r.cloudLow,a=r.cloudMid,u=r.cloudHigh;let n=50,l="Pænt lys",o="☀️";return c>=70||i>=85&&c+a>=80?(n=20,l="Tungt lavt skydække blokerer for direkte sollys og gylden glød",o="☁️"):i>=75?(n=35,l="Overvejende overskyet – diffust og dæmpet lys ved horisonten",o="☁️"):i<=15?(n=85,l="Klar himmel – rent gyldent lys og skarpe lange skygger",o="🌅"):c<=30&&a+u>=30&&a+u<=75?(n=95,l="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",o="🔥"):i<=50?(n=75,l="Gode forhold med dynamiske lysstriber gennem spredte skyer",o="🌤️"):(n=45,l="Vekslende skydække med diffuse lysforhold",o="⛅"),{score:n,text:l,icon:o,clouds:{total:i,low:c,mid:a,high:u}}}static calculateAstroScore(e,t,s,h,r,i){const c=t.astronomicalDusk&&t.astronomicalDawn;let a=e.filter(d=>d.hour>=22||d.hour<=4);a.length===0&&(a=e.slice(0,4));let u=0,n=0;a.forEach(d=>{u+=d.cloudTotal,n+=d.cloudLow}),u/=a.length,n/=a.length;const l=Math.round(u);let o=0;a.forEach(d=>{const S=new Date(i.getFullYear(),i.getMonth(),i.getDate()+(d.hour<=4?1:0),d.hour,0,0);try{const $=k.getMoonPosition(S,h,r);$&&$.altitude>0&&o++}catch{}});let m=100;l<=10?m-=l*.5:l<=30?m-=5+(l-10)*1:l<=60?m-=25+(l-30)*1.5:m-=70+(l-60)*.7,m-=n*.25;let v="";o===0?v="Månen er under horisonten hele natten (ingen måneforstyrrelse)":s.fraction<=15?v=`Nymåne / ultrasvagt segl (${s.fraction}%) – intet generende måneskin`:s.fraction<=45?(m-=Math.round(s.fraction/100*15),v=`Svag månefase (${s.fraction}%) – kun moderat lyspåvirkning`):(m-=Math.round(s.fraction/100*35),v=`Kraftigt måneskin (${s.fraction}%) oplyser natten og udvisker svage stjerner`),c||(m=Math.min(m,50),v+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const w=Math.min(100,Math.max(0,Math.round(m)));let f="Ugunstig",y="☁️",p="";return l>=75?(f="Ugunstig",y="☁️",p=`Tæt skydække (${l}%) dækker himlen i nat.`):l>=50?(f="Svag",y="⛅",p=`Overvejende skyet (${l}%). Kun spredte kighuller til enkelte klare stjerner.`):l>=25?(f="Moderat",y="✨",p=`Gode observationsforhold med lette slørskyer (${l}%).`):(f="Fremragende",y="🌌",p=`Krystalklar nattehimmel (${l}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:w,status:f,icon:y,text:p,roundClouds:l,moonImpact:v}}static getWeatherCodeDescription(e){switch(e){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}}class C{container;currentLocation=b.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(e){this.container=e,this.currentLocation=b.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=b.subscribe(async t=>{this.currentLocation=t,await this.loadWeather(!1)})}onActivate(e){if(e?.params){const t=e.params;t.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(t.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
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

        <!-- FÆLLES LOKATION (§4.2, §9.1) -->
        <div id="weatherLocationMount"></div>

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
    `;const e=this.container.querySelector("#weatherLocationMount");e&&(this.locationBar=new E({container:e,accentClass:"fs-btn-accent-weather",onLocationChange:t=>{this.currentLocation=t,this.loadWeather(!1)}}))}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)})}updateLocationDisplay(){const e=this.container.querySelector("#weatherLocName"),t=this.container.querySelector("#weatherLocCoords");e&&(e.textContent=this.currentLocation.name),t&&(t.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(e=!1){if(!this.isLoading){this.isLoading=!0;try{const t=await L.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,e);this.forecastData=t.forecast,this.isCachedForecast=t.isCached,this.cacheUpdatedAt=t.updatedAt,this.parsedDays=[];for(let s=0;s<7;s++){const h=L.parseDayData(this.forecastData,s,this.currentLocation.lat,this.currentLocation.lng);h&&this.parsedDays.push(h)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(t){console.error("Fejl ved indlæsning af vejr:",t);const s=this.container.querySelector("#weatherSelectedDayWrap");s&&(s.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${t.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const e=this.container.querySelector("#weatherStatusBanner"),t=this.container.querySelector("#weatherStatusTime");e&&(this.isCachedForecast&&this.cacheUpdatedAt?(e.classList.add("active"),t&&(t.textContent=`Hentet kl. ${g.formatTime(this.cacheUpdatedAt)}`)):e.classList.remove("active"))}renderDaysScroll(){const e=this.container.querySelector("#weatherDaysScroll");!e||this.parsedDays.length===0||(e.innerHTML=this.parsedDays.map((t,s)=>{const r=s===0?"I dag":t.dayName.substring(0,3),i=L.getWeatherCodeDescription(t.weatherCode);return`
        <div class="day-tab-card ${s===this.selectedDayIndex?"active":""}" data-day="${s}">
          <span class="day-name">${r}</span>
          <span class="day-date">${t.date.getDate()}</span>
          <span class="day-icon">${i.icon}</span>
          <span class="day-temp-range">${Math.round(t.minTemp)}° / ${Math.round(t.maxTemp)}°</span>
        </div>
      `}).join(""),e.querySelectorAll("[data-day]").forEach(t=>{t.addEventListener("click",()=>{const s=Number(t.dataset.day);this.selectedDayIndex=s,e.querySelectorAll(".day-tab-card").forEach(h=>h.classList.remove("active")),t.classList.add("active"),this.renderSelectedDay()})}))}renderSelectedDay(){const e=this.container.querySelector("#weatherSelectedDayWrap");if(!e||!this.parsedDays[this.selectedDayIndex])return;const t=this.parsedDays[this.selectedDayIndex],s=t.sun,h=t.moon,r=t.fog,i=t.goldenHourMorning,c=t.goldenHourEvening,a=t.astro,u=n=>n>=70?"score-high":n>=40?"score-moderate":"score-low";e.innerHTML=`
      <!-- ASTRONOMISK OVERBLIK (SOL & MÅNE) -->
      <div class="astro-overview-grid">
        <!-- Sol -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>☀️</span> Soltider
          </div>
          <div class="astro-sub-val">${g.formatTime(s.sunrise)} / ${g.formatTime(s.sunset)}</div>
          <div class="astro-sub-detail">Solopgang • Solnedgang</div>
          <div class="astro-sub-detail" style="color:var(--golden-primary);">Gylden: ${g.formatTime(s.goldenHourEvening?.start)} - ${g.formatTime(s.sunset)}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>${h.icon}</span> Måne
          </div>
          <div class="astro-sub-val">${h.fraction}% • ${h.name}</div>
          <div class="astro-sub-detail">Op: ${g.formatTime(t.moonTimes?.rise)} • Ned: ${g.formatTime(t.moonTimes?.set)}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${s.nightSky?.start?`${g.formatTime(s.nightSky.start)} - ${g.formatTime(s.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${r.icon} Morgentåge & Dis</span>
            <span class="photo-score-badge ${u(r.score)}">${r.score}/100 • ${r.level}</span>
          </div>
          <div class="photo-card-time">Tidsvindue: ca. ${g.formatTime(s.civilDawn)} - ${g.formatTime(s.sunriseEnd||s.sunrise)}</div>
          <div class="photo-card-desc">${r.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${r.avgSpread}°C • Fugt: ${r.avgHumidity}% • Vind: ${r.avgWind} m/s</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${i.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${u(i.score)}">${i.score}/100</span>
          </div>
          <div class="photo-card-time">Gylden time: ${g.formatTime(s.sunrise)} - ${g.formatTime(s.goldenHourMorning?.end)}</div>
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
            <span class="photo-card-title">${c.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${u(c.score)}">${c.score}/100</span>
          </div>
          <div class="photo-card-time">Gylden time: ${g.formatTime(s.goldenHourEvening?.start)} - ${g.formatTime(s.sunset)}</div>
          <div class="photo-card-desc">${c.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${c.clouds.total}% (Lav: ${c.clouds.low}%, Mellem: ${c.clouds.mid}%, Høj: ${c.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${s.sunset?s.sunset.getTime():t.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card">
          <div class="photo-card-top">
            <span class="photo-card-title">${a.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${u(a.score)}">${a.score}/100 • ${a.status}</span>
          </div>
          <div class="photo-card-time">Astronomisk mørke: ${s.nightSky?.start?`${g.formatTime(s.nightSky.start)} - ${g.formatTime(s.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}</div>
          <div class="photo-card-desc">${a.text}</div>
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${a.moonImpact}</span>
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
    `,e.querySelectorAll(".btn-goto-fotosol").forEach(n=>{n.addEventListener("click",()=>{const l=Number(n.dataset.time),o=new Date(l);g.setDate(o),H.navigate("#/fotosol",{date:o,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{C as default};
