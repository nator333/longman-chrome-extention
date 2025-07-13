import React from 'react';
import { createRoot } from 'react-dom/client';
import { ProcessedDictionaryEntry, SynonymCollection } from './types';
import { FRAME_DIMENSIONS, CSS_CLASSES, UI_CONSTANTS, STORAGE_KEYS } from './constants';
import { 
  cleanSelectedText, 
  isInputElement, 
  getWindowSelection, 
  logger
} from './utils';
import { DictionaryApiService } from './api-service';
import DictionaryBubble from './components/DictionaryBubble';
import DictionaryIcon from './components/DictionaryIcon';
import ErrorBubble from './components/ErrorBubble';
import './css/content.css';

class LongmanDictionaryExtension {
  private readonly documentBody: HTMLElement = document.body;
  private readonly documentElement: HTMLElement = document.documentElement;

  private iconContainer: HTMLDivElement | null = null;
  private bubbleContainer: HTMLDivElement | null = null;
  private iconRoot: any = null;
  private bubbleRoot: any = null;

  private isIconAdded: boolean = false;
  private selectionText: string = '';
  private selectionClientX: number = 0;
  private selectionBoundingClientRect: DOMRect | undefined = undefined;

  // Store bound event handler for proper removal
  private boundMouseUpHandler?: (event: MouseEvent) => Promise<void>;

