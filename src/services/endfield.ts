import axios, { type AxiosInstance } from 'axios';

export interface EndfieldClaimResult {
    success: boolean;
    message: string;
    daysSignedIn?: number;
    reward?: string;
    alreadyClaimed?: boolean;
}

// API URLs
const SKPORT_WEB_BASE = 'https://zonai.skport.com/web/v1';
const ATTENDANCE_URL = `${SKPORT_WEB_BASE}/game/endfield/attendance`;

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export class EndfieldService {
    private client: AxiosInstance;
    private cred: string;
    private skGameRole: string;

    constructor(cred: string, skGameRole: string = '') {
        this.cred = cred;
        this.skGameRole = skGameRole;

        this.client = axios.create({
            timeout: 30000,
            headers: {
                'User-Agent': USER_AGENT,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://game.skport.com',
                'Referer': 'https://game.skport.com/',
                'platform': '3',
                'vname': '1.0.0',
            },
        });
    }

    private getHeaders(): Record<string, string> {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const headers: Record<string, string> = {
            'cred': this.cred,
            'timestamp': timestamp,
            'platform': '3',
            'vname': '1.0.0',
            'sk-language': 'en',
        };

        if (this.skGameRole) {
            headers['sk-game-role'] = this.skGameRole;
        }

        return headers;
    }

    async checkAttendance(): Promise<{ hasToday: boolean; records?: any[] }> {
        try {
            const response = await this.client.get(ATTENDANCE_URL, {
                headers: this.getHeaders(),
            });

            if (response.data.code === 0 && response.data.data) {
                return {
                    hasToday: response.data.data.hasToday ?? false,
                    records: response.data.data.records,
                };
            }
            return { hasToday: false };
        } catch (error: any) {
            console.error('Check attendance error:', error.response?.data || error.message);
            return { hasToday: false };
        }
    }

    async claim(): Promise<EndfieldClaimResult> {
        // Check if already claimed
        const attendance = await this.checkAttendance();

        if (attendance.hasToday) {
            return {
                success: true,
                message: 'Already signed in today',
                alreadyClaimed: true,
                daysSignedIn: attendance.records?.length,
            };
        }

        // Claim attendance
        try {
            const response = await this.client.post(ATTENDANCE_URL, null, {
                headers: this.getHeaders(),
            });

            return this.parseResponse(response.data);
        } catch (error: any) {
            if (error.response?.data) {
                return this.parseResponse(error.response.data, error.response.status);
            }
            return {
                success: false,
                message: error.message || 'Request failed',
            };
        }
    }

    private parseResponse(data: any, statusCode: number = 200): EndfieldClaimResult {
        const code = data.code ?? -1;
        const message = data.message || 'Unknown response';

        if (code === 0) {
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

        // Already signed in
        if (
            code === 1001 ||
            code === 10001 ||
            message.toLowerCase().includes('already') ||
            message.includes('重复签到') ||
            statusCode === 403
        ) {
            return {
                success: true,
                message: 'Already signed in today',
                alreadyClaimed: true,
            };
        }

        // Auth failed
        if (code === 10002 || code === 401) {
            return {
                success: false,
                message: 'Authentication failed. Please refresh your cred token.',
            };
        }

        return {
            success: false,
            message: `Sign-in failed: ${message} (code: ${code})`,
        };
    }

    async validateToken(): Promise<{ valid: boolean; message: string }> {
        try {
            const response = await this.client.get(`${SKPORT_WEB_BASE}/wiki/me`, {
                headers: this.getHeaders(),
            });

            if (response.data.code === 0 && response.data.data?.user) {
                return { valid: true, message: 'Token valid' };
            }
            return { valid: false, message: 'Invalid token' };
        } catch (error: any) {
            return { valid: false, message: error.response?.data?.message || 'Token validation failed' };
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
