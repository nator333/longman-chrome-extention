/**
 * Constants used throughout the extension
 */

export const FRAME_DIMENSIONS = {
  WIDTH: 450,
  HEIGHT: 300,
} as const;

export const API_ENDPOINTS = {
  PEARSON_DOMAIN: 'https://api.pearson.com',
  LONGMAN_DICTIONARY: 'https://www.ldoceonline.com/dictionary/',
} as const;

export const UI_CONSTANTS = {
  EXAMPLE_PREFIX: 'ex) ',
  TOP_ADJUSTMENT_PX: 12,
  ICON_OFFSET: 12,
  SELECTION_HEIGHT_OFFSET: 28,
} as const;

export const CSS_CLASSES = {
  LMD: 'lmd',
  LMD_ICON: 'lmd-icon',
  LMD_ICON_IMG: 'lmd-icon-img',
  LMD_BUBBLE: 'lmd-bubble',
  LMD_AUDIO_IMG: 'lmd-audio-img',
  LMD_CLOSE_BTN: 'lmd-close-btn',
  LMD_FOOTER: 'lmd-footer',
  LMD_A: 'lmd-a',
} as const;

export const STORAGE_KEYS = {
  IS_DISABLE: 'lmdIsDisable',
  SHOW_ICON_FIRST: 'lmdShowIconFirst',
  PRONUNCIATION: 'lmdPronunciation',
} as const;

export const ID_PREFIXES = {
  BUBBLE_DIV: 'lmd-bubble',
  CLOSE_BTN: 'lmd-close-btn',
} as const;