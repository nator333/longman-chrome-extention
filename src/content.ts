import { ProcessedDictionaryEntry, SynonymCollection } from './types';
import { FRAME_DIMENSIONS, CSS_CLASSES, UI_CONSTANTS, STORAGE_KEYS, ID_PREFIXES } from './constants';
import { 
  cleanSelectedText, 
  isInputElement, 
  getWindowSelection, 
  createElement, 
  safeRemoveElement,
  logger,
  isHTMLElement 
} from './utils';
import { DictionaryApiService } from './api-service';

class LongmanDictionaryExtension {
  private readonly documentBody: HTMLElement = document.body;
  private readonly documentElement: HTMLElement = document.documentElement;
  private readonly iconDiv: HTMLDivElement;
  private readonly imageDiv: HTMLDivElement;
  private readonly bubbleDivs: HTMLDivElement[] = [];

  private isIconAdded: boolean = false;
  private bubbleDiv: HTMLDivElement | undefined = undefined;
  private selectionText: string = '';
  private selectionClientX: number = 0;
  private selectionBoundingClientRect: DOMRect | undefined = undefined;

  constructor() {
    this.iconDiv = createElement('div', [CSS_CLASSES.LMD_ICON]);
    this.imageDiv = createElement('div', [CSS_CLASSES.LMD_ICON_IMG]);
    this.iconDiv.appendChild(this.imageDiv);

    this.initialize();
  }

  /**
   * Initialize the extension
   */
  private async initialize(): Promise<void> {
    try {
      const result = await chrome.storage.local.get([STORAGE_KEYS.IS_DISABLE]);

      if (this.documentElement.lang && !this.documentElement.lang.includes('en')) {
        logger.debug('Page language is not English, extension disabled');
        return;
      }

      if (!result[STORAGE_KEYS.IS_DISABLE]) {
        this.documentBody.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
        logger.debug('Extension initialized and event listeners attached');
      }
    } catch (error) {
      logger.error('Failed to initialize extension', error);
    }
  }

  /**
   * Handle mouse up events for text selection
   */
  private async handleMouseUp(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;

    if (this.bubbleDiv && !target.classList.contains(CSS_CLASSES.LMD)) {
      this.closeAllBubbles();
      return;
    }

    if (isInputElement(target)) {
      return;
    }

    try {
      const result = await chrome.storage.local.get([STORAGE_KEYS.SHOW_ICON_FIRST]);

      if (result[STORAGE_KEYS.SHOW_ICON_FIRST]) {
        setTimeout(() => this.displayIcon(event), 10);
      } else {
        setTimeout(() => this.displayBubble(event), 10);
      }
    } catch (error) {
      logger.error('Failed to handle mouse up event', error);
    }
  }

  /**
   * Close all open bubbles
   */
  private closeAllBubbles(): void {
    this.bubbleDivs.forEach((bubble) => {
      safeRemoveElement(bubble, this.documentBody);
    });
    this.bubbleDivs.length = 0;
    this.bubbleDiv = undefined;
  }

  /**
   * Display icon for word lookup
   */
  private displayIcon(mouseUpEvent: MouseEvent): void {
    const selection = getWindowSelection();
    if (!selection) return;

    const cleanedText = cleanSelectedText(selection.toString());
    if (!cleanedText) {
      this.hideIcon();
      return;
    }

    if (mouseUpEvent.target === this.iconDiv) {
      return;
    }

    this.selectionText = cleanedText;
    this.selectionClientX = mouseUpEvent.clientX;
    this.selectionBoundingClientRect = selection.getRangeAt(0).getBoundingClientRect();

    this.positionIcon(mouseUpEvent);
    this.iconDiv.addEventListener('click', this.handleIconClick.bind(this), false);

    this.documentBody.appendChild(this.iconDiv);
    this.isIconAdded = true;

    logger.debug('Icon displayed for word', { word: cleanedText });
  }

