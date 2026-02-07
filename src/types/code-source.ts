/**
 * Code Source Types
 * Type definitions for redeem code API
 */

/** Individual redeem code */
export interface RedeemCode {
    code: string;
    description: string;
    added_at: number;
}

/** Response from Hashblen codes API */
export interface HashblenResponse {
    hsr: RedeemCode[];
    genshin: RedeemCode[];
    zzz: RedeemCode[];
    retcode: number;
}
