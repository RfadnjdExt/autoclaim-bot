/**
 * Ping Command
 * Check bot latency and uptime
 */

import { SlashCommandBuilder, type ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { formatUptime } from "../utils/time";

export const data = new SlashCommandBuilder().setName("ping").setDescription("Check bot latency");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const startTime = Date.now();
    await interaction.reply({ content: "🏓 Pinging..." });

    const roundtrip = Date.now() - startTime;
    const wsLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
        .setTitle("🏓 Pong!")
        .setColor(wsLatency < 100 ? 0x00ff00 : wsLatency < 200 ? 0xffff00 : 0xff0000)
        .addFields(
            {
                name: "📡 Bot Latency",
                value: `\`${roundtrip}ms\``,
                inline: true
            },
            {
                name: "💓 WebSocket",
                value: `\`${wsLatency}ms\``,
                inline: true
            },
            {
                name: "📊 Uptime",
                value: `\`${formatUptime(interaction.client.uptime || 0)}\``,
                inline: true
            }
        )
        .setTimestamp();

    await interaction.editReply({ content: "", embeds: [embed] });
}
