/**
 * Endfield/SKPORT API Constants
 * Configuration for Endfield API endpoints
 */

/** Endfield attendance API URL */
export const ENDFIELD_ATTENDANCE_URL = "https://zonai.skport.com/web/v1/game/endfield/attendance";

/** Endfield request headers template */
export const ENDFIELD_HEADERS = {
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://game.skport.com",
    referer: "https://game.skport.com/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0",
    "accept-language": "en-CA,en-US;q=0.9,en;q=0.8",
    "accept-encoding": "gzip, deflate, br, zstd",
    dnt: "1",
    priority: "u=4",
    "sk-language": "en",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    te: "trailers"
} as const;

/** Valid Endfield server IDs */
export const ENDFIELD_VALID_SERVERS = ["2", "3"] as const;

/** Default platform for Endfield requests */
export const ENDFIELD_PLATFORM = "3";

/** Default version name for Endfield requests */
export const ENDFIELD_VERSION = "1.0.0";
