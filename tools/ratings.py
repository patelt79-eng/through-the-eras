import pandas as pd, numpy as np
D='/home/claude/src/fpl/data'
df=pd.read_pickle('stage1.pkl')
teams=pd.read_csv(f'{D}/2022-23/teams.csv'); SHORT=dict(zip(teams.name,teams.short_name)); STR=dict(zip(teams.name,teams.strength))
p21=pd.read_csv(f'{D}/2021-22/players_raw.csv'); t21=pd.read_csv(f'{D}/2021-22/teams.csv')
STR21=dict(zip(t21.id,t21.strength))
b21=p21.set_index('code')['bps']; df['bps21']=df.code.map(b21)
df['clubS']=df.club.map(SHORT)
# opening-day membership
open_day=(df.firstGW==1)&~((df.minutes==0)&(df.tm_club.fillna('')!=df.clubS))
df['openday']=open_day
df['price']=df.start_value/10
df['age']=((pd.Timestamp('2022-08-05')-pd.to_datetime(df.dob)).dt.days/365.25).round(1)
pos=df.element_type
df['pricePct']=df.groupby('element_type').price.rank(pct=True)
# price -> rating curve per position (anchor: min price ~ low, top price high)
def priceScore(r):
    p=r.price; t=r.element_type
    lo={1:4.0,2:4.0,3:4.5,4:4.5}[t]; hi={1:5.5,2:7.5,3:13.0,4:12.5}[t]
    x=min(1,max(0,(p-lo)/(hi-lo)))
    return x**0.75
df['ps']=df.apply(priceScore,axis=1)
df['minShare']=(df.m21.fillna(0)/3420).clip(0,1)
df['t21str']=df.team21.map(STR21)
per90=df.bps21/(df.m21/90)
df['bps90']=np.where(df.m21>=900,per90,np.nan)
df['perfZ']=df.groupby('element_type').bps90.transform(lambda s:(s-s.mean())/s.std()).fillna(0).clip(-2,2.5)
ts=df.club.map(STR)
r=61+21*df.ps+9*df.minShare*((df.t21str.fillna(3)-1)/4)**0.7+1.5*(ts-3)+2.6*df.perfZ+np.where(df.element_type==1,2,0)
# new arrivals with no PL history: trust price + club more
nohist=df.m21.isna()
r=np.where(nohist,63+22*df.ps+2.5*(ts-3),r)
df['rating']=np.clip(np.round(r),45,93).astype(int)
df.to_pickle('stage2.pkl')
o=df[df.openday]
for t,n in [(1,'GK'),(2,'DEF'),(3,'MID'),(4,'FWD')]:
    x=o[o.element_type==t].sort_values('rating',ascending=False)
    print(n,', '.join(f"{a}({b},{c})" for a,b,c in zip(x.web_name,x.clubS,x.rating) ) [:900]); print()
print(o.groupby('clubS').rating.apply(lambda s: round(s.nlargest(14).mean(),1)).sort_values(ascending=False).to_string())
print(o.groupby('clubS').size().to_string())
