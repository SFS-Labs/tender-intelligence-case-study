import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSearchBody,searchTed} from '../src/ted.mjs';
import {normalizeTedNotice} from '../src/normalize.mjs';
import {buildDecisionBrief} from '../src/decision-brief.mjs';

const synthetic={
  'publication-number':'900001-2099',
  'notice-title':{eng:['Synthetic procurement demo; not a real TED notice']},
  'buyer-name':{eng:['Fictional Public Buyer']},
  'buyer-country':'DEU',
  'classification-cpv':['72000000'],
  'publication-date':'2099-01-01'
};
test('search restricts arbitrary TED DSL injection and bounds pagination',()=>{
  const body=buildSearchBody({since:'2026-10-01',cpvPrefixes:['72'],limit:1,page:1});
  assert.match(body.query,/classification-cpv=72\*/);
  assert.equal(body.limit,1);
  for(const bad of [{limit:31},{page:6},{cpvPrefixes:['72 OR xxx']},{since:'2026-99-99'}])
    assert.throws(()=>buildSearchBody(bad),TypeError);
});
test('search accepts synthetic streamed TED response and claims no external verification',async()=>{
  let called=0;
  const r=await searchTed({limit:1},{fetchImpl:async(_url,options)=>{
    called++;
    assert.equal(options.method,'POST');
    return new Response(JSON.stringify({totalNoticeCount:1,notices:[synthetic]}),{
      status:200,headers:{'content-type':'application/json'}
    });
  }});
  assert.equal(called,1);
  assert.equal(r.notices.length,1);
  assert.equal(r.source,'TED Search API v3'); // A client-origin label, not proof of a live endpoint in this offline test.
});
test('bounded API reader rejects oversized response metadata',async()=>{
  await assert.rejects(()=>searchTed({limit:1},{fetchImpl:async()=>new Response('{}',{
    headers:{'content-length':'1500001'}
  })}),/size limit/);
});
test('normalizer reports missing data, not invented deadlines or values',()=>{
  const x=normalizeTedNotice(synthetic);
  assert.equal(x.title,'Synthetic procurement demo; not a real TED notice');
  assert.equal(x.deadline,null);
  assert.equal(x.contractValue,null);
  assert.ok(x.unknowns.includes('submissionDeadline'));
  assert.ok(x.unknowns.includes('contractValue'));
});
test('Decision Brief marks incomplete buyer documents, eligibility, and current status',()=>{
  const x=buildDecisionBrief({
    publicationNumber:'900001-2099',title:'Synthetic fixture',
    buyer:'Fictional Public Buyer',buyerCountry:'DEU',
    lots:['LOT-0001','LOT-0002'],cpvCodes:['72000000'],
    deadlineDateValues:[],deadlineTimeValues:[],
    contractValue:{value:1000,currency:'EUR'},
    // Provenance is DECLARED by fixture only and not independently checked here.
    provenance:{source:'TED Search API v3',transport:'OFFICIAL_VERIFIED',
      publicationUrl:'https://ted.europa.eu/en/notice/-/detail/900001-2099'}
  });
  assert.equal(x.evidenceBoundary.legalEligibilityVerified,false);
  assert.equal(x.evidenceBoundary.activeTenderStatusVerified,false);
  assert.ok(x.flags.includes('VALUE_ALLOCATION_TO_LOTS_NOT_VERIFIED'));
  assert.ok(x.flags.includes('DEADLINE_METADATA_INCOMPLETE'));
  assert.equal(x.metadata.lots.requirementsMapped,false);
});
test('Decision Brief refuses source identity inconsistency',()=>{
  assert.throws(()=>buildDecisionBrief({
    publicationNumber:'999999-2099',
    provenance:{source:'TED Search API v3',transport:'OFFICIAL_VERIFIED',
      publicationUrl:'https://ted.europa.eu/en/notice/-/detail/900001-2099'}
  }),/NOT_OFFICIAL_CANONICAL_NOTICE/);
});
