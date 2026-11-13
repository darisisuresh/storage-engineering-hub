import test from 'node:test';
import assert from 'node:assert/strict';
import {EVOLUTION_EVENTS,EVOLUTION_SOURCES,EVOLUTION_VENDORS,EVOLUTION_REVIEWED} from '../evolution-data.js';
import {filterEvolution,evolutionYears,formatEvolutionDate,parseEvolutionRoute,evolutionRoute,evolutionCSV,normalizeEvolutionFilters} from '../evolution-core.js';
test('research entries have unique identities, explicit date meanings and primary evidence',()=>{
 assert.ok(EVOLUTION_EVENTS.length>=60);assert.equal(new Set(EVOLUTION_EVENTS.map(e=>e.id)).size,EVOLUTION_EVENTS.length);
 for(const vendor of Object.keys(EVOLUTION_VENDORS))assert.ok(EVOLUTION_EVENTS.filter(e=>e.vendor===vendor).length>=5);
 const primary=['dell.com','delltechnologies.com','netapp.com','purestorage.com','everpuredata.com','hpe.com','hp.com','sec.gov','prnewswire.com','globenewswire.com'];
 for(const e of EVOLUTION_EVENTS){assert.ok(e.models.length&&e.sources.length&&e.dateKind&&e.scope&&e.availability);assert.match(e.date,/^\d{4}(-\d{2})?(-\d{2})?$/);assert.equal(e.year,Number(e.date.slice(0,4)));assert.ok(e.date<=EVOLUTION_REVIEWED);for(const type of e.types)assert.ok(['NAS','SAN'].includes(type));for(const key of e.sources){const source=EVOLUTION_SOURCES[key];assert.ok(source?.title&&source.publisher,key);const u=new URL(source.url);assert.equal(u.protocol,'https:');assert.ok(primary.some(d=>u.hostname===d||u.hostname.endsWith('.'+d)),u.href);}}
});
test('year, vendor, protocol and all-word model filters compose without backdating capabilities',()=>{
 assert.equal(filterEvolution({vendor:'netapp',q:'AFF A900'}).length,1);assert.equal(filterEvolution({vendor:'dell',type:'NAS',q:'PowerScale',from:2020,to:2020}).length,1);
 assert.equal(filterEvolution({type:'NAS',q:'FlashArray//X',from:2017,to:2017}).length,0);assert.equal(filterEvolution({type:'SAN',q:'FlashBlade'}).length,0);assert.equal(filterEvolution({type:'NAS',q:'ASA A70'}).length,0);
 assert.ok(filterEvolution({type:'unified'}).every(e=>e.types.includes('NAS')&&e.types.includes('SAN')));assert.equal(filterEvolution({from:2025,to:2024}).length,0);assert.equal(filterEvolution({q:'no-such-array'}).length,0);
});
test('comparison retains empty years as catalog gaps and ordering is stable',()=>{
 const years=evolutionYears({vendor:'pure',from:2010,to:2012,sort:'oldest'});assert.deepEqual(years.map(x=>x.year),[2010,2011,2012]);assert.equal(years[0].events.length,0);assert.ok(years[2].events.length>0);
 const rows=filterEvolution({sort:'oldest'});assert.equal(rows[0].id,'nt-f330');assert.equal(filterEvolution()[0].id,'nt-afx2k');
});
test('deep links preserve filters, reject unsafe enum values and survive malformed encoding',()=>{
 const filters=normalizeEvolutionFilters({vendor:'hpe',type:'SAN',q:'AF20 / <script>',from:2018,to:2021,sort:'oldest',view:'matrix'});assert.deepEqual(parseEvolutionRoute(evolutionRoute(filters).split('/')[1]),filters);
 assert.equal(parseEvolutionRoute('%ZZ').vendor,'all');assert.equal(normalizeEvolutionFilters({vendor:'__proto__',view:'<script>',from:'2024x'}).vendor,'all');assert.equal(normalizeEvolutionFilters({q:'x'.repeat(500)}).q.length,160);
});
test('display dates retain original precision and CSV exports filtered dates, scope and source URLs',()=>{
 assert.equal(formatEvolutionDate('2010'),'2010');assert.equal(formatEvolutionDate('2012-05'),'May 2012');assert.equal(formatEvolutionDate('2024-05-14'),'May 14, 2024');
 const csv=evolutionCSV({q:'AFF A900',vendor:'netapp'});assert.equal(csv.split('\r\n').length,3);assert.match(csv,/"2021-12-14"/);assert.match(csv,/news-rel-20211214-493286/);assert.match(csv,/Availability evidence/);assert.doesNotMatch(csv,/AFF A250/);
 const blade=EVOLUTION_EVENTS.find(e=>e.id==='pu-blade');assert.equal(blade.date,'2016-03-14');assert.match(blade.availability,/2017-03-01/);
});