  /**
   * Position the icon relative to the selection
   */
  private positionIcon(mouseUpEvent: MouseEvent): void {
    if (!this.selectionBoundingClientRect) return;

    const parentRect = (this.documentBody.parentNode as HTMLElement).getBoundingClientRect();
    let selectionHeightOffset = -1;

    if (Math.abs(mouseUpEvent.clientY - this.selectionBoundingClientRect.top) >
        this.selectionBoundingClientRect.bottom - mouseUpEvent.clientY) {
      selectionHeightOffset = this.selectionBoundingClientRect.height + UI_CONSTANTS.SELECTION_HEIGHT_OFFSET;
    }

    this.iconDiv.style.top = 
      `${this.selectionBoundingClientRect.bottom - parentRect.top - selectionHeightOffset}px`;
    this.iconDiv.style.left = 
      `${mouseUpEvent.clientX + this.documentElement.scrollLeft - UI_CONSTANTS.ICON_OFFSET}px`;
  }

  /**
   * Hide the icon
   */
  private hideIcon(): void {
    if (this.isIconAdded) {
      safeRemoveElement(this.iconDiv, this.documentBody);
      this.isIconAdded = false;
    }
  }

  /**
   * Display bubble immediately
   */
  private displayBubble(mouseUpEvent: MouseEvent): void {
    const selection = getWindowSelection();
    if (!selection) return;

    const cleanedText = cleanSelectedText(selection.toString());
    if (!cleanedText || cleanedText.includes(' ')) {
      return;
    }

    this.selectionText = cleanedText;
    this.selectionClientX = mouseUpEvent.clientX;
    this.selectionBoundingClientRect = selection.getRangeAt(0).getBoundingClientRect();

    this.requestDictionaryData();
  }

  /**
   * Handle icon click events
   */
  private handleIconClick(event: Event): void {
    this.hideIcon();
    event.stopPropagation();
    event.preventDefault();
    this.requestDictionaryData();
  }

  /**
   * Request dictionary data from API
   */
  private async requestDictionaryData(): Promise<void> {
    try {
      logger.debug('Requesting dictionary data', { word: this.selectionText });

      const [mainData, synonymData] = await Promise.allSettled([
        DictionaryApiService.fetchMainDictionary(this.selectionText),
        DictionaryApiService.fetchSynonyms(this.selectionText)
      ]);

      const processedMainData = mainData.status === 'fulfilled' ? mainData.value : [];
      const processedSynonymData = synonymData.status === 'fulfilled' ? synonymData.value : {};

      this.displayDictionaryBubble(processedMainData, processedSynonymData);
    } catch (error) {
      logger.error('Failed to fetch dictionary data', error);
      this.displayErrorBubble();
    }
  }

  /**
   * Display dictionary data in bubble
   */
  private displayDictionaryBubble(
    dataContent: ProcessedDictionaryEntry[], 
    synonymData: SynonymCollection
  ): void {
    this.bubbleDiv = this.createBubbleContainer();
    const containerDiv = this.createContentContainer();

    // Add headword
    this.addHeadword(containerDiv);

    if (dataContent.length > 0) {
      this.addDictionaryEntries(containerDiv, dataContent, synonymData);
    } else {
      this.addNotFoundMessage(containerDiv);
    }

    // Add footer
    this.addFooter(containerDiv);

    this.bubbleDiv.appendChild(containerDiv);
    this.documentBody.appendChild(this.bubbleDiv);

    // Position bubble after adding to DOM
    setTimeout(() => this.positionBubble(), 50);
  }

  /**
   * Display error bubble
   */
  private displayErrorBubble(): void {
    this.bubbleDiv = this.createBubbleContainer();
    const containerDiv = this.createContentContainer();

    this.addHeadword(containerDiv);

    const errorDiv = createElement('div', [CSS_CLASSES.LMD]);
    errorDiv.innerHTML = 'Failed to load dictionary data. Please try again.';
    errorDiv.style.color = 'red';
    containerDiv.appendChild(errorDiv);

    this.addFooter(containerDiv);

    this.bubbleDiv.appendChild(containerDiv);
    this.documentBody.appendChild(this.bubbleDiv);

    setTimeout(() => this.positionBubble(), 50);
  }

