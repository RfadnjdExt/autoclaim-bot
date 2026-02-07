/**
 * Hoyolab API Types
 * Type definitions for Hoyolab service interactions
 */

/** Result of a daily claim attempt */
export interface ClaimResult {
    success: boolean;
    game: string;
    message: string;
    alreadyClaimed?: boolean;
}

/** Configuration for a Hoyolab game */
export interface GameConfig {
    name: string;
    url: string;
    actId: string;
    bizName: string;
    extraHeaders?: Record<string, string>;
}

/** Game account information from Hoyolab API */
export interface GameAccount {
    game_biz: string;
    region: string;
    game_uid: string;
    nickname: string;
    level: number;
    is_chosen?: boolean;
    region_name: string;
    is_official: boolean;
}

/** Token validation result */
export interface TokenValidation {
    valid: boolean;
    message: string;
}

/** Code redemption result */
export interface RedeemResult {
    success: boolean;
    message: string;
}
