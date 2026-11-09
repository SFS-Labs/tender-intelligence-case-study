const NOTICE_ID=/^\d{1,9}-\d{4}$/;
export function firstText(value,locale='eng') {
  if (typeof value==='string') return value.trim()||null;
  if (Array.isArray(value)) return value.map(v=>firstText(v,locale)).find(Boolean)??null;
  if (!value || typeof value!=='object') return null;
  const values=[value[locale],value.eng,value.deu,...Object.values(value)];
  return values.map(x=>firstText(x,locale)).find(Boolean)??null;
}
const firstCode=value=>{
  const v=firstText(value);
  if(v===null) return null;
  const m=v.match(/\b\d{8}\b/);return m?m[0]:null;
};
function dateOnly(raw){const v=firstText(raw);if(!v)return null;const m=v.match(/^\d{4}-\d{2}-\d{2}/);return m?m[0]:null;}
function currencyAmount(raw){
  if(typeof raw==='number'&&Number.isFinite(raw)&&raw>=0)return raw;
  const val=firstText(raw);if(!val||!/^[\d.]+$/.test(val))return null;
  const n=Number(val);return Number.isFinite(n)&&n>=0?n:null;
}
export function normalizeTedNotice(raw,{provenance='ted-api'}={}) {
  if (!raw || typeof raw!=='object') throw new TypeError('Notice must be object');
  const publicationId=firstText(raw['publication-number']??raw.publicationId);
  if (!publicationId||!NOTICE_ID.test(publicationId)) throw new Error('Invalid/missing TED publication number');
  const docUrl=`https://ted.europa.eu/en/notice/-/detail/${publicationId}`;
  const originalUrl=['ted-api','caller-supplied-unverified'].includes(provenance)?docUrl:(firstText(raw.sourceUrl)??docUrl);
 if(!/^https:\/\/(ted\.europa\.eu|op\.europa\.eu)\//.test(originalUrl)) throw new Error('Only primary EU source URLs allowed');
  const cpv=firstCode(raw['classification-cpv']??raw.cpv);
  const deadline=dateOnly(raw['deadline-receipt-tender-date-lot']??raw.deadline);
  const sourceFacts=Array.isArray(raw.sourceFacts)?raw.sourceFacts:[];
  const name=firstText(raw['notice-title']??raw.title);
  const buyer=firstText(raw['buyer-name']??raw.buyer);
  const country=firstText(raw['buyer-country']??raw.country);
  const value=currencyAmount(raw['total-value']??raw.value);
  const currency=firstText(raw['total-value-cur']??raw.currency);
  return {
    publicationId,title:name,buyer,country,cpv,deadline,publicationDate:dateOnly(raw['publication-date']??raw.published),
    noticeType:firstText(raw['notice-type']??raw.noticeType),
    formType:firstText(raw['form-type']??raw.formType),
    contractValue: value===null||currency===null?null:{value,currency},
    source:{url:originalUrl,provenance,facts:provenance==='caller-supplied-unverified'?[]:sourceFacts},
    unknowns: [!buyer&&'buyer',!deadline&&'submissionDeadline',!cpv&&'CPV',!(value!==null&&currency)&&'contractValue',!country&&'buyerCountry'].filter(Boolean)
  };
}
