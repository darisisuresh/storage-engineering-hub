const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const path=require('node:path');
const os=require('node:os');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const routes=['home','evolution','popular','pure/overview','hpe/overview','commands/netapp','zoning','translator','calculators','performance','incidents','upgrades','automation','prompts','about','pure/cli','pure/questions','pure/builders/host','popular/cisco-questions','hpe/commands'];
(async()=>{const browser=await chromium.launch();try{
 const base=process.env.TEST_URL||'http://127.0.0.1:3000/';
 // Isolated audit context allows local axe injection only; production CSP is unchanged.
 const page=await browser.newPage({bypassCSP:true,reducedMotion:'reduce',viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const violations=[];
 for(const theme of ['light','dark'])for(const route of routes){
  await page.goto(base+'#'+route);await page.locator('h1').waitFor();await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  if(route==='performance'){await page.locator('#perf-demo').click();await page.locator('.perf-chart').first().waitFor();}
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const results=await page.evaluate(async()=>{const result=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));});
  if(results.length)violations.push({route,theme,results});
 }
 await fs.writeFile(path.join(os.tmpdir(),'website-accessibility.json'),JSON.stringify({states:40,violations},null,2));assert.deepEqual(violations,[],'Automated accessibility violations; see website-accessibility.json');
 // A skip link must preserve the active tool, data and URL and move focus into main.
 await page.goto(base+'#performance');await page.locator('#perf-demo').click();await page.locator('.skip').focus();await page.keyboard.press('Enter');assert.equal(new URL(page.url()).hash,'#performance');assert.equal(await page.evaluate(()=>document.activeElement.id),'main');assert.equal(await page.locator('.perf-chart').count(),6);
 // A broken file must show the rejection, not stay stuck in a validating state.
 await page.locator('#perf-file').setInputFiles({name:'malformed.csv',mimeType:'text/csv',buffer:Buffer.from('timestamp,iops\n"unterminated,2')});await page.waitForFunction(()=>document.querySelector('#perf-error').textContent.includes('unterminated'));assert.match(await page.locator('#perf-import-status').textContent(),/Import rejected/);assert.equal(await page.locator('#perf-export-report').count(),0);
 await page.locator('#perf-file').setInputFiles({name:'invalid-utf8.csv',mimeType:'text/csv',buffer:Buffer.from([0xff,0xfe,0xfd])});await page.waitForFunction(()=>document.querySelector('#perf-import-status').textContent.includes('Import rejected'));
 // A same-route search refresh explicitly discards hidden analyzer state and pending imports.
 await page.locator('#perf-demo').click();await page.locator('#search-open').click();await page.locator('#global-search').fill('csv telemetry');await page.locator('#search-results a').first().click();assert.equal(await page.locator('#perf-results').count(),0);
 await page.goto(base+'#calculators');await page.getByRole('button',{name:'Calculate throughput'}).click();await page.locator('#throughput-form [name=iops]').fill('1e308');assert.match(await page.locator('#throughput-result').textContent(),/Inputs changed/);await page.getByRole('button',{name:'Calculate throughput'}).click();assert.match(await page.locator('#throughput-result').textContent(),/numeric range/);assert.doesNotMatch(await page.locator('#throughput-result').textContent(),/Infinity/);
 await page.locator('#transfer-form [name=tb]').fill('1e308');await page.getByRole('button',{name:'Estimate transfer time'}).click();assert.match(await page.locator('#transfer-result').textContent(),/numeric range/);
 await page.getByRole('button',{name:'Calculate capacity'}).click();await page.locator('#raid-form [name=count]').fill('10');assert.match(await page.locator('#raid-result').textContent(),/Inputs changed/);assert.equal(await page.locator('#raid-result strong').count(),0);
 // Verify the long navigation and pages at narrow widths, with keyboard focus and no horizontal overflow.
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:800});for(const route of ['home','performance','about']){await page.goto(base+'#'+route);await page.locator('h1').waitFor();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}/${route}`);}}
 await page.setViewportSize({width:390,height:640});await page.goto(base+'#about');await page.waitForFunction(()=>document.querySelector('#sidebar').inert);assert.equal(await page.locator('#sidebar').evaluate(e=>e.inert),true);await page.locator('#menu').click();assert.equal(await page.locator('#sidebar').evaluate(e=>e.inert),false);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'menu');assert.equal(await page.locator('#sidebar').evaluate(e=>e.inert),true);await page.locator('#menu').click();await page.locator('#navigation a[href="#performance"]').focus();await page.keyboard.press('Enter');await page.getByRole('heading',{name:'Understand the workload.'}).waitFor();assert.equal(await page.locator('#menu').getAttribute('aria-expanded'),'false');assert.equal(await page.locator('#sidebar').evaluate(e=>e.inert),true);
 await page.locator('#perf-demo').click();await page.screenshot({path:path.join(os.tmpdir(),'website-proof-mobile.png'),fullPage:true});assert.deepEqual(errors,[]);
 console.log('Website proof checks passed: 40 automated accessibility states, skip navigation, malformed/UTF-8 files, refresh cleanup, calculator range/stale results and responsive keyboard navigation');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
