export interface JishoJapanese {
    word?: string;
    reading?: string;
}

export interface JishoSense {
    english_definitions: string[];
    parts_of_speech: string[];
    links: {
        text: string;
        url: string;
    }[];
    tags: string[];
    restrictions: string[];
    see_also: string[];
    antonyms: string[];
    source: string[];
    info: string[];
}

export interface JishoAttribution {
    jmdict: boolean;
    jmnedict: boolean;
    dbpedia: boolean | string;
}

export interface JishoResult {
    slug: string;
    is_common?: boolean;
    tags: string[];
    jlpt: string[];
    japanese: JishoJapanese[];
    senses: JishoSense[];
    attribution: JishoAttribution;
}

export interface JishoAPIResponse {
    meta: {
        status: number;
    };
    data: JishoResult[];
}

export interface JishoWord {
    slug: string;
    word: string;
    reading?: string;
    meanings: {
        parts: string[];
        definitions: string[];
        tags: string[];
        info: string[];
        seeAlso: string[];
    }[];
    otherForms: {
        word: string;
        reading?: string;
    }[];
    isCommon: boolean;
    jlpt: string[];
    tags: string[];
    url: string;
}
