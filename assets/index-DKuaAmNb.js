import{R as X}from"./index-BwK0GMXD.js";import{A as x,T as n,L as K,a as Z}from"./LocationBar-CZCNmsGQ.js";const ee="photoweather_cache_v2_";class C{static async fetchForecast(s,t,e=!1){const k=`${ee}${s.toFixed(4)}_${t.toFixed(4)}`;let a=null;try{const r=localStorage.getItem(k);r&&(a=JSON.parse(r))}catch(r){console.warn("Kunne ikke læse vejr-cache:",r)}const u=Date.now();if(!e&&a&&a.timestamp&&u-a.timestamp<1e3*60*60*2)return{forecast:a.data,isCached:!0,updatedAt:new Date(a.timestamp)};const g=`https://api.open-meteo.com/v1/forecast?latitude=${s.toFixed(4)}&longitude=${t.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const r=await fetch(g);if(!r.ok)throw new Error(`Open-Meteo svarede med status ${r.status}`);const l=await r.json();try{localStorage.setItem(k,JSON.stringify({timestamp:u,data:l}))}catch(d){console.warn("Kunne ikke gemme vejr i localStorage:",d)}return{forecast:l,isCached:!1,updatedAt:new Date(u)}}catch(r){if(a&&a.data)return{forecast:a.data,isCached:!0,updatedAt:new Date(a.timestamp)};throw r}}static parseDayData(s,t,e,k){if(!s?.hourly?.time||!s?.daily?.time)return null;const a=s.daily.time[t];if(!a)return null;const u=a.split("-"),g=new Date(Number(u[0]),Number(u[1])-1,Number(u[2]),12,0,0),r=x.getSunTimes(g,e,k),l=x.getMoonIllumination(g),d=x.getMoonTimes(g,e,k),y=s.hourly.time,o=[],S=[],v=`${a}T`,i=s.daily.time[t+1],m=i?`${i}T`:null,c=($,M)=>{const A=Number(M.substring(11,13)),w=s.hourly.temperature_2m[$],E=s.hourly.dew_point_2m[$],_=s.hourly.weather_code[$],j=this.getWeatherCodeDescription(_);return{time:M,hour:A,temp:w,apparentTemp:s.hourly.apparent_temperature[$],humidity:s.hourly.relative_humidity_2m[$],dewPoint:E,spread:+(w-E).toFixed(1),precipProb:s.hourly.precipitation_probability[$],precipMm:s.hourly.precipitation[$],weatherCode:_,weatherDesc:j.desc,weatherIcon:j.icon,cloudTotal:s.hourly.cloud_cover[$],cloudLow:s.hourly.cloud_cover_low[$],cloudMid:s.hourly.cloud_cover_mid[$],cloudHigh:s.hourly.cloud_cover_high[$],visibility:s.hourly.visibility[$],windSpeed:s.hourly.wind_speed_10m[$],windDir:s.hourly.wind_direction_10m[$],windGusts:s.hourly.wind_gusts_10m[$]}};for(let $=0;$<y.length;$++){const M=y[$];M.startsWith(v)?o.push(c($,M)):m&&M.startsWith(m)&&Number(M.substring(11,13))<=4&&S.push(c($,M))}const f=this.calculateFogRisk(o,r),b=this.calculateGoldenHourQuality(o,r.goldenHourMorning,r.sunrise),h=this.calculateGoldenHourQuality(o,r.goldenHourEvening,r.sunset),T=this.calculateAstroScore(o,r,l,e,k,g,S);return{date:g,dayIndex:t,dateStr:a,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][g.getDay()],maxTemp:s.daily.temperature_2m_max[t],minTemp:s.daily.temperature_2m_min[t],weatherCode:s.daily.weather_code[t],weatherDesc:this.getWeatherCodeDescription(s.daily.weather_code[t]).desc,sun:r,moon:l,moonTimes:d,fog:f,goldenHourMorning:b,goldenHourEvening:h,astro:T,hourly:o}}static calculateFogRisk(s,t){if(!s||s.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low"};const e=t.sunrise?t.sunrise.getHours():6,k=Math.max(0,e-3),a=Math.min(23,e+1),u=s.filter(f=>f.hour>=k&&f.hour<=a);if(u.length===0)return{score:10,level:"Lav",text:"Lav tågerisiko",icon:"☀️",classType:"low"};let g=0,r=0,l=0,d=99999,y=!1;u.forEach(f=>{g+=f.spread,r+=f.humidity,l+=f.windSpeed,f.visibility<d&&(d=f.visibility),(f.weatherCode===45||f.weatherCode===48)&&(y=!0)}),g/=u.length,r/=u.length,l/=u.length;let o=0;g<=.5?o+=40:g<=1.2?o+=32:g<=2.2?o+=20:g<=3.5&&(o+=10),r>=96?o+=30:r>=92?o+=24:r>=88?o+=16:r>=80&&(o+=8),l<=2?o+=20:l<=3.5?o+=14:l<=5?o+=6:o-=15,y||d<=1e3?o+=20:d<=4e3&&(o+=12);const S=Math.min(100,Math.max(0,o));let v="Lav",i="Lav tågerisiko – klar morgensigt",m="☀️",c="low";return S>=75?(v="Meget høj",i="Perfekte tågebetingelser! Tæt morgentåge forventes i lavninger og ved søer",m="🌫️",c="high"):S>=55?(v="Høj",i="Gode chancer for stemningsfuld morgendis og jordtåge",m="🌫️",c="high"):S>=35&&(v="Moderat",i="Mulighed for let dis over enge og vand tidligt om morgenen",m="🌁",c="moderate"),{score:S,level:v,text:i,icon:m,classType:c,avgSpread:g.toFixed(1),avgHumidity:Math.round(r),avgWind:l.toFixed(1),minVisibilityKm:(d/1e3).toFixed(1)}}static calculateGoldenHourQuality(s,t,e){if(!s||!e)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const k=e.getHours(),a=s.find(S=>S.hour===k)||s[k]||s[0],u=a.cloudTotal,g=a.cloudLow,r=a.cloudMid,l=a.cloudHigh;let d=50,y="Pænt lys",o="☀️";return g>=70||u>=85&&g+r>=80?(d=20,y="Tungt lavt skydække blokerer for direkte sollys og gylden glød",o="☁️"):u>=75?(d=35,y="Overvejende overskyet – diffust og dæmpet lys ved horisonten",o="☁️"):u<=15?(d=85,y="Klar himmel – rent gyldent lys og skarpe lange skygger",o="🌅"):g<=30&&r+l>=30&&r+l<=75?(d=95,y="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",o="🔥"):u<=50?(d=75,y="Gode forhold med dynamiske lysstriber gennem spredte skyer",o="🌤️"):(d=45,y="Vekslende skydække med diffuse lysforhold",o="⛅"),{score:d,text:y,icon:o,clouds:{total:u,low:g,mid:r,high:l}}}static calculateAstroScore(s,t,e,k,a,u,g){const r=t.astronomicalDusk&&t.astronomicalDawn;let l;g&&g.length>0?l=[...s.filter(h=>h.hour>=22),...g.filter(h=>h.hour<=4)]:l=s.filter(h=>h.hour>=22||h.hour<=4),l.length===0&&(l=s.slice(0,4));let d=0,y=0;l.forEach(h=>{d+=h.cloudTotal,y+=h.cloudLow}),d/=l.length,y/=l.length;const o=Math.round(d);let S=0;l.forEach(h=>{const T=new Date(u.getFullYear(),u.getMonth(),u.getDate()+(h.hour<=4?1:0),h.hour,0,0);try{const L=x.getMoonPosition(T,k,a);L&&L.altitude>0&&S++}catch{}});let v=100;o<=10?v-=o*.5:o<=30?v-=5+(o-10)*1:o<=60?v-=25+(o-30)*1.5:v-=70+(o-60)*.7,v-=y*.25;let i="";S===0?i="Månen er under horisonten hele natten (ingen måneforstyrrelse)":e.fraction<=15?i=`Nymåne / ultrasvagt segl (${e.fraction}%) – intet generende måneskin`:e.fraction<=45?(v-=Math.round(e.fraction/100*15),i=`Svag månefase (${e.fraction}%) – kun moderat lyspåvirkning`):(v-=Math.round(e.fraction/100*35),i=`Kraftigt måneskin (${e.fraction}%) oplyser natten og udvisker svage stjerner`),r||(v=Math.min(v,50),i+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const m=Math.min(100,Math.max(0,Math.round(v)));let c="Ugunstig",f="☁️",b="";return o>=75?(c="Ugunstig",f="☁️",b=`Tæt skydække (${o}%) dækker himlen i nat.`):o>=50?(c="Svag",f="⛅",b=`Overvejende skyet (${o}%). Kun spredte kighuller til enkelte klare stjerner.`):o>=25?(c="Moderat",f="✨",b=`Gode observationsforhold med lette slørskyer (${o}%).`):(c="Fremragende",f="🌌",b=`Krystalklar nattehimmel (${o}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:m,status:c,icon:f,text:b,roundClouds:o,moonImpact:i}}static getWeatherCodeDescription(s){switch(s){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}static getEventTiming(s,t,e,k,a,u=50,g){const r=g||n.getDate()||new Date,l=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],d=typeof u=="number"?u:50;if(e===0){if(s&&t&&r>=s&&r<=t){const v=t.getTime()-r.getTime(),i=n.formatDuration(v);let m="banner-active",c="🟢",f="Aktiv nu",b=`Aktiv lige nu • Slutter om ${i}`,h=`Aktiv lige nu (slutter kl. ${n.formatTime(t)})`;return a==="astro"?d>=65?(m="banner-active",c="✨",f="Aktiv nu",b=`Gode stjerneforhold nu • Slutter om ${i}`,h=`Astronomisk nat aktiv lige nu (slutter kl. ${n.formatTime(t)})`):d>=40?(m="banner-active-moderate",c="⛅",f="Moderat nu",b=`Astronomisk nat aktiv • Vekslende skydække (slutter om ${i})`,h=`Mørke i gang (kl. ${n.formatTime(t)}) • Skiftende skyer`):(m="banner-active-poor",c="☁️",f="Overskyet nu",b=`Astronomisk nat er i gang • Desværre overskyet (slutter om ${i})`,h=`Mørke i gang (kl. ${n.formatTime(t)}) • Dækket af skyer`):a==="fog"?d>=55?(m="banner-active",c="🌫️",f="Aktiv nu",b=`Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${i})`,h=`Tågevindue aktivt lige nu (slutter kl. ${n.formatTime(t)})`):d>=35?(m="banner-active-moderate",c="🌁",f="Moderat nu",b=`Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${i})`,h=`Tidsvindue aktivt (slutter kl. ${n.formatTime(t)})`):(m="banner-active-poor",c="☀️",f="Klar sigt",b=`Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${i})`,h=`Morgenstund i gang (slutter kl. ${n.formatTime(t)}) • Ingen tåge`):a==="morning"?d>=65?(m="banner-active",c="🌅",f="Aktiv nu",b=`Gylden time aktiv lige nu • Flot morgenlys (slutter om ${i})`,h=`Daggry i gang nu (slutter kl. ${n.formatTime(t)})`):d>=40?(m="banner-active-moderate",c="🌤️",f="Vekslende nu",b=`Morgenlys aktivt nu • Vekslende skydække (slutter om ${i})`,h=`Morgenlys i gang (slutter kl. ${n.formatTime(t)})`):(m="banner-active-poor",c="☁️",f="Overskyet nu",b=`Morgentime i gang • Solen skjult af skydække (slutter om ${i})`,h="Morgenlys i gang, men dækket af skyer"):a==="evening"&&(d>=65?(m="banner-active",c="🌆",f="Aktiv nu",b=`Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${i})`,h=`Aktiv solnedgang lige nu (slutter kl. ${n.formatTime(t)})`):d>=40?(m="banner-active-moderate",c="🌤️",f="Moderat nu",b=`Aftenlys i gang • Vekslende skydække (slutter om ${i})`,h=`Solnedgang i gang (slutter kl. ${n.formatTime(t)})`):(m="banner-active-poor",c="☁️",f="Overskyet nu",b=`Solnedgang i gang • Skjult bag tungt skydække (slutter om ${i})`,h="Solnedgang i gang, men skjult bag skyer")),{status:"active",bannerClass:m,icon:c,pill:f,label:b,sub:h,isPassed:!1}}if(t&&r>t){const v=r.getTime()-t.getTime(),i=n.formatDuration(v);let m=`I morges • For ${i} siden`,c=`Afsluttet i morges (for ${i} siden)`;return a==="evening"?(m=`I aften • For ${i} siden`,c=`Afsluttet i aften kl. ${n.formatTime(t)}`):a==="astro"&&(m="Natten er ovre",c=`Astronomisk nat afsluttet kl. ${n.formatTime(t)}`),{status:"passed",bannerClass:"banner-passed",icon:"⏳",pill:"Passeret",label:m,sub:c,isPassed:!0}}if(s&&r<s){const v=s.getTime()-r.getTime(),i=n.formatDuration(v);let m=`I dag • Om ${i}`,c=`Starter kl. ${n.formatTime(s)} (om ${i})`;return a==="evening"?(m=d>=65?`I aften • Om ${i} (flot aftenlys)`:`I aften • Om ${i}`,c=`Starter i aften kl. ${n.formatTime(s)} (om ${i})`):a==="astro"?(m=d>=65?`I aften/nat • Om ${i} (klare stjerneforhold)`:d<=35?`I aften/nat • Om ${i} (forventet overskyet)`:`I aften/nat • Om ${i}`,c=`Astronomisk nat starter kl. ${n.formatTime(s)} (om ${i})`):(a==="fog"||a==="morning")&&(m=`I dag ved daggry • Om ${i}`),{status:"upcoming",bannerClass:"banner-upcoming",icon:"⏱️",pill:"Kommende",label:m,sub:c,isPassed:!1}}}if(e===1){const v=s?Math.max(0,s.getTime()-r.getTime()):0,i=n.formatDuration(v);let m=`I morgen • Om ${i}`,c=`I morgen kl. ${s?n.formatTime(s):"--:--"}`;return a==="fog"||a==="morning"?(m=`I morgen tidlig • Om ${i}`,c=`I morgen kl. ${n.formatTime(s)} (om ${i})`):a==="evening"?(m=`I morgen aften • Om ${i}`,c=`I morgen kl. ${n.formatTime(s)} (om ${i})`):a==="astro"&&(m=`I morgen nat • Om ${i}`,c=`I morgen nat fra kl. ${n.formatTime(s)}`),{status:"future",bannerClass:"banner-future",icon:"📅",pill:"I morgen",label:m,sub:c,isPassed:!1}}const y=l[k.getDay()];let o=`${y} • Om ${e} dage`,S=`${y}`;return a==="fog"||a==="morning"?(o=`${y} morgen • Om ${e} dage`,S=`${y} kl. ${s?n.formatTime(s):"06:00"}`):a==="evening"?(o=`${y} aften • Om ${e} dage`,S=`${y} kl. ${s?n.formatTime(s):"18:00"}`):a==="astro"&&(o=`${y} nat • Om ${e} dage`,S=`${y} nat`),{status:"future-distant",bannerClass:"banner-future",icon:"📅",pill:y,label:o,sub:S,isPassed:!1}}}class ne{container;currentLocation=K.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(s){this.container=s,this.currentLocation=K.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=K.subscribe(async t=>{this.currentLocation=t,await this.loadWeather(!1)})}onActivate(s){if(s?.params){const t=s.params;t.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(t.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
      <div class="weather-container">
        <!-- Modul top -->
        <div class="weather-header">
          <div class="weather-module-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
            </svg>
            <span>Vejr • Vejranalyse</span>
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
    `;const s=this.container.querySelector("#weatherLocationMount");s&&(this.locationBar=new Z({container:s,accentClass:"fs-btn-accent-weather"}))}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)})}updateLocationDisplay(){const s=this.container.querySelector("#weatherLocName"),t=this.container.querySelector("#weatherLocCoords");s&&(s.textContent=this.currentLocation.name),t&&(t.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(s=!1){if(!this.isLoading){this.isLoading=!0;try{const t=await C.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,s);this.forecastData=t.forecast,this.isCachedForecast=t.isCached,this.cacheUpdatedAt=t.updatedAt,this.parsedDays=[];for(let e=0;e<7;e++){const k=C.parseDayData(this.forecastData,e,this.currentLocation.lat,this.currentLocation.lng);k&&this.parsedDays.push(k)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(t){console.error("Fejl ved indlæsning af vejr:",t);const e=this.container.querySelector("#weatherSelectedDayWrap");e&&(e.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${t.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const s=this.container.querySelector("#weatherStatusBanner"),t=this.container.querySelector("#weatherStatusTime");s&&(this.isCachedForecast&&this.cacheUpdatedAt?(s.classList.add("active"),t&&(t.textContent=`Hentet kl. ${n.formatTime(this.cacheUpdatedAt)}`)):s.classList.remove("active"))}selectDay(s){this.selectedDayIndex=Math.min(6,Math.max(0,s));const t=this.container.querySelector("#weatherDaysScroll");t&&(t.querySelectorAll(".day-tab-card").forEach(e=>e.classList.remove("active")),t.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add("active")),this.renderSelectedDay()}renderDaysScroll(){const s=this.container.querySelector("#weatherDaysScroll");!s||this.parsedDays.length===0||(s.innerHTML=this.parsedDays.map((t,e)=>{const a=e===0?"I dag":t.dayName.substring(0,3),u=C.getWeatherCodeDescription(t.weatherCode);return`
        <div class="day-tab-card ${e===this.selectedDayIndex?"active":""}" data-day="${e}">
          <span class="day-name">${a}</span>
          <span class="day-date">${t.date.getDate()}</span>
          <span class="day-icon">${u.icon}</span>
          <span class="day-temp-range">${Math.round(t.minTemp)}° / ${Math.round(t.maxTemp)}°</span>
        </div>
      `}).join(""),s.querySelectorAll("[data-day]").forEach(t=>{t.addEventListener("click",()=>{const e=Number(t.dataset.day);this.selectDay(e)})}))}renderSelectedDay(){const s=this.container.querySelector("#weatherSelectedDayWrap");if(!s||!this.parsedDays[this.selectedDayIndex])return;const t=this.parsedDays[this.selectedDayIndex],e=t.sun,k=t.moon,a=t.fog,u=t.goldenHourMorning,g=t.goldenHourEvening,r=t.astro,l=n.getDate()||new Date,d=this.selectedDayIndex===0,y=this.selectedDayIndex===1,o=e.civilDawn||(e.sunrise?new Date(e.sunrise.getTime()-45*60*1e3):null),S=e.sunriseEnd||(e.sunrise?new Date(e.sunrise.getTime()+65*60*1e3):null),v=C.getEventTiming(o,S,this.selectedDayIndex,t.date,"fog",a.score,l),i=e.blueHourMorning&&e.blueHourMorning.start||(e.sunrise?new Date(e.sunrise.getTime()-50*60*1e3):null),m=e.goldenHourMorning&&e.goldenHourMorning.end||(e.sunrise?new Date(e.sunrise.getTime()+45*60*1e3):null),c=C.getEventTiming(i,m,this.selectedDayIndex,t.date,"morning",u.score,l),f=e.goldenHourEvening&&e.goldenHourEvening.start||(e.sunset?new Date(e.sunset.getTime()-45*60*1e3):null),b=e.blueHourEvening&&e.blueHourEvening.end||(e.sunset?new Date(e.sunset.getTime()+45*60*1e3):null),h=C.getEventTiming(f,b,this.selectedDayIndex,t.date,"evening",g.score,l);let T=null,L=null;e.astronomicalDusk&&(d&&e.astronomicalDawn&&l<e.astronomicalDawn?(T=new Date(e.astronomicalDusk.getTime()-24*60*60*1e3),L=e.astronomicalDawn):(T=e.astronomicalDusk,L=e.astronomicalDawn?new Date(e.astronomicalDawn.getTime()+24*60*60*1e3):new Date(T.getTime()+9*60*60*1e3)));const $=C.getEventTiming(T,L,this.selectedDayIndex,t.date,"astro",r.score,l),M=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];let A="",w="";if(d)A=`I dag (${t.dayName.toLowerCase()} d. ${t.date.getDate()}. ${M[t.date.getMonth()]})`,e.sunset&&l>e.sunset?w="Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys":v.status==="active"?w=a.score>=50?`Aktuel nu: Morgentåge & solopgang kl. ${n.formatTime(e.sunrise)}`:`Aktuel nu: Solopgang & daggry kl. ${n.formatTime(e.sunrise)}`:c.status==="active"?w=u.score>=50?"Aktuel lige nu: Daggry & gylden time!":"Aktuel lige nu: Daggry (skydækket morgen)":h.status==="active"?w=g.score>=50?"Aktuel lige nu: Solnedgang & aftenlys!":"Aktuel lige nu: Solnedgang (skjult bag skyer)":f&&l<f?w=`Næste: Gylden time i aften kl. ${n.formatTime(f)} (om ${n.formatDuration(f.getTime()-l.getTime())})`:T&&l<T?w=r.score>=60?`Næste: Stjernehimmel i aften kl. ${n.formatTime(T)} (om ${n.formatDuration(T.getTime()-l.getTime())})`:`Næste: Astronomisk mørke i aften kl. ${n.formatTime(T)} (om ${n.formatDuration(T.getTime()-l.getTime())})`:w="Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";else if(y){A=`I morgen (${t.dayName.toLowerCase()} d. ${t.date.getDate()}. ${M[t.date.getMonth()]})`;const p=e.blueHourMorning?.start||e.sunrise,D=p?Math.max(0,p.getTime()-l.getTime()):0;w=`Første fotomulighed: Daggry kl. ${n.formatTime(p)} (om ${n.formatDuration(D)}) • Vejrudsigt for i morgen`}else A=`${t.dayName} d. ${t.date.getDate()}. ${M[t.date.getMonth()]}`,w=`7-dages vejrudsigt for ${this.currentLocation.name}`;const E=p=>p>=70?"score-high":p>=40?"score-moderate":"score-low",_=p=>`
      <div class="card-timing-banner ${p.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${p.icon}</span>
          <span class="timing-label">${p.label}</span>
        </div>
        <span class="timing-banner-pill">${p.pill}</span>
      </div>
    `,j=(p,D,H)=>!p||!d||this.parsedDays.length<=1?"":`
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${D}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${H} ➔</button>
        </div>
      `;let V=`${n.formatTime(e.sunrise)} / ${n.formatTime(e.sunset)}`,I="Solopgang • Solnedgang",P=`<span style="color:var(--golden-primary);">Gylden: ${n.formatTime(e.goldenHourEvening?.start)} - ${n.formatTime(e.sunset)}</span>`;if(d)if(e.sunset&&l>e.sunset)V+=' <span class="time-passed-tag">Passeret</span>',I="Solopgang • Solnedgang (dagens soltimer er forbi)",P=`<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;else if(e.sunrise&&l>e.sunrise){I=`Solopgang var for ${n.formatDuration(l.getTime()-e.sunrise.getTime())} siden`;const p=e.goldenHourEvening?.start||e.sunset?n.formatDuration((e.goldenHourEvening?.start||e.sunset).getTime()-l.getTime()):"";P=`<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${n.formatTime(e.goldenHourEvening?.start||e.sunset)} (om ${p})</span>`}else{const p=e.sunrise?n.formatDuration(e.sunrise.getTime()-l.getTime()):"";I=`Solopgang i morges/dag kl. ${n.formatTime(e.sunrise)} (om ${p})`}else y&&(I=`Solopgang i morgen kl. ${n.formatTime(e.sunrise)} • Solnedgang kl. ${n.formatTime(e.sunset)}`);const N=t.moonTimes?.riseAzimuth,O=t.moonTimes?.setAzimuth,F=N!=null?` (${N.toFixed(0)}° ${x.getCompassDirection(N)})`:"",B=O!=null?` (${O.toFixed(0)}° ${x.getCompassDirection(O)})`:"";let G=`Op: ${n.formatTime(t.moonTimes?.rise)}${F} • Ned: ${n.formatTime(t.moonTimes?.set)}${B}`;if(d){const p=t.moonTimes?.rise?l>t.moonTimes.rise?`Op kl. ${n.formatTime(t.moonTimes.rise)}${F}`:`Op kl. ${n.formatTime(t.moonTimes.rise)}${F} (om ${n.formatDuration(t.moonTimes.rise.getTime()-l.getTime())})`:"Går ikke op",D=t.moonTimes?.set?`Ned kl. ${n.formatTime(t.moonTimes.set)}${B}`:"Går ikke ned";G=`${p} • ${D}`}else y&&(G=`I morgen: Op kl. ${n.formatTime(t.moonTimes?.rise)}${F} • Ned kl. ${n.formatTime(t.moonTimes?.set)}${B}`);const z=l.getHours(),R=e.sunrise?x.getSunPosition(e.sunrise,this.currentLocation.lat,this.currentLocation.lng):null,W=e.sunset?x.getSunPosition(e.sunset,this.currentLocation.lat,this.currentLocation.lng):null,q=R?`${R.azimuth.toFixed(0)}° ${x.getCompassDirection(R.azimuth)}`:"",U=W?`${W.azimuth.toFixed(0)}° ${x.getCompassDirection(W.azimuth)}`:"";s.innerHTML=`
      <!-- OVERORDNET DAG-STATUS BANNER -->
      <div class="weather-day-banner">
        <div class="weather-day-banner-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div class="weather-day-banner-content">
          <div class="weather-day-banner-title">${A}</div>
          <div class="weather-day-banner-sub">${w}</div>
        </div>
      </div>

      <!-- ASTRONOMISK OVERBLIK (SOL & MÅNE) -->
      <div class="astro-overview-grid">
        <!-- Sol -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>☀️</span> Soltider
          </div>
          <div class="astro-sub-val">${V}</div>
          <div class="astro-sub-detail">${I}</div>
          <div class="astro-sub-detail">${P}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title" style="justify-content: space-between;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span>${k.icon}</span> Måne</span>
            <button class="btn-goto-sol" data-body="moon" data-time="${t.moonTimes?.rise?t.moonTimes.rise.getTime():t.date.getTime()}" style="padding:1px 7px;font-size:10px;" title="Se måneopgang og måneretning i Sol/Måne-modulet">
              Sol/Måne →
            </button>
          </div>
          <div class="astro-sub-val">${k.fraction}% • ${k.name}</div>
          <div class="astro-sub-detail">${G}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${e.nightSky?.start?`${n.formatTime(e.nightSky.start)} - ${n.formatTime(e.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis -->
        <div class="photo-card ${v.isPassed?"card-event-passed":""}">
          ${_(v)}
          <div class="photo-card-top">
            <span class="photo-card-title">${a.icon} Morgentåge & Dis</span>
            <span class="photo-score-badge ${E(a.score)}">${a.score}/100 • ${a.level}</span>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ca. ${n.formatTime(o)} - ${n.formatTime(S)}
            ${v.isPassed?'<span class="time-passed-tag">Afsluttet i morges</span>':`• ${v.sub}`}
          </div>
          <div class="photo-card-desc">${a.text}</div>
          ${j(v.isPassed,"Morgentågen fandt sted i morges. Tjek i morgen?","Se i morgen tidlig")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${a.avgSpread}°C • Fugt: ${a.avgHumidity}% • Vind: ${a.avgWind} m/s</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card ${c.isPassed?"card-event-passed":""}">
          ${_(c)}
          <div class="photo-card-top">
            <span class="photo-card-title">${u.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${E(u.score)}">${u.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${n.formatTime(e.sunrise)} - ${n.formatTime(e.goldenHourMorning?.end)}
            ${q?`<span class="compass-direction-tag" title="Solens kompasretning ved solopgang">🧭 ${q}</span>`:""}
            ${c.isPassed?`<span class="time-passed-tag">Passeret (kl. ${n.formatTime(e.sunrise)})</span>`:`• ${c.sub}`}
          </div>
          <div class="photo-card-desc">${u.text}</div>
          ${j(c.isPassed,"Morgenens gyldne time fandt sted i morges. Tjek i morgen?","Se daggry i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${u.clouds.total}% (Lav: ${u.clouds.low}%, Mellem: ${u.clouds.mid}%, Høj: ${u.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${e.sunrise?e.sunrise.getTime():t.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card ${h.isPassed?"card-event-passed":""}">
          ${_(h)}
          <div class="photo-card-top">
            <span class="photo-card-title">${g.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${E(g.score)}">${g.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${n.formatTime(e.goldenHourEvening?.start)} - ${n.formatTime(e.sunset)}
            ${U?`<span class="compass-direction-tag" title="Solens kompasretning ved solnedgang">🧭 ${U}</span>`:""}
            ${h.isPassed?'<span class="time-passed-tag">Passeret i aften</span>':`• ${h.sub}`}
          </div>
          <div class="photo-card-desc">${g.text}</div>
          ${j(h.isPassed,"Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?","Se solnedgang i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${g.clouds.total}% (Lav: ${g.clouds.low}%, Mellem: ${g.clouds.mid}%, Høj: ${g.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${e.sunset?e.sunset.getTime():t.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card ${$.isPassed?"card-event-passed":""}">
          ${_($)}
          <div class="photo-card-top">
            <span class="photo-card-title">${r.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${E(r.score)}">${r.score}/100 • ${r.status}</span>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${e.nightSky?.start?`${n.formatTime(e.nightSky.start)} - ${n.formatTime(e.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}
            ${$.isPassed?'<span class="time-passed-tag">Natten er ovre</span>':`• ${$.sub}`}
          </div>
          <div class="photo-card-desc">${r.text}</div>
          ${j($.isPassed,"Astronomisk mørke for denne nat er ovre. Tjek næste nat?","Se stjernehimmel i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${r.moonImpact}</span>
            <button class="btn-goto-sol" data-body="moon" data-time="${t.moonTimes?.rise?t.moonTimes.rise.getTime():e.nightSky?.start?e.nightSky.start.getTime():t.date.getTime()}" title="Se måneretning og nattehimmel i Sol/Måne-modulet">
              ${k.icon} Åbn i Sol/Måne →
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
            ${t.hourly.map(p=>{let D="hourly-col",H=`<span class="hour-badge">${String(p.hour).padStart(2,"0")}:00</span>`;return d&&(p.hour<z?(D+=" hourly-past-hour",H+='<span class="hour-past-pill">forbi</span>'):p.hour===z&&(D+=" hourly-current-hour",H+='<span class="hour-now-badge">NU</span>')),`
                <div class="${D}">
                  ${H}
                  <span>${p.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(p.temp)}°</span>
                  <span class="hour-clouds">☁️ ${p.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${p.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(p.visibility/1e3).toFixed(0)}km</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    `,s.querySelectorAll(".btn-jump-tomorrow").forEach(p=>{p.addEventListener("click",()=>{const D=Number(p.dataset.jumpDay??1);this.selectDay(D)})}),s.querySelectorAll(".btn-goto-sol, .btn-goto-fotosol").forEach(p=>{p.addEventListener("click",()=>{const D=p,H=Number(D.dataset.time),Y=D.dataset.body||"sun",J=new Date(H);n.setDate(J),X.navigate("#/sol",{date:J,body:Y,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{ne as default};
