/* Through the Eras — interface */
'use strict';
(function(){
const E = ENGINE;
E.init(window.GAME_DATA);
const $ = s => document.querySelector(s);
const app = $('#app');
const SAVE_KEY = 'tte_save_v1';
let tab = 'home';
let live = null; // live match
let modalStack = [];
let squadSort = 'pos';
let tfFilter = {g:'ALL', q:'', maxAge:40, maxVal:300, club:'ALL', abroad:true, sort:'r'};
let tacSel = null;

const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S = () => E.S;
const club = c => E.CLUBS[c];
const money = m => m>=1? `£${Math.round(m*10)/10}m` : `£${Math.round(m*1000)}k`;
const posOrder = {GK:0,RB:1,CB:2,LB:3,DM:4,CM:5,RM:6,LM:7,AM:8,RW:9,LW:10,ST:11};
function ratingClass(r){ return r>=85?'r-elite':r>=80?'r-gold':r>=75?'r-silver':r>=70?'r-bronze':'r-low'; }
function arrow(p){ const a=E.formArrow(p); return a===2?'<span class="ar up2" title="In great form">▲▲</span>':a===1?'<span class="ar up" title="Good form">▲</span>':a===-1?'<span class="ar dn" title="Poor form">▼</span>':a===-2?'<span class="ar dn2" title="Very poor form">▼▼</span>':'<span class="ar">–</span>'; }
function chip(c, small){ const k=club(c); if(!k) return `<span class="chip ext${small?' sm':''}">${esc(c==='EXT'?'—':c)}</span>`; return `<span class="chip${small?' sm':''}" style="--c1:${k.col};--c2:${k.col2}"><i></i>${c}</span>`; }
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(S())); }catch(e){} }
function loadSave(){ try{ const s=localStorage.getItem(SAVE_KEY); if(!s) return null; return JSON.parse(s); }catch(e){ return null; } }
function hasSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }
function toast(t, bad){ const el=document.createElement('div'); el.className='toast'+(bad?' bad':''); el.textContent=t; document.body.appendChild(el); setTimeout(()=>el.classList.add('out'),2600); setTimeout(()=>el.remove(),3100); }

// ---------------- TITLE ----------------
function renderTitle(){
  document.body.style.setProperty('--club', '#2E6F8E'); document.body.style.setProperty('--club2', '#F2B544');
  app.innerHTML = `
  <section class="title">
    <div class="brand"><div class="logo">THROUGH<br>THE ERAS</div><p>Football career mode, any season from 1990. Designed by Mayan.</p></div>
    <div class="tiles">
      <button class="tile big" data-act="new"><span class="tl">Career Mode</span><span class="ts">New save</span>${svgPerson()}</button>
      <button class="tile big locked" data-act="intl" aria-disabled="true"><span class="tl">International</span><span class="ts">New save · coming in a later version</span>${svgGlobe()}</button>
      <button class="tile" data-act="challenges"><span class="tl">Objectives</span><span class="ts">Pick a challenge</span>${svgTarget()}</button>
      <button class="tile" data-act="load" ${hasSave()?'':'aria-disabled="true"'}><span class="tl">Load save</span><span class="ts">${hasSave()?esc(saveSummary()):'No save yet'}</span>${svgFile()}</button>
    </div>
    <p class="fine">Squads, prices and fixtures: official Premier League (Fantasy Premier League) data for 2022/23. Birth dates and shirt numbers cross-checked with Transfermarkt.</p>
  </section>`;
}
function saveSummary(){ const s=loadSave(); if(!s) return ''; return `${E.CLUBS[s.club]?E.CLUBS[s.club].name:s.club} · ${s.manager} · ${E.fmtDate(s.date)}`; }
function svgPerson(){ return `<svg class="ti" viewBox="0 0 60 80" aria-hidden="true"><circle cx="30" cy="14" r="9"/><path d="M30 24v28M30 52l-13 24M30 52l13 24M8 34l22-6 22 6"/></svg>`; }
function svgGlobe(){ return `<svg class="ti" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="30"/><path d="M14 30c10 4 18-6 26 0s8 14 22 8M24 60c6-10 14-4 18-14M50 18c-2 8 6 10 4 18"/></svg>`; }
function svgTarget(){ return `<svg class="ti" viewBox="0 0 80 80" aria-hidden="true"><circle cx="38" cy="44" r="26"/><circle cx="38" cy="44" r="14"/><path d="M38 44L66 14M58 14h8v8"/></svg>`; }
function svgFile(){ return `<svg class="ti" viewBox="0 0 70 80" aria-hidden="true"><path d="M12 6h34l12 12v56H12z"/><path d="M22 28h24M22 42h24M22 56h18"/></svg>`; }

const CHALLENGES = [
  {id:'kop', club:'LIV', title:'Back on our perch', text:'Liverpool. Finish above Manchester City.', goal:{type:'above',c:'MCI',label:'Finish above Manchester City'}},
  {id:'toon', club:'NEW', title:'Toon Army rising', text:'Newcastle. Qualify for the Champions League.', goal:{type:'pos',pos:4,label:'Finish in the top four'}},
  {id:'forest', club:'NFO', title:'The great escape', text:'Nottingham Forest. Stay up in your first season back.', goal:{type:'pos',pos:17,label:'Avoid relegation'}},
  {id:'arteta', club:'ARS', title:'Trust the process', text:'Arsenal. Win the league for the first time since 2004.', goal:{type:'pos',pos:1,label:'Win the Premier League'}},
  {id:'saints', club:'SOU', title:'Saints survive', text:'Southampton, with half the budget. Avoid relegation.', goal:{type:'pos',pos:17,label:'Avoid relegation'}, budgetMul:0.5},
  {id:'bees', club:'BRE', title:'Moneyball', text:'Brentford. Finish in the top half on a small budget.', goal:{type:'pos',pos:10,label:'Finish in the top half'}}
];
function renderChallenges(){
  app.innerHTML = `<section class="flow"><button class="back" data-act="title">◀ Back</button><h1 class="h1">Objectives</h1><p class="lede">Pick a ready-made challenge. You'll still choose your manager.</p>
  <div class="cgrid">${CHALLENGES.map(c=>`<button class="ccard" data-act="pickChallenge" data-id="${c.id}" style="--c1:${club(c.club).col};--c2:${club(c.club).col2}"><span class="band"></span><b>${esc(c.title)}</b><span>${esc(c.text)}</span></button>`).join('')}</div></section>`;
}
let pending = {};
function renderEras(){
  app.innerHTML = `<section class="flow"><button class="back" data-act="title">◀ Back</button><h1 class="h1">Choose your era</h1><p class="lede">Each era plays and looks like its time: the rules, the money, the media.</p>
  <div class="eras">
    <div class="era e92 locked"><div class="eh">1992/93</div><div class="eb">The first Premier League season. Back-pass rule, three subs, newspaper headlines and teletext scores.</div><span class="lock">Coming in phase 3</span></div>
    <div class="era e04 locked"><div class="eh">2004/05</div><div class="eb">Mourinho arrives, Arsenal's Invincibles defend the title, early digital coverage.</div><span class="lock">Coming in phase 2</span></div>
    <button class="era e22" data-act="era22"><div class="eh">2022/23</div><div class="eb">Haaland's first season, the winter World Cup in Qatar, transfer news breaks on social media.</div><span class="go">Play this era ▶</span></button>
  </div></section>`;
}
function renderClubs(){
  const cs=Object.keys(E.CLUBS).sort((a,b)=>E.CLUBS[a].name.localeCompare(E.CLUBS[b].name));
  const avg = c => { const ps=window.GAME_DATA.players.filter(p=>p.c===c).map(p=>p.r).sort((a,b)=>b-a).slice(0,14); return Math.round(ps.reduce((s,x)=>s+x,0)/ps.length); };
  app.innerHTML = `<section class="flow"><button class="back" data-act="eras">◀ Back</button><h1 class="h1">Pick your club · 2022/23</h1><p class="lede">Squads as they stood on the opening weekend, 5 August 2022.</p>
  <div class="clubgrid">${cs.map(c=>{const k=club(c); const ex=E.EXPECT[k.exp]; return `<button class="clubcard" data-act="pickClub" data-c="${c}" style="--c1:${k.col};--c2:${k.col2}"><span class="kit"></span><span class="cn">${esc(k.name)}</span><span class="cm">${esc(k.std)}</span><span class="cr"><b>${avg(c)}</b> squad · ${money(k.budget)} budget</span><span class="ce">${esc(ex.label)}</span></button>`;}).join('')}</div></section>`;
}
function renderManager(){
  const k=club(pending.club);
  app.innerHTML = `<section class="flow narrow"><button class="back" data-act="${pending.challenge?'challenges':'era22'}">◀ Back</button><h1 class="h1">Who's in charge?</h1>
  <p class="lede">${esc(k.name)} · ${pending.challenge?esc(pending.challenge.goal.label):esc(E.EXPECT[k.exp].label)}</p>
  <div class="mgrpick">
    <div class="mcard"><b>Create new manager</b><label for="mname">Your name</label><input id="mname" maxlength="28" placeholder="e.g. Mayan Patel" autocomplete="off"><button class="btn primary" data-act="startNew">Start career ▶</button></div>
    <div class="mcard"><b>Real manager</b><p>Take over as the man who was really in the dugout in August 2022.</p><div class="realm">${esc(k.mgr)}</div><button class="btn" data-act="startReal">Start as ${esc(k.mgr.split(' ').slice(-1)[0])} ▶</button></div>
  </div></section>`;
  setTimeout(()=>{ const i=$('#mname'); if(i) i.focus(); },50);
}
function startGame(name, real){
  const opt={club:pending.club, manager:name, realMgr:real};
  if (pending.challenge) opt.challenge=pending.challenge;
  E.newGame(opt);
  if (pending.challenge){ const g=pending.challenge.goal; S().objective = {label:g.label, pos: g.pos || E.EXPECT[club(pending.club).exp].pos, type:g.type, c:g.c}; }
  tab='home'; save(); renderHub();
}

