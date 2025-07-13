# longman-chrome-extention [![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/nator333/longman-chrome-extention/master/LICENSE)

## Thank you for using! 1,000 people are using in all over the world!!🎊㊗️🎊

More than 1,000 people are using this Chrome extension at this moment! I here show my gratitude for the people developed Longman Dictionary and the Web API used in this extension as well as everyone using it and having given some great ideas for the improvement! Please feel free to let me know any thoughts about it in the Chrome webstore👍

## About
Search the definitions of one selected word from Longman Dictionary of Contemporary English (5th edition)
Show bubble type popup for selected word's detail in Longman dictionary.

This can show clickable icon for the popup in the site whose lang property of <html> tag includes "en". And also it displays bubble immediately.
The pronunciation always adopts American English rather than British one. The option value isn't shared across the cloud.

Search a definition from Longman Dictionary of Contemporary English (5th edition)
Show bubble type popup for selected word's detail in Longman dictionary.

This can show clickable icon for the popup in the site whose lang property of <html> tag includes "en". And also it displays bubble immediately. The pronunciation always adopts American English rather than British one. The option value isn't shared across the cloud.

If you would like to comment and request any new functions or bugs, please feel free to leave here.

For your information, this extension uses [Pearson Dictionary API](http://developer.pearson.com/apis/dictionaries). It's supposed to become unavailable in the end of 2017 but still available at this publication day, so this app uses until its end. 
MIT license

## Version 2.0.0 - Manifest V3 + TypeScript Migration

### What's New:
- **Manifest V3 Compatibility**: Updated to use the latest Chrome extension format
- **TypeScript Conversion**: Full TypeScript rewrite for better type safety and development experience
- **Modern JavaScript APIs**: Migrated to Promise-based chrome APIs
- **Improved Performance**: Better compatibility with modern Chrome browsers
- **Enhanced Security**: Updated Content Security Policy
- **Developer Experience**: Better IntelliSense, compile-time error checking, and refactoring support

### Technical Changes:
- **Manifest V3**: Migrated from `manifest_version: 2` to `manifest_version: 3`
- **TypeScript**: Complete conversion from JavaScript to TypeScript with proper type definitions
- **Chrome APIs**: Updated `chrome.storage` calls to use Promises instead of callbacks
- **Type Safety**: Added comprehensive type definitions for Chrome extension APIs and custom data structures
- **Build System**: Added TypeScript compilation with source maps and development tooling
- **Code Quality**: Improved error handling, type checking, and code organization

### Development Setup:
```bash
# Install dependencies
yarn install

# Build the extension
yarn build

# Development with watch mode
yarn watch

# Type checking only
yarn type-check
```

### Project Structure:
- `src/` - TypeScript source files
- `dist/` - Compiled extension (load this in Chrome)
- `tsconfig.json` - TypeScript configuration
- `TYPESCRIPT_GUIDE.md` - Detailed development guide

## Installation

1. Go to [Chrome Web Store](https://chrome.google.com/webstore/detail/longman-dictionary-bubble/cajklhanpcgcpkikgpcnogpdndpjdjjn) 
2. Add your Chrome

## Development

See [TYPESCRIPT_GUIDE.md](TYPESCRIPT_GUIDE.md) for detailed development instructions.
