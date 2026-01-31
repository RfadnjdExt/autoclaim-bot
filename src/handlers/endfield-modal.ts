import { type ModalSubmitInteraction, MessageFlags } from 'discord.js';
import { User } from '../database/models/User';
import { EndfieldService } from '../services/endfield';

export async function handleEndfieldModal(interaction: ModalSubmitInteraction): Promise<void> {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const skOAuthCredKey = interaction.fields.getTextInputValue('endfield-token').trim();
    const gameId = interaction.fields.getTextInputValue('endfield-game-id').trim();
    const server = interaction.fields.getTextInputValue('endfield-server').trim() || '2';
    const nickname = interaction.fields.getTextInputValue('endfield-nickname')?.trim() || 'Unknown';

    // Validate server
    if (server !== '2' && server !== '3') {
        await interaction.editReply({
            content: '❌ Invalid server. Use **2** for Asia or **3** for Americas/Europe.',
        });
        return;
    }

    // Validate token
    const service = new EndfieldService(skOAuthCredKey, gameId, server);
    const validation = await service.validateToken();

    if (!validation.valid) {
        await interaction.editReply({
            content: `❌ Invalid token: ${validation.message}\n\n**Cara mendapatkan token:**\n1. Buka https://game.skport.com/endfield/sign-in dan login\n2. Tekan F12 → Console\n3. Jalankan script getToken.js dari repo\n4. Copy nilai **SK_OAUTH_CRED_KEY**\n\n**Game UID** bisa dilihat di profil game kamu.`,
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
                    skOAuthCredKey,
                    gameId,
                    server,
                    accountName: nickname,
                },
            },
            $setOnInsert: {
                settings: { notifyOnClaim: true },
            },
        },
        { upsert: true, new: true }
    );

    const serverName = server === '2' ? 'Asia' : 'Americas/Europe';
    await interaction.editReply({
        content: `✅ **Endfield token saved successfully!**\n\n**Account**: ${nickname}\n**UID**: ${gameId}\n**Server**: ${serverName}\n\nYour daily rewards will be claimed automatically every day at 00:00 UTC+8.`,
    });
}
