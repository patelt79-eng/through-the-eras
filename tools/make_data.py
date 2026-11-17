import pandas as pd, numpy as np, json, hashlib, unicodedata, re
D='/home/claude/src/fpl/data'
df=pd.read_pickle('stage2.pkl').copy()
teams=pd.read_csv(f'{D}/2022-23/teams.csv'); SHORT=dict(zip(teams.name,teams.short_name)); TID={r.id:r.short_name for r in teams.itertuples()}
def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z ]',' ',s.replace('-',' ')).split()
tm=[l.split('|') for l in open('/home/claude/src/tm_2022.txt').read().strip().split('\n')]
pos=open('/home/claude/src/tm_pos.txt').read().strip().split(',')
assert len(pos)==len(tm),(len(pos),len(tm))
tm=[dict(club=a,num=b,name=c,dob='-'.join(reversed(d.split('/'))),pos=p) for (a,b,c,d),p in zip(tm,pos)]
used=set(); tmpos={}; tmnum={}
for i,r in df.iterrows():
    toks=set(norm(r.full)+norm(r.web_name)); web=set(norm(r.web_name))
    best=None;bs=0
    for j,t in enumerate(tm):
        tt=norm(t['name']); hit=sum(1 for x in tt if x in toks)
        if not tt: continue
        if len(tt)==1 and hit==1 and tt[0] not in web: continue
        sc=hit/len(tt)+0.01*hit
        if sc<0.6: continue
        sc+=0.4 if t['club']==r.clubS else 0
        if sc>bs: bs,best=sc,j
    if best is not None and bs>=1.0:
        tmpos[i]=tm[best]['pos']; used.add(best)
        if tm[best]['club']==r.clubS and tm[best]['num']!='-': tmnum[i]=int(tm[best]['num'])
df['tpos']=pd.Series(tmpos); df['num']=pd.Series(tmnum)
DEF_POS={1:'GK',2:'CB',3:'CM',4:'ST'}
df['tpos']=df.tpos.fillna(df.element_type.map(DEF_POS))
# fix pos groups contradicting FPL? keep TM detail but group from TM
G={'GK':'GK','CB':'DEF','LB':'DEF','RB':'DEF','DM':'MID','CM':'MID','AM':'MID','LM':'MID','RM':'MID','LW':'FWD','RW':'FWD','ST':'FWD'}

