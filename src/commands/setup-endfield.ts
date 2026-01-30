import {
    SlashCommandBuilder,
    type ChatInputCommandInteraction,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    type ModalActionRowComponentBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('setup-endfield')
    .setDescription('Setup your SKPORT/Endfield token for auto daily claim');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const modal = new ModalBuilder()
        .setCustomId('setup-endfield-modal')
        .setTitle('Setup Endfield Token');

    const credInput = new TextInputBuilder()
        .setCustomId('endfield-cred')
        .setLabel('cred (from cookies)')
        .setPlaceholder('Copy from DevTools > Cookies > zonai.skport.com > cred')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMinLength(20);

    const skGameRoleInput = new TextInputBuilder()
        .setCustomId('endfield-sk-game-role')
        .setLabel('sk_game_role (from cookies)')
        .setPlaceholder('Format: 3_123456789_asia01 (from SK_GAME_ROLE cookie)')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMinLength(5);

    const nicknameInput = new TextInputBuilder()
        .setCustomId('endfield-nickname')
        .setLabel('Account Nickname (optional)')
        .setPlaceholder('Your nickname')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setMaxLength(50);

    const row1 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(credInput);
    const row2 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(skGameRoleInput);
    const row3 = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(nicknameInput);

    modal.addComponents(row1, row2, row3);

    await interaction.showModal(modal);
}
