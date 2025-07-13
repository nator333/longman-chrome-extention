import React from 'react';
import { CSS_CLASSES } from '../constants';

interface ErrorBubbleProps {
  selectionText: string;
  onClose: () => void;
}

const ErrorBubble: React.FC<ErrorBubbleProps> = ({ selectionText, onClose }) => {
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
        
        {/* Error message */}
        <div className={CSS_CLASSES.LMD} style={{ color: 'red' }}>
          Failed to load dictionary data. Please try again.
        </div>
        
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

export default ErrorBubble;