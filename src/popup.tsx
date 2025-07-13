import React, { useState, KeyboardEvent } from 'react';
import { createRoot } from 'react-dom/client';
import './css/popup.css';

const PopupApp: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const lmdUrl = "https://www.ldoceonline.com/dictionary/";

  const handleSearch = () => {
    const cleanedSearchTerm = searchTerm
      .replace(/[\.\*\?;!()\+,\[:\]<>^_`\[\]{}~\\\/\"\'=]/g, " ")
      .trim();

    if (cleanedSearchTerm) {
      chrome.tabs.create({
        active: true,
        url: lmdUrl + cleanedSearchTerm
      });
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="lmd-content">
      <div className="search-bar">
        <input
          title=""
          name="lmd-text-input"
          id="lmd-text-input"
          type="text"
          maxLength={50}
          autoFocus
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div 
          id="lmd-search-btn" 
          className="lmd-search-btn" 
          title="Open new tab"
          onClick={handleSearch}
        >
          Search
        </div>
      </div>
      <footer className="lmd-footer">
        <a className="lmd-a" id="options-link" target="_blank" href="options.html">
          Extension Options
        </a>
      </footer>
    </div>
  );
};

// Mount the React component
const container = document.getElementById('popup-root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
