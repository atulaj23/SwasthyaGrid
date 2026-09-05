export type Status='NORMAL'|'WARNING'|'CRITICAL';
export type Phc={
  id:number;name:string;country:string;code:string;
  region:string;district:string;lat:number;lng:number;
  population:number;status:Status;beds:number;occupied:number;
  staff:number;present:number;footfall:number;baseline:number;
  stock:number;dailyUse:number;medicine:string;medicineRisk:Status;
  /**
   * "verified"  — facility name & location sourced from OpenStreetMap,
   *               government registry, or academic publication.
   * "simulated" — name/location is illustrative; coordinates are
   *               approximate city/district centres.
   * In both cases, ALL operational metrics (beds, stock, footfall,
   * staff, etc.) are SIMULATED FOR DEMONSTRATION and do NOT represent
   * real clinical or administrative data.
   */
  locationSource:'verified'|'simulated';
};

/* ═══════════════════════════════════════════════════════════════
   BRICS NETWORK FACILITY REGISTRY
   ═══════════════════════════════════════════════════════════════
   Location sources:
     verified  — confirmed via OpenStreetMap node/way, government
                 health-facility directory, or peer-reviewed source.
     simulated — illustrative; coordinates are approximate
                 city/district centres.

   ALL OPERATIONAL METRICS ARE SIMULATED FOR DEMONSTRATION.
   ─────────────────────────────────────────────────────────────── */

/* ── INDIA ───────────────────────────────────────────────────────
   Sources: OpenStreetMap India health layer; UP NHM HMIS;
   Maharashtra, Karnataka, Delhi public facility registers.
   ─────────────────────────────────────────────────────────────── */
const india:Omit<Phc,'id'|'status'|'beds'|'occupied'|'staff'|'present'|'footfall'|'stock'|'dailyUse'|'medicineRisk'>[]=[
  // ── Uttar Pradesh — Sonbhadra — Myorpur (VERIFIED OSM) ───────
  {name:'Lojhara AAM-PHC',      country:'India',code:'IN',region:'Uttar Pradesh',district:'Sonbhadra',   lat:24.163,lng:83.146,population:12400,baseline:95, medicine:'ORS',         locationSource:'verified'},
  {name:'PHC Kakrahi',           country:'India',code:'IN',region:'Uttar Pradesh',district:'Sonbhadra',   lat:24.211,lng:83.178,population:9800, baseline:110,medicine:'Paracetamol', locationSource:'verified'},
  {name:'PHC Chatra',            country:'India',code:'IN',region:'Uttar Pradesh',district:'Sonbhadra',   lat:24.186,lng:83.092,population:11200,baseline:100,medicine:'Amoxicillin', locationSource:'verified'},
  // ── Uttar Pradesh — Lucknow ───────────────────────────────────
  {name:'PHC Lucknow Sadar',     country:'India',code:'IN',region:'Uttar Pradesh',district:'Lucknow',     lat:26.846,lng:80.946,population:22000,baseline:108,medicine:'ORS',         locationSource:'simulated'},
  {name:'PHC Aliganj',           country:'India',code:'IN',region:'Uttar Pradesh',district:'Lucknow',     lat:26.874,lng:80.953,population:18500,baseline:120,medicine:'Paracetamol', locationSource:'simulated'},
  // ── Maharashtra — Mumbai & Pune ───────────────────────────────
  {name:'PHC Harbour',           country:'India',code:'IN',region:'Maharashtra',  district:'Mumbai',      lat:19.076,lng:72.878,population:12300,baseline:115,medicine:'ORS',         locationSource:'simulated'},
  {name:'PHC Sahyadri',          country:'India',code:'IN',region:'Maharashtra',  district:'Pune',        lat:18.520,lng:73.857,population:10600,baseline:100,medicine:'Amoxicillin', locationSource:'simulated'},
  {name:'PHC Dharavi',           country:'India',code:'IN',region:'Maharashtra',  district:'Mumbai',      lat:19.041,lng:72.855,population:15800,baseline:130,medicine:'Paracetamol', locationSource:'simulated'},
  // ── Karnataka — Bengaluru ─────────────────────────────────────
  {name:'PHC Central Bengaluru', country:'India',code:'IN',region:'Karnataka',    district:'Bengaluru',   lat:12.972,lng:77.595,population:17200,baseline:125,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'PHC Rajajinagar',       country:'India',code:'IN',region:'Karnataka',    district:'Bengaluru',   lat:12.993,lng:77.552,population:14100,baseline:110,medicine:'ORS',         locationSource:'simulated'},
  // ── Delhi ─────────────────────────────────────────────────────
  {name:'PHC Yamuna',            country:'India',code:'IN',region:'Delhi',        district:'New Delhi',   lat:28.614,lng:77.209,population:16400,baseline:120,medicine:'ORS',         locationSource:'simulated'},
  // ── Gujarat ───────────────────────────────────────────────────
  {name:'PHC Sabarmati',         country:'India',code:'IN',region:'Gujarat',      district:'Ahmedabad',   lat:23.022,lng:72.572,population:13500,baseline:105,medicine:'Amoxicillin', locationSource:'simulated'},
];

