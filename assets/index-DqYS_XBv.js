import{R as W}from"./index-BhM_iJmv.js";import{A as N,T as a,L as F,a as R}from"./LocationBar-4UnW2ZOM.js";const K="photoweather_cache_v2_";class j{static async fetchForecast(s,t,e=!1){const k=`${K}${s.toFixed(4)}_${t.toFixed(4)}`;let n=null;try{const i=localStorage.getItem(k);i&&(n=JSON.parse(i))}catch(i){console.warn("Kunne ikke læse vejr-cache:",i)}const u=Date.now();if(!e&&n&&n.timestamp&&u-n.timestamp<1e3*60*60*2)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};const g=`https://api.open-meteo.com/v1/forecast?latitude=${s.toFixed(4)}&longitude=${t.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const i=await fetch(g);if(!i.ok)throw new Error(`Open-Meteo svarede med status ${i.status}`);const l=await i.json();try{localStorage.setItem(k,JSON.stringify({timestamp:u,data:l}))}catch(d){console.warn("Kunne ikke gemme vejr i localStorage:",d)}return{forecast:l,isCached:!1,updatedAt:new Date(u)}}catch(i){if(n&&n.data)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};throw i}}static parseDayData(s,t,e,k){if(!s?.hourly?.time||!s?.daily?.time)return null;const n=s.daily.time[t];if(!n)return null;const u=n.split("-"),g=new Date(Number(u[0]),Number(u[1])-1,Number(u[2]),12,0,0),i=N.getSunTimes(g,e,k),l=N.getMoonIllumination(g),d=N.getMoonTimes(g,e,k),y=s.hourly.time,o=[],T=[],v=`${n}T`,r=s.daily.time[t+1],m=r?`${r}T`:null,c=($,M)=>{const A=Number(M.substring(11,13)),w=s.hourly.temperature_2m[$],E=s.hourly.dew_point_2m[$],_=s.hourly.weather_code[$],H=this.getWeatherCodeDescription(_);return{time:M,hour:A,temp:w,apparentTemp:s.hourly.apparent_temperature[$],humidity:s.hourly.relative_humidity_2m[$],dewPoint:E,spread:+(w-E).toFixed(1),precipProb:s.hourly.precipitation_probability[$],precipMm:s.hourly.precipitation[$],weatherCode:_,weatherDesc:H.desc,weatherIcon:H.icon,cloudTotal:s.hourly.cloud_cover[$],cloudLow:s.hourly.cloud_cover_low[$],cloudMid:s.hourly.cloud_cover_mid[$],cloudHigh:s.hourly.cloud_cover_high[$],visibility:s.hourly.visibility[$],windSpeed:s.hourly.wind_speed_10m[$],windDir:s.hourly.wind_direction_10m[$],windGusts:s.hourly.wind_gusts_10m[$]}};for(let $=0;$<y.length;$++){const M=y[$];M.startsWith(v)?o.push(c($,M)):m&&M.startsWith(m)&&Number(M.substring(11,13))<=4&&T.push(c($,M))}const f=this.calculateFogRisk(o,i),b=this.calculateGoldenHourQuality(o,i.goldenHourMorning,i.sunrise),h=this.calculateGoldenHourQuality(o,i.goldenHourEvening,i.sunset),D=this.calculateAstroScore(o,i,l,e,k,g,T);return{date:g,dayIndex:t,dateStr:n,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][g.getDay()],maxTemp:s.daily.temperature_2m_max[t],minTemp:s.daily.temperature_2m_min[t],weatherCode:s.daily.weather_code[t],weatherDesc:this.getWeatherCodeDescription(s.daily.weather_code[t]).desc,sun:i,moon:l,moonTimes:d,fog:f,goldenHourMorning:b,goldenHourEvening:h,astro:D,hourly:o}}static calculateFogRisk(s,t){if(!s||s.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low"};const e=t.sunrise?t.sunrise.getHours():6,k=Math.max(0,e-3),n=Math.min(23,e+1),u=s.filter(f=>f.hour>=k&&f.hour<=n);if(u.length===0)return{score:10,level:"Lav",text:"Lav tågerisiko",icon:"☀️",classType:"low"};let g=0,i=0,l=0,d=99999,y=!1;u.forEach(f=>{g+=f.spread,i+=f.humidity,l+=f.windSpeed,f.visibility<d&&(d=f.visibility),(f.weatherCode===45||f.weatherCode===48)&&(y=!0)}),g/=u.length,i/=u.length,l/=u.length;let o=0;g<=.5?o+=40:g<=1.2?o+=32:g<=2.2?o+=20:g<=3.5&&(o+=10),i>=96?o+=30:i>=92?o+=24:i>=88?o+=16:i>=80&&(o+=8),l<=2?o+=20:l<=3.5?o+=14:l<=5?o+=6:o-=15,y||d<=1e3?o+=20:d<=4e3&&(o+=12);const T=Math.min(100,Math.max(0,o));let v="Lav",r="Lav tågerisiko – klar morgensigt",m="☀️",c="low";return T>=75?(v="Meget høj",r="Perfekte tågebetingelser! Tæt morgentåge forventes i lavninger og ved søer",m="🌫️",c="high"):T>=55?(v="Høj",r="Gode chancer for stemningsfuld morgendis og jordtåge",m="🌫️",c="high"):T>=35&&(v="Moderat",r="Mulighed for let dis over enge og vand tidligt om morgenen",m="🌁",c="moderate"),{score:T,level:v,text:r,icon:m,classType:c,avgSpread:g.toFixed(1),avgHumidity:Math.round(i),avgWind:l.toFixed(1),minVisibilityKm:(d/1e3).toFixed(1)}}static calculateGoldenHourQuality(s,t,e){if(!s||!e)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const k=e.getHours(),n=s.find(T=>T.hour===k)||s[k]||s[0],u=n.cloudTotal,g=n.cloudLow,i=n.cloudMid,l=n.cloudHigh;let d=50,y="Pænt lys",o="☀️";return g>=70||u>=85&&g+i>=80?(d=20,y="Tungt lavt skydække blokerer for direkte sollys og gylden glød",o="☁️"):u>=75?(d=35,y="Overvejende overskyet – diffust og dæmpet lys ved horisonten",o="☁️"):u<=15?(d=85,y="Klar himmel – rent gyldent lys og skarpe lange skygger",o="🌅"):g<=30&&i+l>=30&&i+l<=75?(d=95,y="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",o="🔥"):u<=50?(d=75,y="Gode forhold med dynamiske lysstriber gennem spredte skyer",o="🌤️"):(d=45,y="Vekslende skydække med diffuse lysforhold",o="⛅"),{score:d,text:y,icon:o,clouds:{total:u,low:g,mid:i,high:l}}}static calculateAstroScore(s,t,e,k,n,u,g){const i=t.astronomicalDusk&&t.astronomicalDawn;let l;g&&g.length>0?l=[...s.filter(h=>h.hour>=22),...g.filter(h=>h.hour<=4)]:l=s.filter(h=>h.hour>=22||h.hour<=4),l.length===0&&(l=s.slice(0,4));let d=0,y=0;l.forEach(h=>{d+=h.cloudTotal,y+=h.cloudLow}),d/=l.length,y/=l.length;const o=Math.round(d);let T=0;l.forEach(h=>{const D=new Date(u.getFullYear(),u.getMonth(),u.getDate()+(h.hour<=4?1:0),h.hour,0,0);try{const L=N.getMoonPosition(D,k,n);L&&L.altitude>0&&T++}catch{}});let v=100;o<=10?v-=o*.5:o<=30?v-=5+(o-10)*1:o<=60?v-=25+(o-30)*1.5:v-=70+(o-60)*.7,v-=y*.25;let r="";T===0?r="Månen er under horisonten hele natten (ingen måneforstyrrelse)":e.fraction<=15?r=`Nymåne / ultrasvagt segl (${e.fraction}%) – intet generende måneskin`:e.fraction<=45?(v-=Math.round(e.fraction/100*15),r=`Svag månefase (${e.fraction}%) – kun moderat lyspåvirkning`):(v-=Math.round(e.fraction/100*35),r=`Kraftigt måneskin (${e.fraction}%) oplyser natten og udvisker svage stjerner`),i||(v=Math.min(v,50),r+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const m=Math.min(100,Math.max(0,Math.round(v)));let c="Ugunstig",f="☁️",b="";return o>=75?(c="Ugunstig",f="☁️",b=`Tæt skydække (${o}%) dækker himlen i nat.`):o>=50?(c="Svag",f="⛅",b=`Overvejende skyet (${o}%). Kun spredte kighuller til enkelte klare stjerner.`):o>=25?(c="Moderat",f="✨",b=`Gode observationsforhold med lette slørskyer (${o}%).`):(c="Fremragende",f="🌌",b=`Krystalklar nattehimmel (${o}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:m,status:c,icon:f,text:b,roundClouds:o,moonImpact:r}}static getWeatherCodeDescription(s){switch(s){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}static getEventTiming(s,t,e,k,n,u=50,g){const i=g||a.getDate()||new Date,l=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],d=typeof u=="number"?u:50;if(e===0){if(s&&t&&i>=s&&i<=t){const v=t.getTime()-i.getTime(),r=a.formatDuration(v);let m="banner-active",c="🟢",f="Aktiv nu",b=`Aktiv lige nu • Slutter om ${r}`,h=`Aktiv lige nu (slutter kl. ${a.formatTime(t)})`;return n==="astro"?d>=65?(m="banner-active",c="✨",f="Aktiv nu",b=`Gode stjerneforhold nu • Slutter om ${r}`,h=`Astronomisk nat aktiv lige nu (slutter kl. ${a.formatTime(t)})`):d>=40?(m="banner-active-moderate",c="⛅",f="Moderat nu",b=`Astronomisk nat aktiv • Vekslende skydække (slutter om ${r})`,h=`Mørke i gang (kl. ${a.formatTime(t)}) • Skiftende skyer`):(m="banner-active-poor",c="☁️",f="Overskyet nu",b=`Astronomisk nat er i gang • Desværre overskyet (slutter om ${r})`,h=`Mørke i gang (kl. ${a.formatTime(t)}) • Dækket af skyer`):n==="fog"?d>=55?(m="banner-active",c="🌫️",f="Aktiv nu",b=`Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${r})`,h=`Tågevindue aktivt lige nu (slutter kl. ${a.formatTime(t)})`):d>=35?(m="banner-active-moderate",c="🌁",f="Moderat nu",b=`Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${r})`,h=`Tidsvindue aktivt (slutter kl. ${a.formatTime(t)})`):(m="banner-active-poor",c="☀️",f="Klar sigt",b=`Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${r})`,h=`Morgenstund i gang (slutter kl. ${a.formatTime(t)}) • Ingen tåge`):n==="morning"?d>=65?(m="banner-active",c="🌅",f="Aktiv nu",b=`Gylden time aktiv lige nu • Flot morgenlys (slutter om ${r})`,h=`Daggry i gang nu (slutter kl. ${a.formatTime(t)})`):d>=40?(m="banner-active-moderate",c="🌤️",f="Vekslende nu",b=`Morgenlys aktivt nu • Vekslende skydække (slutter om ${r})`,h=`Morgenlys i gang (slutter kl. ${a.formatTime(t)})`):(m="banner-active-poor",c="☁️",f="Overskyet nu",b=`Morgentime i gang • Solen skjult af skydække (slutter om ${r})`,h="Morgenlys i gang, men dækket af skyer"):n==="evening"&&(d>=65?(m="banner-active",c="🌆",f="Aktiv nu",b=`Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${r})`,h=`Aktiv solnedgang lige nu (slutter kl. ${a.formatTime(t)})`):d>=40?(m="banner-active-moderate",c="🌤️",f="Moderat nu",b=`Aftenlys i gang • Vekslende skydække (slutter om ${r})`,h=`Solnedgang i gang (slutter kl. ${a.formatTime(t)})`):(m="banner-active-poor",c="☁️",f="Overskyet nu",b=`Solnedgang i gang • Skjult bag tungt skydække (slutter om ${r})`,h="Solnedgang i gang, men skjult bag skyer")),{status:"active",bannerClass:m,icon:c,pill:f,label:b,sub:h,isPassed:!1}}if(t&&i>t){const v=i.getTime()-t.getTime(),r=a.formatDuration(v);let m=`I morges • For ${r} siden`,c=`Afsluttet i morges (for ${r} siden)`;return n==="evening"?(m=`I aften • For ${r} siden`,c=`Afsluttet i aften kl. ${a.formatTime(t)}`):n==="astro"&&(m="Natten er ovre",c=`Astronomisk nat afsluttet kl. ${a.formatTime(t)}`),{status:"passed",bannerClass:"banner-passed",icon:"⏳",pill:"Passeret",label:m,sub:c,isPassed:!0}}if(s&&i<s){const v=s.getTime()-i.getTime(),r=a.formatDuration(v);let m=`I dag • Om ${r}`,c=`Starter kl. ${a.formatTime(s)} (om ${r})`;return n==="evening"?(m=d>=65?`I aften • Om ${r} (flot aftenlys)`:`I aften • Om ${r}`,c=`Starter i aften kl. ${a.formatTime(s)} (om ${r})`):n==="astro"?(m=d>=65?`I aften/nat • Om ${r} (klare stjerneforhold)`:d<=35?`I aften/nat • Om ${r} (forventet overskyet)`:`I aften/nat • Om ${r}`,c=`Astronomisk nat starter kl. ${a.formatTime(s)} (om ${r})`):(n==="fog"||n==="morning")&&(m=`I dag ved daggry • Om ${r}`),{status:"upcoming",bannerClass:"banner-upcoming",icon:"⏱️",pill:"Kommende",label:m,sub:c,isPassed:!1}}}if(e===1){const v=s?Math.max(0,s.getTime()-i.getTime()):0,r=a.formatDuration(v);let m=`I morgen • Om ${r}`,c=`I morgen kl. ${s?a.formatTime(s):"--:--"}`;return n==="fog"||n==="morning"?(m=`I morgen tidlig • Om ${r}`,c=`I morgen kl. ${a.formatTime(s)} (om ${r})`):n==="evening"?(m=`I morgen aften • Om ${r}`,c=`I morgen kl. ${a.formatTime(s)} (om ${r})`):n==="astro"&&(m=`I morgen nat • Om ${r}`,c=`I morgen nat fra kl. ${a.formatTime(s)}`),{status:"future",bannerClass:"banner-future",icon:"📅",pill:"I morgen",label:m,sub:c,isPassed:!1}}const y=l[k.getDay()];let o=`${y} • Om ${e} dage`,T=`${y}`;return n==="fog"||n==="morning"?(o=`${y} morgen • Om ${e} dage`,T=`${y} kl. ${s?a.formatTime(s):"06:00"}`):n==="evening"?(o=`${y} aften • Om ${e} dage`,T=`${y} kl. ${s?a.formatTime(s):"18:00"}`):n==="astro"&&(o=`${y} nat • Om ${e} dage`,T=`${y} nat`),{status:"future-distant",bannerClass:"banner-future",icon:"📅",pill:y,label:o,sub:T,isPassed:!1}}}class U{container;currentLocation=F.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(s){this.container=s,this.currentLocation=F.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=F.subscribe(async t=>{this.currentLocation=t,await this.loadWeather(!1)})}onActivate(s){if(s?.params){const t=s.params;t.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(t.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
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
    `;const s=this.container.querySelector("#weatherLocationMount");s&&(this.locationBar=new R({container:s,accentClass:"fs-btn-accent-weather"}))}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)})}updateLocationDisplay(){const s=this.container.querySelector("#weatherLocName"),t=this.container.querySelector("#weatherLocCoords");s&&(s.textContent=this.currentLocation.name),t&&(t.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(s=!1){if(!this.isLoading){this.isLoading=!0;try{const t=await j.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,s);this.forecastData=t.forecast,this.isCachedForecast=t.isCached,this.cacheUpdatedAt=t.updatedAt,this.parsedDays=[];for(let e=0;e<7;e++){const k=j.parseDayData(this.forecastData,e,this.currentLocation.lat,this.currentLocation.lng);k&&this.parsedDays.push(k)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(t){console.error("Fejl ved indlæsning af vejr:",t);const e=this.container.querySelector("#weatherSelectedDayWrap");e&&(e.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${t.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const s=this.container.querySelector("#weatherStatusBanner"),t=this.container.querySelector("#weatherStatusTime");s&&(this.isCachedForecast&&this.cacheUpdatedAt?(s.classList.add("active"),t&&(t.textContent=`Hentet kl. ${a.formatTime(this.cacheUpdatedAt)}`)):s.classList.remove("active"))}selectDay(s){this.selectedDayIndex=Math.min(6,Math.max(0,s));const t=this.container.querySelector("#weatherDaysScroll");t&&(t.querySelectorAll(".day-tab-card").forEach(e=>e.classList.remove("active")),t.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add("active")),this.renderSelectedDay()}renderDaysScroll(){const s=this.container.querySelector("#weatherDaysScroll");!s||this.parsedDays.length===0||(s.innerHTML=this.parsedDays.map((t,e)=>{const n=e===0?"I dag":t.dayName.substring(0,3),u=j.getWeatherCodeDescription(t.weatherCode);return`
        <div class="day-tab-card ${e===this.selectedDayIndex?"active":""}" data-day="${e}">
          <span class="day-name">${n}</span>
          <span class="day-date">${t.date.getDate()}</span>
          <span class="day-icon">${u.icon}</span>
          <span class="day-temp-range">${Math.round(t.minTemp)}° / ${Math.round(t.maxTemp)}°</span>
        </div>
      `}).join(""),s.querySelectorAll("[data-day]").forEach(t=>{t.addEventListener("click",()=>{const e=Number(t.dataset.day);this.selectDay(e)})}))}renderSelectedDay(){const s=this.container.querySelector("#weatherSelectedDayWrap");if(!s||!this.parsedDays[this.selectedDayIndex])return;const t=this.parsedDays[this.selectedDayIndex],e=t.sun,k=t.moon,n=t.fog,u=t.goldenHourMorning,g=t.goldenHourEvening,i=t.astro,l=a.getDate()||new Date,d=this.selectedDayIndex===0,y=this.selectedDayIndex===1,o=e.civilDawn||(e.sunrise?new Date(e.sunrise.getTime()-45*60*1e3):null),T=e.sunriseEnd||(e.sunrise?new Date(e.sunrise.getTime()+65*60*1e3):null),v=j.getEventTiming(o,T,this.selectedDayIndex,t.date,"fog",n.score,l),r=e.blueHourMorning&&e.blueHourMorning.start||(e.sunrise?new Date(e.sunrise.getTime()-50*60*1e3):null),m=e.goldenHourMorning&&e.goldenHourMorning.end||(e.sunrise?new Date(e.sunrise.getTime()+45*60*1e3):null),c=j.getEventTiming(r,m,this.selectedDayIndex,t.date,"morning",u.score,l),f=e.goldenHourEvening&&e.goldenHourEvening.start||(e.sunset?new Date(e.sunset.getTime()-45*60*1e3):null),b=e.blueHourEvening&&e.blueHourEvening.end||(e.sunset?new Date(e.sunset.getTime()+45*60*1e3):null),h=j.getEventTiming(f,b,this.selectedDayIndex,t.date,"evening",g.score,l);let D=null,L=null;e.astronomicalDusk&&(d&&e.astronomicalDawn&&l<e.astronomicalDawn?(D=new Date(e.astronomicalDusk.getTime()-24*60*60*1e3),L=e.astronomicalDawn):(D=e.astronomicalDusk,L=e.astronomicalDawn?new Date(e.astronomicalDawn.getTime()+24*60*60*1e3):new Date(D.getTime()+9*60*60*1e3)));const $=j.getEventTiming(D,L,this.selectedDayIndex,t.date,"astro",i.score,l),M=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];let A="",w="";if(d)A=`I dag (${t.dayName.toLowerCase()} d. ${t.date.getDate()}. ${M[t.date.getMonth()]})`,e.sunset&&l>e.sunset?w="Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys":v.status==="active"?w=n.score>=50?`Aktuel nu: Morgentåge & solopgang kl. ${a.formatTime(e.sunrise)}`:`Aktuel nu: Solopgang & daggry kl. ${a.formatTime(e.sunrise)}`:c.status==="active"?w=u.score>=50?"Aktuel lige nu: Daggry & gylden time!":"Aktuel lige nu: Daggry (skydækket morgen)":h.status==="active"?w=g.score>=50?"Aktuel lige nu: Solnedgang & aftenlys!":"Aktuel lige nu: Solnedgang (skjult bag skyer)":f&&l<f?w=`Næste: Gylden time i aften kl. ${a.formatTime(f)} (om ${a.formatDuration(f.getTime()-l.getTime())})`:D&&l<D?w=i.score>=60?`Næste: Stjernehimmel i aften kl. ${a.formatTime(D)} (om ${a.formatDuration(D.getTime()-l.getTime())})`:`Næste: Astronomisk mørke i aften kl. ${a.formatTime(D)} (om ${a.formatDuration(D.getTime()-l.getTime())})`:w="Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";else if(y){A=`I morgen (${t.dayName.toLowerCase()} d. ${t.date.getDate()}. ${M[t.date.getMonth()]})`;const p=e.blueHourMorning?.start||e.sunrise,S=p?Math.max(0,p.getTime()-l.getTime()):0;w=`Første fotomulighed: Daggry kl. ${a.formatTime(p)} (om ${a.formatDuration(S)}) • Vejrudsigt for i morgen`}else A=`${t.dayName} d. ${t.date.getDate()}. ${M[t.date.getMonth()]}`,w=`7-dages vejrudsigt for ${this.currentLocation.name}`;const E=p=>p>=70?"score-high":p>=40?"score-moderate":"score-low",_=p=>`
      <div class="card-timing-banner ${p.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${p.icon}</span>
          <span class="timing-label">${p.label}</span>
        </div>
        <span class="timing-banner-pill">${p.pill}</span>
      </div>
    `,H=(p,S,x)=>!p||!d||this.parsedDays.length<=1?"":`
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${S}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${x} ➔</button>
        </div>
      `;let P=`${a.formatTime(e.sunrise)} / ${a.formatTime(e.sunset)}`,I="Solopgang • Solnedgang",O=`<span style="color:var(--golden-primary);">Gylden: ${a.formatTime(e.goldenHourEvening?.start)} - ${a.formatTime(e.sunset)}</span>`;if(d)if(e.sunset&&l>e.sunset)P+=' <span class="time-passed-tag">Passeret</span>',I="Solopgang • Solnedgang (dagens soltimer er forbi)",O=`<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;else if(e.sunrise&&l>e.sunrise){I=`Solopgang var for ${a.formatDuration(l.getTime()-e.sunrise.getTime())} siden`;const p=e.goldenHourEvening?.start||e.sunset?a.formatDuration((e.goldenHourEvening?.start||e.sunset).getTime()-l.getTime()):"";O=`<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${a.formatTime(e.goldenHourEvening?.start||e.sunset)} (om ${p})</span>`}else{const p=e.sunrise?a.formatDuration(e.sunrise.getTime()-l.getTime()):"";I=`Solopgang i morges/dag kl. ${a.formatTime(e.sunrise)} (om ${p})`}else y&&(I=`Solopgang i morgen kl. ${a.formatTime(e.sunrise)} • Solnedgang kl. ${a.formatTime(e.sunset)}`);let C=`Op: ${a.formatTime(t.moonTimes?.rise)} • Ned: ${a.formatTime(t.moonTimes?.set)}`;if(d){const p=t.moonTimes?.rise?l>t.moonTimes.rise?`Op kl. ${a.formatTime(t.moonTimes.rise)} (var for ${a.formatDuration(l.getTime()-t.moonTimes.rise.getTime())} siden)`:`Op i aften kl. ${a.formatTime(t.moonTimes.rise)} (om ${a.formatDuration(t.moonTimes.rise.getTime()-l.getTime())})`:"Går ikke op",S=t.moonTimes?.set?l>t.moonTimes.set?`Ned for ${a.formatDuration(l.getTime()-t.moonTimes.set.getTime())} siden`:`Ned kl. ${a.formatTime(t.moonTimes.set)}`:"Går ikke ned";C=`${p} • ${S}`}else y&&(C=`I morgen: Op kl. ${a.formatTime(t.moonTimes?.rise)} • Ned kl. ${a.formatTime(t.moonTimes?.set)}`);const B=l.getHours();s.innerHTML=`
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
          <div class="astro-sub-val">${P}</div>
          <div class="astro-sub-detail">${I}</div>
          <div class="astro-sub-detail">${O}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>${k.icon}</span> Måne
          </div>
          <div class="astro-sub-val">${k.fraction}% • ${k.name}</div>
          <div class="astro-sub-detail">${C}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${e.nightSky?.start?`${a.formatTime(e.nightSky.start)} - ${a.formatTime(e.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis -->
        <div class="photo-card ${v.isPassed?"card-event-passed":""}">
          ${_(v)}
          <div class="photo-card-top">
            <span class="photo-card-title">${n.icon} Morgentåge & Dis</span>
            <span class="photo-score-badge ${E(n.score)}">${n.score}/100 • ${n.level}</span>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ca. ${a.formatTime(o)} - ${a.formatTime(T)}
            ${v.isPassed?'<span class="time-passed-tag">Afsluttet i morges</span>':`• ${v.sub}`}
          </div>
          <div class="photo-card-desc">${n.text}</div>
          ${H(v.isPassed,"Morgentågen fandt sted i morges. Tjek i morgen?","Se i morgen tidlig")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${n.avgSpread}°C • Fugt: ${n.avgHumidity}% • Vind: ${n.avgWind} m/s</span>
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
            Gylden time: ${a.formatTime(e.sunrise)} - ${a.formatTime(e.goldenHourMorning?.end)}
            ${c.isPassed?`<span class="time-passed-tag">Passeret (kl. ${a.formatTime(e.sunrise)})</span>`:`• ${c.sub}`}
          </div>
          <div class="photo-card-desc">${u.text}</div>
          ${H(c.isPassed,"Morgenens gyldne time fandt sted i morges. Tjek i morgen?","Se daggry i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${u.clouds.total}% (Lav: ${u.clouds.low}%, Mellem: ${u.clouds.mid}%, Høj: ${u.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${e.sunrise?e.sunrise.getTime():t.date.getTime()}">
              Se lysretning i Sol →
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
            Gylden time: ${a.formatTime(e.goldenHourEvening?.start)} - ${a.formatTime(e.sunset)}
            ${h.isPassed?'<span class="time-passed-tag">Passeret i aften</span>':`• ${h.sub}`}
          </div>
          <div class="photo-card-desc">${g.text}</div>
          ${H(h.isPassed,"Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?","Se solnedgang i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${g.clouds.total}% (Lav: ${g.clouds.low}%, Mellem: ${g.clouds.mid}%, Høj: ${g.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${e.sunset?e.sunset.getTime():t.date.getTime()}">
              Se lysretning i Sol →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card ${$.isPassed?"card-event-passed":""}">
          ${_($)}
          <div class="photo-card-top">
            <span class="photo-card-title">${i.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${E(i.score)}">${i.score}/100 • ${i.status}</span>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${e.nightSky?.start?`${a.formatTime(e.nightSky.start)} - ${a.formatTime(e.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}
            ${$.isPassed?'<span class="time-passed-tag">Natten er ovre</span>':`• ${$.sub}`}
          </div>
          <div class="photo-card-desc">${i.text}</div>
          ${H($.isPassed,"Astronomisk mørke for denne nat er ovre. Tjek næste nat?","Se stjernehimmel i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${i.moonImpact}</span>
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
            ${t.hourly.map(p=>{let S="hourly-col",x=`<span class="hour-badge">${String(p.hour).padStart(2,"0")}:00</span>`;return d&&(p.hour<B?(S+=" hourly-past-hour",x+='<span class="hour-past-pill">forbi</span>'):p.hour===B&&(S+=" hourly-current-hour",x+='<span class="hour-now-badge">NU</span>')),`
                <div class="${S}">
                  ${x}
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
    `,s.querySelectorAll(".btn-jump-tomorrow").forEach(p=>{p.addEventListener("click",()=>{const S=Number(p.dataset.jumpDay??1);this.selectDay(S)})}),s.querySelectorAll(".btn-goto-sol, .btn-goto-fotosol").forEach(p=>{p.addEventListener("click",()=>{const S=Number(p.dataset.time),x=new Date(S);a.setDate(x),W.navigate("#/sol",{date:x,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{U as default};
