/**
 * Unified error handling utilities for Discord interactions
 */

import { type Interaction, MessageFlags } from "discord.js";

/**
 * Handle interaction errors uniformly
 * Sends appropriate error response based on interaction state
 */
export async function handleInteractionError(
    interaction: Interaction,
    error: unknown,
    customMessage?: string
): Promise<void> {
    const message = customMessage || "❌ An error occurred while processing your request.";

    console.error(`[Error] Interaction ${interaction.id}:`, error);

    if (!interaction.isRepliable()) return;

    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: message,
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: message,
                flags: MessageFlags.Ephemeral
            });
        }
    } catch (sendError) {
        console.error("[Error] Failed to send error response:", sendError);
    }
}

/**
 * Safe wrapper for async interaction handlers
 * Catches errors and sends appropriate responses
 */
export function withErrorHandler<T extends Interaction>(
    handler: (interaction: T) => Promise<void>,
    errorMessage?: string
): (interaction: T) => Promise<void> {
    return async (interaction: T) => {
        try {
            await handler(interaction);
        } catch (error) {
            await handleInteractionError(interaction, error, errorMessage);
        }
    };
}

/**
 * Format error for logging
 */
export function formatError(error: unknown): string {
    if (error instanceof Error) {
        return `${error.name}: ${error.message}`;
    }
    return String(error);
}
