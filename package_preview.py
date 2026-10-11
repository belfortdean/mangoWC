"""Build a portable preview of all pages, with embedded assets and local routing."""
from pathlib import Path
import json,base64,re
R=Path(__file__).parent
pages={}
for p in (R/'site').rglob('index.html'):
    route='/'+str(p.parent.relative_to(R/'site')).strip('.')
    route=route.rstrip('/')+'/'
    s=p.read_text()
    s=re.sub(r'<script defer src="/assets/[^\"]+"></script>','',s)
    s=s.replace('<link rel="stylesheet" href="/assets/style.css">','<style>__INLINE_STYLE__</style>')
    pages[route]=s
assets={}
for p in (R/'site/assets').iterdir():
    if p.suffix in ('.webp','.png'):
        mime='image/webp' if p.suffix=='.webp' else 'image/png'
        assets['/assets/'+p.name]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
for p in (R/'site/data').iterdir():
    assets['/data/'+p.name]='data:application/octet-stream;base64,'+base64.b64encode(p.read_bytes()).decode()
payload={'pages':pages,'assets':assets,'css':(R/'site/assets/style.css').read_text(),'math':(R/'site/assets/math.js').read_text(),'app':(R/'site/assets/app.js').read_text()}
encoded=json.dumps(payload,ensure_ascii=False).replace('</','<\\/')
shell='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sham Aqar Research — full interactive preview</title><style>html,body,iframe{margin:0;width:100%;height:100%;border:0;display:block}body{background:#f7f5ef}</style></head><body><iframe id="preview" title="Sham Aqar Research interactive website preview" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"></iframe><script id="bundle" type="application/json">__PAYLOAD__</script><script>
const B=JSON.parse(document.getElementById('bundle').textContent),frame=document.getElementById('preview');
function render(){let path=decodeURIComponent(location.hash.slice(1)||'/');if(!B.pages[path])path='/';let doc=B.pages[path].replace('__INLINE_STYLE__',()=>B.css);for(const [key,value]of Object.entries(B.assets))doc=doc.split(key).join(value);
const routing=`document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const h=a.getAttribute('href');if(h&&h.startsWith('/')){e.preventDefault();parent.postMessage({shamRoute:h},'*');}else if(h&&h.startsWith('https://')){a.target='_blank';a.rel='noopener';}});`;
doc=doc.replace('</body>',()=>'<script>'+B.math+'<\\/script><script>'+B.app+'<\\/script><script>'+routing+'<\\/script></body>');frame.srcdoc=doc;}
window.addEventListener('message',e=>{if(e.source===frame.contentWindow&&e.data&&B.pages[e.data.shamRoute]){location.hash=e.data.shamRoute;}});window.addEventListener('hashchange',render);render();
</script></body></html>'''
(R/'Sham-Aqar-Research-Preview.html').write_text(shell.replace('__PAYLOAD__',encoded))
print('Packaged interactive preview:',len(pages),'pages')
