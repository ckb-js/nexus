// full ownership with external(change: 0) chain
export const FULL_OWNERSHIP_EXTERNAL_PARENT_PATH = `m/44'/309'/0'/0`;
// full ownership with internal(change: 1) chain
export const FULL_OWNERSHIP_INTERNAL_PARENT_PATH = `m/44'/309'/0'/1`;

// rule-based ownership
// 4410179 === 0x434b42 + 1  => (CKB) in hex
// m / ckb_purpose 1'/ 0' / index
export const RULE_BASED_PARENT_PATH = `m/4410179'/0'`;

/**
 * the gap limit is the number of consecutive unused full-ownership locks that we will allow
 */
export const FULL_OWNERSHIP_OFF_CHAIN_GAP = 20;

/**
 * the gap limit is the number of consecutive unused rule-based-ownership locks that we will allow
 */
export const RULE_BASED_OFF_CHAIN_GAP = 50;
