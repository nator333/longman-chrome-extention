import React from 'react';
import { ProcessedDictionaryEntry, SynonymCollection } from '../types';
import { CSS_CLASSES } from '../constants';

interface DictionaryBubbleProps {
  entries: ProcessedDictionaryEntry[];
  synonymData: SynonymCollection;
  selectionText: string;
  onClose: () => void;
}

const DictionaryBubble: React.FC<DictionaryBubbleProps> = ({ 
  entries, 
  synonymData, 
  selectionText,
  onClose
}) => {
  const handleAudioPlay = (audioSrc: string) => {
    const audio = new Audio(audioSrc);
    audio.play().catch(error => console.error('Failed to play audio:', error));
  };

  return (
    <div className={`${CSS_CLASSES.LMD} ${CSS_CLASSES.LMD_BUBBLE}`}>
      <div className={`${CSS_CLASSES.LMD} ${CSS_CLASSES.LMD_CLOSE_BTN}`} onClick={onClose} />

      <div className={CSS_CLASSES.LMD} style={{ minWidth: '200px', maxWidth: '400px' }}>
        {/* Headword */}
        <div 
          className={CSS_CLASSES.LMD} 
          style={{ 
            fontSize: '30px', 
            fontWeight: 'bold', 
            color: 'blue' 
          }}
        >
          {selectionText}
        </div>

        <hr style={{ margin: '1px' }} />

        {/* Dictionary entries */}
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <React.Fragment key={`entry-${index}`}>
              {/* Part of speech */}
              {entry.partOfSpeech && (
                <div 
                  className={CSS_CLASSES.LMD} 
                  style={{ 
                    fontStyle: 'italic', 
                    display: 'inline-block', 
                    paddingRight: '15px' 
                  }}
                >
                  - {entry.partOfSpeech.charAt(0).toUpperCase() + entry.partOfSpeech.slice(1)}
                  {entry.grammaticalInfo && ` (${entry.grammaticalInfo})`}
                </div>
              )}

              {/* Audio button */}
              {entry.audio && (
                <div 
                  className={CSS_CLASSES.LMD} 
                  style={{ display: 'inline-block' }}
                  onClick={() => handleAudioPlay(entry.audio!)}
                >
                  <div className={`${CSS_CLASSES.LMD} ${CSS_CLASSES.LMD_AUDIO_IMG}`} />
                </div>
              )}

              {/* IPA pronunciation */}
              {entry.ipa && (
                <div className={CSS_CLASSES.LMD} style={{ display: 'inline-block' }}>
                  {entry.ipa}
                </div>
              )}

              {/* Definition */}
              {entry.definition && (
                <div 
                  className={CSS_CLASSES.LMD} 
                  style={{ 
                    paddingLeft: '15px', 
                    fontWeight: 'bold' 
                  }}
                  dangerouslySetInnerHTML={{ __html: entry.definition }}
                />
              )}

              {/* Example */}
              {entry.example && (
                <>
                  {entry.example.audio && (
                    <div 
                      className={CSS_CLASSES.LMD} 
                      style={{ 
                        display: 'inline-block', 
                        verticalAlign: 'top', 
                        paddingLeft: '15px' 
                      }}
                      onClick={() => entry.example?.audio && handleAudioPlay(entry.example.audio)}
                    >
                      <div className={`${CSS_CLASSES.LMD} ${CSS_CLASSES.LMD_AUDIO_IMG}`} />
                    </div>
                  )}
                  <div 
                    className={CSS_CLASSES.LMD} 
                    style={{ 
                      display: 'inline-block', 
                      color: 'blue', 
                      width: '360px' 
                    }}
                    dangerouslySetInnerHTML={{ __html: entry.example.text }}
                  />
                </>
              )}

              {/* Synonyms */}
              {(entry.synonym || (entry.partOfSpeech && synonymData[`synonyms-${entry.partOfSpeech.replace(/\s+/g, '')}`])) && (
                <div 
                  className={`${CSS_CLASSES.LMD} ${entry.partOfSpeech ? `synonyms-${entry.partOfSpeech.replace(/\s+/g, '')}` : ''}`}
                  style={{ 
                    fontStyle: 'italic', 
                    paddingLeft: '15px', 
                    color: '#6b6060' 
                  }}
                >
                  Synonyms: 
                  {entry.partOfSpeech && 
                   synonymData[`synonyms-${entry.partOfSpeech.replace(/\s+/g, '')}`] && 
                   synonymData[`synonyms-${entry.partOfSpeech.replace(/\s+/g, '')}`].map((synonym, i, arr) => (
                    <span 
                      key={`syn-${i}`} 
                      title={synonym.definition || ''}
                    >
                      {synonym.headword}{i < arr.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {entry.synonym && <div style={{ display: 'inline-block' }}>{entry.synonym}</div>}
                </div>
              )}

              {index < entries.length - 1 && <hr style={{ margin: '1px' }} />}
            </React.Fragment>
          ))
        ) : (
          <div className={CSS_CLASSES.LMD}>Not Found</div>
        )}

        {/* Footer */}
        <div className={`${CSS_CLASSES.LMD} ${CSS_CLASSES.LMD_FOOTER}`} style={{ paddingTop: '3px' }}>
          <a 
            className={`${CSS_CLASSES.LMD} ${CSS_CLASSES.LMD_A}`}
            href={`https://www.ldoceonline.com/dictionary/${selectionText}`}
            target="_blank"
            style={{ cursor: 'pointer' }}
            onFocus={(e) => e.currentTarget.blur()}
          >
            More &gt;&gt;
          </a>
        </div>
      </div>
    </div>
  );
};

export default DictionaryBubble;
