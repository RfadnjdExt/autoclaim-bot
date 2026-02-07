/**
 * Time formatting utilities
 * Centralized functions for handling time across the bot
 */

/** UTC+8 timezone offset in milliseconds */
const UTC8_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * Get current time in UTC+8
 */
export function getUtc8Time(): Date {
    const now = new Date();
    return new Date(now.getTime() + UTC8_OFFSET_MS);
}

/**
 * Format date as ISO string without timezone (UTC+8)
 * Example: "2026-02-07 10:00:00"
 */
export function formatUtc8DateTime(date?: Date): string {
    const utc8 = date ? new Date(date.getTime() + UTC8_OFFSET_MS) : getUtc8Time();
    return utc8.toISOString().replace("T", " ").substring(0, 19);
}

/**
 * Create Discord timestamp
 * @param date - Date to format
 * @param style - Timestamp style (R=relative, F=full, D=date, t=time, T=long time)
 */
export function discordTimestamp(date: Date, style: "R" | "F" | "D" | "t" | "T" = "R"): string {
    const unix = Math.floor(date.getTime() / 1000);
    return `<t:${unix}:${style}>`;
}

/**
 * Format duration in milliseconds to human readable string
 * Example: 1500000 -> "25m"
 */
export function formatDuration(ms: number): string {
    if (!ms || ms <= 0) return "N/A";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }

    if (minutes > 0) {
        const remainingSeconds = seconds % 60;
        return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }

    return `${seconds}s`;
}

/**
 * Get time until next scheduled run (UTC+8 midnight)
 */
export function getTimeUntilNextRun(hour = 0, minute = 0): string {
    const now = getUtc8Time();
    const next = new Date(now);

    next.setHours(hour, minute, 0, 0);

    // If already past today's run time, schedule for tomorrow
    if (now >= next) {
        next.setDate(next.getDate() + 1);
    }

    const diffMs = next.getTime() - now.getTime();
    return formatDuration(diffMs);
}

/**
 * Format uptime from milliseconds to human readable string
 * Example: 90061000 -> "1d 1h"
 */
export function formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    return formatUptimeSeconds(seconds);
}

/**
 * Format uptime from seconds to human readable string
 * Example: 90061 -> "1d 1h 1m 1s"
 */
export function formatUptimeSeconds(seconds: number): string {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(" ");
}
