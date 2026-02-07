/**
 * Presence Updater
 * Updates bot activity with server time
 */

import { Client, ActivityType } from "discord.js";
import { formatUtc8DateTime } from "./time";

/**
 * Start the presence updater that shows server time
 * @param client - Discord client instance
 */
export function startPresenceUpdater(client: Client): void {
    const update = () => {
        // Get time in HH:MM format (UTC+8)
        const timeStr = formatUtc8DateTime().substring(11, 16);
        client.user?.setActivity(`Server Time: ${timeStr} | /help`, { type: ActivityType.Watching });
    };

    update();
    setInterval(update, 60 * 1000); // Update every minute
}
