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
            content: `❌ Invalid token: ${validation.message}\n\n**Cara mendapatkan token:**\n1. Buka https://game.skport.com/endfield/sign-in\n2. Tekan F12 → **Network Tab**\n3. Refresh halaman, cari request ke \`zonai.skport.com\`\n4. Copy \`cred\` dan \`sk_game_role\` dari **Request Headers**`,
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
