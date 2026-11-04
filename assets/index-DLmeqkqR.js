import{R as ne}from"./index-Bsgm7VHM.js";import{A as K,T as n,L as Q,a as ae}from"./LocationBar-CZCNmsGQ.js";const ie="photoweather_cache_v2_";class z{static async fetchForecast(s,e,t=!1){const d=`${ie}${s.toFixed(4)}_${e.toFixed(4)}`;let a=null;try{const m=localStorage.getItem(d);m&&(a=JSON.parse(m))}catch(m){console.warn("Kunne ikke læse vejr-cache:",m)}const p=Date.now();if(!t&&a&&a.timestamp&&p-a.timestamp<1e3*60*60*2)return{forecast:a.data,isCached:!0,updatedAt:new Date(a.timestamp)};const $=`https://api.open-meteo.com/v1/forecast?latitude=${s.toFixed(4)}&longitude=${e.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const m=await fetch($);if(!m.ok)throw new Error(`Open-Meteo svarede med status ${m.status}`);const g=await m.json();try{localStorage.setItem(d,JSON.stringify({timestamp:p,data:g}))}catch(v){console.warn("Kunne ikke gemme vejr i localStorage:",v)}return{forecast:g,isCached:!1,updatedAt:new Date(p)}}catch(m){if(a&&a.data)return{forecast:a.data,isCached:!0,updatedAt:new Date(a.timestamp)};throw m}}static parseDayData(s,e,t,d){if(!s?.hourly?.time||!s?.daily?.time)return null;const a=s.daily.time[e];if(!a)return null;const p=a.split("-"),$=new Date(Number(p[0]),Number(p[1])-1,Number(p[2]),12,0,0),m=K.getSunTimes($,t,d),g=K.getMoonIllumination($),v=K.getMoonTimes($,t,d),k=s.hourly.time,u=[],H=[],T=`${a}T`,l=s.daily.time[e+1],c=l?`${l}T`:null,r=(D,E)=>{const j=Number(E.substring(11,13)),A=s.hourly.temperature_2m[D],_=s.hourly.dew_point_2m[D],F=s.hourly.weather_code[D],x=this.getWeatherCodeDescription(F);return{time:E,hour:j,temp:A,apparentTemp:s.hourly.apparent_temperature[D],humidity:s.hourly.relative_humidity_2m[D],dewPoint:_,spread:+(A-_).toFixed(1),precipProb:s.hourly.precipitation_probability[D],precipMm:s.hourly.precipitation[D],weatherCode:F,weatherDesc:x.desc,weatherIcon:x.icon,cloudTotal:s.hourly.cloud_cover[D],cloudLow:s.hourly.cloud_cover_low[D],cloudMid:s.hourly.cloud_cover_mid[D],cloudHigh:s.hourly.cloud_cover_high[D],visibility:s.hourly.visibility[D],windSpeed:s.hourly.wind_speed_10m[D],windDir:s.hourly.wind_direction_10m[D],windGusts:s.hourly.wind_gusts_10m[D]}};for(let D=0;D<k.length;D++){const E=k[D];E.startsWith(T)?u.push(r(D,E)):c&&E.startsWith(c)&&Number(E.substring(11,13))<=4&&H.push(r(D,E))}const b=this.calculateFogRisk(u,m,$),w=this.calculateGoldenHourQuality(u,m.goldenHourMorning,m.sunrise),f=this.calculateGoldenHourQuality(u,m.goldenHourEvening,m.sunset),M=this.calculateAstroScore(u,m,g,t,d,$,H);return{date:$,dayIndex:e,dateStr:a,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][$.getDay()],maxTemp:s.daily.temperature_2m_max[e],minTemp:s.daily.temperature_2m_min[e],weatherCode:s.daily.weather_code[e],weatherDesc:this.getWeatherCodeDescription(s.daily.weather_code[e]).desc,sun:m,moon:g,moonTimes:v,fog:b,goldenHourMorning:w,goldenHourEvening:f,astro:M,hourly:u}}static calculateFogRisk(s,e,t){const d=t||(e.sunrise?new Date(e.sunrise.getTime()):new Date);if(!s||s.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Ingen data",badgeClass:"badge-clear",photoTip:"Ingen vejrmeldinger tilgængelige.",avgSpread:"0.0",avgHumidity:0,avgWind:"0.0",minVisibilityKm:"0.0",period:"none",timeWindowLabel:"Ingen data",startTime:null,endTime:null};const a=e.sunrise?e.sunrise.getHours():6,p=e.sunset?e.sunset.getHours():18,$=i=>{const h=i.weatherCode===45||i.weatherCode===48,y=typeof i.visibility=="number"?i.visibility:1e4;if(!h&&y>=1e4)return 10;if(!h&&y>=6e3)return 20;let o=0;i.spread<=.5?o+=35:i.spread<=1.2?o+=25:i.spread<=2?o+=15:i.spread<=3&&(o+=5),i.humidity>=96?o+=25:i.humidity>=92?o+=18:i.humidity>=88?o+=10:i.humidity>=80&&(o+=5),h||y<=1e3?(i.windSpeed<=3?o+=20:i.windSpeed<=5?o+=12:i.windSpeed<=7?o+=5:o-=10,o+=20):(i.windSpeed<=2?o+=20:i.windSpeed<=3.5?o+=12:i.windSpeed<=5?o+=5:o-=15,y<=4500&&(o+=8));let L=Math.min(100,Math.max(0,o));return h||(y>5e3?L=Math.min(L,25):y>3500?L=Math.min(L,45):y>1500&&(L=Math.min(L,70))),L},g=s.map(i=>({hour:i.hour,item:i,score:$(i)})).filter(i=>i.score>=35);if(g.length===0){const i=Math.max(0,a-3),h=Math.min(23,a+1),y=s.filter(V=>V.hour>=i&&V.hour<=h),o=y.length>0?y:s.slice(0,4);let S=0,L=0,J=0,U=99999;o.forEach(V=>{S+=V.spread,L+=V.humidity,J+=V.windSpeed,V.visibility<U&&(U=V.visibility)}),S/=o.length,L/=o.length,J/=o.length;const te=Math.max(10,Math.round(o.reduce((V,se)=>V+$(se),0)/o.length)),X=e.civilDawn||(e.sunrise?new Date(e.sunrise.getTime()-45*60*1e3):null),Z=e.sunriseEnd||(e.sunrise?new Date(e.sunrise.getTime()+65*60*1e3):null);return{score:te,level:"Lav",text:"Lav tågerisiko – klar sigt over landskabet",icon:"☀️",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Lav risiko",badgeClass:"badge-clear",photoTip:"Gode betingelser for rene, kontrastrige solopgangsbilleder uden slørende tåge.",avgSpread:S.toFixed(1),avgHumidity:Math.round(L),avgWind:J.toFixed(1),minVisibilityKm:(U/1e3).toFixed(1),period:"morning",timeWindowLabel:`ca. ${n.formatTime(X)} - ${n.formatTime(Z)}`,startTime:X,endTime:Z}}const v=g.filter(i=>i.hour<=a-2||i.hour>=p+2),k=g.filter(i=>i.hour>=a-1&&i.hour<=a+2),u=g.filter(i=>i.hour>a+2&&i.hour<p-1),H=g.filter(i=>i.hour>=p-1&&i.hour<=p+1),T=u.filter(i=>i.hour>=11&&i.hour<=15),l=T.some(i=>i.item.weatherCode===45||i.item.weatherCode===48||i.item.visibility<=1500);let c="morning",r=g;if(g.length>=8&&l&&T.length>=3)c="all_day",r=g;else{const i=[{period:"morning",group:k,weight:k.reduce((h,y)=>h+y.score,0)},{period:"night",group:v,weight:v.reduce((h,y)=>h+y.score,0)},{period:"evening",group:H,weight:H.reduce((h,y)=>h+y.score,0)},{period:"day",group:u,weight:u.reduce((h,y)=>h+y.score,0)}].filter(h=>h.group.length>0);i.sort((h,y)=>y.weight-h.weight),i.length>0&&(c=i[0].period,r=i[0].group)}let b=0,w=0,f=0,M=99999,O=!1,D=0,E=0;r.forEach(i=>{const h=i.item;b+=h.spread,w+=h.humidity,f+=h.windSpeed,D+=h.cloudLow||0,h.visibility<M&&(M=h.visibility),(h.weatherCode===45||h.weatherCode===48)&&(O=!0),E+=i.score}),b/=r.length,w/=r.length,f/=r.length,D/=r.length;const j=Math.min(100,Math.round(E/r.length)),A=(M/1e3).toFixed(1);let _=null,F=null,x="";const R=i=>i<10?"0"+i:""+i;if(c==="all_day")_=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0),F=new Date(d.getFullYear(),d.getMonth(),d.getDate(),23,59,59),x="Heldagståge (døgnet rundt)";else if(c==="night"){const i=r.filter(y=>y.hour>=18),h=r.filter(y=>y.hour<12);if(i.length>0&&h.length>0){const y=Math.min(...i.map(S=>S.hour)),o=Math.max(...h.map(S=>S.hour));_=new Date(d.getFullYear(),d.getMonth(),d.getDate(),y,0,0),F=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,o+1,0,0),x=`kl. ${R(y)}:00 - ${R(o+1)}:00 (i nat)`}else{const y=r.map(L=>L.hour),o=Math.min(...y),S=Math.max(...y);_=new Date(d.getFullYear(),d.getMonth(),d.getDate(),o,0,0),F=new Date(d.getFullYear(),d.getMonth(),d.getDate(),S+1,0,0),x=`kl. ${R(o)}:00 - ${R(S+1)}:00 (i nat)`}}else if(c==="morning"&&e.sunrise){_=e.civilDawn||new Date(d.getFullYear(),d.getMonth(),d.getDate(),Math.min(...r.map(h=>h.hour)),0,0);const i=Math.max(...r.map(h=>h.hour));F=new Date(d.getFullYear(),d.getMonth(),d.getDate(),Math.max(i+1,e.sunrise.getHours()+1),0,0),x=`ca. ${n.formatTime(_)} - ${n.formatTime(F)}`}else{const i=r.map(o=>o.hour),h=Math.min(...i),y=Math.max(...i);_=new Date(d.getFullYear(),d.getMonth(),d.getDate(),h,0,0),F=new Date(d.getFullYear(),d.getMonth(),d.getDate(),y+1,0,0),x=`kl. ${R(h)}:00 - ${R(y+1)}:00`}const C=O||M<=1200||w>=96&&b<=.6&&D>=60||w>=93&&b<=.8&&f>=2.5,Y=j>=75?"Meget høj":j>=55?"Høj":"Moderat",q=j>=55?"high":"moderate";let N="Morgentåge & Dis",I="🌫️",P="Tæt tåge",G="badge-dense-fog",B="",W="";return c==="night"?(N=C?"Tæt Nattåge":"Nattåge & Slør",I="🌃",G="badge-night-fog",P=C?"Nattåge":"Natslør",B=M<1e3?`Tæt tåge over natten (${x}, sigtdybde ca. ${Math.round(M)}m). Gadelygter og billygter skaber markante lyskegler.`:`Tågeslør lægger sig over natten (${x}). Høj stemning med lysspredning fra gadelygter.`,W="Magiske forhold for nat- og gadefotografering! Gadelygter, neonskilte og billygter danner filmiske lyskegler (volumetrisk lys) og en stemningsfuld noir-æstetik på tomme gader og stier."):c==="all_day"?(N="Massiv Heldagståge",I="🌫️",G="badge-all-day",P="Heldagståge",B=`Massiv tåge dækker hele døgnet (${x}) med markant nedsat sigtbarhed (${A} km). Solen forbliver skjult.`,W="Heldags-mulighed for melankolske og grafiske serier. Gå efter ensomme træer, strukturer i tågen og minimalistiske kompositioner med en markant forgrund."):c==="day"?(N=C?"Tæt Dagståge / Havgus":"Dagdis & Slør",I="🌁",G="badge-day-fog",P=C?"Dagståge / Havgus":"Dagdis",B=`Tåge og nedsat sigtbarhed midt på dagen (${x}). Det diffuse dagslys udvisker baggrunde og fjerner hårde skygger.`,W="Perfekt til minimalistisk fotografi, kystlandskaber og rå arkitektur. Det bløde, skyggefrie lys fremhæver former og silhuetter frem for tekstur."):c==="evening"?(N=C?"Tæt Aftentåge":"Aftentåge & Skumring",I="🌆",G="badge-dense-fog",P=C?"Tæt aftentåge":"Aftendis",B=`Tågen trækker ind omkring solnedgang og aften (${x}). Skumringens blå time blandes med tågens bløde lysdække.`,W="Udnyt samspillet mellem det blå skumringslys (den blå time) og tågens spredning af de første tændte vindues- og gadelamper til flotte farvekontraster."):C?(N="Tæt Morgentåge",I="🌫️",G="badge-dense-fog",P=M<1e3?`Tæt tåge (sigt ${Math.round(M)}m)`:"Massiv tåge",B=M<1e3?`Massiv og tæt tåge dækker landskabet ved daggry (${x}, sigtdybde ca. ${Math.round(M)}m). Tykt dække hvor solen næppe trænger igennem.`:`Massiv og tæt morgentåge (${x}) med dæmpet, diffust lys.`,W="Fokusér på minimalistiske kompositioner, grafiske træer, ensomme strukturer og silhuetter før solen brænder igennem."):(N="Morgendis & Jordtåge",I=j>=75?"🌫️":"🌁",G="badge-radiation-mist",P="Morgendis / Mosekonebryg",B=j>=75?`Perfekte betingelser for eventyrlig morgendis over enge og vand ved solopgang (${x})! Høj chance for gyldne solstråler (god rays).`:`Gode chancer for stemningsfuld morgendis og lav jordtåge (${x}) med smuk lagdelt dybde ved solopgang.`,W="Stil dig i modlys mod solopgangen for at fange gyldne lysstråler (god rays) igennem trækroner eller det lave slør over søer og marker."),{score:j,level:Y,text:B,icon:I,classType:q,fogType:C?"dense_fog":"radiation_mist",typeName:N,typeBadge:P,badgeClass:G,photoTip:W,period:c,timeWindowLabel:x,startTime:_,endTime:F,avgSpread:b.toFixed(1),avgHumidity:Math.round(w),avgWind:f.toFixed(1),minVisibilityKm:A}}static calculateGoldenHourQuality(s,e,t){if(!s||!t)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const d=t.getHours(),a=s.find(H=>H.hour===d)||s[d]||s[0],p=a.cloudTotal,$=a.cloudLow,m=a.cloudMid,g=a.cloudHigh;let v=50,k="Pænt lys",u="☀️";return $>=70||p>=85&&$+m>=80?(v=20,k="Tungt lavt skydække blokerer for direkte sollys og gylden glød",u="☁️"):p>=75?(v=35,k="Overvejende overskyet – diffust og dæmpet lys ved horisonten",u="☁️"):p<=15?(v=85,k="Klar himmel – rent gyldent lys og skarpe lange skygger",u="🌅"):$<=30&&m+g>=30&&m+g<=75?(v=95,k="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",u="🔥"):p<=50?(v=75,k="Gode forhold med dynamiske lysstriber gennem spredte skyer",u="🌤️"):(v=45,k="Vekslende skydække med diffuse lysforhold",u="⛅"),{score:v,text:k,icon:u,clouds:{total:p,low:$,mid:m,high:g}}}static calculateAstroScore(s,e,t,d,a,p,$){const m=e.astronomicalDusk&&e.astronomicalDawn;let g;$&&$.length>0?g=[...s.filter(f=>f.hour>=22),...$.filter(f=>f.hour<=4)]:g=s.filter(f=>f.hour>=22||f.hour<=4),g.length===0&&(g=s.slice(0,4));let v=0,k=0;g.forEach(f=>{v+=f.cloudTotal,k+=f.cloudLow}),v/=g.length,k/=g.length;const u=Math.round(v);let H=0;g.forEach(f=>{const M=new Date(p.getFullYear(),p.getMonth(),p.getDate()+(f.hour<=4?1:0),f.hour,0,0);try{const O=K.getMoonPosition(M,d,a);O&&O.altitude>0&&H++}catch{}});let T=100;u<=10?T-=u*.5:u<=30?T-=5+(u-10)*1:u<=60?T-=25+(u-30)*1.5:T-=70+(u-60)*.7,T-=k*.25;let l="";H===0?l="Månen er under horisonten hele natten (ingen måneforstyrrelse)":t.fraction<=15?l=`Nymåne / ultrasvagt segl (${t.fraction}%) – intet generende måneskin`:t.fraction<=45?(T-=Math.round(t.fraction/100*15),l=`Svag månefase (${t.fraction}%) – kun moderat lyspåvirkning`):(T-=Math.round(t.fraction/100*35),l=`Kraftigt måneskin (${t.fraction}%) oplyser natten og udvisker svage stjerner`),m||(T=Math.min(T,50),l+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");const c=Math.min(100,Math.max(0,Math.round(T)));let r="Ugunstig",b="☁️",w="";return u>=75?(r="Ugunstig",b="☁️",w=`Tæt skydække (${u}%) dækker himlen i nat.`):u>=50?(r="Svag",b="⛅",w=`Overvejende skyet (${u}%). Kun spredte kighuller til enkelte klare stjerner.`):u>=25?(r="Moderat",b="✨",w=`Gode observationsforhold med lette slørskyer (${u}%).`):(r="Fremragende",b="🌌",w=`Krystalklar nattehimmel (${u}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:c,status:r,icon:b,text:w,roundClouds:u,moonImpact:l}}static getWeatherCodeDescription(s){switch(s){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}static getEventTiming(s,e,t,d,a,p=50,$){const m=$||n.getDate()||new Date,g=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],v=typeof p=="number"?p:50;if(t===0){if(s&&e&&m>=s&&m<=e){const T=e.getTime()-m.getTime(),l=n.formatDuration(T);let c="banner-active",r="🟢",b="Aktiv nu",w=`Aktiv lige nu • Slutter om ${l}`,f=`Aktiv lige nu (slutter kl. ${n.formatTime(e)})`;return a==="astro"?v>=65?(c="banner-active",r="✨",b="Aktiv nu",w=`Gode stjerneforhold nu • Slutter om ${l}`,f=`Astronomisk nat aktiv lige nu (slutter kl. ${n.formatTime(e)})`):v>=40?(c="banner-active-moderate",r="⛅",b="Moderat nu",w=`Astronomisk nat aktiv • Vekslende skydække (slutter om ${l})`,f=`Mørke i gang (kl. ${n.formatTime(e)}) • Skiftende skyer`):(c="banner-active-poor",r="☁️",b="Overskyet nu",w=`Astronomisk nat er i gang • Desværre overskyet (slutter om ${l})`,f=`Mørke i gang (kl. ${n.formatTime(e)}) • Dækket af skyer`):a==="fog"?v>=55?(c="banner-active",r="🌫️",b="Aktiv nu",w=`Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${l})`,f=`Tågevindue aktivt lige nu (slutter kl. ${n.formatTime(e)})`):v>=35?(c="banner-active-moderate",r="🌁",b="Moderat nu",w=`Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${l})`,f=`Tidsvindue aktivt (slutter kl. ${n.formatTime(e)})`):(c="banner-active-poor",r="☀️",b="Klar sigt",w=`Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${l})`,f=`Morgenstund i gang (slutter kl. ${n.formatTime(e)}) • Ingen tåge`):a==="morning"?v>=65?(c="banner-active",r="🌅",b="Aktiv nu",w=`Gylden time aktiv lige nu • Flot morgenlys (slutter om ${l})`,f=`Daggry i gang nu (slutter kl. ${n.formatTime(e)})`):v>=40?(c="banner-active-moderate",r="🌤️",b="Vekslende nu",w=`Morgenlys aktivt nu • Vekslende skydække (slutter om ${l})`,f=`Morgenlys i gang (slutter kl. ${n.formatTime(e)})`):(c="banner-active-poor",r="☁️",b="Overskyet nu",w=`Morgentime i gang • Solen skjult af skydække (slutter om ${l})`,f="Morgenlys i gang, men dækket af skyer"):a==="evening"&&(v>=65?(c="banner-active",r="🌆",b="Aktiv nu",w=`Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${l})`,f=`Aktiv solnedgang lige nu (slutter kl. ${n.formatTime(e)})`):v>=40?(c="banner-active-moderate",r="🌤️",b="Moderat nu",w=`Aftenlys i gang • Vekslende skydække (slutter om ${l})`,f=`Solnedgang i gang (slutter kl. ${n.formatTime(e)})`):(c="banner-active-poor",r="☁️",b="Overskyet nu",w=`Solnedgang i gang • Skjult bag tungt skydække (slutter om ${l})`,f="Solnedgang i gang, men skjult bag skyer")),{status:"active",bannerClass:c,icon:r,pill:b,label:w,sub:f,isPassed:!1}}if(e&&m>e){const T=m.getTime()-e.getTime(),l=n.formatDuration(T);let c=`I morges • For ${l} siden`,r=`Afsluttet i morges (for ${l} siden)`;return a==="fog"?(c=`Tågevindue afsluttet • For ${l} siden`,r=`Afsluttet kl. ${n.formatTime(e)} (for ${l} siden)`):a==="evening"?(c=`I aften • For ${l} siden`,r=`Afsluttet i aften kl. ${n.formatTime(e)}`):a==="astro"&&(c="Natten er ovre",r=`Astronomisk nat afsluttet kl. ${n.formatTime(e)}`),{status:"passed",bannerClass:"banner-passed",icon:"⏳",pill:"Passeret",label:c,sub:r,isPassed:!0}}if(s&&m<s){const T=s.getTime()-m.getTime(),l=n.formatDuration(T);let c=`I dag • Om ${l}`,r=`Starter kl. ${n.formatTime(s)} (om ${l})`;return a==="evening"?(c=v>=65?`I aften • Om ${l} (flot aftenlys)`:`I aften • Om ${l}`,r=`Starter i aften kl. ${n.formatTime(s)} (om ${l})`):a==="astro"?(c=v>=65?`I aften/nat • Om ${l} (klare stjerneforhold)`:v<=35?`I aften/nat • Om ${l} (forventet overskyet)`:`I aften/nat • Om ${l}`,r=`Astronomisk nat starter kl. ${n.formatTime(s)} (om ${l})`):a==="fog"?(c=`Tågevindue senere i dag • Om ${l}`,r=`Forventes kl. ${n.formatTime(s)} (om ${l})`):a==="morning"&&(c=`I dag ved daggry • Om ${l}`),{status:"upcoming",bannerClass:"banner-upcoming",icon:"⏱️",pill:"Kommende",label:c,sub:r,isPassed:!1}}}if(t===1){const T=s?Math.max(0,s.getTime()-m.getTime()):0,l=n.formatDuration(T);let c=`I morgen • Om ${l}`,r=`I morgen kl. ${s?n.formatTime(s):"--:--"}`;return a==="fog"?(c=`Tågevindue i morgen • Om ${l}`,r=`I morgen kl. ${n.formatTime(s)} (om ${l})`):a==="morning"?(c=`I morgen tidlig • Om ${l}`,r=`I morgen kl. ${n.formatTime(s)} (om ${l})`):a==="evening"?(c=`I morgen aften • Om ${l}`,r=`I morgen kl. ${n.formatTime(s)} (om ${l})`):a==="astro"&&(c=`I morgen nat • Om ${l}`,r=`I morgen nat fra kl. ${n.formatTime(s)}`),{status:"future",bannerClass:"banner-future",icon:"📅",pill:"I morgen",label:c,sub:r,isPassed:!1}}const k=g[d.getDay()];let u=`${k} • Om ${t} dage`,H=`${k}`;return a==="fog"?(u=`${k} • Om ${t} dage`,H=`${k} kl. ${s?n.formatTime(s):"--:--"}`):a==="morning"?(u=`${k} morgen • Om ${t} dage`,H=`${k} kl. ${s?n.formatTime(s):"06:00"}`):a==="evening"?(u=`${k} aften • Om ${t} dage`,H=`${k} kl. ${s?n.formatTime(s):"18:00"}`):a==="astro"&&(u=`${k} nat • Om ${t} dage`,H=`${k} nat`),{status:"future-distant",bannerClass:"banner-future",icon:"📅",pill:k,label:u,sub:H,isPassed:!1}}}class le{container;currentLocation=Q.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(s){this.container=s,this.currentLocation=Q.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=Q.subscribe(async e=>{this.currentLocation=e,await this.loadWeather(!1)})}onActivate(s){if(s?.params){const e=s.params;e.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(e.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
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
    `;const s=this.container.querySelector("#weatherLocationMount");s&&(this.locationBar=new ae({container:s,accentClass:"fs-btn-accent-weather"}))}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)})}updateLocationDisplay(){const s=this.container.querySelector("#weatherLocName"),e=this.container.querySelector("#weatherLocCoords");s&&(s.textContent=this.currentLocation.name),e&&(e.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(s=!1){if(!this.isLoading){this.isLoading=!0;try{const e=await z.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,s);this.forecastData=e.forecast,this.isCachedForecast=e.isCached,this.cacheUpdatedAt=e.updatedAt,this.parsedDays=[];for(let t=0;t<7;t++){const d=z.parseDayData(this.forecastData,t,this.currentLocation.lat,this.currentLocation.lng);d&&this.parsedDays.push(d)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(e){console.error("Fejl ved indlæsning af vejr:",e);const t=this.container.querySelector("#weatherSelectedDayWrap");t&&(t.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${e.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const s=this.container.querySelector("#weatherStatusBanner"),e=this.container.querySelector("#weatherStatusTime");s&&(this.isCachedForecast&&this.cacheUpdatedAt?(s.classList.add("active"),e&&(e.textContent=`Hentet kl. ${n.formatTime(this.cacheUpdatedAt)}`)):s.classList.remove("active"))}selectDay(s){this.selectedDayIndex=Math.min(6,Math.max(0,s));const e=this.container.querySelector("#weatherDaysScroll");e&&(e.querySelectorAll(".day-tab-card").forEach(t=>t.classList.remove("active")),e.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add("active")),this.renderSelectedDay()}renderDaysScroll(){const s=this.container.querySelector("#weatherDaysScroll");!s||this.parsedDays.length===0||(s.innerHTML=this.parsedDays.map((e,t)=>{const a=t===0?"I dag":e.dayName.substring(0,3),p=z.getWeatherCodeDescription(e.weatherCode);return`
        <div class="day-tab-card ${t===this.selectedDayIndex?"active":""}" data-day="${t}">
          <span class="day-name">${a}</span>
          <span class="day-date">${e.date.getDate()}</span>
          <span class="day-icon">${p.icon}</span>
          <span class="day-temp-range">${Math.round(e.minTemp)}° / ${Math.round(e.maxTemp)}°</span>
        </div>
      `}).join(""),s.querySelectorAll("[data-day]").forEach(e=>{e.addEventListener("click",()=>{const t=Number(e.dataset.day);this.selectDay(t)})}))}renderSelectedDay(){const s=this.container.querySelector("#weatherSelectedDayWrap");if(!s||!this.parsedDays[this.selectedDayIndex])return;const e=this.parsedDays[this.selectedDayIndex],t=e.sun,d=e.moon,a=e.fog,p=e.goldenHourMorning,$=e.goldenHourEvening,m=e.astro,g=n.getDate()||new Date,v=this.selectedDayIndex===0,k=this.selectedDayIndex===1,u=a.startTime||t.civilDawn||(t.sunrise?new Date(t.sunrise.getTime()-45*60*1e3):null),H=a.endTime||t.sunriseEnd||(t.sunrise?new Date(t.sunrise.getTime()+65*60*1e3):null),T=z.getEventTiming(u,H,this.selectedDayIndex,e.date,"fog",a.score,g),l=t.blueHourMorning&&t.blueHourMorning.start||(t.sunrise?new Date(t.sunrise.getTime()-50*60*1e3):null),c=t.goldenHourMorning&&t.goldenHourMorning.end||(t.sunrise?new Date(t.sunrise.getTime()+45*60*1e3):null),r=z.getEventTiming(l,c,this.selectedDayIndex,e.date,"morning",p.score,g),b=t.goldenHourEvening&&t.goldenHourEvening.start||(t.sunset?new Date(t.sunset.getTime()-45*60*1e3):null),w=t.blueHourEvening&&t.blueHourEvening.end||(t.sunset?new Date(t.sunset.getTime()+45*60*1e3):null),f=z.getEventTiming(b,w,this.selectedDayIndex,e.date,"evening",$.score,g);let M=null,O=null;t.astronomicalDusk&&(v&&t.astronomicalDawn&&g<t.astronomicalDawn?(M=new Date(t.astronomicalDusk.getTime()-24*60*60*1e3),O=t.astronomicalDawn):(M=t.astronomicalDusk,O=t.astronomicalDawn?new Date(t.astronomicalDawn.getTime()+24*60*60*1e3):new Date(M.getTime()+9*60*60*1e3)));const D=z.getEventTiming(M,O,this.selectedDayIndex,e.date,"astro",m.score,g),E=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];let j="",A="";if(v)j=`I dag (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${E[e.date.getMonth()]})`,t.sunset&&g>t.sunset?A="Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys":T.status==="active"?A=a.score>=50?`Aktuel nu: ${a.typeName} (${a.timeWindowLabel||"aktiv lige nu"})`:`Aktuel nu: ${a.typeName}`:r.status==="active"?A=p.score>=50?"Aktuel lige nu: Daggry & gylden time!":"Aktuel lige nu: Daggry (skydækket morgen)":f.status==="active"?A=$.score>=50?"Aktuel lige nu: Solnedgang & aftenlys!":"Aktuel lige nu: Solnedgang (skjult bag skyer)":b&&g<b?A=`Næste: Gylden time i aften kl. ${n.formatTime(b)} (om ${n.formatDuration(b.getTime()-g.getTime())})`:M&&g<M?A=m.score>=60?`Næste: Stjernehimmel i aften kl. ${n.formatTime(M)} (om ${n.formatDuration(M.getTime()-g.getTime())})`:`Næste: Astronomisk mørke i aften kl. ${n.formatTime(M)} (om ${n.formatDuration(M.getTime()-g.getTime())})`:A="Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";else if(k){j=`I morgen (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${E[e.date.getMonth()]})`;const o=t.blueHourMorning?.start||t.sunrise,S=o?Math.max(0,o.getTime()-g.getTime()):0;A=`Første fotomulighed: Daggry kl. ${n.formatTime(o)} (om ${n.formatDuration(S)}) • Vejrudsigt for i morgen`}else j=`${e.dayName} d. ${e.date.getDate()}. ${E[e.date.getMonth()]}`,A=`7-dages vejrudsigt for ${this.currentLocation.name}`;const _=o=>o>=70?"score-high":o>=40?"score-moderate":"score-low",F=o=>`
      <div class="card-timing-banner ${o.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${o.icon}</span>
          <span class="timing-label">${o.label}</span>
        </div>
        <span class="timing-banner-pill">${o.pill}</span>
      </div>
    `,x=(o,S,L)=>!o||!v||this.parsedDays.length<=1?"":`
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${S}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${L} ➔</button>
        </div>
      `;let R=`${n.formatTime(t.sunrise)} / ${n.formatTime(t.sunset)}`,C="Solopgang • Solnedgang",Y=`<span style="color:var(--golden-primary);">Gylden: ${n.formatTime(t.goldenHourEvening?.start)} - ${n.formatTime(t.sunset)}</span>`;if(v)if(t.sunset&&g>t.sunset)R+=' <span class="time-passed-tag">Passeret</span>',C="Solopgang • Solnedgang (dagens soltimer er forbi)",Y=`<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;else if(t.sunrise&&g>t.sunrise){C=`Solopgang var for ${n.formatDuration(g.getTime()-t.sunrise.getTime())} siden`;const o=t.goldenHourEvening?.start||t.sunset?n.formatDuration((t.goldenHourEvening?.start||t.sunset).getTime()-g.getTime()):"";Y=`<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${n.formatTime(t.goldenHourEvening?.start||t.sunset)} (om ${o})</span>`}else{const o=t.sunrise?n.formatDuration(t.sunrise.getTime()-g.getTime()):"";C=`Solopgang i morges/dag kl. ${n.formatTime(t.sunrise)} (om ${o})`}else k&&(C=`Solopgang i morgen kl. ${n.formatTime(t.sunrise)} • Solnedgang kl. ${n.formatTime(t.sunset)}`);const q=e.moonTimes?.riseAzimuth,N=e.moonTimes?.setAzimuth,I=q!=null?` (${q.toFixed(0)}° ${K.getCompassDirection(q)})`:"",P=N!=null?` (${N.toFixed(0)}° ${K.getCompassDirection(N)})`:"";let G=`Op: ${n.formatTime(e.moonTimes?.rise)}${I} • Ned: ${n.formatTime(e.moonTimes?.set)}${P}`;if(v){const o=e.moonTimes?.rise?g>e.moonTimes.rise?`Op kl. ${n.formatTime(e.moonTimes.rise)}${I}`:`Op kl. ${n.formatTime(e.moonTimes.rise)}${I} (om ${n.formatDuration(e.moonTimes.rise.getTime()-g.getTime())})`:"Går ikke op",S=e.moonTimes?.set?`Ned kl. ${n.formatTime(e.moonTimes.set)}${P}`:"Går ikke ned";G=`${o} • ${S}`}else k&&(G=`I morgen: Op kl. ${n.formatTime(e.moonTimes?.rise)}${I} • Ned kl. ${n.formatTime(e.moonTimes?.set)}${P}`);const B=g.getHours(),W=t.sunrise?K.getSunPosition(t.sunrise,this.currentLocation.lat,this.currentLocation.lng):null,i=t.sunset?K.getSunPosition(t.sunset,this.currentLocation.lat,this.currentLocation.lng):null,h=W?`${W.azimuth.toFixed(0)}° ${K.getCompassDirection(W.azimuth)}`:"",y=i?`${i.azimuth.toFixed(0)}° ${K.getCompassDirection(i.azimuth)}`:"";s.innerHTML=`
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
          <div class="weather-day-banner-sub">${A}</div>
        </div>
      </div>

      <!-- ASTRONOMISK OVERBLIK (SOL & MÅNE) -->
      <div class="astro-overview-grid">
        <!-- Sol -->
        <div class="astro-sub-card">
          <div class="astro-sub-title">
            <span>☀️</span> Soltider
          </div>
          <div class="astro-sub-val">${R}</div>
          <div class="astro-sub-detail">${C}</div>
          <div class="astro-sub-detail">${Y}</div>
        </div>

        <!-- Måne -->
        <div class="astro-sub-card">
          <div class="astro-sub-title" style="justify-content: space-between;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span>${d.icon}</span> Måne</span>
            <button class="btn-goto-sol" data-body="moon" data-time="${e.moonTimes?.rise?e.moonTimes.rise.getTime():e.date.getTime()}" style="padding:1px 7px;font-size:10px;" title="Se måneopgang og måneretning i Sol/Måne-modulet">
              Sol/Måne →
            </button>
          </div>
          <div class="astro-sub-val">${d.fraction}% • ${d.name}</div>
          <div class="astro-sub-detail">${G}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${t.nightSky?.start?`${n.formatTime(t.nightSky.start)} - ${n.formatTime(t.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis / Tæt Tåge -->
        <div class="photo-card ${T.isPassed?"card-event-passed":""}">
          ${F(T)}
          <div class="photo-card-top">
            <span class="photo-card-title">${a.icon} ${a.typeName||"Morgentåge & Dis"}</span>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
              ${a.typeBadge?`<span class="photo-type-badge ${a.badgeClass||""}">${a.typeBadge}</span>`:""}
              <span class="photo-score-badge ${_(a.score)}">${a.score}/100 • ${a.level}</span>
            </div>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ${a.timeWindowLabel||`ca. ${n.formatTime(u)} - ${n.formatTime(H)}`}
            ${T.isPassed?'<span class="time-passed-tag">Afsluttet</span>':`• ${T.sub}`}
          </div>
          <div class="photo-card-desc">${a.text}</div>
          ${a.photoTip?`<div class="photo-card-tip">💡 <strong>Fototip:</strong> ${a.photoTip}</div>`:""}
          ${x(T.isPassed,"Tågeperioden er overstået for i dag. Tjek i morgen?","Se tåge i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${a.avgSpread}°C • Fugt: ${a.avgHumidity}% • Vind: ${a.avgWind} m/s • Sigt: ${a.minVisibilityKm} km</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card ${r.isPassed?"card-event-passed":""}">
          ${F(r)}
          <div class="photo-card-top">
            <span class="photo-card-title">${p.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${_(p.score)}">${p.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${n.formatTime(t.sunrise)} - ${n.formatTime(t.goldenHourMorning?.end)}
            ${h?`<span class="compass-direction-tag" title="Solens kompasretning ved solopgang">🧭 ${h}</span>`:""}
            ${r.isPassed?`<span class="time-passed-tag">Passeret (kl. ${n.formatTime(t.sunrise)})</span>`:`• ${r.sub}`}
          </div>
          <div class="photo-card-desc">${p.text}</div>
          ${x(r.isPassed,"Morgenens gyldne time fandt sted i morges. Tjek i morgen?","Se daggry i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${p.clouds.total}% (Lav: ${p.clouds.low}%, Mellem: ${p.clouds.mid}%, Høj: ${p.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${t.sunrise?t.sunrise.getTime():e.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card ${f.isPassed?"card-event-passed":""}">
          ${F(f)}
          <div class="photo-card-top">
            <span class="photo-card-title">${$.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${_($.score)}">${$.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${n.formatTime(t.goldenHourEvening?.start)} - ${n.formatTime(t.sunset)}
            ${y?`<span class="compass-direction-tag" title="Solens kompasretning ved solnedgang">🧭 ${y}</span>`:""}
            ${f.isPassed?'<span class="time-passed-tag">Passeret i aften</span>':`• ${f.sub}`}
          </div>
          <div class="photo-card-desc">${$.text}</div>
          ${x(f.isPassed,"Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?","Se solnedgang i morgen")}
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
            <span class="photo-card-title">${m.icon} Stjernehimmel (Astro)</span>
            <span class="photo-score-badge ${_(m.score)}">${m.score}/100 • ${m.status}</span>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${t.nightSky?.start?`${n.formatTime(t.nightSky.start)} - ${n.formatTime(t.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}
            ${D.isPassed?'<span class="time-passed-tag">Natten er ovre</span>':`• ${D.sub}`}
          </div>
          <div class="photo-card-desc">${m.text}</div>
          ${x(D.isPassed,"Astronomisk mørke for denne nat er ovre. Tjek næste nat?","Se stjernehimmel i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${m.moonImpact}</span>
            <button class="btn-goto-sol" data-body="moon" data-time="${e.moonTimes?.rise?e.moonTimes.rise.getTime():t.nightSky?.start?t.nightSky.start.getTime():e.date.getTime()}" title="Se måneretning og nattehimmel i Sol/Måne-modulet">
              ${d.icon} Åbn i Sol/Måne →
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
            ${e.hourly.map(o=>{let S="hourly-col",L=`<span class="hour-badge">${String(o.hour).padStart(2,"0")}:00</span>`;return v&&(o.hour<B?(S+=" hourly-past-hour",L+='<span class="hour-past-pill">forbi</span>'):o.hour===B&&(S+=" hourly-current-hour",L+='<span class="hour-now-badge">NU</span>')),`
                <div class="${S}">
                  ${L}
                  <span>${o.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(o.temp)}°</span>
                  <span class="hour-clouds">☁️ ${o.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${o.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(o.visibility/1e3).toFixed(0)}km</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    `,s.querySelectorAll(".btn-jump-tomorrow").forEach(o=>{o.addEventListener("click",()=>{const S=Number(o.dataset.jumpDay??1);this.selectDay(S)})}),s.querySelectorAll(".btn-goto-sol, .btn-goto-fotosol").forEach(o=>{o.addEventListener("click",()=>{const S=o,L=Number(S.dataset.time),J=S.dataset.body||"sun",U=new Date(L);n.setDate(U),ne.navigate("#/sol",{date:U,body:J,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{le as default};
