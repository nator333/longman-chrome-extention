// Type definitions for Longman Dictionary Extension

export interface StorageResult {
  lmdIsDisable?: boolean;
  lmdShowIconFirst?: boolean;
  lmdPronunciation?: string;
}

export interface AudioItem {
  lang: string;
  url: string;
}

export interface PronunciationItem {
  lang?: string;
  ipa?: string;
  audio?: AudioItem[];
}

export interface ExampleItem {
  text: string;
  audio?: AudioItem[];
}

export interface SenseItem {
  definition?: string[];
  examples?: ExampleItem[];
  grammatical_info?: {
    type: string;
  };
  synonym?: string;
}

export interface DictionaryApiResult {
  headword: string;
  part_of_speech?: string;
  pronunciations?: PronunciationItem[];
  senses?: SenseItem[];
}

export interface DictionaryApiResponse {
  total: number;
  results: DictionaryApiResult[];
}

export interface ProcessedDictionaryEntry {
  headword: string;
  partOfSpeech?: string;
  ipa?: string;
  audio?: string;
  definition?: string;
  example?: {
    text: string;
    audio?: string;
  };
  grammaticalInfo?: string;
  synonym?: string;
  url: string;
}

export interface ProcessedSynonymEntry {
  headword: string;
  definition?: string;
}

export interface SynonymCollection {
  [key: string]: ProcessedSynonymEntry[];
}
