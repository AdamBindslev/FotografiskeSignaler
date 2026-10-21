import{R as W}from"./index-CTJuHrvO.js";import{A as N,T as a,L as C,a as R}from"./LocationBar-DDjrBrVz.js";const K="photoweather_cache_v2_";class x{static async fetchForecast(s,t,e=!1){const b=`${K}${s.toFixed(4)}_${t.toFixed(4)}`;let n=null;try{const o=localStorage.getItem(b);o&&(n=JSON.parse(o))}catch(o){console.warn("Kunne ikke læse vejr-cache:",o)}const g=Date.now();if(!e&&n&&n.timestamp&&g-n.timestamp<1e3*60*60*2)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};const p=`https://api.open-meteo.com/v1/forecast?latitude=${s.toFixed(4)}&longitude=${t.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const o=await fetch(p);if(!o.ok)throw new Error(`Open-Meteo svarede med status ${o.status}`);const l=await o.json();try{localStorage.setItem(b,JSON.stringify({timestamp:g,data:l}))}catch(f){console.warn("Kunne ikke gemme vejr i localStorage:",f)}return{forecast:l,isCached:!1,updatedAt:new Date(g)}}catch(o){if(n&&n.data)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};throw o}}static parseDayData(s,t,e,b){if(!s?.hourly?.time||!s?.daily?.time)return null;const n=s.daily.time[t];if(!n)return null;const g=n.split("-"),p=new Date(Number(g[0]),Number(g[1])-1,Number(g[2])),o=N.getSunTimes(p,e,b),l=N.getMoonIllumination(p),f=N.getMoonTimes(p,e,b),d=s.hourly.time,m=[],$=`${n}T`;for(let c=0;c<d.length;c++){const k=d[c];if(k.startsWith($)){const T=Number(k.substring(11,13)),_=s.hourly.temperature_2m[c],D=s.hourly.dew_point_2m[c],A=s.hourly.weather_code[c],L=this.getWeatherCodeDescription(A);m.push({time:k,hour:T,temp:_,apparentTemp:s.hourly.apparent_temperature[c],humidity:s.hourly.relative_humidity_2m[c],dewPoint:D,spread:+(_-D).toFixed(1),precipProb:s.hourly.precipitation_probability[c],precipMm:s.hourly.precipitation[c],weatherCode:A,weatherDesc:L.desc,weatherIcon:L.icon,cloudTotal:s.hourly.cloud_cover[c],cloudLow:s.hourly.cloud_cover_low[c],cloudMid:s.hourly.cloud_cover_mid[c],cloudHigh:s.hourly.cloud_cover_high[c],visibility:s.hourly.visibility[c],windSpeed:s.hourly.wind_speed_10m[c],windDir:s.hourly.wind_direction_10m[c],windGusts:s.hourly.wind_gusts_10m[c]})}}const y=this.calculateFogRisk(m,o),r=this.calculateGoldenHourQuality(m,o.goldenHourMorning,o.sunrise),u=this.calculateGoldenHourQuality(m,o.goldenHourEvening,o.sunset),i=this.calculateAstroScore(m,o,l,e,b,p);return{date:p,dayIndex:t,dateStr:n,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][p.getDay()],maxTemp:s.daily.temperature_2m_max[t],minTemp:s.daily.temperature_2m_min[t],weatherCode:s.daily.weather_code[t],weatherDesc:this.getWeatherCodeDescription(s.daily.weather_code[t]).desc,sun:o,moon:l,moonTimes:f,fog:y,goldenHourMorning:r,goldenHourEvening:u,astro:i,hourly:m}}static calculateFogRisk(s,t){if(!s||s.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low"};const e=t.sunrise?t.sunrise.getHours():6,b=Math.max(0,e-3),n=Math.min(23,e+1),g=s.filter(h=>h.hour>=b&&h.hour<=n);if(g.length===0)return{score:10,level:"Lav",text:"Lav tågerisiko",icon:"☀️",classType:"low"};let p=0,o=0,l=0,f=99999,d=!1;g.forEach(h=>{p+=h.spread,o+=h.humidity,l+=h.windSpeed,h.visibility<f&&(f=h.visibility),(h.weatherCode===45||h.weatherCode===48)&&(d=!0)}),p/=g.length,o/=g.length,l/=g.length;let m=0;p<=.5?m+=40:p<=1.2?m+=32:p<=2.2?m+=20:p<=3.5&&(m+=10),o>=96?m+=30:o>=92?m+=24:o>=88?m+=16:o>=80&&(m+=8),l<=2?m+=20:l<=3.5?m+=14:l<=5?m+=6:m-=15,d||f<=1e3?m+=20:f<=4e3&&(m+=12);const $=Math.min(100,Math.max(0,m));let y="Lav",r="Lav tågerisiko – klar morgensigt",u="☀️",i="low";return $>=75?(y="Meget høj",r="Perfekte tågebetingelser! Tæt morgentåge forventes i lavninger og ved søer",u="🌫️",i="high"):$>=55?(y="Høj",r="Gode chancer for stemningsfuld morgendis og jordtåge",u="🌫️",i="high"):$>=35&&(y="Moderat",r="Mulighed for let dis over enge og vand tidligt om morgenen",u="🌁",i="moderate"),{score:$,level:y,text:r,icon:u,classType:i,avgSpread:p.toFixed(1),avgHumidity:Math.round(o),avgWind:l.toFixed(1),minVisibilityKm:(f/1e3).toFixed(1)}}static calculateGoldenHourQuality(s,t,e){if(!s||!e)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const b=e.getHours(),n=s.find($=>$.hour===b)||s[b]||s[0],g=n.cloudTotal,p=n.cloudLow,o=n.cloudMid,l=n.cloudHigh;let f=50,d="Pænt lys",m="☀️";return p>=70||g>=85&&p+o>=80?(f=20,d="Tungt lavt skydække blokerer for direkte sollys og gylden glød",m="☁️"):g>=75?(f=35,d="Overvejende overskyet – diffust og dæmpet lys ved horisonten",m="☁️"):g<=15?(f=85,d="Klar himmel – rent gyldent lys og skarpe lange skygger",m="🌅"):p<=30&&o+l>=30&&o+l<=75?(f=95,d="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",m="🔥"):g<=50?(f=75,d="Gode forhold med dynamiske lysstriber gennem spredte skyer",m="🌤️"):(f=45,d="Vekslende skydække med diffuse lysforhold",m="⛅"),{score:f,text:d,icon:m,clouds:{total:g,low:p,mid:o,high:l}}}static calculateAstroScore(s,t,e,b,n,g){const p=t.astronomicalDusk&&t.astronomicalDawn;let o=s.filter(c=>c.hour>=22||c.hour<=4);o.length===0&&(o=s.slice(0,4));let l=0,f=0;o.forEach(c=>{l+=c.cloudTotal,f+=c.cloudLow}),l/=o.length,f/=o.length;const d=Math.round(l);let m=0;o.forEach(c=>{const k=new Date(g.getFullYear(),g.getMonth(),g.getDate()+(c.hour<=4?1:0),c.hour,0,0);try{const T=N.getMoonPosition(k,b,n);T&&T.altitude>0&&m++}catch{}});let $=100;d<=10?$-=d*.5:d<=30?$-=5+(d-10)*1:d<=60?$-=25+(d-30)*1.5:$-=70+(d-60)*.7,$-=f*.25;let y="";m===0?y="Månen er under horisonten hele natten (ingen måneforstyrrelse)":e.fraction<=15?y=`Nymåne / ultrasvagt segl (${e.fraction}%) – intet generende måneskin`:e.fraction<=45?($-=Math.round(e.fraction/100*15),y=`Svag månefase (${e.fraction}%) – kun moderat lyspåvirkning`):($-=Math.round(e.fraction/100*35),y=`Kraftigt måneskin (${e.fraction}%) oplyser natten og udvisker svage stjerner`),p||($=Math.min($,50),y+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const r=Math.min(100,Math.max(0,Math.round($)));let u="Ugunstig",i="☁️",h="";return d>=75?(u="Ugunstig",i="☁️",h=`Tæt skydække (${d}%) dækker himlen i nat.`):d>=50?(u="Svag",i="⛅",h=`Overvejende skyet (${d}%). Kun spredte kighuller til enkelte klare stjerner.`):d>=25?(u="Moderat",i="✨",h=`Gode observationsforhold med lette slørskyer (${d}%).`):(u="Fremragende",i="🌌",h=`Krystalklar nattehimmel (${d}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:r,status:u,icon:i,text:h,roundClouds:d,moonImpact:y}}static getWeatherCodeDescription(s){switch(s){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}static getEventTiming(s,t,e,b,n,g=50,p){const o=p||a.getDate()||new Date,l=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],f=typeof g=="number"?g:50;if(e===0){if(s&&t&&o>=s&&o<=t){const y=t.getTime()-o.getTime(),r=a.formatDuration(y);let u="banner-active",i="🟢",h="Aktiv nu",c=`Aktiv lige nu • Slutter om ${r}`,k=`Aktiv lige nu (slutter kl. ${a.formatTime(t)})`;return n==="astro"?f>=65?(u="banner-active",i="✨",h="Aktiv nu",c=`Gode stjerneforhold nu • Slutter om ${r}`,k=`Astronomisk nat aktiv lige nu (slutter kl. ${a.formatTime(t)})`):f>=40?(u="banner-active-moderate",i="⛅",h="Moderat nu",c=`Astronomisk nat aktiv • Vekslende skydække (slutter om ${r})`,k=`Mørke i gang (kl. ${a.formatTime(t)}) • Skiftende skyer`):(u="banner-active-poor",i="☁️",h="Overskyet nu",c=`Astronomisk nat er i gang • Desværre overskyet (slutter om ${r})`,k=`Mørke i gang (kl. ${a.formatTime(t)}) • Dækket af skyer`):n==="fog"?f>=55?(u="banner-active",i="🌫️",h="Aktiv nu",c=`Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${r})`,k=`Tågevindue aktivt lige nu (slutter kl. ${a.formatTime(t)})`):f>=35?(u="banner-active-moderate",i="🌁",h="Moderat nu",c=`Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${r})`,k=`Tidsvindue aktivt (slutter kl. ${a.formatTime(t)})`):(u="banner-active-poor",i="☀️",h="Klar sigt",c=`Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${r})`,k=`Morgenstund i gang (slutter kl. ${a.formatTime(t)}) • Ingen tåge`):n==="morning"?f>=65?(u="banner-active",i="🌅",h="Aktiv nu",c=`Gylden time aktiv lige nu • Flot morgenlys (slutter om ${r})`,k=`Daggry i gang nu (slutter kl. ${a.formatTime(t)})`):f>=40?(u="banner-active-moderate",i="🌤️",h="Vekslende nu",c=`Morgenlys aktivt nu • Vekslende skydække (slutter om ${r})`,k=`Morgenlys i gang (slutter kl. ${a.formatTime(t)})`):(u="banner-active-poor",i="☁️",h="Overskyet nu",c=`Morgentime i gang • Solen skjult af skydække (slutter om ${r})`,k="Morgenlys i gang, men dækket af skyer"):n==="evening"&&(f>=65?(u="banner-active",i="🌆",h="Aktiv nu",c=`Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${r})`,k=`Aktiv solnedgang lige nu (slutter kl. ${a.formatTime(t)})`):f>=40?(u="banner-active-moderate",i="🌤️",h="Moderat nu",c=`Aftenlys i gang • Vekslende skydække (slutter om ${r})`,k=`Solnedgang i gang (slutter kl. ${a.formatTime(t)})`):(u="banner-active-poor",i="☁️",h="Overskyet nu",c=`Solnedgang i gang • Skjult bag tungt skydække (slutter om ${r})`,k="Solnedgang i gang, men skjult bag skyer")),{status:"active",bannerClass:u,icon:i,pill:h,label:c,sub:k,isPassed:!1}}if(t&&o>t){const y=o.getTime()-t.getTime(),r=a.formatDuration(y);let u=`I morges • For ${r} siden`,i=`Afsluttet i morges (for ${r} siden)`;return n==="evening"?(u=`I aften • For ${r} siden`,i=`Afsluttet i aften kl. ${a.formatTime(t)}`):n==="astro"&&(u="Natten er ovre",i=`Astronomisk nat afsluttet kl. ${a.formatTime(t)}`),{status:"passed",bannerClass:"banner-passed",icon:"⏳",pill:"Passeret",label:u,sub:i,isPassed:!0}}if(s&&o<s){const y=s.getTime()-o.getTime(),r=a.formatDuration(y);let u=`I dag • Om ${r}`,i=`Starter kl. ${a.formatTime(s)} (om ${r})`;return n==="evening"?(u=f>=65?`I aften • Om ${r} (flot aftenlys)`:`I aften • Om ${r}`,i=`Starter i aften kl. ${a.formatTime(s)} (om ${r})`):n==="astro"?(u=f>=65?`I aften/nat • Om ${r} (klare stjerneforhold)`:f<=35?`I aften/nat • Om ${r} (forventet overskyet)`:`I aften/nat • Om ${r}`,i=`Astronomisk nat starter kl. ${a.formatTime(s)} (om ${r})`):(n==="fog"||n==="morning")&&(u=`I dag ved daggry • Om ${r}`),{status:"upcoming",bannerClass:"banner-upcoming",icon:"⏱️",pill:"Kommende",label:u,sub:i,isPassed:!1}}}if(e===1){const y=s?Math.max(0,s.getTime()-o.getTime()):0,r=a.formatDuration(y);let u=`I morgen • Om ${r}`,i=`I morgen kl. ${s?a.formatTime(s):"--:--"}`;return n==="fog"||n==="morning"?(u=`I morgen tidlig • Om ${r}`,i=`I morgen kl. ${a.formatTime(s)} (om ${r})`):n==="evening"?(u=`I morgen aften • Om ${r}`,i=`I morgen kl. ${a.formatTime(s)} (om ${r})`):n==="astro"&&(u=`I morgen nat • Om ${r}`,i=`I morgen nat fra kl. ${a.formatTime(s)}`),{status:"future",bannerClass:"banner-future",icon:"📅",pill:"I morgen",label:u,sub:i,isPassed:!1}}const d=l[b.getDay()];let m=`${d} • Om ${e} dage`,$=`${d}`;return n==="fog"||n==="morning"?(m=`${d} morgen • Om ${e} dage`,$=`${d} kl. ${s?a.formatTime(s):"06:00"}`):n==="evening"?(m=`${d} aften • Om ${e} dage`,$=`${d} kl. ${s?a.formatTime(s):"18:00"}`):n==="astro"&&(m=`${d} nat • Om ${e} dage`,$=`${d} nat`),{status:"future-distant",bannerClass:"banner-future",icon:"📅",pill:d,label:m,sub:$,isPassed:!1}}}class U{container;currentLocation=C.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(s){this.container=s,this.currentLocation=C.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=C.subscribe(async t=>{this.currentLocation=t,await this.loadWeather(!1)})}onActivate(s){if(s?.params){const t=s.params;t.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(t.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
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
    `;const s=this.container.querySelector("#weatherLocationMount");s&&(this.locationBar=new R({container:s,accentClass:"fs-btn-accent-weather",onLocationChange:t=>{this.currentLocation=t,this.loadWeather(!1)}}))}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)})}updateLocationDisplay(){const s=this.container.querySelector("#weatherLocName"),t=this.container.querySelector("#weatherLocCoords");s&&(s.textContent=this.currentLocation.name),t&&(t.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(s=!1){if(!this.isLoading){this.isLoading=!0;try{const t=await x.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,s);this.forecastData=t.forecast,this.isCachedForecast=t.isCached,this.cacheUpdatedAt=t.updatedAt,this.parsedDays=[];for(let e=0;e<7;e++){const b=x.parseDayData(this.forecastData,e,this.currentLocation.lat,this.currentLocation.lng);b&&this.parsedDays.push(b)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(t){console.error("Fejl ved indlæsning af vejr:",t);const e=this.container.querySelector("#weatherSelectedDayWrap");e&&(e.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${t.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const s=this.container.querySelector("#weatherStatusBanner"),t=this.container.querySelector("#weatherStatusTime");s&&(this.isCachedForecast&&this.cacheUpdatedAt?(s.classList.add("active"),t&&(t.textContent=`Hentet kl. ${a.formatTime(this.cacheUpdatedAt)}`)):s.classList.remove("active"))}selectDay(s){this.selectedDayIndex=Math.min(6,Math.max(0,s));const t=this.container.querySelector("#weatherDaysScroll");t&&(t.querySelectorAll(".day-tab-card").forEach(e=>e.classList.remove("active")),t.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add("active")),this.renderSelectedDay()}renderDaysScroll(){const s=this.container.querySelector("#weatherDaysScroll");!s||this.parsedDays.length===0||(s.innerHTML=this.parsedDays.map((t,e)=>{const n=e===0?"I dag":t.dayName.substring(0,3),g=x.getWeatherCodeDescription(t.weatherCode);return`
        <div class="day-tab-card ${e===this.selectedDayIndex?"active":""}" data-day="${e}">
          <span class="day-name">${n}</span>
          <span class="day-date">${t.date.getDate()}</span>
          <span class="day-icon">${g.icon}</span>
          <span class="day-temp-range">${Math.round(t.minTemp)}° / ${Math.round(t.maxTemp)}°</span>
        </div>
      `}).join(""),s.querySelectorAll("[data-day]").forEach(t=>{t.addEventListener("click",()=>{const e=Number(t.dataset.day);this.selectDay(e)})}))}renderSelectedDay(){const s=this.container.querySelector("#weatherSelectedDayWrap");if(!s||!this.parsedDays[this.selectedDayIndex])return;const t=this.parsedDays[this.selectedDayIndex],e=t.sun,b=t.moon,n=t.fog,g=t.goldenHourMorning,p=t.goldenHourEvening,o=t.astro,l=a.getDate()||new Date,f=this.selectedDayIndex===0,d=this.selectedDayIndex===1,m=e.civilDawn||(e.sunrise?new Date(e.sunrise.getTime()-45*60*1e3):null),$=e.sunriseEnd||(e.sunrise?new Date(e.sunrise.getTime()+65*60*1e3):null),y=x.getEventTiming(m,$,this.selectedDayIndex,t.date,"fog",n.score,l),r=e.blueHourMorning&&e.blueHourMorning.start||(e.sunrise?new Date(e.sunrise.getTime()-50*60*1e3):null),u=e.goldenHourMorning&&e.goldenHourMorning.end||(e.sunrise?new Date(e.sunrise.getTime()+45*60*1e3):null),i=x.getEventTiming(r,u,this.selectedDayIndex,t.date,"morning",g.score,l),h=e.goldenHourEvening&&e.goldenHourEvening.start||(e.sunset?new Date(e.sunset.getTime()-45*60*1e3):null),c=e.blueHourEvening&&e.blueHourEvening.end||(e.sunset?new Date(e.sunset.getTime()+45*60*1e3):null),k=x.getEventTiming(h,c,this.selectedDayIndex,t.date,"evening",p.score,l),T=e.astronomicalDusk||(e.nightSky?.start??null),_=e.astronomicalDawn?new Date(e.astronomicalDawn.getTime()+24*60*60*1e3):T?new Date(T.getTime()+9*60*60*1e3):null,D=x.getEventTiming(T,_,this.selectedDayIndex,t.date,"astro",o.score,l),A=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];let L="",w="";if(f)L=`I dag (${t.dayName.toLowerCase()} d. ${t.date.getDate()}. ${A[t.date.getMonth()]})`,e.sunset&&l>e.sunset?w="Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys":y.status==="active"?w=n.score>=50?`Aktuel nu: Morgentåge & solopgang kl. ${a.formatTime(e.sunrise)}`:`Aktuel nu: Solopgang & daggry kl. ${a.formatTime(e.sunrise)}`:i.status==="active"?w=g.score>=50?"Aktuel lige nu: Daggry & gylden time!":"Aktuel lige nu: Daggry (skydækket morgen)":k.status==="active"?w=p.score>=50?"Aktuel lige nu: Solnedgang & aftenlys!":"Aktuel lige nu: Solnedgang (skjult bag skyer)":h&&l<h?w=`Næste: Gylden time i aften kl. ${a.formatTime(h)} (om ${a.formatDuration(h.getTime()-l.getTime())})`:T&&l<T?w=o.score>=60?`Næste: Stjernehimmel i aften kl. ${a.formatTime(T)} (om ${a.formatDuration(T.getTime()-l.getTime())})`:`Næste: Astronomisk mørke i aften kl. ${a.formatTime(T)} (om ${a.formatDuration(T.getTime()-l.getTime())})`:w="Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";else if(d){L=`I morgen (${t.dayName.toLowerCase()} d. ${t.date.getDate()}. ${A[t.date.getMonth()]})`;const v=e.blueHourMorning?.start||e.sunrise,S=v?Math.max(0,v.getTime()-l.getTime()):0;w=`Første fotomulighed: Daggry kl. ${a.formatTime(v)} (om ${a.formatDuration(S)}) • Fotovejrudsigt for i morgen`}else L=`${t.dayName} d. ${t.date.getDate()}. ${A[t.date.getMonth()]}`,w=`7-dages fotovejrudsigt for ${this.currentLocation.name}`;const H=v=>v>=70?"score-high":v>=40?"score-moderate":"score-low",j=v=>`
      <div class="card-timing-banner ${v.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${v.icon}</span>
          <span class="timing-label">${v.label}</span>
        </div>
        <span class="timing-banner-pill">${v.pill}</span>
      </div>
    `,I=(v,S,M)=>!v||!f||this.parsedDays.length<=1?"":`
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${S}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${M} ➔</button>
        </div>
      `;let P=`${a.formatTime(e.sunrise)} / ${a.formatTime(e.sunset)}`,E="Solopgang • Solnedgang",O=`<span style="color:var(--golden-primary);">Gylden: ${a.formatTime(e.goldenHourEvening?.start)} - ${a.formatTime(e.sunset)}</span>`;if(f)if(e.sunset&&l>e.sunset)P+=' <span class="time-passed-tag">Passeret</span>',E="Solopgang • Solnedgang (dagens soltimer er forbi)",O=`<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;else if(e.sunrise&&l>e.sunrise){E=`Solopgang var for ${a.formatDuration(l.getTime()-e.sunrise.getTime())} siden`;const v=e.goldenHourEvening?.start||e.sunset?a.formatDuration((e.goldenHourEvening?.start||e.sunset).getTime()-l.getTime()):"";O=`<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${a.formatTime(e.goldenHourEvening?.start||e.sunset)} (om ${v})</span>`}else{const v=e.sunrise?a.formatDuration(e.sunrise.getTime()-l.getTime()):"";E=`Solopgang i morges/dag kl. ${a.formatTime(e.sunrise)} (om ${v})`}else d&&(E=`Solopgang i morgen kl. ${a.formatTime(e.sunrise)} • Solnedgang kl. ${a.formatTime(e.sunset)}`);let F=`Op: ${a.formatTime(t.moonTimes?.rise)} • Ned: ${a.formatTime(t.moonTimes?.set)}`;if(f){const v=t.moonTimes?.rise?l>t.moonTimes.rise?`Op kl. ${a.formatTime(t.moonTimes.rise)} (var for ${a.formatDuration(l.getTime()-t.moonTimes.rise.getTime())} siden)`:`Op i aften kl. ${a.formatTime(t.moonTimes.rise)} (om ${a.formatDuration(t.moonTimes.rise.getTime()-l.getTime())})`:"Går ikke op",S=t.moonTimes?.set?l>t.moonTimes.set?`Ned for ${a.formatDuration(l.getTime()-t.moonTimes.set.getTime())} siden`:`Ned kl. ${a.formatTime(t.moonTimes.set)}`:"Går ikke ned";F=`${v} • ${S}`}else d&&(F=`I morgen: Op kl. ${a.formatTime(t.moonTimes?.rise)} • Ned kl. ${a.formatTime(t.moonTimes?.set)}`);const B=l.getHours();s.innerHTML=`
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
          <div class="weather-day-banner-title">${L}</div>
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
          <div class="astro-sub-detail">${E}</div>
          <div class="astro-sub-detail">${O}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>${b.icon}</span> Måne
          </div>
          <div class="astro-sub-val">${b.fraction}% • ${b.name}</div>
          <div class="astro-sub-detail">${F}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${e.nightSky?.start?`${a.formatTime(e.nightSky.start)} - ${a.formatTime(e.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis -->
        <div class="photo-card ${y.isPassed?"card-event-passed":""}">
          ${j(y)}
          <div class="photo-card-top">
            <span class="photo-card-title">${n.icon} Morgentåge & Dis</span>
            <span class="photo-score-badge ${H(n.score)}">${n.score}/100 • ${n.level}</span>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ca. ${a.formatTime(m)} - ${a.formatTime($)}
            ${y.isPassed?'<span class="time-passed-tag">Afsluttet i morges</span>':`• ${y.sub}`}
          </div>
          <div class="photo-card-desc">${n.text}</div>
          ${I(y.isPassed,"Morgentågen fandt sted i morges. Tjek i morgen?","Se i morgen tidlig")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${n.avgSpread}°C • Fugt: ${n.avgHumidity}% • Vind: ${n.avgWind} m/s</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card ${i.isPassed?"card-event-passed":""}">
          ${j(i)}
          <div class="photo-card-top">
            <span class="photo-card-title">${g.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${H(g.score)}">${g.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${a.formatTime(e.sunrise)} - ${a.formatTime(e.goldenHourMorning?.end)}
            ${i.isPassed?`<span class="time-passed-tag">Passeret (kl. ${a.formatTime(e.sunrise)})</span>`:`• ${i.sub}`}
          </div>
          <div class="photo-card-desc">${g.text}</div>
          ${I(i.isPassed,"Morgenens gyldne time fandt sted i morges. Tjek i morgen?","Se daggry i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${g.clouds.total}% (Lav: ${g.clouds.low}%, Mellem: ${g.clouds.mid}%, Høj: ${g.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${e.sunrise?e.sunrise.getTime():t.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card ${k.isPassed?"card-event-passed":""}">
          ${j(k)}
          <div class="photo-card-top">
            <span class="photo-card-title">${p.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${H(p.score)}">${p.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${a.formatTime(e.goldenHourEvening?.start)} - ${a.formatTime(e.sunset)}
            ${k.isPassed?'<span class="time-passed-tag">Passeret i aften</span>':`• ${k.sub}`}
          </div>
          <div class="photo-card-desc">${p.text}</div>
          ${I(k.isPassed,"Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?","Se solnedgang i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${p.clouds.total}% (Lav: ${p.clouds.low}%, Mellem: ${p.clouds.mid}%, Høj: ${p.clouds.high}%)</span>
            <button class="btn-goto-fotosol" data-time="${e.sunset?e.sunset.getTime():t.date.getTime()}">
              Se lysretning i FotoSol →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card ${D.isPassed?"card-event-passed":""}">
          ${j(D)}
          <div class="photo-card-top">
            <span class="photo-card-title">${o.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${H(o.score)}">${o.score}/100 • ${o.status}</span>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${e.nightSky?.start?`${a.formatTime(e.nightSky.start)} - ${a.formatTime(e.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}
            ${D.isPassed?'<span class="time-passed-tag">Natten er ovre</span>':`• ${D.sub}`}
          </div>
          <div class="photo-card-desc">${o.text}</div>
          ${I(D.isPassed,"Astronomisk mørke for denne nat er ovre. Tjek næste nat?","Se stjernehimmel i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${o.moonImpact}</span>
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
            ${t.hourly.map(v=>{let S="hourly-col",M=`<span class="hour-badge">${String(v.hour).padStart(2,"0")}:00</span>`;return f&&(v.hour<B?(S+=" hourly-past-hour",M+='<span class="hour-past-pill">forbi</span>'):v.hour===B&&(S+=" hourly-current-hour",M+='<span class="hour-now-badge">NU</span>')),`
                <div class="${S}">
                  ${M}
                  <span>${v.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(v.temp)}°</span>
                  <span class="hour-clouds">☁️ ${v.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${v.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(v.visibility/1e3).toFixed(0)}km</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    `,s.querySelectorAll(".btn-jump-tomorrow").forEach(v=>{v.addEventListener("click",()=>{const S=Number(v.dataset.jumpDay??1);this.selectDay(S)})}),s.querySelectorAll(".btn-goto-fotosol").forEach(v=>{v.addEventListener("click",()=>{const S=Number(v.dataset.time),M=new Date(S);a.setDate(M),W.navigate("#/fotosol",{date:M,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{U as default};
