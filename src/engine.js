/* Through The Eras — game engine (pure logic, no DOM) */
'use strict';
var ENGINE = (function () {
  const CLUBS = {
    ARS:{name:'Arsenal',col:'#EF0107',col2:'#FFFFFF',std:'Emirates Stadium',mgr:'Mikel Arteta',budget:120,pres:86,exp:'top4',wealth:1.35},
    AVL:{name:'Aston Villa',col:'#7A1D45',col2:'#95BFE5',std:'Villa Park',mgr:'Steven Gerrard',budget:60,pres:74,exp:'tophalf',wealth:1.0},
    BOU:{name:'Bournemouth',col:'#DA291C',col2:'#111111',std:'Vitality Stadium',mgr:'Scott Parker',budget:25,pres:62,exp:'survive',wealth:0.8},
    BRE:{name:'Brentford',col:'#E30613',col2:'#FFFFFF',std:'Gtech Community Stadium',mgr:'Thomas Frank',budget:35,pres:66,exp:'mid',wealth:0.8},
    BHA:{name:'Brighton',col:'#0057B8',col2:'#FFFFFF',std:'Amex Stadium',mgr:'Graham Potter',budget:50,pres:70,exp:'tophalf',wealth:0.9},
    CHE:{name:'Chelsea',col:'#034694',col2:'#FFFFFF',std:'Stamford Bridge',mgr:'Thomas Tuchel',budget:250,pres:90,exp:'top4',wealth:1.45},
    CRY:{name:'Crystal Palace',col:'#1B458F',col2:'#C4122E',std:'Selhurst Park',mgr:'Patrick Vieira',budget:35,pres:66,exp:'mid',wealth:0.85},
    EVE:{name:'Everton',col:'#003399',col2:'#FFFFFF',std:'Goodison Park',mgr:'Frank Lampard',budget:50,pres:72,exp:'mid',wealth:1.0},
    FUL:{name:'Fulham',col:'#E6E6E6',col2:'#111111',std:'Craven Cottage',mgr:'Marco Silva',budget:40,pres:63,exp:'survive',wealth:0.8},
    LEE:{name:'Leeds United',col:'#F2F2F2',col2:'#1D428A',std:'Elland Road',mgr:'Jesse Marsch',budget:50,pres:68,exp:'survive',wealth:0.85},
    LEI:{name:'Leicester City',col:'#003090',col2:'#FDBE11',std:'King Power Stadium',mgr:'Brendan Rodgers',budget:30,pres:74,exp:'tophalf',wealth:1.0},
    LIV:{name:'Liverpool',col:'#C8102E',col2:'#F6EB61',std:'Anfield',mgr:'Jürgen Klopp',budget:90,pres:93,exp:'title',wealth:1.4},
    MCI:{name:'Manchester City',col:'#6CABDD',col2:'#1C2C5B',std:'Etihad Stadium',mgr:'Pep Guardiola',budget:100,pres:95,exp:'title',wealth:1.5},
    MUN:{name:'Manchester United',col:'#DA291C',col2:'#FBE122',std:'Old Trafford',mgr:'Erik ten Hag',budget:150,pres:90,exp:'top4',wealth:1.45},
    NEW:{name:'Newcastle United',col:'#241F20',col2:'#FFFFFF',std:"St James' Park",mgr:'Eddie Howe',budget:100,pres:76,exp:'tophalf',wealth:1.1},
    NFO:{name:"Nottingham Forest",col:'#DD0000',col2:'#FFFFFF',std:'City Ground',mgr:'Steve Cooper',budget:120,pres:64,exp:'survive',wealth:0.85},
    SOU:{name:'Southampton',col:'#D71920',col2:'#FFFFFF',std:"St Mary's Stadium",mgr:'Ralph Hasenhüttl',budget:40,pres:64,exp:'survive',wealth:0.8},
    TOT:{name:'Tottenham Hotspur',col:'#F4F4F4',col2:'#132257',std:'Tottenham Hotspur Stadium',mgr:'Antonio Conte',budget:110,pres:86,exp:'top4',wealth:1.3},
    WHU:{name:'West Ham United',col:'#7A263A',col2:'#1BB1E7',std:'London Stadium',mgr:'David Moyes',budget:90,pres:75,exp:'tophalf',wealth:1.05},
    WOL:{name:'Wolverhampton Wanderers',col:'#FDB913',col2:'#231F20',std:'Molineux',mgr:'Bruno Lage',budget:60,pres:70,exp:'mid',wealth:0.9}
  };
  const SHORTNAME = {ARS:'Arsenal',AVL:'Aston Villa',BOU:'Bournemouth',BRE:'Brentford',BHA:'Brighton',CHE:'Chelsea',CRY:'Crystal Palace',EVE:'Everton',FUL:'Fulham',LEE:'Leeds',LEI:'Leicester',LIV:'Liverpool',MCI:'Man City',MUN:'Man Utd',NEW:'Newcastle',NFO:"Nott'm Forest",SOU:'Southampton',TOT:'Spurs',WHU:'West Ham',WOL:'Wolves'};
  const FOREIGN_PRES = {'Real Madrid':98,'Barcelona':94,'Bayern Munich':95,'Paris Saint-Germain':94,'Juventus':88,'Atlético Madrid':88,'Borussia Dortmund':85,'Benfica':80,'Ajax':80,'PSV':76,'Sporting CP':78,'Napoli':84,'AC Milan':86,'Inter':86};
  const FOREIGN_BUYERS = ['Real Madrid','Barcelona','Bayern Munich','Paris Saint-Germain','Juventus','AC Milan','Inter','Napoli','Borussia Dortmund','Atlético Madrid'];
  const RIVALS = {LIV:['MUN','EVE','MCI'],EVE:['LIV'],MUN:['LIV','MCI','LEE'],MCI:['MUN','LIV'],ARS:['TOT','CHE'],TOT:['ARS','CHE','WHU'],CHE:['TOT','ARS'],WHU:['TOT','MUN'],LEE:['MUN'],AVL:['WOL'],WOL:['AVL'],NEW:[],NFO:['LEI'],LEI:['NFO'],SOU:[],BOU:['SOU'],BHA:['CRY'],CRY:['BHA'],BRE:[],FUL:[]};
  const EXPECT = {title:{label:'Win the Premier League',pos:1,ok:2},top4:{label:'Finish in the top four',pos:4,ok:6},tophalf:{label:'Finish in the top half',pos:10,ok:12},mid:{label:'A comfortable mid-table finish',pos:12,ok:15},survive:{label:'Avoid relegation',pos:17,ok:17}};
  const REFS = ['Michael Oliver','Anthony Taylor','Paul Tierney','Simon Hooper','Stuart Attwell','Craig Pawson','Andy Madley','Chris Kavanagh','Peter Bankes','David Coote','Robert Jones','John Brooks','Jarred Gillett','Darren England','Michael Salisbury','Tony Harrington','Thomas Bramall','Andre Marriner'];
  // real 2022/23 manager changes (history replays unless your results change it)
  const REAL_SACKINGS = [
    {d:'2022-08-30',c:'BOU',out:'Scott Parker',inn:"Gary O'Neil",cond:'any'},
    {d:'2022-09-07',c:'CHE',out:'Thomas Tuchel',inn:'Graham Potter',cond:'board',fromC:'BHA'},
    {d:'2022-09-18',c:'BHA',out:'Graham Potter',inn:'Roberto De Zerbi',cond:'after',after:'CHE'},
    {d:'2022-10-24',c:'AVL',out:'Steven Gerrard',inn:'Unai Emery',cond:'poor'},
    {d:'2022-11-05',c:'WOL',out:'Bruno Lage',inn:'Julen Lopetegui',cond:'poor'},
    {d:'2022-11-07',c:'SOU',out:'Ralph Hasenhüttl',inn:'Nathan Jones',cond:'poor'},
    {d:'2023-01-23',c:'EVE',out:'Frank Lampard',inn:'Sean Dyche',cond:'poor'},
    {d:'2023-02-06',c:'LEE',out:'Jesse Marsch',inn:'Javi Gracia',cond:'poor'},
    {d:'2023-02-12',c:'SOU',out:'Nathan Jones',inn:'Rubén Sellés',cond:'poor'},
    {d:'2023-03-21',c:'CRY',out:'Patrick Vieira',inn:'Roy Hodgson',cond:'poor'},
    {d:'2023-03-26',c:'TOT',out:'Antonio Conte',inn:'Cristian Stellini',cond:'poor'},
    {d:'2023-04-02',c:'CHE',out:'Graham Potter',inn:'Frank Lampard',cond:'poor'},
    {d:'2023-04-10',c:'LEI',out:'Brendan Rodgers',inn:'Dean Smith',cond:'poor'}
  ];
  const FORMATIONS = {
    '4-3-3':   ['GK','RB','CB','CB','LB','DM','CM','CM','RW','ST','LW'],
    '4-2-3-1': ['GK','RB','CB','CB','LB','DM','DM','RW','AM','LW','ST'],
    '4-4-2':   ['GK','RB','CB','CB','LB','RM','CM','CM','LM','ST','ST'],
    '3-5-2':   ['GK','CB','CB','CB','RM','DM','CM','CM','LM','ST','ST'],
    '5-3-2':   ['GK','RB','CB','CB','CB','LB','DM','CM','CM','ST','ST']
  };
  // pitch coordinates (x 0-100 left-right, y 0 own goal -> 100 attack) per formation
  const COORDS = {
    '4-3-3':[[50,6],[86,28],[62,22],[38,22],[14,28],[50,44],[70,56],[30,56],[84,80],[50,88],[16,80]],
    '4-2-3-1':[[50,6],[86,28],[62,22],[38,22],[14,28],[64,44],[36,44],[84,70],[50,68],[16,70],[50,88]],
    '4-4-2':[[50,6],[86,28],[62,22],[38,22],[14,28],[86,58],[62,52],[38,52],[14,58],[62,86],[38,86]],
    '3-5-2':[[50,6],[72,24],[50,20],[28,24],[90,56],[50,44],[68,60],[32,60],[10,56],[62,86],[38,86]],
    '5-3-2':[[50,6],[90,34],[70,22],[50,20],[30,22],[10,34],[50,46],[70,60],[30,60],[62,86],[38,86]]
  };
  const STYLES = {
    'Gegenpress':{att:1.08,def:0.97,fat:1.35,desc:'Win it back high and fast. More goals both ways, tiring.'},
    'Possession':{att:1.03,def:1.04,fat:1.0,desc:'Keep the ball, control games, fewer chances against.'},
    'Counter':{att:1.0,def:1.03,fat:1.05,desc:'Sit compact and break quickly. Strong against better teams.'},
    'Park the bus':{att:0.82,def:1.15,fat:0.9,desc:'Defend deep. Fewer goals at both ends.'}
  };
  const GROUP = {GK:'GK',CB:'DEF',LB:'DEF',RB:'DEF',DM:'MID',CM:'MID',AM:'MID',LM:'MID',RM:'MID',LW:'FWD',RW:'FWD',ST:'FWD'};
  const NEAR = {
    GK:{}, CB:{DM:0.86,RB:0.85,LB:0.85}, RB:{RM:0.88,CB:0.85,LB:0.8,RW:0.75}, LB:{LM:0.88,CB:0.85,RB:0.8,LW:0.75},
    DM:{CM:0.95,CB:0.86,AM:0.8}, CM:{DM:0.94,AM:0.92,LM:0.85,RM:0.85}, AM:{CM:0.92,ST:0.86,LW:0.88,RW:0.88},
    LM:{LW:0.95,CM:0.85,LB:0.8,RM:0.88}, RM:{RW:0.95,CM:0.85,RB:0.8,LM:0.88},
    LW:{LM:0.95,RW:0.92,AM:0.88,ST:0.86}, RW:{RM:0.95,LW:0.92,AM:0.88,ST:0.86}, ST:{AM:0.86,LW:0.85,RW:0.85}
  };
  function compat(ppos, slot){
    if (ppos===slot) return 1;
    if (ppos==='GK'||slot==='GK') return 0.3;
    const n=(NEAR[ppos]||{})[slot]; if(n) return n;
    if (GROUP[ppos]===GROUP[slot]) return 0.8;
    return 0.6;
  }

  // ---------- deterministic RNG ----------
  function rng(seed){ let s=seed>>>0||1; return function(){ s^=s<<13; s>>>=0; s^=s>>17; s^=s<<5; s>>>=0; return (s>>>0)/4294967296; }; }
  let R = Math.random;
  function setSeed(n){ R = rng(n); }
  function rint(a,b){ return a+Math.floor(R()*(b-a+1)); }
  function pick(arr){ return arr[Math.floor(R()*arr.length)]; }
  function chance(p){ return R()<p; }
  function clamp(x,a,b){ return Math.max(a,Math.min(b,x)); }
  function poisson(l){ let L=Math.exp(-l),k=0,p=1; do{k++;p*=R();}while(p>L); return k-1; }
  function gauss(){ let u=R()||1e-9,v=R(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); }

  // ---------- dates ----------
  function addDays(d,n){ const x=new Date(d+'T12:00:00Z'); x.setUTCDate(x.getUTCDate()+n); return x.toISOString().slice(0,10); }
  function dayDiff(a,b){ return Math.round((new Date(b+'T12:00:00Z')-new Date(a+'T12:00:00Z'))/864e5); }
  function ageOn(dob,d){ if(!dob) return 25; return Math.floor(dayDiff(dob,d)/365.25); }

  let S = null; // game state
  let DATA = null;

  function init(data){ DATA=data; }

  function P(id){ return S.players[id]; }
  function clubPlayers(c){ return S.ids.filter(id=>S.players[id].c===c).map(id=>S.players[id]); }
  function age(p){ return ageOn(p.dob,S.date); }
  function ovr(p){ return clamp(p.r + clamp(Math.round(p.form*2),-3,3),40,99); }
  function formArrow(p){ return p.form>0.6?2:p.form>0.2?1:p.form<-0.6?-2:p.form<-0.2?-1:0; }
  function wealthOf(c){ return CLUBS[c]?CLUBS[c].wealth:1.2; }
  function presOf(c){ return CLUBS[c]?CLUBS[c].pres:(FOREIGN_PRES[c]||70); }
  function clubName(c){ return CLUBS[c]?CLUBS[c].name:c; }
  function shortName(c){ return SHORTNAME[c]||c; }

  function value(p){
    const a=age(p); const eff = a<=23 ? Math.max(p.r,(p.r*0.6+p.pot*0.4)) : p.r;
    let v = 1.3*Math.exp(0.19*(eff-65));
    const af = a<=20?1.7:a<=23?1.45:a<=27?1.0:a<=29?0.8:a<=31?0.55:a<=33?0.32:0.18;
    v*=af;
    const yrs = p.ce ? (p.ce - seasonYear()) : 2; if (yrs<=0) v*=0.35; else if (yrs===1) v*=0.75;
    return Math.round(clamp(v,0.1,190)*10)/10;
  }
  function seasonYear(){ return parseInt(S.date.slice(0,4)) + (S.date.slice(5,7)>='07'?1:0); } // season ending year
  function fairWage(p, club){
    return Math.round(clamp(4.5*Math.exp(0.135*(p.r-65))*wealthOf(club||p.c),1,420));
  }

  // ---------- new game ----------
  function newGame(opt){
    setSeed(opt.seed || Math.floor(Math.random()*1e9));
    S = {v:2, era:'2022/23', club:opt.club, manager:opt.manager, realMgr:!!opt.realMgr, date:'2022-07-31', season:1,
      players:{}, ids:[], fixtures:[], fi:0, table:{}, news:[], inbox:[], offers:[], log:{transfers:[],results:[],mgr:[],seasons:[]},
      budget:{}, wageBudget:0, formation:'4-3-3', style:'Possession', xi:[], bench:[], onboard:{coaches:false,media:false,plan:false,scout:false,objectives:false},
      coaches:[], scoutRegion:null, mediaTone:null, board:60, fans:60, objective:EXPECT[CLUBS[opt.club].exp], challenge:opt.challenge||null,
      managers:{}, sacked:false, seed:Math.floor(R()*1e9), stats:{}, ended:false, matchSpeed:2, realHistory:DATA.real, wcDone:false, msgN:0 };
    for (const c in CLUBS) { S.budget[c]=CLUBS[c].budget; S.managers[c]=CLUBS[c].mgr; S.table[c]={p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0,form:[]}; }
    S.managers[opt.club]=opt.manager;
    for (const x of DATA.players){
      const p = Object.assign({}, x);
      p.form=0; p.morale=65+rint(0,15); p.fit=100; p.inj=0; p.injName=null; p.apps=0; p.g=0; p.a=0; p.rs=0; p.motm=0; p.mins=0; p.cs=0; p.loan=null; p.listed=false; p.unhappy=false; p.yc=0; p.ban=0;
      p.ce = 2023 + Math.floor(R()*4) + (age2(p.dob)<=23?1:0); // contract end year (estimate)
      p.wage = fairWage(p, p.c==='EXT'? (p.fr||'EXT') : p.c);
      if (p.c==='EXT' && p.fr==='Free agent') p.wage=fairWage(p,'X');
      S.players[p.id]=p; S.ids.push(p.id);
    }
    if (opt.challenge && opt.challenge.budgetMul) S.budget[opt.club]=Math.round(S.budget[opt.club]*opt.challenge.budgetMul);
    S.wageBudget = Math.round(clubPlayers(opt.club).reduce((s,p)=>s+p.wage,0)*1.08);
    S.fixtures = DATA.fixtures.map((f,i)=>Object.assign({i},f,{played:false,hg:null,ag:null}));
    S.formations={}; for (const c in CLUBS) S.formations[c]= pick(['4-3-3','4-2-3-1','4-4-2','4-3-3','3-5-2']);
    S.formations.MCI='4-3-3'; S.formations.LIV='4-3-3'; S.formations.ARS='4-3-3'; S.formations.TOT='3-5-2'; S.formations.MUN='4-2-3-1'; S.formations.NEW='4-3-3';
    autoPick();
    post('club', `${clubName(opt.club)} confirm the appointment of ${opt.manager} as head coach.`, {big:true});
    post('insider', `Here we go! ${opt.manager} takes charge at ${shortName(opt.club)}. Board want: ${S.objective.label.toLowerCase()}.`);
    post('fans', pick([`New era starts now. Let's go 🙌`,`Give the new gaffer time. Proper project this.`,`Who? Fair enough, let's see the football first.`]));
    msg('board', 'Welcome from the board', `Your target this season: ${S.objective.label}. Transfer budget £${S.budget[opt.club]}m, wage budget £${S.wageBudget}k a week. Complete your pre-season checklist before the first match.`);
    return S;
  }
  function age2(dob){ return dob? ageOn(dob,'2022-08-05'):25; }

  // ---------- news / inbox ----------
  const HANDLES = {
    insider:{name:'Transfer Insider',h:'@transferinsider',kind:'insider'},
    club:null, pundit:{name:'Pundit FC',h:'@punditfc',kind:'pundit'},
    stats:{name:'Opta-style Stats',h:'@numbersgame',kind:'stats'},
    fans:null, league:{name:'Premier League',h:'@premierleague',kind:'league'}, board:null, wc:{name:'World Cup 2022',h:'@qatar2022',kind:'league'}
  };
  function post(kind, text, opt){
    opt=opt||{};
    let who;
    if (kind==='club'){ const c=opt.club||S.club; who={name:clubName(c),h:'@'+clubName(c).replace(/[^A-Za-z]/g,''),kind:'club',club:c}; }
    else if (kind==='fans'){ const c=opt.club||S.club; who={name:pick(['Kop Kev','North Bank Nia','Stretford Steve','Holte Hannah','Gallowgate Gaz','Upper Tier Uzma','Season Ticket Sam','Matchgoing Mo'])+(opt.club&&opt.club!==S.club?'':''),h:'@'+pick(['fan','ultra','away_days','sth_end','ticket'])+rint(10,99),kind:'fan',club:c}; }
    else if (kind==='player'){ who={name:opt.player.n,h:'@'+opt.player.n.replace(/[^A-Za-z]/g,'').toLowerCase()+rint(1,99),kind:'player',club:opt.player.c}; }
    else who=HANDLES[kind]||HANDLES.insider;
    S.news.unshift({id:++S.msgN, d:S.date, who, text, big:!!opt.big, likes: Math.round((opt.big?40:5)*Math.exp(R()*3))*100+rint(0,99)});
    if (S.news.length>250) S.news.length=250;
  }
  function msg(kind, title, body, action){
    S.inbox.unshift({id:++S.msgN, d:S.date, kind, title, body, action:action||null, read:false});
    if (S.inbox.length>80) S.inbox.length=80;
  }

  // ---------- team selection ----------
  function available(p){ return p.inj===0 && !p.loan && p.ban===0 && p.c!=='EXT'; }
  function pickXI(club, formation){
    const slots=FORMATIONS[formation]; const pool=clubPlayers(club).filter(available);
    const used=new Set(); const xi=new Array(11).fill(null);
    // fill slots in order of scarcity: GK first, then others by best fit score
    const order=[...slots.keys()].sort((a,b)=>(slots[a]==='GK'?-1:0)-(slots[b]==='GK'?-1:0));
    for (const si of order){
      let best=null,bs=-1;
      for (const p of pool){ if(used.has(p.id)) continue; const sc=ovr(p)*compat(p.p,slots[si])*(0.75+0.25*p.fit/100); if(sc>bs){bs=sc;best=p;} }
      if(best){ xi[si]=best.id; used.add(best.id); }
    }
    const bench=pool.filter(p=>!used.has(p.id)).sort((a,b)=>ovr(b)-ovr(a));
    const gkb=bench.find(p=>p.p==='GK'); const rest=bench.filter(p=>p!==gkb);
    return {xi, bench:(gkb?[gkb.id]:[]).concat(rest.slice(0,8).map(p=>p.id))};
  }
  function autoPick(){ const r=pickXI(S.club,S.formation); S.xi=r.xi; S.bench=r.bench; }
  function validateUserXI(){
    // drop unavailable players and refill
    let changed=false;
    S.xi=S.xi.map((id,i)=>{ const p=id&&P(id); if(!p||p.c!==S.club||!available(p)){changed=true;return null;} return id; });
    if (changed||S.xi.some(x=>!x)){
      const slots=FORMATIONS[S.formation]; const used=new Set(S.xi.filter(Boolean));
      const pool=clubPlayers(S.club).filter(available);
      S.xi=S.xi.map((id,i)=>{ if(id) return id; let best=null,bs=-1; for(const p of pool){ if(used.has(p.id))continue; const sc=ovr(p)*compat(p.p,slots[i]); if(sc>bs){bs=sc;best=p;} } if(best){used.add(best.id);return best.id;} return null; });
      S.bench=pool.filter(p=>!used.has(p.id)).sort((a,b)=>ovr(b)-ovr(a)).slice(0,9).map(p=>p.id);
    } else {
      S.bench=S.bench.filter(id=>{const p=P(id);return p&&p.c===S.club&&available(p)&&!S.xi.includes(id);});
    }
    return changed;
  }
  function slotRating(p,slot){ let r=ovr(p)*compat(p.p,slot); if(p.fit<80) r-= (80-p.fit)*0.15; return r; }
  function strength(club, xi, formation, style){
    const slots=FORMATIONS[formation]; let att=0,an=0,mid=0,mn=0,def=0,dn=0,gk=60;
    xi.forEach((id,i)=>{ if(!id) return; const p=P(id); const r=slotRating(p,slots[i]); const g=GROUP[slots[i]];
      if(g==='GK') gk=r; else if(g==='DEF'){def+=r;dn++;} else if(g==='MID'){mid+=r;mn++; att+=r*0.4;an+=0.4; def+=r*0.3;dn+=0.3;} else {att+=r;an++;} });
    const missing = xi.filter(x=>!x).length;
    att=an?att/an:50; mid=mn?mid/mn:50; def=dn?def/dn:50;
    def = def*0.75+gk*0.25;
    const st=STYLES[style]||STYLES.Possession;
    return {att:att-missing*4, mid:mid-missing*3, def:def-missing*4, ovr:(att*1.05+mid*1.05+def*1.1)/3.2-missing*4, st};
  }

  // ---------- match engine ----------
  function weather(d){
    const m=parseInt(d.slice(5,7));
    const w = m>=11||m<=2 ? ['Cold, 4°C','Light rain, 6°C','Frost, 1°C','Overcast, 7°C','Windy, 8°C'] : m>=6&&m<=8 ? ['Sunny, 24°C','Warm, 21°C','Clear evening, 19°C','Humid, 23°C'] : ['Overcast, 12°C','Showers, 10°C','Bright, 15°C','Breezy, 13°C'];
    return pick(w);
  }
  function simMatch(fx, setup){
    // setup: {h:{xi,bench,formation,style}, a:{...}} ; returns full match object with events by minute
    const H=fx.h, A=fx.a;
    const sh=strength(H,setup.h.xi,setup.h.formation,setup.h.style), sa=strength(A,setup.a.xi,setup.a.formation,setup.a.style);
    const m={fx:fx.i,h:H,a:A,hg:0,ag:0,ev:[],min:0,setup,shots:[0,0],sot:[0,0],xg:[0,0],poss:50,corners:[0,0],yc:[0,0],rc:[0,0],ref:pick(REFS),weather:weather(fx.d),subs:[0,0],ratings:{},scorers:[],done:false,mentality:[0,0]};
    m.base={sh,sa};
    const pm=(sh.mid-sa.mid);
    m.poss=Math.round(clamp(50+pm*1.3+(setup.h.style==='Possession'?5:0)-(setup.a.style==='Possession'?5:0)-(setup.h.style==='Park the bus'?8:0)+(setup.a.style==='Park the bus'?8:0),25,75));
    for (const id of setup.h.xi.concat(setup.a.xi)) if(id) m.ratings[id]={r:6.4,g:0,a:0,on:0,off:null};
    m.ev.push({min:0,t:'ko',text:kickoffLine(m)});
    return m;
  }
  function lambdas(m){
    const sh=strength(m.h,m.setup.h.xi,m.setup.h.formation,m.setup.h.style), sa=strength(m.a,m.setup.a.xi,m.setup.a.formation,m.setup.a.style);
    const d=(sh.ovr-sa.ovr)+1.6;
    let lh=1.78*Math.exp(0.031*d)*Math.pow((sh.att)/(sa.def),0.7), la=1.5*Math.exp(-0.031*d)*Math.pow((sa.att)/(sh.def),0.7);
    lh*=sh.st.att/sa.st.def; la*=sa.st.att/sh.st.def;
    if (m.setup.h.style==='Counter' && d<0) lh*=1.1; if (m.setup.a.style==='Counter' && d>0) la*=1.1;
    const mh=[1,1.18,0.8][m.mentality[0]] , ma=[1,1.18,0.8][m.mentality[1]]; // 0 bal,1 attack,2 defend
    lh*=mh*(m.mentality[1]===1?1.12:m.mentality[1]===2?0.85:1); la*=ma*(m.mentality[0]===1?1.12:m.mentality[0]===2?0.85:1);
    const redh=m.rc[0], reda=m.rc[1]; lh*=Math.pow(0.72,redh)*Math.pow(1.25,reda); la*=Math.pow(0.72,reda)*Math.pow(1.25,redh);
    return [clamp(lh,0.15,5.5),clamp(la,0.15,5.5)];
  }
  function onPitch(m,side){ const s=side===0?m.setup.h:m.setup.a; return s.xi.filter(Boolean).map(P).filter(p=>m.ratings[p.id]&&m.ratings[p.id].off===null); }
  function slotOf(m,side,id){ const s=side===0?m.setup.h:m.setup.a; const i=s.xi.indexOf(id); return i>=0?FORMATIONS[s.formation][i]:P(id).p; }
  const SCW={ST:5,LW:3.2,RW:3.2,AM:2.4,LM:1.4,RM:1.4,CM:1,DM:0.45,CB:0.4,LB:0.35,RB:0.35,GK:0};
  const ASW={ST:1.4,LW:2.6,RW:2.6,AM:3,LM:2,RM:2,CM:1.8,DM:0.8,CB:0.3,LB:1.3,RB:1.3,GK:0.05};
  function wpick(list,wf){ let t=0; const w=list.map(x=>{const v=Math.max(0,wf(x));t+=v;return v;}); let r=R()*t; for(let i=0;i<list.length;i++){r-=w[i]; if(r<=0) return list[i];} return list[list.length-1]; }
  function stepMinute(m){
    if (m.done) return [];
    m.min++;
    const out=[]; const min=m.min;
    const [lh,la]=lambdas(m);
    for (const side of [0,1]){
      const lam=side?la:lh; const team=side?m.a:m.h;
      // shots: ~ 4.2 shots per goal expected
      const pShot=lam*4.9/93;
      if (chance(pShot)){
        const xg = clamp(0.03+R()*R()*0.55,0.02,0.79);
        const pl=onPitch(m,side); if(!pl.length) continue;
        const shooter=wpick(pl,p=>{const sl=slotOf(m,side,p.id); return SCW[sl]*Math.pow(ovr(p)*compat(p.p,sl)/80,4)*(p.p==='GK'?0.02:1);});
        m.shots[side]++; m.xg[side]+=xg;
        // calibrate: goal prob scaled so expected goals per shot ~ lam/(lam*4.3)
        const pg = clamp(xg*(1/0.233)*0.233*1.0,0,0.9);
        const onT=chance(0.38+xg*0.4);
        if (onT) m.sot[side]++;
        const gkSide=onPitch(m,1-side).find(p=>slotOf(m,1-side,p.id)==='GK');
        const gkF = gkSide? clamp((80-ovr(gkSide))*0.01,-0.12,0.1):0.15;
        if (onT && chance(clamp(pg/0.6+gkF,0.05,0.92))){
          if(side)m.ag++;else m.hg++;
          const ast = chance(0.78)? wpick(pl.filter(p=>p.id!==shooter.id),p=>ASW[slotOf(m,side,p.id)]*Math.pow(ovr(p)*compat(p.p,slotOf(m,side,p.id))/80,3)) : null;
          const how = xg>0.5?'pen':pick(['open','open','open','header','long','open','setpiece']);
          if(how==='pen'&&chance(0.25)){ /* penalty missed */ m.hg-= side?0:1; m.ag-= side?1:0; out.push(ev(m,'miss',side,penMiss(shooter,team))); continue; }
          m.ratings[shooter.id].g++; m.ratings[shooter.id].r+=1.0; if(ast){m.ratings[ast.id].a++; m.ratings[ast.id].r+=0.6;}
          m.scorers.push({side,min,id:shooter.id,ast:ast&&ast.id,how});
          out.push(ev(m,'goal',side,goalLine(shooter,ast,how,team,m),{id:shooter.id,ast:ast&&ast.id}));
          if(gkSide) m.ratings[gkSide.id].r-=0.35;
          onPitch(m,1-side).forEach(p=>{ if(GROUP[slotOf(m,1-side,p.id)]==='DEF') m.ratings[p.id].r-=0.18; });
        } else if (onT){
          if(gkSide) m.ratings[gkSide.id].r+=0.22;
          if (chance(0.35)) out.push(ev(m,'save',side,saveLine(shooter,gkSide,team)));
        } else if (chance(0.25)) out.push(ev(m,'chance',side,missLine(shooter,team)));
        if (chance(0.3)) m.corners[side]++;
      }
      // cards
      if (chance(0.0185)){ const pl=onPitch(m,side); if(pl.length){ const p=wpick(pl,x=>({DM:3,CB:2.5,CM:2,LB:2,RB:2,ST:1,GK:0.2})[slotOf(m,side,x.id)]||1);
          const r=m.ratings[p.id]; if (r.yc){ r.red=1; m.rc[side]++; r.off=min; r.r-=1.5; out.push(ev(m,'red',side,`🟥 Second yellow! ${p.n} is off and ${shortName(team)} are down to ${11-m.rc[side]}.`,{id:p.id})); }
          else { r.yc=1; m.yc[side]++; r.r-=0.2; out.push(ev(m,'yellow',side,`🟨 ${p.n} goes into the book. ${pick(['Cynical.','Late on.','Clipped him.','Talking his way into it.'])}`,{id:p.id})); } } }
      if (chance(0.0006)){ const pl=onPitch(m,side); if(pl.length>7){ const p=pick(pl); const r=m.ratings[p.id]; r.red=1; m.rc[side]++; r.off=min; r.r-=1.8; out.push(ev(m,'red',side,`🟥 Straight red for ${p.n}! VAR checks… and it stands.`,{id:p.id})); } }
      // injuries
      if (chance(0.0009)){ const pl=onPitch(m,side).filter(p=>slotOf(m,side,p.id)!=='GK'); if(pl.length){ const p=pick(pl); m.ratings[p.id].injured=1; out.push(ev(m,'inj',side,`🚑 ${p.n} is down and holding his ${pick(['hamstring','knee','ankle','calf','groin'])}. Doesn't look good.`,{id:p.id})); } }
    }
    // flavour
    if (out.length===0 && chance(0.06)) out.push(ev(m,'flav',chance(m.poss/100)?0:1,flavour(m)));
    if (min===45){ out.push(ev(m,'ht',-1,`Half-time: ${shortName(m.h)} ${m.hg}–${m.ag} ${shortName(m.a)}.`)); }
    if (min>=90+m.added){ m.done=true; out.push(ev(m,'ft',-1,`Full-time: ${shortName(m.h)} ${m.hg}–${m.ag} ${shortName(m.a)}.`)); }
    m.ev.push(...out);
    return out;
  }
  function ev(m,t,side,text,extra){ return Object.assign({min:m.min,t,side,text,hg:m.hg,ag:m.ag},extra||{}); }
  function kickoffLine(m){ return `We're under way at ${CLUBS[m.h].std}. ${m.ref} gets things started.`; }
  function goalLine(s,a,how,team,m){
    const sc=`${shortName(m.h)} ${m.hg}–${m.ag} ${shortName(m.a)}`;
    const ast=a?pick([` ${a.n} with the ball in.`,` Lovely pass from ${a.n}.`,` ${a.n} sets it up.`,` Assist: ${a.n}.`]):'';
    const t={
      open:[`GOAL! ${s.n} finishes it off!${ast}`,`⚽ ${s.n} slots it home!${ast}`,`GOAL! ${s.n} keeps his cool and scores.${ast}`],
      header:[`GOAL! ${s.n} rises highest and heads it in!${ast}`,`⚽ Header! ${s.n} gets on the end of it.${ast}`],
      long:[`WHAT A HIT! ${s.n} from 25 yards!`,`⚽ ${s.n} lets fly from distance… top corner!`],
      setpiece:[`GOAL from the set piece! ${s.n} bundles it in.${ast}`,`⚽ Corner, chaos, and ${s.n} pokes it over the line.`],
      pen:[`⚽ Penalty scored by ${s.n}. Sends the keeper the wrong way.`,`GOAL! ${s.n} smashes the penalty down the middle.`]
    };
    return pick(t[how]||t.open)+` ${sc}`;
  }
  function penMiss(s,team){ return pick([`❌ Penalty saved! ${s.n} denied from the spot.`,`❌ ${s.n} blazes the penalty over!`]); }
  function saveLine(s,gk,team){ return gk? pick([`🧤 Big save from ${gk.n} to deny ${s.n}.`,`🧤 ${gk.n} tips ${s.n}'s effort round the post.`,`🧤 ${s.n} forces ${gk.n} into a save.`]) : `${s.n} forces a save.`; }
  function missLine(s,team){ return pick([`${s.n} drags it wide.`,`So close! ${s.n} hits the post!`,`${s.n} skies it.`,`${s.n} curls one just over.`]); }
  function flavour(m){ return pick(['Patient build-up, probing for an opening.','Crowd getting behind them now.','Corner… cleared.','Good spell of pressure.','Offside flag goes up.','VAR checking a possible handball… no penalty.','Free kick in a dangerous area… straight into the wall.','Tempo dropping a little.']); }
  function makeSub(m,side,offId,onId){
    const s=side===0?m.setup.h:m.setup.a; const i=s.xi.indexOf(offId); if(i<0) return false;
    if (m.subs[side]>=5) return false;
    s.xi[i]=onId; s.bench=s.bench.filter(x=>x!==onId);
    m.ratings[offId].off=m.min; m.ratings[onId]={r:6.4,g:0,a:0,on:m.min,off:null};
    m.subs[side]++;
    m.ev.push(ev(m,'sub',side,`🔁 ${shortName(side?m.a:m.h)} change: ${P(onId).n} on, ${P(offId).n} off.`));
    return true;
  }
  function aiSubs(m,side){
    const s=side===0?m.setup.h:m.setup.a; const ms=m.min;
    if ((ms===60||ms===70||ms===80) && m.subs[side]<5){
      // injured first
      const pl=onPitch(m,side);
      let off=pl.find(p=>m.ratings[p.id].injured);
      if(!off && chance(0.7)){ off=pl.filter(p=>slotOf(m,side,p.id)!=='GK').sort((a,b)=>(m.ratings[a.id].r-m.ratings[b.id].r)+(a.fit-b.fit)*0.01)[0]; }
      if(off){ const slot=slotOf(m,side,off.id); const cand=s.bench.map(P).filter(p=>p.p!=='GK').sort((a,b)=>slotRating(b,slot)-slotRating(a,slot))[0]; if(cand) makeSub(m,side,off.id,cand.id); }
    } else {
      const inj=onPitch(m,side).find(p=>m.ratings[p.id].injured && !m.ratings[p.id].subbed);
      if(inj && m.subs[side]<5){ const slot=slotOf(m,side,inj.id); const cand=s.bench.map(P).filter(p=>slot==='GK'?p.p==='GK':p.p!=='GK').sort((a,b)=>slotRating(b,slot)-slotRating(a,slot))[0]; m.ratings[inj.id].subbed=1; if(cand) makeSub(m,side,inj.id,cand.id); }
    }
  }
  function runToEnd(m, userSide){
    m.added = m.added || rint(2,7);
    while(!m.done){ if(userSide!==0) aiSubs(m,0); if(userSide!==1) aiSubs(m,1); aiMentality(m,userSide); stepMinute(m); }
    return m;
  }
  function aiMentality(m,userSide){
    for (const side of [0,1]){ if(side===userSide) continue; const diff=side?m.ag-m.hg:m.hg-m.ag;
      if(m.min>70&&diff<0) m.mentality[side]=1; else if(m.min>75&&diff===1) m.mentality[side]=2; else if(m.min>60&&diff>=2) m.mentality[side]=0; }
  }
  function finalize(m){
    // ratings & stats
    const f=S.fixtures[m.fx]; f.played=true; f.hg=m.hg; f.ag=m.ag;
    const res=[m.hg>m.ag?1:m.hg<m.ag?-1:0, m.ag>m.hg?1:m.ag<m.hg?-1:0];
    let motm=null,best=-9;
    for (const side of [0,1]){
      const s=side?m.setup.a:m.setup.h; const conceded=side?m.hg:m.ag; const club=side?m.a:m.h;
      for (const id in m.ratings){ const p=P(id); if(p.c!==club) continue; const r=m.ratings[id];
        let v=r.r + res[side]*0.45 + gauss()*0.42 + (ovr(p)-75)*0.018;
        const g=GROUP[p.p]; if(conceded===0 && (g==='DEF'||g==='GK') && (r.off===null||r.off>60)) {v+=0.6; p.cs++;}
        v=clamp(Math.round(v*10)/10,3.5,10); r.final=v; if(v>best){best=v;motm=id;}
        const mins=(r.off===null?90:r.off)-r.on; p.apps++; p.mins+=mins; p.g+=r.g; p.a+=r.a; p.rs+=v;
        p.form = clamp(p.form*0.72 + (v-6.7)*0.55, -2, 2);
        p.fit = clamp(p.fit - (mins/90)*(9*s.st_fat||9), 30, 100);
        if (r.yc){ p.yc++; if(p.yc===5||p.yc===10){p.ban=p.yc===5?1:2;} }
        if (r.red){ p.ban=Math.max(p.ban,rint(1,3)); }
        if (r.injured){ const days=pick([7,10,14,21,28,42,60,90]); p.inj=days; p.injName=pick(['hamstring strain','knee ligament','ankle sprain','calf tear','groin strain','thigh injury']); }
      }
    }
    if (motm){ m.motm=+motm; P(motm).motm++; }
    for (const c of [m.h,m.a]) clubPlayers(c).forEach(p=>{ if(p.ban>0 && !m.ratings[p.id]) p.ban--; });
    // table
    const th=S.table[m.h], ta=S.table[m.a];
    th.p++;ta.p++; th.gf+=m.hg;th.ga+=m.ag; ta.gf+=m.ag; ta.ga+=m.hg;
    if(m.hg>m.ag){th.w++;ta.l++;th.pts+=3; th.form.push('W');ta.form.push('L');}
    else if(m.hg<m.ag){ta.w++;th.l++;ta.pts+=3; th.form.push('L');ta.form.push('W');}
    else {th.d++;ta.d++;th.pts++;ta.pts++; th.form.push('D');ta.form.push('D');}
    for(const t of [th,ta]) if(t.form.length>5) t.form.shift();
    // morale
    for (const [club,r] of [[m.h,res[0]],[m.a,res[1]]]) clubPlayers(club).forEach(p=>{ const played=m.ratings[p.id]; p.morale=clamp(p.morale + r*3 + (played?1.5:-0.6*(ovr(p)>=clubTopRating(club,13)?2:0.3)),5,100); });
    S.log.results.push({d:f.d,h:m.h,a:m.a,hg:m.hg,ag:m.ag,sc:m.scorers.map(x=>({id:x.id,s:x.side,m:x.min}))});
    if (m.h===S.club||m.a===S.club) afterUserMatch(m,res[m.h===S.club?0:1]);
    return m;
  }
  const _topCache={};
  function clubTopRating(club,n){ const r=clubPlayers(club).map(p=>p.r).sort((a,b)=>b-a); return r[Math.min(n-1,r.length-1)]||60; }
  function afterUserMatch(m,res){
    const us=m.h===S.club?0:1; const them=us?m.h:m.a; const gf=us?m.ag:m.hg, ga=us?m.hg:m.ag;
    const diffPres = presOf(them)-presOf(S.club);
    S.board = clamp(S.board + (res>0? 2+Math.max(0,diffPres)*0.08 : res<0? -(diffPres>=10?0.8:diffPres>=0?1.8:2.6+Math.max(0,-diffPres)*0.07) : (diffPres>=8?0.8:-0.4)),0,100);
    S.fans = clamp(S.fans + res*3 + (gf>=3?1:0) - (ga>=3?1:0),0,100);
    const motm=m.motm&&P(m.motm);
    const score=`${shortName(m.h)} ${m.hg}–${m.ag} ${shortName(m.a)}`;
    if(res>0){ post('club',`FT | ${score} 🙌 ${motm&&motm.c===S.club?`Man of the match: ${motm.n}.`:''}`,{big:true});
      post('fans',pick([`Get in!!! What a performance.`,`That's more like it. ${motm?motm.n+' unreal today.':''}`,`Three points. Onto the next one.`,`Gaffer's got them playing 🔥`]));
      if(gf>=4) post('pundit',`${shortName(S.club)} were outstanding. That's a team that knows exactly what the manager wants.`);
    } else if(res<0){ post('club',`FT | ${score}`,{big:true}); post('fans',pick([`Not good enough. Simple as.`,`Second half was miles off.`,`Need a reaction next week.`,`Tactics today? Anyone?`]));
      if(ga>=3) post('pundit',`That was a worrying afternoon for ${shortName(S.club)}. Too easy to play through.`);
    } else { post('club',`FT | ${score}`,{big:true}); post('fans',pick([`A point's a point.`,`Should've won that.`,`Fair result in the end.`])); }
    m.scorers.filter(s=>(s.side===us)).forEach(s=>{ const p=P(s.id); if(p.apps<=3 && p.g===1 && age(p)<=21) post('league',`📰 Youngster ${p.fn} scores his first senior goal for ${shortName(S.club)}.`,{big:true}); });
    const pos=position(S.club);
    if (S.board<25 && S.table[S.club].p>=8) { post('insider',`${S.manager} under pressure at ${shortName(S.club)}. Board meeting expected this week.`,{big:true}); }
    if (S.board<=8 && S.table[S.club].p>=10){ S.sacked=true; msg('board','You have been sacked',`After a run of poor results the board has decided to part ways with you. ${shortName(S.club)} sit ${ordinal(pos)} in the table.`); post('club',`${clubName(S.club)} have parted company with ${S.manager}.`,{big:true}); }
  }
  function ordinal(n){ const s=['th','st','nd','rd'],v=n%100; return n+(s[(v-20)%10]||s[v]||s[0]); }
  function sortedTable(){ return Object.keys(S.table).sort((a,b)=>{const x=S.table[a],y=S.table[b]; return (y.pts-x.pts)||((y.gf-y.ga)-(x.gf-x.ga))||(y.gf-x.gf)||a.localeCompare(b);}); }
  function position(c){ return sortedTable().indexOf(c)+1; }

  // ---------- AI team setup ----------
  function aiSetup(c){ const f=S.formations[c]; const r=pickXI(c,f); const st= CLUBS[c].pres>=86?pick(['Possession','Gegenpress','Possession']):pick(['Counter','Possession','Counter','Gegenpress']); return {xi:r.xi,bench:r.bench,formation:f,style:st,st_fat:STYLES[st].fat}; }
  function userSetup(){ validateUserXI(); return {xi:S.xi.slice(),bench:S.bench.slice(),formation:S.formation,style:S.style,st_fat:STYLES[S.style].fat}; }
  function setupFor(fx){ return {h: fx.h===S.club?userSetup():aiSetup(fx.h), a: fx.a===S.club?userSetup():aiSetup(fx.a)}; }

  // ---------- calendar ----------
  function nextUserFixture(){ return S.fixtures.find(f=>!f.played && (f.h===S.club||f.a===S.club)); }
  function windowOpen(d){ d=d||S.date; return (d<='2022-09-01') || (d>='2023-01-01'&&d<='2023-01-31') || (d>=`${seasonYear()}-06-10`); }
  function windowName(){ const d=S.date; if(d<='2022-09-01') return 'Summer window (closes 1 Sep, 23:00)'; if(d>='2023-01-01'&&d<='2023-01-31') return 'January window (closes 31 Jan)'; if(d<'2023-01-01') return 'Window closed (January window opens 1 Jan)'; return 'Window closed'; }
  function onboardingDone(){ const o=S.onboard; return o.coaches&&o.media&&o.plan&&o.scout&&o.objectives; }
  // advance until the day of the user's next match (not played). returns 'match' | 'end' | 'blocked'
  function advance(){
    if (S.sacked) return 'sacked';
    if (!onboardingDone()) return 'blocked';
    const nf=nextUserFixture();
    if (!nf){ endSeason(); return 'end'; }
    while (S.date < nf.d){ S.date=addDays(S.date,1); dailyTick(); if(S.sacked) return 'sacked'; }
    // simulate AI fixtures on match day before user's kickoff
    playAIFixtures(S.date, nf.t);
    return 'match';
  }
  function playAIFixtures(d, beforeTime){
    for (const f of S.fixtures){ if(f.played||f.d!==d) continue; if(f.h===S.club||f.a===S.club) continue; if(beforeTime && f.t>beforeTime) continue; const m=simMatch(f,setupFor(f)); runToEnd(m,-1); finalize(m); }
  }
  function afterUserMatchDay(){ playAIFixtures(S.date,null); }
  function dailyTick(){
    const d=S.date;
    playAIFixtures(d,null);
    for (const id of S.ids){ const p=S.players[id];
      if(p.inj>0){ p.inj--; if(p.inj===0){ p.injName=null; if(p.c===S.club) msg('medical',`${p.n} is fit again`,`${p.fn} has recovered and is available for selection.`);} }
      p.fit=clamp(p.fit+ (S.coaches.includes('fitness')?5:4),0,100);
      if (chance(0.0006) && p.c!=='EXT' && !p.loan){ p.inj=pick([5,7,14,21,35]); p.injName=pick(['training knock','muscle strain','illness','ankle knock']); if(p.c===S.club) msg('medical',`${p.n} injured in training`,`${p.fn} will miss around ${p.inj} days with a ${p.injName}.`); }
    }
    // bans served per matchday: decrement when club plays
    if (d.slice(8)==='01') monthlyDevelopment();
    resolvePending();
    if (windowOpen(d)) { aiTransfers(); incomingBids(); }
    if (d==='2022-09-02') windowClosedNews();
    if (d==='2023-02-01') windowClosedNews();
    managerChanges();
    events();
    if (d==='2022-11-13') { post('wc','🏆 The World Cup in Qatar kicks off on 20 November. The Premier League pauses until Boxing Day.',{big:true}); msg('board','World Cup break','The league is paused until 26 December while the World Cup is played in Qatar. Your internationals are away with their countries.'); }
    if (d==='2022-12-19' && !S.wcDone){ S.wcDone=true; post('wc','🇦🇷 Argentina are world champions! They beat France on penalties after a 3–3 classic in the final. Messi finally lifts the trophy.',{big:true}); post('wc','🇫🇷 Kylian Mbappé scores a hat-trick in the final and still finishes on the losing side. Golden Boot with 8 goals.',{}); }
  }
  function monthlyDevelopment(){
    for (const id of S.ids){ const p=S.players[id]; const a=age(p);
      const share = p.c==='EXT'||p.loan ? (p.loan?0.8:0.6) : clamp(p.mins/ Math.max(1,S.table[p.c]?S.table[p.c].p*90:90),0,1);
      if (a<=24 && p.r<p.pot){
        let g=(p.pot-p.r)*0.075*(0.45+share)*(S.club===p.c&&S.coaches.includes('youth')&&a<=21?1.35:1)*(p.loan?1.15:1);
        if (S.club===p.c){ if(S.coaches.includes('attack')&&['ST','LW','RW','AM'].includes(p.p)) g*=1.15; if(S.coaches.includes('defence')&&['CB','LB','RB','DM','GK'].includes(p.p)) g*=1.15; }
        const old=p.r; p.r+= Math.floor(g) + (chance(g%1)?1:0); p.r=Math.min(p.r,p.pot);
        if (p.c===S.club && p.r-old>=2) msg('training',`${p.n} is developing fast`,`${p.fn} has improved to ${p.r} OVR this month.`);
      } else if (a>=31){
        if (chance((a-30)*0.09)) { p.r-=1; if(p.pot>p.r) p.pot=p.r; }
      }
      if (p.pot<p.r) p.pot=p.r;
      // unhappy players
      if (p.c===S.club && !p.loan && a>=21 && p.r>=clubTopRating(S.club,11)-1 && S.table[S.club].p>=6 && p.mins < S.table[S.club].p*90*0.3){ p.morale=clamp(p.morale-12,0,100); if(p.morale<30 && !p.unhappy){ p.unhappy=true; msg('squad',`${p.n} is unhappy`,`${p.fn} is frustrated by his lack of game time and has asked to talk about his future.`); post('insider',`${p.n} unhappy with his role at ${shortName(S.club)}. Wants regular football.`); } }
    }
    // board budget boost if doing well
    if (S.table[S.club].p>=8){ const pos=position(S.club); if(pos<=S.objective.pos && chance(0.25)){ const add=rint(5,20); S.budget[S.club]+=add; msg('board','Extra funds available',`The board is pleased with progress and has added £${add}m to your transfer budget.`); } }
  }
  function events(){
    if (!chance(0.035)) return;
    const sq=clubPlayers(S.club).filter(p=>!p.loan);
    const e=rint(0,4);
    if (e===0){ const a=pick(sq),b=pick(sq); if(a!==b){ a.morale-=10;b.morale-=10; msg('squad','Training ground bust-up',`${a.n} and ${b.n} had to be separated in training. Both are fined a week's wages.`); post('insider',`Hearing there was a heated row at ${shortName(S.club)} training between ${a.n} and ${b.n}.`);} }
    else if (e===1){ const add=rint(3,10); S.budget[S.club]+=add; msg('board','Commercial boost',`A new sponsorship deal adds £${add}m to the transfer budget.`); }
    else if (e===2){ post('insider',`Takeover talk at ${pick(Object.keys(CLUBS).filter(c=>c!==S.club).map(shortName))}. Consortium in advanced talks.`); }
    else if (e===3){ const p=pick(sq.filter(x=>x.r>=72)||sq); if(p){ post('player',pick([`Hard work pays off 💪`,`Recovery day. Back at it tomorrow.`,`Grateful for every minute on that pitch.`,`Family day 🙏`]),{player:p}); } }
    else { msg('board','Fine from the FA',`The club has been fined £${rint(20,80)}k for failing to control players during a recent match.`); }
  }
  function managerChanges(){
    for (const s of REAL_SACKINGS){ if(s.d!==S.date) continue; if(s.c===S.club) continue;
      let go=false; const pos=position(s.c);
      if (s.cond==='any'||s.cond==='board') go=true; else if (s.cond==='after') go = S.managers.CHE==='Graham Potter'; else go = pos>=8;
      if (s.fromC===S.club) go=false;
      if (!go) { if (s.cond==='poor') post('insider',`${s.out} survives at ${shortName(s.c)}. Results have bought him time — history changed.`); continue; }
      const old=S.managers[s.c]; if(old!==s.out) continue;
      S.managers[s.c]=s.inn; if (s.fromC) S.managers[s.fromC]=S.managers[s.fromC];
      S.log.mgr.push({d:S.date,c:s.c,out:s.out,inn:s.inn});
      post('club',`${clubName(s.c)} have parted company with ${s.out}. ${s.inn} is the new head coach.`,{club:s.c,big:true});
      if (s.cond==='board' && s.c==='CHE') { S.managers.BHA = S.club==='BHA'?S.manager:'(interim)'; }
    }
  }
  function windowClosedNews(){ post('league','🔒 The transfer window has closed.',{big:true}); }

  // ---------- transfers ----------
  function askingPrice(p, buyer){
    const v=value(p); const c=p.c;
    if (c==='EXT'){ return Math.round(v*(p.fr==='Free agent'?0:1.15)*10)/10; }
    const sq=clubPlayers(c).sort((a,b)=>b.r-a.r); const rank=sq.indexOf(p);
    let f= rank<=1?1.9: rank<=5?1.5: rank<=13?1.25: 1.0;
    if (p.listed) f*=0.8; if (p.unhappy) f*=0.85;
    if (p.ce && p.ce-seasonYear()<=0) f*=0.7;
    return Math.round(v*f*10)/10;
  }
  function refuses(p, buyer){
    if (p.c==='EXT') return null;
    if ((RIVALS[p.c]||[]).includes(buyer)){ const top=clubTopRating(p.c,14); if(p.r>=top) return `${clubName(p.c)} refuse to negotiate with a rival club.`; }
    if (p.loan) return `${p.n} is out on loan.`;
    return null;
  }
  function interest(p, club, wage){
    // probability the player accepts personal terms
    const fromPres = p.c==='EXT'? presOf(p.fr): presOf(p.c);
    const toPres = presOf(club);
    let s = 0.55 + (toPres-fromPres)*0.022 + (wage/Math.max(1,fairWage(p,club))-1)*0.9;
    // playing time
    const sq=clubPlayers(club).filter(x=>GROUP[x.p]===GROUP[p.p]).sort((a,b)=>b.r-a.r);
    const better=sq.filter(x=>x.r>p.r+2).length; const slots={GK:1,DEF:4,MID:3,FWD:3}[GROUP[p.p]];
    if (better>=slots) s-=0.25;
    if (p.unhappy) s+=0.15;
    if (age(p)>=31) s+=0.08;
    return clamp(s,0.03,0.97);
  }
  function makeBid(pid, fee, loan){
    const p=P(pid); const buyer=S.club;
    if (!windowOpen()) return {ok:false,msg:'The transfer window is closed.'};
    if (p.c===S.club) return {ok:false,msg:'He already plays for you.'};
    const ref=refuses(p,buyer); if(ref) return {ok:false,msg:ref};
    if (S.offers.find(o=>o.pid===pid&&o.state!=='done'&&o.state!=='failed')) return {ok:false,msg:'You already have a deal in progress for him.'};
    if (loan){
      const sq=clubPlayers(p.c).sort((a,b)=>b.r-a.r); const rank=sq.indexOf(p);
      if (p.c==='EXT' && p.fr!=='Man City U21') return {ok:false,msg:'Loans are only available from Premier League clubs in this version.'};
      if (rank<14) return {ok:false,msg:`${shortName(p.c)} won't loan out a first-team player.`};
      const o={id:++S.msgN,pid,fee:0,loan:true,state:'terms',from:p.c,date:S.date}; S.offers.unshift(o);
      return {ok:true,msg:`${shortName(p.c)} agree to loan ${p.n} until the end of the season. Now agree his terms.`,offer:o};
    }
    if (fee>S.budget[buyer]) return {ok:false,msg:`That's more than your transfer budget (£${S.budget[buyer]}m).`};
    const ask=askingPrice(p,buyer);
    if (fee>=ask){ const o={id:++S.msgN,pid,fee,state:'terms',from:p.c,date:S.date}; S.offers.unshift(o); return {ok:true,msg:`${p.c==='EXT'?p.fr:clubName(p.c)} accept your £${fee}m bid. Now offer ${p.n} a contract.`,offer:o}; }
    if (fee>=ask*0.8){ const counter=Math.round(ask*10)/10; return {ok:false,counter,msg:`Bid rejected. ${p.c==='EXT'?p.fr:clubName(p.c)} would accept £${counter}m.`}; }
    return {ok:false,msg:`Bid rejected out of hand. ${p.c==='EXT'?p.fr:clubName(p.c)} value him far higher.`};
  }
  function offerTerms(offerId, wage, years){
    const o=S.offers.find(x=>x.id===offerId); if(!o) return {ok:false,msg:'Deal not found.'};
    const p=P(o.pid);
    const curWages=clubPlayers(S.club).reduce((s,x)=>s+x.wage,0);
    if (curWages+wage>S.wageBudget) return {ok:false,msg:`That would take you over your wage budget (£${S.wageBudget}k/week, currently £${curWages}k).`};
    o.wage=wage; o.years=years; o.state='thinking'; o.decide=addDays(S.date,rint(2,4));
    const p_ = interest(p,S.club,wage) * (o.loan?1.1:1);
    o.willAccept = chance(p_);
    o.demand = Math.round(fairWage(p,S.club)*(1.05+R()*0.3));
    msg('transfer',`${p.n} is considering your offer`,`${p.fn} will give his answer by ${fmtDate(o.decide)}.`);
    post('insider',`${shortName(S.club)} have made an offer to ${p.n}. Personal terms being discussed. Decision expected in the next few days.`);
    return {ok:true,msg:`Offer sent. ${p.n} will decide within a few days.`};
  }
  function fmtDate(d){ const m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; return `${+d.slice(8)} ${m[+d.slice(5,7)-1]} ${d.slice(0,4)}`; }
  function resolvePending(){
    for (const o of S.offers){
      if (o.state==='thinking' && S.date>=o.decide){
        const p=P(o.pid);
        if (o.kind==='renew'){
          if (o.willAccept){ p.wage=o.wage; p.ce=seasonYear()+o.years; p.morale=clamp(p.morale+10,0,100); o.state='done'; msg('contract',`${p.n} signs a new contract`,`${p.fn} has agreed a deal until ${p.ce}.`); post('club',`✍️ ${p.n} has signed a new contract, keeping him at the club until ${p.ce}.`,{big:true}); }
          else { o.state='failed'; msg('contract',`${p.n} rejects your contract offer`,`He wants around £${o.demand}k a week.`); }
          continue;
        }
        if (!windowOpen() && !o.loan){ o.state='failed'; msg('transfer',`Deal for ${p.n} collapses`,'The window closed before the deal was completed.'); continue; }
        if (o.willAccept){ completeTransfer(p,S.club,o.fee,o.wage,o.years,o.loan); o.state='done'; }
        else { o.state='failed'; msg('transfer',`${p.n} turns you down`,`${p.fn} has rejected your offer. His camp say he'd want around £${o.demand}k a week, or a bigger club.`); post('insider',`${p.n} rejects ${shortName(S.club)}. Not convinced by the project.`); }
      }
    }
    S.offers=S.offers.filter(o=>!(o.state==='done'||o.state==='failed') || dayDiff(o.decide||o.date,S.date)<20);
  }
  function completeTransfer(p,to,fee,wage,years,loan){
    const from=p.c; const fromName=from==='EXT'?p.fr:clubName(from);
    if (loan){ p.loanFrom=from; }
    if (from!=='EXT' && S.budget[from]!=null) S.budget[from]+=fee;
    if (to!=='EXT' && S.budget[to]!=null) S.budget[to]=Math.round((S.budget[to]-fee)*10)/10;
    p.c=to; p.wage=wage||fairWage(p,to); if(!loan) p.ce=seasonYear()+(years||4); p.morale=80; p.unhappy=false; p.listed=false; p.form=Math.max(p.form,0);
    if (to==='EXT'){ p.fr=loan?p.fr:(p._buyer||'Abroad'); }
    S.log.transfers.push({d:S.date,id:p.id,from:fromName,to:to==='EXT'?p.fr:clubName(to),fee,loan:!!loan});
    if (to===S.club){ msg('transfer',`${p.n} signs!`,`${p.fn} joins from ${fromName}${loan?' on loan':` for £${fee}m`}.`); post('insider',`HERE WE GO! ${p.fn} to ${shortName(to)}${loan?' on loan':`, £${fee}m`}. Contract until ${p.ce}. ✅`,{big:true}); post('club',`✍️ Welcome to ${clubName(to)}, ${p.fn}!`,{big:true}); post('player',`Dream come true. Can't wait to get started 🙏`,{player:p}); }
    else if (from===S.club){ post('insider',`${p.fn} leaves ${shortName(from)} for ${to==='EXT'?p.fr:shortName(to)}. Fee £${fee}m.`,{big:true}); }
    else post('insider',`✅ ${p.fn} joins ${to==='EXT'?p.fr:shortName(to)} from ${fromName}${fee?` for £${fee}m`:''}.`);
    if (to===S.club){ S.bench.push(p.id); }
  }
  function aiTransfers(){
    // replay real history: external players with a real destination move during their real window
    const d=S.date; const summer=d<='2022-09-01', jan=d>='2023-01-01'&&d<='2023-01-31';
    for (const id of S.ids){ const p=S.players[id]; if(p.c!=='EXT'||!p.rt||p.rt===S.club) continue;
      if ((p.rw==='summer'&&summer)||(p.rw==='january'&&jan)){
        const deadline = summer?'2022-09-01':'2023-01-31'; const left=dayDiff(d,deadline)+1;
        if (chance(1/Math.max(1,left*0.7))){ const fee=p.fr==='Free agent'?0:Math.round(value(p)*1.1*10)/10; completeTransfer(p,p.rt,fee,fairWage(p,p.rt),4); }
      }
    }
    // occasional domestic deals between AI clubs
    if (chance(0.06)){
      const buyers=Object.keys(CLUBS).filter(c=>c!==S.club && S.budget[c]>10); if(!buyers.length) return;
      const b=pick(buyers); const need=weakestGroup(b); const cands=S.ids.map(P).filter(p=>p.c!=='EXT'&&p.c!==b&&p.c!==S.club&&!p.loan&&GROUP[p.p]===need&&p.r>=clubTopRating(b,11)&&p.r<=clubTopRating(b,1)&&age(p)<=29);
      if(cands.length){ const p=pick(cands); const fee=askingPrice(p,b); if(fee<=S.budget[b]*0.8 && !refuses(p,b) && chance(0.5)) completeTransfer(p,b,fee,fairWage(p,b),4); }
    }
  }
  function weakestGroup(c){ const g={GK:[],DEF:[],MID:[],FWD:[]}; clubPlayers(c).forEach(p=>g[GROUP[p.p]].push(p.r)); const need={GK:1,DEF:4,MID:3,FWD:3}; let w='MID',wv=99; for(const k in g){ const top=g[k].sort((a,b)=>b-a).slice(0,need[k]); const v=top.length<need[k]?0:top.reduce((s,x)=>s+x,0)/top.length; if(v<wv){wv=v;w=k;} } return w; }
  function incomingBids(){
    if (!chance(0.07)) return;
    const mine=clubPlayers(S.club).filter(p=>!p.loan&&age(p)<=31);
    if (!mine.length) return;
    const p=wpick(mine,x=>Math.pow(x.r/70,6)*(x.listed?4:1)*(x.unhappy?3:1));
    if (S.inbox.find(m=>m.action&&m.action.pid===p.id&&!m.done)) return;
    const domestic = Object.keys(CLUBS).filter(c=>c!==S.club && presOf(c)>=presOf(S.club)-12 && S.budget[c]>value(p)*0.9 && !(RIVALS[S.club]||[]).includes(c));
    const buyer = (p.r>=82&&chance(0.5)) || !domestic.length ? pick(FOREIGN_BUYERS) : pick(domestic);
    const fee=Math.round(value(p)*(0.85+R()*0.5)*10)/10;
    msg('offer',`${buyer==='EXT'?'':(CLUBS[buyer]?clubName(buyer):buyer)} bid £${fee}m for ${p.n}`,`${CLUBS[buyer]?clubName(buyer):buyer} have made an offer of £${fee}m for ${p.fn}. His value is around £${value(p)}m.`,{type:'bid',pid:p.id,buyer,fee});
    post('insider',`${CLUBS[buyer]?shortName(buyer):buyer} submit a £${fee}m bid for ${shortName(S.club)}'s ${p.n}. 🚨`);
  }
  function answerBid(msgId, accept, counter){
    const m=S.inbox.find(x=>x.id===msgId); if(!m||!m.action||m.done) return {ok:false,msg:'Offer no longer available.'};
    const a=m.action; const p=P(a.pid);
    if (p.c!==S.club){ m.done=true; return {ok:false,msg:'He is no longer at the club.'}; }
    if (!windowOpen()){ m.done=true; return {ok:false,msg:'The window has closed.'}; }
    if (!accept && !counter){ m.done=true; post('insider',`${shortName(S.club)} reject ${CLUBS[a.buyer]?shortName(a.buyer):a.buyer}'s bid for ${p.n}.`); return {ok:true,msg:'Bid rejected.'}; }
    let fee=a.fee;
    if (counter){ const max=value(p)*(1.25+R()*0.35); if (counter>max){ m.done=true; return {ok:false,msg:`${CLUBS[a.buyer]?clubName(a.buyer):a.buyer} walk away from the deal.`}; } fee=counter; }
    m.done=true; p._buyer=a.buyer; S.xi=S.xi.map(x=>x===p.id?null:x); S.bench=S.bench.filter(x=>x!==p.id);
    completeTransfer(p, CLUBS[a.buyer]?a.buyer:'EXT', fee, fairWage(p,a.buyer), 4);
    if (!CLUBS[a.buyer]) p.fr=a.buyer;
    S.budget[S.club]=Math.round((S.budget[S.club]+0)*10)/10;
    return {ok:true,msg:`${p.n} sold to ${CLUBS[a.buyer]?clubName(a.buyer):a.buyer} for £${fee}m.`};
  }
  function renewContract(pid,wage,years){
    const p=P(pid); if (S.offers.find(o=>o.pid===pid&&o.kind==='renew'&&o.state==='thinking')) return {ok:false,msg:'He is already considering an offer.'};
    const curWages=clubPlayers(S.club).reduce((s,x)=>s+x.wage,0);
    if (curWages-p.wage+wage>S.wageBudget) return {ok:false,msg:`That breaks your wage budget (£${S.wageBudget}k/week).`};
    const want=fairWage(p,S.club)*(p.unhappy?1.3:1.0);
    const o={id:++S.msgN,pid,kind:'renew',wage,years,state:'thinking',date:S.date,decide:addDays(S.date,rint(2,4)),willAccept:chance(clamp(0.5+(wage/want-1)*1.6+(p.morale-50)*0.006,0.03,0.97)),demand:Math.round(want*1.1)};
    S.offers.unshift(o); return {ok:true,msg:`Offer made. ${p.n} will reply within a few days.`};
  }
  function loanOut(pid){
    const p=P(pid); if(age(p)>23) return {ok:false,msg:'Only players aged 23 or under can be loaned out in this version.'};
    if (!windowOpen()) return {ok:false,msg:'The transfer window is closed.'};
    p.loan={to:pick(['Sunderland','Middlesbrough','Norwich City','Burnley','Coventry City','Swansea City','Blackburn Rovers','Sheffield United','Millwall','Watford','Stoke City','Hull City']),until:'2023-05-31'};
    S.xi=S.xi.map(x=>x===p.id?null:x); S.bench=S.bench.filter(x=>x!==p.id);
    post('club',`🔄 ${p.n} joins ${p.loan.to} on loan until the end of the season.`);
    return {ok:true,msg:`${p.n} goes on loan to ${p.loan.to}.`};
  }
  function listPlayer(pid,on){ const p=P(pid); p.listed=on; if(on) post('insider',`${shortName(S.club)} willing to listen to offers for ${p.n}.`); }
  function releasePlayer(pid){ const p=P(pid); const comp=Math.round(p.wage*52*Math.max(0,(p.ce||seasonYear())-seasonYear()+0.5)/1000*10)/10; S.budget[S.club]=Math.round((S.budget[S.club]-comp)*10)/10; p.c='EXT'; p.fr='Free agent'; p.rt=null; S.xi=S.xi.map(x=>x===pid?null:x); S.bench=S.bench.filter(x=>x!==pid); post('club',`${p.n} has left the club by mutual consent.`); return {ok:true,msg:`${p.n} released. £${comp}m compensation paid.`}; }

  // ---------- onboarding ----------
  function doCoaches(list){ S.coaches=list; S.onboard.coaches=true; const cost=list.length*25; S.wageBudget=Math.max(0,S.wageBudget); msg('board','Backroom staff appointed',`You've hired: ${list.map(x=>({attack:'attacking coach',defence:'defensive coach',youth:'youth development coach',fitness:'fitness & sports science coach'})[x]).join(' and ')}.`); }
  function doMedia(tone){ S.mediaTone=tone; S.onboard.media=true;
    if (tone==='bold'){ S.fans+=8; S.board+=3; post('pundit',`${S.manager}: "We're here to win." Brave words. He'll be judged on them.`,{big:true}); post('fans',`Love the confidence from the new gaffer 🔥`); }
    else if (tone==='measured'){ S.board+=5; post('pundit',`Calm and clear from ${S.manager}. Talks about building something sustainable.`,{big:true}); post('fans','Sensible. Let the football do the talking.'); }
    else { S.board+=2; S.fans-=2; post('pundit',`Very humble from ${S.manager}. Expectations being managed.`,{big:true}); post('fans','Bit underwhelming that. Show some ambition!'); }
  }
  function doPlan(form,style){ S.formation=form; S.style=style; S.onboard.plan=true; autoPick(); }
  function doScout(region){ S.scoutRegion=region; S.onboard.scout=true; msg('scout','Scouting network set up',`Your scouts are now covering ${region}. Check the Scout tab for their first report.`); }
  function doObjectives(){ S.onboard.objectives=true; }
  const REGIONS={'Britain & Ireland':['Premier League','Watford','Burnley','Luton Town','Stoke City','Bristol City','Man City U21'],'Western Europe':['Barcelona','Real Sociedad','Atlético Madrid','Villarreal','Valencia','Real Betis','Paris Saint-Germain','Lyon','Lille','Rennes','Reims','Marseille','Monaco','Nice','Metz','Lorient','Benfica','Sporting CP','Juventus','Roma','Torino','Sassuolo','Atalanta','Sampdoria','Real Madrid'],'Central & Northern Europe':['Ajax','PSV','Feyenoord','Borussia Dortmund','Bayern Munich','Hoffenheim','Stuttgart','Freiburg','Red Bull Salzburg','FC Copenhagen','Molde','AIK','FC Zürich','Genk','Anderlecht','Beşiktaş','Shakhtar Donetsk','Dynamo Kyiv','Dinamo Zagreb'],'South America':['Palmeiras','Corinthians','Flamengo','Vasco da Gama','Racing Club','Rosario Central','Vélez Sarsfield'],'Rest of the world':['Al Sadd','Chicago Fire','Central Coast Mariners','Free agent']};
  function scouted(p){ if(p.c!=='EXT') return true; if(!S.scoutRegion) return false; if(p.fr==='Free agent') return true; return (REGIONS[S.scoutRegion]||[]).includes(p.fr) || S.scoutKnown&&S.scoutKnown.includes(p.id); }

  // ---------- season end ----------
  function endSeason(){
    if (S.ended) return; S.ended=true;
    const t=sortedTable(); const pos=t.indexOf(S.club)+1;
    const top=S.ids.map(P).filter(p=>p.g>0).sort((a,b)=>b.g-a.g)[0];
    S.log.seasons.push({season:S.era,champion:t[0],pos,club:S.club,top:top&&{n:top.fn,g:top.g,c:top.c}});
    const met = pos<=S.objective.pos;
    msg('board', met?'Objective achieved':'Objective missed', met?`You finished ${ordinal(pos)}. The board are delighted.`:`You finished ${ordinal(pos)}. The target was: ${S.objective.label}.`);
    post('league',`🏆 ${clubName(t[0])} are champions of the 2022/23 Premier League!`,{big:true});
    post('league',`⬇️ Relegated: ${t.slice(17).map(shortName).join(', ')}.`);
  }

  return { CLUBS, SHORTNAME, FORMATIONS, COORDS, STYLES, GROUP, EXPECT, REGIONS, init, newGame, get S(){return S;}, set S(v){S=v;}, P, clubPlayers, age, ovr, formArrow, value, fairWage, autoPick, validateUserXI, pickXI, compat, slotRating, strength,
    simMatch, stepMinute, runToEnd, finalize, aiSubs, aiMentality, makeSub, setupFor, nextUserFixture, advance, afterUserMatchDay, sortedTable, position, windowOpen, windowName, onboardingDone,
    makeBid, offerTerms, weakestGroup, answerBid, renewContract, loanOut, listPlayer, releasePlayer, askingPrice, interest, doCoaches, doMedia, doPlan, doScout, doObjectives, scouted, clubName, shortName, presOf, fmtDate, ordinal, setSeed, seasonYear, addDays, dayDiff, onPitch, slotOf, lambdas, msg, post, endSeason };
})();
if (typeof module!=='undefined') module.exports=ENGINE;