EXTERNAL={'Aubameyang':'Barcelona','Gakpo':'PSV','Antony':'Ajax','João Félix':'Atlético Madrid','Isak':'Real Sociedad','Mudryk':'Shakhtar Donetsk','Danjuma':'Villarreal','Dennis':'Watford','Weghorst':'Beşiktaş','Paquetá':'Lyon','Guedes':'Valencia','Cornet':'Burnley','Willian':'Corinthians','Rutter':'Hoffenheim','Orsic':'Dinamo Zagreb','Cunha':'Atlético Madrid','Onuachu':'Genk','Tetê':'Shakhtar Donetsk','Sarabia':'Paris Saint-Germain','Durán':'Chicago Fire','Madueke':'PSV','Diego Costa':'Free agent','Vinícius':'Benfica','Damsgaard':'Sampdoria','Kalajdžić':'Stuttgart','Akanji':'Borussia Dortmund','Gueye':'Paris Saint-Germain','Casemiro':'Real Madrid','Badiashile':'Monaco','Scarpa':'Palmeiras','D.D.Fofana':'Molde','Schade':'Freiburg','Zakaria':'Juventus','Arthur':'Juventus','Gnonto':'FC Zürich','Freuler':'Atalanta','Matheus':'Sporting CP','Ouattara':'Lorient','Sabitzer':'Bayern Munich','McKennie':'Juventus','A.Ayew':'Al Sadd','Pedro Porro':'Sporting CP','Semenyo':'Bristol City','Onana':'Lille','Alcaraz':'Racing Club','Enzo':'Benfica','Kamaldeen':'Rennes','Kouyaté':'Free agent','Senesi':'Feyenoord','Neto':'Barcelona','Estupiñán':'Villarreal','Renan Lodi':'Atlético Madrid','Kurzawa':'Paris Saint-Germain','Faes':'Reims','Badé':'Rennes','Caleta-Car':'Marseille','Kehrer':'Paris Saint-Germain','Sergio Gómez':'Anderlecht','Zabarnyi':'Dynamo Kyiv','Ahamada':'Stuttgart','H.Traorè':'Sassuolo','João Gomes':'Flamengo','Ayari':'AIK','Viña':'Roma','Bree':'Luton Town','Felipe':'Atlético Madrid','Souttar':'Stoke City','Navas':'Paris Saint-Germain','Aurier':'Free agent','Traoré':'Metz','Lemina':'Nice','Álex Moreno':'Real Betis','Wöber':'Red Bull Salzburg','Kuol':'Central Coast Mariners','Buonanotte':'Rosario Central','Andrey Santos':'Vasco da Gama','Danilo':'Palmeiras','Kristiansen':'FC Copenhagen','Perrone':'Vélez Sarsfield','Lukic':'Torino','Edozie':'Man City U21'}
late=df.firstGW>1
ext=late & df.web_name.isin(EXTERNAL.keys())
df.loc[ext,'extFrom']=df.loc[ext,'web_name'].map(EXTERNAL)
df.loc[ext,'realTo']=df.loc[ext,'clubS']
df.loc[ext,'realWin']=np.where(df.loc[ext,'firstGW']<=6,'summer','january')
# academy kids appearing later but at club all season
acad=late & ~ext & (df.age<=21)
df['inGame']=(df.openday | ext | acad)
g=df[df.inGame].copy()
g.loc[g.extFrom.notna(),'clubS']='EXT'
# --- scout adjustments (Aug 2022 judgement where FPL price misreads real quality) ---
ADJ={('LIV','Alisson'):90,('LIV','Van Dijk'):90,('LIV','Alexander-Arnold'):86,('LIV','Robertson'):86,('LIV','Salah'):90,('LIV','Fabinho'):86,('LIV','Thiago'):86,('LIV','Henderson'):82,('LIV','Luis Díaz'):84,('LIV','Diogo Jota'):84,('LIV','Firmino'):83,('LIV','Darwin'):81,('LIV','Matip'):84,('LIV','Konaté'):82,('LIV','Keita'):79,('LIV','Elliott'):76,('LIV','Bajcetic'):62,('LIV','Carvalho'):72,('LIV','Gomez'):79,('LIV','Tsimikas'):76,('LIV','Milner'):77,('LIV','Chamberlain'):75,('LIV','Jones'):75,
('MCI','De Bruyne'):91,('MCI','Haaland'):88,('MCI','Rodri'):87,('MCI','Dias'):88,('MCI','Ederson'):89,('MCI','Cancelo'):88,('MCI','Laporte'):85,('MCI','Stones'):84,('MCI','Walker'):85,('MCI','Foden'):85,('MCI','Bernardo'):87,('MCI','Gündogan'):85,('MCI','Mahrez'):86,('MCI','Grealish'):84,('MCI','Álvarez'):77,('MCI','Aké'):80,('MCI','Phillips'):80,
('ARS','Saka'):84,('ARS','Ødegaard'):84,('ARS','Partey'):82,('ARS','Gabriel'):81,('ARS','Saliba'):77,('ARS','White'):80,('ARS','Jesus'):83,('ARS','Martinelli'):80,('ARS','Ramsdale'):81,('ARS','Xhaka'):80,('ARS','Zinchenko'):80,('ARS','Tomiyasu'):78,('ARS','Tierney'):80,
('CHE','Kanté'):87,('CHE','Jorginho'):84,('CHE','James'):84,('CHE','Thiago Silva'):85,('CHE','Koulibaly'):86,('CHE','Mount'):83,('CHE','Sterling'):86,('CHE','Havertz'):82,('CHE','Kovacic'):84,('CHE','Mendy'):85,('CHE','Chilwell'):82,('CHE','Cucurella'):79,('CHE','Azpilicueta'):81,('CHE','Pulisic'):79,('CHE','Ziyech'):80,('CHE','Gallagher'):77,('CHE','Arrizabalaga'):78,('CHE','Loftus-Cheek'):77,
('TOT','Kane'):89,('TOT','Son'):89,('TOT','Lloris'):86,('TOT','Højbjerg'):81,('TOT','Bentancur'):81,('TOT','Romero'):84,('TOT','Kulusevski'):82,('TOT','Richarlison'):82,('TOT','Perišić'):82,('TOT','Dier'):79,('TOT','Bissouma'):79,
('MUN','Fernandes'):86,('MUN','Varane'):84,('MUN','De Gea'):85,('MUN','Ronaldo'):88,('MUN','Rashford'):82,('MUN','Sancho'):82,('MUN','Martínez'):82,('MUN','Eriksen'):82,('MUN','Shaw'):81,('MUN','Maguire'):79,('MUN','Dalot'):77,('MUN','Fred'):79,('MUN','McTominay'):78,('MUN','Garnacho'):65,
('WHU','Rice'):83,('WHU','Bowen'):81,('WHU','Soucek'):79,('WHU','Zouma'):80,('WHU','Aguerd'):79,('WHU','Fabianski'):80,('WHU','Scamacca'):78,
('NEW','Bruno Guimarães'):82,('NEW','Trippier'):82,('NEW','Botman'):79,('NEW','Pope'):82,('NEW','Joelinton'):77,('NEW','Almirón'):76,('NEW','Saint-Maximin'):79,('NEW','Schär'):78,('NEW','Wilson'):78,
('BHA','Caicedo'):77,('BHA','Mac Allister'):79,('BHA','Mitoma'):74,('BHA','Trossard'):79,('BHA','Groß'):78,('BHA','Dunk'):79,('BHA','Webster'):77,('BHA','Colwill'):70,('BHA','Ferguson'):64,('BHA','Enciso'):70,
('FUL','Mitrović'):78,('FUL','Palhinha'):79,('FUL','Leno'):80,('FUL','Andreas'):75,('FUL','Wilson'):74,
('AVL','Martínez'):84,('AVL','Kamara'):79,('AVL','McGinn'):79,('AVL','Watkins'):78,('AVL','Coutinho'):79,('AVL','Douglas Luiz'):79,('AVL','Mings'):78,
('EVE','Pickford'):81,('EVE','Tarkowski'):77,('EVE','Calvert-Lewin'):76,('EVE','Gordon'):73,
('SOU','Ward-Prowse'):81,('SOU','Lavia'):66,('SOU','Bazunu'):72,
('BRE','Toney'):80,('BRE','Raya'):80,('BRE','Nørgaard'):77,('BRE','Mbeumo'):76,('BRE','Pinnock'):76,
('CRY','Zaha'):82,('CRY','Eze'):77,('CRY','Olise'):76,('CRY','Guéhi'):77,('CRY','Andersen'):78,('CRY','C.Doucouré'):75,
('LEI','Maddison'):82,('LEI','Tielemans'):81,('LEI','Ndidi'):80,('LEI','Vardy'):81,('LEI','Barnes'):79,('LEI','Evans'):78,
('WOL','Neves'):81,('WOL','Moutinho'):79,('WOL','Sá'):82,('WOL','Neto'):79,('WOL','Podence'):75,('WOL','Jiménez'):76,('WOL','Semedo'):77,('WOL','Kilman'):74,
('WOL','Gibbs-White'):75,('EVE','A.Doucouré'):78,('NFO','Johnson'):74,('NFO','Henderson'):77,('NFO','Awoniyi'):74,('NFO','Lingard'):76,
('LEE','Adams'):76,('LEE','Sinisterra'):76,('LEE','Roca'):74,('LEE','Aaronson'):75,('LEE','Meslier'):78,('LEE','Bamford'):75,('LEE','Rodrigo'):76,('LEE','Koch'):75,('LEE','Harrison'):76,
('EXT','Casemiro'):89,('EXT','Enzo'):79,('EXT','Antony'):81,('EXT','Gakpo'):82,('EXT','Isak'):80,('EXT','Paquetá'):82,('EXT','Mudryk'):76,('EXT','João Félix'):84,('EXT','Aubameyang'):84,('EXT','Akanji'):82,('EXT','Arthur'):79,('EXT','Zakaria'):79,('EXT','Navas'):85,('EXT','Pedro Porro'):80,('EXT','Matheus'):80,('EXT','Badiashile'):79,('EXT','Danjuma'):79,('EXT','Onana'):74,('EXT','Gnonto'):68,('EXT','Madueke'):76,('EXT','Sabitzer'):80,('EXT','McKennie'):78,('EXT','Gueye'):79,('EXT','Lukic'):77,('EXT','Freuler'):80,('EXT','Estupiñán'):77,('EXT','Senesi'):76,('EXT','Kehrer'):78,('EXT','Renan Lodi'):78,('EXT','Cunha'):77,('EXT','Rutter'):74,('EXT','Schade'):73,('EXT','Kristiansen'):70,('EXT','Perrone'):66,('EXT','Andrey Santos'):68,('EXT','Buonanotte'):66,('EXT','Kuol'):60,('EXT','Wöber'):75,('EXT','Álex Moreno'):78,('EXT','Lemina'):76,('EXT','João Gomes'):74,('EXT','Diego Costa'):74,('EXT','Weghorst'):75,('EXT','Sarabia'):78,('EXT','Guedes'):78,('EXT','Kalajdžić'):76,('EXT','Damsgaard'):74}
adjusted=0
for (c,n),v in ADJ.items():
    m=(g.clubS==c)&(g.web_name==n)
    if m.sum()==1: g.loc[m,'rating']=v; g.loc[m,'scout']=1; adjusted+=1
    elif m.sum()==0: print('ADJ miss',c,n)
