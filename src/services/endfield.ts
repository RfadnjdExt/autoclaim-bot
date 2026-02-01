import axios from "axios";

export interface EndfieldClaimResult {
    success: boolean;
    message: string;
    alreadyClaimed?: boolean;
}

// Exact URL from canaria3406/skport-auto-sign
const ATTENDANCE_URL = "https://zonai.skport.com/web/v1/game/endfield/attendance";

// Exact headers from canaria3406/skport-auto-sign
const DEFAULT_HEADERS = {
    Accept: "*/*",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0"
};

export class EndfieldService {
    private SK_OAUTH_CRED_KEY: string;
    private id: string;
    private server: string;
    private language: string;

    constructor(SK_OAUTH_CRED_KEY: string, id: string, server: string = "2", language: string = "en") {
        this.SK_OAUTH_CRED_KEY = SK_OAUTH_CRED_KEY;
        this.id = id;
        this.server = server;
        this.language = language;
    }

    /**
     * Validates if the provided parameters are in correct format
     */
    static validateParams(skOAuthCredKey: string, id: string, server: string): { valid: boolean; message?: string } {
        if (!skOAuthCredKey || skOAuthCredKey.length < 20) {
            return { valid: false, message: "❌ Token too short. Provide valid SK_OAUTH_CRED_KEY." };
        }
        if (!id || !/^\d+$/.test(id)) {
            return { valid: false, message: "❌ Game UID must be numeric." };
        }
        if (server !== "2" && server !== "3") {
            return { valid: false, message: "❌ Invalid server. Use 2 (Asia) or 3 (Americas/Europe)." };
        }
        return { valid: true };
    }

    async claim(): Promise<EndfieldClaimResult> {
        // Build headers exactly like canaria3406
        const headers = {
            ...DEFAULT_HEADERS,
            cred: this.SK_OAUTH_CRED_KEY,
            "sk-game-role": `3_${this.id}_${this.server}`,
            "sk-language": this.language
        };

        try {
            const response = await axios.post(
                ATTENDANCE_URL,
                {},
                {
                    headers,
                    timeout: 30000
                }
            );

            const responseJson = response.data;
            const checkInResult = responseJson.message || "Unknown";

            // OK = success (exactly like canaria3406 checks)
            if (checkInResult === "OK") {
                return {
                    success: true,
                    message: "OK"
                };
            }

            // Already claimed or other message
            return {
                success: checkInResult.includes("already") || checkInResult.includes("Already"),
                message: checkInResult,
                alreadyClaimed: checkInResult.includes("already") || checkInResult.includes("Already")
            };
        } catch (error: any) {
            // Handle axios error responses
            if (error.response?.data) {
                const checkInResult = error.response.data.message || "Request failed";
                return {
                    success: false,
                    message: checkInResult
                };
            }
            return {
                success: false,
                message: error.message || "Request failed"
            };
        }
    }
}

export function formatEndfieldResult(result: EndfieldClaimResult): string {
    if (result.success) {
        if (result.alreadyClaimed) {
            return `🔄 **Arknights: Endfield**: ${result.message}`;
        }
        return `✅ **Arknights: Endfield**: ${result.message}`;
    }
    return `❌ **Arknights: Endfield**: ${result.message}`;
}
