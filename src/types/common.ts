/**
 * Common Types
 * Shared type definitions used across the application
 */

import type { Interaction } from "discord.js";

/** Discord interaction handler function type */
export type InteractionHandler<T extends Interaction = Interaction> = (interaction: T) => Promise<void>;

/** Generic API response structure */
export interface ApiResponse<T = unknown> {
    retcode: number;
    message: string;
    data?: T;
}

/** User settings configuration */
export interface UserSettings {
    notifyOnClaim: boolean;
}

/** Hoyolab game enablement flags */
export interface HoyolabGames {
    genshin: boolean;
    starRail: boolean;
    honkai3: boolean;
    tearsOfThemis: boolean;
    zenlessZoneZero: boolean;
}
