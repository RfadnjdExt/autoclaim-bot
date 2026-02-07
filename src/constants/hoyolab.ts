/**
 * Hoyolab API Constants
 * Configuration for Hoyolab API endpoints and headers
 */

import type { GameConfig } from "../types";

/** Hoyolab game API configurations */
export const HOYOLAB_GAMES: Record<string, GameConfig> = {
    genshin: {
        name: "Genshin Impact",
        url: "https://sg-hk4e-api.hoyolab.com/event/sol/sign",
        actId: "e202102251931481",
        bizName: "hk4e_global"
    },
    starRail: {
        name: "Honkai: Star Rail",
        url: "https://sg-public-api.hoyolab.com/event/luna/os/sign",
        actId: "e202303301540311",
        bizName: "hkrpg_global"
    },
    zenlessZoneZero: {
        name: "Zenless Zone Zero",
        url: "https://sg-public-api.hoyolab.com/event/luna/zzz/os/sign",
        actId: "e202406031448091",
        bizName: "nap_global",
        extraHeaders: {
            "x-rpc-signgame": "zzz"
        }
    },
    honkai3: {
        name: "Honkai Impact 3rd",
        url: "https://sg-public-api.hoyolab.com/event/mani/sign",
        actId: "e202110291205111",
        bizName: "bh3_global"
    },
    tearsOfThemis: {
        name: "Tears of Themis",
        url: "https://sg-public-api.hoyolab.com/event/luna/os/sign",
        actId: "e202308141137581",
        bizName: "nxx_global"
    }
} as const;

/** Default headers for Hoyolab API requests */
export const HOYOLAB_HEADERS = {
    Accept: "application/json, text/plain, */*",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "x-rpc-app_version": "2.34.1",
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "x-rpc-client_type": "4",
    Referer: "https://act.hoyolab.com/",
    Origin: "https://act.hoyolab.com"
} as const;

/** Base URLs for code redemption by game */
export const HOYOLAB_REDEEM_URLS: Record<string, string> = {
    genshin: "https://sg-hk4e-api.hoyolab.com",
    starRail: "https://sg-hkrpg-api.hoyolab.com",
    zenlessZoneZero: "https://public-operation-nap.hoyoverse.com"
} as const;

/** Salt for Dynamic Secret generation */
export const HOYOLAB_DS_SALT = "6s25p5ox5y14umn1p61aqyyvbvvl3lrt";