print('scout adjustments',adjusted)
# Bellingham (outside PL, Mayan's #1 target) - DOB per Transfermarkt/BVB: 29/06/2003
def h(s,a,b):  # deterministic pseudo-random in [a,b]
    x=int(hashlib.md5(s.encode()).hexdigest()[:8],16)/0xffffffff; return a+(b-a)*x
rows=[]
for r in g.itertuples():
    age=r.age if not pd.isna(r.age) else 25
    rat=int(r.rating)
    if age<=19: pot=rat+h(r.web_name,10,20)
    elif age<=21: pot=rat+h(r.web_name,5,13)
    elif age<=23: pot=rat+h(r.web_name,2,8)
    elif age<=26: pot=rat+h(r.web_name,0,3)
    else: pot=rat
    rows.append(dict(id=int(r.element),n=r.web_name,fn=r.full,c=r.clubS,p=r.tpos,g=G[r.tpos] if r.element_type!=1 else 'GK',dob=r.dob if isinstance(r.dob,str) else None,
      r=rat,pot=int(min(94,round(pot))),num=None if pd.isna(r.num) else int(r.num),
      price=float(r.price),src='FPL'+('+TM' if isinstance(r.dob,str) else ''),
      fr=None if pd.isna(r.extFrom) else r.extFrom, rt=None if pd.isna(r.realTo) else r.realTo, rw=None if pd.isna(r.realWin) else r.realWin,
      s21=dict(m=None if pd.isna(r.m21) else int(r.m21),g=None if pd.isna(r.g21) else int(r.g21),a=None if pd.isna(r.a21) else int(r.a21))))