  constructor() {
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
        // Store the bound handler for later removal
        this.boundMouseUpHandler = this.handleMouseUp.bind(this);
        this.documentBody.addEventListener('mouseup', this.boundMouseUpHandler, false);
        logger.debug('Extension initialized and event listeners attached');
      }
    } catch (error) {
      // Check if this is an extension context invalidated error
      if (chrome.runtime.lastError && 
          chrome.runtime.lastError.message === 'Extension context invalidated.') {
        this.handleExtensionContextInvalidated('initialization');
      } else {
        logger.error('Failed to initialize extension', error);
      }
    }
  }

  /**
   * Handle mouse up events for text selection
   */
  private async handleMouseUp(event: MouseEvent): Promise<void> {
    const target = event.target as HTMLElement;

    if (this.bubbleContainer && !target.classList.contains(CSS_CLASSES.LMD)) {
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
      // Check if this is an extension context invalidated error
      if (chrome.runtime.lastError && 
          chrome.runtime.lastError.message === 'Extension context invalidated.') {
        this.handleExtensionContextInvalidated('mouse up event');
      } else {
        logger.error('Failed to handle mouse up event', error);
      }
    }
  }

  /**
   * Close all open bubbles
   */
  private closeAllBubbles(): void {
    if (this.bubbleContainer && this.documentBody.contains(this.bubbleContainer)) {
      this.documentBody.removeChild(this.bubbleContainer);
      this.bubbleContainer = null;
      this.bubbleRoot = null;
    }
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

    if (mouseUpEvent.target === this.iconContainer) {
      return;
    }

    this.selectionText = cleanedText;
    this.selectionClientX = mouseUpEvent.clientX;
    this.selectionBoundingClientRect = selection.getRangeAt(0).getBoundingClientRect();

    // Create icon container if it doesn't exist
    if (!this.iconContainer) {
      this.iconContainer = document.createElement('div');
      this.iconContainer.style.position = 'absolute';
      this.iconContainer.style.zIndex = '999999999';
      this.documentBody.appendChild(this.iconContainer);
      this.iconRoot = createRoot(this.iconContainer);
    }

    // Position the icon
    const iconStyle = this.calculateIconPosition(mouseUpEvent);

    // Render the icon component
    this.iconRoot.render(
      <DictionaryIcon 
        onClick={this.handleIconClick.bind(this)} 
        style={iconStyle}
      />
    );

    this.isIconAdded = true;
    logger.debug('Icon displayed for word', { word: cleanedText });
  }

  /**
   * Calculate icon position
   */
  private calculateIconPosition(mouseUpEvent: MouseEvent): React.CSSProperties {
    if (!this.selectionBoundingClientRect) return {};

    const parentRect = (this.documentBody.parentNode as HTMLElement).getBoundingClientRect();
    let selectionHeightOffset = -1;

    if (Math.abs(mouseUpEvent.clientY - this.selectionBoundingClientRect.top) >
        this.selectionBoundingClientRect.bottom - mouseUpEvent.clientY) {
      selectionHeightOffset = this.selectionBoundingClientRect.height + UI_CONSTANTS.SELECTION_HEIGHT_OFFSET;
    }

    return {
      top: `${this.selectionBoundingClientRect.bottom - parentRect.top - selectionHeightOffset}px`,
      left: `${mouseUpEvent.clientX + this.documentElement.scrollLeft - UI_CONSTANTS.ICON_OFFSET}px`
    };
  }

  /**
   * Hide the icon
   */
  private hideIcon(): void {
    if (this.isIconAdded && this.iconContainer) {
      if (this.documentBody.contains(this.iconContainer)) {
        this.documentBody.removeChild(this.iconContainer);
      }
      this.iconContainer = null;
      this.iconRoot = null;
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
  private handleIconClick(event: React.MouseEvent): void {
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
      // Check if this is an extension context invalidated error
      if (chrome.runtime.lastError && 
          chrome.runtime.lastError.message === 'Extension context invalidated.') {
        this.handleExtensionContextInvalidated('dictionary data request');
      } else {
        logger.error('Failed to fetch dictionary data', error);
        this.displayErrorBubble();
      }
    }
  }

  /**
   * Display dictionary data in bubble
   */
  private displayDictionaryBubble(
    dataContent: ProcessedDictionaryEntry[], 
    synonymData: SynonymCollection
  ): void {
    // Create bubble container if it doesn't exist
    if (!this.bubbleContainer) {
      this.bubbleContainer = document.createElement('div');
      this.bubbleContainer.style.position = 'absolute';
      this.bubbleContainer.style.zIndex = '999999999';
      this.bubbleContainer.style.width = `${FRAME_DIMENSIONS.WIDTH}px`;
      this.bubbleContainer.style.height = `${FRAME_DIMENSIONS.HEIGHT}px`;
      this.bubbleContainer.style.visibility = 'visible';
      this.bubbleContainer.style.opacity = '0';
      this.documentBody.appendChild(this.bubbleContainer);
      this.bubbleRoot = createRoot(this.bubbleContainer);
    }

    // Render the dictionary bubble component
    this.bubbleRoot.render(
      <DictionaryBubble 
        entries={dataContent} 
        synonymData={synonymData} 
        selectionText={this.selectionText}
        onClose={this.closeAllBubbles.bind(this)}
      />
    );

    // Position bubble after rendering
    setTimeout(() => this.positionBubble(), 50);
  }

  /**
   * Display error bubble
   */
  private displayErrorBubble(): void {
    // Create bubble container if it doesn't exist
    if (!this.bubbleContainer) {
      this.bubbleContainer = document.createElement('div');
      this.bubbleContainer.style.position = 'absolute';
      this.bubbleContainer.style.zIndex = '999999999';
      this.bubbleContainer.style.width = `${FRAME_DIMENSIONS.WIDTH}px`;
      this.bubbleContainer.style.height = `${FRAME_DIMENSIONS.HEIGHT}px`;
      this.bubbleContainer.style.visibility = 'visible';
      this.bubbleContainer.style.opacity = '0';
      this.documentBody.appendChild(this.bubbleContainer);
      this.bubbleRoot = createRoot(this.bubbleContainer);
    }

    // Render the error bubble component
    this.bubbleRoot.render(
      <ErrorBubble 
        selectionText={this.selectionText}
        onClose={this.closeAllBubbles.bind(this)}
      />
    );

    // Position bubble after rendering
    setTimeout(() => this.positionBubble(), 50);
  }

  /**
   * Position the bubble
   */
  private positionBubble(): void {
    if (!this.bubbleContainer || !this.selectionBoundingClientRect) return;

    const frameVerticalCenter = this.bubbleContainer.getBoundingClientRect().width / 2;
    let leftPosition = 0;
    let positionModifyClass = '';

    // Horizontal positioning
    if (this.selectionClientX + frameVerticalCenter > this.documentBody.clientWidth) {
      positionModifyClass = 'right-';
      leftPosition = this.selectionBoundingClientRect.right - this.bubbleContainer.getBoundingClientRect().width;
    } else if (frameVerticalCenter > this.selectionClientX) {
      leftPosition = this.selectionBoundingClientRect.left;
      positionModifyClass = 'left-';
    } else {
      leftPosition = this.selectionClientX + this.documentElement.scrollLeft - frameVerticalCenter;
    }

    this.bubbleContainer.style.left = `${leftPosition}px`;

    // Vertical positioning
    let topPosition = 0;
    if (this.selectionBoundingClientRect.top < this.bubbleContainer.getBoundingClientRect().height + UI_CONSTANTS.TOP_ADJUSTMENT_PX) {
      topPosition = this.documentElement.scrollTop + this.selectionBoundingClientRect.bottom + UI_CONSTANTS.TOP_ADJUSTMENT_PX;
      this.bubbleContainer.className = `lower-${positionModifyClass}arrow`;
    } else {
      topPosition = this.documentElement.scrollTop + this.selectionBoundingClientRect.top -
        (this.bubbleContainer.getBoundingClientRect().height + UI_CONSTANTS.TOP_ADJUSTMENT_PX);
      this.bubbleContainer.className = `upper-${positionModifyClass}arrow`;
    }

    this.bubbleContainer.style.top = `${topPosition}px`;
    this.bubbleContainer.style.opacity = '1';

    logger.debug('Bubble positioned', { position: { left: leftPosition, top: topPosition } });
  }

  /**
   * Handle extension context invalidation
   * @param context The context where the error occurred
   */
  private handleExtensionContextInvalidated(context: string): void {
    logger.error(`Extension context invalidated during ${context}`);
    // Remove the event listener to prevent further errors
    if (this.boundMouseUpHandler) {
      this.documentBody.removeEventListener('mouseup', this.boundMouseUpHandler, false);
    }
    // Clean up any UI elements
    this.closeAllBubbles();
    this.hideIcon();
  }
}

// Initialize the extension
new LongmanDictionaryExtension();
