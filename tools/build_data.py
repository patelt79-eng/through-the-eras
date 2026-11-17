import pandas as pd, unicodedata, re, json, math
D='/home/claude/src/fpl/data'
def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z ]',' ',s.replace('-',' ')).split()
teams=pd.read_csv(f'{D}/2022-23/teams.csv')
pr=pd.read_csv(f'{D}/2022-23/players_raw.csv')
gw=pd.read_csv(f'{D}/2022-23/gws/merged_gw.csv')
p21=pd.read_csv(f'{D}/2021-22/players_raw.csv')
TEAMSHORT=dict(zip(teams.name,teams.short_name))
# opening-day club and start price
first=gw.sort_values(['GW']).groupby('element').first().reset_index()
first=first.rename(columns={'team':'club','value':'start_value','GW':'firstGW'})
df=first[['element','club','start_value','firstGW']].merge(pr,left_on='element',right_on='id')
df['full']=df.first_name+' '+df.second_name
# 21/22 stats by code
s21=p21.set_index('code')[['minutes','total_points','goals_scored','assists','clean_sheets','now_cost','team']]
s21.columns=['m21','pts21','g21','a21','cs21','cost21','team21']
df=df.join(s21,on='code')
# DOB: FPL later seasons
dob={}
for s in ['2024-25','2025-26']:
    d=pd.read_csv(f'{D}/{s}/players_raw.csv',usecols=['code','birth_date'])
    for c,b in zip(d.code,d.birth_date):
        if isinstance(b,str): dob[c]=b
df['dob']=df.code.map(dob); df['dob_src']=df.dob.notna().map({True:'FPL',False:''})
# TM
tm=[l.split('|') for l in open('/home/claude/src/tm_2022.txt').read().strip().split('\n')]
tm=[dict(club=a,num=b,name=c,dob='-'.join(reversed(d.split('/')))) for a,b,c,d in tm]
def score(fpl_tokens, tmname):
    global webtok
    t=norm(tmname)
    if not t: return 0
    hit=sum(1 for x in t if x in fpl_tokens)
    if len(t)==1 and hit==1 and t[0] not in webtok: return 0
    return hit/len(t)+0.01*hit
nums={};tmdob={}
for i,r in df.iterrows():
    toks=set(norm(r.full)+norm(r.web_name)); webtok=set(norm(r.web_name))
    club=TEAMSHORT[r.club]
    best=None;bs=0
    for t in tm:
        sc=score(toks,t['name']); 
        if sc<0.6: continue
        sc+= (0.4 if t['club']==club else 0)
        if sc>bs: bs,best=sc,t
    if best and bs>=1.0:
        df.loc[i,'tm_club']=best['club']
        tmdob[i]=best['dob']
        if best['club']==club and best['num']!='-': nums[i]=int(best['num'])
df['tm_dob']=pd.Series(tmdob); df['shirt']=pd.Series(nums)
# cross-check
both=df[df.dob.notna()&df.tm_dob.notna()]
mism=both[both.dob!=both.tm_dob]
print('cross-checked',len(both),'mismatch',len(mism)); print(mism[['web_name','dob','tm_dob']].head(20).to_string())
df.loc[df.dob.isna()&df.tm_dob.notna(),'dob_src']='Transfermarkt'
df['dob']=df.dob.fillna(df.tm_dob)
print('dob coverage',df.dob.notna().sum(),'/',len(df))
miss=df[df.dob.isna()]
print('missing among >300 mins or price>=5:',miss[(miss.minutes>300)|(miss.start_value>=50)][['web_name','club','minutes','start_value']].to_string())
df.to_pickle('/home/claude/game/stage1.pkl')
