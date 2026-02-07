/**
 * Best Release Types
 * Type definitions for the Best Release command
 */

export interface AnimeRelease {
    id: number;
    name: string;
    anime_id: number;
    created_at: string;
    description: string | null;
    download_links: string[] | null;
}

export interface AnimeEntry {
    id: number;
    mal_id: number;
    title: string;
    title_english: string | null;
    title_japanese: string | null;
    image_url: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    releases: AnimeRelease[];
    alternatives: unknown[];
    unmuxed: unknown[];
    comparisons: unknown[];
}
