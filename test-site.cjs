const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const server=require('node:http').createServer((req,res)=>{let file='site'+decodeURIComponent(req.url.split('?')[0]);if(file.endsWith('/'))file+='index.html';if(req.url==='/preview.html')file='Sham-Aqar-Research-Preview.html';try{const ext=require('node:path').extname(file);res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json'})[ext]||'text/plain');res.end(fs.readFileSync(file));}catch{res.statusCode=404;res.end('Not found');}});await new Promise(r=>server.listen(8765,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const paths=['','reports/','reports/damascus/','reports/rural-damascus/','reports/latakia/','tools/yield/','tools/sqm/','tools/rent-buy/','compare/','methodology/','about/','privacy/','best-real-estate-platforms-syria/','sitemap/'];
 for(const lang of ['','en/'])for(const route of paths){
  const res=await page.goto('http://127.0.0.1:8765/'+lang+route,{waitUntil:'domcontentloaded'});
  assert.equal(res.status(),200,lang+route);assert.equal(await page.locator('h1').count(),1);
  assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),'https://mangowc.vercel.app/'+lang+route);
  await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.forEach(n=>JSON.parse(n.textContent)));
  assert.equal(await page.locator('link[hreflang]').count(),3);
  const links=await page.locator('a[href^="/"]').evaluateAll(ns=>ns.map(n=>n.getAttribute('href')));
  for(const link of links){const p='site'+link.split('#')[0].split('?')[0];assert.ok(fs.existsSync(p),`Missing internal target ${p}`);}
 }
 await page.goto('http://127.0.0.1:8765/en/tools/yield/');
 assert.equal(await page.locator('#primary').textContent(),'4.1%');
 await page.locator('#vacancy').fill('12');assert.equal(await page.locator('#payback').textContent(),'Not applicable');
 await page.locator('#price').fill('');assert.notEqual(await page.locator('#calc-error').textContent(),'');
 await page.goto('http://127.0.0.1:8765/en/tools/sqm/');assert.equal(await page.locator('#primary').textContent(),'$833');
 await page.goto('http://127.0.0.1:8765/en/tools/rent-buy/');assert.equal(await page.locator('#primary').textContent(),'$30,000');assert.equal(await page.locator('#buy').textContent(),'$110,000');
 await page.goto('http://127.0.0.1:8765/en/compare/');await page.selectOption('#city-a','latakia');assert.equal(await page.locator('#city-price-a').textContent(),'$325');
 fs.mkdirSync('qa',{recursive:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  for(const route of ['','en/','tools/yield/','reports/damascus/','compare/','best-real-estate-platforms-syria/','en/best-real-estate-platforms-syria/','sitemap/']){
   await page.goto('http://127.0.0.1:8765/'+route,{waitUntil:'networkidle'});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),`Overflow: ${width} ${route}`);
  }
  await page.goto('http://127.0.0.1:8765/',{waitUntil:'networkidle'});
  await page.screenshot({path:`qa/home-${width}.png`,fullPage:true});
 }
 await page.goto('http://127.0.0.1:8765/best-real-estate-platforms-syria/');assert.equal(await page.locator('.platform-item').count(),20);
 await page.goto('http://127.0.0.1:8765/preview.html'); const frame=page.frameLocator('#preview'); await frame.locator('h1').waitFor(); await frame.locator('.hero .actions a').first().click(); await frame.locator('.page-hero h1').waitFor(); await page.goto('http://127.0.0.1:8765/preview.html#/en/tools/yield/'); await frame.locator('#primary').waitFor(); await frame.locator('#primary').filter({hasText:'4.1%'}).waitFor(); assert.equal(await frame.locator('#primary').textContent(),'4.1%'); assert.deepEqual(errors,[]);await browser.close();server.close();console.log('Browser checks passed: 28 routes, links, metadata, structured data, interactive calculators and mobile overflow.');
})().catch(e=>{console.error(e);process.exit(1)});
