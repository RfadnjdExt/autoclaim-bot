/**
 * Endfield Service
 * Handles daily check-in for Arknights: Endfield via SKPORT API
 */

import crypto from "crypto";
import axios from "axios";
import type {
    EndfieldProfile,
    AttendanceReward,
    AttendanceResourceInfo,
    EndfieldClaimResult,
    SignInput,
    EndfieldServiceOptions,
    EndfieldValidation
} from "../types";
import {
    ENDFIELD,
    ENDFIELD_ATTENDANCE_URL,
    ENDFIELD_HEADERS,
    ENDFIELD_VALID_SERVERS,
    ENDFIELD_PLATFORM,
    ENDFIELD_VERSION
} from "../constants";

// Re-export types for backwards compatibility
export type { EndfieldClaimResult, EndfieldServiceOptions };

/**
 * Build sign payload according to FlamingFox911 logic
 */
function buildSignPayload(input: SignInput): string {
    const url = new URL(input.url);
    const path = url.pathname;
    const query = url.search ? url.search.slice(1) : "";
    const method = input.method.toUpperCase();
    const body = input.body ?? "";

    let source = "";
    source += path;
    source += method === "GET" ? query : body;
    source += input.timestamp;

    const payload = {
        platform: input.platform,
        timestamp: input.timestamp,
        dId: input.deviceId ?? "",
        vName: input.vName
    };

    source += JSON.stringify(payload);

    return source;
}

/**
 * Build signing headers (HMAC-SHA256 + MD5)
 */
function buildSignHeaders(
    profile: EndfieldProfile,
    url: string,
    method: string,
    body?: string
): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const headers: Record<string, string> = {
        platform: profile.platform,
        vName: profile.vName,
        timestamp
    };

    if (profile.deviceId) {
        headers.dId = profile.deviceId;
    }

    const key = profile.signToken;
    if (key) {
        const source = buildSignPayload({
            url,
            method,
            body,
            timestamp,
            platform: profile.platform,
            vName: profile.vName,
            deviceId: profile.deviceId,
            key
        });
        const hmacHex = crypto.createHmac("sha256", key).update(source).digest("hex");
        headers.sign = crypto.createHash("md5").update(hmacHex).digest("hex");
    }

    return headers;
}

/**
 * Build full request headers
 */
function buildHeaders(profile: EndfieldProfile, signHeaders: Record<string, string>): Record<string, string> {
    return {
        cred: profile.cred,
        "sk-game-role": profile.skGameRole,
        ...signHeaders,
        ...ENDFIELD_HEADERS
    };
}

/**
 * Parse rewards from API response
 */
function parseRewards(
    awardIds: Array<{ id?: string }> | undefined,
    resourceInfoMap: Record<string, AttendanceResourceInfo> | undefined
): AttendanceReward[] {
    if (!Array.isArray(awardIds) || !resourceInfoMap) return [];
    const rewards: AttendanceReward[] = [];
    for (const entry of awardIds) {
        if (entry?.id) {
            const info = resourceInfoMap[entry.id];
            if (info) {
                rewards.push({
                    id: info.id,
                    name: info.name,
                    count: info.count,
                    icon: info.icon
                });
            }
        }
    }
    return rewards;
}

/**
 * Service class for interacting with SKPORT/Endfield API
 * Handles authentication and daily check-in
 */
export class EndfieldService {
    private profile: EndfieldProfile;

    /**
     * Create a new EndfieldService instance
     * @param options - Configuration options including cred, gameId, server
     */
    constructor(options: EndfieldServiceOptions) {
        this.profile = {
            cred: options.cred,
            skGameRole: `${ENDFIELD_PLATFORM}_${options.gameId}_${options.server || "2"}`,
            platform: ENDFIELD_PLATFORM,
            vName: ENDFIELD_VERSION,
            signToken: options.signToken,
            deviceId: undefined
        };
    }

    /**
     * Validates if the provided parameters are in correct format
     * @param cred - OAuth credential token
     * @param id - Game UID
     * @param server - Server ID (2 or 3)
     * @returns Validation result
     */
    static validateParams(cred: string, id: string, server: string): EndfieldValidation {
        if (!cred || cred.length < 10) {
            return { valid: false, message: "❌ Invalid cred token (too short)" };
        }

        if (!id || !/^\d+$/.test(id)) {
            return { valid: false, message: "❌ Invalid Game ID (must be numbers only)" };
        }

        if (server && !ENDFIELD_VALID_SERVERS.includes(server as (typeof ENDFIELD_VALID_SERVERS)[number])) {
            return {
                valid: false,
                message: `❌ Invalid server (use 2 for ${ENDFIELD.servers["2"]} or 3 for ${ENDFIELD.servers["3"]})`
            };
        }

        return { valid: true };
    }

    /**
     * Check-in and claim daily rewards
     * @returns Claim result with rewards if successful
     */
    async claim(): Promise<EndfieldClaimResult> {
        const body = "{}";
        const signHeaders = buildSignHeaders(this.profile, ENDFIELD_ATTENDANCE_URL, "POST", body);
        const headers = buildHeaders(this.profile, signHeaders);

        console.log("[Endfield] Sending attendance request...");
        console.log("[Endfield] sk-game-role:", this.profile.skGameRole);

        try {
            const response = await axios.post(ENDFIELD_ATTENDANCE_URL, body, {
                headers,
                validateStatus: () => true
            });

            console.log("[Endfield] Response status:", response.status);
            console.log("[Endfield] Response data:", JSON.stringify(response.data));

            const data = response.data;

            if (response.status !== 200) {
                return {
                    success: false,
                    message: `HTTP ${response.status}: ${data?.message || data?.msg || "Request failed"}`
                };
            }

            const code = data?.code ?? data?.retcode;
            const msg = data?.msg ?? data?.message ?? "Attendance response received";

            if (code === 0) {
                const rewards = parseRewards(data?.data?.awardIds, data?.data?.resourceInfoMap);
                const message = msg === "OK" ? "Check-in successful" : msg;

                return {
                    success: true,
                    message,
                    rewards: rewards.length > 0 ? rewards : undefined
                };
            }

            // Check if already claimed
            const already =
                typeof msg === "string" && (msg.toLowerCase().includes("already") || data?.data?.hasToday === true);

            if (already) {
                return {
                    success: true,
                    message: "Already checked in today",
                    already: true
                };
            }

            return {
                success: false,
                message: msg
            };
        } catch (error: any) {
            console.error("[Endfield] Claim error:", error.message);
            return {
                success: false,
                message: error.message || "Network error"
            };
        }
    }
}

/**
 * Format claim result for display
 * @param result - Claim result to format
 * @returns Formatted string with emoji and game name
 */
export function formatEndfieldResult(result: EndfieldClaimResult): string {
    const gameName = ENDFIELD.name;

    if (!result.success && !result.already) {
        return `❌ **${gameName}**: ${result.message}`;
    }

    if (result.already) {
        return `✅ **${gameName}**: Already claimed today`;
    }

    let msg = `✅ **${gameName}**: ${result.message}`;
    if (result.rewards && result.rewards.length > 0) {
        const rewardList = result.rewards.map(r => `• ${r.name} x${r.count || 1}`).join("\n");
        msg += `\n${rewardList}`;
    }

    return msg;
}
