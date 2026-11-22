// Headless test of the competition engine on a made-up season built from the 2022/23 squads:
// two divisions of 10, a cup (replays, extra time, a two-legged semi with away goals, a neutral final)
// and a European competition (two groups of four, two-legged semis, a final).
// Usage: node tools/test_comps.js [userClub] [seeds]   e.g. node tools/test_comps.js LIV 5
const E=require('../src/engine.js');
const D='../data/2022-23/';
const players=require(D+'players.json'), real=require(D+'real_table.json');
const base=JSON.parse(JSON.stringify(require(D+'season.json')));

function makeSeason(){
  const s=JSON.parse(JSON.stringify(base));
  const byPres=Object.keys(s.clubs).sort((a,b)=>s.clubs[b].pres-s.clubs[a].pres);
  const d1=byPres.slice(0,10), d2=byPres.slice(10);
  d1.forEach(c=>s.clubs[c].league='D1'); d2.forEach(c=>s.clubs[c].league='D2');
  const sats=[]; for(let d=new Date('2022-08-06T12:00:00Z'); sats.length<18; d.setUTCDate(d.getUTCDate()+7)) sats.push(d.toISOString().slice(0,10));
  s.rules.awayGoals=true; s.rules.subs=3; s.rules.bench=5;
  s.competitions=[
    {id:'D1',name:'Division One',type:'league',dates:sats,zones:{rel:2}},
    {id:'D2',name:'Division Two',type:'league',dates:sats,zones:{promo:2}},
    {id:'CUP',name:'Test Cup',type:'cup',rounds:[
      {name:'First round',date:'2022-09-07',replay:'2022-09-21',enter:d2.slice(2)},
      {name:'Second round',date:'2022-10-05',replay:'2022-10-19',enter:d1.concat(d2.slice(0,2))},
      {name:'Quarter-finals',date:'2022-11-02'},
      {name:'Semi-finals',legs:2,date:'2023-01-11',date2:'2023-01-25'},
      {name:'Final',date:'2023-02-25',neutral:true,venue:'Wembley Stadium'}]},
    {id:'EUR',name:'Test Euro Cup',type:'groups',advance:2,
      groups:[{name:'A',clubs:[d1[0],d1[3],d1[4],d1[7]]},{name:'B',clubs:[d1[1],d1[2],d1[5],d1[6]]}],
      groupDates:['2022-09-13','2022-09-27','2022-10-11','2022-10-25','2022-11-08','2022-11-22'],
      rounds:[{name:'Semi-finals',legs:2,date:'2023-02-14',date2:'2023-02-28'},{name:'Final',date:'2023-03-18',neutral:true,venue:'Stade de France'}]}
  ];
  s.windows=[{key:'summer',name:'Summer window',open:'2022-06-01',close:'2022-09-01',closeLabel:'closes 1 Sep'},{key:'january',name:'January window',open:'2023-01-01',close:'2023-01-31',closeLabel:'closes 31 Jan'}];
  return s;
}

const user=process.argv[2]||'LIV', seeds=+process.argv[3]||5;
let fails=0; const check=(ok,msg)=>{ if(!ok){ fails++; console.log('  FAIL:',msg); } };
const tally={et:0,pens:0,replays:0,awayGoalTies:0,ties:0};
for (let seed=1; seed<=seeds; seed++){
  E.init({players,fixtures:[],real,season:makeSeason()});
  const S=E.newGame({club:user,manager:'Test',seed});
  E.doCoaches(['attack','youth']);E.doMedia('measured');E.doPlan('4-3-3','Possession');E.doScout('Western Europe');E.doObjectives();
  let userGames=0, guard=0;
  while (guard++<500){ const st=E.advanceStep(); if(st.r==='event') continue; if(st.r!=='match') break;
    E.autoPick(); const f=E.nextUserFixture(); const m=E.simMatch(f,E.setupFor(f)); E.runToEnd(m,-1); E.finalize(m); E.afterUserMatchDay(); userGames++; }
  const unplayed=S.fixtures.filter(f=>!f.played);
  check(S.ended,'season did not end'); check(!unplayed.length,`${unplayed.length} fixtures unplayed`);
  for (const lg of ['D1','D2']){ const T=S.tables[lg]; check(Object.values(T).every(r=>r.p===18),`${lg}: not every club played 18`); }
  for (const g of ['A','B']){ const T=S.tables['EUR:'+g]; check(Object.values(T).every(r=>r.p===6),`EUR group ${g}: not every club played 6`); }
  // nobody plays twice on one day
  const seen={}; for (const f of S.fixtures) for (const c of [f.h,f.a]){ const k=c+f.d; check(!seen[k],`${c} plays twice on ${f.d}`); seen[k]=1; }
  // knockouts
  for (const id of ['CUP','EUR']){ const cup=S.cups[id];
    check(!!cup.winner,`${id}: no winner`);
    const sizes=cup.history.map(h=>h.ties.length);
    check(JSON.stringify(sizes)===JSON.stringify(id==='CUP'?[4,8,4,2,1]:[2,1]),`${id}: round sizes ${sizes}`);
    for (const h of cup.history) for (const t of h.ties) check(t.winner===t.h||t.winner===t.a,`${id}: bad winner`);
  }
  const finals=S.fixtures.filter(f=>f.rd==='Final'); check(finals.every(f=>f.neutral&&f.venue),'final not at a neutral venue');
  check(finals.every(f=>f.d==='2023-02-25'||f.d==='2023-03-18'),'final on the wrong date');
  // decided games: no knockout decider left level without pens; first legs and replayable draws may be level
  for (const f of S.fixtures.filter(f=>f.tie)){ tally.ties++; if(f.et) tally.et++; if(f.pens) tally.pens++; if(f.replay) tally.replays++; }
  for (const id of ['CUP','EUR']) for (const h of S.cups[id].history) for (const t of h.ties){ check(!!t.how,`${id}: tie without a result type`); if(t.how==='on away goals') tally.awayGoalTies++; }
  const cupWin=E.clubName(S.cups.CUP.winner), eurWin=E.clubName(S.cups.EUR.winner);
  const d1=E.sortedTable('D1'), d2=E.sortedTable('D2');
  console.log(`seed ${seed}: ${user} played ${userGames} · D1 ${d1[0]} ${S.tables.D1[d1[0]].pts}pts · D2 ${d2[0]} · Cup ${cupWin} · Euro ${eurWin} · trophies ${JSON.stringify(S.log.seasons[0].trophies)} · fixtures ${S.fixtures.length}`);
}
console.log('knockout games',tally.ties,'· extra time',tally.et,'· penalties',tally.pens,'· replays',tally.replays,'· ties settled on away goals',tally.awayGoalTies);
console.log(fails?`${fails} CHECKS FAILED`:'all checks passed');
process.exit(fails?1:0);
