// SFS decision brief: deterministic metadata interpretation, not a legal opinion.
// Source-evidence values are always separated from process requirements and
// missing-verification flags. No model may change these source-grounded fields.

const uniqueStrings = values => Array.isArray(values)
  ? [...new Set(values.filter(x=>typeof x==='string' && x.trim()))]
  : [];

function requireOfficialNotice(notice){
  if(!notice||typeof notice!=='object'||Array.isArray(notice))
    throw new TypeError('NOTICE_REQUIRED');
  if(notice.provenance?.source!=='TED Search API v3' ||
     notice.provenance?.transport!=='OFFICIAL_VERIFIED' ||
     typeof notice.provenance?.publicationUrl!=='string' ||
     !/^https:\/\/ted\.europa\.eu\/en\/notice\/\-\/detail\/\d+-\d{4}$/.test(notice.provenance.publicationUrl) ||
     typeof notice.publicationNumber!=='string' ||
     !/^\d+-\d{4}$/.test(notice.publicationNumber) ||
     !notice.provenance.publicationUrl.endsWith('/'+notice.publicationNumber))
    throw new Error('NOT_OFFICIAL_CANONICAL_NOTICE');
}
export function buildDecisionBrief(notice){
  requireOfficialNotice(notice);
  const lots=uniqueStrings(notice.lots);
  const cpvs=uniqueStrings(notice.cpvCodes);
  const dateValues=uniqueStrings(notice.deadlineDateValues);
  const timeValues=uniqueStrings(notice.deadlineTimeValues);
  const value=notice.contractValue &&
    typeof notice.contractValue==='object' &&
    Number.isFinite(notice.contractValue.value) &&
    notice.contractValue.value>=0 &&
    typeof notice.contractValue.currency==='string'
      ? {amount:notice.contractValue.value,currency:notice.contractValue.currency,
        meaning:'TED_REPORTED_VALUE_NOT_VERIFIED_AS_PER_LOT_OR_FINAL_AWARD'}
      : null;

  const flags=[
    'BUYER_DOCUMENT_CONTENT_NOT_RETRIEVED',
    'LEGAL_ELIGIBILITY_NOT_VERIFIED',
    'LATEST_AMENDMENTS_NOT_RECONCILED',
    'OPEN_BIDDING_STATUS_NOT_VERIFIED'
  ];
  if(!dateValues.length || !timeValues.length)
    flags.push('DEADLINE_METADATA_INCOMPLETE');
  if(lots.length>1){
    flags.push('MULTI_LOT_REQUIRES_INDEPENDENT_REVIEW');
    flags.push('DEADLINE_TO_LOT_MAPPING_NOT_VERIFIED');
    if(value)flags.push('VALUE_ALLOCATION_TO_LOTS_NOT_VERIFIED');
  }
  const checks=[
    {id:'VERIFY_LATEST_PUBLICATION_AND_DEADLINE',priority:1,
      reason:'TED search metadata does not establish the latest amended deadline or open bidding status.',
      evidencePaths:['provenance.publicationUrl','deadlineDateValues','deadlineTimeValues']},
    {id:'OBTAIN_AND_READ_BUYER_DOCUMENTS',priority:2,
      reason:'Buyer technical specifications and contractual terms were not read in this operation.',
      evidencePaths:['provenance.buyerDocumentContent']},
    {id:'EVALUATE_MANDATORY_ELIGIBILITY',priority:3,
      reason:'Supplier qualification and legal bidding eligibility were not checked.',
      evidencePaths:['uncertainty.legalEligibility']}
  ];
  if(lots.length>1)checks.push({id:'BUILD_LOT_REQUIREMENT_MATRIX',priority:2,
    reason:'Requirements, deadlines and procurement values cannot safely be assigned to every lot from aggregate metadata.',
    evidencePaths:['lots','contractValue','deadlineDateValues']});
  return {
    schemaVersion:'0.1-provisional',
    classification:'PRELIMINARY_SOURCE_METADATA_TRIAGE_NOT_BID_READY',
    source:{name:'TED Search API v3',url:notice.provenance.publicationUrl,
      publicationNumber:notice.publicationNumber,transport:'OFFICIAL_VERIFIED',
      buyerDocumentsRetrieved:false},
    metadata:{
      title:typeof notice.title==='string'?notice.title:null,
      buyer:typeof notice.buyer==='string'?notice.buyer:null,
      buyerCountry:notice.buyerCountry??null,
      cpvCodes:cpvs,
      lots:{identifiers:lots,count:lots.length,requirementsMapped:false},
      submissionDeadline:{
        reportedDateValues:dateValues,reportedTimeValues:timeValues,
        latestAmendmentVerified:false,mappedToEachLot:false,status:'TED_METADATA_ONLY'
      },
      contractValue:value
    },
    evidenceBoundary:{
      officialNoticeMetadata:true,
      buyerDocumentContentRetrieved:false,
      legalEligibilityVerified:false,
      latestBuyerAmendmentVersionsVerified:false,
      activeTenderStatusVerified:false
    },
    flags,checks
  };
}
