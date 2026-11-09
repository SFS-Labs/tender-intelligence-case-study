import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {summarizeBenchmark} from '../src/benchmark.mjs';
const fixture=JSON.parse(fs.readFileSync(new URL('../data/ab-aggregate.json',import.meta.url)));
test('A/B aggregate: four independent invocations in predetermined ABBA order',()=>{
  const x=summarizeBenchmark(fixture);
  assert.equal(x.modelCalls,4);
  assert.equal(x.baseline.trials,2);
  assert.equal(x.sfs.trials,2);
});
test('Both agents recover the exact same 32 factual values',()=>{
  const x=summarizeBenchmark(fixture);
  assert.equal(x.baseline.correctFacts,32);
  assert.equal(x.sfs.correctFacts,32);
});
test('SFS has no proven advantage on source-cited scores',()=>{
  const x=summarizeBenchmark(fixture);
  assert.equal(x.baseline.citationBackedCorrectFacts,26);
  assert.equal(x.sfs.citationBackedCorrectFacts,25);
  assert.ok(x.deltaSfsMinusBaselinePercentagePoints<0);
});
test('No unsafe certainty in either recorded arm',()=>{
  const x=summarizeBenchmark(fixture);
  assert.equal(x.baseline.unsafeCertaintyCount,0);
  assert.equal(x.sfs.unsafeCertaintyCount,0);
});
test('Model consumption and latency are observational, not a causal effect',()=>{
  const x=summarizeBenchmark(fixture);
  assert.equal(x.baseline.meanModelLatencyMs,15572.5);
  assert.equal(x.sfs.meanModelLatencyMs,13106.5);
  assert.equal(x.baseline.meanInputTokens,2726);
  assert.equal(x.sfs.meanInputTokens,3108);
  assert.equal(x.validatedCommercialValue,false);
});
test('Manipulated or malformed benchmark data fails closed',()=>{
  for(const m of [
    x=>{x.runs[0].expectedCitationMissing.push('openNow');},
    x=>{x.runs[0].sequence=4;},
    x=>{x.runs[2].correctFacts=20;},
    x=>{x.evaluation.questions=12;},
    x=>{x.schema='fake';}
  ]){
    const copy=structuredClone(fixture);m(copy);
    assert.throws(()=>summarizeBenchmark(copy));
  }
});
