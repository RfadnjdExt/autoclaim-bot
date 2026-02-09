export interface KbbiResult {
    lemma: string;
    otherDetails: string[];
    synonyms?: { class: string; words: string[] }[];
    thesaurusUrl?: string;
    definitions: string[];
}
