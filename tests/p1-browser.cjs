const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{const browser=await chromium.launch();try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
const base=process.env.TEST_URL||'http://127.0.0.1:3000/';
await page.goto(base+'#commands/netapp');await page.locator('#command-release').fill('9.17.1');
assert.match(await page.locator('#command-nt-health').textContent(),/Unverified for selected release: 9.17.1/);
await page.locator('#command-nt-health summary').click();assert.match(await page.locator('#command-nt-health').textContent(),/None recorded/);
await page.locator('#command-release').fill('<img src=x onerror=alert(1)>');assert.equal(await page.locator('.command-metadata img').count(),0);
await page.goto(base+'#pure/cli');await page.locator('#pure-target-release').fill('6.8.0');assert.match(await page.locator('.command-metadata').first().textContent(),/Unverified for selected release: 6.8.0/);
await page.goto(base+'#hpe/commands');await page.locator('#hpe-target-release').fill('5.3');assert.match(await page.locator('.command-metadata').first().textContent(),/Unverified for selected release: 5.3/);
await page.goto(base+'#calculators');await page.locator('#raid-form [name=count]').fill('9');await page.locator('#raid-form [name=spares]').fill('1');await page.getByRole('button',{name:'Calculate capacity'}).click();
assert.match(await page.locator('#raid-result').textContent(),/24 TB theoretical after RAID/);assert.match(await page.locator('#raid-result').textContent(),/4.000 TB dedicated spares/);assert.match(await page.locator('#raid-result').textContent(),/8.000 TB parity/);assert.match(await page.locator('#raid-result').textContent(),/not provisionable capacity/);
for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
assert.deepEqual(errors,[]);console.log('P1 metadata, capacity and responsive checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
