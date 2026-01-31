import axios, { type AxiosInstance } from 'axios';

export interface EndfieldClaimResult {
    success: boolean;
    message: string;
    daysSignedIn?: number;
    reward?: string;
    alreadyClaimed?: boolean;
}

// API URLs
const ATTENDANCE_URL = 'https://zonai.skport.com/web/v1/game/endfield/attendance';

const DEFAULT_HEADERS = {
    'Accept': '*/*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0',
};

export class EndfieldService {
    private client: AxiosInstance;
    private skOAuthCredKey: string;
    private gameId: string;
    private server: string;
    private language: string;

    /**
     * @param skOAuthCredKey - SK_OAUTH_CRED_KEY from cookies
     * @param gameId - Your Endfield game UID (numbers only)
     * @param server - Server: "2" for Asia, "3" for Americas/Europe
     * @param language - Language code: en, ja, zh_Hant, zh_Hans, ko, ru_RU
     */
    constructor(skOAuthCredKey: string, gameId: string, server: string = '2', language: string = 'en') {
        this.skOAuthCredKey = skOAuthCredKey;
        this.gameId = gameId;
        this.server = server;
        this.language = language;

        this.client = axios.create({
            timeout: 30000,
            headers: DEFAULT_HEADERS,
        });
    }

    private getHeaders(): Record<string, string> {
        return {
            ...DEFAULT_HEADERS,
            'cred': this.skOAuthCredKey,
            'sk-game-role': `3_${this.gameId}_${this.server}`,
            'sk-language': this.language,
        };
    }

    async claim(): Promise<EndfieldClaimResult> {
        try {
            const response = await this.client.post(ATTENDANCE_URL, null, {
                headers: this.getHeaders(),
            });

            return this.parseResponse(response.data);
        } catch (error: any) {
            if (error.response?.data) {
                return this.parseResponse(error.response.data);
            }
            return {
                success: false,
                message: error.message || 'Request failed',
            };
        }
    }

    private parseResponse(data: any): EndfieldClaimResult {
        const code = data.code ?? -1;
        const message = data.message || 'Unknown response';

        // OK = success
        if (message === 'OK' || code === 0) {
            const resultData = data.data || {};
            let reward: string | undefined;

            if (resultData.awardIds && resultData.resourceInfoMap) {
                try {
                    const rewards: string[] = [];
                    for (const award of resultData.awardIds) {
                        const item = resultData.resourceInfoMap[award.id];
                        if (item) {
                            rewards.push(`${item.name} x${item.count || 1}`);
                        }
                    }
                    if (rewards.length > 0) {
                        reward = rewards.join(', ');
                    }
                } catch {
                    // Ignore parse errors
                }
            }

            return {
                success: true,
                message: 'Sign-in successful!',
                daysSignedIn: resultData.signInCount,
                reward,
            };
        }

        // Already signed in messages
        if (
            message.includes('already') ||
            message.includes('Already') ||
            message.includes('signed') ||
            message.includes('claimed') ||
            message.includes('duplicate') ||
            message.includes('重复') ||
            code === 1001 ||
            code === 10001
        ) {
            return {
                success: true,
                message: 'Already signed in today',
                alreadyClaimed: true,
            };
        }

        // Auth failed
        if (code === 10002 || code === 401 || code === -1) {
            return {
                success: false,
                message: 'Authentication failed. Token may be expired or invalid.',
            };
        }

        return {
            success: false,
            message: `Sign-in failed: ${message} (code: ${code})`,
        };
    }

    async validateToken(): Promise<{ valid: boolean; message: string }> {
        // Try to claim - if we get any response other than auth error, token is valid
        try {
            const response = await this.client.post(ATTENDANCE_URL, null, {
                headers: this.getHeaders(),
            });

            const message = response.data?.message || '';
            const code = response.data?.code;

            // If we get OK or already claimed, token is valid
            if (message === 'OK' || code === 0 || code === 1001 || code === 10001) {
                return { valid: true, message: 'Token valid' };
            }

            // Auth errors mean invalid token
            if (code === 10002 || code === 401 || code === -1) {
                return { valid: false, message: response.data?.message || 'Invalid token' };
            }

            return { valid: true, message: 'Token appears valid' };
        } catch (error: any) {
            const responseData = error.response?.data;
            if (responseData?.code === 10002 || responseData?.code === 401) {
                return { valid: false, message: responseData?.message || 'Invalid token' };
            }
            return { valid: false, message: error.message || 'Token validation failed' };
        }
    }
}

export function formatEndfieldResult(result: EndfieldClaimResult): string {
    const icon = result.success ? (result.alreadyClaimed ? '🔄' : '✅') : '❌';
    let text = `${icon} **Arknights: Endfield**: ${result.message}`;

    if (result.reward) {
        text += `\n   📦 Reward: ${result.reward}`;
    }
    if (result.daysSignedIn) {
        text += `\n   📅 Days signed: ${result.daysSignedIn}`;
    }

    return text;
}
