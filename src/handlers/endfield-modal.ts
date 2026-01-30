import { type ModalSubmitInteraction, MessageFlags } from 'discord.js';
import { User } from '../database/models/User';
import { EndfieldService } from '../services/endfield';

export async function handleEndfieldModal(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const cred = interaction.fields.getTextInputValue('endfield-cred').trim();
    const skGameRole = interaction.fields.getTextInputValue('endfield-sk-game-role').trim();
    const nickname = interaction.fields.getTextInputValue('endfield-nickname')?.trim() || 'Unknown';

    // Validate token
    const service = new EndfieldService(cred, skGameRole);
    const validation = await service.validateToken();

    if (!validation.valid) {
        await interaction.editReply({
            content: `❌ Invalid token: ${validation.message}\n\nMake sure to copy the correct values from browser DevTools:\n1. Open https://game.skport.com/endfield/sign-in\n2. Press F12 → Application → Cookies → zonai.skport.com\n3. Copy **cred** and **SK_GAME_ROLE** values`,
        });
        return;
    }

    // Save to database
    await User.findOneAndUpdate(
        { discordId: interaction.user.id },
        {
            $set: {
                username: interaction.user.username,
                endfield: {
                    cred,
                    skGameRole,
                    accountName: nickname,
                },
            },
            $setOnInsert: {
                settings: { notifyOnClaim: true },
            },
        },
        { upsert: true, new: true }
    );

    await interaction.editReply({
        content: `✅ **Endfield token saved successfully!**\n\n**Account**: ${nickname}\n\nYour daily rewards will be claimed automatically every day at 00:00 UTC+8.`,
    });
}
