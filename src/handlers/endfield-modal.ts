import { type ModalSubmitInteraction, MessageFlags } from "discord.js";
import { User } from "../database/models/User";
import { EndfieldService } from "../services/endfield";
import { performOAuthFlow } from "../services/endfield-oauth";

export async function handleEndfieldModal(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const token = interaction.fields.getTextInputValue("endfield-token").trim();
    const gameId = interaction.fields.getTextInputValue("endfield-game-id").trim();
    const server = interaction.fields.getTextInputValue("endfield-server").trim() || "2";
    const nickname = interaction.fields.getTextInputValue("endfield-nickname")?.trim() || "Unknown";

    // Validate params using service
    const validation = EndfieldService.validateParams(token, gameId, server);
    if (!validation.valid) {
        await interaction.editReply({
            content: validation.message || "❌ Invalid parameters."
        });
        return;
    }

    // Test OAuth flow immediately to validate the token
    try {
        await interaction.editReply({
            content: "🔄 Validating token via OAuth flow..."
        });

        const credentials = await performOAuthFlow(token);

        // OAuth successful - save to database
        await User.findOneAndUpdate(
            { discordId: interaction.user.id },
            {
                $set: {
                    username: interaction.user.username,
                    endfield: {
                        accountToken: token,
                        salt: credentials.salt,
                        gameId,
                        server,
                        accountName: nickname,
                        credExpiry: new Date(Date.now() + 25 * 60 * 1000) // 25 min
                    }
                },
                $setOnInsert: {
                    settings: { notifyOnClaim: true }
                }
            },
            { upsert: true, new: true }
        );

        // Clear any cached credentials for this user
        const service = new EndfieldService({
            accountToken: token,
            gameId,
            server
        });
        service.clearCache();

        const serverName = server === "2" ? "Asia" : "Americas/Europe";

        await interaction.editReply({
            content:
                `✅ **Endfield token saved!**\n\n` +
                `**Account**: ${nickname}\n` +
                `**UID**: ${gameId}\n` +
                `**Server**: ${serverName}\n` +
                `**OAuth**: ✅ Validated\n\n` +
                `⚠️ Gunakan \`/claim endfield\` untuk test daily claim.`
        });
    } catch (error: any) {
        console.error(`[Endfield Modal] OAuth validation failed:`, error.message);

        await interaction.editReply({
            content:
                `❌ **OAuth validation failed!**\n\n` +
                `**Error**: ${error.message}\n\n` +
                `**Pastikan:**\n` +
                `1. Token dari Local Storage: F12 > Application > Local Storage > skport.com\n` +
                `2. Copy nilai \`account_token\` (bukan cookie)\n` +
                `3. Pastikan sudah login di skport.com`
        });
    }
}
