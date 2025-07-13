import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './css/option.css';
import { StorageResult } from './types';

const OptionsApp: React.FC = () => {
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [showIconFirst, setShowIconFirst] = useState<boolean>(true);

  // Load settings from Chrome storage when component mounts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load disable setting
        const disableResult = await chrome.storage.local.get(['lmdIsDisable']) as StorageResult;
        setIsDisabled(disableResult.lmdIsDisable || false);

        // Load show icon first setting
        const iconResult = await chrome.storage.local.get(['lmdShowIconFirst']) as StorageResult;
        setShowIconFirst(iconResult.lmdShowIconFirst !== false); // Default to true if not set
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Handle disable checkbox change
  const handleDisableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setIsDisabled(isChecked);
    chrome.storage.local.set({ lmdIsDisable: isChecked });
  };

  // Handle radio button change
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const isIconFirst = value === "1";

    setShowIconFirst(isIconFirst);
    chrome.storage.local.set({ lmdIsDisable: false });
    chrome.storage.local.set({ lmdShowIconFirst: isIconFirst });
  };

  return (
    <div className="lmd-option-content">
      <h1>
        <div id="options-title-heading">Longman Dictionary Extension Options</div>
      </h1>
      <div className="options">
        <div>
          <div className="option_name">Disable option:</div>
          <div className="option_radios">
            <label>
              <input 
                type="checkbox" 
                id="lmd-isDisable" 
                checked={isDisabled}
                onChange={handleDisableChange}
              />
              Yes
            </label>
          </div>
        </div>
        <div>
          <div className="option_name">Pop-up search option:</div>
          <div className="option_radios">
            <label>
              <input 
                type="radio" 
                name="lmd-option" 
                value="1"
                checked={showIconFirst}
                onChange={handleRadioChange}
                disabled={isDisabled}
              />
              Show bubble after icon click
            </label>
            <br />
            <label>
              <input 
                type="radio" 
                name="lmd-option" 
                value="2"
                checked={!showIconFirst}
                onChange={handleRadioChange}
                disabled={isDisabled}
              />
              Show bubble after a selection instantaneously
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount the React component
const container = document.getElementById('options-root');
if (container) {
  const root = createRoot(container);
  root.render(<OptionsApp />);
}
