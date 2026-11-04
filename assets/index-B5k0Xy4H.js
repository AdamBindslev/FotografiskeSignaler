import{R as te}from"./index-Ba7ThaO9.js";import{A as R,T as i,L as Q,a as se}from"./LocationBar-CZCNmsGQ.js";const ne="photoweather_cache_v2_";class q{static async fetchForecast(s,e,t=!1){const d=`${ne}${s.toFixed(4)}_${e.toFixed(4)}`;let n=null;try{const c=localStorage.getItem(d);c&&(n=JSON.parse(c))}catch(c){console.warn("Kunne ikke læse vejr-cache:",c)}const p=Date.now();if(!t&&n&&n.timestamp&&p-n.timestamp<1e3*60*60*2)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};const k=`https://api.open-meteo.com/v1/forecast?latitude=${s.toFixed(4)}&longitude=${e.toFixed(4)}&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&wind_speed_unit=ms&timezone=auto`;try{const c=await fetch(k);if(!c.ok)throw new Error(`Open-Meteo svarede med status ${c.status}`);const g=await c.json();try{localStorage.setItem(d,JSON.stringify({timestamp:p,data:g}))}catch(v){console.warn("Kunne ikke gemme vejr i localStorage:",v)}return{forecast:g,isCached:!1,updatedAt:new Date(p)}}catch(c){if(n&&n.data)return{forecast:n.data,isCached:!0,updatedAt:new Date(n.timestamp)};throw c}}static parseDayData(s,e,t,d){if(!s?.hourly?.time||!s?.daily?.time)return null;const n=s.daily.time[e];if(!n)return null;const p=n.split("-"),k=new Date(Number(p[0]),Number(p[1])-1,Number(p[2]),12,0,0),c=R.getSunTimes(k,t,d),g=R.getMoonIllumination(k),v=R.getMoonTimes(k,t,d),T=s.hourly.time,u=[],E=[],D=`${n}T`,r=s.daily.time[e+1],m=r?`${r}T`:null,l=(h,y)=>{const j=Number(y.substring(11,13)),L=s.hourly.temperature_2m[h],A=s.hourly.dew_point_2m[h],_=s.hourly.weather_code[h],N=this.getWeatherCodeDescription(_);return{time:y,hour:j,temp:L,apparentTemp:s.hourly.apparent_temperature[h],humidity:s.hourly.relative_humidity_2m[h],dewPoint:A,spread:+(L-A).toFixed(1),precipProb:s.hourly.precipitation_probability[h],precipMm:s.hourly.precipitation[h],weatherCode:_,weatherDesc:N.desc,weatherIcon:N.icon,cloudTotal:s.hourly.cloud_cover[h],cloudLow:s.hourly.cloud_cover_low[h],cloudMid:s.hourly.cloud_cover_mid[h],cloudHigh:s.hourly.cloud_cover_high[h],visibility:s.hourly.visibility[h],windSpeed:s.hourly.wind_speed_10m[h],windDir:s.hourly.wind_direction_10m[h],windGusts:s.hourly.wind_gusts_10m[h]}};for(let h=0;h<T.length;h++){const y=T[h];y.startsWith(D)?u.push(l(h,y)):m&&y.startsWith(m)&&Number(y.substring(11,13))<=4&&E.push(l(h,y))}const $=this.calculateFogRisk(u,c,k),w=this.calculateGoldenHourQuality(u,c.goldenHourMorning,c.sunrise),x=this.calculateGoldenHourQuality(u,c.goldenHourEvening,c.sunset),H=this.calculateAstroScore(u,c,g,t,d,k,E);return{date:k,dayIndex:e,dateStr:n,dayName:["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"][k.getDay()],maxTemp:s.daily.temperature_2m_max[e],minTemp:s.daily.temperature_2m_min[e],weatherCode:s.daily.weather_code[e],weatherDesc:this.getWeatherCodeDescription(s.daily.weather_code[e]).desc,sun:c,moon:g,moonTimes:v,fog:$,goldenHourMorning:w,goldenHourEvening:x,astro:H,hourly:u}}static calculateFogRisk(s,e,t){const d=t||(e.sunrise?new Date(e.sunrise.getTime()):new Date);if(!s||s.length===0)return{score:0,level:"Ukendt",text:"Ingen vejrdata tilgængelig",icon:"❓",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Ingen data",badgeClass:"badge-clear",photoTip:"Ingen vejrmeldinger tilgængelige.",avgSpread:"0.0",avgHumidity:0,avgWind:"0.0",minVisibilityKm:"0.0",period:"none",timeWindowLabel:"Ingen data",startTime:null,endTime:null};const n=e.sunrise?e.sunrise.getHours():6,p=e.sunset?e.sunset.getHours():18,k=o=>{const S=o.weatherCode===45||o.weatherCode===48,b=typeof o.visibility=="number"?o.visibility:1e4;if(!S&&b>=1e4)return 10;if(!S&&b>=6e3)return 20;let f=0;o.spread<=.5?f+=35:o.spread<=1.2?f+=25:o.spread<=2?f+=15:o.spread<=3&&(f+=5),o.humidity>=96?f+=25:o.humidity>=92?f+=18:o.humidity>=88?f+=10:o.humidity>=80&&(f+=5),S||b<=1e3?(o.windSpeed<=3?f+=20:o.windSpeed<=5?f+=12:o.windSpeed<=7?f+=5:f-=10,f+=20):(o.windSpeed<=2?f+=20:o.windSpeed<=3.5?f+=12:o.windSpeed<=5?f+=5:f-=15,b<=4500&&(f+=8));let a=Math.min(100,Math.max(0,f));return S||(b>5e3?a=Math.min(a,25):b>3500?a=Math.min(a,45):b>1500&&(a=Math.min(a,70))),a},g=s.map(o=>({hour:o.hour,item:o,score:k(o)})).filter(o=>o.score>=35);if(g.length===0){const o=Math.max(0,n-3),S=Math.min(23,n+1),b=s.filter(K=>K.hour>=o&&K.hour<=S),f=b.length>0?b:s.slice(0,4);let F=0,a=0,M=0,V=99999;f.forEach(K=>{F+=K.spread,a+=K.humidity,M+=K.windSpeed,K.visibility<V&&(V=K.visibility)}),F/=f.length,a/=f.length,M/=f.length;const J=Math.max(10,Math.round(f.reduce((K,ee)=>K+k(ee),0)/f.length)),U=e.civilDawn||(e.sunrise?new Date(e.sunrise.getTime()-45*60*1e3):null),X=e.sunriseEnd||(e.sunrise?new Date(e.sunrise.getTime()+65*60*1e3):null);return{score:J,level:"Lav",text:"Lav tågerisiko – klar sigt over landskabet",icon:"☀️",classType:"low",fogType:"clear",typeName:"Morgentåge & Dis",typeBadge:"Lav risiko",badgeClass:"badge-clear",photoTip:"Gode betingelser for rene, kontrastrige solopgangsbilleder uden slørende tåge.",avgSpread:F.toFixed(1),avgHumidity:Math.round(a),avgWind:M.toFixed(1),minVisibilityKm:(V/1e3).toFixed(1),period:"morning",timeWindowLabel:`ca. ${i.formatTime(U)} - ${i.formatTime(X)}`,startTime:U,endTime:X}}const v=g.filter(o=>o.hour<=n+3),T=v.some(o=>o.hour>=n-2&&o.hour<=n+2&&(o.score>=40||o.item.visibility<=3e3)),u=g.filter(o=>o.hour>=11&&o.hour<=15),E=u.some(o=>o.item.weatherCode===45||o.item.weatherCode===48||o.item.visibility<=1500);let D="morning",r=g;if(g.length>=8&&E&&u.length>=3)D="all_day",r=g;else if(T&&v.length>=2)D="morning",r=v;else{const o=g.filter(a=>a.hour>=p+2),S=g.filter(a=>a.hour<=n-3),b=g.filter(a=>a.hour>=p-1&&a.hour<=p+1),f=g.filter(a=>a.hour>n+2&&a.hour<p-1),F=[{period:"night",group:S.length>=o.length?S:o,weight:Math.max(S.reduce((a,M)=>a+M.score,0),o.reduce((a,M)=>a+M.score,0))},{period:"evening",group:b,weight:b.reduce((a,M)=>a+M.score,0)},{period:"day",group:f,weight:f.reduce((a,M)=>a+M.score,0)}].filter(a=>a.group.length>0);F.sort((a,M)=>M.weight-a.weight),F.length>0&&(D=F[0].period,r=F[0].group)}let m=0,l=0,$=0,w=99999,x=!1,H=0,C=0;r.forEach(o=>{const S=o.item;m+=S.spread,l+=S.humidity,$+=S.windSpeed,H+=S.cloudLow||0,S.visibility<w&&(w=S.visibility),(S.weatherCode===45||S.weatherCode===48)&&(x=!0),C+=o.score}),m/=r.length,l/=r.length,$/=r.length,H/=r.length;const h=Math.min(100,Math.round(C/r.length)),y=(w/1e3).toFixed(1);let j=null,L=null,A="";const _=o=>o<10?"0"+o:""+o;if(D==="all_day")j=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0),L=new Date(d.getFullYear(),d.getMonth(),d.getDate(),23,59,59),A="Heldagståge (døgnet rundt)";else if(D==="night"){const o=r.filter(b=>b.hour>=18),S=r.filter(b=>b.hour<12);if(o.length>0&&S.length>0){const b=Math.min(...o.map(F=>F.hour)),f=Math.max(...S.map(F=>F.hour));j=new Date(d.getFullYear(),d.getMonth(),d.getDate(),b,0,0),L=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1,f+1,0,0),A=`kl. ${_(b)}:00 - ${_(f+1)}:00 (i nat)`}else{const b=r.map(a=>a.hour),f=Math.min(...b),F=Math.max(...b);j=new Date(d.getFullYear(),d.getMonth(),d.getDate(),f,0,0),L=new Date(d.getFullYear(),d.getMonth(),d.getDate(),F+1,0,0),A=`kl. ${_(f)}:00 - ${_(F+1)}:00 (i nat)`}}else if(D==="morning"){const o=r.map(f=>f.hour),S=Math.min(...o),b=Math.max(...o);j=new Date(d.getFullYear(),d.getMonth(),d.getDate(),S,0,0),L=new Date(d.getFullYear(),d.getMonth(),d.getDate(),Math.max(b+1,(e.sunrise?.getHours()||6)+1),0,0),A=`ca. ${_(S)}:00 - ${_(b+1)}:00`}else{const o=r.map(f=>f.hour),S=Math.min(...o),b=Math.max(...o);j=new Date(d.getFullYear(),d.getMonth(),d.getDate(),S,0,0),L=new Date(d.getFullYear(),d.getMonth(),d.getDate(),b+1,0,0),A=`kl. ${_(S)}:00 - ${_(b+1)}:00`}const N=x||w<=1200||l>=96&&m<=.6&&H>=60||l>=93&&m<=.8&&$>=2.5,Y=h>=75?"Meget høj":h>=55?"Høj":"Moderat",z=h>=55?"high":"moderate";let G="Morgentåge & Dis",I="🌫️",O="Tæt tåge",P="badge-dense-fog",W="",B="";if(D==="night")G=N?"Tæt Nattåge":"Nattåge & Slør",I="🌃",P="badge-night-fog",O=N?"Nattåge":"Natslør",W=w<1e3?`Tæt tåge over natten (${A}, sigtdybde ca. ${Math.round(w)}m). Gadelygter og billygter skaber markante lyskegler.`:`Tågeslør lægger sig over natten (${A}). Høj stemning med lysspredning fra gadelygter.`,B="Magiske forhold for nat- og gadefotografering! Gadelygter, neonskilte og billygter danner filmiske lyskegler (volumetrisk lys) og en stemningsfuld noir-æstetik på tomme gader og stier.";else if(D==="all_day")G="Massiv Heldagståge",I="🌫️",P="badge-all-day",O="Heldagståge",W=`Massiv tåge dækker hele døgnet (${A}) med markant nedsat sigtbarhed (${y} km). Solen forbliver skjult.`,B="Heldags-mulighed for melankolske og grafiske serier. Gå efter ensomme træer, strukturer i tågen og minimalistiske kompositioner med en markant forgrund.";else if(D==="day")G=N?"Tæt Dagståge / Havgus":"Dagdis & Slør",I="🌁",P="badge-day-fog",O=N?"Dagståge / Havgus":"Dagdis",W=`Tåge og nedsat sigtbarhed midt på dagen (${A}). Det diffuse dagslys udvisker baggrunde og fjerner hårde skygger.`,B="Perfekt til minimalistisk fotografi, kystlandskaber og rå arkitektur. Det bløde, skyggefrie lys fremhæver former og silhuetter frem for tekstur.";else if(D==="evening")G=N?"Tæt Aftentåge":"Aftentåge & Skumring",I="🌆",P="badge-dense-fog",O=N?"Tæt aftentåge":"Aftendis",W=`Tågen trækker ind omkring solnedgang og aften (${A}). Skumringens blå time blandes med tågens bløde lysdække.`,B="Udnyt samspillet mellem det blå skumringslys (den blå time) og tågens spredning af de første tændte vindues- og gadelamper til flotte farvekontraster.";else{const o=e.sunrise?` ved daggry og solopgang kl. ${i.formatTime(e.sunrise)}`:" ved daggry";N?(G="Tæt Morgentåge",I="🌫️",P="badge-dense-fog",O=w<1e3?`Tæt tåge (sigt ${Math.round(w)}m)`:"Massiv tåge",W=w<1e3?`Massiv og tæt tåge dækker landskabet${o} (${A}, sigtdybde ca. ${Math.round(w)}m). Tykt dække hvor solen næppe trænger igennem.`:`Massiv og tæt morgentåge (${A})${o} med dæmpet, diffust lys.`,B=`Fokusér på minimalistiske kompositioner, grafiske træer, ensomme strukturer og silhuetter under daggry${e.sunrise?` og solopgang kl. ${i.formatTime(e.sunrise)}`:""} før solen bryder igennem.`):(G="Morgendis & Jordtåge",I=h>=75?"🌫️":"🌁",P="badge-radiation-mist",O="Morgendis / Mosekonebryg",W=h>=75?`Perfekte betingelser for eventyrlig morgendis over enge og vand${o} (${A})! Høj chance for gyldne solstråler (god rays).`:`Gode chancer for stemningsfuld morgendis og lav jordtåge (${A})${o} med smuk lagdelt dybde ved solopgang.`,B="Stil dig i modlys mod solopgangen for at fange gyldne lysstråler (god rays) igennem trækroner eller det lave slør over søer og marker.")}return{score:h,level:Y,text:W,icon:I,classType:z,fogType:N?"dense_fog":"radiation_mist",typeName:G,typeBadge:O,badgeClass:P,photoTip:B,period:D,timeWindowLabel:A,startTime:j,endTime:L,avgSpread:m.toFixed(1),avgHumidity:Math.round(l),avgWind:$.toFixed(1),minVisibilityKm:y}}static calculateGoldenHourQuality(s,e,t){if(!s||!t)return{score:50,text:"Middel betingelser",cloudsDesc:"Normalt skydække",clouds:{total:50,low:20,mid:20,high:20}};const d=t.getHours(),n=s.find(E=>E.hour===d)||s[d]||s[0],p=n.cloudTotal,k=n.cloudLow,c=n.cloudMid,g=n.cloudHigh;let v=50,T="Pænt lys",u="☀️";return k>=70||p>=85&&k+c>=80?(v=20,T="Tungt lavt skydække blokerer for direkte sollys og gylden glød",u="☁️"):p>=75?(v=35,T="Overvejende overskyet – diffust og dæmpet lys ved horisonten",u="☁️"):p<=15?(v=85,T="Klar himmel – rent gyldent lys og skarpe lange skygger",u="🌅"):k<=30&&c+g>=30&&c+g<=75?(v=95,T="Fremragende! Høje og mellemskyer kan skabe en flammende farverig himmel",u="🔥"):p<=50?(v=75,T="Gode forhold med dynamiske lysstriber gennem spredte skyer",u="🌤️"):(v=45,T="Vekslende skydække med diffuse lysforhold",u="⛅"),{score:v,text:T,icon:u,clouds:{total:p,low:k,mid:c,high:g}}}static calculateAstroScore(s,e,t,d,n,p,k){const c=e.astronomicalDusk&&e.astronomicalDawn;let g;k&&k.length>0?g=[...s.filter(y=>y.hour>=22),...k.filter(y=>y.hour<=4)]:g=s.filter(y=>y.hour>=22||y.hour<=4),g.length===0&&(g=s.slice(0,4));let v=0,T=0;g.forEach(y=>{v+=y.cloudTotal,T+=y.cloudLow}),v/=g.length,T/=g.length;const u=Math.round(v);let E=0;g.forEach(y=>{const j=new Date(p.getFullYear(),p.getMonth(),p.getDate()+(y.hour<=4?1:0),y.hour,0,0);try{const L=R.getMoonPosition(j,d,n);L&&L.altitude>0&&E++}catch{}});let D=99999,r=!1,m=!1;g.forEach(y=>{typeof y.visibility=="number"&&y.visibility<D&&(D=y.visibility),y.weatherCode===45||y.weatherCode===48||typeof y.visibility=="number"&&y.visibility<=1e3?r=!0:typeof y.visibility=="number"&&y.visibility<=3e3&&(m=!0)});let l=100;u<=10?l-=u*.5:u<=30?l-=5+(u-10)*1:u<=60?l-=25+(u-30)*1.5:l-=70+(u-60)*.7,l-=T*.25;let $="";E===0?$="Månen er under horisonten hele natten (ingen måneforstyrrelse)":t.fraction<=15?$=`Nymåne / ultrasvagt segl (${t.fraction}%) – intet generende måneskin`:t.fraction<=45?(l-=Math.round(t.fraction/100*15),$=`Svag månefase (${t.fraction}%) – kun moderat lyspåvirkning`):(l-=Math.round(t.fraction/100*35),$=`Kraftigt måneskin (${t.fraction}%) oplyser natten og udvisker svage stjerner`),c||(l=Math.min(l,50),$+=" • Bemærk: Lyse nætter forhindrer kulsort astronomisk mørke");let w="";r?(l=Math.min(l,15),w="Tågen blokerer stjernehimlen, men gadelygter, neonskilte og billygter danner filmiske lyskegler (volumetrisk lys) og en stemningsfuld noir-æstetik på tomme gader og stier."):m&&(l=Math.min(l,45),w="Let tågedis nær jorden kan svække lavtstående stjerner, men giver smukke glorier omkring gadelamper og lyskilder.");const x=Math.min(100,Math.max(0,Math.round(l)));let H="Ugunstig",C="☁️",h="";return r?(H="Ugunstig",C="🌫️",h=`Tæt nattetåge (sigtdybde ca. ${Math.round(D)}m) dækker natten og blokerer stjernehimlen fuldstændigt.`):u>=75?(H="Ugunstig",C="☁️",h=`Tæt skydække (${u}%) dækker himlen i nat.`):u>=50?(H="Svag",C="⛅",h=`Overvejende skyet (${u}%). Kun spredte kighuller til enkelte klare stjerner.`):u>=25||m?(H="Moderat",C="✨",h=m?`Lette slørskyer (${u}%) og tågedis nær jorden svækker de svageste stjerner.`:`Gode observationsforhold med lette slørskyer (${u}%).`):(H="Fremragende",C="🌌",h=`Krystalklar nattehimmel (${u}% skyer)! Perfekte forhold for Mælkevejen og stjernebaner.`),{score:x,status:H,icon:C,text:h,roundClouds:u,moonImpact:$,hasNightFog:r,nightFogTip:w||void 0}}static getWeatherCodeDescription(s){switch(s){case 0:return{desc:"Klar himmel / Skyfrit",icon:"☀️"};case 1:return{desc:"Hovedsageligt klart",icon:"🌤️"};case 2:return{desc:"Delvist skyet",icon:"⛅"};case 3:return{desc:"Overskyet",icon:"☁️"};case 45:return{desc:"Tåge",icon:"🌫️"};case 48:return{desc:"Rimtåge",icon:"🌫️"};case 51:return{desc:"Let støvregn",icon:"🌦️"};case 53:return{desc:"Moderat støvregn",icon:"🌧️"};case 55:return{desc:"Tæt støvregn",icon:"🌧️"};case 61:return{desc:"Let regn",icon:"🌦️"};case 63:return{desc:"Moderat regn",icon:"🌧️"};case 65:return{desc:"Kraftig regn",icon:"🌧️"};case 71:return{desc:"Let snefald",icon:"🌨️"};case 73:return{desc:"Moderat snefald",icon:"❄️"};case 75:return{desc:"Kraftigt snefald",icon:"❄️"};case 80:return{desc:"Lette regnbyger",icon:"🌦️"};case 81:return{desc:"Moderate regnbyger",icon:"🌧️"};case 82:return{desc:"Voldsomme regnbyger",icon:"⛈️"};case 95:return{desc:"Tordenvejr",icon:"⛈️"};default:return{desc:"Vekslende vejr",icon:"🌤️"}}}static getEventTiming(s,e,t,d,n,p=50,k){const c=k||i.getDate()||new Date,g=["Søndag","Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag"],v=typeof p=="number"?p:50;if(t===0){if(s&&e&&c>=s&&c<=e){const D=e.getTime()-c.getTime(),r=i.formatDuration(D);let m="banner-active",l="🟢",$="Aktiv nu",w=`Aktiv lige nu • Slutter om ${r}`,x=`Aktiv lige nu (slutter kl. ${i.formatTime(e)})`;return n==="astro"?v>=65?(m="banner-active",l="✨",$="Aktiv nu",w=`Gode stjerneforhold nu • Slutter om ${r}`,x=`Astronomisk nat aktiv lige nu (slutter kl. ${i.formatTime(e)})`):v>=40?(m="banner-active-moderate",l="⛅",$="Moderat nu",w=`Astronomisk nat aktiv • Vekslende skydække (slutter om ${r})`,x=`Mørke i gang (kl. ${i.formatTime(e)}) • Skiftende skyer`):(m="banner-active-poor",l="☁️",$="Overskyet nu",w=`Astronomisk nat er i gang • Desværre overskyet (slutter om ${r})`,x=`Mørke i gang (kl. ${i.formatTime(e)}) • Dækket af skyer`):n==="fog"?v>=55?(m="banner-active",l="🌫️",$="Aktiv nu",w=`Tågevindue aktivt nu • Gode tågebetingelser (slutter om ${r})`,x=`Tågevindue aktivt lige nu (slutter kl. ${i.formatTime(e)})`):v>=35?(m="banner-active-moderate",l="🌁",$="Moderat nu",w=`Tidsvindue aktivt • Mulighed for let morgendis (slutter om ${r})`,x=`Tidsvindue aktivt (slutter kl. ${i.formatTime(e)})`):(m="banner-active-poor",l="☀️",$="Klar sigt",w=`Morgentime i gang • Lav tågerisiko / klar luft (slutter om ${r})`,x=`Morgenstund i gang (slutter kl. ${i.formatTime(e)}) • Ingen tåge`):n==="morning"?v>=65?(m="banner-active",l="🌅",$="Aktiv nu",w=`Gylden time aktiv lige nu • Flot morgenlys (slutter om ${r})`,x=`Daggry i gang nu (slutter kl. ${i.formatTime(e)})`):v>=40?(m="banner-active-moderate",l="🌤️",$="Vekslende nu",w=`Morgenlys aktivt nu • Vekslende skydække (slutter om ${r})`,x=`Morgenlys i gang (slutter kl. ${i.formatTime(e)})`):(m="banner-active-poor",l="☁️",$="Overskyet nu",w=`Morgentime i gang • Solen skjult af skydække (slutter om ${r})`,x="Morgenlys i gang, men dækket af skyer"):n==="evening"&&(v>=65?(m="banner-active",l="🌆",$="Aktiv nu",w=`Solnedgang aktiv lige nu • Smukt aftenlys (slutter om ${r})`,x=`Aktiv solnedgang lige nu (slutter kl. ${i.formatTime(e)})`):v>=40?(m="banner-active-moderate",l="🌤️",$="Moderat nu",w=`Aftenlys i gang • Vekslende skydække (slutter om ${r})`,x=`Solnedgang i gang (slutter kl. ${i.formatTime(e)})`):(m="banner-active-poor",l="☁️",$="Overskyet nu",w=`Solnedgang i gang • Skjult bag tungt skydække (slutter om ${r})`,x="Solnedgang i gang, men skjult bag skyer")),{status:"active",bannerClass:m,icon:l,pill:$,label:w,sub:x,isPassed:!1}}if(e&&c>e){const D=c.getTime()-e.getTime(),r=i.formatDuration(D);let m=`I morges • For ${r} siden`,l=`Afsluttet i morges (for ${r} siden)`;return n==="fog"?(m=`Tågevindue afsluttet • For ${r} siden`,l=`Afsluttet kl. ${i.formatTime(e)} (for ${r} siden)`):n==="evening"?(m=`I aften • For ${r} siden`,l=`Afsluttet i aften kl. ${i.formatTime(e)}`):n==="astro"&&(m="Natten er ovre",l=`Astronomisk nat afsluttet kl. ${i.formatTime(e)}`),{status:"passed",bannerClass:"banner-passed",icon:"⏳",pill:"Passeret",label:m,sub:l,isPassed:!0}}if(s&&c<s){const D=s.getTime()-c.getTime(),r=i.formatDuration(D);let m=`I dag • Om ${r}`,l=`Starter kl. ${i.formatTime(s)} (om ${r})`;return n==="evening"?(m=v>=65?`I aften • Om ${r} (flot aftenlys)`:`I aften • Om ${r}`,l=`Starter i aften kl. ${i.formatTime(s)} (om ${r})`):n==="astro"?(m=v>=65?`I aften/nat • Om ${r} (klare stjerneforhold)`:v<=35?`I aften/nat • Om ${r} (forventet overskyet)`:`I aften/nat • Om ${r}`,l=`Astronomisk nat starter kl. ${i.formatTime(s)} (om ${r})`):n==="fog"?(m=`Tågevindue senere i dag • Om ${r}`,l=`Forventes kl. ${i.formatTime(s)} (om ${r})`):n==="morning"&&(m=`I dag ved daggry • Om ${r}`),{status:"upcoming",bannerClass:"banner-upcoming",icon:"⏱️",pill:"Kommende",label:m,sub:l,isPassed:!1}}}if(t===1){const D=s?Math.max(0,s.getTime()-c.getTime()):0,r=i.formatDuration(D);let m=`I morgen • Om ${r}`,l=`I morgen kl. ${s?i.formatTime(s):"--:--"}`;return n==="fog"?(m=`Tågevindue i morgen • Om ${r}`,l=`I morgen kl. ${i.formatTime(s)} (om ${r})`):n==="morning"?(m=`I morgen tidlig • Om ${r}`,l=`I morgen kl. ${i.formatTime(s)} (om ${r})`):n==="evening"?(m=`I morgen aften • Om ${r}`,l=`I morgen kl. ${i.formatTime(s)} (om ${r})`):n==="astro"&&(m=`I morgen nat • Om ${r}`,l=`I morgen nat fra kl. ${i.formatTime(s)}`),{status:"future",bannerClass:"banner-future",icon:"📅",pill:"I morgen",label:m,sub:l,isPassed:!1}}const T=g[d.getDay()];let u=`${T} • Om ${t} dage`,E=`${T}`;return n==="fog"?(u=`${T} • Om ${t} dage`,E=`${T} kl. ${s?i.formatTime(s):"--:--"}`):n==="morning"?(u=`${T} morgen • Om ${t} dage`,E=`${T} kl. ${s?i.formatTime(s):"06:00"}`):n==="evening"?(u=`${T} aften • Om ${t} dage`,E=`${T} kl. ${s?i.formatTime(s):"18:00"}`):n==="astro"&&(u=`${T} nat • Om ${t} dage`,E=`${T} nat`),{status:"future-distant",bannerClass:"banner-future",icon:"📅",pill:T,label:u,sub:E,isPassed:!1}}}class oe{container;currentLocation=Q.getLocation();selectedDayIndex=0;forecastData=null;parsedDays=[];isCachedForecast=!1;cacheUpdatedAt=null;isLoading=!1;locationBar=null;unsubLocation=null;async mount(s){this.container=s,this.currentLocation=Q.getLocation(),this.render(),this.attachEventListeners(),await this.loadWeather(),this.unsubLocation=Q.subscribe(async e=>{this.currentLocation=e,await this.loadWeather(!1)})}onActivate(s){if(s?.params){const e=s.params;e.has("day")&&(this.selectedDayIndex=Math.min(6,Math.max(0,Number(e.get("day"))||0)),this.renderSelectedDay())}}destroy(){this.unsubLocation&&(this.unsubLocation(),this.unsubLocation=null),this.locationBar&&(this.locationBar.destroy(),this.locationBar=null)}render(){this.locationBar&&(this.locationBar.destroy(),this.locationBar=null),this.container.innerHTML=`
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
    `;const s=this.container.querySelector("#weatherLocationMount");s&&(this.locationBar=new se({container:s,accentClass:"fs-btn-accent-weather"}))}attachEventListeners(){this.container.querySelector("#btnWeatherRefresh")?.addEventListener("click",()=>{this.loadWeather(!0)})}updateLocationDisplay(){const s=this.container.querySelector("#weatherLocName"),e=this.container.querySelector("#weatherLocCoords");s&&(s.textContent=this.currentLocation.name),e&&(e.textContent=`${this.currentLocation.lat.toFixed(4)}°N, ${this.currentLocation.lng.toFixed(4)}°Ø`)}async loadWeather(s=!1){if(!this.isLoading){this.isLoading=!0;try{const e=await q.fetchForecast(this.currentLocation.lat,this.currentLocation.lng,s);this.forecastData=e.forecast,this.isCachedForecast=e.isCached,this.cacheUpdatedAt=e.updatedAt,this.parsedDays=[];for(let t=0;t<7;t++){const d=q.parseDayData(this.forecastData,t,this.currentLocation.lat,this.currentLocation.lng);d&&this.parsedDays.push(d)}this.renderDaysScroll(),this.renderSelectedDay(),this.renderStatusBanner()}catch(e){console.error("Fejl ved indlæsning af vejr:",e);const t=this.container.querySelector("#weatherSelectedDayWrap");t&&(t.innerHTML=`
          <div class="fs-card" style="border-color:var(--accent-danger);">
            <h4 style="color:var(--accent-danger);margin-bottom:6px;">Kunne ikke hente vejrdata</h4>
            <p style="color:var(--text-muted);font-size:13px;">${e.message||"Tjek din internetforbindelse"}</p>
          </div>
        `)}finally{this.isLoading=!1}}}renderStatusBanner(){const s=this.container.querySelector("#weatherStatusBanner"),e=this.container.querySelector("#weatherStatusTime");s&&(this.isCachedForecast&&this.cacheUpdatedAt?(s.classList.add("active"),e&&(e.textContent=`Hentet kl. ${i.formatTime(this.cacheUpdatedAt)}`)):s.classList.remove("active"))}selectDay(s){this.selectedDayIndex=Math.min(6,Math.max(0,s));const e=this.container.querySelector("#weatherDaysScroll");e&&(e.querySelectorAll(".day-tab-card").forEach(t=>t.classList.remove("active")),e.querySelector(`[data-day="${this.selectedDayIndex}"]`)?.classList.add("active")),this.renderSelectedDay()}renderDaysScroll(){const s=this.container.querySelector("#weatherDaysScroll");!s||this.parsedDays.length===0||(s.innerHTML=this.parsedDays.map((e,t)=>{const n=t===0?"I dag":e.dayName.substring(0,3),p=q.getWeatherCodeDescription(e.weatherCode);return`
        <div class="day-tab-card ${t===this.selectedDayIndex?"active":""}" data-day="${t}">
          <span class="day-name">${n}</span>
          <span class="day-date">${e.date.getDate()}</span>
          <span class="day-icon">${p.icon}</span>
          <span class="day-temp-range">${Math.round(e.minTemp)}° / ${Math.round(e.maxTemp)}°</span>
        </div>
      `}).join(""),s.querySelectorAll("[data-day]").forEach(e=>{e.addEventListener("click",()=>{const t=Number(e.dataset.day);this.selectDay(t)})}))}renderSelectedDay(){const s=this.container.querySelector("#weatherSelectedDayWrap");if(!s||!this.parsedDays[this.selectedDayIndex])return;const e=this.parsedDays[this.selectedDayIndex],t=e.sun,d=e.moon,n=e.fog,p=e.goldenHourMorning,k=e.goldenHourEvening,c=e.astro,g=i.getDate()||new Date,v=this.selectedDayIndex===0,T=this.selectedDayIndex===1,u=n.startTime||t.civilDawn||(t.sunrise?new Date(t.sunrise.getTime()-45*60*1e3):null),E=n.endTime||t.sunriseEnd||(t.sunrise?new Date(t.sunrise.getTime()+65*60*1e3):null),D=q.getEventTiming(u,E,this.selectedDayIndex,e.date,"fog",n.score,g),r=t.blueHourMorning&&t.blueHourMorning.start||(t.sunrise?new Date(t.sunrise.getTime()-50*60*1e3):null),m=t.goldenHourMorning&&t.goldenHourMorning.end||(t.sunrise?new Date(t.sunrise.getTime()+45*60*1e3):null),l=q.getEventTiming(r,m,this.selectedDayIndex,e.date,"morning",p.score,g),$=t.goldenHourEvening&&t.goldenHourEvening.start||(t.sunset?new Date(t.sunset.getTime()-45*60*1e3):null),w=t.blueHourEvening&&t.blueHourEvening.end||(t.sunset?new Date(t.sunset.getTime()+45*60*1e3):null),x=q.getEventTiming($,w,this.selectedDayIndex,e.date,"evening",k.score,g);let H=null,C=null;t.astronomicalDusk&&(v&&t.astronomicalDawn&&g<t.astronomicalDawn?(H=new Date(t.astronomicalDusk.getTime()-24*60*60*1e3),C=t.astronomicalDawn):(H=t.astronomicalDusk,C=t.astronomicalDawn?new Date(t.astronomicalDawn.getTime()+24*60*60*1e3):new Date(H.getTime()+9*60*60*1e3)));const h=q.getEventTiming(H,C,this.selectedDayIndex,e.date,"astro",c.score,g),y=["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"];let j="",L="";if(v)j=`I dag (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${y[e.date.getMonth()]})`,t.sunset&&g>t.sunset?L="Dagens soltimer er passeret • Tryk 'I morgen' for næste dagslys":D.status==="active"?L=n.score>=50?`Aktuel nu: ${n.typeName} (${n.timeWindowLabel||"aktiv lige nu"})`:`Aktuel nu: ${n.typeName}`:l.status==="active"?L=p.score>=50?"Aktuel lige nu: Daggry & gylden time!":"Aktuel lige nu: Daggry (skydækket morgen)":x.status==="active"?L=k.score>=50?"Aktuel lige nu: Solnedgang & aftenlys!":"Aktuel lige nu: Solnedgang (skjult bag skyer)":$&&g<$?L=`Næste: Gylden time i aften kl. ${i.formatTime($)} (om ${i.formatDuration($.getTime()-g.getTime())})`:H&&g<H?L=c.score>=60?`Næste: Stjernehimmel i aften kl. ${i.formatTime(H)} (om ${i.formatDuration(H.getTime()-g.getTime())})`:`Næste: Astronomisk mørke i aften kl. ${i.formatTime(H)} (om ${i.formatDuration(H.getTime()-g.getTime())})`:L="Dagens soltimer er passeret • Vælg 'I morgen' for næste dagslys";else if(T){j=`I morgen (${e.dayName.toLowerCase()} d. ${e.date.getDate()}. ${y[e.date.getMonth()]})`;const a=t.blueHourMorning?.start||t.sunrise,M=a?Math.max(0,a.getTime()-g.getTime()):0;L=`Første fotomulighed: Daggry kl. ${i.formatTime(a)} (om ${i.formatDuration(M)}) • Vejrudsigt for i morgen`}else j=`${e.dayName} d. ${e.date.getDate()}. ${y[e.date.getMonth()]}`,L=`7-dages vejrudsigt for ${this.currentLocation.name}`;const A=a=>a>=70?"score-high":a>=40?"score-moderate":"score-low",_=a=>`
      <div class="card-timing-banner ${a.bannerClass}">
        <div class="timing-banner-left">
          <span class="timing-icon">${a.icon}</span>
          <span class="timing-label">${a.label}</span>
        </div>
        <span class="timing-banner-pill">${a.pill}</span>
      </div>
    `,N=(a,M,V)=>!a||!v||this.parsedDays.length<=1?"":`
        <div class="card-passed-action">
          <span class="passed-note-text">ℹ️ ${M}</span>
          <button type="button" class="btn-jump-tomorrow" data-jump-day="1">${V} ➔</button>
        </div>
      `;let Y=`${i.formatTime(t.sunrise)} / ${i.formatTime(t.sunset)}`,z="Solopgang • Solnedgang",G=`<span style="color:var(--golden-primary);">Gylden: ${i.formatTime(t.goldenHourEvening?.start)} - ${i.formatTime(t.sunset)}</span>`;if(v)if(t.sunset&&g>t.sunset)Y+=' <span class="time-passed-tag">Passeret</span>',z="Solopgang • Solnedgang (dagens soltimer er forbi)",G=`<span style="color:var(--text-dim);">Aftenlys afsluttet for i dag • Tryk 'I morgen'</span>`;else if(t.sunrise&&g>t.sunrise){z=`Solopgang var for ${i.formatDuration(g.getTime()-t.sunrise.getTime())} siden`;const a=t.goldenHourEvening?.start||t.sunset?i.formatDuration((t.goldenHourEvening?.start||t.sunset).getTime()-g.getTime()):"";G=`<span style="color:var(--golden-primary);">Aftenlys i aften kl. ${i.formatTime(t.goldenHourEvening?.start||t.sunset)} (om ${a})</span>`}else{const a=t.sunrise?i.formatDuration(t.sunrise.getTime()-g.getTime()):"";z=`Solopgang i morges/dag kl. ${i.formatTime(t.sunrise)} (om ${a})`}else T&&(z=`Solopgang i morgen kl. ${i.formatTime(t.sunrise)} • Solnedgang kl. ${i.formatTime(t.sunset)}`);const I=e.moonTimes?.riseAzimuth,O=e.moonTimes?.setAzimuth,P=I!=null?` (${I.toFixed(0)}° ${R.getCompassDirection(I)})`:"",W=O!=null?` (${O.toFixed(0)}° ${R.getCompassDirection(O)})`:"";let B=`Op: ${i.formatTime(e.moonTimes?.rise)}${P} • Ned: ${i.formatTime(e.moonTimes?.set)}${W}`;if(v){const a=e.moonTimes?.rise?g>e.moonTimes.rise?`Op kl. ${i.formatTime(e.moonTimes.rise)}${P}`:`Op kl. ${i.formatTime(e.moonTimes.rise)}${P} (om ${i.formatDuration(e.moonTimes.rise.getTime()-g.getTime())})`:"Går ikke op",M=e.moonTimes?.set?`Ned kl. ${i.formatTime(e.moonTimes.set)}${W}`:"Går ikke ned";B=`${a} • ${M}`}else T&&(B=`I morgen: Op kl. ${i.formatTime(e.moonTimes?.rise)}${P} • Ned kl. ${i.formatTime(e.moonTimes?.set)}${W}`);const o=g.getHours(),S=t.sunrise?R.getSunPosition(t.sunrise,this.currentLocation.lat,this.currentLocation.lng):null,b=t.sunset?R.getSunPosition(t.sunset,this.currentLocation.lat,this.currentLocation.lng):null,f=S?`${S.azimuth.toFixed(0)}° ${R.getCompassDirection(S.azimuth)}`:"",F=b?`${b.azimuth.toFixed(0)}° ${R.getCompassDirection(b.azimuth)}`:"";s.innerHTML=`
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
            <span style="display:inline-flex;align-items:center;gap:4px;"><span>${d.icon}</span> Måne</span>
            <button class="btn-goto-sol" data-body="moon" data-time="${e.moonTimes?.rise?e.moonTimes.rise.getTime():e.date.getTime()}" style="padding:1px 7px;font-size:10px;" title="Se måneopgang og måneretning i Sol/Måne-modulet">
              Sol/Måne →
            </button>
          </div>
          <div class="astro-sub-val">${d.fraction}% • ${d.name}</div>
          <div class="astro-sub-detail">${B}</div>
          <div class="astro-sub-detail" style="color:var(--accent-weather);">Astro nat: ${t.nightSky?.start?`${i.formatTime(t.nightSky.start)} - ${i.formatTime(t.nightSky.end)}`:"Lyse nætter"}</div>
        </div>
      </div>

      <!-- FOTOGRAFISKE ANALYSE-KORT -->
      <div class="photo-event-grid" style="margin-top: 14px;">
        <!-- 1. Morgentåge & Dis / Tæt Tåge -->
        <div class="photo-card ${D.isPassed?"card-event-passed":""}">
          ${_(D)}
          <div class="photo-card-top">
            <span class="photo-card-title">${n.icon} ${n.typeName||"Morgentåge & Dis"}</span>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
              ${n.typeBadge?`<span class="photo-type-badge ${n.badgeClass||""}">${n.typeBadge}</span>`:""}
              <span class="photo-score-badge ${A(n.score)}">${n.score}/100 • ${n.level}</span>
            </div>
          </div>
          <div class="photo-card-time">
            Tidsvindue: ${n.timeWindowLabel||`ca. ${i.formatTime(u)} - ${i.formatTime(E)}`}
            ${D.isPassed?'<span class="time-passed-tag">Afsluttet</span>':`• ${D.sub}`}
          </div>
          <div class="photo-card-desc">${n.text}</div>
          ${n.photoTip?`<div class="photo-card-tip">💡 <strong>Fototip:</strong> ${n.photoTip}</div>`:""}
          ${N(D.isPassed,"Tågeperioden er overstået for i dag. Tjek i morgen?","Se tåge i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Dugpunkt: Δ${n.avgSpread}°C • Fugt: ${n.avgHumidity}% • Vind: ${n.avgWind} m/s • Sigt: ${n.minVisibilityKm} km</span>
          </div>
        </div>

        <!-- 2. Gylden Time Morgen -->
        <div class="photo-card ${l.isPassed?"card-event-passed":""}">
          ${_(l)}
          <div class="photo-card-top">
            <span class="photo-card-title">${p.icon} Morgenlys (Solopgang)</span>
            <span class="photo-score-badge ${A(p.score)}">${p.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${i.formatTime(t.sunrise)} - ${i.formatTime(t.goldenHourMorning?.end)}
            ${f?`<span class="compass-direction-tag" title="Solens kompasretning ved solopgang">🧭 ${f}</span>`:""}
            ${l.isPassed?`<span class="time-passed-tag">Passeret (kl. ${i.formatTime(t.sunrise)})</span>`:`• ${l.sub}`}
          </div>
          <div class="photo-card-desc">${p.text}</div>
          ${N(l.isPassed,"Morgenens gyldne time fandt sted i morges. Tjek i morgen?","Se daggry i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${p.clouds.total}% (Lav: ${p.clouds.low}%, Mellem: ${p.clouds.mid}%, Høj: ${p.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${t.sunrise?t.sunrise.getTime():e.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 3. Gylden Time Aften & Solnedgang -->
        <div class="photo-card ${x.isPassed?"card-event-passed":""}">
          ${_(x)}
          <div class="photo-card-top">
            <span class="photo-card-title">${k.icon} Aftenlys (Solnedgang)</span>
            <span class="photo-score-badge ${A(k.score)}">${k.score}/100</span>
          </div>
          <div class="photo-card-time">
            Gylden time: ${i.formatTime(t.goldenHourEvening?.start)} - ${i.formatTime(t.sunset)}
            ${F?`<span class="compass-direction-tag" title="Solens kompasretning ved solnedgang">🧭 ${F}</span>`:""}
            ${x.isPassed?'<span class="time-passed-tag">Passeret i aften</span>':`• ${x.sub}`}
          </div>
          <div class="photo-card-desc">${k.text}</div>
          ${N(x.isPassed,"Aftenens solnedgang fandt sted tidligere i aften. Tjek i morgen?","Se solnedgang i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">Skyer: ${k.clouds.total}% (Lav: ${k.clouds.low}%, Mellem: ${k.clouds.mid}%, Høj: ${k.clouds.high}%)</span>
            <button class="btn-goto-sol" data-time="${t.sunset?t.sunset.getTime():e.date.getTime()}" title="Åbn Sol/Måne-modulet på dette tidspunkt">
              ☀ Åbn i Sol/Måne →
            </button>
          </div>
        </div>

        <!-- 4. Stjernehimmel & Nat (Astro) -->
        <div class="photo-card ${h.isPassed?"card-event-passed":""}">
          ${_(h)}
          <div class="photo-card-top">
            <span class="photo-card-title">${c.icon} Stjernehimmel (Astro)</span>
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
              ${c.hasNightFog?'<span class="photo-type-badge badge-night-fog">Nattetåge</span>':""}
              <span class="photo-score-badge ${A(c.score)}">${c.score}/100 • ${c.status}</span>
            </div>
          </div>
          <div class="photo-card-time">
            Astronomisk mørke: ${t.nightSky?.start?`${i.formatTime(t.nightSky.start)} - ${i.formatTime(t.nightSky.end)}`:"Ingen astro-nat (lyse nætter)"}
            ${h.isPassed?'<span class="time-passed-tag">Natten er ovre</span>':`• ${h.sub}`}
          </div>
          <div class="photo-card-desc">${c.text}</div>
          ${c.nightFogTip?`
            <div class="photo-card-tip astro-fog-tip">
              💡 <strong>Nattetåge:</strong> ${c.nightFogTip}
            </div>
          `:""}
          ${N(h.isPassed,"Astronomisk mørke for denne nat er ovre. Tjek næste nat?","Se stjernehimmel i morgen")}
          <div class="photo-card-footer">
            <span style="font-size:11px;color:var(--text-dim);">${c.moonImpact}</span>
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
            ${e.hourly.map(a=>{let M="hourly-col",V=`<span class="hour-badge">${String(a.hour).padStart(2,"0")}:00</span>`;return v&&(a.hour<o?(M+=" hourly-past-hour",V+='<span class="hour-past-pill">forbi</span>'):a.hour===o&&(M+=" hourly-current-hour",V+='<span class="hour-now-badge">NU</span>')),`
                <div class="${M}">
                  ${V}
                  <span>${a.weatherIcon}</span>
                  <span class="hour-temp">${Math.round(a.temp)}°</span>
                  <span class="hour-clouds">☁️ ${a.cloudTotal}%</span>
                  <span class="hour-wind">💨 ${a.windSpeed.toFixed(0)}m/s</span>
                  <span style="font-size:9px;color:var(--text-dim);">${(a.visibility/1e3).toFixed(0)}km</span>
                </div>
              `}).join("")}
          </div>
        </div>
      </div>
    `,s.querySelectorAll(".btn-jump-tomorrow").forEach(a=>{a.addEventListener("click",()=>{const M=Number(a.dataset.jumpDay??1);this.selectDay(M)})}),s.querySelectorAll(".btn-goto-sol, .btn-goto-fotosol").forEach(a=>{a.addEventListener("click",()=>{const M=a,V=Number(M.dataset.time),J=M.dataset.body||"sun",U=new Date(V);i.setDate(U),te.navigate("#/sol",{date:U,body:J,lat:this.currentLocation.lat,lng:this.currentLocation.lng,name:this.currentLocation.name})})})}}export{oe as default};