/* ── BRAZIL ──────────────────────────────────────────────────────
   Sources: CNES (Cadastro Nacional de Estabelecimentos de Saúde)
   public directory; OpenStreetMap Brazil health nodes.
   ─────────────────────────────────────────────────────────────── */
const brazil:Omit<Phc,'id'|'status'|'beds'|'occupied'|'staff'|'present'|'footfall'|'stock'|'dailyUse'|'medicineRisk'>[]=[
  // ── São Paulo ─────────────────────────────────────────────────
  {name:'UBS Paulista',          country:'Brazil',code:'BR',region:'São Paulo',   district:'SP-Central',  lat:-23.549,lng:-46.637,population:14200,baseline:115,medicine:'ORS',         locationSource:'simulated'},
  {name:'UBS Vila Maria',        country:'Brazil',code:'BR',region:'São Paulo',   district:'São Paulo',   lat:-23.518,lng:-46.620,population:11800,baseline:108,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'UBS Saúde Grajaú',      country:'Brazil',code:'BR',region:'São Paulo',   district:'São Paulo',   lat:-23.683,lng:-46.697,population:16500,baseline:130,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── Rio de Janeiro ────────────────────────────────────────────
  {name:'UBS Carioca Norte',     country:'Brazil',code:'BR',region:'Rio',         district:'Rio-Norte',   lat:-22.907,lng:-43.173,population:13400,baseline:118,medicine:'ORS',         locationSource:'simulated'},
  {name:'UBS Rocinha',           country:'Brazil',code:'BR',region:'Rio',         district:'Rio Sul',     lat:-22.988,lng:-43.248,population:19200,baseline:140,medicine:'Paracetamol', locationSource:'simulated'},
  // ── Bahia ─────────────────────────────────────────────────────
  {name:'UBS Shoreline Salvador',country:'Brazil',code:'BR',region:'Bahia',       district:'Salvador-Sul',lat:-12.971,lng:-38.501,population:12100,baseline:104,medicine:'Amoxicillin', locationSource:'simulated'},
  {name:'UBS Liberdade',         country:'Brazil',code:'BR',region:'Bahia',       district:'Salvador',    lat:-12.975,lng:-38.517,population:10400,baseline:96, medicine:'ORS',         locationSource:'simulated'},
  // ── Paraná ────────────────────────────────────────────────────
  {name:'UBS Araucaria',         country:'Brazil',code:'BR',region:'Paraná',      district:'Curitiba',    lat:-25.429,lng:-49.271,population:11900,baseline:108,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'UBS Bairro Novo',       country:'Brazil',code:'BR',region:'Paraná',      district:'Curitiba',    lat:-25.498,lng:-49.341,population:10200,baseline:100,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── Pernambuco ────────────────────────────────────────────────
  {name:'UBS Recife Centro',     country:'Brazil',code:'BR',region:'Pernambuco',  district:'Recife',      lat:-8.054, lng:-34.881,population:13800,baseline:112,medicine:'ORS',         locationSource:'simulated'},
  // ── Amazonas ──────────────────────────────────────────────────
  {name:'UBS Manaus Leste',      country:'Brazil',code:'BR',region:'Amazonas',    district:'Manaus',      lat:-3.119, lng:-60.021,population:15400,baseline:122,medicine:'Paracetamol', locationSource:'simulated'},
];

/* ── RUSSIA ──────────────────────────────────────────────────────
   Sources: Russian Ministry of Health open register;
   OpenStreetMap Russia polyclinic nodes.
   ─────────────────────────────────────────────────────────────── */
const russia:Omit<Phc,'id'|'status'|'beds'|'occupied'|'staff'|'present'|'footfall'|'stock'|'dailyUse'|'medicineRisk'>[]=[
  // ── Moscow Oblast ─────────────────────────────────────────────
  {name:'Polyclinic Moscow Central',country:'Russia',code:'RU',region:'Moscow',      district:'Central',    lat:55.756,lng:37.617,population:18400,baseline:140,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'Polyclinic Zamoskvorechye',country:'Russia',code:'RU',region:'Moscow',      district:'South',      lat:55.731,lng:37.630,population:16200,baseline:130,medicine:'ORS',         locationSource:'simulated'},
  {name:'Polyclinic Sokolniki',      country:'Russia',code:'RU',region:'Moscow',     district:'East',       lat:55.786,lng:37.682,population:14800,baseline:120,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── St Petersburg ─────────────────────────────────────────────
  {name:'Polyclinic Petersburg West',country:'Russia',code:'RU',region:'St Petersburg',district:'Nevsky',   lat:59.934,lng:30.335,population:15600,baseline:125,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'Polyclinic Vasilyevsky',    country:'Russia',code:'RU',region:'St Petersburg',district:'Vasilyevsky',lat:59.942,lng:30.274,population:13900,baseline:115,medicine:'ORS',         locationSource:'simulated'},
  // ── Novosibirsk ───────────────────────────────────────────────
  {name:'Polyclinic Novosibirsk-1',  country:'Russia',code:'RU',region:'Novosibirsk',district:'Central',    lat:55.030,lng:82.921,population:14200,baseline:115,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── Irkutsk / Siberia ─────────────────────────────────────────
  {name:'Polyclinic Siberia East',   country:'Russia',code:'RU',region:'Irkutsk',    district:'Irkutsk-1',  lat:52.287,lng:104.305,population:11800,baseline:105,medicine:'ORS',         locationSource:'simulated'},
  // ── Ekaterinburg ──────────────────────────────────────────────
  {name:'Polyclinic Ural',           country:'Russia',code:'RU',region:'Sverdlovsk', district:'Ekaterinburg',lat:56.838,lng:60.597,population:13400,baseline:110,medicine:'Paracetamol', locationSource:'simulated'},
  // ── Kazan ─────────────────────────────────────────────────────
  {name:'Polyclinic Kazan Tsentralny',country:'Russia',code:'RU',region:'Tatarstan', district:'Kazan',      lat:55.796,lng:49.106,population:12600,baseline:108,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── Krasnodar ─────────────────────────────────────────────────
  {name:'Polyclinic Krasnodar',      country:'Russia',code:'RU',region:'Krasnodar',  district:'Krasnodar',  lat:45.035,lng:38.975,population:11400,baseline:100,medicine:'ORS',         locationSource:'simulated'},
];

/* ── CHINA ───────────────────────────────────────────────────────
   Sources: China MOH community health centre registry;
   OpenStreetMap China clinic nodes (社区卫生服务中心).
   ─────────────────────────────────────────────────────────────── */
const china:Omit<Phc,'id'|'status'|'beds'|'occupied'|'staff'|'present'|'footfall'|'stock'|'dailyUse'|'medicineRisk'>[]=[
  // ── Beijing ───────────────────────────────────────────────────
  {name:'CHC Beijing Fengtai',   country:'China',code:'CN',region:'Beijing',    district:'Fengtai',    lat:39.904,lng:116.407,population:18500,baseline:140,medicine:'ORS',         locationSource:'simulated'},
  {name:'CHC Beijing Chaoyang',  country:'China',code:'CN',region:'Beijing',    district:'Chaoyang',   lat:39.921,lng:116.443,population:21400,baseline:155,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'CHC Beijing Haidian',   country:'China',code:'CN',region:'Beijing',    district:'Haidian',    lat:40.009,lng:116.298,population:16800,baseline:130,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── Shanghai ──────────────────────────────────────────────────
  {name:'CHC Shanghai Putuo',    country:'China',code:'CN',region:'Shanghai',   district:'Putuo',      lat:31.230,lng:121.474,population:22000,baseline:158,medicine:'ORS',         locationSource:'simulated'},
  {name:'CHC Shanghai Xuhui',    country:'China',code:'CN',region:'Shanghai',   district:'Xuhui',      lat:31.183,lng:121.438,population:19400,baseline:145,medicine:'Paracetamol', locationSource:'simulated'},
  // ── Guangdong ─────────────────────────────────────────────────
  {name:'CHC Pearl Delta',       country:'China',code:'CN',region:'Guangdong',  district:'Guangzhou',  lat:23.130,lng:113.264,population:17600,baseline:135,medicine:'Amoxicillin', locationSource:'simulated'},
  {name:'CHC Shenzhen Futian',   country:'China',code:'CN',region:'Guangdong',  district:'Shenzhen',   lat:22.548,lng:114.057,population:24500,baseline:170,medicine:'ORS',         locationSource:'simulated'},
  // ── Hubei / Wuhan ─────────────────────────────────────────────
  {name:'CHC Wuhan East',        country:'China',code:'CN',region:'Hubei',      district:'Wuchang',    lat:30.593,lng:114.306,population:16200,baseline:125,medicine:'Paracetamol', locationSource:'simulated'},
  // ── Sichuan ───────────────────────────────────────────────────
  {name:'CHC Chengdu Jinjiang',  country:'China',code:'CN',region:'Sichuan',    district:'Chengdu',    lat:30.657,lng:104.066,population:18900,baseline:138,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── Liaoning ──────────────────────────────────────────────────
  {name:'CHC Shenyang Shenhe',   country:'China',code:'CN',region:'Liaoning',   district:'Shenyang',   lat:41.805,lng:123.431,population:14300,baseline:112,medicine:'ORS',         locationSource:'simulated'},
  // ── Shaanxi ───────────────────────────────────────────────────
  {name:"CHC Xi'an Beilin",      country:'China',code:'CN',region:"Shaanxi",    district:"Xi'an",      lat:34.266,lng:108.954,population:15800,baseline:120,medicine:'Paracetamol', locationSource:'simulated'},
];

/* ── SOUTH AFRICA ────────────────────────────────────────────────
   Sources: DHIS2 South Africa; OpenStreetMap ZA clinic nodes;
   Western Cape PHCIS; GeoPortal ZA.
   ─────────────────────────────────────────────────────────────── */
const southAfrica:Omit<Phc,'id'|'status'|'beds'|'occupied'|'staff'|'present'|'footfall'|'stock'|'dailyUse'|'medicineRisk'>[]=[
  // ── Gauteng ───────────────────────────────────────────────────
  {name:'CHC Soweto North',      country:'South Africa',code:'ZA',region:'Gauteng',       district:'Johannesburg',lat:-26.204,lng:28.047,population:16200,baseline:130,medicine:'ORS',         locationSource:'simulated'},
  {name:'CHC Alexandra',         country:'South Africa',code:'ZA',region:'Gauteng',       district:'Johannesburg',lat:-26.100,lng:28.089,population:18400,baseline:145,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'CHC Tshwane Central',   country:'South Africa',code:'ZA',region:'Gauteng',       district:'Tshwane',     lat:-25.746,lng:28.188,population:14800,baseline:118,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── Western Cape ──────────────────────────────────────────────
  {name:'CHC Khayelitsha',       country:'South Africa',code:'ZA',region:'Western Cape',  district:'Cape Town',   lat:-33.925,lng:18.424,population:22000,baseline:160,medicine:'ORS',         locationSource:'simulated'},
  {name:'CHC Mitchell\'s Plain', country:'South Africa',code:'ZA',region:'Western Cape',  district:'Cape Town',   lat:-34.046,lng:18.614,population:19600,baseline:148,medicine:'Paracetamol', locationSource:'simulated'},
  {name:'CHC Bellville',         country:'South Africa',code:'ZA',region:'Western Cape',  district:'Cape Town',   lat:-33.898,lng:18.630,population:14200,baseline:115,medicine:'Amoxicillin', locationSource:'simulated'},
  // ── KwaZulu-Natal ─────────────────────────────────────────────
  {name:'CHC Durban Port',       country:'South Africa',code:'ZA',region:'KwaZulu-Natal', district:'eThekwini',   lat:-29.859,lng:31.022,population:17400,baseline:135,medicine:'ORS',         locationSource:'simulated'},
  {name:'CHC Umlazi',            country:'South Africa',code:'ZA',region:'KwaZulu-Natal', district:'eThekwini',   lat:-29.970,lng:30.894,population:20100,baseline:150,medicine:'Paracetamol', locationSource:'simulated'},
  // ── Eastern Cape ──────────────────────────────────────────────
  {name:'CHC Bayview Gqeberha',  country:'South Africa',code:'ZA',region:'Eastern Cape',  district:'Gqeberha',    lat:-33.960,lng:25.600,population:13100,baseline:108,medicine:'Amoxicillin', locationSource:'simulated'},
  {name:'CHC East London',       country:'South Africa',code:'ZA',region:'Eastern Cape',  district:'Buffalo City', lat:-33.015,lng:27.912,population:12400,baseline:102,medicine:'ORS',         locationSource:'simulated'},
  // ── Limpopo ───────────────────────────────────────────────────
  {name:'CHC Polokwane',         country:'South Africa',code:'ZA',region:'Limpopo',       district:'Polokwane',   lat:-23.900,lng:29.468,population:11600,baseline:96, medicine:'Paracetamol', locationSource:'simulated'},
];

/* ── Build PHC objects ────────────────────────────────────────── */
const allFacilities=[...india,...brazil,...russia,...china,...southAfrica];

// Deterministic status/metric assignment
const criticalIdx=[0,11,21,31,42];   // Lojhara, CHC Wuhan East, UBS Rocinha, Polyclinic Siberia, CHC Alexandra
const warningIdx =[1,2,12,22,27,32,38,41,45,49]; // spread across all countries

export let phcs:Phc[]=allFacilities.map((f,i)=>{
  const isCrit  =criticalIdx.includes(i);
  const isWarn  =warningIdx.includes(i);
  const beds    =isCrit?6 :isWarn?12:24+(i%5)*4;
  const occupied=isCrit?Math.floor(beds*.94):isWarn?Math.floor(beds*.82):Math.floor(beds*(.45+(i%4)*.06));
  const stock   =isCrit?35:isWarn?165:480+(i%3)*90;
  const dailyUse=isCrit?16:isWarn?13:8+(i%4);
  const staff   =isCrit?8 :isWarn?8 :10+(i%4);
  const present =isCrit?5 :isWarn?6 :8+(i%3);
  const footfall=Math.round(f.baseline*(isCrit?1.9:isWarn?1.3:0.8+(i%7)*.06));
  return {
    id:i+1,
    ...f,
    status:(isCrit?'CRITICAL':isWarn?'WARNING':'NORMAL') as Status,
    beds,occupied,staff,present,footfall,
    stock,dailyUse,
    medicineRisk:(isCrit?'CRITICAL':isWarn?'WARNING':'NORMAL') as Status,
    simulated:true,
  };
});

export let emergency={active:false,scenario:'',multiplier:1,readiness:82};
export let federated={
  round:0,global:74.5,history:[74.5],
  nodes:[
    ['India','IN',72.1,24500],['Brazil','BR',71.4,11200],
    ['Russia','RU',69.8,9800],['China','CN',75.2,41000],
    ['South Africa','ZA',70.5,13500],
  ].map(x=>({country:x[0],code:x[1],accuracy:x[2] as number,samples:x[3] as number,status:'READY'})),
};

export function snapshot(){
  const list=phcs.map(p=>({
    ...p,
    stock:Math.max(0,Math.round(p.stock-(emergency.multiplier-1)*p.dailyUse*2)),
    footfall:Math.round(p.footfall*emergency.multiplier),
  }));

  const byCountry=(code:string)=>list.filter(p=>p.code===code);
  const countryStat=(code:string)=>{
    const ps=byCountry(code);
    return {
      total:ps.length,
      critical:ps.filter(p=>p.status==='CRITICAL').length,
      warning: ps.filter(p=>p.status==='WARNING').length,
      stockoutRisks:ps.filter(p=>p.dailyUse&&p.stock/p.dailyUse<7).length,
      bedPressure:  ps.filter(p=>p.occupied/p.beds>.85).length,
    };
  };

  // UP/Sonbhadra drill-down preserved for backward compat
  const upPhcsList   =list.filter(p=>p.region==='Uttar Pradesh');
  const sonbhadraList=list.filter(p=>p.district==='Sonbhadra');

  return {
    phcs:list,
    network:{
      total:list.length,
      critical:list.filter(p=>p.status==='CRITICAL').length,
      warnings:list.filter(p=>p.status==='WARNING').length,
      stockoutRisks:list.filter(p=>p.dailyUse?p.stock/p.dailyUse<7:false).length,
      bedPressure:  list.filter(p=>p.occupied/p.beds>.85).length,
      patientSurges:list.filter(p=>p.footfall>p.baseline*1.25).length,
    },
    countries:{
      IN:countryStat('IN'),
      BR:countryStat('BR'),
      RU:countryStat('RU'),
      CN:countryStat('CN'),
      ZA:countryStat('ZA'),
    },
    // Legacy field — kept for backward compatibility with analytics/dashboard pages
    india:{
      total:byCountry('IN').length,
      critical:byCountry('IN').filter(p=>p.status==='CRITICAL').length,
      up:{
        total:upPhcsList.length,
        critical:upPhcsList.filter(p=>p.status==='CRITICAL').length,
        sonbhadra:{
          total:sonbhadraList.length,
          critical:sonbhadraList.filter(p=>p.status==='CRITICAL').length,
        },
      },
    },
    emergency,
  };
}

export function activate(scenario:string){
  emergency={active:true,scenario,multiplier:scenario==='flood'?2.5:scenario==='dengue'?2.2:scenario==='respiratory'?2:1.6,readiness:68};
  return snapshot();
}
export function deactivate(){emergency={active:false,scenario:'',multiplier:1,readiness:82};return snapshot();}
export function train(){
  federated.round+=1;
  federated.global=Number(Math.min(97.2,federated.global+1.7).toFixed(1));
  federated.history.push(federated.global);
  federated.nodes=federated.nodes.map((n,i)=>({
    ...n,accuracy:Number(Math.min(95,n.accuracy+1.1+(i*.08)).toFixed(1)),status:'COMPLETED',
  }));
  return federated;
}
