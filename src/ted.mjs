// TED Search API v3: authenticated access is NOT required for published notices.
// Restrict queries to bounded, public search. No user-supplied TED DSL accepted.
export const TED_SEARCH_URL = 'https://api.ted.europa.eu/v3/notices/search';
export const FIELDS = Object.freeze([
  'publication-number', 'publication-date', 'notice-title',
  'notice-identifier', 'notice-version', 'procedure-identifier',
  'identifier-lot', 'deadline-receipt-tender-time-lot',
  'document-url-lot', 'submission-url-lot', 'links',
  'buyer-name', 'buyer-country', 'classification-cpv',
  'deadline-receipt-tender-date-lot', 'notice-type', 'form-type',
  'contract-nature', 'total-value', 'total-value-cur'
]);
const CPV_PREFIX_RE = /^\d{2,8}$/; // Broad user-specified CPV families, not an IT-only allowlist.

const MAX_TED_RESPONSE_BYTES=1500000;
async function readBoundedTedJson(response){
  const advertised=response.headers.get('content-length');
  if(advertised!==null&&(!/^\d+$/.test(advertised)||Number(advertised)>MAX_TED_RESPONSE_BYTES))
    throw new Error('TED response exceeds size limit');
  if(!response.body)throw new Error('TED response body missing');
  const reader=response.body.getReader(),chunks=[];let size=0;
  try{
    while(true){
      const {done,value}=await reader.read();
      if(done)break;
      if(!(value instanceof Uint8Array))throw new Error('Invalid TED response stream');
      size+=value.byteLength;
      if(size>MAX_TED_RESPONSE_BYTES){void reader.cancel().catch(()=>{});throw new Error('TED response exceeds size limit');}
      chunks.push(value);
    }
  }finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
export function buildSearchBody({since='2026-10-01', cpvPrefixes=['72'], limit=20, page=1, formType='competition'}={}) {
  if (typeof since !== 'string' || !DAY_RE.test(since) || Number.isNaN(Date.parse(since+'T00:00:00Z')) || new Date(since+'T00:00:00Z').toISOString().slice(0,10)!==since) throw new TypeError('Invalid date, use YYYY-MM-DD');
  if (!Array.isArray(cpvPrefixes) || cpvPrefixes.length>3 || cpvPrefixes.some(x=>typeof x!=='string'||!CPV_PREFIX_RE.test(x))) throw new TypeError('CPV family not allowed');
  if (!Number.isInteger(limit)||limit<1||limit>30||!Number.isInteger(page)||page<1||page>5) throw new TypeError('Bounded searches only');
  const cpvs=[...new Set(cpvPrefixes)];
  if (!['competition','all'].includes(formType)) throw new TypeError('Invalid formType');
  const cpvClause=cpvs.length ? ` AND (${cpvs.map(x=>`classification-cpv=${x}*`).join(' OR ')})` : '';
  const formClause=formType==='competition' ? ' AND form-type=competition' : '';
  // No status inference from form-type. Broader searches are page-bounded, not full-corpus exports.
  return {query:`publication-date >= ${since.replaceAll('-','')}${cpvClause}${formClause} SORT BY publication-date DESC`,
    fields:[...FIELDS], page, limit, scope:'ALL', paginationMode:'PAGE_NUMBER', onlyLatestVersions:true};
}
export async function searchTed(input={}, {fetchImpl=fetch,timeoutMs=12000}={}) {
  const body=buildSearchBody(input);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try {
    const response=await fetchImpl(TED_SEARCH_URL,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(body),signal:controller.signal});
    if (!response.ok) throw new Error(`TED HTTP ${response.status}`);
    const data=await readBoundedTedJson(response);
    if (!data || !Array.isArray(data.notices)) throw new Error('TED response missing notices array');
    return {query:body.query,noticeCount:data.totalNoticeCount??null,notices:data.notices,asOf:new Date().toISOString(),source:'TED Search API v3'};
  } finally {clearTimeout(timeout);}
}