  /**
   * Create bubble container
   */
  private createBubbleContainer(): HTMLDivElement {
    const bubble = createElement('div', [CSS_CLASSES.LMD, CSS_CLASSES.LMD_BUBBLE]);
    this.bubbleDivs.push(bubble);

    bubble.id = `${ID_PREFIXES.BUBBLE_DIV}-${this.bubbleDivs.length}`;
    bubble.style.width = `${FRAME_DIMENSIONS.WIDTH}px`;
    bubble.style.height = `${FRAME_DIMENSIONS.HEIGHT}px`;
    bubble.style.cssText += 'z-index: 999999999 !important;';
    bubble.style.position = 'absolute';
    bubble.style.visibility = 'visible';
    bubble.style.opacity = '0';

    this.addCloseButton(bubble);
    return bubble;
  }

  /**
   * Add close button to bubble
   */
  private addCloseButton(bubble: HTMLDivElement): void {
    const closeBtn = createElement('div', [CSS_CLASSES.LMD, CSS_CLASSES.LMD_CLOSE_BTN]);
    closeBtn.id = `${ID_PREFIXES.CLOSE_BTN}-${this.bubbleDivs.length}`;

    closeBtn.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const bubbleId = `${ID_PREFIXES.BUBBLE_DIV}${target.id.replace(ID_PREFIXES.CLOSE_BTN, '')}`;

      this.bubbleDivs.forEach((bubbleElement) => {
        if (bubbleElement.id === bubbleId) {
          safeRemoveElement(bubbleElement, this.documentBody);
          this.bubbleDiv = undefined;
        }
      });
    }, false);

    bubble.appendChild(closeBtn);
  }

  /**
   * Create content container
   */
  private createContentContainer(): HTMLDivElement {
    const container = createElement('div', [CSS_CLASSES.LMD]);
    container.style.minWidth = '200px';
    container.style.maxWidth = '400px';
    return container;
  }

  /**
   * Add headword to container
   */
  private addHeadword(container: HTMLDivElement): void {
    const headwordDiv = createElement('div', [CSS_CLASSES.LMD]);
    headwordDiv.innerHTML = this.selectionText;
    headwordDiv.style.cssText += 'font-size: 30px !important;';
    headwordDiv.style.fontWeight = 'bold';
    headwordDiv.style.color = 'blue';
    container.appendChild(headwordDiv);

    const hr = createElement('hr');
    hr.style.margin = '1px';
    container.appendChild(hr);
  }

  /**
   * Add dictionary entries to container
   */
  private addDictionaryEntries(
    container: HTMLDivElement, 
    entries: ProcessedDictionaryEntry[],
    synonymData: SynonymCollection
  ): void {
    entries.forEach((entry, index) => {
      if (entry.partOfSpeech) {
        this.addPartOfSpeech(container, entry);
      }

      if (entry.audio) {
        this.addAudioButton(container, entry.audio);
      }

      if (entry.ipa) {
        this.addIPA(container, entry.ipa);
      }

      if (entry.definition) {
        this.addDefinition(container, entry.definition);
      }

      if (entry.example) {
        this.addExample(container, entry.example);
      }

      this.addSynonyms(container, entry, synonymData);

      if (index < entries.length - 1) {
        const hr = createElement('hr');
        hr.style.margin = '1px';
        container.appendChild(hr);
      }
    });
  }

  /**
   * Add part of speech
   */
  private addPartOfSpeech(container: HTMLDivElement, entry: ProcessedDictionaryEntry): void {
    const posDiv = createElement('div', [CSS_CLASSES.LMD]);
    const posStr = entry.partOfSpeech!;
    posDiv.innerHTML = `- ${posStr.charAt(0).toUpperCase()}${posStr.slice(1)}`;

    if (entry.grammaticalInfo) {
      posDiv.innerHTML += ` (${entry.grammaticalInfo})`;
    }

    posDiv.style.fontStyle = 'italic';
    posDiv.style.display = 'inline-block';
    posDiv.style.paddingRight = '15px';
    container.appendChild(posDiv);
  }

  /**
   * Add audio button
   */
  private addAudioButton(container: HTMLDivElement, audioSrc: string): void {
    const audio = createElement('audio', [CSS_CLASSES.LMD]);
    audio.src = audioSrc;
    audio.preload = 'auto';

    const audioBtnDiv = createElement('div', [CSS_CLASSES.LMD]);
    audioBtnDiv.style.display = 'inline-block';
    audioBtnDiv.addEventListener('click', () => audio.play().catch(logger.error), false);

    const audioImgDiv = createElement('div', [CSS_CLASSES.LMD, CSS_CLASSES.LMD_AUDIO_IMG]);
    audioBtnDiv.appendChild(audioImgDiv);
    container.appendChild(audioBtnDiv);
  }

  /**
   * Add IPA pronunciation
   */
  private addIPA(container: HTMLDivElement, ipa: string): void {
    const ipaDiv = createElement('div', [CSS_CLASSES.LMD]);
    ipaDiv.style.display = 'inline-block';
    ipaDiv.innerHTML = ipa;
    container.appendChild(ipaDiv);
  }

  /**
   * Add definition
   */
  private addDefinition(container: HTMLDivElement, definition: string): void {
    const definitionDiv = createElement('div', [CSS_CLASSES.LMD]);
    definitionDiv.innerHTML = definition;
    definitionDiv.style.paddingLeft = '15px';
    definitionDiv.style.fontWeight = 'bold';
    container.appendChild(definitionDiv);
  }

  /**
   * Add example
   */
  private addExample(
    container: HTMLDivElement, 
    example: { text: string; audio?: string }
  ): void {
    if (example.audio) {
      const exampleAudio = createElement('audio', [CSS_CLASSES.LMD]);
      exampleAudio.src = example.audio;
      exampleAudio.preload = 'auto';

      const exampleAudioBtn = createElement('div', [CSS_CLASSES.LMD]);
      exampleAudioBtn.style.display = 'inline-block';
      exampleAudioBtn.style.verticalAlign = 'top';
      exampleAudioBtn.style.paddingLeft = '15px';
      exampleAudioBtn.onclick = () => exampleAudio.play().catch(logger.error);

      const exampleAudioImg = createElement('div', [CSS_CLASSES.LMD, CSS_CLASSES.LMD_AUDIO_IMG]);
      exampleAudioBtn.appendChild(exampleAudioImg);
      container.appendChild(exampleAudioBtn);
    }

    const exampleText = createElement('div', [CSS_CLASSES.LMD]);
    exampleText.innerHTML = example.text;
    exampleText.style.display = 'inline-block';
    exampleText.style.color = 'blue';
    exampleText.style.width = '360px';
    container.appendChild(exampleText);
  }

  /**
   * Add synonyms section
   */
  private addSynonyms(
    container: HTMLDivElement, 
    entry: ProcessedDictionaryEntry,
    synonymData: SynonymCollection
  ): void {
    const synonymsDiv = createElement('div', [CSS_CLASSES.LMD]);
    synonymsDiv.innerHTML = 'Synonyms: ';

    if (entry.partOfSpeech) {
      const synonymClass = `synonyms-${entry.partOfSpeech.replace(/\s+/g, '')}`;
      synonymsDiv.classList.add(synonymClass);

      // Add synonyms from API data
      if (synonymData[synonymClass] && synonymData[synonymClass].length > 0) {
        synonymData[synonymClass].forEach((synonym: any, index: number) => {
          const synonymSpan = createElement('span');
          synonymSpan.innerHTML = synonym.headword;
          if (synonym.definition) {
            synonymSpan.title = synonym.definition;
          }
          synonymsDiv.appendChild(synonymSpan);

          if (index < synonymData[synonymClass].length - 1) {
            synonymsDiv.appendChild(document.createTextNode(', '));
          }
        });
      }
    }

    synonymsDiv.style.fontStyle = 'italic';
    synonymsDiv.style.paddingLeft = '15px';
    synonymsDiv.style.color = '#6b6060';
    synonymsDiv.style.display = entry.synonym || synonymData[`synonyms-${entry.partOfSpeech?.replace(/\s+/g, '') || ''}`] ? '' : 'none';

    if (entry.synonym) {
      const synonymDiv = createElement('div');
      synonymDiv.style.display = 'inline-block';
      synonymDiv.innerHTML = entry.synonym;
      synonymsDiv.appendChild(synonymDiv);
    }

    container.appendChild(synonymsDiv);
  }

  /**
   * Add not found message
   */
  private addNotFoundMessage(container: HTMLDivElement): void {
    const notFoundDiv = createElement('div', [CSS_CLASSES.LMD]);
    notFoundDiv.innerHTML = 'Not Found';
    container.appendChild(notFoundDiv);
  }

  /**
   * Add footer with link
   */
  private addFooter(container: HTMLDivElement): void {
    const footerDiv = createElement('div', [CSS_CLASSES.LMD, CSS_CLASSES.LMD_FOOTER]);
    footerDiv.style.paddingTop = '3px';

    const moreLink = createElement('a', [CSS_CLASSES.LMD, CSS_CLASSES.LMD_A]);
    moreLink.href = `https://www.ldoceonline.com/dictionary/${this.selectionText}`;
    moreLink.innerHTML = 'More >>';
    moreLink.target = '_blank';
    moreLink.style.cursor = 'pointer';
    moreLink.addEventListener('focus', (event) => {
      if (isHTMLElement(event.target)) {
        event.target.blur();
      }
    }, false);

    footerDiv.appendChild(moreLink);
    container.appendChild(footerDiv);
  }

  /**
   * Position the bubble
   */
  private positionBubble(): void {
    if (!this.bubbleDiv || !this.selectionBoundingClientRect) return;

    const frameVerticalCenter = this.bubbleDiv.getBoundingClientRect().width / 2;
    let leftPosition = 0;
    let positionModifyClass = '';

    // Horizontal positioning
    if (this.selectionClientX + frameVerticalCenter > this.documentBody.clientWidth) {
      positionModifyClass = 'right-';
      leftPosition = this.selectionBoundingClientRect.right - this.bubbleDiv.getBoundingClientRect().width;
    } else if (frameVerticalCenter > this.selectionClientX) {
      leftPosition = this.selectionBoundingClientRect.left;
      positionModifyClass = 'left-';
    } else {
      leftPosition = this.selectionClientX + this.documentElement.scrollLeft - frameVerticalCenter;
    }

    this.bubbleDiv.style.left = `${leftPosition}px`;

    // Vertical positioning
    let topPosition = 0;
    if (this.selectionBoundingClientRect.top < this.bubbleDiv.getBoundingClientRect().height + UI_CONSTANTS.TOP_ADJUSTMENT_PX) {
      topPosition = this.documentElement.scrollTop + this.selectionBoundingClientRect.bottom + UI_CONSTANTS.TOP_ADJUSTMENT_PX;
      this.bubbleDiv.classList.add(`lower-${positionModifyClass}arrow`);
    } else {
      topPosition = this.documentElement.scrollTop + this.selectionBoundingClientRect.top -
        (this.bubbleDiv.getBoundingClientRect().height + UI_CONSTANTS.TOP_ADJUSTMENT_PX);
      this.bubbleDiv.classList.add(`upper-${positionModifyClass}arrow`);
    }

    this.bubbleDiv.style.top = `${topPosition}px`;
    this.bubbleDiv.style.opacity = '1';

    logger.debug('Bubble positioned', { position: { left: leftPosition, top: topPosition } });
  }
}

// Initialize the extension
new LongmanDictionaryExtension();
