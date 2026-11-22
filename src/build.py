# Builds index.html from the template, engine and UI.
# Season data is NOT inlined: it stays in data/<season>/ and the game fetches it when an era is picked.
# BUILD is a hash of the sources and data, appended to data URLs so browsers don't use stale copies.
import hashlib, glob
files = ['src/template.html', 'src/engine.js', 'src/ui.js'] + sorted(glob.glob('data/**/*.json', recursive=True))
h = hashlib.sha1()
for f in files: h.update(open(f, 'rb').read())
build = h.hexdigest()[:10]
t = open('src/template.html').read()
t = t.replace('__ENGINE__', open('src/engine.js').read()).replace('__UI__', open('src/ui.js').read().replace('__BUILD__', build))
open('index.html', 'w').write('<!doctype html>\n<html lang="en-GB">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n' + t + '\n</body>\n</html>\n')
print(len(t)//1024, 'KB, build', build)
