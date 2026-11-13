const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({headless:true});
 const page = await browser.newPage({viewport:{width:1440,height:1080}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base = process.env.TEST_URL || 'http://127.0.0.1:3000/';
 await page.goto(base);
 await page.getByRole('heading',{name:'Less searching. More engineering.'}).waitFor();
 await page.screenshot({path:path.join(os.tmpdir(),'storage-hub-desktop.png'),fullPage:true});
 // Global search opens from either platform shortcut and targets the matching command.
 await page.keyboard.press('Control+k');
 await page.locator('#global-search').fill('flogi');
 await page.locator('#search-results a').first().click();
 await page.locator('#command-cs-flogi').waitFor();
 assert.equal(await page.locator('#search-dialog').evaluate(e=>e.open),false);
 await page.goto(base+'#commands/netapp');
 await page.locator('[data-command=nt-vol]').fill('svm_<script>alert(1)</script>');
 assert.match(await page.locator('#command-nt-vol pre').textContent(),/svm_<script>/);
 assert.equal(await page.locator('#command-nt-vol script').count(),0);
 await page.locator('[data-action=favorite][data-id=nt-vol]').click();
 await page.reload();
 assert.equal(await page.locator('[data-command=nt-vol]').inputValue(),'svm_<script>alert(1)</script>');
 await page.locator('#saved-only').check();assert.equal(await page.locator('.command').count(),1);
 // Independent fabrics and actual multi-target behavior, including download.
 await page.goto(base+'#zoning');
 await page.locator('[name=aTargets]').fill('5000000000000001\n5000000000000003');
 await page.getByRole('button',{name:'Generate change plan'}).click();
 assert.equal(await page.locator('#zoning-output .tag').first().textContent(),'2 ZONES');
 assert.match(await page.locator('#zoning-output pre').first().textContent(),/vsan 10/);
 const ticketPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download ticket'}).click();
 const ticket=await ticketPromise;assert.equal(ticket.suggestedFilename(),'zoning-app01.txt');
 await page.locator('[name=mode]').selectOption('simt');
 assert.equal(await page.locator('#zoning-output').textContent(),'');
 await page.getByRole('button',{name:'Generate change plan'}).click();assert.equal(await page.locator('#zoning-output .tag').first().textContent(),'1 ZONE');
 await page.locator('[name=vendor]').selectOption('brocade');
 await page.getByRole('button',{name:'Generate change plan'}).click();assert.match(await page.locator('#zoning-output pre').nth(1).textContent(),/cfgRemove/);
 await page.locator('[name=bHost]').fill('2100000000000001');await page.getByRole('button',{name:'Generate change plan'}).click();
 assert.match(await page.locator('#zoning-error').textContent(),/unique/);assert.equal(await page.locator('#zoning-output').textContent(),'');
 // Sizing calculations and malformed WWPN rejection.
 await page.goto(base+'#calculators');
 await page.getByRole('button',{name:'Calculate capacity'}).click();assert.match(await page.locator('#raid-result').textContent(),/24 TB usable/);
 await page.getByRole('button',{name:'Calculate throughput'}).click();assert.match(await page.locator('#throughput-result').textContent(),/78.125 MiB/);
 await page.getByRole('button',{name:'Estimate transfer time'}).click();assert.match(await page.locator('#transfer-result').textContent(),/3.175 hours/);
 await page.locator('[name=wwn]').fill('z2100000000000001');await page.getByRole('button',{name:'Format WWPN'}).click();assert.match(await page.locator('#wwn-result').textContent(),/exactly 16/);
 // Checklists, notes and upgrade metadata persist after reload.
 await page.goto(base+'#incidents/paths');await page.locator('[data-check=paths]').first().check();await page.locator('#incident-notes').fill('Evidence recorded at 13:00 UTC');await page.reload();
 assert.equal(await page.locator('[data-check=paths]').first().isChecked(),true);assert.equal(await page.locator('#incident-notes').inputValue(),'Evidence recorded at 13:00 UTC');
 const handoffPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Export incident handoff'}).click();await handoffPromise;
 await page.goto(base+'#upgrades/cisco');await page.locator('[name=target]').fill('Approved target');await page.locator('[data-check=upgrade-cisco]').first().check();await page.reload();assert.equal(await page.locator('[name=target]').inputValue(),'Approved target');
 await page.goto(base+'#translator/connectivity');await page.locator('[name=sid]').fill('12345');assert.match(await page.locator('[data-translation=powermax] pre').textContent(),/12345/);
 await page.goto(base+'#automation');const codePromise=page.waitForEvent('download');await page.getByRole('button',{name:'Download example'}).click();assert.equal((await codePromise).suggestedFilename(),'ontap-rest.py');
 // Prompt composer consumes custom input, and invalidates output after editing.
 await page.goto(base+'#prompts');await page.locator('[name=platform]').fill('Brocade');await page.locator('[name=objective]').fill('Investigate latency');await page.locator('[name=evidence]').fill('Sample A counters at 13:00 UTC');await page.getByRole('button',{name:'Compose prompt'}).click();assert.match(await page.locator('#prompt-output pre').textContent(),/Sample A counters at 13:00 UTC/);
 await page.locator('[name=evidence]').fill('Changed observation');assert.equal(await page.locator('#prompt-output pre').count(),0);
 // Theme and narrow layouts.
 await page.locator('#theme').click();await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.locator('#theme').click();
 for(const width of [390,768,1440]){
   await page.setViewportSize({width,height:900});
   for(const route of ['home','commands','zoning','calculators','incidents','upgrades','automation','translator','prompts','about']){
     await page.goto(base+'#'+route);
     assert.ok(await page.locator('h1').isVisible(),`${route}: heading at ${width}`);
     const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
     assert.equal(overflow,false,`${route}: horizontal overflow at ${width}`);
   }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'#home');await page.locator('#menu').click();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'true');await page.locator('#navigation a[href="#zoning"]').click();await page.waitForFunction(()=>document.querySelector('#menu').getAttribute('aria-expanded')==='false');assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'false');await page.goto(base+'#home');await page.waitForFunction(()=>document.querySelector('#sidebar').getBoundingClientRect().right<=0);
 await page.screenshot({path:path.join(os.tmpdir(),'storage-hub-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 await browser.close();console.log('Browser checks passed: search, injection escaping, saved parameters, favorites, zoning validation and downloads, calculators, checklists, upgrades, translation, automation, prompt composition, themes, and 30 responsive route checks.');
})().catch(e=>{console.error(e);process.exit(1);});
