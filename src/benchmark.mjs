// Pure, offline benchmark calculator. This does not rerun models or independently
// authenticate the private raw evidence: it recomputes publicly reported totals.
export function summarizeBenchmark(data) {
  if(data?.schema!=='sfs-public-ab-aggregate-v1'||!Array.isArray(data.runs)||data.runs.length!==4)
    throw new Error('INVALID_BENCHMARK_RECORD');
  const expectedOrder=['baseline','sfs','sfs','baseline'];
  if(data.caseCount!==1||data.evaluation?.questions!==16)
    throw new Error('INCOMPATIBLE_PROTOCOL');
  const arms={baseline:[],sfs:[]};
  for(const [index,row] of data.runs.entries()){
    if(row.sequence!==index+1||row.arm!==expectedOrder[index])
      throw new Error('UNEXPECTED_OR_RANDOMIZED_ORDER');
    const omissions=row.expectedCitationMissing;
    if(!Array.isArray(omissions)||new Set(omissions).size!==omissions.length||
       !omissions.every(x=>typeof x==='string'&&x.length>0))
      throw new Error('INVALID_MISSING_CITATIONS');
    if(!Number.isInteger(row.correctFacts)||row.correctFacts<0||row.correctFacts>16||
       omissions.length>row.correctFacts||!Number.isFinite(row.modelLatencyMs)||
       row.modelLatencyMs<0||!Number.isFinite(row.modelNeurons)||
       row.modelNeurons<0||!Number.isInteger(row.inputTokens)||row.inputTokens<0||
       !Number.isInteger(row.outputTokens)||row.outputTokens<0||
       !Number.isInteger(row.unsafeCertaintyCount)||row.unsafeCertaintyCount<0)
      throw new Error('INVALID_RUN_VALUES');
    arms[row.arm].push({...row,citedCorrect:row.correctFacts-omissions.length});
  }
  if(arms.baseline.length!==2||arms.sfs.length!==2)
    throw new Error('ARM_IMBALANCE');
  const round=(v,d=2)=>Number(v.toFixed(d));
  const summary={};
  for(const [name,runs] of Object.entries(arms)){
    const total=key=>runs.reduce((s,r)=>s+r[key],0);
    summary[name]={
      trials:runs.length,correctFacts:total('correctFacts'),
      citationBackedCorrectFacts:total('citedCorrect'),possibleFacts:32,
      citationBackedScorePct:round(100*total('citedCorrect')/32,3),
      meanModelLatencyMs:round(total('modelLatencyMs')/2,1),
      meanModelNeurons:round(total('modelNeurons')/2,4),
      meanInputTokens:round(total('inputTokens')/2,1),
      meanOutputTokens:round(total('outputTokens')/2,1),
      unsafeCertaintyCount:total('unsafeCertaintyCount')
    };
  }
  return {
    caseCount:1,modelCalls:4,
    ...summary,deltaSfsMinusBaselinePercentagePoints:
      round(summary.sfs.citationBackedScorePct-summary.baseline.citationBackedScorePct,3),
    validatedCommercialValue:false,
    independentEvidenceValidation:false,
    limitations:data.evaluation.caveats
  };
}