// ---------------- HUB ----------------
const TABS=[['home','Home'],['squad','Squad'],['tactics','Gameplan'],['transfers','Transfers'],['scout','Scout'],['table','Table'],['news','News'],['records','Records'],['settings','Settings']];
function renderHub(){
  const s=S(); if(!s) return renderTitle();
  const k=club(s.club);
  document.body.style.setProperty('--club', k.col); document.body.style.setProperty('--club2', k.col2);
  const unread=s.inbox.filter(m=>!m.read).length;
  const nf=E.nextUserFixture();
  app.innerHTML = `
  <header class="hud">
    <div class="hudl"><span class="crest" style="--c1:${k.col};--c2:${k.col2}"></span><div><div class="hc">${esc(k.name)}</div><div class="hm">${esc(s.manager)} · ${E.fmtDate(s.date)}</div></div></div>
    <div class="hudr"><div><span>Budget</span><b>${money(s.budget[s.club])}</b></div><div><span>Wages</span><b>£${wagesNow()}k/${s.wageBudget}k</b></div><div><span>Position</span><b>${s.table[s.club].p?E.ordinal(E.position(s.club)):'–'}</b></div></div>
  </header>
  <nav class="bars" role="tablist"><span class="pad">L1</span>${TABS.map(([id,l])=>`<button role="tab" aria-selected="${tab===id}" class="bar${tab===id?' on':''}" data-act="tab" data-t="${id}">${l}${id==='home'&&unread?`<em>${unread}</em>`:''}</button>`).join('')}<span class="pad">R1</span></nav>
  <main id="view" class="view">${renderTab()}</main>
  <footer class="cont">
    ${s.sacked?`<div class="nfx">You have been sacked.</div><button class="btn primary" data-act="title">Main menu</button>`:
      s.ended?`<div class="nfx">Season complete · finished ${E.ordinal(E.position(s.club))}</div><button class="btn primary" data-act="tab" data-t="records">See the season ▶</button>`:
      nf?`<div class="nfx"><span>Next</span> ${nf.h===s.club?'vs':'at'} <b>${esc(E.shortName(nf.h===s.club?nf.a:nf.h))}</b> · ${E.fmtDate(nf.d)} ${nf.t} · MW${nf.gw}</div><button class="btn primary big" data-act="continue" ${E.onboardingDone()?'':'aria-disabled="true"'}>${E.onboardingDone()?'Continue ▶':'Finish checklist first'}</button>`:''}
  </footer>`;
  bindTabKeys();
}
function wagesNow(){ return E.clubPlayers(S().club).reduce((t,p)=>t+p.wage,0); }
function renderTab(){
  switch(tab){
    case 'home': return viewHome(); case 'squad': return viewSquad(); case 'tactics': return viewTactics(); case 'transfers': return viewTransfers();
    case 'scout': return viewScout(); case 'table': return viewTable(); case 'news': return viewNews(); case 'records': return viewRecords(); case 'settings': return viewSettings();
  } return '';
}
function rerender(){ const v=$('#view'); if(v){ renderHub(); } }

// HOME
function viewHome(){
  const s=S(); const o=s.onboard; const nf=E.nextUserFixture();
  const steps=[['coaches','Hire coaches','Pick two specialists for your backroom team.'],['media','Introduce yourself to the media','Your first press conference sets the tone.'],['plan','Set up your gameplan','Formation, style and starting XI.'],['scout','Set up a scouting network','Choose where your scouts look for talent.'],['objectives','Review objectives','See what the board expects this season.']];
  const done=steps.filter(x=>o[x[0]]).length;
  const tbl=E.sortedTable(); const me=tbl.indexOf(s.club);
  const around=tbl.slice(Math.max(0,Math.min(me-2,15)),Math.max(0,Math.min(me-2,15))+5);
  return `<div class="grid home">
    ${E.onboardingDone()?'':`<section class="panel onboard"><div class="ph"><h2>Pre-season checklist</h2><span class="tag">${done}/5 · any order</span></div><p class="sub">The game won't move on until all five are done.</p>
      <ol class="steps">${steps.map(([k,t,d])=>`<li class="${o[k]?'done':''}"><button data-act="step" data-k="${k}"><span class="tick">${o[k]?'✓':''}</span><span><b>${t}</b><small>${d}</small></span></button></li>`).join('')}</ol></section>`}
    ${nf?nextCard(nf):''}
    <section class="panel"><div class="ph"><h2>Inbox</h2>${s.inbox.some(m=>!m.read)?`<button class="lnk" data-act="readAll">Mark all read</button>`:''}</div>${inboxList(6)}</section>
    <section class="panel"><div class="ph"><h2>League</h2><button class="lnk" data-act="tab" data-t="table">Full table</button></div>${miniTable(around)}</section>
    <section class="panel"><div class="ph"><h2>Board &amp; fans</h2></div>${meter('Board confidence',s.board)}${meter('Fan mood',s.fans)}<p class="sub">Target: <b>${esc(s.objective.label)}</b></p></section>
    <section class="panel"><div class="ph"><h2>Latest</h2><button class="lnk" data-act="tab" data-t="news">All news</button></div>${feed(s.news.slice(0,4))}</section>
  </div>`;
}
function meter(l,v){ const c=v>=65?'good':v>=35?'mid':'bad'; return `<div class="meter ${c}"><span>${l}</span><div class="mt"><i style="width:${Math.round(v)}%"></i></div><b>${Math.round(v)}</b></div>`; }
function nextCard(f){
  const s=S(); const opp=f.h===s.club?f.a:f.h; const k=club(opp); const t=s.table[opp];
  return `<section class="panel next" style="--c1:${k.col};--c2:${k.col2}"><div class="ph"><h2>Next match</h2><span class="tag">Matchweek ${f.gw}</span></div>
  <div class="vs"><div>${chip(f.h)}<b>${esc(E.shortName(f.h))}</b></div><span>v</span><div>${chip(f.a)}<b>${esc(E.shortName(f.a))}</b></div></div>
  <p class="sub">${E.fmtDate(f.d)} · ${f.t} · ${esc(club(f.h).std)}</p>
  <p class="sub">${esc(E.shortName(opp))}: ${t.p?`${E.ordinal(E.position(opp))}, form ${t.form.map(x=>`<span class="fm ${x}">${x}</span>`).join('')}`:'first game of the season'} · manager ${esc(s.managers[opp])}</p></section>`;
}
function inboxList(n){
  const s=S(); if(!s.inbox.length) return '<p class="empty">Nothing yet.</p>';
  return `<ul class="inbox">${s.inbox.slice(0,n).map(m=>`<li class="${m.read?'':'unread'} k-${m.kind}"><button data-act="openMsg" data-id="${m.id}"><span class="md">${E.fmtDate(m.d).slice(0,6)}</span><b>${esc(m.title)}</b>${m.action&&!m.done?'<em>Action</em>':''}</button></li>`).join('')}</ul>`;
}
function miniTable(rows){ const s=S(); return `<table class="tbl mini"><tbody>${rows.map(c=>{const t=s.table[c];return `<tr class="${c===s.club?'me':''}"><td class="num">${E.position(c)}</td><td>${chip(c,1)} ${esc(E.shortName(c))}</td><td class="num">${t.p}</td><td class="num">${t.gf-t.ga>0?'+':''}${t.gf-t.ga}</td><td class="num b">${t.pts}</td></tr>`;}).join('')}</tbody></table>`; }
function feed(items){
  if(!items.length) return '<p class="empty">No posts yet.</p>';
  return `<ul class="feed">${items.map(n=>{const c=n.who.club&&club(n.who.club); return `<li class="post ${n.who.kind}${n.big?' big':''}"><span class="av" style="${c?`--c1:${c.col};--c2:${c.col2}`:''}">${esc(n.who.name.slice(0,1))}</span><div><div class="pw"><b>${esc(n.who.name)}</b>${n.who.kind==='club'||n.who.kind==='league'?'<span class="vf" title="Verified">✔</span>':''}<span>${esc(n.who.h)} · ${E.fmtDate(n.d).slice(0,6)}</span></div><p>${esc(n.text)}</p><div class="pl">♥ ${n.likes.toLocaleString('en-GB')}</div></div></li>`;}).join('')}</ul>`;
}

