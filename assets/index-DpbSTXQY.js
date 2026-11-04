import{R as te}from"./index-BpgZJOkO.js";import{A as R,T as a,L as Q,a as se}from"./LocationBar-CZCNmsGQ.js";const ne="photoweather_cache_v2_";class q{static async fetchForecast(s,e,t=!1){const l=`${ne}${s.toFixed(4)}_${e.toFixed(4)}`;let n=null;try{const c=localStorage.getItem(l);c&&(n=JSON.parse(c))}catch(c){console.warn("Kunne ikke læse vejr-cache:",c)}const p=Date.now();if(!t&&n&&n.timestamp&&p-n.timestamp<1e3*60*60*2)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};const $=`https://api.open-meteo.com/v1/forecast?latitude=${s.toFixed(4)}&longitude=${e.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const c=await fetch($);if(!c.ok)throw new Error(`Open-Meteo svarede med status ${c.status}`);const d=await c.json();try{localStorage.setItem(l,JSON.stringify({timestamp:p,data:d}))}catch(v){console.warn("Kunne ikke gemme vejr i localStorage:",v)}return{forecast:d,isCached:!1,updatedAt:new Date(p)}}catch(c){if(n&&n.data)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};throw c}}static parseDayData(s,e,t,l){if(!s?.hourly?.time||!s?.daily?.time)return null;const n=s.daily.time[e];if(!n)return null;const p=n.split("-"),$=new Date(Number(p[0]),Number(p[1])-1,Number(p[2]),12,0,0),c=R.getSunTimes($,t,l),d=R.getMoonIllumination($),v=R.getMoonTimes($,t,l),T=s.hourly.time,u=[],A=[],h=`${n}T`,o=s.daily.time[e+1],m=o?`${o}T`:null,g=(b,j)=>{const C=Number(j.substring(11,13)),L=s.hourly.temperature_2m[b],x=s.hourly.dew_point_2m[b],F=s.hourly.weather_code[b],_=this.getWeatherCodeDescription(F);return{time:j,hour:C,temp:L,apparentTemp:s.hourly.apparent_temperature[b],humidity:s.hourly.relative_humidity_2m[b],dewPoint:x,spread:+(L-x).toFixed(1),precipProb:s.hourly.precipitation_probability[b],precipMm:s.hourly.precipitation[b],weatherCode:F,weatherDesc:_.desc,weatherIcon:_.icon,cloudTotal:s.hourly.cloud_cover[b],cloudLow:s.hourly.cloud_cover_low[b],cloudMid:s.hourly.cloud_cover_mid[b],cloudHigh:s.hourly.cloud_cover_high[b],visibility:s.hourly.visibility[b],windSpeed:s.hourly.wind_speed_10m[b],windDir:s.hourly.wind_direction_10m[b],windGusts:s.hourly.wind_gusts_10m[b]}};for(let b=0;b<T.length;b++){const j=T[b];j.startsWith(h)?u.push(g(b,j)):m&&j.startsWith(m)&&Number(j.substring(11,13))<=4&&A.push(g(b,j))}const w=this.calculateFogRisk(u,c,$),k=this.calculateGoldenHourQuality(u,c.goldenHourMorning,c.sunrise),y=this.calculateGoldenHourQuality(u,c.goldenHourEvening,c.sunset),E=this.calculateAstroScore(u,c,d,t,l,$,A);return{date:$,dayIndex:e,dateStr:n,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][$.getDay()],maxTemp:s.daily.temperature_2m_max[e],minTemp:s.daily.temperature_2m_min[e],weatherCode:s.daily.weather_code[e],weatherDesc:this.getWeatherCodeDescription(s.daily.weather_code[e]).desc,sun:c,moon:d,moonTimes:v,fog:w,goldenHourMorning:k,goldenHourEvening:y,astro:E,hourly:u}}static calculateFogRisk(s,e,t){const l=t||(e.sunrise?new Date(e.sunrise.getTime()):new Date);if(!s||s.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Ingen data",badgeClass:"badge-clear",photoTip:"Ingen vejrmeldinger tilgængelige.",avgSpread:"0.0",avgHumidity:0,avgWind:"0.0",minVisibilityKm:"0.0",period:"none",timeWindowLabel:"Ingen data",startTime:null,endTime:null};const n=e.sunrise?e.sunrise.getHours():6,p=e.sunset?e.sunset.getHours():18,$=r=>{const S=r.weatherCode===45||r.weatherCode===48,D=typeof r.visibility=="number"?r.visibility:1e4;if(!S&&D>=1e4)return 10;if(!S&&D>=6e3)return 20;let f=0;r.spread<=.5?f+=35:r.spread<=1.2?f+=25:r.spread<=2?f+=15:r.spread<=3&&(f+=5),r.humidity>=96?f+=25:r.humidity>=92?f+=18:r.humidity>=88?f+=10:r.humidity>=80&&(f+=5),S||D<=1e3?(r.windSpeed<=3?f+=20:r.windSpeed<=5?f+=12:r.windSpeed<=7?f+=5:f-=10,f+=20):(r.windSpeed<=2?f+=20:r.windSpeed<=3.5?f+=12:r.windSpeed<=5?f+=5:f-=15,D<=4500&&(f+=8));let i=Math.min(100,Math.max(0,f));return S||(D>5e3?i=Math.min(i,25):D>3500?i=Math.min(i,45):D>1500&&(i=Math.min(i,70))),i},d=s.map(r=>({hour:r.hour,item:r,score:$(r)})).filter(r=>r.score>=35);if(d.length===0){const r=Math.max(0,n-3),S=Math.min(23,n+1),D=s.filter(K=>K.hour>=r&&K.hour<=S),f=D.length>0?D:s.slice(0,4);let H=0,i=0,M=0,V=99999;f.forEach(K=>{H+=K.spread,i+=K.humidity,M+=K.windSpeed,K.visibility<V&&(V=K.visibility)}),H/=f.length,i/=f.length,M/=f.length;const J=Math.max(10,Math.round(f.reduce((K,ee)=>K+$(ee),0)/f.length)),U=e.civilDawn||(e.sunrise?new Date(e.sunrise.getTime()-45*60*1e3):null),X=e.sunriseEnd||(e.sunrise?new Date(e.sunrise.getTime()+65*60*1e3):null);return{score:J,level:"Lav",text:"Lav tågerisiko – klar sigt over landskabet",icon:"☀️",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Lav risiko",badgeClass:"badge-clear",photoTip:"Gode betingelser for rene, kontrastrige solopgangsbilleder uden slørende tåge.",avgSpread:H.toFixed(1),avgHumidity:Math.round(i),avgWind:M.toFixed(1),minVisibilityKm:(V/1e3).toFixed(1),period:"morning",timeWindowLabel:`ca. ${a.formatTime(U)} - ${a.formatTime(X)}`,startTime:U,endTime:X}}const v=d.filter(r=>r.hour<=n+3),T=v.some(r=>r.hour>=n-2&&r.hour<=n+2&&(r.score>=40||r.item.visibility<=3e3)),u=d.filter(r=>r.hour>=11&&r.hour<=15),A=u.some(r=>r.item.weatherCode===45||r.item.weatherCode===48||r.item.visibility<=1500);let h="morning",o=d;if(d.length>=8&&A&&u.length>=3)h="all_day",o=d;else if(T&&v.length>=2)h="morning",o=v;else{const r=d.filter(i=>i.hour>=p+2),S=d.filter(i=>i.hour<=n-3),D=d.filter(i=>i.hour>=p-1&&i.hour<=p+1),f=d.filter(i=>i.hour>n+2&&i.hour<p-1),H=[{period:"night",group:S.length>=r.length?S:r,weight:Math.max(S.reduce((i,M)=>i+M.score,0),r.reduce((i,M)=>i+M.score,0))},{period:"evening",group:D,weight:D.reduce((i,M)=>i+M.score,0)},{period:"day",group:f,weight:f.reduce((i,M)=>i+M.score,0)}].filter(i=>i.group.length>0);H.sort((i,M)=>M.weight-i.weight),H.length>0&&(h=H[0].period,o=H[0].group)}let m=0,g=0,w=0,k=99999,y=!1,E=0,P=0;o.forEach(r=>{const S=r.item;m+=S.spread,g+=S.humidity,w+=S.windSpeed,E+=S.cloudLow||0,S.visibility<k&&(k=S.visibility),(S.weatherCode===45||S.weatherCode===48)&&(y=!0),P+=r.score}),m/=o.length,g/=o.length,w/=o.length,E/=o.length;const b=Math.min(100,Math.round(P/o.length)),j=(k/1e3).toFixed(1);let C=null,L=null,x="";const F=r=>r<10?"0"+r:""+r;if(h==="all_day")C=new Date(l.getFullYear(),l.getMonth(),l.getDate(),0,0,0),L=new Date(l.getFullYear(),l.getMonth(),l.getDate(),23,59,59),x="Heldagståge (døgnet rundt)";else if(h==="night"){const r=o.filter(D=>D.hour>=18),S=o.filter(D=>D.hour<12);if(r.length>0&&S.length>0){const D=Math.min(...r.map(H=>H.hour)),f=Math.max(...S.map(H=>H.hour));C=new Date(l.getFullYear(),l.getMonth(),l.getDate(),D,0,0),L=new Date(l.getFullYear(),l.getMonth(),l.getDate()+1,f+1,0,0),x=`kl. ${F(D)}:00 - ${F(f+1)}:00 (i nat)`}else{const D=o.map(i=>i.hour),f=Math.min(...D),H=Math.max(...D);C=new Date(l.getFullYear(),l.getMonth(),l.getDate(),f,0,0),L=new Date(l.getFullYear(),l.getMonth(),l.getDate(),H+1,0,0),x=`kl. ${F(f)}:00 - ${F(H+1)}:00 (i nat)`}}else if(h==="morning"){const r=o.map(f=>f.hour),S=Math.min(...r),D=Math.max(...r);C=new Date(l.getFullYear(),l.getMonth(),l.getDate(),S,0,0),L=new Date(l.getFullYear(),l.getMonth(),l.getDate(),Math.max(D+1,(e.sunrise?.getHours()||6)+1),0,0),x=`ca. ${F(S)}:00 - ${F(D+1)}:00`}else{const r=o.map(f=>f.hour),S=Math.min(...r),D=Math.max(...r);C=new Date(l.getFullYear(),l.getMonth(),l.getDate(),S,0,0),L=new Date(l.getFullYear(),l.getMonth(),l.getDate(),D+1,0,0),x=`kl. ${F(S)}:00 - ${F(D+1)}:00`}const _=y||k<=1200||g>=96&&m<=.6&&E>=60||g>=93&&m<=.8&&w>=2.5,Y=b>=75?"Meget høj":b>=55?"Høj":"Moderat",z=b>=55?"high":"moderate";let G="Morgentåge & Dis",N="🌫️",I="Tæt tåge",O="badge-dense-fog",W="",B="";if(h==="night")G=_?"Tæt Nattåge":"Nattåge & Slør",N="🌃",O="badge-night-fog",I=_?"Nattåge":"Natslør",W=k<1e3?`Tæt tåge over natten (${x}, sigtdybde ca. ${Math.round(k)}m). Gadelygter og billygter skaber markante lyskegler.`:`Tågeslør lægger sig over natten (${x}). Høj stemning med lysspredning fra gadelygter.`,B="Magiske forhold for nat- og gadefotografering! Gadelygter, neonskilte og billygter danner filmiske lyskegler (volumetrisk lys) og en stemningsfuld noir-æstetik på tomme gader og stier.";else if(h==="all_day")G="Massiv Heldagståge",N="🌫️",O="badge-all-day",I="Heldagståge",W=`Massiv tåge dækker hele døgnet (${x}) med markant nedsat sigtbarhed (${j} km). Solen forbliver skjult.`,B="Heldags-mulighed for melankolske og grafiske serier. Gå efter ensomme træer, strukturer i tågen og minimalistiske kompositioner med en markant forgrund.";else if(h==="day")G=_?"Tæt Dagståge / Havgus":"Dagdis & Slør",N="🌁",O="badge-day-fog",I=_?"Dagståge / Havgus":"Dagdis",W=`Tåge og nedsat sigtbarhed midt på dagen (${x}). Det diffuse dagslys udvisker baggrunde og fjerner hårde skygger.`,B="Perfekt til minimalistisk fotografi, kystlandskaber og rå arkitektur. Det bløde, skyggefrie lys fremhæver former og silhuetter frem for tekstur.";else if(h==="evening")G=_?"Tæt Aftentåge":"Aftentåge & Skumring",N="🌆",O="badge-dense-fog",I=_?"Tæt aftentåge":"Aftendis",W=`Tågen trækker ind omkring solnedgang og aften (${x}). Skumringens blå time blandes med tågens bløde lysdække.`,B="Udnyt samspillet mellem det blå skumringslys (den blå time) og tågens spredning af de første tændte vindues- og gadelamper til flotte farvekontraster.";else{const r=e.sunrise?` ved daggry og solopgang kl. ${a.formatTime(e.sunrise)}`:" ved daggry";_?(G="Tæt Morgentåge",N="🌫️",O="badge-dense-fog",I=k<1e3?`Tæt tåge (sigt ${Math.round(k)}m)`:"Massiv tåge",W=k<1e3?`Massiv og tæt tåge dækker landskabet${r} (${x}, sigtdybde ca. ${Math.round(k)}m). Tykt dække hvor solen næppe trænger igennem.`:`Massiv og tæt morgentåge (${x})${r} med dæmpet, diffust lys.`,B=`Fokusér på minimalistiske kompositioner, grafiske træer, ensomme strukturer og silhuetter under daggry${e.sunrise?` og solopgang kl. ${a.formatTime(e.sunrise)}`:""} før solen bryder igennem.`):(G="Morgendis & Jordtåge",N=b>=75?"🌫️":"🌁",O="badge-radiation-mist",I="Morgendis / Mosekonebryg",W=b>=75?`Perfekte betingelser for eventyrlig morgendis over enge og vand${r} (${x})! Høj chance for gyldne solstråler (god rays).`:`Gode chancer for stemningsfuld morgendis og lav jordtåge (${x})${r} med smuk lagdelt dybde ved solopgang.`,B="Stil dig i modlys mod solopgangen for at fange gyldne lysstråler (god rays) igennem trækroner eller det lave slør over søer og marker.")}return{score:b,level:Y,text:W,icon:N,classType:z,fogType:_?"dense_fog":"radiation_mist",typeName:G,typeBadge:I,badgeClass:O,photoTip:B,period:h,timeWindowLabel:x,startTime:C,endTime:L,avgSpread:m.toFixed(1),avgHumidity:Math.round(g),avgWind:w.toFixed(1),minVisibilityKm:j}}static calculateGoldenHourQuality(s,e,t){if(!s||!t)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const l=t.getHours(),n=s.find(A=>A.hour===l)||s[l]||s[0],p=n.cloudTotal,$=n.cloudLow,c=n.cloudMid,d=n.cloudHigh;let v=50,T="Pænt lys",u="☀️";return $>=70||p>=85&&$+c>=80?(v=20,T="Tungt lavt skydække blokerer for direkte sollys og gylden glød",u="☁️"):p>=75?(v=35,T="Overvejende overskyet – diffust og dæmpet lys ved horisonten",u="☁️"):p<=15?(v=85,T="Klar himmel – rent gyldent lys og skarpe lange skygger",u="🌅"):$<=30&&c+d>=30&&c+d<=75?(v=95,T="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",u="🔥"):p<=50?(v=75,T="Gode forhold med dynamiske lysstriber gennem spredte skyer",u="🌤️"):(v=45,T="Vekslende skydække med diffuse lysforhold",u="⛅"),{score:v,text:T,icon:u,clouds:{total:p,low:$,mid:c,high:d}}}static calculateAstroScore(s,e,t,l,n,p,$){const c=e.astronomicalDusk&&e.astronomicalDawn;let d;$&&$.length>0?d=[...s.filter(y=>y.hour>=22),...$.filter(y=>y.hour<=4)]:d=s.filter(y=>y.hour>=22||y.hour<=4),d.length===0&&(d=s.slice(0,4));let v=0,T=0;d.forEach(y=>{v+=y.cloudTotal,T+=y.cloudLow}),v/=d.length,T/=d.length;const u=Math.round(v);let A=0;d.forEach(y=>{const E=new Date(p.getFullYear(),p.getMonth(),p.getDate()+(y.hour<=4?1:0),y.hour,0,0);try{const P=R.getMoonPosition(E,l,n);P&&P.altitude>0&&A++}catch{}});let h=100;u<=10?h-=u*.5:u<=30?h-=5+(u-10)*1:u<=60?h-=25+(u-30)*1.5:h-=70+(u-60)*.7,h-=T*.25;let o="";A===0?o="Månen er under horisonten hele natten (ingen måneforstyrrelse)":t.fraction<=15?o=`Nymåne / ultrasvagt segl (${t.fraction}%) – intet generende måneskin`:t.fraction<=45?(h-=Math.round(t.fraction/100*15),o=`Svag månefase (${t.fraction}%) – kun moderat lyspåvirkning`):(h-=Math.round(t.fraction/100*35),o=`Kraftigt måneskin (${t.fraction}%) oplyser natten og udvisker svage stjerner`),c||(h=Math.min(h,50),o+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const m=Math.min(100,Math.max(0,Math.round(h)));let g="Ugunstig",w="☁️",k="";return u>=75?(g="Ugunstig",w="☁️",k=`Tæt skydække (${u}%) dækker himlen i nat.`):u>=50?(g="Svag",w="⛅",k=`Overvejende skyet (${u}%). Kun spredte kighuller til enkelte klare stjerner.`):u>=25?(g="Moderat",w="✨",k=`Gode observationsforhold med lette slørskyer (${u}%).`):(g="Fremragende",w="🌌",k=`Krystalklar nattehimmel (${u}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:m,status:g,icon:w,text:k,roundClouds:u,moonImpact:o}}static getWeatherCodeDescription(s){switch(s){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}static getEventTiming(s,e,t,l,n,p=50,$){const c=$||a.getDate()||new Date,d=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],v=typeof p=="number"?p:50;if(t===0){if(s&&e&&c>=s&&c<=e){const h=e.getTime()-c.getTime(),o=a.formatDuration(h);let m="banner-active",g="🟢",w="Aktiv nu",k=`Aktiv lige nu • Slutter om ${o}`,y=`Aktiv lige nu (slutter kl. ${a.formatTime(e)})`;return n==="astro"?v>=65?(m="banner-active",g="✨",w="Aktiv nu",k=`Gode stjerneforhold nu • Slutter om ${o}`,y=`Astronomisk nat aktiv lige nu (slutter kl. ${a.formatTime(e)})`):v>=40?(m="banner-active-moderate",g="⛅",w="Moderat nu",k=`Astronomisk nat aktiv • Vekslende skydække (slutter om ${o})`,y=`Mørke i gang (kl. ${a.formatTime(e)}) • Skiftende skyer`):(m="banner-active-poor",g="☁️",w="Overskyet nu",k=`Astronomisk nat er i gang • Desværre overskyet (slutter om ${o})`,y=`Mørke i gang (kl. ${a.formatTime(e)}) • Dækket af skyer`):n==="fog"?v>=55?(m="banner-active",g="🌫️",w="Aktiv nu",k=`Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${o})`,y=`Tågevindue aktivt lige nu (slutter kl. ${a.formatTime(e)})`):v>=35?(m="banner-active-moderate",g="🌁",w="Moderat nu",k=`Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${o})`,y=`Tidsvindue aktivt (slutter kl. ${a.formatTime(e)})`):(m="banner-active-poor",g="☀️",w="Klar sigt",k=`Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${o})`,y=`Morgenstund i gang (slutter kl. ${a.formatTime(e)}) • Ingen tåge`):n==="morning"?v>=65?(m="banner-active",g="🌅",w="Aktiv nu",k=`Gylden time aktiv lige nu • Flot morgenlys (slutter om ${o})`,y=`Daggry i gang nu (slutter kl. ${a.formatTime(e)})`):v>=40?(m="banner-active-moderate",g="🌤️",w="Vekslende nu",k=`Morgenlys aktivt nu • Vekslende skydække (slutter om ${o})`,y=`Morgenlys i gang (slutter kl. ${a.formatTime(e)})`):(m="banner-active-poor",g="☁️",w="Overskyet nu",k=`Morgentime i gang • Solen skjult af skydække (slutter om ${o})`,y="Morgenlys i gang, men dækket af skyer"):n==="evening"&&(v>=65?(m="banner-active",g="🌆",w="Aktiv nu",k=`Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${o})`,y=`Aktiv solnedgang lige nu (slutter kl. ${a.formatTime(e)})`):v>=40?(m="banner-active-moderate",g="🌤️",w="Moderat nu",k=`Aftenlys i gang • Vekslende skydække (slutter om ${o})`,y=`Solnedgang i gang (slutter kl. ${a.formatTime(e)})`):(m="banner-active-poor",g="☁️",w="Overskyet nu",k=`Solnedgang i gang • Skjult bag tungt skydække (slutter om ${o})`,y="Solnedgang i gang, men skjult bag skyer")),{status:"active",bannerClass:m,icon:g,pill:w,label:k,sub:y,isPassed:!1}}if(e&&c>e){const h=c.getTime()-e.getTime(),o=a.formatDuration(h);let m=`I morges • For ${o} siden`,g=`Afsluttet i morges (for ${o} siden)`;return n==="fog"?(m=`Tågevindue afsluttet • For ${o} siden`,g=`Afsluttet kl. ${a.formatTime(e)} (for ${o} siden)`):n==="evening"?(m=`I aften • For ${o} siden`,g=`Afsluttet i aften kl. ${a.formatTime(e)}`):n==="astro"&&(m="Natten er ovre",g=`Astronomisk nat afsluttet kl. ${a.formatTime(e)}`),{status:"passed",bannerClass:"banner-passed",icon:"⏳",pill:"Passeret",label:m,sub:g,isPassed:!0}}if(s&&c<s){const h=s.getTime()-c.getTime(),o=a.formatDuration(h);let m=`I dag • Om ${o}`,g=`Starter kl. ${a.formatTime(s)} (om ${o})`;return n==="evening"?(m=v>=65?`I aften • Om ${o} (flot aftenlys)`:`I aften • Om ${o}`,g=`Starter i aften kl. ${a.formatTime(s)} (om ${o})`):n==="astro"?(m=v>=65?`I aften/nat • Om ${o} (klare stjerneforhold)`:v<=35?`I aften/nat • Om ${o} (forventet overskyet)`:`I aften/nat • Om ${o}`,g=`Astronomisk nat starter kl. ${a.formatTime(s)} (om ${o})`):n==="fog"?(m=`Tågevindue senere i dag • Om ${o}`,g=`Forventes kl. ${a.formatTime(s)} (om ${o})`):n==="morning"&&(m=`I dag ved daggry • Om ${o}`),{status:"upcoming",bannerClass:"banner-upcoming",icon:"⏱️",pill:"Kommende",label:m,sub:g,isPassed:!1}}}if(t===1){const h=s?Math.max(0,s.getTime()-c.getTime()):0,o=a.formatDuration(h);let m=`I morgen • Om ${o}`,g=`I morgen kl. ${s?a.formatTime(s):"--:--"}`;return n==="fog"?(m=`Tågevindue i morgen • Om ${o}`,g=`I morgen kl. ${a.formatTime(s)} (om ${o})`):n==="morning"?(m=`I morgen tidlig • Om ${o}`,g=`I morgen kl. ${a.formatTime(s)} (om ${o})`):n==="evening"?(m=`I morgen aften • Om ${o}`,g=`I morgen kl. ${a.formatTime(s)} (om ${o})`):n==="astro"&&(m=`I morgen nat • Om ${o}`,g=`I morgen nat fra kl. ${a.formatTime(s)}`),{status:"future",bannerClass:"banner-future",icon:"📅",pill:"I morgen",label:m,sub:g,isPassed:!1}}const T=d[l.getDay()];let u=`${T} • Om ${t} dage`,A=`${T}`;return n==="fog"?(u=`${T} • Om ${t} dage`,A=`${T} kl. ${s?a.formatTime(s):"--:--"}`):n==="morning"?(u=`${T} morgen • Om ${t} dage`,A=`${T} kl. ${s?a.formatTime(s):"06:00"}`):n==="evening"?(u=`${T} aften • Om ${t} dage`,A=`${T} kl. ${s?a.formatTime(s):"18:00"}`):n==="astro"&&(u=`${T} nat • Om ${t} dage`,A=`${T} nat`),{status:"future-distant",bannerClass:"banner-future",icon:"📅",pill:T,label:u,sub:A,isPassed:!1}}}class oe{container;currentLocation=Q.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(s){this.container=s,this.currentLocation=Q.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=Q.subscribe(async e=>{this.currentLocation=e,await this.loadWeather(!1)})}onActivate(s){if(s?.params){const e=s.params;e.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(e.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
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
    `;const s=this.container.querySelector("#weatherLocationMount");s&&(this.locationBar=new se({container:s,accentClass:"fs-btn-accent-weather"}))}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)})}updateLocationDisplay(){const s=this.container.querySelector("#weatherLocName"),e=this.container.querySelector("#weatherLocCoords");s&&(s.textContent=this.currentLocation.name),e&&(e.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(s=!1){if(!this.isLoading){this.isLoading=!0;try{const e=await q.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,s);this.forecastData=e.forecast,this.isCachedForecast=e.isCached,this.cacheUpdatedAt=e.updatedAt,this.parsedDays=[];for(let t=0;t<7;t++){const l=q.parseDayData(this.forecastData,t,this.currentLocation.lat,this.currentLocation.lng);l&&this.parsedDays.push(l)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(e){console.error("Fejl ved indlæsning af vejr:",e);const t=this.container.querySelector("#weatherSelectedDayWrap");t&&(t.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${e.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const s=this.container.querySelector("#weatherStatusBanner"),e=this.container.querySelector("#weatherStatusTime");s&&(this.isCachedForecast&&this.cacheUpdatedAt?(s.classList.add("active"),e&&(e.textContent=`Hentet kl. ${a.formatTime(this.cacheUpdatedAt)}`)):s.classList.remove("active"))}selectDay(s){this.selectedDayIndex=Math.min(6,Math.max(0,s));const e=this.container.querySelector("#weatherDaysScroll");e&&(e.querySelectorAll(".day-tab-card").forEach(t=>t.classList.remove("active")),e.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add("active")),this.renderSelectedDay()}renderDaysScroll(){const s=this.container.querySelector("#weatherDaysScroll");!s||this.parsedDays.length===0||(s.innerHTML=this.parsedDays.map((e,t)=>{const n=t===0?"I dag":e.dayName.substring(0,3),p=q.getWeatherCodeDescription(e.weatherCode);return`
        <div class="day-tab-card ${t===this.selectedDayIndex?"active":""}" data-day="${t}">
          <span class="day-name">${n}</span>
          <span class="day-date">${e.date.getDate()}</span>
          <span class="day-icon">${p.icon}</span>
          <span class="day-temp-range">${Math.round(e.minTemp)}° / ${Math.round(e.maxTemp)}°</span>
        </div>
      `}).join(""),s.querySelectorAll("[data-day]").forEach(e=>{e.addEventListener("click",()=>{const t=Number(e.dataset.day);this.selectDay(t)})}))}renderSelectedDay(){const s=this.container.querySelector("#weatherSelectedDayWrap");if(!s||!this.parsedDays[this.selectedDayIndex])return;const e=this.parsedDays[this.selectedDayIndex],t=e.sun,l=e.moon,n=e.fog,p=e.goldenHourMorning,$=e.goldenHourEvening,c=e.astro,d=a.getDate()||new Date,v=this.selectedDayIndex===0,T=this.selectedDayIndex===1,u=n.startTime||t.civilDawn||(t.sunrise?new Date(t.sunrise.getTime()-45*60*1e3):null),A=n.endTime||t.sunriseEnd||(t.sunrise?new Date(t.sunrise.getTime()+65*60*1e3):null),h=q.getEventTiming(u,A,this.selectedDayIndex,e.date,"fog",n.score,d),o=t.blueHourMorning&&t.blueHourMorning.start||(t.sunrise?new Date(t.sunrise.getTime()-50*60*1e3):null),m=t.goldenHourMorning&&t.goldenHourMorning.end||(t.sunrise?new Date(t.sunrise.getTime()+45*60*1e3):null),g=q.getEventTiming(o,m,this.selectedDayIndex,e.date,"morning",p.score,d),w=t.goldenHourEvening&&t.goldenHourEvening.start||(t.sunset?new Date(t.sunset.getTime()-45*60*1e3):null),k=t.blueHourEvening&&t.blueHourEvening.end||(t.sunset?new Date(t.sunset.getTime()+45*60*1e3):null),y=q.getEventTiming(w,k,this.selectedDayIndex,e.date,"evening",$.score,d);let E=null,P=null;t.astronomicalDusk&&(v&&t.astronomicalDawn&&d<t.astronomicalDawn?(E=new Date(t.astronomicalDusk.getTime()-24*60*60*1e3),P=t.astronomicalDawn):(E=t.astronomicalDusk,P=t.astronomicalDawn?new Date(t.astronomicalDawn.getTime()+24*60*60*1e3):new Date(E.getTime()+9*60*60*1e3)));const b=q.getEventTiming(E,P,this.selectedDayIndex,e.date,"astro",c.score,d),j=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];let C="",L="";if(v)C=`I dag (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${j[e.date.getMonth()]})`,t.sunset&&d>t.sunset?L="Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys":h.status==="active"?L=n.score>=50?`Aktuel nu: ${n.typeName} (${n.timeWindowLabel||"aktiv lige nu"})`:`Aktuel nu: ${n.typeName}`:g.status==="active"?L=p.score>=50?"Aktuel lige nu: Daggry & gylden time!":"Aktuel lige nu: Daggry (skydækket morgen)":y.status==="active"?L=$.score>=50?"Aktuel lige nu: Solnedgang & aftenlys!":"Aktuel lige nu: Solnedgang (skjult bag skyer)":w&&d<w?L=`Næste: Gylden time i aften kl. ${a.formatTime(w)} (om ${a.formatDuration(w.getTime()-d.getTime())})`:E&&d<E?L=c.score>=60?`Næste: Stjernehimmel i aften kl. ${a.formatTime(E)} (om ${a.formatDuration(E.getTime()-d.getTime())})`:`Næste: Astronomisk mørke i aften kl. ${a.formatTime(E)} (om ${a.formatDuration(E.getTime()-d.getTime())})`:L="Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";else if(T){C=`I morgen (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${j[e.date.getMonth()]})`;const i=t.blueHourMorning?.start||t.sunrise,M=i?Math.max(0,i.getTime()-d.getTime()):0;L=`Første fotomulighed: Daggry kl. ${a.formatTime(i)} (om ${a.formatDuration(M)}) • Vejrudsigt for i morgen`}else C=`${e.dayName} d. ${e.date.getDate()}. ${j[e.date.getMonth()]}`,L=`7-dages vejrudsigt for ${this.currentLocation.name}`;const x=i=>i>=70?"score-high":i>=40?"score-moderate":"score-low",F=i=>`
      <div class="card-timing-banner ${i.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${i.icon}</span>
          <span class="timing-label">${i.label}</span>
        </div>
        <span class="timing-banner-pill">${i.pill}</span>
      </div>
    `,_=(i,M,V)=>!i||!v||this.parsedDays.length<=1?"":`
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${M}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${V} ➔</button>
        </div>
      `;let Y=`${a.formatTime(t.sunrise)} / ${a.formatTime(t.sunset)}`,z="Solopgang • Solnedgang",G=`<span style="color:var(--golden-primary);">Gylden: ${a.formatTime(t.goldenHourEvening?.start)} - ${a.formatTime(t.sunset)}</span>`;if(v)if(t.sunset&&d>t.sunset)Y+=' <span class="time-passed-tag">Passeret</span>',z="Solopgang • Solnedgang (dagens soltimer er forbi)",G=`<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;else if(t.sunrise&&d>t.sunrise){z=`Solopgang var for ${a.formatDuration(d.getTime()-t.sunrise.getTime())} siden`;const i=t.goldenHourEvening?.start||t.sunset?a.formatDuration((t.goldenHourEvening?.start||t.sunset).getTime()-d.getTime()):"";G=`<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${a.formatTime(t.goldenHourEvening?.start||t.sunset)} (om ${i})</span>`}else{const i=t.sunrise?a.formatDuration(t.sunrise.getTime()-d.getTime()):"";z=`Solopgang i morges/dag kl. ${a.formatTime(t.sunrise)} (om ${i})`}else T&&(z=`Solopgang i morgen kl. ${a.formatTime(t.sunrise)} • Solnedgang kl. ${a.formatTime(t.sunset)}`);const N=e.moonTimes?.riseAzimuth,I=e.moonTimes?.setAzimuth,O=N!=null?` (${N.toFixed(0)}° ${R.getCompassDirection(N)})`:"",W=I!=null?` (${I.toFixed(0)}° ${R.getCompassDirection(I)})`:"";let B=`Op: ${a.formatTime(e.moonTimes?.rise)}${O} • Ned: ${a.formatTime(e.moonTimes?.set)}${W}`;if(v){const i=e.moonTimes?.rise?d>e.moonTimes.rise?`Op kl. ${a.formatTime(e.moonTimes.rise)}${O}`:`Op kl. ${a.formatTime(e.moonTimes.rise)}${O} (om ${a.formatDuration(e.moonTimes.rise.getTime()-d.getTime())})`:"Går ikke op",M=e.moonTimes?.set?`Ned kl. ${a.formatTime(e.moonTimes.set)}${W}`:"Går ikke ned";B=`${i} • ${M}`}else T&&(B=`I morgen: Op kl. ${a.formatTime(e.moonTimes?.rise)}${O} • Ned kl. ${a.formatTime(e.moonTimes?.set)}${W}`);const r=d.getHours(),S=t.sunrise?R.getSunPosition(t.sunrise,this.currentLocation.lat,this.currentLocation.lng):null,D=t.sunset?R.getSunPosition(t.sunset,this.currentLocation.lat,this.currentLocation.lng):null,f=S?`${S.azimuth.toFixed(0)}° ${R.getCompassDirection(S.azimuth)}`:"",H=D?`${D.azimuth.toFixed(0)}° ${R.getCompassDirection(D.azimuth)}`:"";s.innerHTML=`
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
          <div class="weather-day-banner-title">${C}</div>
          <div class="weather-day-banner-sub">${L}</div>
        </div>
      </div>

      <!-- ASTRONOMISK OVERBLIK (SOL & MÅNE) -->
      <div class="astro-overview-grid">
        <!-- Sol -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>☀️</span> Soltider
          </div>
          <div class="astro-sub-val">${Y}</div>
          <div class="astro-sub-detail">${z}</div>
          <div class="astro-sub-detail">${G}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title" style="justify-content: space-between;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span>${l.icon}</span> Måne</span>
            <button class="btn-goto-sol" data-body="moon" data-time="${e.moonTimes?.rise?e.moonTimes.rise.getTime():e.date.getTime()}" style="padding:1px 7px;font-size:10px;" title="Se måneopgang og måneretning i Sol/Måne-modulet">
              Sol/Måne →
            </button>
          </div>
          <div class="astro-sub-val">${l.fraction}% • ${l.name}</div>
          <div class="astro-sub-detail">${B}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${t.nightSky?.start?`${a.formatTime(t.nightSky.start)} - ${a.formatTime(t.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis / Tæt Tåge -->
        <div class="photo-card ${h.isPassed?"card-event-passed":""}">
          ${F(h)}
          <div class="photo-card-top">
            <span class="photo-card-title">${n.icon} ${n.typeName||"Morgentåge & Dis"}</span>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
              ${n.typeBadge?`<span class="photo-type-badge ${n.badgeClass||""}">${n.typeBadge}</span>`:""}
              <span class="photo-score-badge ${x(n.score)}">${n.score}/100 • ${n.level}</span>
            </div>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ${n.timeWindowLabel||`ca. ${a.formatTime(u)} - ${a.formatTime(A)}`}
            ${h.isPassed?'<span class="time-passed-tag">Afsluttet</span>':`• ${h.sub}`}
          </div>
          <div class="photo-card-desc">${n.text}</div>
          ${n.photoTip?`<div class="photo-card-tip">💡 <strong>Fototip:</strong> ${n.photoTip}</div>`:""}
          ${_(h.isPassed,"Tågeperioden er overstået for i dag. Tjek i morgen?","Se tåge i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${n.avgSpread}°C • Fugt: ${n.avgHumidity}% • Vind: ${n.avgWind} m/s • Sigt: ${n.minVisibilityKm} km</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card ${g.isPassed?"card-event-passed":""}">
          ${F(g)}
          <div class="photo-card-top">
            <span class="photo-card-title">${p.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${x(p.score)}">${p.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${a.formatTime(t.sunrise)} - ${a.formatTime(t.goldenHourMorning?.end)}
            ${f?`<span class="compass-direction-tag" title="Solens kompasretning ved solopgang">🧭 ${f}</span>`:""}
            ${g.isPassed?`<span class="time-passed-tag">Passeret (kl. ${a.formatTime(t.sunrise)})</span>`:`• ${g.sub}`}
          </div>
          <div class="photo-card-desc">${p.text}</div>
          ${_(g.isPassed,"Morgenens gyldne time fandt sted i morges. Tjek i morgen?","Se daggry i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${p.clouds.total}% (Lav: ${p.clouds.low}%, Mellem: ${p.clouds.mid}%, Høj: ${p.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${t.sunrise?t.sunrise.getTime():e.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card ${y.isPassed?"card-event-passed":""}">
          ${F(y)}
          <div class="photo-card-top">
            <span class="photo-card-title">${$.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${x($.score)}">${$.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${a.formatTime(t.goldenHourEvening?.start)} - ${a.formatTime(t.sunset)}
            ${H?`<span class="compass-direction-tag" title="Solens kompasretning ved solnedgang">🧭 ${H}</span>`:""}
            ${y.isPassed?'<span class="time-passed-tag">Passeret i aften</span>':`• ${y.sub}`}
          </div>
          <div class="photo-card-desc">${$.text}</div>
          ${_(y.isPassed,"Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?","Se solnedgang i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${$.clouds.total}% (Lav: ${$.clouds.low}%, Mellem: ${$.clouds.mid}%, Høj: ${$.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${t.sunset?t.sunset.getTime():e.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card ${b.isPassed?"card-event-passed":""}">
          ${F(b)}
          <div class="photo-card-top">
            <span class="photo-card-title">${c.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${x(c.score)}">${c.score}/100 • ${c.status}</span>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${t.nightSky?.start?`${a.formatTime(t.nightSky.start)} - ${a.formatTime(t.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}
            ${b.isPassed?'<span class="time-passed-tag">Natten er ovre</span>':`• ${b.sub}`}
          </div>
          <div class="photo-card-desc">${c.text}</div>
          ${_(b.isPassed,"Astronomisk mørke for denne nat er ovre. Tjek næste nat?","Se stjernehimmel i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${c.moonImpact}</span>
            <button class="btn-goto-sol" data-body="moon" data-time="${e.moonTimes?.rise?e.moonTimes.rise.getTime():t.nightSky?.start?t.nightSky.start.getTime():e.date.getTime()}" title="Se måneretning og nattehimmel i Sol/Måne-modulet">
              ${l.icon} Åbn i Sol/Måne →
            </button>
          </div>
        </div>
      </div>

      <!-- TIME-FOR-TIME TABEL -->
      <div class="fs-card" style="margin-top: 14px;">
        <div class="fs-card-header">
          <span class="fs-card-title">Time-for-time vejrdata</span>
          <span class="fs-badge">${e.dayName}</span>
        </div>
        <div class="hourly-table-wrap">
          <div class="hourly-scroll">
            ${e.hourly.map(i=>{let M="hourly-col",V=`<span class="hour-badge">${String(i.hour).padStart(2,"0")}:00</span>`;return v&&(i.hour<r?(M+=" hourly-past-hour",V+='<span class="hour-past-pill">forbi</span>'):i.hour===r&&(M+=" hourly-current-hour",V+='<span class="hour-now-badge">NU</span>')),`
                <div class="${M}">
                  ${V}
                  <span>${i.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(i.temp)}°</span>
                  <span class="hour-clouds">☁️ ${i.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${i.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(i.visibility/1e3).toFixed(0)}km</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    `,s.querySelectorAll(".btn-jump-tomorrow").forEach(i=>{i.addEventListener("click",()=>{const M=Number(i.dataset.jumpDay??1);this.selectDay(M)})}),s.querySelectorAll(".btn-goto-sol, .btn-goto-fotosol").forEach(i=>{i.addEventListener("click",()=>{const M=i,V=Number(M.dataset.time),J=M.dataset.body||"sun",U=new Date(V);a.setDate(U),te.navigate("#/sol",{date:U,body:J,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{oe as default};
