const E=require('../src/engine.js');
const players=require('../data/players.json'), fixtures=require('../data/fixtures.json'), real=require('../data/real_table.json');
E.init({players,fixtures,real});
const club=process.argv[2]||'LIV';
const t0=Date.now();
const S=E.newGame({club,manager:'Test',seed:+process.argv[3]||42});
E.doCoaches(['attack','youth']);E.doMedia('measured');E.doPlan('4-3-3','Possession');E.doScout('Western Europe');E.doObjectives();
let n=0;
while(true){ const r=E.advance(); if(r!=='match') {console.log('stop',r);break;}
  E.autoPick(); const f=E.nextUserFixture(); const m=E.simMatch(f,E.setupFor(f)); E.runToEnd(m,-1); E.finalize(m); E.afterUserMatchDay(); n++; }
const T=E.sortedTable();
console.log('ms',Date.now()-t0,'matches',n);
T.forEach((c,i)=>{const t=E.S.table[c];console.log(i+1,c,t.p,t.w,t.d,t.l,t.gf+':'+t.ga,t.pts)});
const goals=Object.values(E.S.table).reduce((s,t)=>s+t.gf,0); console.log('goals/match',(goals/380).toFixed(2));
const sc=E.S.ids.map(E.P).sort((a,b)=>b.g-a.g).slice(0,8).map(p=>`${p.n}(${p.c}) ${p.g}`); console.log(sc.join(', '));
console.log('transfers',E.S.log.transfers.length, E.S.log.transfers.slice(0,12).map(t=>`${E.P(t.id).n}:${t.from}->${t.to} £${t.fee}`).join('; '));
console.log('mgr',E.S.log.mgr.map(x=>x.c+':'+x.inn).join(', '));
console.log('board',E.S.board.toFixed(0),'sacked',E.S.sacked);
const sal=E.P(E.S.ids.find(id=>E.P(id).n==='Salah')); console.log('Salah r',sal.r,'apps',sal.apps,'avg',(sal.rs/sal.apps).toFixed(2));