// SQUAD
function viewSquad(){
  const s=S(); let ps=E.clubPlayers(s.club);
  const sorters={pos:(a,b)=>(posOrder[a.p]-posOrder[b.p])||(b.r-a.r), r:(a,b)=>E.ovr(b)-E.ovr(a), pot:(a,b)=>b.pot-a.pot, age:(a,b)=>E.age(a)-E.age(b), val:(a,b)=>E.value(b)-E.value(a), g:(a,b)=>b.g-a.g};
  ps.sort(sorters[squadSort]||sorters.pos);
  const th=(k,l,cls)=>`<th class="${cls||''}"><button class="sort${squadSort===k?' on':''}" data-act="sortSquad" data-k="${k}">${l}</button></th>`;
  return `<section class="panel"><div class="ph"><h2>Squad · ${ps.length} players</h2><span class="sub">Tap a player for details. ▲▼ shows form, which moves his rating up to 3 either way.</span></div>
  <div class="tscroll"><table class="tbl squad"><thead><tr><th>#</th><th>Player</th>${th('pos','Pos')}${th('age','Age','num')}${th('r','OVR','num')}${th('pot','POT','num')}<th class="num">Form</th><th class="num hide-s">Apps</th>${th('g','G','num')}<th class="num hide-s">A</th><th class="num hide-s">Avg</th>${th('val','Value','num')}<th class="hide-s">Contract</th><th>Status</th></tr></thead>
  <tbody>${ps.map(p=>`<tr data-act="player" data-id="${p.id}" tabindex="0"><td class="num dim">${p.num||''}</td><td><b>${esc(p.n)}</b>${s.xi.includes(p.id)?'<span class="xi">XI</span>':''}</td><td><span class="pos p-${E.GROUP[p.p]}">${p.p}</span></td><td class="num">${E.age(p)}</td><td class="num"><span class="ovr ${ratingClass(E.ovr(p))}">${E.ovr(p)}</span></td><td class="num dim">${p.pot}</td><td class="num">${arrow(p)}</td><td class="num hide-s">${p.apps}</td><td class="num">${p.g}</td><td class="num hide-s">${p.a}</td><td class="num hide-s">${p.apps?(p.rs/p.apps).toFixed(1):'–'}</td><td class="num">${money(E.value(p))}</td><td class="hide-s dim">${p.ce}</td><td>${status(p)}</td></tr>`).join('')}</tbody></table></div></section>`;
}
function status(p){
  const b=[]; if(p.inj) b.push(`<span class="st inj" title="${esc(p.injName)}">Injured ${p.inj}d</span>`); if(p.ban) b.push(`<span class="st ban">Banned ${p.ban}</span>`);
  if(p.loan) b.push(`<span class="st loan">On loan</span>`); if(p.unhappy) b.push(`<span class="st sad">Unhappy</span>`); if(p.listed) b.push(`<span class="st list">Listed</span>`);
  if(!b.length && p.fit<75) b.push(`<span class="st tired">Tired ${Math.round(p.fit)}%</span>`);
  return b.join(' ');
}

// TACTICS
function viewTactics(){
  const s=S(); E.validateUserXI();
  const slots=E.FORMATIONS[s.formation], co=E.COORDS[s.formation];
  const st=E.strength(s.club,s.xi,s.formation,s.style);
  const others=E.clubPlayers(s.club).filter(p=>!s.xi.includes(p.id)).sort((a,b)=>(posOrder[a.p]-posOrder[b.p])||(b.r-a.r));
  return `<div class="grid tac">
  <section class="panel"><div class="ph"><h2>Gameplan</h2><span class="tag">Team ${Math.round(st.ovr)}</span></div>
    <div class="formrow">${Object.keys(E.FORMATIONS).map(f=>`<button class="seg${s.formation===f?' on':''}" data-act="formation" data-f="${f}">${f}</button>`).join('')}</div>
    <div class="formrow">${Object.keys(E.STYLES).map(f=>`<button class="seg${s.style===f?' on':''}" data-act="style" data-f="${f}">${f}</button>`).join('')}</div>
    <p class="sub">${esc(E.STYLES[s.style].desc)}</p>
    <div class="pitch big">${slots.map((sl,i)=>{const p=s.xi[i]&&E.P(s.xi[i]); const cp=p?E.compat(p.p,sl):1; return `<button class="dot${tacSel&&tacSel.type==='slot'&&tacSel.i===i?' sel':''}${cp<0.9?' oop':''}" style="left:${co[i][0]}%;bottom:${co[i][1]}%" data-act="slot" data-i="${i}"><span class="dr ${p?ratingClass(Math.round(E.slotRating(p,sl))):''}">${p?Math.round(E.slotRating(p,sl)):'?'}</span><span class="dn">${p?esc(p.n):'Empty'}</span><span class="ds">${sl}</span></button>`;}).join('')}</div>
    <div class="formrow"><button class="btn" data-act="autopick">Auto-pick best XI</button>${s.onboard.plan?'':`<button class="btn primary" data-act="confirmPlan">Confirm gameplan ✓</button>`}<label class="chk"><input type="checkbox" id="autoxi" ${s.autoXI!==false?'checked':''} data-act="autoxi"> Assistant picks the team before each match</label></div>
    <p class="sub">${tacSel?'Now tap a player in the list or another position to swap.':'Tap a position, then a player, to swap them. Red outline = out of position.'}</p>
  </section>
  <section class="panel"><div class="ph"><h2>Bench &amp; reserves</h2></div><ul class="plist">${others.map(p=>`<li><button class="${tacSel&&tacSel.type==='pl'&&tacSel.id===p.id?'sel':''}" data-act="tacPlayer" data-id="${p.id}" ${E.GROUP&&(!p.inj&&!p.ban&&!p.loan)?'':'aria-disabled="true"'}><span class="pos p-${E.GROUP[p.p]}">${p.p}</span><b>${esc(p.n)}</b><span class="ovr ${ratingClass(E.ovr(p))}">${E.ovr(p)}</span>${arrow(p)}${status(p)}</button></li>`).join('')}</ul></section>
  </div>`;
}

