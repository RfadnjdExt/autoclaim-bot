/**
 * Endfield/SKPORT API Types
 * Type definitions for Endfield service interactions
 */

/** Internal profile for Endfield API requests */
export interface EndfieldProfile {
    cred: string;
    skGameRole: string;
    platform: string;
    vName: string;
    signToken?: string;
    deviceId?: string;
}

/** Reward from attendance check-in */
export interface AttendanceReward {
    id?: string;
    name: string;
    count?: number;
    icon?: string;
}

/** Resource info from API response */
export interface AttendanceResourceInfo {
    id: string;
    count: number;
    name: string;
    icon: string;
}

/** Result of an Endfield claim attempt */
export interface EndfieldClaimResult {
    success: boolean;
    message: string;
    rewards?: AttendanceReward[];
    already?: boolean;
}

/** Input for signing API requests */
export interface SignInput {
    url: string;
    method: string;
    body?: string;
    timestamp: string;
    platform: string;
    vName: string;
    deviceId?: string;
    key: string;
}

/** Options for creating EndfieldService */
export interface EndfieldServiceOptions {
    cred: string;
    gameId: string;
    server?: string;
    signToken?: string;
}

/** Validation result for Endfield parameters */
export interface EndfieldValidation {
    valid: boolean;
    message?: string;
}
