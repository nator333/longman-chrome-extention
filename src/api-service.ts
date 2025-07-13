/**
 * API service for dictionary lookups
 */

import { DictionaryApiResponse, ProcessedDictionaryEntry, SynonymCollection } from './types.js';
import { API_ENDPOINTS } from './constants.js';
import { logger } from './utils.js';

export class DictionaryApiService {
  private static readonly MAIN_API_ENDPOINT = `${API_ENDPOINTS.PEARSON_DOMAIN}/v2/dictionaries/ldoce5/entries`;
  private static readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  /**
   * Fetch dictionary data for a word
   */
  static async fetchMainDictionary(word: string): Promise<ProcessedDictionaryEntry[]> {
    try {
      const url = `${this.MAIN_API_ENDPOINT}?limit=5&headword=${encodeURIComponent(word)}`;
      logger.debug('Fetching main dictionary data', { word, url });

      const response = await this.makeRequest(url);
      const data: DictionaryApiResponse = await response.json();
      
      return this.processMainApiResponse(data, word);
    } catch (error) {
      logger.error('Failed to fetch main dictionary data', error);
      throw new Error(`Dictionary lookup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fetch synonym data for a word
   */
  static async fetchSynonyms(word: string): Promise<SynonymCollection> {
    try {
      const url = `${this.MAIN_API_ENDPOINT}?limit=5&synonyms=${encodeURIComponent(word)}`;
      logger.debug('Fetching synonym data', { word, url });

      const response = await this.makeRequest(url);
      const data: DictionaryApiResponse = await response.json();
      
      return this.processSynonymApiResponse(data, word);
    } catch (error) {
      logger.error('Failed to fetch synonym data', error);
      // Return empty object instead of throwing for synonyms
      return {};
    }
  }

  /**
   * Make HTTP request with timeout
   */
  private static async makeRequest(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Process main API response into structured data
   */
  private static processMainApiResponse(
    responseJson: DictionaryApiResponse, 
    searchWord: string
  ): ProcessedDictionaryEntry[] {
    const results: ProcessedDictionaryEntry[] = [];
    
    if (!responseJson.total || responseJson.total === 0) {
      logger.debug('No results found for word', { searchWord });
      return results;
    }

    for (const jsonObj of responseJson.results) {
      if (searchWord !== jsonObj.headword) {
        continue;
      }

      const processed: ProcessedDictionaryEntry = {
        headword: jsonObj.headword,
        url: `${API_ENDPOINTS.LONGMAN_DICTIONARY}${jsonObj.headword}`,
      };

      // Process part of speech
      if (jsonObj.part_of_speech) {
        processed.partOfSpeech = jsonObj.part_of_speech;
      }

      // Process pronunciations
      if (jsonObj.pronunciations) {
        const pronunciation = this.extractAmericanPronunciation(jsonObj.pronunciations);
        if (pronunciation) {
          processed.ipa = pronunciation.ipa;
          processed.audio = pronunciation.audio;
        }
      }

      // Process senses (definitions, examples, etc.)
      if (jsonObj.senses && jsonObj.senses[0]) {
        const senseData = this.extractSenseData(jsonObj.senses[0]);
        Object.assign(processed, senseData);
      }

      results.push(processed);
    }

    logger.debug('Processed main API response', { searchWord, resultCount: results.length });
    return results;
  }

  /**
   * Extract American English pronunciation data
   */
  private static extractAmericanPronunciation(pronunciations: any[]): { ipa?: string; audio?: string } | null {
    // Handle single pronunciation with multiple audio options
    if (pronunciations.length === 1 && pronunciations[0].audio) {
      for (const audioItem of pronunciations[0].audio) {
        if (audioItem.lang === 'American English') {
          return {
            ipa: pronunciations[0].ipa,
            audio: `${API_ENDPOINTS.PEARSON_DOMAIN}${audioItem.url}`,
          };
        }
      }
    }

    // Handle multiple pronunciations with language-specific data
    for (const pronunciation of pronunciations) {
      if (pronunciation.lang === 'American English' && pronunciation.ipa) {
        let audioUrl: string | undefined;
        if (pronunciation.audio && pronunciation.audio.length > 0) {
          audioUrl = `${API_ENDPOINTS.PEARSON_DOMAIN}${pronunciation.audio[0].url}`;
        }
        return {
          ipa: pronunciation.ipa,
          audio: audioUrl,
        };
      }
    }

    return null;
  }

  /**
   * Extract sense data (definitions, examples, etc.)
   */
  private static extractSenseData(sense: any): Partial<ProcessedDictionaryEntry> {
    const result: Partial<ProcessedDictionaryEntry> = {};

    for (const [key, value] of Object.entries(sense)) {
      if (Array.isArray(value)) {
        if (typeof value[0] === 'object' && value[0] !== null && 'text' in value[0]) {
          // Example
          result.example = {
            text: `ex) ${value[0].text}`,
            audio: value[0].audio ? `${API_ENDPOINTS.PEARSON_DOMAIN}${value[0].audio[0].url}` : undefined,
          };
        } else if (typeof value[0] === 'string') {
          // Definition
          result.definition = value[0] as string;
        }
      } else if (typeof value === 'object' && value !== null && 'type' in value) {
        // Grammatical info
        result.grammaticalInfo = (value as any).type;
      } else if (key === 'synonym' && typeof value === 'string') {
        // Synonym
        result.synonym = value;
      }
    }

    return result;
  }

  /**
   * Process synonym API response
   */
  private static processSynonymApiResponse(
    responseJson: DictionaryApiResponse, 
    searchWord: string
  ): SynonymCollection {
    const synonyms: SynonymCollection = {};

    if (!responseJson.total || responseJson.total === 0) {
      return synonyms;
    }

    for (const synonymJson of responseJson.results) {
      if (!synonymJson.part_of_speech || !synonymJson.headword || searchWord === synonymJson.headword) {
        continue;
      }

      const classStr = `synonyms-${synonymJson.part_of_speech.replace(/\s+/g, '')}`;
      if (!synonyms[classStr]) {
        synonyms[classStr] = [];
      }

      const processedSynonym = {
        headword: synonymJson.headword,
        definition: this.extractDefinitionFromSense(synonymJson.senses),
      };

      synonyms[classStr].push(processedSynonym);
    }

    logger.debug('Processed synonym API response', { searchWord, synonymCount: Object.keys(synonyms).length });
    return synonyms;
  }

  /**
   * Extract definition from sense data
   */
  private static extractDefinitionFromSense(senses: any[] | undefined): string | undefined {
    if (!senses || !Array.isArray(senses) || !senses[0]) {
      return undefined;
    }

    const sense = senses[0];
    for (const value of Object.values(sense)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return value[0];
      }
    }

    return undefined;
  }
}