export interface ComplianceCheckResult {
  passed: boolean;
  flaggedTerms: string[];
  sanitizedText: string;
}

const PROHIBITED_ENTITIES: { pattern: RegExp; replacement: string; label: string }[] = [
  // Major Issuers & Banks
  { pattern: /\bJPMorgan\s*Chase\b/gi, replacement: 'a major financial institution', label: 'JPMorgan Chase' },
  { pattern: /\bChase\b/gi, replacement: 'a major rewards issuer', label: 'Chase' },
  { pattern: /\bAmerican\s+Express\b/gi, replacement: 'a major charge and travel issuer', label: 'American Express' },
  { pattern: /\bAmex\b/gi, replacement: 'a major travel issuer', label: 'Amex' },
  { pattern: /\bCapital\s+One\b/gi, replacement: 'a major digital-first issuer', label: 'Capital One' },
  { pattern: /\bCitibank\b/gi, replacement: 'a national banking issuer', label: 'Citibank' },
  { pattern: /\bCiti\b/gi, replacement: 'a national card issuer', label: 'Citi' },
  { pattern: /\bWells\s+Fargo\b/gi, replacement: 'a national retail bank', label: 'Wells Fargo' },
  { pattern: /\bBank\s+of\s+America\b/gi, replacement: 'a national consumer bank', label: 'Bank of America' },
  { pattern: /\bDiscover\b/gi, replacement: 'a direct-to-consumer issuer', label: 'Discover' },
  { pattern: /\bBarclays\b/gi, replacement: 'an international partner issuer', label: 'Barclays' },
  { pattern: /\bU\.?S\.?\s+Bank\b/gi, replacement: 'a regional banking issuer', label: 'U.S. Bank' },
  { pattern: /\bGoldman\s+Sachs\b/gi, replacement: 'a partner financial institution', label: 'Goldman Sachs' },
  { pattern: /\bSynchrony\b/gi, replacement: 'a retail financing issuer', label: 'Synchrony' },
  { pattern: /\bHSBC\b/gi, replacement: 'a global banking institution', label: 'HSBC' },
  { pattern: /\bTD\s+Bank\b/gi, replacement: 'a regional bank', label: 'TD Bank' },
  { pattern: /\bPNC\b/gi, replacement: 'a regional bank', label: 'PNC' },
  { pattern: /\bBilt\b/gi, replacement: 'a rent-rewards program', label: 'Bilt' },
  // Specific Card Product Names & Trademarks
  { pattern: /\bSapphire\s*(Preferred|Reserve)?\b/gi, replacement: 'Tier-1 Travel Rewards Card', label: 'Sapphire' },
  { pattern: /\bFreedom\s*(Unlimited|Flex|Rise)?\b/gi, replacement: 'Core Cashback Card', label: 'Freedom' },
  { pattern: /\bInk\s*(Business|Preferred|Cash|Unlimited)?\b/gi, replacement: 'Commercial Rewards Card', label: 'Ink' },
  { pattern: /\bVenture\s*(X|One)?\b/gi, replacement: 'Flat-Rate Travel Card', label: 'Venture' },
  { pattern: /\bSavor\s*(One)?\b/gi, replacement: 'Dining & Entertainment Card', label: 'Savor' },
  { pattern: /\bQuicksilver\b/gi, replacement: 'Flat-Rate Cashback Card', label: 'Quicksilver' },
  { pattern: /\bDouble\s+Cash\b/gi, replacement: 'Flat-Rate 2% Cashback Card', label: 'Double Cash' },
  { pattern: /\bCustom\s+Cash\b/gi, replacement: 'Adaptive Category Cashback Card', label: 'Custom Cash' },
  { pattern: /\bBlue\s+Cash\s*(Preferred|Everyday)?\b/gi, replacement: 'Supermarket Cashback Card', label: 'Blue Cash' },
  { pattern: /\bPlatinum\s+Card\b/gi, replacement: 'Flagship Lounge Travel Card', label: 'Platinum Card' },
  { pattern: /\bGold\s+Card\b/gi, replacement: 'Dining & Grocery Points Card', label: 'Gold Card' },
  { pattern: /\bGreen\s+Card\b/gi, replacement: 'Transit & Travel Points Card', label: 'Green Card' },
  { pattern: /\bActive\s+Cash\b/gi, replacement: 'Flat 2% Cashback Card', label: 'Active Cash' },
  { pattern: /\bAutograph\s*(Journey)?\b/gi, replacement: 'No-Fee Travel Multiplier Card', label: 'Autograph' },
  { pattern: /\bReflect\b/gi, replacement: 'Extended 0% APR Card', label: 'Reflect' },
  { pattern: /\bSimplicity\b/gi, replacement: 'Long-Window Balance Transfer Card', label: 'Simplicity' },
  { pattern: /\bSlate\s*(Edge)?\b/gi, replacement: 'Balance Transfer Card', label: 'Slate' },
  { pattern: /\bDiamond\s+Preferred\b/gi, replacement: 'Extended Intro APR Card', label: 'Diamond Preferred' },
  { pattern: /\bMembership\s+Rewards\b/gi, replacement: 'Flexible Transferable Points', label: 'Membership Rewards' },
  { pattern: /\bUltimate\s+Rewards\b/gi, replacement: 'Core Transferable Points', label: 'Ultimate Rewards' },
  { pattern: /\bThankYou\s+Points\b/gi, replacement: 'Bank-Issued Transferable Points', label: 'ThankYou Points' },
  { pattern: /\bSkyMiles\b/gi, replacement: 'Domestic Carrier Miles', label: 'SkyMiles' },
  { pattern: /\bMileagePlus\b/gi, replacement: 'Alliance Carrier Miles', label: 'MileagePlus' },
  { pattern: /\bAAdvantage\b/gi, replacement: 'Legacy Carrier Miles', label: 'AAdvantage' },
  { pattern: /\bRapid\s+Rewards\b/gi, replacement: 'Point-to-Point Carrier Points', label: 'Rapid Rewards' },
  { pattern: /\bMarriott\s+Bonvoy\b/gi, replacement: 'Global Dynamic Hotel Points', label: 'Marriott Bonvoy' },
  { pattern: /\bWorld\s+of\s+Hyatt\b/gi, replacement: 'Award-Chart Hotel Points', label: 'World of Hyatt' },
  { pattern: /\bHilton\s+Honors\b/gi, replacement: 'High-Footprint Hotel Points', label: 'Hilton Honors' },
];

export function auditCompliance(text: string): ComplianceCheckResult {
  const flaggedSet = new Set<string>();
  let sanitized = text;

  for (const rule of PROHIBITED_ENTITIES) {
    const matches = sanitized.match(rule.pattern);
    if (matches && matches.length > 0) {
      flaggedSet.add(rule.label);
      sanitized = sanitized.replace(rule.pattern, rule.replacement);
    }
  }

  return {
    passed: flaggedSet.size === 0,
    flaggedTerms: Array.from(flaggedSet),
    sanitizedText: sanitized,
  };
}