// TRANSFERS
function viewTransfers(){
  const s=S(); const f=tfFilter;
  let list=s.ids.map(E.P).filter(p=>p.c!==s.club && !p.loan && E.scouted(p));
  if(f.g!=='ALL') list=list.filter(p=>E.GROUP[p.p]===f.g);
  if(f.q) { const q=f.q.toLowerCase(); list=list.filter(p=>p.fn.toLowerCase().includes(q)||p.n.toLowerCase().includes(q)); }
  if(f.club!=='ALL') list=list.filter(p=>f.club==='EXT'?p.c==='EXT':p.c===f.club);
  if(!f.abroad) list=list.filter(p=>p.c!=='EXT');
  list=list.filter(p=>E.age(p)<=f.maxAge && E.value(p)<=f.maxVal);
  const so={r:(a,b)=>E.ovr(b)-E.ovr(a),pot:(a,b)=>b.pot-a.pot,val:(a,b)=>E.value(a)-E.value(b),age:(a,b)=>E.age(a)-E.age(b)}; list.sort(so[f.sort]);
  const deals=s.offers.filter(o=>o.kind!=='renew');
  const bids=s.inbox.filter(m=>m.action&&m.action.type==='bid'&&!m.done);
  return `<div class="grid tf">
  <section class="panel wide"><div class="ph"><h2>Transfer market</h2><span class="tag ${E.windowOpen()?'open':'shut'}">${esc(E.windowName())}</span></div>
    <div class="filters">
      <input id="tfq" type="search" placeholder="Search name" value="${esc(f.q)}" data-act="tfq">
      <select id="tfg" data-act="tfset" data-k="g">${['ALL','GK','DEF','MID','FWD'].map(x=>`<option ${f.g===x?'selected':''} value="${x}">${x==='ALL'?'All positions':x}</option>`).join('')}</select>
      <select id="tfc" data-act="tfset" data-k="club"><option value="ALL">All clubs</option><option value="EXT" ${f.club==='EXT'?'selected':''}>Outside the Premier League</option>${Object.keys(E.CLUBS).filter(c=>c!==s.club).map(c=>`<option value="${c}" ${f.club===c?'selected':''}>${esc(E.CLUBS[c].name)}</option>`).join('')}</select>
      <select id="tfa" data-act="tfset" data-k="maxAge">${[40,30,26,23,21].map(x=>`<option value="${x}" ${f.maxAge==x?'selected':''}>${x===40?'Any age':'Age '+x+' or under'}</option>`).join('')}</select>
      <select id="tfv" data-act="tfset" data-k="maxVal">${[300,100,60,30,15,5].map(x=>`<option value="${x}" ${f.maxVal==x?'selected':''}>${x===300?'Any value':'Up to £'+x+'m'}</option>`).join('')}</select>
      <select id="tfs" data-act="tfset" data-k="sort">${[['r','Best rated'],['pot','Highest potential'],['val','Cheapest'],['age','Youngest']].map(([k,l])=>`<option value="${k}" ${f.sort===k?'selected':''}>${l}</option>`).join('')}</select>
    </div>
    <p class="sub">${s.scoutRegion?`Players outside the Premier League show up only where your scouts cover (${esc(s.scoutRegion)}).`:'Set up your scouting network to see players outside the Premier League.'}</p>
    <div class="tscroll"><table class="tbl"><thead><tr><th>Player</th><th>Pos</th><th class="num">Age</th><th class="num">OVR</th><th class="num">POT</th><th>Club</th><th class="num">Value</th></tr></thead><tbody>
    ${list.slice(0,60).map(p=>`<tr data-act="player" data-id="${p.id}" tabindex="0"><td><b>${esc(p.n)}</b>${p.rt?'<span class="hist" title="Signed for a Premier League club in real life">real move</span>':''}</td><td><span class="pos p-${E.GROUP[p.p]}">${p.p}</span></td><td class="num">${E.age(p)}</td><td class="num"><span class="ovr ${ratingClass(E.ovr(p))}">${E.ovr(p)}</span></td><td class="num dim">${p.pot}</td><td>${p.c==='EXT'?`<span class="dim">${esc(p.fr)}</span>`:chip(p.c,1)+' '+esc(E.shortName(p.c))}</td><td class="num">${money(E.value(p))}</td></tr>`).join('')}
    </tbody></table></div>${list.length>60?`<p class="sub">Showing 60 of ${list.length}. Narrow the filters to see more.</p>`:''}${!list.length?'<p class="empty">No players match these filters.</p>':''}
  </section>
  <section class="panel"><div class="ph"><h2>Your deals</h2></div>${deals.length?`<ul class="deals">${deals.map(o=>{const p=E.P(o.pid); return `<li><b>${esc(p.n)}</b> <span class="dim">${o.loan?'loan':money(o.fee)}</span> ${o.state==='terms'?`<button class="btn sm" data-act="terms" data-id="${o.id}">Offer contract</button>`:o.state==='thinking'?`<span class="st">Decides ${E.fmtDate(o.decide).slice(0,6)}</span>`:o.state==='done'?'<span class="st ok">Signed</span>':'<span class="st bad">Failed</span>'}</li>`;}).join('')}</ul>`:'<p class="empty">No deals in progress.</p>'}
  <div class="ph"><h2>Offers for your players</h2></div>${bids.length?`<ul class="inbox">${bids.map(m=>`<li class="unread"><button data-act="openMsg" data-id="${m.id}"><b>${esc(m.title)}</b><em>Respond</em></button></li>`).join('')}</ul>`:'<p class="empty">None right now.</p>'}</section>
  </div>`;
}

// SCOUT
function viewScout(){
  const s=S();
  if(!s.scoutRegion) return `<section class="panel"><div class="ph"><h2>Scouting network</h2></div><p class="sub">You haven't set up a scouting network yet.</p><button class="btn primary" data-act="step" data-k="scout">Set up scouting</button></section>`;
  const mine=E.clubPlayers(s.club);
  const kids=mine.filter(p=>E.age(p)<=21).sort((a,b)=>b.pot-a.pot).slice(0,3);
  const need=E.weakestGroup(s.club);
  const targets=s.ids.map(E.P).filter(p=>p.c!==s.club&&!p.loan&&E.scouted(p)&&E.GROUP[p.p]===need&&E.age(p)<=29).sort((a,b)=>E.ovr(b)-E.ovr(a)).filter(p=>E.askingPrice(p,s.club)<=s.budget[s.club]*1.2).slice(0,3);
  const abroadKids=s.ids.map(E.P).filter(p=>p.c!==s.club&&E.scouted(p)&&E.age(p)<=21&&!p.loan).sort((a,b)=>b.pot-a.pot).slice(0,5);
  const key=mine.slice().sort((a,b)=>b.r-a.r).slice(0,5);
  const inj=mine.filter(p=>p.inj);
  const row=(p,note)=>`<li><button data-act="player" data-id="${p.id}"><span class="pos p-${E.GROUP[p.p]}">${p.p}</span><b>${esc(p.fn)}</b><span class="dim">${note||''}</span><span class="ovr ${ratingClass(E.ovr(p))}">${E.ovr(p)}</span></button></li>`;
  return `<div class="grid scout">
  <section class="panel report"><div class="ph"><h2>Scout report</h2><span class="tag">${esc(s.scoutRegion)}</span></div><p class="sub">${E.fmtDate(s.date)} · prepared for ${esc(s.manager)}</p>
    <h3>Transfer targets · ${({GK:'goalkeeper',DEF:'defender',MID:'midfielder',FWD:'forward'})[need]}</h3><p class="sub">Your weakest area right now. Affordable within your budget.</p><ol class="plist rank">${targets.map(p=>row(p,`${p.c==='EXT'?p.fr:E.shortName(p.c)} · ${money(E.askingPrice(p,s.club))}`)).join('')||'<li class="empty">Nobody suitable in budget.</li>'}</ol>
    <h3>Key players</h3><ul class="plist">${key.map(p=>row(p,`${p.apps} apps, ${p.g} goals`)).join('')}</ul>
    <h3>Youngsters to look at</h3><ul class="plist">${kids.map(p=>row(p,`age ${E.age(p)}, potential ${p.pot}`)).join('')||'<li class="empty">No under-21s in the squad.</li>'}</ul>
    <h3>Injured players</h3><ul class="plist">${inj.map(p=>row(p,`${p.injName}, ${p.inj} days`)).join('')||'<li class="empty">Nobody injured.</li>'}</ul>
  </section>
  <section class="panel"><div class="ph"><h2>Wonderkids spotted</h2></div><p class="sub">Best young players your scouts can see.</p><ul class="plist">${abroadKids.map(p=>row(p,`${p.c==='EXT'?p.fr:E.shortName(p.c)} · age ${E.age(p)} · POT ${p.pot}`)).join('')}</ul>
    <button class="btn" data-act="step" data-k="scout">Change region</button></section>
  </div>`;
}