POT_FIX={'Saka':89,'Foden':91,'Martinelli':86,'Elliott':86,'Bajcetic':82,'Garnacho':86,'Saliba':87,'Colwill':84,'Enciso':82,'Ferguson':85,'Lavia':84,'Gnonto':80,'Haaland':93,'Caicedo':86,'Enzo':88,'Mudryk':84,'Olise':86,'Palmer':86,'Mainoo':85,'Nwaneri':84,'Lewis':84,'Carvalho':80,'Doak':80,'Álvarez':86,'Darwin':86,'Isak':85,'Gakpo':85,'Antony':84,'Gordon':82,'Johnson':82,'Ødegaard':88}
for x in rows:
    if x['n'] in POT_FIX: x['pot']=max(x['r'],POT_FIX[x['n']])
rows.append(dict(id=900001,n='Bellingham',fn='Jude Bellingham',c='EXT',p='CM',g='MID',dob='2003-06-29',r=84,pot=91,num=None,price=None,src='Manual (TM DOB)',fr='Borussia Dortmund',rt=None,rw=None,s21=dict(m=None,g=None,a=None)))
# academy kids from TM not in FPL (age<=20 on 1 Aug 2022), shows real youth names
fplnames=set(x['fn'] for x in rows)
nid=910000
for j,t in enumerate(tm):
    if j in used: continue
    age=(pd.Timestamp('2022-08-05')-pd.Timestamp(t['dob'])).days/365.25 if t['dob'][:4].isdigit() else 99
    if age>20.5: continue
    nid+=1; r=int(round(h(t['name'],50,60)+ (age-16)*0.8)); 
    rows.append(dict(id=nid,n=t['name'].split(' ')[-1] if len(t['name'].split())>1 else t['name'],fn=t['name'],c=t['club'],p=t['pos'],g=G[t['pos']],dob=t['dob'],r=r,pot=int(round(min(88,r+h(t['name']+'p',10,24)))),num=None if t['num']=='-' else int(t['num']),price=None,src='TM academy',fr=None,rt=None,rw=None,s21=dict(m=None,g=None,a=None),acad=1))
print('players',len(rows),'academy added',nid-910000)
json.dump(rows,open('players.json','w'),ensure_ascii=False)
# fixtures + real results
fx=pd.read_csv(f'{D}/2022-23/fixtures.csv')
F=[dict(gw=int(r.event),d=r.kickoff_time[:10],h=TID[r.team_h],a=TID[r.team_a],rh=int(r.team_h_score),ra=int(r.team_a_score)) for r in fx.itertuples()]
F.sort(key=lambda x:(x['d'],x['gw']))
json.dump(F,open('fixtures.json','w'))
# real final table
T={}
for f in F:
    for c in (f['h'],f['a']): T.setdefault(c,[0,0,0])
    T[f['h']][1]+=f['rh']-f['ra']; T[f['a']][1]+=f['ra']-f['rh']; T[f['h']][2]+=f['rh']; T[f['a']][2]+=f['ra']
    if f['rh']>f['ra']: T[f['h']][0]+=3
    elif f['rh']<f['ra']: T[f['a']][0]+=3
    else: T[f['h']][0]+=1; T[f['a']][0]+=1
real=sorted(T,key=lambda c:(-T[c][0],-T[c][1],-T[c][2]))
print('real table:',[(c,T[c][0]) for c in real])
json.dump(real,open('real_table.json','w'))
from collections import Counter
print(Counter(x['c'] for x in rows))
