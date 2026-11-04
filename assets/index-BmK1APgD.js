import{R as te}from"./index-aRMSoiKw.js";import{A as R,T as n,L as Q,a as se}from"./LocationBar-CZCNmsGQ.js";const ne="photoweather_cache_v2_";class q{static async fetchForecast(s,e,t=!1){const l=`${ne}${s.toFixed(4)}_${e.toFixed(4)}`;let a=null;try{const c=localStorage.getItem(l);c&&(a=JSON.parse(c))}catch(c){console.warn("Kunne ikke læse vejr-cache:",c)}const h=Date.now();if(!t&&a&&a.timestamp&&h-a.timestamp<1e3*60*60*2)return{forecast:a.data,isCached:!0,updatedAt:new Date(a.timestamp)};const $=`https://api.open-meteo.com/v1/forecast?latitude=${s.toFixed(4)}&longitude=${e.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const c=await fetch($);if(!c.ok)throw new Error(`Open-Meteo svarede med status ${c.status}`);const g=await c.json();try{localStorage.setItem(l,JSON.stringify({timestamp:h,data:g}))}catch(y){console.warn("Kunne ikke gemme vejr i localStorage:",y)}return{forecast:g,isCached:!1,updatedAt:new Date(h)}}catch(c){if(a&&a.data)return{forecast:a.data,isCached:!0,updatedAt:new Date(a.timestamp)};throw c}}static parseDayData(s,e,t,l){if(!s?.hourly?.time||!s?.daily?.time)return null;const a=s.daily.time[e];if(!a)return null;const h=a.split("-"),$=new Date(Number(h[0]),Number(h[1])-1,Number(h[2]),12,0,0),c=R.getSunTimes($,t,l),g=R.getMoonIllumination($),y=R.getMoonTimes($,t,l),k=s.hourly.time,m=[],x=[],p=`${a}T`,i=s.daily.time[e+1],u=i?`${i}T`:null,d=(D,_)=>{const j=Number(_.substring(11,13)),M=s.hourly.temperature_2m[D],S=s.hourly.dew_point_2m[D],F=s.hourly.weather_code[D],E=this.getWeatherCodeDescription(F);return{time:_,hour:j,temp:M,apparentTemp:s.hourly.apparent_temperature[D],humidity:s.hourly.relative_humidity_2m[D],dewPoint:S,spread:+(M-S).toFixed(1),precipProb:s.hourly.precipitation_probability[D],precipMm:s.hourly.precipitation[D],weatherCode:F,weatherDesc:E.desc,weatherIcon:E.icon,cloudTotal:s.hourly.cloud_cover[D],cloudLow:s.hourly.cloud_cover_low[D],cloudMid:s.hourly.cloud_cover_mid[D],cloudHigh:s.hourly.cloud_cover_high[D],visibility:s.hourly.visibility[D],windSpeed:s.hourly.wind_speed_10m[D],windDir:s.hourly.wind_direction_10m[D],windGusts:s.hourly.wind_gusts_10m[D]}};for(let D=0;D<k.length;D++){const _=k[D];_.startsWith(p)?m.push(d(D,_)):u&&_.startsWith(u)&&Number(_.substring(11,13))<=4&&x.push(d(D,_))}const T=this.calculateFogRisk(m,c,$),b=this.calculateGoldenHourQuality(m,c.goldenHourMorning,c.sunrise),v=this.calculateGoldenHourQuality(m,c.goldenHourEvening,c.sunset),L=this.calculateAstroScore(m,c,g,t,l,$,x);return{date:$,dayIndex:e,dateStr:a,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][$.getDay()],maxTemp:s.daily.temperature_2m_max[e],minTemp:s.daily.temperature_2m_min[e],weatherCode:s.daily.weather_code[e],weatherDesc:this.getWeatherCodeDescription(s.daily.weather_code[e]).desc,sun:c,moon:g,moonTimes:y,fog:T,goldenHourMorning:b,goldenHourEvening:v,astro:L,hourly:m}}static calculateFogRisk(s,e,t){const l=t||(e.sunrise?new Date(e.sunrise.getTime()):new Date);if(!s||s.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Ingen data",badgeClass:"badge-clear",photoTip:"Ingen vejrmeldinger tilgængelige.",avgSpread:"0.0",avgHumidity:0,avgWind:"0.0",minVisibilityKm:"0.0",period:"none",timeWindowLabel:"Ingen data",startTime:null,endTime:null};const a=e.sunrise?e.sunrise.getHours():6,h=e.sunset?e.sunset.getHours():18,$=o=>{let r=0;return o.spread<=.5?r+=40:o.spread<=1.2?r+=32:o.spread<=2.2?r+=20:o.spread<=3.5&&(r+=10),o.humidity>=96?r+=30:o.humidity>=92?r+=24:o.humidity>=88?r+=16:o.humidity>=80&&(r+=8),o.weatherCode===45||o.weatherCode===48||o.visibility<=1e3?(o.windSpeed<=3?r+=20:o.windSpeed<=5?r+=14:o.windSpeed<=7?r+=6:r-=10,r+=20):(o.windSpeed<=2?r+=20:o.windSpeed<=3.5?r+=14:o.windSpeed<=5?r+=6:r-=15,o.visibility<=4e3&&(r+=12)),Math.min(100,Math.max(0,r))},g=s.map(o=>({hour:o.hour,item:o,score:$(o)})).filter(o=>o.score>=35);if(g.length===0){const o=Math.max(0,a-3),r=Math.min(23,a+1),w=s.filter(K=>K.hour>=o&&K.hour<=r),A=w.length>0?w:s.slice(0,4);let N=0,f=0,H=0,V=99999;A.forEach(K=>{N+=K.spread,f+=K.humidity,H+=K.windSpeed,K.visibility<V&&(V=K.visibility)}),N/=A.length,f/=A.length,H/=A.length;const J=Math.max(10,Math.round(A.reduce((K,ee)=>K+$(ee),0)/A.length)),U=e.civilDawn||(e.sunrise?new Date(e.sunrise.getTime()-45*60*1e3):null),X=e.sunriseEnd||(e.sunrise?new Date(e.sunrise.getTime()+65*60*1e3):null);return{score:J,level:"Lav",text:"Lav tågerisiko – klar sigt over landskabet",icon:"☀️",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Lav risiko",badgeClass:"badge-clear",photoTip:"Gode betingelser for rene, kontrastrige solopgangsbilleder uden slørende tåge.",avgSpread:N.toFixed(1),avgHumidity:Math.round(f),avgWind:H.toFixed(1),minVisibilityKm:(V/1e3).toFixed(1),period:"morning",timeWindowLabel:`ca. ${n.formatTime(U)} - ${n.formatTime(X)}`,startTime:U,endTime:X}}const y=g.filter(o=>o.hour<=a-2||o.hour>=h+2),k=g.filter(o=>o.hour>=a-1&&o.hour<=a+2),m=g.filter(o=>o.hour>a+2&&o.hour<h-1),x=g.filter(o=>o.hour>=h-1&&o.hour<=h+1);let p="morning",i=g;if(g.length>=9||k.length>=3&&m.length>=3&&x.length>=2)p="all_day",i=g;else{const o=[{period:"night",group:y,weight:y.reduce((r,w)=>r+w.score,0)},{period:"morning",group:k,weight:k.reduce((r,w)=>r+w.score,0)},{period:"evening",group:x,weight:x.reduce((r,w)=>r+w.score,0)},{period:"day",group:m,weight:m.reduce((r,w)=>r+w.score,0)}].filter(r=>r.group.length>0);o.sort((r,w)=>w.weight-r.weight),o.length>0&&(p=o[0].period,i=o[0].group)}let u=0,d=0,T=0,b=99999,v=!1,L=0,P=0;i.forEach(o=>{const r=o.item;u+=r.spread,d+=r.humidity,T+=r.windSpeed,L+=r.cloudLow||0,r.visibility<b&&(b=r.visibility),(r.weatherCode===45||r.weatherCode===48)&&(v=!0),P+=o.score}),u/=i.length,d/=i.length,T/=i.length,L/=i.length;const D=Math.min(100,Math.round(P/i.length)),_=(b/1e3).toFixed(1);let j=null,M=null,S="";const F=o=>o<10?"0"+o:""+o;if(p==="all_day")j=new Date(l.getFullYear(),l.getMonth(),l.getDate(),0,0,0),M=new Date(l.getFullYear(),l.getMonth(),l.getDate(),23,59,59),S="Heldagståge (døgnet rundt)";else if(p==="night"){const o=i.filter(w=>w.hour>=18),r=i.filter(w=>w.hour<12);if(o.length>0&&r.length>0){const w=Math.min(...o.map(N=>N.hour)),A=Math.max(...r.map(N=>N.hour));j=new Date(l.getFullYear(),l.getMonth(),l.getDate(),w,0,0),M=new Date(l.getFullYear(),l.getMonth(),l.getDate()+1,A+1,0,0),S=`kl. ${F(w)}:00 - ${F(A+1)}:00 (i nat)`}else{const w=i.map(f=>f.hour),A=Math.min(...w),N=Math.max(...w);j=new Date(l.getFullYear(),l.getMonth(),l.getDate(),A,0,0),M=new Date(l.getFullYear(),l.getMonth(),l.getDate(),N+1,0,0),S=`kl. ${F(A)}:00 - ${F(N+1)}:00 (i nat)`}}else if(p==="morning"&&e.sunrise){j=e.civilDawn||new Date(l.getFullYear(),l.getMonth(),l.getDate(),Math.min(...i.map(r=>r.hour)),0,0);const o=Math.max(...i.map(r=>r.hour));M=new Date(l.getFullYear(),l.getMonth(),l.getDate(),Math.max(o+1,e.sunrise.getHours()+1),0,0),S=`ca. ${n.formatTime(j)} - ${n.formatTime(M)}`}else{const o=i.map(A=>A.hour),r=Math.min(...o),w=Math.max(...o);j=new Date(l.getFullYear(),l.getMonth(),l.getDate(),r,0,0),M=new Date(l.getFullYear(),l.getMonth(),l.getDate(),w+1,0,0),S=`kl. ${F(r)}:00 - ${F(w+1)}:00`}const E=v||b<=1200||d>=96&&u<=.6&&L>=60||d>=93&&u<=.8&&T>=2.5,Y=D>=75?"Meget høj":D>=55?"Høj":"Moderat",z=D>=55?"high":"moderate";let G="Morgentåge & Dis",C="🌫️",I="Tæt tåge",O="badge-dense-fog",W="",B="";return p==="night"?(G=E?"Tæt Nattåge":"Nattåge & Slør",C="🌃",O="badge-night-fog",I=E?"Nattåge":"Natslør",W=b<1e3?`Tæt tåge over natten (${S}, sigtdybde ca. ${Math.round(b)}m). Gadelygter og billygter skaber markante lyskegler.`:`Tågeslør lægger sig over natten (${S}). Høj stemning med lysspredning fra gadelygter.`,B="Magiske forhold for nat- og gadefotografering! Gadelygter, neonskilte og billygter danner filmiske lyskegler (volumetrisk lys) og en stemningsfuld noir-æstetik på tomme gader og stier."):p==="all_day"?(G="Massiv Heldagståge",C="🌫️",O="badge-all-day",I="Heldagståge",W=`Massiv tåge dækker hele døgnet (${S}) med markant nedsat sigtbarhed (${_} km). Solen forbliver skjult.`,B="Heldags-mulighed for melankolske og grafiske serier. Gå efter ensomme træer, strukturer i tågen og minimalistiske kompositioner med en markant forgrund."):p==="day"?(G=E?"Tæt Dagståge / Havgus":"Dagdis & Slør",C="🌁",O="badge-day-fog",I=E?"Dagståge / Havgus":"Dagdis",W=`Tåge og nedsat sigtbarhed midt på dagen (${S}). Det diffuse dagslys udvisker baggrunde og fjerner hårde skygger.`,B="Perfekt til minimalistisk fotografi, kystlandskaber og rå arkitektur. Det bløde, skyggefrie lys fremhæver former og silhuetter frem for tekstur."):p==="evening"?(G=E?"Tæt Aftentåge":"Aftentåge & Skumring",C="🌆",O="badge-dense-fog",I=E?"Tæt aftentåge":"Aftendis",W=`Tågen trækker ind omkring solnedgang og aften (${S}). Skumringens blå time blandes med tågens bløde lysdække.`,B="Udnyt samspillet mellem det blå skumringslys (den blå time) og tågens spredning af de første tændte vindues- og gadelamper til flotte farvekontraster."):E?(G="Tæt Morgentåge",C="🌫️",O="badge-dense-fog",I=b<1e3?`Tæt tåge (sigt ${Math.round(b)}m)`:"Massiv tåge",W=b<1e3?`Massiv og tæt tåge dækker landskabet ved daggry (${S}, sigtdybde ca. ${Math.round(b)}m). Tykt dække hvor solen næppe trænger igennem.`:`Massiv og tæt morgentåge (${S}) med dæmpet, diffust lys.`,B="Fokusér på minimalistiske kompositioner, grafiske træer, ensomme strukturer og silhuetter før solen brænder igennem."):(G="Morgendis & Jordtåge",C=D>=75?"🌫️":"🌁",O="badge-radiation-mist",I="Morgendis / Mosekonebryg",W=D>=75?`Perfekte betingelser for eventyrlig morgendis over enge og vand ved solopgang (${S})! Høj chance for gyldne solstråler (god rays).`:`Gode chancer for stemningsfuld morgendis og lav jordtåge (${S}) med smuk lagdelt dybde ved solopgang.`,B="Stil dig i modlys mod solopgangen for at fange gyldne lysstråler (god rays) igennem trækroner eller det lave slør over søer og marker."),{score:D,level:Y,text:W,icon:C,classType:z,fogType:E?"dense_fog":"radiation_mist",typeName:G,typeBadge:I,badgeClass:O,photoTip:B,period:p,timeWindowLabel:S,startTime:j,endTime:M,avgSpread:u.toFixed(1),avgHumidity:Math.round(d),avgWind:T.toFixed(1),minVisibilityKm:_}}static calculateGoldenHourQuality(s,e,t){if(!s||!t)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const l=t.getHours(),a=s.find(x=>x.hour===l)||s[l]||s[0],h=a.cloudTotal,$=a.cloudLow,c=a.cloudMid,g=a.cloudHigh;let y=50,k="Pænt lys",m="☀️";return $>=70||h>=85&&$+c>=80?(y=20,k="Tungt lavt skydække blokerer for direkte sollys og gylden glød",m="☁️"):h>=75?(y=35,k="Overvejende overskyet – diffust og dæmpet lys ved horisonten",m="☁️"):h<=15?(y=85,k="Klar himmel – rent gyldent lys og skarpe lange skygger",m="🌅"):$<=30&&c+g>=30&&c+g<=75?(y=95,k="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",m="🔥"):h<=50?(y=75,k="Gode forhold med dynamiske lysstriber gennem spredte skyer",m="🌤️"):(y=45,k="Vekslende skydække med diffuse lysforhold",m="⛅"),{score:y,text:k,icon:m,clouds:{total:h,low:$,mid:c,high:g}}}static calculateAstroScore(s,e,t,l,a,h,$){const c=e.astronomicalDusk&&e.astronomicalDawn;let g;$&&$.length>0?g=[...s.filter(v=>v.hour>=22),...$.filter(v=>v.hour<=4)]:g=s.filter(v=>v.hour>=22||v.hour<=4),g.length===0&&(g=s.slice(0,4));let y=0,k=0;g.forEach(v=>{y+=v.cloudTotal,k+=v.cloudLow}),y/=g.length,k/=g.length;const m=Math.round(y);let x=0;g.forEach(v=>{const L=new Date(h.getFullYear(),h.getMonth(),h.getDate()+(v.hour<=4?1:0),v.hour,0,0);try{const P=R.getMoonPosition(L,l,a);P&&P.altitude>0&&x++}catch{}});let p=100;m<=10?p-=m*.5:m<=30?p-=5+(m-10)*1:m<=60?p-=25+(m-30)*1.5:p-=70+(m-60)*.7,p-=k*.25;let i="";x===0?i="Månen er under horisonten hele natten (ingen måneforstyrrelse)":t.fraction<=15?i=`Nymåne / ultrasvagt segl (${t.fraction}%) – intet generende måneskin`:t.fraction<=45?(p-=Math.round(t.fraction/100*15),i=`Svag månefase (${t.fraction}%) – kun moderat lyspåvirkning`):(p-=Math.round(t.fraction/100*35),i=`Kraftigt måneskin (${t.fraction}%) oplyser natten og udvisker svage stjerner`),c||(p=Math.min(p,50),i+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const u=Math.min(100,Math.max(0,Math.round(p)));let d="Ugunstig",T="☁️",b="";return m>=75?(d="Ugunstig",T="☁️",b=`Tæt skydække (${m}%) dækker himlen i nat.`):m>=50?(d="Svag",T="⛅",b=`Overvejende skyet (${m}%). Kun spredte kighuller til enkelte klare stjerner.`):m>=25?(d="Moderat",T="✨",b=`Gode observationsforhold med lette slørskyer (${m}%).`):(d="Fremragende",T="🌌",b=`Krystalklar nattehimmel (${m}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:u,status:d,icon:T,text:b,roundClouds:m,moonImpact:i}}static getWeatherCodeDescription(s){switch(s){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}static getEventTiming(s,e,t,l,a,h=50,$){const c=$||n.getDate()||new Date,g=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],y=typeof h=="number"?h:50;if(t===0){if(s&&e&&c>=s&&c<=e){const p=e.getTime()-c.getTime(),i=n.formatDuration(p);let u="banner-active",d="🟢",T="Aktiv nu",b=`Aktiv lige nu • Slutter om ${i}`,v=`Aktiv lige nu (slutter kl. ${n.formatTime(e)})`;return a==="astro"?y>=65?(u="banner-active",d="✨",T="Aktiv nu",b=`Gode stjerneforhold nu • Slutter om ${i}`,v=`Astronomisk nat aktiv lige nu (slutter kl. ${n.formatTime(e)})`):y>=40?(u="banner-active-moderate",d="⛅",T="Moderat nu",b=`Astronomisk nat aktiv • Vekslende skydække (slutter om ${i})`,v=`Mørke i gang (kl. ${n.formatTime(e)}) • Skiftende skyer`):(u="banner-active-poor",d="☁️",T="Overskyet nu",b=`Astronomisk nat er i gang • Desværre overskyet (slutter om ${i})`,v=`Mørke i gang (kl. ${n.formatTime(e)}) • Dækket af skyer`):a==="fog"?y>=55?(u="banner-active",d="🌫️",T="Aktiv nu",b=`Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${i})`,v=`Tågevindue aktivt lige nu (slutter kl. ${n.formatTime(e)})`):y>=35?(u="banner-active-moderate",d="🌁",T="Moderat nu",b=`Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${i})`,v=`Tidsvindue aktivt (slutter kl. ${n.formatTime(e)})`):(u="banner-active-poor",d="☀️",T="Klar sigt",b=`Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${i})`,v=`Morgenstund i gang (slutter kl. ${n.formatTime(e)}) • Ingen tåge`):a==="morning"?y>=65?(u="banner-active",d="🌅",T="Aktiv nu",b=`Gylden time aktiv lige nu • Flot morgenlys (slutter om ${i})`,v=`Daggry i gang nu (slutter kl. ${n.formatTime(e)})`):y>=40?(u="banner-active-moderate",d="🌤️",T="Vekslende nu",b=`Morgenlys aktivt nu • Vekslende skydække (slutter om ${i})`,v=`Morgenlys i gang (slutter kl. ${n.formatTime(e)})`):(u="banner-active-poor",d="☁️",T="Overskyet nu",b=`Morgentime i gang • Solen skjult af skydække (slutter om ${i})`,v="Morgenlys i gang, men dækket af skyer"):a==="evening"&&(y>=65?(u="banner-active",d="🌆",T="Aktiv nu",b=`Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${i})`,v=`Aktiv solnedgang lige nu (slutter kl. ${n.formatTime(e)})`):y>=40?(u="banner-active-moderate",d="🌤️",T="Moderat nu",b=`Aftenlys i gang • Vekslende skydække (slutter om ${i})`,v=`Solnedgang i gang (slutter kl. ${n.formatTime(e)})`):(u="banner-active-poor",d="☁️",T="Overskyet nu",b=`Solnedgang i gang • Skjult bag tungt skydække (slutter om ${i})`,v="Solnedgang i gang, men skjult bag skyer")),{status:"active",bannerClass:u,icon:d,pill:T,label:b,sub:v,isPassed:!1}}if(e&&c>e){const p=c.getTime()-e.getTime(),i=n.formatDuration(p);let u=`I morges • For ${i} siden`,d=`Afsluttet i morges (for ${i} siden)`;return a==="fog"?(u=`Tågevindue afsluttet • For ${i} siden`,d=`Afsluttet kl. ${n.formatTime(e)} (for ${i} siden)`):a==="evening"?(u=`I aften • For ${i} siden`,d=`Afsluttet i aften kl. ${n.formatTime(e)}`):a==="astro"&&(u="Natten er ovre",d=`Astronomisk nat afsluttet kl. ${n.formatTime(e)}`),{status:"passed",bannerClass:"banner-passed",icon:"⏳",pill:"Passeret",label:u,sub:d,isPassed:!0}}if(s&&c<s){const p=s.getTime()-c.getTime(),i=n.formatDuration(p);let u=`I dag • Om ${i}`,d=`Starter kl. ${n.formatTime(s)} (om ${i})`;return a==="evening"?(u=y>=65?`I aften • Om ${i} (flot aftenlys)`:`I aften • Om ${i}`,d=`Starter i aften kl. ${n.formatTime(s)} (om ${i})`):a==="astro"?(u=y>=65?`I aften/nat • Om ${i} (klare stjerneforhold)`:y<=35?`I aften/nat • Om ${i} (forventet overskyet)`:`I aften/nat • Om ${i}`,d=`Astronomisk nat starter kl. ${n.formatTime(s)} (om ${i})`):a==="fog"?(u=`Tågevindue senere i dag • Om ${i}`,d=`Forventes kl. ${n.formatTime(s)} (om ${i})`):a==="morning"&&(u=`I dag ved daggry • Om ${i}`),{status:"upcoming",bannerClass:"banner-upcoming",icon:"⏱️",pill:"Kommende",label:u,sub:d,isPassed:!1}}}if(t===1){const p=s?Math.max(0,s.getTime()-c.getTime()):0,i=n.formatDuration(p);let u=`I morgen • Om ${i}`,d=`I morgen kl. ${s?n.formatTime(s):"--:--"}`;return a==="fog"?(u=`Tågevindue i morgen • Om ${i}`,d=`I morgen kl. ${n.formatTime(s)} (om ${i})`):a==="morning"?(u=`I morgen tidlig • Om ${i}`,d=`I morgen kl. ${n.formatTime(s)} (om ${i})`):a==="evening"?(u=`I morgen aften • Om ${i}`,d=`I morgen kl. ${n.formatTime(s)} (om ${i})`):a==="astro"&&(u=`I morgen nat • Om ${i}`,d=`I morgen nat fra kl. ${n.formatTime(s)}`),{status:"future",bannerClass:"banner-future",icon:"📅",pill:"I morgen",label:u,sub:d,isPassed:!1}}const k=g[l.getDay()];let m=`${k} • Om ${t} dage`,x=`${k}`;return a==="fog"?(m=`${k} • Om ${t} dage`,x=`${k} kl. ${s?n.formatTime(s):"--:--"}`):a==="morning"?(m=`${k} morgen • Om ${t} dage`,x=`${k} kl. ${s?n.formatTime(s):"06:00"}`):a==="evening"?(m=`${k} aften • Om ${t} dage`,x=`${k} kl. ${s?n.formatTime(s):"18:00"}`):a==="astro"&&(m=`${k} nat • Om ${t} dage`,x=`${k} nat`),{status:"future-distant",bannerClass:"banner-future",icon:"📅",pill:k,label:m,sub:x,isPassed:!1}}}class oe{container;currentLocation=Q.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(s){this.container=s,this.currentLocation=Q.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=Q.subscribe(async e=>{this.currentLocation=e,await this.loadWeather(!1)})}onActivate(s){if(s?.params){const e=s.params;e.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(e.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
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
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const s=this.container.querySelector("#weatherStatusBanner"),e=this.container.querySelector("#weatherStatusTime");s&&(this.isCachedForecast&&this.cacheUpdatedAt?(s.classList.add("active"),e&&(e.textContent=`Hentet kl. ${n.formatTime(this.cacheUpdatedAt)}`)):s.classList.remove("active"))}selectDay(s){this.selectedDayIndex=Math.min(6,Math.max(0,s));const e=this.container.querySelector("#weatherDaysScroll");e&&(e.querySelectorAll(".day-tab-card").forEach(t=>t.classList.remove("active")),e.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add("active")),this.renderSelectedDay()}renderDaysScroll(){const s=this.container.querySelector("#weatherDaysScroll");!s||this.parsedDays.length===0||(s.innerHTML=this.parsedDays.map((e,t)=>{const a=t===0?"I dag":e.dayName.substring(0,3),h=q.getWeatherCodeDescription(e.weatherCode);return`
        <div class="day-tab-card ${t===this.selectedDayIndex?"active":""}" data-day="${t}">
          <span class="day-name">${a}</span>
          <span class="day-date">${e.date.getDate()}</span>
          <span class="day-icon">${h.icon}</span>
          <span class="day-temp-range">${Math.round(e.minTemp)}° / ${Math.round(e.maxTemp)}°</span>
        </div>
      `}).join(""),s.querySelectorAll("[data-day]").forEach(e=>{e.addEventListener("click",()=>{const t=Number(e.dataset.day);this.selectDay(t)})}))}renderSelectedDay(){const s=this.container.querySelector("#weatherSelectedDayWrap");if(!s||!this.parsedDays[this.selectedDayIndex])return;const e=this.parsedDays[this.selectedDayIndex],t=e.sun,l=e.moon,a=e.fog,h=e.goldenHourMorning,$=e.goldenHourEvening,c=e.astro,g=n.getDate()||new Date,y=this.selectedDayIndex===0,k=this.selectedDayIndex===1,m=a.startTime||t.civilDawn||(t.sunrise?new Date(t.sunrise.getTime()-45*60*1e3):null),x=a.endTime||t.sunriseEnd||(t.sunrise?new Date(t.sunrise.getTime()+65*60*1e3):null),p=q.getEventTiming(m,x,this.selectedDayIndex,e.date,"fog",a.score,g),i=t.blueHourMorning&&t.blueHourMorning.start||(t.sunrise?new Date(t.sunrise.getTime()-50*60*1e3):null),u=t.goldenHourMorning&&t.goldenHourMorning.end||(t.sunrise?new Date(t.sunrise.getTime()+45*60*1e3):null),d=q.getEventTiming(i,u,this.selectedDayIndex,e.date,"morning",h.score,g),T=t.goldenHourEvening&&t.goldenHourEvening.start||(t.sunset?new Date(t.sunset.getTime()-45*60*1e3):null),b=t.blueHourEvening&&t.blueHourEvening.end||(t.sunset?new Date(t.sunset.getTime()+45*60*1e3):null),v=q.getEventTiming(T,b,this.selectedDayIndex,e.date,"evening",$.score,g);let L=null,P=null;t.astronomicalDusk&&(y&&t.astronomicalDawn&&g<t.astronomicalDawn?(L=new Date(t.astronomicalDusk.getTime()-24*60*60*1e3),P=t.astronomicalDawn):(L=t.astronomicalDusk,P=t.astronomicalDawn?new Date(t.astronomicalDawn.getTime()+24*60*60*1e3):new Date(L.getTime()+9*60*60*1e3)));const D=q.getEventTiming(L,P,this.selectedDayIndex,e.date,"astro",c.score,g),_=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];let j="",M="";if(y)j=`I dag (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${_[e.date.getMonth()]})`,t.sunset&&g>t.sunset?M="Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys":p.status==="active"?M=a.score>=50?`Aktuel nu: ${a.typeName} (${a.timeWindowLabel||"aktiv lige nu"})`:`Aktuel nu: ${a.typeName}`:d.status==="active"?M=h.score>=50?"Aktuel lige nu: Daggry & gylden time!":"Aktuel lige nu: Daggry (skydækket morgen)":v.status==="active"?M=$.score>=50?"Aktuel lige nu: Solnedgang & aftenlys!":"Aktuel lige nu: Solnedgang (skjult bag skyer)":T&&g<T?M=`Næste: Gylden time i aften kl. ${n.formatTime(T)} (om ${n.formatDuration(T.getTime()-g.getTime())})`:L&&g<L?M=c.score>=60?`Næste: Stjernehimmel i aften kl. ${n.formatTime(L)} (om ${n.formatDuration(L.getTime()-g.getTime())})`:`Næste: Astronomisk mørke i aften kl. ${n.formatTime(L)} (om ${n.formatDuration(L.getTime()-g.getTime())})`:M="Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";else if(k){j=`I morgen (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${_[e.date.getMonth()]})`;const f=t.blueHourMorning?.start||t.sunrise,H=f?Math.max(0,f.getTime()-g.getTime()):0;M=`Første fotomulighed: Daggry kl. ${n.formatTime(f)} (om ${n.formatDuration(H)}) • Vejrudsigt for i morgen`}else j=`${e.dayName} d. ${e.date.getDate()}. ${_[e.date.getMonth()]}`,M=`7-dages vejrudsigt for ${this.currentLocation.name}`;const S=f=>f>=70?"score-high":f>=40?"score-moderate":"score-low",F=f=>`
      <div class="card-timing-banner ${f.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${f.icon}</span>
          <span class="timing-label">${f.label}</span>
        </div>
        <span class="timing-banner-pill">${f.pill}</span>
      </div>
    `,E=(f,H,V)=>!f||!y||this.parsedDays.length<=1?"":`
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${H}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${V} ➔</button>
        </div>
      `;let Y=`${n.formatTime(t.sunrise)} / ${n.formatTime(t.sunset)}`,z="Solopgang • Solnedgang",G=`<span style="color:var(--golden-primary);">Gylden: ${n.formatTime(t.goldenHourEvening?.start)} - ${n.formatTime(t.sunset)}</span>`;if(y)if(t.sunset&&g>t.sunset)Y+=' <span class="time-passed-tag">Passeret</span>',z="Solopgang • Solnedgang (dagens soltimer er forbi)",G=`<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;else if(t.sunrise&&g>t.sunrise){z=`Solopgang var for ${n.formatDuration(g.getTime()-t.sunrise.getTime())} siden`;const f=t.goldenHourEvening?.start||t.sunset?n.formatDuration((t.goldenHourEvening?.start||t.sunset).getTime()-g.getTime()):"";G=`<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${n.formatTime(t.goldenHourEvening?.start||t.sunset)} (om ${f})</span>`}else{const f=t.sunrise?n.formatDuration(t.sunrise.getTime()-g.getTime()):"";z=`Solopgang i morges/dag kl. ${n.formatTime(t.sunrise)} (om ${f})`}else k&&(z=`Solopgang i morgen kl. ${n.formatTime(t.sunrise)} • Solnedgang kl. ${n.formatTime(t.sunset)}`);const C=e.moonTimes?.riseAzimuth,I=e.moonTimes?.setAzimuth,O=C!=null?` (${C.toFixed(0)}° ${R.getCompassDirection(C)})`:"",W=I!=null?` (${I.toFixed(0)}° ${R.getCompassDirection(I)})`:"";let B=`Op: ${n.formatTime(e.moonTimes?.rise)}${O} • Ned: ${n.formatTime(e.moonTimes?.set)}${W}`;if(y){const f=e.moonTimes?.rise?g>e.moonTimes.rise?`Op kl. ${n.formatTime(e.moonTimes.rise)}${O}`:`Op kl. ${n.formatTime(e.moonTimes.rise)}${O} (om ${n.formatDuration(e.moonTimes.rise.getTime()-g.getTime())})`:"Går ikke op",H=e.moonTimes?.set?`Ned kl. ${n.formatTime(e.moonTimes.set)}${W}`:"Går ikke ned";B=`${f} • ${H}`}else k&&(B=`I morgen: Op kl. ${n.formatTime(e.moonTimes?.rise)}${O} • Ned kl. ${n.formatTime(e.moonTimes?.set)}${W}`);const o=g.getHours(),r=t.sunrise?R.getSunPosition(t.sunrise,this.currentLocation.lat,this.currentLocation.lng):null,w=t.sunset?R.getSunPosition(t.sunset,this.currentLocation.lat,this.currentLocation.lng):null,A=r?`${r.azimuth.toFixed(0)}° ${R.getCompassDirection(r.azimuth)}`:"",N=w?`${w.azimuth.toFixed(0)}° ${R.getCompassDirection(w.azimuth)}`:"";s.innerHTML=`
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
          <div class="weather-day-banner-title">${j}</div>
          <div class="weather-day-banner-sub">${M}</div>
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
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${t.nightSky?.start?`${n.formatTime(t.nightSky.start)} - ${n.formatTime(t.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis / Tæt Tåge -->
        <div class="photo-card ${p.isPassed?"card-event-passed":""}">
          ${F(p)}
          <div class="photo-card-top">
            <span class="photo-card-title">${a.icon} ${a.typeName||"Morgentåge & Dis"}</span>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
              ${a.typeBadge?`<span class="photo-type-badge ${a.badgeClass||""}">${a.typeBadge}</span>`:""}
              <span class="photo-score-badge ${S(a.score)}">${a.score}/100 • ${a.level}</span>
            </div>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ${a.timeWindowLabel||`ca. ${n.formatTime(m)} - ${n.formatTime(x)}`}
            ${p.isPassed?'<span class="time-passed-tag">Afsluttet</span>':`• ${p.sub}`}
          </div>
          <div class="photo-card-desc">${a.text}</div>
          ${a.photoTip?`<div class="photo-card-tip">💡 <strong>Fototip:</strong> ${a.photoTip}</div>`:""}
          ${E(p.isPassed,"Tågeperioden er overstået for i dag. Tjek i morgen?","Se tåge i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${a.avgSpread}°C • Fugt: ${a.avgHumidity}% • Vind: ${a.avgWind} m/s • Sigt: ${a.minVisibilityKm} km</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card ${d.isPassed?"card-event-passed":""}">
          ${F(d)}
          <div class="photo-card-top">
            <span class="photo-card-title">${h.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${S(h.score)}">${h.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${n.formatTime(t.sunrise)} - ${n.formatTime(t.goldenHourMorning?.end)}
            ${A?`<span class="compass-direction-tag" title="Solens kompasretning ved solopgang">🧭 ${A}</span>`:""}
            ${d.isPassed?`<span class="time-passed-tag">Passeret (kl. ${n.formatTime(t.sunrise)})</span>`:`• ${d.sub}`}
          </div>
          <div class="photo-card-desc">${h.text}</div>
          ${E(d.isPassed,"Morgenens gyldne time fandt sted i morges. Tjek i morgen?","Se daggry i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${h.clouds.total}% (Lav: ${h.clouds.low}%, Mellem: ${h.clouds.mid}%, Høj: ${h.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${t.sunrise?t.sunrise.getTime():e.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card ${v.isPassed?"card-event-passed":""}">
          ${F(v)}
          <div class="photo-card-top">
            <span class="photo-card-title">${$.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${S($.score)}">${$.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${n.formatTime(t.goldenHourEvening?.start)} - ${n.formatTime(t.sunset)}
            ${N?`<span class="compass-direction-tag" title="Solens kompasretning ved solnedgang">🧭 ${N}</span>`:""}
            ${v.isPassed?'<span class="time-passed-tag">Passeret i aften</span>':`• ${v.sub}`}
          </div>
          <div class="photo-card-desc">${$.text}</div>
          ${E(v.isPassed,"Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?","Se solnedgang i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${$.clouds.total}% (Lav: ${$.clouds.low}%, Mellem: ${$.clouds.mid}%, Høj: ${$.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${t.sunset?t.sunset.getTime():e.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card ${D.isPassed?"card-event-passed":""}">
          ${F(D)}
          <div class="photo-card-top">
            <span class="photo-card-title">${c.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${S(c.score)}">${c.score}/100 • ${c.status}</span>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${t.nightSky?.start?`${n.formatTime(t.nightSky.start)} - ${n.formatTime(t.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}
            ${D.isPassed?'<span class="time-passed-tag">Natten er ovre</span>':`• ${D.sub}`}
          </div>
          <div class="photo-card-desc">${c.text}</div>
          ${E(D.isPassed,"Astronomisk mørke for denne nat er ovre. Tjek næste nat?","Se stjernehimmel i morgen")}
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
            ${e.hourly.map(f=>{let H="hourly-col",V=`<span class="hour-badge">${String(f.hour).padStart(2,"0")}:00</span>`;return y&&(f.hour<o?(H+=" hourly-past-hour",V+='<span class="hour-past-pill">forbi</span>'):f.hour===o&&(H+=" hourly-current-hour",V+='<span class="hour-now-badge">NU</span>')),`
                <div class="${H}">
                  ${V}
                  <span>${f.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(f.temp)}°</span>
                  <span class="hour-clouds">☁️ ${f.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${f.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(f.visibility/1e3).toFixed(0)}km</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    `,s.querySelectorAll(".btn-jump-tomorrow").forEach(f=>{f.addEventListener("click",()=>{const H=Number(f.dataset.jumpDay??1);this.selectDay(H)})}),s.querySelectorAll(".btn-goto-sol, .btn-goto-fotosol").forEach(f=>{f.addEventListener("click",()=>{const H=f,V=Number(H.dataset.time),J=H.dataset.body||"sun",U=new Date(V);n.setDate(U),te.navigate("#/sol",{date:U,body:J,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{oe as default};
