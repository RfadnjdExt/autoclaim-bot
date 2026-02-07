/**
 * Centralized game configuration constants
 * Used across commands, services, and handlers for consistent display
 */

/** Game key type for type-safety */
export type HoyolabGameKey = "genshin" | "starRail" | "honkai3" | "tearsOfThemis" | "zenlessZoneZero";

/** Full display names for each game */
export const GAME_DISPLAY_NAMES: Record<HoyolabGameKey, string> = {
    genshin: "Genshin Impact",
    starRail: "Honkai: Star Rail",
    honkai3: "Honkai Impact 3rd",
    tearsOfThemis: "Tears of Themis",
    zenlessZoneZero: "Zenless Zone Zero"
};

/** Short names for compact display */
export const GAME_SHORT_NAMES: Record<HoyolabGameKey, string> = {
    genshin: "GI",
    starRail: "HSR",
    honkai3: "HI3",
    tearsOfThemis: "ToT",
    zenlessZoneZero: "ZZZ"
};

/** Emoji icons for each game */
export const GAME_ICONS: Record<HoyolabGameKey, string> = {
    genshin: "🌍",
    starRail: "🚂",
    honkai3: "⚡",
    tearsOfThemis: "⚖️",
    zenlessZoneZero: "📺"
};

/** Color codes for embeds (hex) */
export const GAME_COLORS: Record<HoyolabGameKey, number> = {
    genshin: 0x5cb85c,
    starRail: 0x9b59b6,
    honkai3: 0x3498db,
    tearsOfThemis: 0xe74c3c,
    zenlessZoneZero: 0xf39c12
};

/** Endfield constants */
export const ENDFIELD = {
    name: "Arknights: Endfield",
    shortName: "Endfield",
    icon: "🎮",
    color: 0x1abc9c,
    servers: {
        "2": "Asia",
        "3": "Americas/Europe"
    } as Record<string, string>
} as const;

/**
 * Get display name for a game key
 * Falls back to the key itself if not found
 */
export function getGameDisplayName(gameKey: string): string {
    return GAME_DISPLAY_NAMES[gameKey as HoyolabGameKey] || gameKey;
}

/**
 * Get emoji icon for a game key
 */
export function getGameIcon(gameKey: string): string {
    return GAME_ICONS[gameKey as HoyolabGameKey] || "🎮";
}
