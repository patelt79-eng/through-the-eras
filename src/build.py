import json
P=json.load(open('data/players.json')); F=json.load(open('data/fixtures.json')); R=json.load(open('data/real_table.json')); SEA=json.load(open('data/season.json'))
# compact player records
for p in P:
    p.pop('price',None)
data=json.dumps({'players':P,'fixtures':F,'real':R,'season':SEA},ensure_ascii=False,separators=(',',':'))
t=open('src/template.html').read()
t=t.replace('__DATA__',data.replace('</','<\\/')).replace('__ENGINE__',open('src/engine.js').read()).replace('__UI__',open('src/ui.js').read())
open('index.html','w').write('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n'+t+'\n</body>\n</html>\n')
print(len(t)//1024,'KB')