// TABLE
function viewTable(){
  const s=S(); const t=E.sortedTable();
  const scorers=s.ids.map(E.P).filter(p=>p.g>0).sort((a,b)=>b.g-a.g||a.apps-b.apps).slice(0,10);
  const assists=s.ids.map(E.P).filter(p=>p.a>0).sort((a,b)=>b.a-a.a).slice(0,10);
  return `<div class="grid tablev">
  <section class="panel wide"><div class="ph"><h2>Premier League 2022/23</h2></div><div class="tscroll"><table class="tbl league"><thead><tr><th class="num">#</th><th>Club</th><th class="num">P</th><th class="num">W</th><th class="num">D</th><th class="num">L</th><th class="num hide-s">GF</th><th class="num hide-s">GA</th><th class="num">GD</th><th class="num">Pts</th><th class="hide-s">Form</th></tr></thead><tbody>
  ${t.map((c,i)=>{const r=s.table[c];return `<tr class="${c===s.club?'me':''} ${i<4?'ucl':i===4?'uel':i>=17?'rel':''}"><td class="num">${i+1}</td><td>${chip(c,1)} ${esc(E.CLUBS[c].name)}</td><td class="num">${r.p}</td><td class="num">${r.w}</td><td class="num">${r.d}</td><td class="num">${r.l}</td><td class="num hide-s">${r.gf}</td><td class="num hide-s">${r.ga}</td><td class="num">${r.gf-r.ga>0?'+':''}${r.gf-r.ga}</td><td class="num b">${r.pts}</td><td class="hide-s">${r.form.map(x=>`<span class="fm ${x}">${x}</span>`).join('')}</td></tr>`;}).join('')}</tbody></table></div>
  <p class="sub legend"><span class="lg ucl"></span>Champions League <span class="lg uel"></span>Europa League <span class="lg rel"></span>Relegation</p></section>
  <section class="panel"><div class="ph"><h2>Top scorers</h2></div><ol class="lb">${scorers.map(p=>`<li><button data-act="player" data-id="${p.id}"><b>${esc(p.n)}</b>${chip(p.c,1)}<span class="num">${p.g}</span></button></li>`).join('')||'<li class="empty">No goals yet.</li>'}</ol>
  <div class="ph"><h2>Assists</h2></div><ol class="lb">${assists.map(p=>`<li><button data-act="player" data-id="${p.id}"><b>${esc(p.n)}</b>${chip(p.c,1)}<span class="num">${p.a}</span></button></li>`).join('')||'<li class="empty">No assists yet.</li>'}</ol></section>
  </div>`;
}
// NEWS
function viewNews(){ return `<section class="panel feedpanel"><div class="ph"><h2>Feed</h2><span class="sub">2022/23 · social media era</span></div>${feed(S().news.slice(0,80))}</section>`; }
// RECORDS
function viewRecords(){
  const s=S(); const real=s.realHistory; const t=E.sortedTable();
  const res=s.log.results.filter(r=>r.h===s.club||r.a===s.club).slice().reverse();
  const tr=s.log.transfers.slice().reverse().slice(0,30);
  return `<div class="grid rec">
  ${s.ended?`<section class="panel wide finale"><div class="ph"><h2>Season review</h2></div><p class="lede">${esc(E.CLUBS[t[0]].name)} are champions. You finished ${E.ordinal(E.position(s.club))}. ${E.position(s.club)<=s.objective.pos?'Objective achieved.':'Objective missed.'}</p></section>`:''}
  <section class="panel"><div class="ph"><h2>Your results</h2></div>${res.length?`<ul class="results">${res.map(r=>{const us=r.h===s.club?r.hg-r.ag:r.ag-r.hg; return `<li class="${us>0?'W':us<0?'L':'D'}"><span>${E.fmtDate(r.d).slice(0,6)}</span><b>${esc(E.shortName(r.h))} ${r.hg}–${r.ag} ${esc(E.shortName(r.a))}</b></li>`;}).join('')}</ul>`:'<p class="empty">No matches played yet.</p>'}</section>
  <section class="panel"><div class="ph"><h2>Real 2022/23 vs your season</h2></div><p class="sub">What really happened, next to your version of history.</p><table class="tbl mini"><thead><tr><th class="num">#</th><th>Real life</th><th>Your game</th></tr></thead><tbody>${real.map((c,i)=>`<tr><td class="num">${i+1}</td><td class="${c===s.club?'b':''}">${esc(E.shortName(c))}</td><td class="${t[i]===s.club?'b':''}">${s.table[t[i]].p?esc(E.shortName(t[i])):'<span class="dim">–</span>'}</td></tr>`).join('')}</tbody></table></section>
  <section class="panel"><div class="ph"><h2>Transfers</h2></div>${tr.length?`<ul class="deals">${tr.map(x=>`<li><span class="dim">${E.fmtDate(x.d).slice(0,6)}</span> <b>${esc(E.P(x.id).n)}</b> <span class="dim">${esc(x.from)} → ${esc(x.to)}</span> <span>${x.loan?'loan':money(x.fee)}</span></li>`).join('')}</ul>`:'<p class="empty">No transfers yet.</p>'}</section>
  <section class="panel"><div class="ph"><h2>Manager changes</h2></div>${s.log.mgr.length?`<ul class="deals">${s.log.mgr.map(x=>`<li><span class="dim">${E.fmtDate(x.d).slice(0,6)}</span> ${chip(x.c,1)} ${esc(x.out)} → <b>${esc(x.inn)}</b></li>`).join('')}</ul>`:'<p class="empty">None yet. Real 2022/23 sackings replay unless results change history.</p>'}</section>
  </div>`;
}
// SETTINGS
function viewSettings(){
  const s=S();
  return `<div class="grid set">
  <section class="panel"><div class="ph"><h2>Game</h2></div>
    <div class="formrow"><span class="sub">Match speed</span>${[[1,'Slow'],[2,'Normal'],[4,'Fast']].map(([v,l])=>`<button class="seg${s.matchSpeed==v?' on':''}" data-act="speed" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="formrow"><button class="btn" data-act="saveNow">Save now</button><button class="btn" data-act="title">Main menu</button><button class="btn danger" data-act="resetAsk">Delete save</button></div>
    <p class="sub">The game saves automatically in this browser after every match. A save lives on this device only.</p></section>
  <section class="panel"><div class="ph"><h2>Where the data comes from</h2></div>
    <ul class="notes"><li><b>Squads, positions groups, prices, fixtures and real results:</b> official Premier League Fantasy data for 2022/23, squads as of Matchweek 1.</li><li><b>Birth dates, shirt numbers and exact positions:</b> Transfermarkt 2022/23 squad pages. 401 birth dates appear in both sources and all of them match.</li><li><b>Ratings:</b> worked out from each player's official FPL starting price, his 2021/22 minutes, bonus-points per 90 and his club's strength, then a scout check of about 230 players where FPL prices misjudge real quality (for example defensive midfielders). Mayan has the final say.</li><li><b>Estimates:</b> wages, contract lengths, transfer budgets and potential are estimates.</li><li><b>Signed later in real life:</b> players who joined Premier League clubs after the opening weekend start at their old club and move on their real dates unless you get there first.</li></ul></section>
  </div>`;
}

// ---------------- MODALS ----------------
function openModal(html, cls){ closeModal(); const w=document.createElement('div'); w.className='modal'; w.innerHTML=`<div class="mbox ${cls||''}" role="dialog" aria-modal="true"><button class="x" data-act="closeModal" aria-label="Close">✕</button>${html}</div>`; document.body.appendChild(w); const f=w.querySelector('input,button.btn'); if(f) setTimeout(()=>f.focus(),30); }
function closeModal(){ document.querySelectorAll('.modal').forEach(m=>m.remove()); }

function playerModal(id){
  const s=S(); const p=E.P(id); const mine=p.c===s.club; const a=E.age(p);
  const deal=s.offers.find(o=>o.pid===id&&(o.state==='terms'||o.state==='thinking'));
  const rated=E.ovr(p);
  let actions='';
  if(mine){
    actions=`<div class="formrow"><button class="btn" data-act="renewOpen" data-id="${id}">Offer new contract</button><button class="btn" data-act="list" data-id="${id}">${p.listed?'Remove from transfer list':'Transfer list'}</button>${a<=23&&!p.loan?`<button class="btn" data-act="loanOut" data-id="${id}">Loan out</button>`:''}<button class="btn danger" data-act="releaseAsk" data-id="${id}">Release</button></div>`;
  } else if(!p.loan){
    const ask=E.askingPrice(p,s.club);
    actions = deal? `<p class="sub">Deal in progress.</p>` : `<div class="bid"><label for="bidfee">Your bid (£m)</label><div class="formrow"><input id="bidfee" type="number" min="0" step="0.5" value="${Math.round(ask*0.9*2)/2}"><button class="btn primary" data-act="bid" data-id="${id}">Make bid</button><button class="btn" data-act="loanIn" data-id="${id}">Ask for loan</button></div><p class="sub">Estimated value ${money(E.value(p))}. ${p.c==='EXT'&&p.fr==='Free agent'?'Free agent, no fee needed.':''}</p></div>`;
  }
  const s21=p.s21&&p.s21.m!=null?`${p.s21.m} mins · ${p.s21.g} goals · ${p.s21.a} assists`:'No Premier League minutes';
  openModal(`<div class="pcard" style="--c1:${club(p.c)?club(p.c).col:'#556'};--c2:${club(p.c)?club(p.c).col2:'#ccd'}">
    <div class="pc-top"><div class="pc-r ${ratingClass(rated)}"><b>${rated}</b><span>${p.p}</span></div><div><h2>${esc(p.fn)}</h2><p>${p.c==='EXT'?esc(p.fr):esc(E.CLUBS[p.c].name)}${p.num?` · #${p.num}`:''}${p.loan?` · on loan at ${esc(p.loan.to)}`:''}</p></div></div>
    <dl class="kv"><div><dt>Age</dt><dd>${a}${p.dob?` <small>(${E.fmtDate(p.dob)})</small>`:''}</dd></div><div><dt>Base rating</dt><dd>${p.r} ${arrow(p)}</dd></div><div><dt>Potential</dt><dd>${p.pot}</dd></div><div><dt>Value</dt><dd>${money(E.value(p))}</dd></div><div><dt>Wage</dt><dd>£${p.wage}k/wk</dd></div><div><dt>Contract</dt><dd>${p.ce}</dd></div><div><dt>Morale</dt><dd>${Math.round(p.morale)}</dd></div><div><dt>Fitness</dt><dd>${Math.round(p.fit)}%</dd></div>
    <div><dt>This season</dt><dd>${p.apps} apps · ${p.g} G · ${p.a} A${p.apps?` · avg ${(p.rs/p.apps).toFixed(2)}`:''}</dd></div><div><dt>2021/22 (PL)</dt><dd>${s21}</dd></div></dl>
    ${p.inj?`<p class="warn">Injured: ${esc(p.injName)}, back in ${p.inj} days.</p>`:''}
    ${p.rt&&p.c==='EXT'?`<p class="sub">In real life he joined ${esc(E.CLUBS[p.rt].name)} in the ${p.rw} window. History will repeat unless you sign him first.</p>`:''}
    <p class="src">Source: ${esc(p.src)}</p>
    ${actions}<div id="mres" class="mres" aria-live="polite"></div></div>`);
}
function msgModal(id){
  const s=S(); const m=s.inbox.find(x=>x.id===id); if(!m) return; m.read=true;
  let act='';
  if(m.action&&m.action.type==='bid'&&!m.done){ const p=E.P(m.action.pid); act=`<div class="formrow"><button class="btn primary" data-act="bidAccept" data-id="${id}">Accept £${m.action.fee}m</button><button class="btn" data-act="bidReject" data-id="${id}">Reject</button></div><div class="formrow"><input id="counter" type="number" step="0.5" value="${Math.round(m.action.fee*1.25*2)/2}"><button class="btn" data-act="bidCounter" data-id="${id}">Counter-offer</button></div><button class="lnk" data-act="player" data-id="${p.id}">View ${esc(p.n)}</button>`; }
  openModal(`<div class="msg"><p class="md">${E.fmtDate(m.d)}</p><h2>${esc(m.title)}</h2><p>${esc(m.body)}</p>${act}<div id="mres" class="mres" aria-live="polite"></div></div>`);
  save();
}
function termsModal(oid){
  const s=S(); const o=s.offers.find(x=>x.id===oid); const p=E.P(o.pid); const fw=E.fairWage(p,s.club);
  openModal(`<div class="msg"><h2>Contract for ${esc(p.fn)}</h2><p class="sub">His agent expects around £${fw}k a week. Higher wages make him more likely to say yes. He'll take a few days to decide.</p>
  <label for="wage">Weekly wage (£k)</label><input id="wage" type="number" min="1" value="${fw}"><label for="yrs">Years</label><select id="yrs">${[1,2,3,4,5].map(y=>`<option ${y===4?'selected':''}>${y}</option>`).join('')}</select>
  <div class="formrow"><button class="btn primary" data-act="sendTerms" data-id="${oid}">Send offer</button></div><div id="mres" class="mres" aria-live="polite"></div></div>`);
}
function renewModal(pid){
  const p=E.P(pid); const fw=E.fairWage(p,S().club);
  openModal(`<div class="msg"><h2>New contract · ${esc(p.fn)}</h2><p class="sub">Currently £${p.wage}k/week until ${p.ce}. Fair wage for him now: about £${fw}k.</p><label for="wage">Weekly wage (£k)</label><input id="wage" type="number" min="1" value="${fw}"><label for="yrs">Years</label><select id="yrs">${[1,2,3,4,5].map(y=>`<option ${y===3?'selected':''}>${y}</option>`).join('')}</select><div class="formrow"><button class="btn primary" data-act="sendRenew" data-id="${pid}">Offer contract</button></div><div id="mres" class="mres" aria-live="polite"></div></div>`);
}
function stepModal(k){
  const s=S();
  if(k==='coaches'){
    const opts=[['attack','Attacking coach','Forwards and attacking midfielders develop faster.'],['defence','Defensive coach','Defenders, holding midfielders and keepers develop faster.'],['youth','Youth development coach','Under-21s improve much faster.'],['fitness','Fitness coach','Players recover from matches quicker.']];
    openModal(`<div class="msg"><h2>Hire coaches</h2><p class="sub">Choose two.</p><div class="pick2">${opts.map(([v,t,d])=>`<label class="opt"><input type="checkbox" name="coach" value="${v}" ${s.coaches.includes(v)?'checked':''}><b>${t}</b><span>${d}</span></label>`).join('')}</div><button class="btn primary" data-act="saveCoaches">Hire</button><div id="mres" class="mres"></div></div>`);
  } else if(k==='media'){
    openModal(`<div class="msg presser"><p class="md">Press conference · ${esc(club(s.club).std)}</p><h2>"What are your ambitions for this season?"</h2><div class="pick2">
      <button class="opt" data-act="media" data-v="bold"><b>"We're here to win trophies."</b><span>Fans love it. The board will hold you to it.</span></button>
      <button class="opt" data-act="media" data-v="measured"><b>"We'll build something that lasts."</b><span>Calm and sensible. The board approves.</span></button>
      <button class="opt" data-act="media" data-v="humble"><b>"One game at a time."</b><span>Low expectations. Fans want more.</span></button></div></div>`);
  } else if(k==='plan'){ closeModal(); tab='tactics'; renderHub();
  } else if(k==='scout'){
    openModal(`<div class="msg"><h2>Scouting network</h2><p class="sub">Your scouts will report on players from this region. Premier League players are always visible.</p><div class="pick2">${Object.keys(E.REGIONS).map(r=>`<button class="opt" data-act="scoutRegion" data-v="${esc(r)}"><b>${esc(r)}</b><span>${esc(E.REGIONS[r].slice(0,4).join(', '))}${E.REGIONS[r].length>4?'…':''}</span></button>`).join('')}</div></div>`);
  } else if(k==='objectives'){
    const o=s.objective;
    openModal(`<div class="msg"><h2>Board objectives</h2><ul class="notes"><li><b>League:</b> ${esc(o.label)}.</li><li><b>Finance:</b> stay within your wage budget of £${s.wageBudget}k a week.</li><li><b>Youth:</b> give minutes to players aged 21 or under.</li><li><b>Transfers:</b> £${s.budget[s.club]}m to spend. Unused money stays with the club.</li></ul><button class="btn primary" data-act="acceptObj">Accept objectives</button></div>`);
  }
}

// ---------------- MATCH ----------------
function startMatchDay(){
  const s=S(); const r=E.advance();
  if(r==='blocked'){ toast('Finish your pre-season checklist first.',1); return; }
  if(r==='end'||r==='sacked'){ save(); renderHub(); return; }
  if(s.autoXI!==false) E.autoPick(); else E.validateUserXI();
  const f=E.nextUserFixture();
  const m=E.simMatch(f,E.setupFor(f));
  m.added=2+Math.floor(Math.random()*6);
  live={m, f, us: f.h===s.club?0:1, timer:null, paused:true, shown:0};
  save();
  renderPreMatch();
}
function lineupBoard(side){
  const m=live.m; const st=side?m.setup.a:m.setup.h; const c=side?m.a:m.h; const co=E.COORDS[st.formation]; const slots=E.FORMATIONS[st.formation];
  return `<div class="lu" style="--c1:${club(c).col};--c2:${club(c).col2}"><div class="luh">${chip(c)} <b>${esc(club(c).name)}</b><span>${st.formation} · ${esc(st.style)}</span></div><div class="pitch">${slots.map((sl,i)=>{const p=st.xi[i]&&E.P(st.xi[i]); return p?`<div class="dot" style="left:${side?100-co[i][0]:co[i][0]}%;bottom:${co[i][1]}%"><span class="dr ${ratingClass(E.ovr(p))}">${E.ovr(p)}</span><span class="dn">${esc(p.n)}</span></div>`:''}).join('')}</div><p class="lub">Bench: ${st.bench.slice(0,9).map(id=>esc(E.P(id).n)).join(', ')}</p></div>`;
}
function renderPreMatch(){
  const m=live.m, f=live.f; const s=S();
  app.innerHTML=`<section class="matchday">
    <div class="mhead"><div class="mt1">${chip(m.h)} <b>${esc(club(m.h).name)}</b> <span>vs</span> <b>${esc(club(m.a).name)}</b> ${chip(m.a)}</div>
    <div class="mt2">${esc(club(m.h).std)} · ${f.t} · Referee: ${esc(m.ref)} · ${esc(m.weather)} · Premier League · Matchweek ${f.gw}</div></div>
    <div class="lus">${lineupBoard(0)}${lineupBoard(1)}</div>
    <div class="formrow center"><button class="btn" data-act="toTactics">Change team</button><button class="btn primary big" data-act="kickoff">Kick off ▶</button><button class="btn" data-act="simMatch">Quick result</button></div>
  </section>`;
}
function renderLive(){
  const m=live.m; const us=live.us; const s=S();
  const st=(a,b,l,fmt)=>{const t=(a+b)||1; return `<div class="sbar"><span>${fmt?fmt(a):a}</span><div><i style="width:${a/t*100}%"></i></div><span>${fmt?fmt(b):b}</span><em>${l}</em></div>`;};
  app.innerHTML=`<section class="matchday live">
   <div class="score" style="--h1:${club(m.h).col};--h2:${club(m.h).col2};--a1:${club(m.a).col};--a2:${club(m.a).col2}">
     <div class="sh"><b>${esc(E.shortName(m.h))}</b></div><div class="sc"><span id="hg">${m.hg}</span><i>–</i><span id="ag">${m.ag}</span></div><div class="sa"><b>${esc(E.shortName(m.a))}</b></div>
     <div class="clock" id="clock">${m.min}'</div>
   </div>
   <div class="mgrid">
     <div class="comm" id="comm" aria-live="polite">${m.ev.slice().reverse().map(evHtml).join('')}</div>
     <div class="side">
       <div class="panel stats" id="stats">${st(m.poss,100-m.poss,'Possession',x=>x+'%')}${st(m.shots[0],m.shots[1],'Shots')}${st(m.sot[0],m.sot[1],'On target')}${st(Math.round(m.xg[0]*100)/100,Math.round(m.xg[1]*100)/100,'xG',x=>x.toFixed(2))}${st(m.yc[0],m.yc[1],'Yellow cards')}</div>
       <div class="panel ctrl">
         ${m.done?`<button class="btn primary big" data-act="fullTime">Full-time report ▶</button>`:`
         <div class="formrow"><button class="btn ${live.paused?'primary':''}" data-act="playPause">${live.paused?(m.min===0?'Kick off ▶':'Resume ▶'):'Pause ❚❚'}</button><button class="btn" data-act="skipEnd">Skip to end ⏭</button></div>
         <div class="formrow"><span class="sub">Speed</span>${[[1,'1×'],[2,'2×'],[4,'4×']].map(([v,l])=>`<button class="seg${s.matchSpeed==v?' on':''}" data-act="lspeed" data-v="${v}">${l}</button>`).join('')}</div>
         <div class="formrow"><span class="sub">Mentality</span>${[[2,'Defend'],[0,'Balanced'],[1,'Attack']].map(([v,l])=>`<button class="seg${m.mentality[us]==v?' on':''}" data-act="mental" data-v="${v}">${l}</button>`).join('')}</div>
         <button class="btn" data-act="subsOpen">Substitutions (${5-m.subs[us]} left)</button>`}
       </div>
     </div>
   </div></section>`;
}
function evHtml(e){ return `<div class="ev t-${e.t} ${e.side===live.us?'us':e.side===-1?'nt':'them'}"><span class="em">${e.min}'</span><p>${esc(e.text)}</p></div>`; }
function tick(){
  if(!live||live.paused) return; const m=live.m; const s=S();
  E.aiSubs(m,1-live.us); E.aiMentality(m,live.us);
  const out=E.stepMinute(m);
  // auto pause at HT and at big moments? keep flowing; pause at HT
  const comm=$('#comm');
  if(comm){ out.forEach(e=>comm.insertAdjacentHTML('afterbegin',evHtml(e))); $('#clock').textContent=m.min+"'"; $('#hg').textContent=m.hg; $('#ag').textContent=m.ag; if(out.some(e=>e.t==='goal')) flashGoal(); }
  if(m.min%5===0||out.length) { const st=$('#stats'); if(st){ /* refresh stats lightly */ renderStatsOnly(); } }
  const injured=E.onPitch(m,live.us).find(p=>m.ratings[p.id].injured&&!m.ratings[p.id].told);
  if(injured){ m.ratings[injured.id].told=1; pauseLive(); renderLive(); toast(`${injured.n} is injured. Make a substitution.`,1); return; }
  if(m.min===45||m.done){ pauseLive(); renderLive(); return; }
  live.timer=setTimeout(tick, Math.round(520/(s.matchSpeed||2)));
}
function renderStatsOnly(){ const m=live.m; const el=$('#stats'); if(!el) return; const st=(a,b,l,fmt)=>{const t=(a+b)||1; return `<div class="sbar"><span>${fmt?fmt(a):a}</span><div><i style="width:${a/t*100}%"></i></div><span>${fmt?fmt(b):b}</span><em>${l}</em></div>`;}; el.innerHTML=`${st(m.poss,100-m.poss,'Possession',x=>x+'%')}${st(m.shots[0],m.shots[1],'Shots')}${st(m.sot[0],m.sot[1],'On target')}${st(Math.round(m.xg[0]*100)/100,Math.round(m.xg[1]*100)/100,'xG',x=>x.toFixed(2))}${st(m.yc[0],m.yc[1],'Yellow cards')}`; }
function flashGoal(){ const sc=document.querySelector('.score'); if(!sc) return; sc.classList.remove('goal'); void sc.offsetWidth; sc.classList.add('goal'); }
function pauseLive(){ if(!live) return; live.paused=true; clearTimeout(live.timer); }
function playLive(){ if(!live) return; live.paused=false; renderLive(); live.timer=setTimeout(tick,200); }
function subsModal(){
  const m=live.m, us=live.us; const st=us?m.setup.a:m.setup.h;
  const on=E.onPitch(m,us); const bench=st.bench.map(E.P).filter(p=>!m.ratings[p.id]);
  openModal(`<div class="msg subs"><h2>Substitution</h2><p class="sub">${5-m.subs[us]} of 5 left. Pick who comes off, then who comes on.</p>
  <div class="subcols"><div><h3>Off</h3><ul class="plist">${on.map(p=>`<li><button data-act="subOff" data-id="${p.id}"><span class="pos p-${E.GROUP[E.slotOf(m,us,p.id)]}">${E.slotOf(m,us,p.id)}</span><b>${esc(p.n)}</b><span class="dim">${m.ratings[p.id].r.toFixed(1)}${m.ratings[p.id].injured?' 🚑':''}${m.ratings[p.id].yc?' 🟨':''}</span></button></li>`).join('')}</ul></div>
  <div><h3>On</h3><ul class="plist">${bench.map(p=>`<li><button data-act="subOn" data-id="${p.id}"><span class="pos p-${E.GROUP[p.p]}">${p.p}</span><b>${esc(p.n)}</b><span class="ovr ${ratingClass(E.ovr(p))}">${E.ovr(p)}</span></button></li>`).join('')}</ul></div></div><div id="mres" class="mres"></div></div>`,'wide');
}
let subPick={off:null,on:null};
function tryDoSub(){ if(subPick.off&&subPick.on){ const ok=E.makeSub(live.m,live.us,subPick.off,subPick.on); subPick={off:null,on:null}; closeModal(); renderLive(); if(!ok) toast('No substitutions left.',1); } else { const r=$('#mres'); if(r) r.textContent=subPick.off?'Now pick who comes on.':'Now pick who comes off.'; } }
function fullTime(){
  pauseLive(); const m=live.m; E.finalize(m); E.afterUserMatchDay(); save();
  const day=S().fixtures.filter(f=>f.d===live.f.d&&f.played&&f.i!==live.f.i);
  const rows=side=>{ const c=side?m.a:m.h; return Object.keys(m.ratings).map(Number).filter(id=>E.P(id).c===c||(side?m.setup.a:m.setup.h).xi.includes(id)).map(id=>[E.P(id),m.ratings[id]]).sort((a,b)=>b[1].final-a[1].final).map(([p,r])=>`<tr class="${m.motm===p.id?'motm':''}"><td>${esc(p.n)}${r.g?' '+'⚽'.repeat(r.g):''}${r.a?' 🅰️':''}${m.motm===p.id?' ★':''}</td><td class="num"><span class="mr ${r.final>=7.5?'hi':r.final<6?'lo':''}">${r.final.toFixed(1)}</span></td></tr>`).join(''); };
  const us=live.us; const won=(us?m.ag-m.hg:m.hg-m.ag);
  app.innerHTML=`<section class="matchday ft"><div class="score small ${won>0?'win':won<0?'loss':''}" style="--h1:${club(m.h).col};--h2:${club(m.h).col2};--a1:${club(m.a).col};--a2:${club(m.a).col2}"><div class="sh"><b>${esc(E.shortName(m.h))}</b></div><div class="sc"><span>${m.hg}</span><i>–</i><span>${m.ag}</span></div><div class="sa"><b>${esc(E.shortName(m.a))}</b></div><div class="clock">FT</div></div>
  <p class="scorers">${m.scorers.map(x=>`${esc(E.P(x.id).n)} ${x.min}'`).join(' · ')||'No goals'}</p>
  <div class="mgrid two"><div class="panel"><div class="ph"><h2>${esc(E.shortName(m.h))} ratings</h2></div><table class="tbl mini">${rows(0)}</table></div><div class="panel"><div class="ph"><h2>${esc(E.shortName(m.a))} ratings</h2></div><table class="tbl mini">${rows(1)}</table></div>
  <div class="panel"><div class="ph"><h2>Other results</h2></div>${day.length?`<ul class="results">${day.map(f=>`<li><b>${esc(E.shortName(f.h))} ${f.hg}–${f.ag} ${esc(E.shortName(f.a))}</b></li>`).join('')}</ul>`:'<p class="empty">No other games today.</p>'}</div></div>
  <div class="formrow center"><button class="btn primary big" data-act="backHub">Back to the club ▶</button></div></section>`;
  live=null;
}

// ---------------- EVENTS ----------------
document.addEventListener('click', e=>{
  const t=e.target.closest('[data-act]'); if(!t) return;
  if (t.getAttribute('aria-disabled')==='true' && !['continue'].includes(t.dataset.act)) return;
  const a=t.dataset.act, s=S();
  const res=(r)=>{ const el=$('#mres'); if(el){ el.textContent=r.msg; el.className='mres '+(r.ok?'ok':'bad'); } else toast(r.msg,!r.ok); };
  switch(a){
    case 'title': pauseLive(); live=null; closeModal(); renderTitle(); break;
    case 'new': pending={}; renderEras(); break;
    case 'intl': toast('International mode is planned for a later version.'); break;
    case 'challenges': renderChallenges(); break;
    case 'pickChallenge': { const c=CHALLENGES.find(x=>x.id===t.dataset.id); pending={club:c.club,challenge:c}; renderManager(); break; }
    case 'load': { const sv=loadSave(); if(sv){ E.S=sv; tab='home'; renderHub(); } break; }
    case 'eras': renderEras(); break;
    case 'era22': renderClubs(); break;
    case 'pickClub': pending.club=t.dataset.c; renderManager(); break;
    case 'startNew': { const n=($('#mname').value||'').trim(); if(!n){ toast('Type your manager name first.',1); $('#mname').focus(); return; } startGame(n,false); break; }
    case 'startReal': startGame(club(pending.club).mgr,true); break;
    case 'tab': tab=t.dataset.t; closeModal(); renderHub(); window.scrollTo(0,0); break;
    case 'continue': if(!E.onboardingDone()){ toast('Finish the pre-season checklist first.',1); tab='home'; renderHub(); return; } startMatchDay(); break;
    case 'step': stepModal(t.dataset.k); break;
    case 'saveCoaches': { const v=[...document.querySelectorAll('input[name=coach]:checked')].map(x=>x.value); if(v.length!==2){ res({ok:false,msg:'Pick exactly two coaches.'}); return; } E.doCoaches(v); closeModal(); save(); renderHub(); toast('Coaches hired'); break; }
    case 'media': E.doMedia(t.dataset.v); closeModal(); save(); renderHub(); toast('Press conference done'); break;
    case 'scoutRegion': E.doScout(t.dataset.v); closeModal(); save(); renderHub(); toast('Scouts sent out'); break;
    case 'acceptObj': E.doObjectives(); closeModal(); save(); renderHub(); toast('Objectives accepted'); break;
    case 'confirmPlan': E.doPlan(s.formation,s.style); save(); renderHub(); toast('Gameplan confirmed'); break;
    case 'formation': s.formation=t.dataset.f; E.autoPick(); tacSel=null; renderHub(); break;
    case 'style': s.style=t.dataset.f; renderHub(); break;
    case 'autopick': E.autoPick(); tacSel=null; renderHub(); break;
    case 'autoxi': s.autoXI=t.checked; save(); break;
    case 'slot': { const i=+t.dataset.i; if(tacSel&&tacSel.type==='slot'){ const j=tacSel.i; [s.xi[i],s.xi[j]]=[s.xi[j],s.xi[i]]; tacSel=null; } else if(tacSel&&tacSel.type==='pl'){ swapIn(tacSel.id,i); tacSel=null; } else tacSel={type:'slot',i}; s.autoXI=false; renderHub(); break; }
    case 'tacPlayer': { const id=+t.dataset.id; if(tacSel&&tacSel.type==='slot'){ swapIn(id,tacSel.i); tacSel=null; s.autoXI=false; } else tacSel={type:'pl',id}; renderHub(); break; }
    case 'sortSquad': squadSort=t.dataset.k; renderHub(); break;
    case 'player': playerModal(+t.dataset.id); break;
    case 'closeModal': closeModal(); break;
    case 'openMsg': msgModal(+t.dataset.id); rerenderBehind(); break;
    case 'readAll': s.inbox.forEach(m=>m.read=true); renderHub(); break;
    case 'bid': { const fee=parseFloat($('#bidfee').value)||0; const r=E.makeBid(+t.dataset.id,fee,false); res(r); if(r.ok){ save(); setTimeout(()=>termsModal(r.offer.id),700); } else if(r.counter){ $('#bidfee').value=r.counter; } break; }
    case 'loanIn': { const r=E.makeBid(+t.dataset.id,0,true); res(r); if(r.ok){ save(); setTimeout(()=>termsModal(r.offer.id),700); } break; }
    case 'terms': termsModal(+t.dataset.id); break;
    case 'sendTerms': { const r=E.offerTerms(+t.dataset.id, parseInt($('#wage').value)||0, parseInt($('#yrs').value)||4); res(r); if(r.ok){ save(); setTimeout(()=>{closeModal(); renderHub();},900); } break; }
    case 'renewOpen': renewModal(+t.dataset.id); break;
    case 'sendRenew': { const r=E.renewContract(+t.dataset.id, parseInt($('#wage').value)||0, parseInt($('#yrs').value)||3); res(r); if(r.ok) save(); break; }
    case 'list': { const p=E.P(+t.dataset.id); E.listPlayer(p.id,!p.listed); save(); playerModal(p.id); break; }
    case 'loanOut': { const r=E.loanOut(+t.dataset.id); res(r); if(r.ok){ save(); setTimeout(()=>{closeModal();renderHub();},900);} break; }
    case 'releaseAsk': { const el=$('#mres'); el.innerHTML=`Release him? You'll pay up his contract. <button class="btn sm danger" data-act="release" data-id="${t.dataset.id}">Yes, release</button>`; break; }
    case 'release': { const r=E.releasePlayer(+t.dataset.id); save(); closeModal(); renderHub(); toast(r.msg); break; }
    case 'bidAccept': { const r=E.answerBid(+t.dataset.id,true); res(r); save(); setTimeout(()=>{closeModal();renderHub();},900); break; }
    case 'bidReject': { const r=E.answerBid(+t.dataset.id,false); res(r); save(); setTimeout(()=>{closeModal();renderHub();},700); break; }
    case 'bidCounter': { const r=E.answerBid(+t.dataset.id,false,parseFloat($('#counter').value)); res(r); save(); setTimeout(()=>{closeModal();renderHub();},1100); break; }
    case 'speed': s.matchSpeed=+t.dataset.v; save(); renderHub(); break;
    case 'saveNow': save(); toast('Game saved'); break;
    case 'resetAsk': openModal(`<div class="msg"><h2>Delete your save?</h2><p>This can't be undone.</p><div class="formrow"><button class="btn danger" data-act="reset">Delete save</button><button class="btn" data-act="closeModal">Keep it</button></div></div>`); break;
    case 'reset': try{localStorage.removeItem(SAVE_KEY);}catch(e){} closeModal(); E.S=null; renderTitle(); toast('Save deleted'); break;
    // match
    case 'toTactics': tab='tactics'; live=null; renderHub(); toast('Pick your team, then press Continue to come back to the match.'); break;
    case 'kickoff': playLive(); break;
    case 'simMatch': E.runToEnd(live.m, -1); fullTime(); break;
    case 'playPause': if(live.paused) playLive(); else { pauseLive(); renderLive(); } break;
    case 'skipEnd': pauseLive(); E.runToEnd(live.m, live.us); renderLive(); break;
    case 'lspeed': s.matchSpeed=+t.dataset.v; renderLive(); break;
    case 'mental': live.m.mentality[live.us]=+t.dataset.v; renderLive(); break;
    case 'subsOpen': pauseLive(); renderLive(); subPick={off:null,on:null}; subsModal(); break;
    case 'subOff': subPick.off=+t.dataset.id; t.classList.add('sel'); tryDoSub(); break;
    case 'subOn': subPick.on=+t.dataset.id; t.classList.add('sel'); tryDoSub(); break;
    case 'fullTime': fullTime(); break;
    case 'backHub': tab='home'; renderHub(); break;
  }
});
function rerenderBehind(){ const v=$('#view'); if(v && tab==='home'){ v.innerHTML=renderTab(); } }
function swapIn(pid,slot){ const s=S(); const p=E.P(pid); if(p.inj||p.ban||p.loan){ toast(`${p.n} isn't available.`,1); return; } const cur=s.xi.indexOf(pid); if(cur>=0){ [s.xi[cur],s.xi[slot]]=[s.xi[slot],s.xi[cur]]; } else { const out=s.xi[slot]; s.xi[slot]=pid; s.bench=s.bench.filter(x=>x!==pid); if(out) s.bench.unshift(out); } }
document.addEventListener('change', e=>{
  const t=e.target; if(!t.dataset) return;
  if(t.dataset.act==='tfset'){ const k=t.dataset.k; tfFilter[k]= (k==='maxAge'||k==='maxVal')? +t.value : t.value; renderHub(); }
});
document.addEventListener('input', e=>{ const t=e.target; if(t.dataset&&t.dataset.act==='tfq'){ tfFilter.q=t.value; clearTimeout(window._tfq); window._tfq=setTimeout(()=>{ renderHub(); const i=$('#tfq'); if(i){ i.focus(); i.setSelectionRange(i.value.length,i.value.length);} },250); } });
document.addEventListener('keydown', e=>{
  if(e.key==='Escape') closeModal();
  if(e.key==='Enter' && e.target.matches('tr[data-act]')) e.target.click();
});
function bindTabKeys(){
  document.onkeydown2=null;
}
document.addEventListener('keydown', e=>{
  if(!S()||live||document.querySelector('.modal')||/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
  const i=TABS.findIndex(x=>x[0]===tab);
  if(e.key==='q'||e.key==='Q'){ tab=TABS[(i+TABS.length-1)%TABS.length][0]; renderHub(); }
  if(e.key==='e'||e.key==='E'){ tab=TABS[(i+1)%TABS.length][0]; renderHub(); }
});

// boot
const hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) hot.snapshot(()=>({save:S(), tab}));
function start(data){ if(data&&data.save){ E.S=data.save; tab=data.tab||'home'; renderHub(); } else renderTitle(); }
if (hot && hot.ready) hot.ready(start); else start((hot&&hot.data)||{});
})();
